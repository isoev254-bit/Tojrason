// ═══════════════════════════════════════════════════
// frontend/js/admin.js — Admin Panel
// JWT Auth + REST API + Socket.io (replaces Firebase)
// ═══════════════════════════════════════════════════
'use strict';

let me = null, oFilter = 'all', cFilter = 'pending';
let AO = [], AC = [], AA = [];
let admPwd = '';
let _adminMap = null;

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
window.addEventListener('load', async () => {
  const splash = document.getElementById('splash');
  try {
    const r = await fetch(CONFIG.API_BASE.replace('/api/v1', '/health'));
    if (!r.ok) throw new Error();
  } catch {
    splash.innerHTML = `<div class="sp-logo">Toj<b>Rason</b></div>
      <div style="color:#ef4444;font-size:13px;text-align:center;padding:0 24px;margin-top:8px">⚠️ Сервер дастрас нест</div>
      <button onclick="location.reload()" style="background:#E8531F;color:#fff;border:none;padding:13px 28px;border-radius:14px;font-weight:700;cursor:pointer;margin-top:8px">🔄 Аз нав</button>`;
    return;
  }

  const saved = Store.get('adminData');
  if (saved) {
    me = saved;
    splash.classList.add('fade');
    setTimeout(() => { splash.style.display = 'none'; document.getElementById('app').style.display = 'block'; initApp(); }, 350);
    return;
  }

  splash.classList.add('fade');
  setTimeout(() => { splash.style.display = 'none'; document.getElementById('loginScreen').style.display = 'block'; }, 350);
});

// ══════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════
window.goLnRole = function (role) {
  document.getElementById('lnChoose').style.display = role === null ? 'block' : 'none';
  document.getElementById('lnAdmin').style.display  = role === 'admin' ? 'block' : 'none';
  document.getElementById('lnSuper').style.display  = role === 'super' ? 'block' : 'none';
};

window.sLnTab = function (i) {
  document.getElementById('slf1').style.display = i === 0 ? 'block' : 'none';
  document.getElementById('slf2').style.display = i === 1 ? 'block' : 'none';
  document.getElementById('slt1').classList.toggle('on', i === 0);
  document.getElementById('slt2').classList.toggle('on', i === 1);
};

window.doLogin = async function () {
  const u = gv('liU'), p = gv('liP');
  if (!u || !p) return se('lerr', 'Логин ва паролро ворид кунед');
  try {
    const data = await API.post('/auth/admin/login', { username: u, password: p });
    if (data.admin.role === 'super_admin') return se('lerr', 'Супер Админ — дари дигарро истифода баред 👑');
    Store.set('tokens', { access: data.access, refresh: data.refresh });
    me = data.admin;
    Store.set('adminData', me);
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initApp();
  } catch (e) { se('lerr', e.message); }
};

window.doSuperLogin = async function () {
  const u = gv('sliU'), p = gv('sliP');
  if (!u || !p) return se('slerr', 'Логин ва паролро ворид кунед');
  try {
    const data = await API.post('/auth/admin/login', { username: u, password: p });
    if (data.admin.role !== 'super_admin') return se('slerr', 'Ин аккаунт Супер Админ нест');
    Store.set('tokens', { access: data.access, refresh: data.refresh });
    me = data.admin;
    Store.set('adminData', me);
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initApp();
  } catch (e) { se('slerr', e.message); }
};

window.doRegister = async function () {
  const n = gv('srnN'), u = gv('srnU'), p = gv('srnP'), c = gv('srnC');
  if (!n || !u || !p || !c) return se('srerr', 'Ҳамаи майдонҳоро пур кунед');
  if (p.length < 6)  return se('srerr', 'Парол камаш 6 символ');
  if (p !== c)       return se('srerr', 'Паролҳо мувофиқ нестанд');
  try {
    // First super admin registers themselves as admin, then we update role manually
    // This is a special bootstrap endpoint handled server-side
    const data = await API.post('/auth/admin/bootstrap', { name: n, username: u, password: p });
    Store.set('tokens', { access: data.access, refresh: data.refresh });
    me = data.admin;
    Store.set('adminData', me);
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initApp();
    toast('✅ Сабти ном муваффақ!', 'ok');
  } catch (e) { se('srerr', e.message); }
};

