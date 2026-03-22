// ═══════════════════════════════════════════════════
// frontend/js/courier.js — Courier App
// JWT Auth + Socket.io (replaces Firebase)
// ═══════════════════════════════════════════════════
'use strict';

// ── State ──────────────────────────────────────────
let me          = null;
let isOnline    = false;
let myOrders    = [];
let myHistory   = [];
let map         = null;
let cMark       = null;
let wId         = null;
let photos      = { face: null, passport: null };
let notifTO     = null;
let currentTab  = 'orders';
let declinedIds = new Set();

const DEF = { lat: CONFIG.DEFAULT_LAT, lng: CONFIG.DEFAULT_LNG };
const VEH = { motorcycle: '🏍️', bicycle: '🚲', car: '🚗', foot: '🚶' };

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
window.addEventListener('load', async () => {
  const splash = document.getElementById('splash');
  try {
    const r = await fetch(CONFIG.API_BASE.replace('/api/v1', '/health'));
    if (!r.ok) throw new Error();
  } catch {
    splash.innerHTML = `<div class="sp-logo">🏍️ TojRason</div>
      <div style="color:#ef4444;font-size:13px;text-align:center;padding:0 24px;margin-top:8px">⚠️ Сервер дастрас нест</div>
      <button onclick="location.reload()" style="background:#4361ee;color:#fff;border:none;padding:13px 28px;border-radius:14px;font-weight:700;cursor:pointer;margin-top:8px">🔄 Аз нав</button>`;
    return;
  }

  setupFileInputs();

  // Try auto-login from saved tokens
  const saved = Store.get('courierData');
  if (saved?.id) {
    try {
      me = saved;
      splash.classList.add('fade');
      setTimeout(() => { splash.style.display = 'none'; checkStatus(); }, 350);
      return;
    } catch { Store.remove('courierData'); Store.remove('tokens'); }
  }

  splash.classList.add('fade');
  setTimeout(() => { splash.style.display = 'none'; showScr('auth'); }, 350);
});

function showScr(id) {
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
  const el = document.getElementById('scr' + id.charAt(0).toUpperCase() + id.slice(1));
  if (el) el.classList.add('on');
}

function checkStatus() {
  if (!me) return showScr('auth');
  if (me.status === 'approved') goMain();
  else if (me.status === 'pending') { document.getElementById('waitId').textContent = me.id || me._id || '—'; showScr('wait'); }
  else showScr('auth');
}

// ══════════════════════════════════════════════════
// AUTH TABS
// ══════════════════════════════════════════════════
window.aTab = function (i) {
  document.getElementById('af1').style.display = i === 0 ? 'block' : 'none';
  document.getElementById('af2').style.display = i === 1 ? 'block' : 'none';
  document.getElementById('at1').classList.toggle('on', i === 0);
  document.getElementById('at2').classList.toggle('on', i === 1);
};

// ══════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════
window.doLogin = async function () {
  const username = gv('lUser');
  const password = gv('lPass');
  if (!username || !password) return se('lerr', 'Логин ва паролро ворид кунед');
  try {
    const data = await API.post('/auth/courier/login', { username, password });
    Store.set('tokens', { access: data.access, refresh: data.refresh });
    me = data.courier;
    Store.set('courierData', me);
    checkStatus();
  } catch (e) { se('lerr', e.message); }
};

