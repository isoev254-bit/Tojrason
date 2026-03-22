// ═══════════════════════════════════════════════════
// frontend/js/app.js — Customer App
// Connects to TojRason Backend (replaces Firebase)
// ═══════════════════════════════════════════════════
'use strict';

// ── State ──────────────────────────────────────────
let myOrders     = [];
let coords       = { from: {}, to: {} };
let routeKm      = 0;
let miniMaps     = { from: null, to: null };
let routeMap     = null;
let routeLayer   = null;
let pickerMap    = null;
let pickerMode   = null;
let clickMarker  = null;
let searchDebounce = null;
let searchAbort  = null;

const DEF_LAT = CONFIG.DEFAULT_LAT;
const DEF_LNG = CONFIG.DEFAULT_LNG;

// ── Device ID (identifies customer without login) ──
function getDeviceId() {
  let id = Store.get('deviceId');
  if (!id) {
    id = 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    Store.set('deviceId', id);
  }
  return id;
}
const DEVICE_ID = getDeviceId();

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
window.addEventListener('load', async () => {
  const splash = document.getElementById('splash');
  try {
    // Verify backend is reachable
    const r = await fetch(CONFIG.API_BASE.replace('/api/v1', '/health'));
    if (!r.ok) throw new Error('Server offline');
  } catch (e) {
    splash.innerHTML = `
      <div class="sp-logo">Toj<b>Rason</b></div>
      <div style="color:#ef4444;font-size:13px;text-align:center;padding:0 24px;margin-top:8px">
        ⚠️ Сервер дастрас нест
      </div>
      <button onclick="location.reload()" style="background:#E8531F;color:#fff;border:none;
        padding:13px 28px;border-radius:14px;font-weight:700;cursor:pointer;margin-top:8px">
        🔄 Аз нав
      </button>`;
    return;
  }

  loadSavedSender();
  calcPrice();
  splash.classList.add('fade');
  setTimeout(() => {
    splash.style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }, 350);

  // Connect socket for real-time updates
  connectCustomerSocket();
  // Load existing orders
  loadMyOrders();
});

// ══════════════════════════════════════════════════
// SOCKET — real-time order tracking
// ══════════════════════════════════════════════════
function connectCustomerSocket() {
  socketClient.connect('customer');

  socketClient.on('order_accepted', ({ orderId, courierName }) => {
    toast(`🏍️ Курьер қабул кард: ${courierName}`, 'ok');
    loadMyOrders();
  });

  socketClient.on('courier_location', ({ lat, lng, orderId }) => {
    updateCourierOnMap(orderId, lat, lng);
  });

  socketClient.on('order_picked_up', () => {
    toast('📤 Курьер борро гирифт!', 'ok');
    loadMyOrders();
  });

  socketClient.on('order_delivered', () => {
    toast('✅ Фармоиш расонида шуд!', 'ok');
    loadMyOrders();
  });

  socketClient.on('order_cancelled', () => {
    toast('❌ Фармоиш бекор шуд', 'er');
    loadMyOrders();
  });
}

// ══════════════════════════════════════════════════
// LOAD ORDERS
// ══════════════════════════════════════════════════
async function loadMyOrders() {
  try {
    const { orders, total } = await API.get(`/orders?deviceId=${DEVICE_ID}&limit=30`);
    myOrders = orders || [];
    updateStats();
    renderOrders();
    updateBadge();
  } catch (e) {
    console.warn('loadMyOrders:', e.message);
  }
}

// Poll every 15s as fallback
setInterval(loadMyOrders, 15_000);

// ══════════════════════════════════════════════════
// SAVED SENDER
// ══════════════════════════════════════════════════
function loadSavedSender() {
  const s = Store.get('senderInfo', {});
  if (s.name && s.phone) {
    document.getElementById('savedName').textContent  = sanitize(s.name);
    document.getElementById('savedPhone').textContent = sanitize(s.phone);
    document.getElementById('savedChip').style.display   = 'block';
    document.getElementById('senderForm').style.display  = 'none';
  }
}

