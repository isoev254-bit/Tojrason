// services/dispatchService.js
'use strict';

const { Courier, Order } = require('../models');
const logger             = require('../utils/logger');
const { haversineKm }    = require('../utils/geo');

const DISPATCH_TIMEOUT_MS   = 30_000;  // 30s courier must accept
const MAX_DISPATCH_ATTEMPTS = 5;

class DispatchService {
  constructor(io) {
    this.io     = io;
    this.timers = new Map();
  }

  async dispatch(order) {
    if (!order.fromLocation?.coordinates) {
      logger.warn(`[Dispatch] Order ${order._id} missing fromLocation`);
      return false;
    }
    const [lng, lat] = order.fromLocation.coordinates;
    const couriers   = await this._findCandidates(lng, lat, order);
    if (!couriers.length) {
      logger.info(`[Dispatch] No couriers available for order ${order._id}`);
      return false;
    }
    await this._sendToCourier(order, couriers[0]);
    return true;
  }

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
    await this._sendToCourier(order, couriers[0]);
  }

  cancelTimer(orderId) {
    const t = this.timers.get(String(orderId));
    if (t) {
      clearTimeout(t);
      this.timers.delete(String(orderId));
    }
  }

  async _findCandidates(lng, lat, order) {
    const MAX_RADIUS_KM = 15;
    const excluded = (order.declinedBy || []).map(String);

    const nearbyCouriers = await Courier.find({
      status:   'approved',
      isOnline: true,
      _id:      { $nin: excluded },
      location: {
        $nearSphere: {
          $geometry:    { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: MAX_RADIUS_KM * 1000
        }
      }
    }).limit(20).lean();

    if (!nearbyCouriers.length) return [];

    const scored = await Promise.all(nearbyCouriers.map(async c => {
      const [cLng, cLat] = c.location.coordinates;
      const distKm       = haversineKm(lat, lng, cLat, cLng);
      const activeOrders = await Order.countDocuments({
        courierId: c._id,
        status:    { $in: ['assigned', 'picked_up'] }
      });
      const score =
        (distKm / MAX_RADIUS_KM) * 0.7 +
        (Math.min(activeOrders, 5) / 5) * 0.3;
      return { courier: c, distKm, score };
    }));

    scored.sort((a, b) => a.score - b.score);
    return scored.map(s => ({ ...s.courier, _distKm: s.distKm }));
  }

  async _sendToCourier(order, courier) {
    await Order.findByIdAndUpdate(order._id, { $inc: { dispatchAttempts: 1 } });

    if (courier.socketId) {
      this.io.to(courier.socketId).emit('new_order', {
        ...(order.toObject ? order.toObject() : order),
        _distKm: courier._distKm
      });
      logger.info(
        `[Dispatch] Order ${order._id} → Courier ${courier._id} (${courier._distKm?.toFixed(1)} km)`
      );
    } else {
      logger.info(`[Dispatch] Courier ${courier._id} not connected via socket`);
    }

    const timer = setTimeout(async () => {
      try {
        const fresh = await Order.findById(order._id).lean();
        if (fresh && fresh.status === 'new') {
          logger.info(`[Dispatch] Timeout for order ${order._id}, redispatching...`);
          await Order.findByIdAndUpdate(order._id, { $push: { declinedBy: courier._id } });
          await this.redispatch(order._id);
        }
      } catch (e) {
        logger.error('[Dispatch] Timer error:', e);
      }
    }, DISPATCH_TIMEOUT_MS);

    this.timers.set(String(order._id), timer);
  }
}

module.exports = DispatchService;
