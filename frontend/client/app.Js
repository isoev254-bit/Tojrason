/* ═══════════════════════════════════════════
   Tojrason Delivery — Client Panel App
   Экспресс Куръер — Мантиқи асосӣ
   ═══════════════════════════════════════════ */
'use strict';

// ══════ STATE ══════
let map, pickupMarker = null, deliveryMarker = null;
let pickupCoords = null, deliveryCoords = null;
let routeLayer = null, currentMode = 'pickup';
let currentDistKm = null, currentRouteGeo = null;
let courierTimers = {}, orders = [], nextId = 1, activeId = null;
let cargoType = 'parcel', weight = 0;
let subtab = 'active';
let searchTimers = {};
let modalCallback = null;

const OSRM = 'https://router.project-osrm.org/route/v1/driving/';
const NOM = 'https://nominatim.openstreetmap.org/';
const CTR = [38.560, 68.785];

const COURIERS = [
  { name: 'Алишер Раҳимов', phone: '+992 90 123 4567' },
  { name: 'Фаррух Назаров', phone: '+992 92 765 4321' },
  { name: 'Бахром Саидов', phone: '+992 98 111 2233' },
  { name: 'Самир Қодиров', phone: '+992 77 888 9900' },
  { name: 'Далер Каримов', phone: '+992 93 456 7890' }
];

const CLABELS = {
  parcel: '📦 Баста', document: '📄 Ҳуҷҷат', food: '🍱 Ғизо',
  fragile: '🥚 Шикастанӣ', clothes: '👕 Либос', electronics: '📱 Техника',
  cargo: '🏋️ Вазнин', other: '🎁 Дигар'
};

// ══════ MAP ══════
function initMap() {
  map = L.map('map', { zoomControl: false }).setView(CTR, 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OSM & CartoDB', subdomains: 'abcd', maxZoom: 19
  }).addTo(map);
  L.control.zoom({ position: 'topright' }).addTo(map);

  map.on('click', async e => {
    const c = [e.latlng.lat, e.latlng.lng];
    if (currentMode === 'pickup') {
      placeMarker('pickup', c);
      const a = await reverseGeo(c[0], c[1]);
      document.getElementById('fromInput').value = a;
      document.getElementById('fromHint').textContent = c[0].toFixed(5) + ', ' + c[1].toFixed(5);
      toast('📍 Нуқтаи "Аз куҷо" гузошта шуд', 'success');
      setMode('delivery');
    } else {
      placeMarker('delivery', c);
      const a = await reverseGeo(c[0], c[1]);
      document.getElementById('toInput').value = a;
      document.getElementById('toHint').textContent = c[0].toFixed(5) + ', ' + c[1].toFixed(5);
      toast('📍 Нуқтаи "Ба куҷо" гузошта шуд', 'success');
    }
    fetchRoute();
    updateBtn();
  });
}

