// ═══════════════════════════════════════════════════════════════
// TojRason Backend — server.js
// Enterprise Delivery Platform | Node.js + Express + Socket.io
// ═══════════════════════════════════════════════════════════════
'use strict';

require('dotenv').config();

const express        = require('express');
const http           = require('http');
const { Server }     = require('socket.io');
const mongoose       = require('mongoose');
const helmet         = require('helmet');
const cors           = require('cors');
const compression    = require('compression');
const rateLimit      = require('express-rate-limit');
const morgan         = require('morgan');
const bcrypt         = require('bcryptjs');
const jwt            = require('jsonwebtoken');
const Joi            = require('joi');
const sanitizeHtml   = require('sanitize-html');
const multer         = require('multer');
const sharp          = require('sharp');
const path           = require('path');
const fs             = require('fs');

const { User, Courier, Order, Admin, Rating } = require('./models');
const { signAccess, signRefresh, requireAuth, socketAuth } = require('./middleware/auth');
const { calcPrice, getOSRMRoute, haversineKm } = require('./utils/geo');
const DispatchService = require('./services/dispatchService');
const logger          = require('./utils/logger');

// ── App setup ──────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' },
  transports: ['websocket', 'polling']
});

// ── Multer (photo upload) ──────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5_242_880 },
  fileFilter: (_, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Танҳо тасвир қабул аст'));
  }
});

const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Middleware ─────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use('/uploads', express.static(UPLOAD_DIR));

// Global rate limit
app.use(rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  message: { ok: false, msg: 'Хеле зиёд дархост. Лутфан кам кунед.' }
}));

// Strict rate for auth
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, message: { ok: false, msg: 'Хеле зиёд.' } });

// ── Sanitize helper ────────────────────────────────────────────
const s = str => typeof str === 'string'
  ? sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} }).trim()
  : str;

// ════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════════════════

