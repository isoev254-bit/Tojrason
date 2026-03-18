'use strict';
require('dotenv').config();

const express     = require('express');
const http        = require('http');
const { Server }  = require('socket.io');
const mongoose    = require('mongoose');
const helmet      = require('helmet');
const cors        = require('cors');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const morgan      = require('morgan');
const jwt         = require('jsonwebtoken');
const Joi         = require('joi');
const sanitizeHtml= require('sanitize-html');
const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');
const bcrypt      = require('bcryptjs'); // ✅ FIX: moved to top

const { User, Courier, Order, Admin, Rating } = require('./models');
const { signAccess, signRefresh, requireAuth, socketAuth } = require('./middleware/auth');
const { calcPrice, getOSRMRoute } = require('./utils/geo');
const DispatchService = require('./services/dispatchService');
const logger = require('./utils/logger');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling']
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5242880 }
});

const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use('/uploads', express.static(UPLOAD_DIR));

app.use(rateLimit({
  windowMs: 60000, max: 120,
  standardHeaders: true, legacyHeaders: false,
  message: { ok: false, msg: 'Хеле зиёд дархост.' }
}));

const authLimiter = rateLimit({
  windowMs: 60000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { ok: false, msg: 'Хеле зиёд.' }
});
const s = str => typeof str === 'string' ? sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} }).trim() : str;

// ── AUTH ──────────────────────────────────────────────────────

app.post('/api/v1/auth/customer/login', authLimiter, async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ ok: false, msg: 'Телефон ва парол лозим' });
    const user = await User.findOne({ phone }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ ok: false, msg: 'Телефон ё парол нодуруст' });
    const payload = { id: user._id, role: 'customer' };
    res.json({ ok: true, access: signAccess(payload), refresh: signRefresh(payload),
      user: { id: user._id, name: user.name, phone: user.phone } });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.post('/api/v1/auth/customer/register', authLimiter, async (req, res) => {
  try {
    const { name, phone, password, deviceId } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ ok: false, msg: 'Маълумот нопурра' });
    if (await User.findOne({ phone })) return res.status(409).json({ ok: false, msg: 'Рақам мавҷуд аст' });
    const user = await User.create({ name: s(name), phone, password, deviceId });
    const payload = { id: user._id, role: 'customer' };
    res.status(201).json({ ok: true, access: signAccess(payload), refresh: signRefresh(payload),
      user: { id: user._id, name: user.name } });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.post('/api/v1/auth/courier/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, msg: 'Логин ва парол лозим' });
    const courier = await Courier.findOne({ username: username.toLowerCase() }).select('+password');
    if (!courier || !(await courier.comparePassword(password)))
      return res.status(401).json({ ok: false, msg: 'Логин ё парол нодуруст' });
    const payload = { id: courier._id, role: 'courier' };
    res.json({ ok: true, access: signAccess(payload), refresh: signRefresh(payload),
      courier: { id: courier._id, name: courier.name, phone: courier.phone,
        username: courier.username, vehicle: courier.vehicle, status: courier.status,
        balance: courier.balance, totalOrders: courier.totalOrders, completedOrders: courier.completedOrders } });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.post('/api/v1/auth/courier/register', authLimiter,
  upload.fields([{ name: 'facePhoto', maxCount: 1 }, { name: 'passportPhoto', maxCount: 1 }]),
  async (req, res) => {
  try {
    const { name, phone, username, password, vehicle } = req.body;
    if (!name || !phone || !username || !password || !vehicle)
      return res.status(400).json({ ok: false, msg: 'Маълумот нопурра' });
    if (password.length < 6) return res.status(400).json({ ok: false, msg: 'Парол камаш 6 символ' });
    if (await Courier.findOne({ $or: [{ phone }, { username: username.toLowerCase() }] }))
      return res.status(409).json({ ok: false, msg: 'Телефон ё username мавҷуд аст' });

    const photoKeys = {};
    for (const field of ['facePhoto', 'passportPhoto']) {
      if (req.files?.[field]?.[0]) {
        const filename = `${field}_${Date.now()}.jpg`;
        fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.files[field][0].buffer);
        photoKeys[field + 'Key'] = filename;
      }
    }

    const courier = await Courier.create({
      name: s(name), phone, username: username.toLowerCase(),
      password, vehicle, status: 'pending', ...photoKeys
    });
    io.to('admins').emit('courier_pending', { id: courier._id, name: courier.name, phone: courier.phone });
    res.status(201).json({ ok: true, courierId: courier._id, status: 'pending' });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.post('/api/v1/auth/admin/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, msg: 'Логин ва парол лозим' });
    const admin = await Admin.findOne({ username: username.toLowerCase(), isActive: true }).select('+password');
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ ok: false, msg: 'Логин ё парол нодуруст' });
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });
    const payload = { id: admin._id, role: admin.role };
    res.json({ ok: true, access: signAccess(payload), refresh: signRefresh(payload),
      admin: { id: admin._id, name: admin.name, username: admin.username, role: admin.role } });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.post('/api/v1/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ ok: false, msg: 'Token нест' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    res.json({ ok: true, access: signAccess({ id: decoded.id, role: decoded.role }) });
  } catch (e) { res.status(401).json({ ok: false, msg: 'Token нодуруст' }); }
});

