// ═══════════════════════════════════════════════════
// services/dispatchService.js
// Intelligent Courier Dispatch Algorithm
// ═══════════════════════════════════════════════════
'use strict';

const { Courier, Order } = require('../models');
const redis              = require('../config/redis');
const logger             = require('../utils/logger');
const { haversineKm }    = require('../utils/geo');

const DISPATCH_TIMEOUT_MS  = 30_000;   // 30s courier must accept
const MAX_DISPATCH_ATTEMPTS = 5;

class DispatchService {
  constructor(io) {
    this.io      = io;
    this.timers  = new Map();  // orderId → timeout handle
  }

  // ── Main entry: find best courier and send order ──
  async dispatch(order) {
    if (!order.fromLocation?.coordinates) {
      logger.warn(`[Dispatch] Order ${order._id} missing fromLocation`);
      return false;
    }

    const [lng, lat] = order.fromLocation.coordinates;

    // Find online approved couriers sorted by composite score
    const couriers = await this._findCandidates(lng, lat, order);

    if (!couriers.length) {
      logger.info(`[Dispatch] No couriers available for order ${order._id}`);
      return false;
    }

    const best = couriers[0];
    await this._sendTocourier(order, best);
    return true;
  }

  // ── Re-dispatch if courier rejects ──
  async redispatch(orderId) {
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'new') return;

    if (order.dispatchAttempts >= MAX_DISPATCH_ATTEMPTS) {
      logger.warn(`[Dispatch] Max attempts reached for ${orderId}`);
      return;
    }

    const [lng, lat] = order.fromLocation.coordinates;
    const couriers   = await this._findCandidates(lng, lat, order);

    if (!couriers.length) {
      logger.info(`[Dispatch] No more couriers for ${orderId}`);
      return;
    }

    await this._sendTocourier(order, couriers[0]);
  }

  // ── Cancel pending dispatch timer ──
  cancelTimer(orderId) {
    const t = this.timers.get(String(orderId));
    if (t) {
      clearTimeout(t);
      this.timers.delete(String(orderId));
    }
  }

  // ─────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────

  async _findCandidates(lng, lat, order) {
    const MAX_RADIUS_KM = 15;
    const excluded = (order.declinedBy || []).map(String);

    // MongoDB $nearSphere — sorted by distance automatically
    const nearbyCouriers = await Courier.find({
      status:   'approved',
      isOnline: true,
      _id:      { $nin: excluded },
      location: {
        $nearSphere: {
          $geometry:    { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: MAX_RADIUS_KM * 1000   // metres
        }
      }
    }).limit(20).lean();

    if (!nearbyCouriers.length) return [];

    // Composite scoring: distance (70%) + workload (30%)
    const scored = await Promise.all(nearbyCouriers.map(async c => {
      const [cLng, cLat] = c.location.coordinates;
      const distKm       = haversineKm(lat, lng, cLat, cLng);

      // Active orders count (workload)
      const activeOrders = await Order.countDocuments({
        courierId: c._id,
        status:    { $in: ['assigned', 'picked_up'] }
      });

      // Score: lower is better
      const score = (distKm / MAX_RADIUS_KM) * 0.7 +
                    (Math.min(activeOrders, 5) / 5) * 0.3;

      return { courier: c, distKm, score };
    }));

    scored.sort((a, b) => a.score - b.score);
    return scored.map(s => ({ ...s.courier, _distKm: s.distKm }));
  }

  async _sendTocourier(order, courier) {
    // Increment dispatch counter
    await Order.findByIdAndUpdate(order._id, {
      $inc: { dispatchAttempts: 1 }
    });

    const courierSocketId = courier.socketId;
    if (courierSocketId) {
      this.io.to(courierSocketId).emit('new_order', {
        ...order.toObject ? order.toObject() : order,
        _distKm: courier._distKm
      });
      logger.info(`[Dispatch] Order ${order._id} → Courier ${courier._id} (${courier._distKm?.toFixed(1)} km)`);
    } else {
      // Courier socket not connected — try push notification
      // await pushService.sendPush(courier.pushToken, 'Закази нав!', ...)
      logger.info(`[Dispatch] Courier ${courier._id} not connected via socket`);
    }

    // Auto-redispatch if no acceptance within timeout
    const timer = setTimeout(async () => {
      const fresh = await Order.findById(order._id).lean();
      if (fresh && fresh.status === 'new') {
        logger.info(`[Dispatch] Timeout for order ${order._id}, redispatching...`);
        await Order.findByIdAndUpdate(order._id, {
          $push: { declinedBy: courier._id }
        });
        await this.redispatch(order._id);
      }
    }, DISPATCH_TIMEOUT_MS);

    this.timers.set(String(order._id), timer);
  }
}

module.exports = DispatchService;