// POST /api/v1/auth/customer/login
app.post('/api/v1/auth/customer/login', authLimiter, async (req, res) => {
  try {
    const schema = Joi.object({
      phone:    Joi.string().min(9).max(20).required(),
      password: Joi.string().min(4).required()
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ ok: false, msg: error.details[0].message });

    const user = await User.findOne({ phone: value.phone }).select('+password');
    if (!user || !(await user.comparePassword(value.password)))
      return res.status(401).json({ ok: false, msg: 'Телефон ё парол нодуруст' });
    if (user.isBlocked)
      return res.status(403).json({ ok: false, msg: 'Аккаунт блок шудааст' });

    const payload  = { id: user._id, role: 'customer' };
    const access   = signAccess(payload);
    const refresh  = signRefresh(payload);
    await User.findByIdAndUpdate(user._id, { refreshToken: refresh });

    res.json({ ok: true, access, refresh, user: { id: user._id, name: user.name, phone: user.phone } });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// POST /api/v1/auth/customer/register
app.post('/api/v1/auth/customer/register', authLimiter, async (req, res) => {
  try {
    const schema = Joi.object({
      name:     Joi.string().min(2).max(100).required(),
      phone:    Joi.string().min(9).max(20).required(),
      password: Joi.string().min(4).required(),
      deviceId: Joi.string().optional()
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ ok: false, msg: error.details[0].message });

    const exists = await User.findOne({ phone: value.phone });
    if (exists) return res.status(409).json({ ok: false, msg: 'Ин рақам аллакай сабт аст' });

    const user = await User.create({
      name: s(value.name), phone: value.phone,
      password: value.password, deviceId: value.deviceId
    });
    const payload = { id: user._id, role: 'customer' };
    const access  = signAccess(payload);
    const refresh = signRefresh(payload);
    await User.findByIdAndUpdate(user._id, { refreshToken: refresh });

    res.status(201).json({ ok: true, access, refresh, user: { id: user._id, name: user.name } });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// POST /api/v1/auth/courier/login
app.post('/api/v1/auth/courier/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ ok: false, msg: 'Логин ва паролро ворид кунед' });

    const courier = await Courier.findOne({ username: username.toLowerCase() }).select('+password');
    if (!courier || !(await courier.comparePassword(password)))
      return res.status(401).json({ ok: false, msg: 'Логин ё парол нодуруст' });

    const payload = { id: courier._id, role: 'courier' };
    const access  = signAccess(payload);
    const refresh = signRefresh(payload);
    await Courier.findByIdAndUpdate(courier._id, { refreshToken: refresh });

    res.json({ ok: true, access, refresh, courier: {
      id: courier._id, name: courier.name, phone: courier.phone,
      username: courier.username, vehicle: courier.vehicle,
      status: courier.status, balance: courier.balance,
      totalOrders: courier.totalOrders, completedOrders: courier.completedOrders
    }});
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// POST /api/v1/auth/courier/register
app.post('/api/v1/auth/courier/register', authLimiter,
  upload.fields([{ name: 'facePhoto', maxCount: 1 }, { name: 'passportPhoto', maxCount: 1 }]),
  async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      phone: Joi.string().min(9).max(20).required(),
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(6).required(),
      vehicle: Joi.string().valid('motorcycle','bicycle','car','foot').required()
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ ok: false, msg: error.details[0].message });

    const exists = await Courier.findOne({
      $or: [{ phone: value.phone }, { username: value.username.toLowerCase() }]
    });
    if (exists) return res.status(409).json({ ok: false, msg: 'Телефон ё username мавҷуд аст' });

    // Process + save photos
    const photoKeys = {};
    for (const field of ['facePhoto', 'passportPhoto']) {
      if (req.files?.[field]?.[0]) {
        const buf      = req.files[field][0].buffer;
        const filename = `${field}_${Date.now()}.jpg`;
        const filepath = path.join(UPLOAD_DIR, filename);
        await sharp(buf).resize(400, 400, { fit: 'inside' }).jpeg({ quality: 70 }).toFile(filepath);
        photoKeys[field + 'Key'] = filename;
      }
    }

    const courier = await Courier.create({
      name: s(value.name), phone: value.phone,
      username: value.username.toLowerCase(), password: value.password,
      vehicle: value.vehicle, status: 'pending',
      ...photoKeys
    });

    // Notify admins via socket
    io.to('admins').emit('courier_pending', {
      id: courier._id, name: courier.name, phone: courier.phone
    });

    res.status(201).json({ ok: true, courierId: courier._id, status: 'pending' });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// POST /api/v1/auth/admin/login
app.post('/api/v1/auth/admin/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username?.toLowerCase(), isActive: true }).select('+password');
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ ok: false, msg: 'Логин ё парол нодуруст' });

    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });
    const payload = { id: admin._id, role: admin.role };
    const access  = signAccess(payload);
    const refresh = signRefresh(payload);
    await Admin.findByIdAndUpdate(admin._id, { refreshToken: refresh });

    res.json({ ok: true, access, refresh, admin: {
      id: admin._id, name: admin.name, username: admin.username, role: admin.role
    }});
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// POST /api/v1/auth/refresh
app.post('/api/v1/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ ok: false, msg: 'Refresh token нест' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const access  = signAccess({ id: decoded.id, role: decoded.role });
    res.json({ ok: true, access });
  } catch (e) { res.status(401).json({ ok: false, msg: 'Refresh token нодуруст' }); }
});

// ════════════════════════════════════════════════════════════════
// ORDER ROUTES
// ════════════════════════════════════════════════════════════════
let dispatch; // will be initialized after server starts

// POST /api/v1/orders — Create order
app.post('/api/v1/orders', async (req, res) => {
  try {
    const schema = Joi.object({
      customerName:     Joi.string().min(2).max(100).required(),
      customerPhone:    Joi.string().min(9).max(20).required(),
      senderPodz:       Joi.string().allow('').optional(),
      senderFloor:      Joi.string().allow('').optional(),
      senderApart:      Joi.string().allow('').optional(),
      senderIntercom:   Joi.string().allow('').optional(),
      fromAddress:      Joi.string().min(3).required(),
      toAddress:        Joi.string().min(3).required(),
      fromLat:          Joi.number().min(-90).max(90).required(),
      fromLng:          Joi.number().min(-180).max(180).required(),
      toLat:            Joi.number().min(-90).max(90).required(),
      toLng:            Joi.number().min(-180).max(180).required(),
      description:      Joi.string().max(500).allow('').optional(),
      weight:           Joi.number().min(0.1).max(200).default(1),
      packageType:      Joi.string().valid('small','medium','large').default('small'),
      receiverName:     Joi.string().min(2).max(100).required(),
      receiverPhone:    Joi.string().min(9).max(20).required(),
      receiverPodz:     Joi.string().allow('').optional(),
      receiverFloor:    Joi.string().allow('').optional(),
      receiverApart:    Joi.string().allow('').optional(),
      receiverIntercom: Joi.string().allow('').optional(),
      note:             Joi.string().max(300).allow('').optional(),
      deviceId:         Joi.string().optional()
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ ok: false, msg: error.details[0].message });

    // Get actual route distance
    const { distanceKm } = await getOSRMRoute(value.fromLng, value.fromLat, value.toLng, value.toLat);
    const price = calcPrice(distanceKm);

    const order = await Order.create({
      customerName:    s(value.customerName),
      customerPhone:   value.customerPhone,
      senderPodz:      value.senderPodz,   senderFloor: value.senderFloor,
      senderApart:     value.senderApart,  senderIntercom: value.senderIntercom,
      fromAddress:     s(value.fromAddress),
      toAddress:       s(value.toAddress),
      fromLocation:    { type: 'Point', coordinates: [value.fromLng, value.fromLat] },
      toLocation:      { type: 'Point', coordinates: [value.toLng, value.toLat] },
      description:     s(value.description || '—'),
      weight:          value.weight,
      packageType:     value.packageType,
      receiverName:    s(value.receiverName),
      receiverPhone:   value.receiverPhone,
      receiverPodz:    value.receiverPodz,  receiverFloor: value.receiverFloor,
      receiverApart:   value.receiverApart, receiverIntercom: value.receiverIntercom,
      note:            s(value.note || ''),
      distanceKm,      price,
      deviceId:        value.deviceId,
      status:          'new'
    });

    // Broadcast to admins
    io.to('admins').emit('order_created', order);

    // Trigger intelligent dispatch
    setTimeout(() => dispatch?.dispatch(order), 500);

    res.status(201).json({ ok: true, order });
  } catch (e) {
    logger.error('Create order error:', e);
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// GET /api/v1/orders — List (admin) or by deviceId
app.get('/api/v1/orders', async (req, res) => {
  try {
    const { deviceId, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (deviceId) filter.deviceId = deviceId;
    if (status && status !== 'all') filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Math.min(+limit, 50))
      .limit(Math.min(+limit, 50))
      .lean();
    const total = await Order.countDocuments(filter);

    res.json({ ok: true, orders, total, page: +page });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// GET /api/v1/orders/:id
app.get('/api/v1/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ ok: false, msg: 'Фармоиш ёфт нашуд' });
    res.json({ ok: true, order });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// PATCH /api/v1/orders/:id/cancel
app.patch('/api/v1/orders/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ ok: false, msg: 'Ёфт нашуд' });
    if (!['new', 'assigned'].includes(order.status))
      return res.status(400).json({ ok: false, msg: 'Бекор кардан мумкин нест' });

    await Order.findByIdAndUpdate(order._id, { status: 'cancelled', cancelledAt: new Date(), updatedAt: new Date() });
    dispatch?.cancelTimer(order._id);
    io.to('admins').emit('order_updated', { id: order._id, status: 'cancelled' });
    if (order.courierId)
      io.to(`courier:${order.courierId}`).emit('order_cancelled', { orderId: order._id });

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// COURIER ROUTES
// ════════════════════════════════════════════════════════════════

// GET /api/v1/couriers (admin)
app.get('/api/v1/couriers', requireAuth(['admin','super_admin','moderator']), async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const couriers = await Courier.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * 30).limit(30).lean();
    const total = await Courier.countDocuments(filter);
    res.json({ ok: true, couriers, total });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// PATCH /api/v1/couriers/:id/approve
app.patch('/api/v1/couriers/:id/approve', requireAuth(['admin','super_admin']), async (req, res) => {
  try {
    await Courier.findByIdAndUpdate(req.params.id, { status: 'approved' });
    io.to(`courier:${req.params.id}`).emit('status_changed', { status: 'approved' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// PATCH /api/v1/couriers/:id/reject
app.patch('/api/v1/couriers/:id/reject', requireAuth(['admin','super_admin']), async (req, res) => {
  try {
    await Courier.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    io.to(`courier:${req.params.id}`).emit('status_changed', { status: 'rejected' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// PATCH /api/v1/couriers/:id/online — toggle online status
app.patch('/api/v1/couriers/:id/online', requireAuth(['courier']), async (req, res) => {
  try {
    const { isOnline } = req.body;
    await Courier.findByIdAndUpdate(req.params.id, { isOnline: !!isOnline });
    res.json({ ok: true, isOnline: !!isOnline });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════════════════════════

// GET /api/v1/admin/stats
app.get('/api/v1/admin/stats', requireAuth(['admin','super_admin','moderator']), async (req, res) => {
  try {
    const [totalOrders, newOrders, delivered, cancelled, totalCouriers, pendingCouriers] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'new' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Courier.countDocuments({ status: 'approved' }),
      Courier.countDocuments({ status: 'pending' })
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.json({ ok: true, stats: {
      totalOrders, newOrders, delivered, cancelled,
      totalCouriers, pendingCouriers,
      revenue: revenue[0]?.total || 0
    }});
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// POST /api/v1/admin/admins — create admin (super only)
app.post('/api/v1/admin/admins', requireAuth(['super_admin']), async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password) return res.status(400).json({ ok: false, msg: 'Ҳамаи майдонҳо лозим' });
    const exists = await Admin.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(409).json({ ok: false, msg: 'Username мавҷуд аст' });
    const admin = await Admin.create({
      name: s(name), username: username.toLowerCase(), password,
      role: ['admin','moderator'].includes(role) ? role : 'admin',
      createdBy: req.user._id
    });
    res.status(201).json({ ok: true, admin: { id: admin._id, name: admin.name, username: admin.username, role: admin.role } });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// GET /api/v1/admin/admins
app.get('/api/v1/admin/admins', requireAuth(['super_admin']), async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, admins });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// PATCH /api/v1/admin/orders/:id/assign
app.patch('/api/v1/admin/orders/:id/assign', requireAuth(['admin','super_admin','moderator']), async (req, res) => {
  try {
    const { courierId } = req.body;
    const courier = await Courier.findById(courierId).lean();
    if (!courier) return res.status(404).json({ ok: false, msg: 'Курьер ёфт нашуд' });

    const order = await Order.findByIdAndUpdate(req.params.id, {
      status: 'assigned', courierId, courierName: courier.name, assignedAt: new Date(), updatedAt: new Date()
    }, { new: true });

    dispatch?.cancelTimer(order._id);
    io.to(`courier:${courierId}`).emit('order_assigned', order);
    io.to('admins').emit('order_updated', order);
    res.json({ ok: true, order });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// RATING ROUTE
// ════════════════════════════════════════════════════════════════
app.post('/api/v1/ratings', async (req, res) => {
  try {
    const { orderId, score, comment } = req.body;
    if (!orderId || !score) return res.status(400).json({ ok: false, msg: 'orderId ва score лозим' });

    const order = await Order.findById(orderId).lean();
    if (!order || order.status !== 'delivered')
      return res.status(400).json({ ok: false, msg: 'Фармоиш расонида нашудааст' });

    const rating = await Rating.create({ orderId, courierId: order.courierId, score, comment: s(comment || '') });

    // Recalculate courier average rating
    const stats = await Rating.aggregate([
      { $match: { courierId: order.courierId } },
      { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);
    if (stats[0]) {
      await Courier.findByIdAndUpdate(order.courierId, {
        rating: Math.round(stats[0].avg * 10) / 10,
        ratingCount: stats[0].count
      });
    }
    res.status(201).json({ ok: true, rating });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// SOCKET.IO — Real-time layer
// ════════════════════════════════════════════════════════════════
io.use(socketAuth);

io.on('connection', async (socket) => {
  const { userId, role } = socket.data;
  logger.info(`[Socket] Connected: ${role} ${userId} (${socket.id})`);

  // Join role-based rooms
  if (['admin','super_admin','moderator'].includes(role)) {
    socket.join('admins');
  } else if (role === 'courier') {
    socket.join(`courier:${userId}`);
    await Courier.findByIdAndUpdate(userId, { socketId: socket.id });
  } else if (role === 'customer') {
    socket.join(`customer:${userId}`);
  }

  // ── COURIER: Accept order ──
  socket.on('accept_order', async ({ orderId }) => {
    try {
      const order = await Order.findById(orderId);
      if (!order || order.status !== 'new') return;

      dispatch?.cancelTimer(orderId);
      const courier = await Courier.findById(userId).lean();
      const updated = await Order.findByIdAndUpdate(orderId, {
        status: 'assigned', courierId: userId,
        courierName: courier.name, assignedAt: new Date(), updatedAt: new Date()
      }, { new: true });

      // Notify customer
      io.to(`customer:${order.deviceId}`).emit('order_accepted', {
        orderId, courierName: courier.name, courierId: userId
      });
      io.to('admins').emit('order_updated', updated);
      socket.emit('accept_ack', { ok: true, order: updated });
    } catch (e) { socket.emit('error', { msg: e.message }); }
  });

  // ── COURIER: Decline order ──
  socket.on('decline_order', async ({ orderId }) => {
    try {
      await Order.findByIdAndUpdate(orderId, { $push: { declinedBy: userId } });
      dispatch?.cancelTimer(orderId);
      await dispatch?.redispatch(orderId);
    } catch (e) { logger.error('decline_order error', e); }
  });

  // ── COURIER: Picked up ──
  socket.on('pickup_order', async ({ orderId }) => {
    try {
      const order = await Order.findById(orderId);
      if (!order || order.courierId?.toString() !== userId.toString()) return;
      const updated = await Order.findByIdAndUpdate(orderId, {
        status: 'picked_up', pickedUpAt: new Date(), updatedAt: new Date()
      }, { new: true });
      io.to(`customer:${order.deviceId}`).emit('order_picked_up', { orderId });
      io.to('admins').emit('order_updated', updated);
    } catch (e) { logger.error('pickup error', e); }
  });

  // ── COURIER: Delivered ──
  socket.on('deliver_order', async ({ orderId }) => {
    try {
      const order = await Order.findById(orderId);
      if (!order || order.courierId?.toString() !== userId.toString()) return;

      const updated = await Order.findByIdAndUpdate(orderId, {
        status: 'delivered', deliveredAt: new Date(), updatedAt: new Date()
      }, { new: true });

      // Atomic balance update
      await Courier.findByIdAndUpdate(userId, {
        $inc: { balance: order.price, totalOrders: 1, completedOrders: 1 }
      });

      io.to(`customer:${order.deviceId}`).emit('order_delivered', { orderId, price: order.price });
      io.to('admins').emit('order_updated', updated);
      socket.emit('deliver_ack', { ok: true, earned: order.price });
    } catch (e) { logger.error('deliver error', e); }
  });

  // ── COURIER: Location update ──
  socket.on('location_update', async ({ lat, lng }) => {
    if (role !== 'courier') return;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    await Courier.findByIdAndUpdate(userId, {
      location: { type: 'Point', coordinates: [lng, lat] },
      locationUpdatedAt: new Date()
    });

    // Broadcast to admins
    io.to('admins').emit('courier_location', { courierId: userId, lat, lng });

    // Broadcast to relevant customers (whose order is in transit by this courier)
    const activeOrder = await Order.findOne({
      courierId: userId,
      status: { $in: ['assigned', 'picked_up'] }
    }).lean();

    if (activeOrder?.deviceId) {
      io.to(`customer:${activeOrder.deviceId}`).emit('courier_location', {
        courierId: userId, lat, lng, orderId: activeOrder._id
      });
    }
  });

  // ── COURIER: Online toggle ──
  socket.on('set_online', async ({ isOnline }) => {
    if (role !== 'courier') return;
    await Courier.findByIdAndUpdate(userId, { isOnline: !!isOnline });
    io.to('admins').emit('courier_status', { courierId: userId, isOnline });
  });

  // ── Disconnect ──
  socket.on('disconnect', async () => {
    logger.info(`[Socket] Disconnected: ${role} ${userId}`);
    if (role === 'courier') {
      await Courier.findByIdAndUpdate(userId, {
        socketId: null, isOnline: false,
        location: { type: 'Point', coordinates: [0, 0] }
      });
      io.to('admins').emit('courier_status', { courierId: userId, isOnline: false });
    }
  });
});

// ════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════
app.get('/health', (_, res) => {
  res.json({ ok: true, uptime: process.uptime(), ts: Date.now() });
});

// 404
app.use((_, res) => res.status(404).json({ ok: false, msg: 'Маршрут ёфт нашуд' }));

// Global error handler
app.use((err, _, res, __) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ ok: false, msg: err.message || 'Хатои дохилии сервер' });
});

// ════════════════════════════════════════════════════════════════
// LOGGER (utils/logger.js inline fallback)
// ════════════════════════════════════════════════════════════════
// Using console until winston is set up
if (!require('fs').existsSync('./utils/logger.js')) {
  const logPath = './utils';
  if (!require('fs').existsSync(logPath)) require('fs').mkdirSync(logPath, { recursive: true });
  require('fs').writeFileSync('./utils/logger.js', `
const logger = { info: (...a) => console.log('[INFO]', ...a), warn: (...a) => console.warn('[WARN]', ...a), error: (...a) => console.error('[ERR]', ...a) };
module.exports = logger;
`);
}

// ════════════════════════════════════════════════════════════════
// START
// ════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tojrason', {
      maxPoolSize: 50
    });
    logger.info('✅ MongoDB connected');

    // Create default super admin if none exists
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: 'Super Admin', username: 'admin',
        password: await require('bcryptjs').hash('admin123', 12),
        role: 'super_admin'
      });
      logger.info('✅ Default super admin created: admin / admin123');
    }

    server.listen(PORT, () => {
      logger.info(`🚀 TojRason server running on port ${PORT}`);
      dispatch = new DispatchService(io);
    });
  } catch (e) {
    logger.error('Startup error:', e);
    process.exit(1);
  }
}

start();

module.exports = { app, io };