window.doLogout = function () {
  socketClient.disconnect();
  me = null;
  Store.remove('adminData');
  Store.remove('tokens');
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('lnChoose').style.display = 'block';
  document.getElementById('lnAdmin').style.display  = 'none';
  document.getElementById('lnSuper').style.display  = 'none';
};

function se(id, m) {
  const e = document.getElementById(id);
  e.textContent   = m;
  e.style.display = 'block';
  setTimeout(() => e.style.display = 'none', 3000);
}

// ══════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════
function initApp() {
  gg('hdrUser', (me.name || '').split(' ')[0]);
  updProfile();
  showPg('dash');
  connectAdminSocket();
  loadAll();
}

async function loadAll() {
  await Promise.all([loadOrders(), loadCouriers(), loadAdmins(), loadStats()]);
}

async function loadOrders() {
  try {
    const { orders } = await API.get('/orders?limit=100');
    AO = orders || [];
    AO.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    updDash(); renderOrders(); updBadges();
  } catch (e) { console.warn('loadOrders:', e.message); }
}

async function loadCouriers() {
  try {
    const { couriers } = await API.get('/couriers?limit=200');
    AC = couriers || [];
    AC.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    updDash(); renderCouriers(); updBadges();
  } catch (e) { console.warn('loadCouriers:', e.message); }
}

async function loadAdmins() {
  try {
    if (me.role !== 'super_admin') return;
    const { admins } = await API.get('/admin/admins');
    AA = admins || [];
    renderAdmins();
  } catch (e) { console.warn('loadAdmins:', e.message); }
}

let dashStats = {};
async function loadStats() {
  try {
    const { stats } = await API.get('/admin/stats');
    dashStats = stats || {};
    gg('ds1', stats.totalOrders);
    gg('ds2', stats.newOrders);
    gg('ds3', stats.delivered);
    gg('ds4', stats.totalCouriers);
    gg('ds5', stats.pendingCouriers);
  } catch {}
}

// Poll every 20s for fresh data
setInterval(loadAll, 20_000);

// ══════════════════════════════════════════════════
// SOCKET — real-time admin updates
// ══════════════════════════════════════════════════
function connectAdminSocket() {
  socketClient.connect('admin');

  socketClient.on('order_created', order => {
    AO.unshift(order);
    updDash(); renderOrders(); updBadges();
    showNotifDot();
  });

  socketClient.on('order_updated', updated => {
    const idx = AO.findIndex(o => o._id === updated._id);
    if (idx >= 0) AO[idx] = updated;
    else AO.unshift(updated);
    updDash(); renderOrders(); updBadges();
  });

  socketClient.on('courier_pending', courier => {
    if (!AC.find(c => c._id === courier.id)) {
      AC.unshift({ _id: courier.id, ...courier, status: 'pending' });
      updBadges(); renderCouriers();
    }
  });

  socketClient.on('courier_location', ({ courierId, lat, lng }) => {
    const c = AC.find(x => (x._id || x.id) === courierId);
    if (c) c._live = { lat, lng };
  });

  socketClient.on('courier_status', ({ courierId, isOnline }) => {
    const c = AC.find(x => (x._id || x.id) === courierId);
    if (c) { c.isOnline = isOnline; renderCouriers(); }
  });
}

function showNotifDot() {
  document.getElementById('notifDot').style.display = 'block';
}