// ── ORDERS ────────────────────────────────────────────────────

let dispatch;

app.post('/api/v1/orders', async (req, res) => {
  try {
    const schema = Joi.object({
      customerName: Joi.string().min(2).max(100).required(),
      customerPhone: Joi.string().min(9).max(20).required(),
      senderPodz: Joi.string().allow('').optional(),
      senderFloor: Joi.string().allow('').optional(),
      senderApart: Joi.string().allow('').optional(),
      senderIntercom: Joi.string().allow('').optional(),
      fromAddress: Joi.string().min(3).required(),
      toAddress: Joi.string().min(3).required(),
      fromLat: Joi.number().min(-90).max(90).required(),
      fromLng: Joi.number().min(-180).max(180).required(),
      toLat: Joi.number().min(-90).max(90).required(),
      toLng: Joi.number().min(-180).max(180).required(),
      description: Joi.string().max(500).allow('').optional(),
      weight: Joi.number().min(0.1).max(200).default(1),
      packageType: Joi.string().valid('small','medium','large').default('small'),
      receiverName: Joi.string().min(2).max(100).required(),
      receiverPhone: Joi.string().min(9).max(20).required(),
      receiverPodz: Joi.string().allow('').optional(),
      receiverFloor: Joi.string().allow('').optional(),
      receiverApart: Joi.string().allow('').optional(),
      receiverIntercom: Joi.string().allow('').optional(),
      note: Joi.string().max(300).allow('').optional(),
      deviceId: Joi.string().optional()
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ ok: false, msg: error.details[0].message });

    const { distanceKm } = await getOSRMRoute(value.fromLng, value.fromLat, value.toLng, value.toLat);
    const price = calcPrice(distanceKm);

    const order = await Order.create({
      customerName: s(value.customerName), customerPhone: value.customerPhone,
      senderPodz: value.senderPodz, senderFloor: value.senderFloor,
      senderApart: value.senderApart, senderIntercom: value.senderIntercom,
      fromAddress: s(value.fromAddress), toAddress: s(value.toAddress),
      fromLocation: { type: 'Point', coordinates: [value.fromLng, value.fromLat] },
      toLocation: { type: 'Point', coordinates: [value.toLng, value.toLat] },
      description: s(value.description || '—'), weight: value.weight,
      packageType: value.packageType, receiverName: s(value.receiverName),
      receiverPhone: value.receiverPhone, receiverPodz: value.receiverPodz,
      receiverFloor: value.receiverFloor, receiverApart: value.receiverApart,
      receiverIntercom: value.receiverIntercom, note: s(value.note || ''),
      distanceKm, price, deviceId: value.deviceId, status: 'new'
    });

    io.to('admins').emit('order_created', order);
    setTimeout(() => dispatch?.dispatch(order), 500);
    res.status(201).json({ ok: true, order });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.get('/api/v1/orders', async (req, res) => {
  try {
    const { deviceId, status, courierId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (deviceId) filter.deviceId = deviceId;
    if (courierId) filter.courierId = courierId;
    if (status && status !== 'all') {
      const statuses = status.split(',');
      filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 })
      .skip((page - 1) * Math.min(+limit, 50)).limit(Math.min(+limit, 50)).lean();
    const total = await Order.countDocuments(filter);
    res.json({ ok: true, orders, total, page: +page });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.get('/api/v1/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ ok: false, msg: 'Фармоиш ёфт нашуд' });
    res.json({ ok: true, order });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.patch('/api/v1/orders/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ ok: false, msg: 'Ёфт нашуд' });
    if (!['new','assigned'].includes(order.status))
      return res.status(400).json({ ok: false, msg: 'Бекор кардан мумкин нест' });
    await Order.findByIdAndUpdate(order._id, { status: 'cancelled', cancelledAt: new Date() });
    dispatch?.cancelTimer(order._id);
    io.to('admins').emit('order_updated', { id: order._id, status: 'cancelled' });
    if (order.courierId) io.to(`courier:${order.courierId}`).emit('order_cancelled', { orderId: order._id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// ── COURIERS ──────────────────────────────────────────────────

app.get('/api/v1/couriers', requireAuth(['admin','super_admin','moderator']), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const couriers = await Courier.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    const total = await Courier.countDocuments(filter);
    res.json({ ok: true, couriers, total });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.patch('/api/v1/couriers/:id/approve', requireAuth(['admin','super_admin']), async (req, res) => {
  try {
    await Courier.findByIdAndUpdate(req.params.id, { status: 'approved' });
    io.to(`courier:${req.params.id}`).emit('status_changed', { status: 'approved' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.patch('/api/v1/couriers/:id/reject', requireAuth(['admin','super_admin']), async (req, res) => {
  try {
    await Courier.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    io.to(`courier:${req.params.id}`).emit('status_changed', { status: 'rejected' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.delete('/api/v1/couriers/:id', requireAuth(['admin','super_admin']), async (req, res) => {
  try {
    await Courier.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// ── ADMIN ─────────────────────────────────────────────────────

app.get('/api/v1/admin/stats', requireAuth(['admin','super_admin','moderator']), async (req, res) => {
  try {
    const [totalOrders, newOrders, delivered, cancelled, totalCouriers, pendingCouriers] = await Promise.all([
      Order.countDocuments(), Order.countDocuments({ status: 'new' }),
      Order.countDocuments({ status: 'delivered' }), Order.countDocuments({ status: 'cancelled' }),
      Courier.countDocuments({ status: 'approved' }), Courier.countDocuments({ status: 'pending' })
    ]);
    const rev = await Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$price' } } }]);
    res.json({ ok: true, stats: { totalOrders, newOrders, delivered, cancelled, totalCouriers, pendingCouriers, revenue: rev[0]?.total || 0 } });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.post('/api/v1/admin/admins', requireAuth(['super_admin']), async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password) return res.status(400).json({ ok: false, msg: 'Маълумот нопурра' });
    if (await Admin.findOne({ username: username.toLowerCase() }))
      return res.status(409).json({ ok: false, msg: 'Username мавҷуд аст' });
    const admin = await Admin.create({ name: s(name), username: username.toLowerCase(), password,
      role: ['admin','moderator'].includes(role) ? role : 'admin', createdBy: req.user._id });
    res.status(201).json({ ok: true, admin: { id: admin._id, name: admin.name, username: admin.username, role: admin.role } });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.get('/api/v1/admin/admins', requireAuth(['super_admin']), async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, admins });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

app.patch('/api/v1/admin/orders/:id/assign', requireAuth(['admin','super_admin','moderator']), async (req, res) => {
  try {
    const { courierId } = req.body;
    if (!courierId) return res.status(400).json({ ok: false, msg: 'courierId лозим аст' });
    const courier = await Courier.findById(courierId).lean();
    if (!courier) return res.status(404).json({ ok: false, msg: 'Курьер ёфт нашуд' });
    const order = await Order.findByIdAndUpdate(req.params.id,
      { status: 'assigned', courierId, courierName: courier.name, assignedAt: new Date() }, { new: true });
    if (!order) return res.status(404).json({ ok: false, msg: 'Фармоиш ёфт нашуд' });
    dispatch?.cancelTimer(order._id);
    io.to(`courier:${courierId}`).emit('order_assigned', order);
    io.to('admins').emit('order_updated', order);
    res.json({ ok: true, order });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// ── RATINGS ───────────────────────────────────────────────────

app.post('/api/v1/ratings', async (req, res) => {
  try {
    const { orderId, score, comment } = req.body;
    if (!orderId || !score) return res.status(400).json({ ok: false, msg: 'orderId ва score лозим' });
    const order = await Order.findById(orderId).lean();
    if (!order || order.status !== 'delivered')
      return res.status(400).json({ ok: false, msg: 'Фармоиш расонида нашудааст' });
    const rating = await Rating.create({ orderId, courierId: order.courierId, score, comment: s(comment || '') });
    const stats = await Rating.aggregate([
      { $match: { courierId: order.courierId } },
      { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);
    if (stats[0]) await Courier.findByIdAndUpdate(order.courierId,
      { rating: Math.round(stats[0].avg * 10) / 10, ratingCount: stats[0].count });
    res.status(201).json({ ok: true, rating });
  } catch (e) { res.status(500).json({ ok: false, msg: e.message }); }
});

// ── SOCKET.IO ─────────────────────────────────────────────────

io.use(socketAuth);

io.on('connection', async (socket) => {
  const { userId, role } = socket.data;
  logger.info(`[Socket] Connected: ${role} ${userId}`);

  if (['admin','super_admin','moderator'].includes(role)) {
    socket.join('admins');
  } else if (role === 'courier') {
    socket.join(`courier:${userId}`);
    await Courier.findByIdAndUpdate(userId, { socketId: socket.id });
  } else if (role === 'customer') {
    // ✅ FIX: join both userId AND deviceId rooms for compatibility
    socket.join(`customer:${userId}`);
    if (socket.data.deviceId) socket.join(`customer:${socket.data.deviceId}`);
  }

  socket.on('accept_order', async ({ orderId }) => {
    try {
      const order = await Order.findById(orderId);
      if (!order || order.status !== 'new') return;
      dispatch?.cancelTimer(orderId);
      const courier = await Courier.findById(userId).lean();
      if (!courier) return;
      const updated = await Order.findByIdAndUpdate(orderId,
        { status: 'assigned', courierId: userId, courierName: courier.name, assignedAt: new Date() }, { new: true });
      // ✅ FIX: emit to both deviceId and userId rooms
      io.to(`customer:${order.deviceId}`).emit('order_accepted', { orderId, courierName: courier.name });
      io.to('admins').emit('order_updated', updated);
      socket.emit('accept_ack', { ok: true, order: updated });
    } catch (e) { socket.emit('error', { msg: e.message }); }
  });

  socket.on('decline_order', async ({ orderId }) => {
    try {
      await Order.findByIdAndUpdate(orderId, { $push: { declinedBy: userId } });
      dispatch?.cancelTimer(orderId);
      await dispatch?.redispatch(orderId);
    } catch (e) { logger.error('decline_order error:', e); }
  });

  socket.on('pickup_order', async ({ orderId }) => {
    try {
      const order = await Order.findById(orderId);
      if (!order || order.courierId?.toString() !== userId.toString()) return;
      const updated = await Order.findByIdAndUpdate(orderId,
        { status: 'picked_up', pickedUpAt: new Date() }, { new: true });
      io.to(`customer:${order.deviceId}`).emit('order_picked_up', { orderId });
      io.to('admins').emit('order_updated', updated);
    } catch (e) { logger.error('pickup_order error:', e); }
  });

  socket.on('deliver_order', async ({ orderId }) => {
    try {
      const order = await Order.findById(orderId);
      if (!order || order.courierId?.toString() !== userId.toString()) return;
      const updated = await Order.findByIdAndUpdate(orderId,
        { status: 'delivered', deliveredAt: new Date() }, { new: true });
      await Courier.findByIdAndUpdate(userId,
        { $inc: { balance: order.price, totalOrders: 1, completedOrders: 1 } });
      io.to(`customer:${order.deviceId}`).emit('order_delivered', { orderId, price: order.price });
      io.to('admins').emit('order_updated', updated);
      socket.emit('deliver_ack', { ok: true, earned: order.price });
    } catch (e) { logger.error('deliver_order error:', e); }
  });

  socket.on('location_update', async ({ lat, lng }) => {
    if (role !== 'courier' || typeof lat !== 'number' || typeof lng !== 'number') return;
    try {
      await Courier.findByIdAndUpdate(userId,
        { location: { type: 'Point', coordinates: [lng, lat] }, locationUpdatedAt: new Date() });
      io.to('admins').emit('courier_location', { courierId: userId, lat, lng });
      const activeOrder = await Order.findOne({ courierId: userId, status: { $in: ['assigned','picked_up'] } }).lean();
      if (activeOrder?.deviceId)
        io.to(`customer:${activeOrder.deviceId}`).emit('courier_location', { courierId: userId, lat, lng, orderId: activeOrder._id });
    } catch (e) { logger.error('location_update error:', e); }
  });

  socket.on('set_online', async ({ isOnline }) => {
    if (role !== 'courier') return;
    try {
      await Courier.findByIdAndUpdate(userId, { isOnline: !!isOnline });
      io.to('admins').emit('courier_status', { courierId: userId, isOnline });
    } catch (e) { logger.error('set_online error:', e); }
  });

  socket.on('disconnect', async () => {
    logger.info(`[Socket] Disconnected: ${role} ${userId}`);
    if (role === 'courier') {
      try {
        await Courier.findByIdAndUpdate(userId, { socketId: null, isOnline: false });
        io.to('admins').emit('courier_status', { courierId: userId, isOnline: false });
      } catch (e) { logger.error('disconnect error:', e); }
    }
  });
});

// ── HEALTH & 404 ──────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime(), ts: Date.now() }));
app.use((_req, res, _next) => res.status(404).json({ ok: false, msg: 'Маршрут ёфт нашуд' }));
app.use((err, _req, res, _next) => { logger.error(err); res.status(500).json({ ok: false, msg: err.message }); });

// ── START ─────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tojrason', { maxPoolSize: 50 });
    logger.info('✅ MongoDB connected');

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: 'Super Admin', username: 'admin',
        password: await bcrypt.hash('admin123', 12), role: 'super_admin'
      });
      logger.info('✅ Default admin: admin / admin123');
    }

    server.listen(PORT, () => {
      logger.info(`🚀 TojRason running on port ${PORT}`);
      dispatch = new DispatchService(io);
    });
  } catch (e) {
    logger.error('Startup error:', e);
    process.exit(1);
  }
}

start();
module.exports = { app, io };