function mkIcon(color, fa) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:34px;height:34px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.22);">
          <i class="fas ${fa}" style="color:white;font-size:14px;"></i></div>`,
    iconSize: [34, 34], popupAnchor: [0, -17], iconAnchor: [17, 17]
  });
}

function placeMarker(which, coords) {
  if (which === 'pickup') {
    if (pickupMarker) map.removeLayer(pickupMarker);
    pickupCoords = coords;
    pickupMarker = L.marker(coords, { icon: mkIcon('#16a34a', 'fa-store'), draggable: true }).addTo(map);
    pickupMarker.bindPopup('🟢 Аз куҷо');
    pickupMarker.on('dragend', async e => {
      const p = e.target.getLatLng();
      pickupCoords = [p.lat, p.lng];
      document.getElementById('fromInput').value = await reverseGeo(p.lat, p.lng);
      document.getElementById('fromHint').textContent = p.lat.toFixed(5) + ', ' + p.lng.toFixed(5);
      fetchRoute(); updateBtn();
      toast('📍 "Аз куҷо" ҷойгузин шуд', 'info');
    });
  } else {
    if (deliveryMarker) map.removeLayer(deliveryMarker);
    deliveryCoords = coords;
    deliveryMarker = L.marker(coords, { icon: mkIcon('#dc2626', 'fa-flag-checkered'), draggable: true }).addTo(map);
    deliveryMarker.bindPopup('🔴 Ба куҷо');
    deliveryMarker.on('dragend', async e => {
      const p = e.target.getLatLng();
      deliveryCoords = [p.lat, p.lng];
      document.getElementById('toInput').value = await reverseGeo(p.lat, p.lng);
      document.getElementById('toHint').textContent = p.lat.toFixed(5) + ', ' + p.lng.toFixed(5);
      fetchRoute(); updateBtn();
      toast('📍 "Ба куҷо" ҷойгузин шуд', 'info');
    });
  }
}

// ══════ GEOCODING ══════
async function reverseGeo(lat, lng) {
  try {
    const d = await fetch(`${NOM}reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`).then(r => r.json());
    if (d?.display_name) return d.display_name.split(',').slice(0, 3).join(', ');
  } catch (e) { }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

async function searchGeo(q) {
  const d = await fetch(`${NOM}search?format=json&q=${encodeURIComponent(q + ' Душанбе Тоҷикистон')}&limit=5&addressdetails=1`).then(r => r.json());
  return d || [];
}

function onSearch(which) {
  const id = which === 'from' ? 'fromInput' : 'toInput';
  const val = document.getElementById(id).value.trim();
  clearTimeout(searchTimers[which]);
  hideSug(which);
  if (val.length < 2) return;
  searchTimers[which] = setTimeout(() => doSearch(which, val), 400);
}

async function doSearch(which, q) {
  if (!q) q = document.getElementById(which === 'from' ? 'fromInput' : 'toInput').value.trim();
  if (!q) { toast('Лутфан суроғаро нависед', 'warning'); return; }
  showSugLoading(which);
  try {
    const results = await searchGeo(q);
    renderSug(which, results);
  } catch (e) {
    hideSug(which);
    toast('Ҷустуҷӯ натиҷа надод', 'error');
  }
}

function showSugLoading(which) {
  const el = document.getElementById(which === 'from' ? 'fromSug' : 'toSug');
  el.innerHTML = `<div class="sug-item"><i class="fas fa-spin fa-spinner spin"></i><div><div class="sug-name">Ҷустуҷӯ...</div></div></div>`;
  el.style.display = 'block';
}

function renderSug(which, results) {
  const el = document.getElementById(which === 'from' ? 'fromSug' : 'toSug');
  if (!results || !results.length) {
    el.innerHTML = `<div class="sug-item"><i class="fas fa-circle-xmark"></i><div><div class="sug-name">Суроға пайдо нашуд</div></div></div>`;
    el.style.display = 'block'; return;
  }
  el._data = results;
  el.innerHTML = results.map((r, i) => {
    const parts = r.display_name.split(',');
    return `<div class="sug-item" data-idx="${i}">
      <i class="fas fa-location-dot"></i>
      <div><div class="sug-name">${parts.slice(0, 2).join(', ')}</div>
      <div class="sug-sub">${parts.slice(2, 4).join(', ')}</div></div>
    </div>`;
  }).join('');
  el.querySelectorAll('.sug-item[data-idx]').forEach(item => {
    item.addEventListener('click', () => {
      const r = el._data[+item.dataset.idx];
      selectSug(which, r);
    });
  });
  el.style.display = 'block';
}

function hideSug(which) {
  const el = document.getElementById(which === 'from' ? 'fromSug' : 'toSug');
  el.style.display = 'none';
}

async function selectSug(which, r) {
  const coords = [parseFloat(r.lat), parseFloat(r.lon)];
  const addr = r.display_name.split(',').slice(0, 3).join(', ');
  hideSug(which);
  if (which === 'from') {
    document.getElementById('fromInput').value = addr;
    document.getElementById('fromHint').textContent = coords[0].toFixed(5) + ', ' + coords[1].toFixed(5);
    placeMarker('pickup', coords);
    setMode('delivery');
  } else {
    document.getElementById('toInput').value = addr;
    document.getElementById('toHint').textContent = coords[0].toFixed(5) + ', ' + coords[1].toFixed(5);
    placeMarker('delivery', coords);
  }
  map.setView(coords, 15);
  fetchRoute(); updateBtn();
  toast('✅ Суроға интихоб шуд', 'success');
}

// ══════ ROUTE ══════
async function fetchRoute() {
  if (!pickupCoords || !deliveryCoords) {
    if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
    document.getElementById('routeBar').style.display = 'none';
    document.getElementById('priceBox').style.display = 'none';
    currentDistKm = null; currentRouteGeo = null;
    return;
  }
  document.getElementById('routeBar').style.display = 'flex';
  document.getElementById('rDist').innerHTML = '<i class="fas fa-spinner spin"></i>';
  document.getElementById('rDur').textContent = '...';

  const [f, t] = [pickupCoords, deliveryCoords];
  try {
    const url = `${OSRM}${f[1]},${f[0]};${t[1]},${t[0]}?overview=full&geometries=geojson`;
    const data = await fetch(url).then(r => r.json());
    if (!data.routes?.length) throw new Error();
    const route = data.routes[0];
    const km = (route.distance / 1000).toFixed(1);
    const min = Math.round(route.duration / 60);
    currentDistKm = km; currentRouteGeo = route.geometry;
    document.getElementById('rDist').textContent = km;
    document.getElementById('rDur').textContent = min;
    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.geoJSON(route.geometry, { style: { color: '#2563eb', weight: 5, opacity: .8 } }).addTo(map);
    map.fitBounds(L.latLngBounds([f, t]), { padding: [60, 60] });
    updatePrice();
  } catch (e) {
    currentDistKm = null; currentRouteGeo = null;
    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.polyline([f, t], { color: '#2563eb', weight: 3, dashArray: '8 6' }).addTo(map);
    document.getElementById('rDist').textContent = '—';
    document.getElementById('rDur').textContent = '—';
    document.getElementById('priceBox').style.display = 'none';
    toast('Маршрути воқеӣ дастрас нест, хати рост нишон дода шуд', 'warning');
  }
}

// ══════ PRICE ══════
function calcPrice(km, kg) {
  const k = parseFloat(km);
  const dp = isNaN(k) ? 0 : (k <= 3 ? 10 : 10 + Math.ceil((k - 3) * 3));
  const we = kg > 10 ? Math.ceil(kg - 10) : 0;
  return { dp, we, tot: dp + we };
}

function updatePrice() {
  const pb = document.getElementById('priceBox');
  if (!currentDistKm) { pb.style.display = 'none'; return; }
  const { dp, we, tot } = calcPrice(currentDistKm, weight);
  document.getElementById('priceVal').textContent = tot + ' сомонӣ';
  document.getElementById('priceRows').innerHTML = `
    <div class="price-row"><span>📍 Масофа (${currentDistKm} км):</span><span>${dp} смн</span></div>
    <div class="price-row"><span>⚖️ Вазн (${weight} кг):</span><span>${we > 0 ? '+' + we : '0'} смн</span></div>
    <div class="price-row tot"><span>💳 Ҷамъ:</span><span>${tot} сомонӣ</span></div>`;
  pb.style.display = 'block';
}

// ══════ WEIGHT ══════
function setWeight(v) {
  weight = Math.max(0, Math.min(999, isNaN(v) ? 0 : v));
  document.getElementById('wNum').textContent = weight;
  document.getElementById('wInput').value = weight;
  document.getElementById('wBadge').textContent = weight + ' кг';
  updatePrice();
}

// ══════ MODE / UI ══════
function setMode(m) {
  currentMode = m;
  document.getElementById('btnPickup').classList.toggle('active', m === 'pickup');
  document.getElementById('btnDelivery').classList.toggle('active', m === 'delivery');
}

function updateBtn() {
  document.getElementById('btnOrder').disabled = !(pickupCoords && deliveryCoords);
}

function resetAll() {
  if (pickupMarker) { map.removeLayer(pickupMarker); pickupMarker = null; }
  if (deliveryMarker) { map.removeLayer(deliveryMarker); deliveryMarker = null; }
  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
  pickupCoords = null; deliveryCoords = null;
  currentDistKm = null; currentRouteGeo = null;
  ['fromInput', 'fromEnt', 'fromCode', 'fromFloor', 'fromApt', 'fromPhone',
    'toInput', 'toEnt', 'toCode', 'toFloor', 'toApt', 'toPhone'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  document.getElementById('fromHint').textContent = '—';
  document.getElementById('toHint').textContent = '—';
  document.getElementById('routeBar').style.display = 'none';
  document.getElementById('priceBox').style.display = 'none';
  hideSug('from'); hideSug('to');
  setMode('pickup');
  setWeight(0);
  updateBtn();
  map.setView(CTR, 13);
  toast('Ҳама тоза карда шуд', 'info');
}

// ══════ SUBMIT ORDER ══════
function submitOrder() {
  if (!pickupCoords || !deliveryCoords) { toast('Ҳарду нуқтаро интихоб кунед', 'warning'); return; }
  const km = currentDistKm || '—';
  const { tot } = calcPrice(km, weight);

  const order = {
    id: nextId++,
    fromAddr: document.getElementById('fromInput').value.trim() || coordStr(pickupCoords),
    toAddr: document.getElementById('toInput').value.trim() || coordStr(deliveryCoords),
    fromCoords: [...pickupCoords],
    toCoords: [...deliveryCoords],
    weight, cargoType, cargoLabel: CLABELS[cargoType],
    distance: km, price: tot,
    fromDet: getDet('from'), toDet: getDet('to'),
    status: 'pending',
    courier: null, courierActive: false,
    rating: 0, complaint: '',
    routeGeo: currentRouteGeo ? JSON.parse(JSON.stringify(currentRouteGeo)) : null,
    routePts: null, courierMark: null
  };
  orders.push(order);
  renderOrders();
  toast(`✅ Фармоиш №${order.id} қабул шуд! Нарх: ${tot} сомонӣ`, 'success');

  resetAll();
  document.querySelectorAll('.cargo-btn').forEach(b => b.classList.remove('sel'));
  document.querySelector('.cargo-btn[data-type="parcel"]').classList.add('sel');
  cargoType = 'parcel';
  switchTab('orders');
}

function getDet(which) {
  const p = which === 'from';
  return {
    entrance: (document.getElementById(p ? 'fromEnt' : 'toEnt') || {}).value || '',
    code: (document.getElementById(p ? 'fromCode' : 'toCode') || {}).value || '',
    floor: (document.getElementById(p ? 'fromFloor' : 'toFloor') || {}).value || '',
    apt: (document.getElementById(p ? 'fromApt' : 'toApt') || {}).value || '',
    phone: (document.getElementById(p ? 'fromPhone' : 'toPhone') || {}).value || ''
  };
}

function coordStr(c) { return c[0].toFixed(5) + ', ' + c[1].toFixed(5); }

// ══════ ACCEPT / TRACK ══════
function acceptOrder(id) {
  const o = orders.find(x => x.id === id);
  if (!o || o.status !== 'pending') return;
  o.status = 'accepted';
  const c = COURIERS[Math.floor(Math.random() * COURIERS.length)];
  o.courier = c;
  o.courierActive = true;

  if (o.routeGeo?.type === 'LineString') {
    o.routePts = o.routeGeo.coordinates.map(c => [c[1], c[0]]);
  } else {
    o.routePts = [o.fromCoords, o.toCoords];
  }

  const cm = L.marker(o.routePts[0], { icon: mkIcon('#3b82f6', 'fa-motorcycle') }).addTo(map);
  cm.bindPopup(`🏍️ ${c.name}<br>📞 ${c.phone}`);
  o.courierMark = cm;

  let step = 0;
  courierTimers[id] = setInterval(() => {
    if (!o.courierActive) { clearInterval(courierTimers[id]); return; }
    if (step < o.routePts.length - 1) {
      step++;
      cm.setLatLng(o.routePts[step]);
      if (step === o.routePts.length - 1) {
        o.status = 'delivered'; o.courierActive = false;
        clearInterval(courierTimers[id]);
        toast(`✅ Фармоиш №${id} расонида шуд!`, 'success');
        renderOrders();
      }
    }
  }, 1500);

  renderOrders();
  toast(`🚚 ${c.name} (${c.phone}) фармоишро қабул кард!`, 'success');
}

function trackOrder(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  activeId = id;
  renderOrders();

  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
  if (pickupMarker) { map.removeLayer(pickupMarker); pickupMarker = null; }
  if (deliveryMarker) { map.removeLayer(deliveryMarker); deliveryMarker = null; }

  routeLayer = o.routeGeo
    ? L.geoJSON(o.routeGeo, { style: { color: '#2563eb', weight: 4 } }).addTo(map)
    : L.polyline([o.fromCoords, o.toCoords], { color: '#2563eb', weight: 4 }).addTo(map);

  L.marker(o.fromCoords, { icon: mkIcon('#16a34a', 'fa-store') }).addTo(map).bindPopup('🟢 Аз куҷо');
  L.marker(o.toCoords, { icon: mkIcon('#dc2626', 'fa-flag-checkered') }).addTo(map).bindPopup('🔴 Ба куҷо');
  if (o.courierMark && o.courierActive) o.courierMark.addTo(map);

  map.fitBounds(L.latLngBounds([o.fromCoords, o.toCoords]), { padding: [60, 60] });
  toast(`📍 Пайгирии фармоиш №${id}`, 'info');
  switchTab('orders');
}

// ══════ RATING & COMPLAINT ══════
function setRating(id, stars) {
  const o = orders.find(x => x.id === id);
  if (o) { o.rating = stars; toast(`⭐ Баҳои ${stars} ситора дода шуд!`, 'success'); renderOrders(); }
}

function openModal(title, cb) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalText').value = '';
  document.getElementById('modal').style.display = 'flex';
  modalCallback = cb;
  setTimeout(() => document.getElementById('modalText').focus(), 100);
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  modalCallback = null;
}

// ══════ RENDER ORDERS ══════
function renderOrders() {
  const active = orders.filter(o => o.status !== 'delivered');
  const history = orders.filter(o => o.status === 'delivered');
  document.getElementById('cnt').textContent = `(${orders.length})`;

  const statusMap = {
    pending: { cls: 'b-pending', txt: 'Интизори куръер' },
    accepted: { cls: 'b-accepted', txt: 'Куръер дар роҳ' },
    delivered: { cls: 'b-delivered', txt: 'Расонида шуд' }
  };

  function card(o) {
    const sm = statusMap[o.status] || statusMap.pending;
    const courierHtml = o.courier
      ? `<div class="courier-row">
           <i class="fas fa-user" style="color:#1e3c72;font-size:.75rem;"></i>
           <span class="cname">${o.courier.name}</span>
           <a class="call-link" href="tel:${o.courier.phone}">
             <i class="fas fa-phone-alt"></i> ${o.courier.phone}
           </a>
         </div>` : '';

    const starsHtml = o.status === 'delivered'
      ? `<div class="stars">${[1, 2, 3, 4, 5].map(s =>
        `<i class="fas fa-star star ${o.rating >= s ? 'on' : ''}" data-id="${o.id}" data-v="${s}"></i>`
      ).join('')}</div>` : '';

    const actionHtml = o.status === 'delivered'
      ? `<button class="btn-complaint" data-id="${o.id}"><i class="fas fa-flag"></i> Шикоят</button>
         <button class="btn-admin" data-id="${o.id}"><i class="fas fa-headset"></i> Админ</button>` : '';

    return `<div class="order-card${activeId === o.id ? ' sel' : ''}" data-id="${o.id}">
      <div class="o-header">
        <span class="o-num">Фармоиш №${o.id}</span>
        <span class="badge ${sm.cls}">${sm.txt}</span>
      </div>
      <div class="o-row"><b>Аз: </b>${o.fromAddr.substring(0, 44)}${o.fromAddr.length > 44 ? '…' : ''}</div>
      <div class="o-row"><b>Ба: </b>${o.toAddr.substring(0, 44)}${o.toAddr.length > 44 ? '…' : ''}</div>
      <div class="o-row"><b>Бор: </b>${o.cargoLabel} &nbsp;·&nbsp; <b>Вазн: </b>${o.weight} кг</div>
      <div class="o-row"><b>Масофа: </b>${o.distance} км &nbsp;·&nbsp; <b>Нарх: </b><strong>${o.price} сомонӣ</strong></div>
      ${courierHtml}${starsHtml}
      <div class="card-btns">
        ${o.status === 'pending' ? `<button class="btn-accept" data-id="${o.id}"><i class="fas fa-check-circle"></i> Куръер қабул кунад</button>` : ''}
        <button class="btn-track" data-id="${o.id}"><i class="fas fa-map-marker-alt"></i> Пайгирӣ</button>
        ${actionHtml}
      </div>
    </div>`;
  }

  const aEl = document.getElementById('listActive');
  const hEl = document.getElementById('listHistory');

  aEl.innerHTML = active.length
    ? active.map(card).join('')
    : '<div style="text-align:center;padding:22px;color:#94a3b8;"><i class="fas fa-check-circle" style="font-size:1.8rem;opacity:.25;display:block;margin-bottom:8px;"></i>Фармоиши фаъол нест</div>';

  hEl.innerHTML = history.length
    ? history.map(card).join('')
    : '<div style="text-align:center;padding:22px;color:#94a3b8;"><i class="fas fa-history" style="font-size:1.8rem;opacity:.25;display:block;margin-bottom:8px;"></i>Таърих холӣ аст</div>';

  // Event bindings
  document.querySelectorAll('.btn-accept').forEach(btn => {
    btn.onclick = e => { e.stopPropagation(); acceptOrder(+btn.dataset.id); };
  });
  document.querySelectorAll('.btn-track').forEach(btn => {
    btn.onclick = e => { e.stopPropagation(); trackOrder(+btn.dataset.id); };
  });
  document.querySelectorAll('.star').forEach(star => {
    star.onclick = e => { e.stopPropagation(); setRating(+star.dataset.id, +star.dataset.v); };
  });
  document.querySelectorAll('.btn-complaint').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      openModal('Шикоят нависед', text => {
        const o = orders.find(x => x.id === id);
        if (o) { o.complaint = text; toast('Шикояти шумо қабул шуд!', 'info'); renderOrders(); }
      });
    };
  });
  document.querySelectorAll('.btn-admin').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      openModal('Паём ба админ', text => {
        console.log(`Admin msg [order #${id}]: ${text}`);
        toast('Паёми шумо ба админ фиристода шуд!', 'success');
      });
    };
  });
  document.querySelectorAll('.order-card').forEach(card => {
    card.onclick = () => trackOrder(+card.dataset.id);
  });
}