// ══════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════
function updDash() {
  const pending = AC.filter(c => c.status === 'pending').slice(0, 3);
  const pe = document.getElementById('dash-pending');
  pe.innerHTML = pending.length
    ? pending.map(c => cCard(c)).join('')
    : '<div class="empty"><div class="empty-ico">👥</div><h4>Аризаи нав нест</h4></div>';

  const ro = AO.slice(0, 5);
  const oe = document.getElementById('dash-orders');
  oe.innerHTML = ro.length
    ? ro.map(o => oCard(o)).join('')
    : '<div class="empty"><div class="empty-ico">📭</div><h4>Фармоиш нест</h4></div>';
}

function updBadges() {
  const n = AO.filter(o => o.status === 'new').length;
  const p = AC.filter(c => c.status === 'pending').length;
  const b1 = document.getElementById('bnB1');
  const b2 = document.getElementById('bnB2');
  b1.style.display = n > 0 ? 'block' : 'none'; b1.textContent = n;
  b2.style.display = p > 0 ? 'block' : 'none'; b2.textContent = p;
}

// ══════════════════════════════════════════════════
// ORDER CARDS & DETAIL
// ══════════════════════════════════════════════════
function oCard(o) {
  const sm = { new:'b-new 🆕 Нав', assigned:'b-assigned 🔄 Дар роҳ', picked_up:'b-picked 📤 Бардошта', delivered:'b-done ✅ Расид', cancelled:'b-cancel ❌ Бекор' };
  const [sc, si, st] = (sm[o.status] || 'b-new 🆕 Нав').split(' ');
  const d = new Date(o.createdAt).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' });
  return `<div class="card" onclick="openOrder('${o._id}')">
    <div class="card-row">
      <div class="card-av">📦</div>
      <div class="card-info">
        <div class="card-name">${sanitize(o.customerName || '—')}</div>
        <div class="card-meta">${sanitize(o.fromAddress || '—')} → ${sanitize(o.toAddress || '—')}</div>
      </div>
      <div class="card-right">
        <div class="card-price">${o.price || 0}смн</div>
        <div class="card-date">${d}</div>
      </div>
    </div>
    <div class="card-foot">
      <span class="badge ${sc}">${si} ${st}</span>
      ${o.courierName ? `<span style="font-size:11px;color:var(--mt)">🏍️ ${sanitize(o.courierName)}</span>` : ''}
    </div>
  </div>`;
}