function getSenderInfo() {
  const s = Store.get('senderInfo', {});
  const podz     = gv('sPodz');
  const floor    = gv('sFloor');
  const apart    = gv('sApart');
  const intercom = gv('sIntercom');
  if (s.name && s.phone) return { ...s, podz, floor, apart, intercom };
  return { name: gv('sName'), phone: gv('sPhone'), podz, floor, apart, intercom };
}

window.clearSaved = function () {
  Store.remove('senderInfo');
  document.getElementById('savedChip').style.display  = 'none';
  document.getElementById('senderForm').style.display = 'block';
};

// ══════════════════════════════════════════════════
// MAP PICKER
// ══════════════════════════════════════════════════
window.openMapPicker = function (mode) {
  pickerMode = mode;
  const isFrom = mode === 'from';
  document.getElementById('mpTitle').textContent = isFrom ? 'Нуқтаи гирифтан' : 'Нуқтаи расонидан';
  document.getElementById('mpSearchInput').value = '';
  document.getElementById('mpSearchClear').style.display  = 'none';
  document.getElementById('mpSearchResults').style.display = 'none';
  document.getElementById('mpAddrPreview').style.display  = 'none';
  document.getElementById('mpHint').style.display = 'block';
  document.getElementById('mapModal').classList.add('on');

  setTimeout(() => {
    if (!pickerMap) {
      pickerMap = L.map('pickerMap', { zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(pickerMap);
      pickerMap.on('click', e => placePin(e.latlng.lat, e.latlng.lng));
    }
    const c   = coords[mode];
    const lat = c.lat || DEF_LAT;
    const lng = c.lng || DEF_LNG;
    pickerMap.setView([lat, lng], 15);
    setTimeout(() => pickerMap.invalidateSize(), 100);

    if (c.lat) placePin(c.lat, c.lng, c.addr);
    else if (clickMarker) { pickerMap.removeLayer(clickMarker); clickMarker = null; }
  }, 50);
};

function placePin(lat, lng, knownAddr) {
  document.getElementById('mpHint').style.display = 'none';
  if (clickMarker) pickerMap.removeLayer(clickMarker);

  const emoji = pickerMode === 'from' ? '🔴' : '🏁';
  clickMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      html: `<div style="font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4));
             margin-top:-32px;margin-left:-12px">${emoji}</div>`,
      className: '', iconSize: [24, 32], iconAnchor: [12, 32]
    })
  }).addTo(pickerMap);

  const prev = document.getElementById('mpAddrPreview');
  prev.style.display = 'flex';
  document.getElementById('mpAddrTxt').textContent = knownAddr || 'Суроға ёфта мешавад...';
  document.getElementById('mpGeoSpin').style.display = knownAddr ? 'none' : 'block';

  if (knownAddr) { applySelection(lat, lng, knownAddr); return; }

  reverseGeocode(lat, lng).then(addr => applySelection(lat, lng, addr));
}

function applySelection(lat, lng, addr) {
  coords[pickerMode] = { lat, lng, addr };
  if (pickerMode === 'from') {
    document.getElementById('fromAddr').value = addr;
    showMiniMap('from', lat, lng, addr);
  } else {
    document.getElementById('toAddr').value = addr;
    showMiniMap('to', lat, lng, addr);
  }
  calcPrice();
  document.getElementById('mpAddrTxt').textContent = addr;
  document.getElementById('mpGeoSpin').style.display = 'none';
  setTimeout(() => { closeMapPicker(); toast('✅ Нуқта интихоб шуд', 'ok'); }, 600);
}

window.closeMapPicker = function () {
  document.getElementById('mapModal').classList.remove('on');
  document.getElementById('mpSearchResults').style.display = 'none';
};

async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'ru,tg,en' } }
    );
    const d = await r.json();
    const a = d.address || {};
    const parts = [];
    if (a.road)        parts.push(a.road + (a.house_number ? ' ' + a.house_number : ''));
    if (a.neighbourhood || a.suburb) parts.push(a.neighbourhood || a.suburb);
    if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village);
    return parts.filter(Boolean).join(', ') || d.display_name?.split(',')[0] || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
}