// ══════════════════════════════════════════════════
// REGISTER (with photo upload)
// ══════════════════════════════════════════════════
window.doRegister = async function () {
  const name     = gv('rName');
  const phone    = gv('rPhone');
  const username = gv('rUser').toLowerCase().replace(/\s/g, '');
  const password = gv('rPass');
  const vehicle  = document.getElementById('rVeh').value;

  if (!name || !phone || !username || !password) return se('rerr', 'Ҳамаи майдонҳоро пур кунед');
  if (password.length < 6) return se('rerr', 'Парол камаш 6 символ');
  if (!photos.face)     return se('rerr', 'Акси рӯйро илова кунед');
  if (!photos.passport) return se('rerr', 'Акси паспортро илова кунед');

  try {
    const form = new FormData();
    form.append('name', name);
    form.append('phone', phone);
    form.append('username', username);
    form.append('password', password);
    form.append('vehicle', vehicle);
    // Convert base64 to Blob
    form.append('facePhoto',     dataURLtoBlob(photos.face),     'face.jpg');
    form.append('passportPhoto', dataURLtoBlob(photos.passport), 'passport.jpg');

    const data = await API.upload('/auth/courier/register', form);
    me = { id: data.courierId, status: 'pending' };
    Store.set('courierData', me);
    document.getElementById('waitId').textContent = data.courierId;
    showScr('wait');
    notify('Муваффақ!', 'Аризаи шумо қабул шуд', 'success');
  } catch (e) { se('rerr', e.message); }
};

function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime  = header.match(/:(.*?);/)[1];
  const bytes = atob(data);
  const arr   = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// ══════════════════════════════════════════════════
// CHECK APPROVAL
// ══════════════════════════════════════════════════
window.checkApproval = async function () {
  if (!me) return;
  try {
    // Try logging in with saved credentials to get fresh data
    const username = Store.get('pendingUsername');
    const password = Store.get('pendingPassword');
    if (!username || !password) {
      return notify('Маълумот', 'Барои санҷидан логин кунед', 'info');
    }
    const data = await API.post('/auth/courier/login', { username, password });
    Store.set('tokens', { access: data.access, refresh: data.refresh });
    me = data.courier;
    Store.set('courierData', me);
    if (me.status === 'approved') { goMain(); notify('Табрик!', 'Шумо тасдиқ шудед ✅', 'success'); }
    else if (me.status === 'rejected') notify('Рад шуд', 'Аризаи шумо рад карда шуд', 'err');
    else notify('Ҳолат', 'Ҳанӯз дар баррасӣ...', 'info');
  } catch (e) { notify('Хато', e.message, 'err'); }
};

window.doLogout = function () {
  if (wId) navigator.geolocation.clearWatch(wId);
  socketClient.disconnect();
  me = null;
  Store.remove('courierData');
  Store.remove('tokens');
  isOnline = false;
  declinedIds.clear();
  showScr('auth');
};

function se(id, m) {
  const e = document.getElementById(id);
  e.textContent = m;
  e.style.display = 'block';
  setTimeout(() => e.style.display = 'none', 3500);
}

// ══════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════
function goMain() {
  showScr('main');
  fillProfile();
  initMap();
  trackLoc();
  connectSocket();
  switchTab('orders');
  loadOrders();
}

// ══════════════════════════════════════════════════
// SOCKET
// ══════════════════════════════════════════════════
function connectSocket() {
  socketClient.connect('courier');

  socketClient.on('new_order', order => {
    if (!isOnline) return;
    if (declinedIds.has(String(order._id))) return;
    if (!myOrders.find(o => o._id === order._id)) {
      myOrders.unshift(order);
      notify('📦 Закази нав!', `${order.fromAddress?.substring(0, 30)} → ${order.toAddress?.substring(0, 30)}`, 'success');
      renderCurrentTab();
    }
  });

  socketClient.on('order_assigned', order => {
    const idx = myOrders.findIndex(o => o._id === order._id);
    if (idx >= 0) myOrders[idx] = order;
    else myOrders.unshift(order);
    renderCurrentTab();
  });

  socketClient.on('order_cancelled', ({ orderId }) => {
    myOrders = myOrders.filter(o => o._id !== orderId);
    notify('❌ Бекор', 'Закази бекор карда шуд', 'err');
    renderCurrentTab();
  });

  socketClient.on('status_changed', ({ status }) => {
    me.status = status;
    Store.set('courierData', me);
    if (status === 'approved') { goMain(); notify('Табрик!', 'Шумо тасдиқ шудед ✅', 'success'); }
    else if (status === 'rejected') notify('Рад шуд', 'Аризаи шумо рад карда шуд', 'err');
  });

  socketClient.on('accept_ack', ({ ok, order }) => {
    if (ok && order) {
      const idx = myOrders.findIndex(o => o._id === order._id);
      if (idx >= 0) myOrders[idx] = order;
      renderCurrentTab();
    }
  });

  socketClient.on('deliver_ack', ({ ok, earned }) => {
    if (ok) {
      me.balance = (me.balance || 0) + earned;
      Store.set('courierData', me);
      updateBalDisp();
      notify('🎉 Супорида шуд!', `+${earned} смн ба ҳисоби шумо`, 'success');
    }
  });
}