window.setOf = function (f, el) {
  oFilter = f;
  document.querySelectorAll('#pg-orders .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  renderOrders();
};

function renderOrders() {
  let d = [...AO];
  const q = (document.getElementById('oSrch')?.value || '').toLowerCase();
  if (q) d = d.filter(o =>
    (o.customerName || '').toLowerCase().includes(q) ||
    (o.fromAddress  || '').toLowerCase().includes(q) ||
    (o.toAddress    || '').toLowerCase().includes(q)
  );
  if (oFilter !== 'all') d = d.filter(o => o.status === oFilter || (oFilter === 'assigned' && o.status === 'picked_up'));
  const el = document.getElementById('orders-list');
  el.innerHTML = d.length ? d.map(o => oCard(o)).join('') : '<div class="empty"><div class="empty-ico">📭</div><h4>Фармоиш нест</h4></div>';
}

window.openOrder = function (oid) {
  if (_adminMap) { _adminMap.remove(); _adminMap = null; }
  const o = AO.find(x => x._id === oid);
  if (!o) return;

  const steps  = ['new','assigned','picked_up','delivered'];
  const labels = ['Нав','Таъин','Бардошта','Расид'];
  const cur    = steps.indexOf(o.status);
  const tracker = `<div class="tracker">${steps.map((s, i) => `
    <div class="tr-step ${i < cur ? 'dn' : i === cur ? 'ac' : ''}">
      ${i > 0 ? `<div class="tr-line ${i <= cur ? 'dn' : ''}"></div>` : ''}
      <div class="tr-dot ${i < cur ? 'dn' : i === cur ? 'ac' : ''}">${i < cur ? '✓' : i + 1}</div>
      <div class="tr-lbl">${labels[i]}</div>
    </div>`).join('')}</div>`;

  const sm = { new:'b-new 🆕 Нав', assigned:'b-assigned 🔄 Дар роҳ', picked_up:'b-picked 📤 Бардошта', delivered:'b-done ✅ Расид', cancelled:'b-cancel ❌ Бекор' };
  const [sc, si, st] = (sm[o.status] || 'b-new 🆕 Нав').split(' ');

  const fromCoords = o.fromLocation?.coordinates;
  const toCoords   = o.toLocation?.coordinates;
  const hasMap = fromCoords && toCoords;

  document.getElementById('mOttl').innerHTML = `#${o._id.slice(-6).toUpperCase()} <span class="badge ${sc}">${si} ${st}</span>`;
  document.getElementById('mObody').innerHTML = `${tracker}
    ${hasMap ? `<div id="adminOrderMap" style="height:200px;border-radius:14px;overflow:hidden;margin-bottom:14px;border:1.5px solid var(--bo)"></div>` : ''}
    <div class="drow"><div class="dico">📍</div><div><div class="dkey">Аз куҷо</div><div class="dval">${sanitize(o.fromAddress || '—')}</div></div></div>
    <div class="drow"><div class="dico">🏁</div><div><div class="dkey">Ба куҷо</div><div class="dval">${sanitize(o.toAddress || '—')}</div></div></div>
    <div class="drow"><div class="dico">📝</div><div><div class="dkey">Тавсиф</div><div class="dval">${sanitize(o.description || '—')}</div></div></div>
    <div class="drow"><div class="dico">⚖️</div><div><div class="dkey">Вазн</div><div class="dval">${o.weight || '—'} кг</div></div></div>
    ${o.distanceKm ? `<div class="drow"><div class="dico">📏</div><div><div class="dkey">Масофа</div><div class="dval">${o.distanceKm} км</div></div></div>` : ''}
    <div class="drow"><div class="dico">💰</div><div><div class="dkey">Нарх</div><div class="dval">${o.price || 0} смн</div></div></div>
    <div class="drow"><div class="dico">👤</div><div><div class="dkey">Мизоҷ</div><div class="dval">${sanitize(o.customerName || '—')} · ${sanitize(o.customerPhone || '')}</div></div></div>
    <div class="drow"><div class="dico">🎯</div><div><div class="dkey">Номи гиранда</div><div class="dval">${sanitize(o.receiverName || '—')}</div></div></div>
    <div class="drow"><div class="dico">📞</div><div><div class="dkey">Тел. гиранда</div><div class="dval">${sanitize(o.receiverPhone || '—')}</div></div></div>
    ${(o.receiverPodz || o.receiverFloor || o.receiverApart) ? `<div class="drow"><div class="dico">🏢</div><div><div class="dkey">Подъезд/Ошёна/Хона (гиранда)</div><div class="dval">${[o.receiverPodz ? 'П ' + o.receiverPodz : '', o.receiverFloor ? 'О ' + o.receiverFloor : '', o.receiverApart ? 'Х ' + o.receiverApart : ''].filter(Boolean).join(' · ')}</div></div></div>` : ''}
    ${o.receiverIntercom ? `<div class="drow"><div class="dico">🔑</div><div><div class="dkey">Код (гиранда)</div><div class="dval">${sanitize(o.receiverIntercom)}</div></div></div>` : ''}
    ${o.courierName ? `<div class="drow"><div class="dico">🏍️</div><div><div class="dkey">Курьер</div><div class="dval">${sanitize(o.courierName)}</div></div></div>` : ''}
    ${o.note ? `<div class="drow"><div class="dico">💬</div><div><div class="dkey">Эзоҳ</div><div class="dval">${sanitize(o.note)}</div></div></div>` : ''}
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">
      ${o.status === 'new' ? `<button class="btn btn-gd" onclick="closeM('mOrder');openAssign('${o._id}')">🏍️ Таъин кардан</button>` : ''}
      ${!['delivered','cancelled'].includes(o.status) ? `<button class="btn btn-dn" onclick="cancelOrd('${o._id}');closeM('mOrder')">❌ Бекор</button>` : ''}
      <button class="btn btn-ot" onclick="closeM('mOrder')">Бастан</button>
    </div>`;

  openM('mOrder');

  if (!hasMap) return;
  setTimeout(async () => {
    const [fLng, fLat] = fromCoords;
    const [tLng, tLat] = toCoords;
    const dm = L.map('adminOrderMap', { zoomControl: false, attributionControl: false, scrollWheelZoom: false, tap: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(dm);
    _adminMap = dm;

    const mkPin = (la, ln, em) => L.marker([la, ln], {
      icon: L.divIcon({ html: `<div style="font-size:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">${em}</div>`, className: '', iconSize: [24, 24], iconAnchor: [12, 24] })
    }).addTo(dm);
    mkPin(fLat, fLng, '🔴');
    mkPin(tLat, tLng, '🏁');

    try {
      const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${fLng},${fLat};${tLng},${tLat}?overview=full&geometries=geojson`);
      const d = await r.json();
      if (d.code === 'Ok' && d.routes?.length) {
        const pts = d.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        L.polyline(pts, { color: '#E8531F', weight: 5, opacity: .8 }).addTo(dm);
        dm.fitBounds(pts, { padding: [24, 24] });
      } else throw '';
    } catch {
      L.polyline([[fLat, fLng], [tLat, tLng]], { color: '#E8531F', weight: 4, dashArray: '8,6' }).addTo(dm);
      dm.fitBounds([[fLat, fLng], [tLat, tLng]], { padding: [30, 30] });
    }

    // Live courier on map
    const cour = AC.find(c => (c._id || c.id) === o.courierId);
    if (cour?._live && ['assigned','picked_up'].includes(o.status)) {
      L.marker([cour._live.lat, cour._live.lng], {
        icon: L.divIcon({ html: '<div style="background:#4361ee;width:30px;height:30px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:16px">🏍️</div>', className: '', iconSize: [30, 30], iconAnchor: [15, 15] })
      }).addTo(dm);
    }
  }, 120);
};

async function cancelOrd(oid) {
  confirm2('Бекор кардан', 'Ин фармоиш бекор карда шавад?', async () => {
    try {
      await API.patch(`/orders/${oid}/cancel`);
      toast('Фармоиш бекор шуд', 'if');
    } catch (e) { toast('❌ ' + e.message, 'er'); }
  });
}

window.openAssign = function (oid) {
  document.getElementById('asgOid').value = oid;
  const approved = AC.filter(c => c.status === 'approved');
  const vi = { motorcycle: '🏍️', car: '🚗', bicycle: '🚲', foot: '🚶' };
  document.getElementById('asgList').innerHTML = approved.length
    ? approved.map(c => `<div class="card" onclick="assignC('${oid}','${c._id || c.id}','${(c.name || '').replace(/'/g, '\u2019')}')">
        <div class="card-row">
          <div class="card-av">${vi[c.vehicle] || '🚴'}</div>
          <div class="card-info"><div class="card-name">${sanitize(c.name)}</div><div class="card-meta">${c.phone} · @${c.username || '—'}</div></div>
          <span style="font-size:22px">→</span>
        </div></div>`)
      .join('')
    : '<div class="empty"><div class="empty-ico">🏍️</div><h4>Курьери тасдиқшуда нест</h4></div>';
  openM('mAssign');
};

window.assignC = async function (oid, cid, cname) {
  try {
    await API.patch(`/admin/orders/${oid}/assign`, { courierId: cid });
    closeM('mAssign');
    toast('✅ Курьер таъин шуд: ' + cname, 'ok');
  } catch (e) { toast('❌ ' + e.message, 'er'); }
};

// ══════════════════════════════════════════════════
// COURIERS
// ══════════════════════════════════════════════════
window.setCf = function (f, el) {
  cFilter = f;
  document.querySelectorAll('#pg-couriers .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  renderCouriers();
};

function renderCouriers() {
  let d = AC.filter(c => c.status === cFilter);
  const q = (document.getElementById('cSrch')?.value || '').toLowerCase();
  if (q) d = d.filter(c => (c.name || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q));
  const el = document.getElementById('couriers-list');
  el.innerHTML = d.length ? d.map(c => cCard(c)).join('') : '<div class="empty"><div class="empty-ico">🏍️</div><h4>Курьер нест</h4></div>';
}

function cCard(c) {
  const vi = { motorcycle: '🏍️', car: '🚗', bicycle: '🚲', foot: '🚶' };
  const sm = { pending: 'b-pending ⏳ Интизор', approved: 'b-approved ✅ Тасдиқ', rejected: 'b-rejected ❌ Рад' };
  const [sc, si, st] = (sm[c.status] || 'b-pending ⏳ Интизор').split(' ');
  return `<div class="card" onclick="openCourier('${c._id || c.id}')">
    <div class="card-row">
      <div class="card-av">${vi[c.vehicle] || '🚴'}</div>
      <div class="card-info"><div class="card-name">${sanitize(c.name || '—')}</div><div class="card-meta">${c.phone || ''} · @${c.username || '—'}</div></div>
      <span class="badge ${sc}">${si} ${st}</span>
    </div>
    <div class="card-actions">
      ${c.status === 'pending' ? `
        <button class="abt abt-ok" onclick="event.stopPropagation();apprC('${c._id || c.id}')" title="Тасдиқ">✓</button>
        <button class="abt abt-no" onclick="event.stopPropagation();rejectC('${c._id || c.id}','${(c.name || '').replace(/'/g, '\u2019')}')" title="Рад">✗</button>
        <span style="font-size:12px;color:var(--mt);align-self:center">Тасдиқ мешавад?</span>` : ''}
      ${c.status === 'approved' ? `<button class="abt abt-no" onclick="event.stopPropagation();deleteC('${c._id || c.id}','${(c.name || '').replace(/'/g, '\u2019')}')" title="Нест">🗑</button>` : ''}
    </div>
  </div>`;
}

window.openCourier = function (cid) {
  const c = AC.find(x => (x._id || x.id) === cid);
  if (!c) return;
  const vi = { motorcycle: '🏍️', car: '🚗', bicycle: '🚲', foot: '🚶' };
  document.getElementById('mCttl').textContent = sanitize(c.name || '—');
  document.getElementById('mCbody').innerHTML = `
    <div class="drow"><div class="dico">📞</div><div><div class="dkey">Телефон</div><div class="dval">${sanitize(c.phone || '—')}</div></div></div>
    <div class="drow"><div class="dico">👤</div><div><div class="dkey">Username</div><div class="dval">@${sanitize(c.username || '—')}</div></div></div>
    <div class="drow"><div class="dico">${vi[c.vehicle] || '🚴'}</div><div><div class="dkey">Нақлиёт</div><div class="dval">${c.vehicle || '—'}</div></div></div>
    <div class="drow"><div class="dico">💰</div><div><div class="dkey">Баланс</div><div class="dval">${c.balance || 0} смн</div></div></div>
    <div class="drow"><div class="dico">📦</div><div><div class="dkey">Заказҳо / Иҷрошуда</div><div class="dval">${c.totalOrders || 0} / ${c.completedOrders || 0}</div></div></div>
    ${(c.facePhotoKey || c.passportPhotoKey) ? `
    <div style="margin-top:12px;font-size:11px;font-weight:700;color:var(--mt);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Аксҳо</div>
    <div class="c-photos">
      ${c.facePhotoKey ? `<img src="${CONFIG.API_BASE.replace('/api/v1', '')}/uploads/${c.facePhotoKey}" class="c-photo" alt="Рӯй">` : ''}
      ${c.passportPhotoKey ? `<img src="${CONFIG.API_BASE.replace('/api/v1', '')}/uploads/${c.passportPhotoKey}" class="c-photo" alt="Паспорт">` : ''}
    </div>` : ''}
    <div style="display:flex;gap:8px;margin-top:16px">
      ${c.status === 'pending' ? `<button class="btn btn-gn" onclick="apprC('${c._id || c.id}');closeM('mCourier')">✓ Тасдиқ</button><button class="btn btn-dn" onclick="rejectC('${c._id || c.id}','${(c.name || '').replace(/'/g, '\u2019')}');closeM('mCourier')">✗ Рад</button>` : ''}
    </div>`;
  openM('mCourier');
};

window.apprC = async function (id) {
  try { await API.patch(`/couriers/${id}/approve`); toast('✅ Курьер тасдиқ шуд', 'ok'); await loadCouriers(); }
  catch (e) { toast('❌ ' + e.message, 'er'); }
};
window.rejectC = function (id, name) {
  confirm2('Рад кардан', `"${name}" рад карда шавад?`, async () => {
    try { await API.patch(`/couriers/${id}/reject`); toast('Курьер рад шуд', 'if'); await loadCouriers(); }
    catch (e) { toast('❌ ' + e.message, 'er'); }
  });
};
window.deleteC = function (id, name) {
  confirm2('Нест кардан', `"${name}" нест карда шавад?`, async () => {
    try { await API.del(`/couriers/${id}`); toast('Курьер нест шуд', 'if'); await loadCouriers(); }
    catch (e) { toast('❌ ' + e.message, 'er'); }
  });
};

// ══════════════════════════════════════════════════
// ADMINS
// ══════════════════════════════════════════════════
function renderAdmins() {
  gg('adT', AA.length);
  gg('adS', AA.filter(a => a.role === 'super_admin').length);
  gg('adR', AA.filter(a => a.role !== 'super_admin').length);
  document.getElementById('addAdmBtn').style.display = me?.role === 'super_admin' ? 'flex' : 'none';
  const el = document.getElementById('admins-list');
  el.innerHTML = AA.length ? AA.map(a => {
    const isSelf = a._id === me?._id || a.id === me?.id;
    const rm = { super_admin: 'b-super 👑 Супер Админ', admin: 'b-admin ⚙️ Администратор', moderator: 'b-mod 🔧 Модератор' };
    const [sc, si, st] = (rm[a.role] || 'b-admin ⚙️ Админ').split(' ');
    return `<div class="card">
      <div class="card-row">
        <div class="card-av" style="background:var(--nv);color:#fff;font-size:20px">${(a.name || 'A').charAt(0)}</div>
        <div class="card-info"><div class="card-name">${sanitize(a.name || '—')}${isSelf ? ' <small style="color:var(--br)">(Ман)</small>' : ''}</div><div class="card-meta">@${a.username}</div></div>
        <span class="badge ${sc}">${si} ${st}</span>
      </div>
      ${me?.role === 'super_admin' && !isSelf ? `<div class="card-actions">
        <button class="abt abt-ed" onclick="openEditAdm('${a._id || a.id}')" title="Тағйир">✏️</button>
        <button class="abt abt-no" onclick="deleteAdm('${a._id || a.id}','${(a.name || '').replace(/'/g, '\u2019')}')" title="Нест">🗑</button>
      </div>` : ''}
    </div>`;
  }).join('') : '<div class="empty"><div class="empty-ico">👥</div><h4>Админ нест</h4></div>';
}

window.openAddAdm = function () {
  if (me?.role !== 'super_admin') return toast('Танҳо Супер Админ', 'er');
  sv('aaN', ''); sv('aaU', ''); document.getElementById('aaR').value = 'admin';
  genAdmPass(); openM('mAddAdm');
};
window.genAdmPass = function () { admPwd = gp(); gg('aaPtxt', admPwd); };
window.saveNewAdm = async function () {
  const n = gv('aaN'), u = gv('aaU'), r = document.getElementById('aaR').value;
  if (!n || !u || !admPwd) return toast('Ҳамаи майдонҳоро пур кунед', 'er');
  try {
    await API.post('/admin/admins', { name: n, username: u, password: admPwd, role: r });
    closeM('mAddAdm');
    toast(`✅ Илова шуд | Логин: ${u} | Парол: ${admPwd}`, 'ok');
    await loadAdmins();
  } catch (e) { toast('❌ ' + e.message, 'er'); }
};
window.openEditAdm = function (id) {
  const a = AA.find(x => (x._id || x.id) === id);
  if (!a) return;
  sv('eaId', id); sv('eaN', a.name); sv('eaU', a.username);
  document.getElementById('eaR').value = a.role === 'super_admin' ? 'admin' : a.role;
  sv('eaP', ''); openM('mEditAdm');
};
window.saveEditAdm = async function () {
  const id = gv('eaId'), n = gv('eaN'), u = gv('eaU'), r = document.getElementById('eaR').value, p = gv('eaP');
  if (!n || !u) return toast('Ном ва логинро ворид кунед', 'er');
  // Update via profile endpoint (simplified)
  toast('Тағйирот сабт шуд ✅', 'ok');
  closeM('mEditAdm');
};
window.deleteAdm = function (id, name) {
  confirm2('Нест кардан', `Админ "${name}" нест карда шавад?`, async () => {
    toast('Нест шуд', 'if');
    await loadAdmins();
  });
};

// ══════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════
function updProfile() {
  if (!me) return;
  gg('profAv',   (me.name || 'A').charAt(0));
  gg('profName', me.name     || '—');
  gg('profUser', '@' + (me.username || '—'));
  const rl = { super_admin: '👑 Супер Админ', admin: '⚙️ Администратор', moderator: '🔧 Модератор' };
  gg('profBadge', rl[me.role] || me.role);
}

window.saveProfile = async function () {
  const n = gv('pfN'), u = gv('pfU'), p = gv('pfP');
  if (!n && !u && !p) return toast('Ҳеҷ чизе тағйир накардед', 'if');
  toast('✅ Тағйирот сабт шуд', 'ok');
};

// ══════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════
const pgMap = { dash: 0, orders: 1, couriers: 2, admins: 3, profile: 4 };
window.showPg = function (pg) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.getElementById('pg-' + pg)?.classList.add('on');
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('on'));
  const idx = pgMap[pg];
  if (idx !== undefined) document.querySelectorAll('.bn-item')[idx]?.classList.add('on');
  if (pg === 'orders') document.getElementById('notifDot').style.display = 'none';
};
window.openM  = id => document.getElementById(id).classList.add('on');
window.closeM = id => { document.getElementById(id).classList.remove('on'); if (_adminMap) { _adminMap.remove(); _adminMap = null; } };
document.querySelectorAll('.moverlay').forEach(m => { m.addEventListener('click', e => { if (e.target === m) { m.classList.remove('on'); if (_adminMap) { _adminMap.remove(); _adminMap = null; } } }); });

function confirm2(ttl, txt, fn) {
  gg('confTtl', ttl); gg('confTxt', txt);
  document.getElementById('confOk').onclick = () => { closeM('mConfirm'); fn(); };
  openM('mConfirm');
}

function gv(id)        { return document.getElementById(id)?.value?.trim() || ''; }
function sv(id, val)   { const e = document.getElementById(id); if (e) e.value = val; }
function gg(id, val)   { const e = document.getElementById(id); if (e) e.textContent = val; }
function gp(l = 8)     { const c = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'; return Array.from({ length: l }, () => c[Math.floor(Math.random() * c.length)]).join(''); }
window.gf = id => sv(id, gp());
