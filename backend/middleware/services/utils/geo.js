// utils/geo.js
'use strict';

const R = 6371; // Earth radius km

function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcPrice(km = 0) {
  const BASE      = parseFloat(process.env.BASE_PRICE   || '10');
  const BASE_KM   = parseFloat(process.env.BASE_KM      || '3');
  const PRICE_PER = parseFloat(process.env.PRICE_PER_KM || '3');
  if (km <= BASE_KM) return BASE;
  return BASE + Math.ceil(km - BASE_KM) * PRICE_PER;
}

async function getOSRMRoute(fromLng, fromLat, toLng, toLat) {
  const axios = require('axios');
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
  try {
    const { data } = await axios.get(url, { timeout: 5000 });
    if (data.code === 'Ok' && data.routes?.length) {
      const r = data.routes[0];
      return {
        distanceKm:  Math.round(r.distance / 100) / 10,
        durationMin: Math.round(r.duration / 60)
      };
    }
  } catch (_) { /* fallback */ }

  const km = haversineKm(fromLat, fromLng, toLat, toLng);
  return {
    distanceKm:  Math.round(km * 10) / 10,
    durationMin: Math.round(km * 3)
  };
}

module.exports = { haversineKm, calcPrice, getOSRMRoute };