window.goMyLocation = function () {
  if (!navigator.geolocation) return toast('GPS дастрас нест', 'er');
  toast('📡 Ҷустуҷӯи мавқеи шумо...', 'if');
  navigator.geolocation.getCurrentPosition(
    p => { pickerMap.setView([p.coords.latitude, p.coords.longitude], 17); placePin(p.coords.latitude, p.coords.longitude); },
    ()  => toast('GPS иҷозат надод', 'er'),
    { timeout: 10000, enableHighAccuracy: true }
  );
};

// Search
window.onSearchInput = function (q) {
  document.getElementById('mpSearchClear').style.display = q ? 'block' : 'none';
  clearTimeout(searchDebounce);
  if (!q.trim()) { document.getElementById('mpSearchResults').style.display = 'none'; return; }
  searchDebounce = setTimeout(() => doSearch(q), 500);
};
window.clearSearch = function () {
  document.getElementById('mpSearchInput').value = '';
  document.getElementById('mpSearchClear').style.display  = 'none';
  document.getElementById('mpSearchResults').style.display = 'none';
};
async function doSearch(q) {
  if (searchAbort) searchAbort.abort();
  searchAbort = new AbortController();
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' Tajikistan')}&format=json&limit=5`,
      { signal: searchAbort.signal, headers: { 'Accept-Language': 'ru,tg,en' } }
    );
    const data = await r.json();
    const el = document.getElementById('mpSearchResults');
    if (!data.length) { el.innerHTML = '<div class="mp-sr-item">Ёфт нашуд</div>'; el.style.display = 'block'; return; }
    el.innerHTML = data.map(i => `
      <div class="mp-sr-item" onclick="selectSearchResult(${i.lat},${i.lon},'${(i.display_name || '').replace(/'/g, '\u2019').substring(0, 80)}')">
        <span class="mp-sr-ico">📍</span>
        <div style="min-width:0;flex:1">
          <div class="mp-sr-name">${sanitize((i.display_name || '').split(',')[0])}</div>
          <div class="mp-sr-addr">${sanitize((i.display_name || '').split(',').slice(1, 3).join(','))}</div>
        </div>
      </div>`).join('');
    el.style.display = 'block';
  } catch (e) { if (e.name !== 'AbortError') console.warn(e); }
}
window.selectSearchResult = function (lat, lng, name) {
  const la = parseFloat(lat), lo = parseFloat(lng);
  document.getElementById('mpSearchResults').style.display = 'none';
  document.getElementById('mpSearchInput').value = '';
  pickerMap.setView([la, lo], 16);
  setTimeout(() => placePin(la, lo, name.split(',')[0]), 300);
};

function showMiniMap(mode, lat, lng, label) {
  const wrap  = document.getElementById(mode + 'MiniWrap');
  const mapEl = document.getElementById(mode + 'MiniMap');
  document.getElementById(mode + 'MiniLabel').textContent = label;
  wrap.style.display = 'block';
  if (miniMaps[mode]) { miniMaps[mode].setView([lat, lng], 14); miniMaps[mode].invalidateSize(); return; }
  setTimeout(() => {
    const m = L.map(mapEl, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, touchZoom: false, doubleClickZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);
    m.setView([lat, lng], 14);
    miniMaps[mode] = m;
    wrap.style.cursor = 'pointer';
    wrap.onclick = () => openMapPicker(mode);
  }, 50);
}

// ══════════════════════════════════════════════════
// PRICE CALCULATION
// ══════════════════════════════════════════════════
function calcDistPrice(km) {
  if (km <= 3) return 10;
  return 10 + Math.ceil(km - 3) * 3;
}

async function calcPrice() {
  const hasFrom = coords.from.lat && coords.from.lng;
  const hasTo   = coords.to.lat   && coords.to.lng;
  const card    = document.getElementById('routeMapCard');

  if (!hasFrom || !hasTo) {
    card.style.display = 'none';
    document.getElementById('priceShow').textContent   = '10 смн';
    document.getElementById('distShow').textContent    = '📍 Масофа нест';
    document.getElementById('priceFormula').textContent = 'То 3 км = 10 смн';
    routeKm = 0;
    return;
  }

  card.style.display = 'block';
  document.getElementById('routeInfoChip').textContent = '⏳ Ҳисоб...';

  if (!routeMap) {
    routeMap = L.map('routeMap', { zoomControl: false, attributionControl: false, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(routeMap);
  }
  setTimeout(() => routeMap.invalidateSize(), 50);

  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 5000);
    const r    = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords.from.lng},${coords.from.lat};${coords.to.lng},${coords.to.lat}?overview=full&geometries=geojson`,
      { signal: ctrl.signal }
    );
    clearTimeout(tid);
    const data = await r.json();
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('no route');

    const route = data.routes[0];
    const km    = route.distance / 1000;
    const mins  = Math.round(route.duration / 60);
    routeKm     = km;

    if (routeLayer) routeMap.removeLayer(routeLayer);
    const pts = route.geometry.coordinates.map(c => [c[1], c[0]]);
    routeLayer = L.polyline(pts, { color: '#E8531F', weight: 5, opacity: .85 }).addTo(routeMap);
    routeMap.eachLayer(l => { if (l instanceof L.Marker) routeMap.removeLayer(l); });

    const mkPin = (la, ln, em) => L.marker([la, ln], {
      icon: L.divIcon({ html: `<div style="font-size:22px;margin:-11px 0 0 -6px">${em}</div>`, className: '', iconSize: [24, 24] })
    }).addTo(routeMap);
    mkPin(coords.from.lat, coords.from.lng, '🔴');
    mkPin(coords.to.lat,   coords.to.lng,   '🏁');
    routeMap.fitBounds(pts, { padding: [20, 20] });

    const price   = calcDistPrice(km);
    const formula = km <= 3 ? 'То 3 км = 10 смн' : `10 + ${Math.ceil(km - 3)} × 3 смн`;
    document.getElementById('priceShow').textContent    = price + ' смн';
    document.getElementById('distShow').textContent     = `📏 ${km.toFixed(1)} км`;
    document.getElementById('priceFormula').textContent = formula;
    document.getElementById('routeInfoChip').textContent = `${km.toFixed(1)} км · ~${mins} дақ`;
  } catch {
    // Haversine fallback
    const { lat: fLat, lng: fLng } = coords.from;
    const { lat: tLat, lng: tLng } = coords.to;
    const R = 6371, dLat = (tLat - fLat) * Math.PI / 180, dLng = (tLng - fLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(fLat * Math.PI / 180) * Math.cos(tLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    routeKm = km;
    const price = calcDistPrice(km);
    document.getElementById('priceShow').textContent     = price + ' смн';
    document.getElementById('distShow').textContent      = `📏 ~${km.toFixed(1)} км`;
    document.getElementById('priceFormula').textContent  = km <= 3 ? 'То 3 км = 10 смн' : `10 + ${Math.ceil(km - 3)} × 3 смн`;
    document.getElementById('routeInfoChip').textContent = `~${km.toFixed(1)} км`;
    if (routeLayer) routeMap.removeLayer(routeLayer);
    routeLayer = L.polyline([[fLat, fLng], [tLat, tLng]], { color: '#E8531F', weight: 4, dashArray: '8,6', opacity: .7 }).addTo(routeMap);
    routeMap.fitBounds([[fLat, fLng], [tLat, tLng]], { padding: [30, 30] });
  }
}

window.onWeight = v => document.getElementById('wVal').textContent = parseFloat(v).toFixed(1) + ' кг';

// ══════════════════════════════════════════════════
// SUBMIT ORDER → Backend API
// ══════════════════════════════════════════════════
window.submitOrder = async function () {
  const sender = getSenderInfo();
  const from   = gv('fromAddr');
  const to     = gv('toAddr');
  const recvName  = gv('recvName');
  const recvPhone = gv('recvPhone');

  if (!sender.name)  return toast('Номи худро ворид кунед', 'er');
  if (!sender.phone) return toast('Телефони худро ворид кунед', 'er');
  if (!from)         return toast('Нуқтаи гирифтанро интихоб кунед', 'er');
  if (!to)           return toast('Нуқтаи расонидан интихоб кунед', 'er');
  if (!coords.from.lat) return toast('Аз харита нуқтаро интихоб кунед', 'er');
  if (!coords.to.lat)   return toast('Нуқтаи расониданро интихоб кунед', 'er');
  if (!recvName)     return toast('Номи қабулкунандаро ворид кунед', 'er');
  if (!recvPhone)    return toast('Телефони қабулкунандаро ворид кунед', 'er');

  const w     = parseFloat(document.getElementById('weightSlider').value) || 1;
  const pkgT  = document.getElementById('pkgType').value;
  const price = calcDistPrice(routeKm || 0);

  if (document.getElementById('saveMe').checked) {
    Store.set('senderInfo', { name: sender.name, phone: sender.phone });
    loadSavedSender();
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled  = true;
  btn.textContent = '⏳ Фиристода мешавад...';

  try {
    const { order } = await API.post('/orders', {
      customerName:     sender.name,
      customerPhone:    sender.phone,
      senderPodz:       sender.podz  || '',
      senderFloor:      sender.floor || '',
      senderApart:      sender.apart || '',
      senderIntercom:   sender.intercom || '',
      fromAddress:      from,
      toAddress:        to,
      fromLat:          coords.from.lat,
      fromLng:          coords.from.lng,
      toLat:            coords.to.lat,
      toLng:            coords.to.lng,
      description:      gv('descr') || '—',
      weight:           w,
      packageType:      pkgT,
      receiverName:     recvName,
      receiverPhone:    recvPhone,
      receiverPodz:     gv('rPodz')     || '',
      receiverFloor:    gv('rFloor')    || '',
      receiverApart:    gv('rApart')    || '',
      receiverIntercom: gv('rIntercom') || '',
      note:             gv('note')      || '',
      deviceId:         DEVICE_ID
    });

    toast('✅ Фармоиш қабул шуд! Курьер тез меояд.', 'ok');
    resetForm();
    loadMyOrders();
    showPg('orders');
  } catch (e) {
    toast('❌ ' + e.message, 'er');
  }

  btn.disabled  = false;
  btn.innerHTML = '🚀 Фиристодани Фармоиш';
};

function resetForm() {
  ['fromAddr','toAddr','descr','recvName','recvPhone','rPodz','rFloor','rApart','rIntercom','note','sPodz','sFloor','sApart','sIntercom']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('weightSlider').value = 1;
  document.getElementById('wVal').textContent   = '1.0 кг';
  document.getElementById('pkgType').value      = 'small';
  coords   = { from: {}, to: {} };
  routeKm  = 0;
  ['from', 'to'].forEach(m => {
    document.getElementById(m + 'MiniWrap').style.display = 'none';
    if (miniMaps[m]) { miniMaps[m].remove(); miniMaps[m] = null; }
  });
  document.getElementById('routeMapCard').style.display = 'none';
  if (routeLayer && routeMap) { routeMap.removeLayer(routeLayer); routeLayer = null; }
}

// ══════════════════════════════════════════════════
// RENDER ORDERS
// ══════════════════════════════════════════════════
function updateStats() {
  document.getElementById('myTotal').textContent  = myOrders.length;
  document.getElementById('myActive').textContent = myOrders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
  document.getElementById('myDone').textContent   = myOrders.filter(o => o.status === 'delivered').length;
}

function updateBadge() {
  const a = myOrders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
  const b = document.getElementById('bnBadge');
  b.style.display = a > 0 ? 'block' : 'none';
  b.textContent   = a;
}

function renderOrders() {
  const el = document.getElementById('ordersList');
  document.getElementById('noDeviceNote').style.display = myOrders.length ? 'block' : 'none';
  if (!myOrders.length) {
    el.innerHTML = `<div class="empty"><div class="empty-ico">📭</div><h4>Фармоише нест</h4><p>Фармоиши аввалатонро диҳед!</p></div>`;
    return;
  }
  const sm = {
    new:       ['b-new',    '🆕', 'Курьер ҷустуҷӯ мешавад'],
    assigned:  ['b-assigned','🔄', 'Курьер дар роҳ'],
    picked_up: ['b-picked', '📤', 'Борро гирифт'],
    delivered: ['b-done',   '✅', 'Расид'],
    cancelled: ['b-cancel', '❌', 'Бекор']
  };
  el.innerHTML = myOrders.map(o => {
    const [sc, si, st] = sm[o.status] || ['b-new','🆕','Нав'];
    const d = new Date(o.createdAt).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `<div class="order-card" onclick="openDetail('${o._id}')">
      <div class="order-head">
        <div class="order-id">#${o._id.slice(-8).toUpperCase()} · ${d}</div>
        <div class="order-route">${sanitize(o.fromAddress)} → ${sanitize(o.toAddress)}</div>
      </div>
      <div class="order-body">
        ${buildTracker(o.status)}
        <div class="order-foot">
          <span class="badge ${sc}">${si} ${st}</span>
          <span class="order-price">${o.price} смн</span>
        </div>
        ${o.courierName ? `<div class="order-courier">🏍️ Курьер: ${sanitize(o.courierName)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function buildTracker(status) {
  const steps  = ['new','assigned','picked_up','delivered'];
  const labels = ['Нав','Дар роҳ','Гирифта','Расид'];
  const cur    = status === 'cancelled' ? -1 : steps.indexOf(status);
  return `<div class="tracker">${steps.map((s, i) => `
    <div class="tr-step ${i < cur ? 'dn' : i === cur ? 'ac' : ''}">
      ${i > 0 ? `<div class="tr-line ${i <= cur ? 'dn' : ''}"></div>` : ''}
      <div class="tr-dot ${i < cur ? 'dn' : i === cur ? 'ac' : ''}">${i < cur ? '✓' : i + 1}</div>
      <div class="tr-lbl">${labels[i]}</div>
    </div>`).join('')}</div>`;
}

// ══════════════════════════════════════════════════
// ORDER DETAIL MODAL
// ══════════════════════════════════════════════════
let _detailMap = null;

function closeDetailMap() {
  if (_detailMap) { _detailMap.remove(); _detailMap = null; }
}

window.openDetail = function (oid) {
  closeDetailMap();
  const o = myOrders.find(x => x._id === oid);
  if (!o) return;

  const sm = { new:'b-new 🆕 Нав', assigned:'b-assigned 🔄 Дар роҳ', picked_up:'b-picked 📤 Гирифта', delivered:'b-done ✅ Расид', cancelled:'b-cancel ❌ Бекор' };
  const [sc, si, st] = (sm[o.status] || 'b-new 🆕 Нав').split(' ');
  const hasMap = o.fromLocation?.coordinates && o.toLocation?.coordinates;

  document.getElementById('mDttl').innerHTML = `#${o._id.slice(-8).toUpperCase()} <span class="badge ${sc}">${si} ${st}</span>`;
  document.getElementById('mDbody').innerHTML = `
    ${buildTracker(o.status)}
    ${o.courierName ? `<div class="courier-box">
      <div class="courier-av">🏍️</div>
      <div style="flex:1;color:#fff">
        <div style="font-size:15px;font-weight:800">${sanitize(o.courierName)}</div>
        <div style="font-size:12px;opacity:.7;margin-top:2px">
          ${['assigned','picked_up'].includes(o.status) ? '🟢 Дар роҳ' : '✅ Расонида шуд'}
        </div>
      </div>
    </div>` : ''}
    ${hasMap ? `<div id="detailMap" style="height:190px;border-radius:14px;overflow:hidden;margin-bottom:14px;border:1.5px solid var(--bo)"></div>` : ''}
    <div class="drow"><div class="dico">👤</div><div><div class="dkey">Фиристанда</div><div class="dval">${sanitize(o.customerName)} · ${sanitize(o.customerPhone)}</div></div></div>
    <div class="drow"><div class="dico">📍</div><div><div class="dkey">Аз куҷо</div><div class="dval">${sanitize(o.fromAddress)}</div></div></div>
    <div class="drow"><div class="dico">🏁</div><div><div class="dkey">Ба куҷо</div><div class="dval">${sanitize(o.toAddress)}</div></div></div>
    <div class="drow"><div class="dico">📝</div><div><div class="dkey">Тавсиф</div><div class="dval">${sanitize(o.description || '—')}</div></div></div>
    <div class="drow"><div class="dico">⚖️</div><div><div class="dkey">Вазн</div><div class="dval">${o.weight || 1} кг</div></div></div>
    ${o.distanceKm ? `<div class="drow"><div class="dico">📏</div><div><div class="dkey">Масофа</div><div class="dval">${o.distanceKm} км</div></div></div>` : ''}
    <div class="drow"><div class="dico">💰</div><div><div class="dkey">Нарх</div><div class="dval">${o.price} смн</div></div></div>
    <div class="drow"><div class="dico">🎯</div><div><div class="dkey">Қабулкунанда</div><div class="dval">${sanitize(o.receiverName)} · ${sanitize(o.receiverPhone)}</div></div></div>
    ${o.note ? `<div class="drow"><div class="dico">💬</div><div><div class="dkey">Эзоҳ</div><div class="dval">${sanitize(o.note)}</div></div></div>` : ''}
    ${o.status === 'new' ? `<button class="btn btn-dn btn-w" onclick="cancelOrder('${o._id}');closeM('mDetail')" style="margin-top:14px">❌ Бекор кардан</button>` : ''}
    <div style="margin-top:16px"><button class="btn btn-ot btn-w" onclick="closeM('mDetail')">Бастан</button></div>`;

  openM('mDetail');

  if (!hasMap) return;
  setTimeout(async () => {
    const [fLng, fLat] = o.fromLocation.coordinates;
    const [tLng, tLat] = o.toLocation.coordinates;
    const dm = L.map('detailMap', { zoomControl: false, attributionControl: false, scrollWheelZoom: false, tap: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(dm);
    _detailMap = dm;

    const mkPin = (la, ln, em) => L.marker([la, ln], {
      icon: L.divIcon({ html: `<div style="font-size:26px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">${em}</div>`, className: '', iconSize: [26, 26], iconAnchor: [13, 26] })
    }).addTo(dm);

    mkPin(fLat, fLng, '🔴');
    mkPin(tLat, tLng, '🏁');

    try {
      const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${fLng},${fLat};${tLng},${tLat}?overview=full&geometries=geojson`);
      const d = await r.json();
      if (d.code === 'Ok' && d.routes?.length) {
        const pts = d.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        L.polyline(pts, { color: '#E8531F', weight: 5, opacity: .75 }).addTo(dm);
        dm.fitBounds(pts, { padding: [24, 24] });
      } else throw '';
    } catch {
      L.polyline([[fLat, fLng], [tLat, tLng]], { color: '#E8531F', weight: 4, dashArray: '8,6', opacity: .6 }).addTo(dm);
      dm.fitBounds([[fLat, fLng], [tLat, tLng]], { padding: [30, 30] });
    }
  }, 120);
};

// Live courier marker update
const _courierMarkers = {};
function updateCourierOnMap(orderId, lat, lng) {
  if (!_detailMap) return;
  const key = String(orderId);
  if (_courierMarkers[key]) {
    _courierMarkers[key].setLatLng([lat, lng]);
  } else {
    _courierMarkers[key] = L.marker([lat, lng], {
      icon: L.divIcon({
        html: '<div style="background:#4361ee;width:32px;height:32px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:16px">🏍️</div>',
        className: '', iconSize: [32, 32], iconAnchor: [16, 16]
      })
    }).addTo(_detailMap);
  }
}

window.cancelOrder = async function (oid) {
  if (!confirm('Фармоишро бекор кунед?')) return;
  try {
    await API.patch(`/orders/${oid}/cancel`);
    toast('Фармоиш бекор шуд', 'if');
    loadMyOrders();
  } catch (e) { toast('❌ ' + e.message, 'er'); }
};

// ══════════════════════════════════════════════════
// NAV HELPERS
// ══════════════════════════════════════════════════
window.showPg = function (pg) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.getElementById('pg-' + pg)?.classList.add('on');
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('on'));
  const idx = { new: 0, orders: 1 }[pg];
  if (idx !== undefined) document.querySelectorAll('.bn-item')[idx]?.classList.add('on');
  if (pg === 'orders') loadMyOrders();
};
window.openM  = id => document.getElementById(id).classList.add('on');
window.closeM = function (id) { document.getElementById(id).classList.remove('on'); if (id === 'mDetail') closeDetailMap(); };
document.querySelectorAll?.('.moverlay').forEach(m => { m.addEventListener('click', e => { if (e.target === m) m.classList.remove('on'); }); });
function gv(id) { return document.getElementById(id)?.value?.trim() || ''; }