// ══════ TAB SWITCHING ══════
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
}

// ══════ TOAST ══════
let _tt;
function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  const c = { success: '#15803d', error: '#dc2626', warning: '#b45309', info: '#1e293b' };
  el.style.background = c[type] || c.info;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove('show'), 3500);
}

// ══════ PANEL COLLAPSE ══════
let collapsed = false;
function togglePanel() {
  collapsed = !collapsed;
  document.getElementById('panel').classList.toggle('collapsed', collapsed);
  document.getElementById('collapseIcon').className = collapsed ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
  map.invalidateSize();
}

// ══════ INIT ══════
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderOrders();

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Subtabs
  document.querySelectorAll('.subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      subtab = btn.dataset.sub;
      document.querySelectorAll('.subtab').forEach(b => b.classList.toggle('active', b === btn));
      document.getElementById('listActive').style.display = subtab === 'active' ? 'flex' : 'none';
      document.getElementById('listHistory').style.display = subtab === 'history' ? 'flex' : 'none';
    });
  });

  // Mode
  document.getElementById('btnPickup').addEventListener('click', () => setMode('pickup'));
  document.getElementById('btnDelivery').addEventListener('click', () => setMode('delivery'));

  // Geocode buttons
  document.getElementById('fromGeo').addEventListener('click', () => doSearch('from'));
  document.getElementById('toGeo').addEventListener('click', () => doSearch('to'));

  // Close suggestions on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#fromInput') && !e.target.closest('#fromSug') && !e.target.closest('#fromGeo')) hideSug('from');
    if (!e.target.closest('#toInput') && !e.target.closest('#toSug') && !e.target.closest('#toGeo')) hideSug('to');
  });

  // Cargo type
  document.getElementById('cargoGrid').addEventListener('click', e => {
    const btn = e.target.closest('.cargo-btn');
    if (!btn) return;
    document.querySelectorAll('.cargo-btn').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    cargoType = btn.dataset.type;
  });

  // Weight
  document.getElementById('btnMinus').addEventListener('click', () => setWeight(weight - 1));
  document.getElementById('btnPlus').addEventListener('click', () => setWeight(weight + 1));
  document.getElementById('wInput').addEventListener('input', e => {
    setWeight(parseFloat(e.target.value) || 0);
  });

  // Submit
  document.getElementById('btnOrder').addEventListener('click', submitOrder);

  // Reset
  document.getElementById('resetBtn').addEventListener('click', resetAll);

  // Collapse
  document.getElementById('collapseBtn').addEventListener('click', togglePanel);
  document.getElementById('panelHandle').addEventListener('click', togglePanel);

  // Modal
  document.getElementById('modalOk').addEventListener('click', () => {
    const text = document.getElementById('modalText').value.trim();
    if (!text) { toast('Лутфан матн нависед', 'warning'); return; }
    if (modalCallback) modalCallback(text);
    closeModal();
  });
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  // Enter key on search
  document.getElementById('fromInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doSearch('from'); } });
  document.getElementById('toInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doSearch('to'); } });

  toast('👋 Суроғаро нависед ё дар харита клик кунед', 'info');
});

window.addEventListener('resize', () => { if (map) map.invalidateSize(); });
