// middleware/auth.js
'use strict';

const jwt    = require('jsonwebtoken');
const { User, Courier, Admin } = require('../models');

const SECRET  = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES_IN || '15m';

// ── Sign tokens ──────────────────────────────────────
function signAccess(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}
function signRefresh(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
}

// ── Middleware: verify JWT ────────────────────────────
function requireAuth(roles = []) {
  return async (req, res, next) => {
    try {
      const hdr = req.headers.authorization;
      if (!hdr?.startsWith('Bearer '))
        return res.status(401).json({ ok: false, msg: 'Token нест' });

      const token   = hdr.split(' ')[1];
      const decoded = jwt.verify(token, SECRET);

      // Attach user based on role in token
      if (decoded.role === 'customer') {
        req.user = await User.findById(decoded.id).lean();
      } else if (decoded.role === 'courier') {
        req.user = await Courier.findById(decoded.id).lean();
      } else {
        req.user = await Admin.findById(decoded.id).lean();
      }

      if (!req.user)
        return res.status(401).json({ ok: false, msg: 'Корбар ёфт нашуд' });

      if (roles.length && !roles.includes(decoded.role))
        return res.status(403).json({ ok: false, msg: 'Иҷозат нест' });

      req.role = decoded.role;
      next();
    } catch (e) {
      return res.status(401).json({ ok: false, msg: 'Token нодуруст ё мӯҳлаташ гузашт' });
    }
  };
}

// ── Socket.io auth middleware ─────────────────────────
function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token ||
                  socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, SECRET);
    socket.data.userId = decoded.id;
    socket.data.role   = decoded.role;
    next();
  } catch (e) {
    next(new Error('Auth failed'));
  }
}

module.exports = { signAccess, signRefresh, requireAuth, socketAuth };
