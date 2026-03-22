// backend/config/redis.js
// Redis is optional — app works without it
'use strict';

let client = null;

async function connectRedis() {
  try {
    const { createClient } = require('redis');
    client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    client.on('error', e => console.warn('[Redis] Error:', e.message));
    await client.connect();
    console.log('[Redis] Connected');
  } catch (e) {
    console.warn('[Redis] Not available — running without cache:', e.message);
    client = null;
  }
}

const cache = {
  async get(key) {
    if (!client) return null;
    try { return await client.get(key); } catch { return null; }
  },
  async set(key, value, ttlSec = 300) {
    if (!client) return;
    try { await client.setEx(key, ttlSec, String(value)); } catch {}
  },
  async del(key) {
    if (!client) return;
    try { await client.del(key); } catch {}
  }
};

module.exports = { connectRedis, cache };