// ══════════════════════════════════════════════════
// ONLINE TOGGLE
// ══════════════════════════════════════════════════
window.toggleOnline = function () {
  isOnline = !isOnline;
  document.getElementById('toggle').classList.toggle('on', isOnline);
  document.getElementById('statusTxt').textContent = isOnline ? 'Онлайн' : 'Офлайн';
  socketClient.emit('set_online', { isOnline });
  if (!isOnline) declinedIds.clear();
  notify('Ҳолат', isOnline ? 'Шумо онлайн ҳастед 🟢' : 'Шумо офлайн ҳастед ⚫', isOnline ? 'success' : 'info');
  renderCurrentTab();
};

// ══════════════════════════════════════════════════
// LOAD ORDERS FROM SERVER
// ══════════════════════════════════════════════════
async function loadOrders() {
  try {
    // Active orders for this courier
    const active = await API.get(`/orders?courierId=${me._id || me.id}&status=assigned,picked_up&limit=20`);
    myOrders = (active.orders || []).filter(o => !declinedIds.has(String(o._id)));

    // If online, also load new/unassigned orders
    if (isOnline) {
      const newOrd = await API.get('/orders?status=new&limit=20');
      const newFiltered = (newOrd.orders || []).filter(o =>
        !declinedIds.has(String(o._id)) && !myOrders.find(x => x._id === o._id)
      );
      myOrders = [...myOrders, ...newFiltered];
    }

    myOrders.sort((a, b) => b.createdAt - a.createdAt);
    renderCurrentTab();
    updateBalDisp();
  } catch (e) { console.warn('loadOrders:', e.message); }
}

async function loadHistory() {
  try {
    const { orders } = await API.get(`/orders?courierId=${me._id || me.id}&status=delivered,cancelled&limit=30`);
    myHistory = orders || [];
    myHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) { console.warn('loadHistory:', e.message); }
}

// ══════════════════════════════════════════════════
// ORDER CARDS
// ══════════════════════════════════════════════════
function loadOrdersTab() {
  const c = document.getElementById('mainContent');
  if (!isOnline) {
    c.innerHTML = `<div class="empty"><span class="empty-ico">⚡</span><h3>Онлайн шавед</h3><p>Барои заказ қабул кардан онлайн шавед</p></div>`;
    return;
  }

  const myActive = myOrders.filter(o => (o.courierId === (me._id || me.id) || o.courierId?._id === (me._id || me.id)) && ['assigned','picked_up'].includes(o.status));
  const newOrds  = myOrders.filter(o => o.status === 'new');

  let h = `<div class="bal-card"><div class="bal-title">Баланси шумо</div><div class="bal-amt">${me.balance || 0} смн</div></div>`;

  if (!myActive.length && !newOrds.length) {
    h += `<div class="empty"><span class="empty-ico">📭</span><h3>Заказе нест</h3><p>Дар интизори заказ...</p></div>`;
  }
  myActive.forEach(o => h += renderCard(o, true));
  newOrds.forEach(o  => h += renderCard(o, false));
  c.innerHTML = h;
}

function renderCard(o, isMine) {
  const isPicked  = o.status === 'picked_up';
  const isAssigned = o.status === 'assigned' && isMine;
  const isNew     = o.status === 'new';
  const gradient  = isMine ? 'linear-gradient(135deg,#10b981,#0d9488)' : 'linear-gradient(135deg,#4361ee,#3a56d4)';

  return `<div class="order-card" id="oc-${o._id}">
    <div class="order-head">
      <div class="order-icon" style="background:${gradient}"><i class="fas fa-box"></i></div>
      <div class="order-info">
        <h3>${isNew ? 'Закази нав' : isPicked ? 'Бардошта шуд' : 'Дар роҳ'}</h3>
        <p>Мизоҷ: ${sanitize(o.customerName || '—')} ${o.customerPhone ? '· ' + o.customerPhone : ''}</p>
      </div>
    </div>
    <div class="route-box">
      <div class="route-pt"><div class="pt-dot pick"></div><div><div class="pt-addr">${sanitize(o.fromAddress || '—')}</div><div class="pt-sub">Нуқтаи гирифтан</div></div></div>
      <div class="route-pt"><div class="pt-dot drop"></div><div><div class="pt-addr">${sanitize(o.toAddress || '—')}</div><div class="pt-sub">Нуқтаи расонидан</div></div></div>
    </div>
    <div class="order-meta">
      <div class="meta-item"><i class="fas fa-weight"></i><strong>${o.weight || 1} кг</strong></div>
      <div class="meta-item"><i class="fas fa-money-bill"></i><strong>${o.price || 0} смн</strong></div>
      ${o.receiverPhone ? `<div class="meta-item"><i class="fas fa-phone"></i><strong>${o.receiverPhone}</strong></div>` : ''}
      ${o.distanceKm ? `<div class="meta-item"><i class="fas fa-route"></i><strong>${o.distanceKm} км</strong></div>` : ''}
    </div>
    ${o.description && o.description !== '—' ? `<div style="font-size:13px;color:var(--gray);background:#f8fafc;padding:10px;border-radius:8px;margin-bottom:12px">📝 ${sanitize(o.description)}</div>` : ''}
    ${(o.receiverPodz || o.receiverFloor || o.receiverApart) ? `<div style="font-size:12px;color:var(--gray);background:#f1f5f9;padding:8px 10px;border-radius:8px;margin-bottom:10px">🏢 ${[o.receiverPodz ? 'Подъезд ' + o.receiverPodz : '', o.receiverFloor ? 'Ошёна ' + o.receiverFloor : '', o.receiverApart ? 'Хона ' + o.receiverApart : ''].filter(Boolean).join(' · ')}</div>` : ''}
    ${o.receiverIntercom ? `<div style="font-size:12px;color:var(--gray);margin-bottom:10px">🔑 Код: ${sanitize(o.receiverIntercom)}</div>` : ''}
    <div class="order-actions">
      ${isNew ? `
        <button class="btn-accept" onclick="acceptOrder('${o._id}')"><i class="fas fa-check"></i> Қабул кардан</button>
        <button class="btn-decline" onclick="declineOrder('${o._id}')"><i class="fas fa-times"></i></button>` : ''}
      ${isAssigned ? `<button class="btn-pickup" onclick="pickupOrder('${o._id}')"><i class="fas fa-box-open"></i> Борро гирифтам</button>` : ''}
      ${isPicked ? `<button class="btn-deliver" onclick="deliverOrder('${o._id}')"><i class="fas fa-check-circle"></i> Супорида шуд</button>` : ''}
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════
// ORDER ACTIONS via Socket.io
// ══════════════════════════════════════════════════
window.acceptOrder = function (oid) {
  socketClient.emit('accept_order', { orderId: oid });
  // Optimistic UI
  const o = myOrders.find(x => x._id === oid);
  if (o) { o.status = 'assigned'; o.courierName = me.name; o.courierId = me._id || me.id; }
  renderCurrentTab();
  notify('✅ Қабул шуд', 'Ба сӯи мизоҷ ҳаракат кунед', 'success');
};

window.declineOrder = function (oid) {
  declinedIds.add(String(oid));
  myOrders = myOrders.filter(o => o._id !== oid);
  socketClient.emit('decline_order', { orderId: oid });
  renderCurrentTab();
  notify('Рад кардед', 'Закази дигарро интизор шавед', 'info');
};

window.pickupOrder = function (oid) {
  socketClient.emit('pickup_order', { orderId: oid });
  const o = myOrders.find(x => x._id === oid);
  if (o) o.status = 'picked_up';
  renderCurrentTab();
  notify('📤 Гирифтед!', 'Акнун ба қабулкунанда расонед', 'success');
};

window.deliverOrder = function (oid) {
  if (!confirm('Оё заказ супорида шуд?')) return;
  socketClient.emit('deliver_order', { orderId: oid });
  // Optimistic UI
  const o = myOrders.find(x => x._id === oid);
  if (o) {
    o.status = 'delivered';
    myHistory.unshift(o);
    myOrders = myOrders.filter(x => x._id !== oid);
  }
  renderCurrentTab();
};

// ══════════════════════════════════════════════════
// HISTORY & STATS
// ══════════════════════════════════════════════════
async function loadHistTab() {
  await loadHistory();
  const c = document.getElementById('mainContent');
  let h = `<div class="bal-card"><div class="bal-title">Ҳамаи заказҳо</div><div class="bal-amt">${myHistory.length}</div></div>`;
  if (!myHistory.length) {
    h += `<div class="empty"><span class="empty-ico">📋</span><h3>Таърих холӣ аст</h3></div>`;
  } else {
    myHistory.forEach(o => {
      const ok = o.status === 'delivered';
      const d  = new Date(o.deliveredAt || o.updatedAt || o.createdAt).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      h += `<div class="hist-item">
        <div class="hist-info">
          <h4>${sanitize(o.fromAddress || '—')} → ${sanitize(o.toAddress || '—')}</h4>
          <p><i class="fas fa-user"></i> ${sanitize(o.customerName || '—')}</p>
          <p><i class="fas fa-clock"></i> ${d}</p>
          <p style="color:var(--success);font-weight:700">${o.price || 0} смн</p>
        </div>
        <span class="hist-badge ${ok ? 'hb-ok' : 'hb-no'}">${ok ? '✅ Расид' : '❌ Бекор'}</span>
      </div>`;
    });
  }
  c.innerHTML = h;
}

function loadStatsTab() {
  const total = me.totalOrders     || 0;
  const comp  = me.completedOrders || 0;
  const rate  = total ? ((comp / total) * 100).toFixed(0) : '0';
  document.getElementById('mainContent').innerHTML = `
    <div class="bal-card"><div class="bal-title">Баланси шумо</div><div class="bal-amt">${me.balance || 0} смн</div></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">Ҳамаи заказҳо</div></div>
      <div class="stat-card"><div class="stat-val">${comp}</div><div class="stat-lbl">Иҷрошуда</div></div>
      <div class="stat-card"><div class="stat-val">${myOrders.filter(o => (o.courierId === (me._id || me.id))).length}</div><div class="stat-lbl">Фаъол</div></div>
      <div class="stat-card"><div class="stat-val">${rate}%</div><div class="stat-lbl">Муваффақият</div></div>
    </div>`;
}

function renderCurrentTab() {
  if (currentTab === 'orders') loadOrdersTab();
  else if (currentTab === 'history') loadHistTab();
  else loadStatsTab();
}

window.switchTab = function (tab) {
  currentTab = tab;
  ['orders', 'history', 'stats'].forEach(t => {
    document.getElementById('nav' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('active', t === tab);
  });
  renderCurrentTab();
};

// ══════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════
function fillProfile() {
  if (!me) return;
  document.getElementById('pName').textContent  = sanitize(me.name  || '—');
  document.getElementById('pPhone').textContent = sanitize(me.phone || '—');
  document.getElementById('pUser').textContent  = '@' + sanitize(me.username || '—');
  document.getElementById('pVeh').textContent   = (VEH[me.vehicle] || '🏍️') + ' ' + (me.vehicle || '—');
  document.getElementById('pOrders').textContent = me.totalOrders || 0;
  document.getElementById('pComp').textContent   = me.completedOrders || 0;
  document.getElementById('pBal').textContent    = (me.balance || 0) + ' смн';
}
function updateBalDisp() {
  document.getElementById('balDisp').textContent = (me?.balance || 0) + ' смн';
  fillProfile();
}
window.openProfile  = function () { fillProfile(); document.getElementById('profileModal').classList.add('active'); };
window.closeProfile = function () { document.getElementById('profileModal').classList.remove('active'); };
document.getElementById('profileModal')?.addEventListener('click', e => { if (e.target.id === 'profileModal') closeProfile(); });

// ══════════════════════════════════════════════════
// MAP + GPS
// ══════════════════════════════════════════════════
function initMap() {
  if (map) return;
  map = L.map('map').setView([DEF.lat, DEF.lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© TojRason' }).addTo(map);
}

let _lastLocSend = 0;
function trackLoc() {
  if (!navigator.geolocation) { moveMark(DEF.lat, DEF.lng); return; }
  wId = navigator.geolocation.watchPosition(
    p  => moveMark(p.coords.latitude, p.coords.longitude),
    () => moveMark(DEF.lat, DEF.lng),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
  );
}

function moveMark(la, ln) {
  const ico = L.divIcon({
    className: '',
    html: '<div style="background:#4361ee;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>',
    iconSize: [20, 20]
  });
  if (cMark) cMark.setLatLng([la, ln]);
  else { cMark = L.marker([la, ln], { icon: ico, zIndexOffset: 1000 }).addTo(map); map.setView([la, ln], 14); }

  // Send to server every 4s when online
  const now = Date.now();
  if (isOnline && (now - _lastLocSend) > 4000) {
    _lastLocSend = now;
    socketClient.emit('location_update', { lat: la, lng: ln });
  }
}
window.centerMe = function () { if (cMark) { const p = cMark.getLatLng(); map.setView([p.lat, p.lng], 16); } };

// ══════════════════════════════════════════════════
// PHOTO UPLOAD
// ══════════════════════════════════════════════════
function setupFileInputs() {
  [['inCamFace','face'],['inGalFace','face'],['inCamPassport','passport'],['inGalPassport','passport']]
    .forEach(([id, type]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', e => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setPhoto(type, ev.target.result);
        reader.readAsDataURL(file);
        e.target.value = '';
      });
    });
}

window.pickPhoto = function (type, mode) {
  const m = { face: { cam: 'inCamFace', gal: 'inGalFace' }, passport: { cam: 'inCamPassport', gal: 'inGalPassport' } };
  document.getElementById(m[type][mode])?.click();
};
function setPhoto(type, data) {
  photos[type] = data;
  const k = type.charAt(0).toUpperCase() + type.slice(1);
  document.getElementById('img' + k).src = data;
  document.getElementById('prev' + k).style.display = 'block';
}
window.removePhoto = function (type) {
  photos[type] = null;
  const k = type.charAt(0).toUpperCase() + type.slice(1);
  document.getElementById('prev' + k).style.display = 'none';
  document.getElementById('img' + k).src = '';
};

// ══════════════════════════════════════════════════
// NOTIFY
// ══════════════════════════════════════════════════
function notify(title, msg, type) {
  const el     = document.getElementById('notif');
  const colors = { success: 'var(--success)', err: 'var(--danger)', info: 'var(--primary)' };
  const icons  = { success: '✅', err: '❌', info: 'ℹ️' };
  el.style.borderLeftColor = colors[type] || colors.info;
  document.getElementById('notifIco').textContent   = icons[type] || '🔔';
  document.getElementById('notifTitle').textContent = title;
  document.getElementById('notifText').textContent  = msg;
  el.classList.add('show');
  clearTimeout(notifTO);
  notifTO = setTimeout(() => el.classList.remove('show'), 4000);
}

function gv(id) { return document.getElementById(id)?.value?.trim() || ''; }
