/* ═══════════════════════════════════════════
   Tojrason Delivery — Courier Panel App
   Express Courier — Мантиқи асосӣ
   ═══════════════════════════════════════════ */

var ME = { id: 1, name: "Алишер Раҳимов", phone: "+992 90 123 45 67" };
var CENTER = [38.560, 68.785];
var isOnline = false;
var isExpanded = false;

// ── TILE LAYERS ──
var darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© OSM © CartoDB', subdomains: 'abcd', maxZoom: 19
});
var lightTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© OSM © CartoDB', subdomains: 'abcd', maxZoom: 19
});

var map = L.map('map', { zoomControl: false }).setView(CENTER, 13);
darkTile.addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);

// ── STATE ──
var ORDERS = [
  { id: 1, from: "Бозори Баракат, Душанбе", to: "кӯч. Сомонӣ 15", fC: [38.568, 68.772], tC: [38.545, 68.777], wt: 5, cargo: "📦 Баста", dist: "2.3 км", price: "10 сомонӣ", fP: "+992 90 111 22 33", tP: "+992 90 445 66 77", status: "pending", cid: null, geom: null, step: 0 },
  { id: 2, from: "Истгоҳи Айнӣ, Душанбе", to: "хиёб. Рӯдакӣ 45", fC: [38.562, 68.790], tC: [38.575, 68.805], wt: 12, cargo: "🏋️ Вазнин", dist: "4.1 км", price: "19 сомонӣ", fP: "+992 92 765 43 21", tP: "+992 98 765 43 21", status: "pending", cid: null, geom: null, step: 0 },
  { id: 3, from: "Душанбе Молл, Сомонӣ", to: "мкр. Зарнисор 12а", fC: [38.582, 68.762], tC: [38.553, 68.748], wt: 3, cargo: "🛒 Хариди хурд", dist: "3.7 км", price: "15 сомонӣ", fP: "+992 93 321 65 54", tP: "+992 77 654 32 10", status: "pending", cid: null, geom: null, step: 0 }
];

var rLayer = null, fMark = null, tMark = null;
var cMarks = {}, cTimers = {};
var pendingMarks = {};
var activeId = null;

// ── ICONS ──
function mkIcon(color, fa, size) {
  size = size || 36;
  return L.divIcon({
    html: '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.4),0 0 14px ' + color + '66"><i class="fas ' + fa + '" style="color:#fff;font-size:' + (size * 0.38) + 'px"></i></div>',
    iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -(size / 2 + 4)]
  });
}

function mkIconLight(color, fa, size) {
  size = size || 36;
  return L.divIcon({
    html: '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,.25),0 0 10px ' + color + '88"><i class="fas ' + fa + '" style="color:#fff;font-size:' + (size * 0.38) + 'px"></i></div>',
    iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -(size / 2 + 4)]
  });
}

function icon(color, fa, size) {
  return isExpanded ? mkIconLight(color, fa, size) : mkIcon(color, fa, size);
}

// ── EXPAND TOGGLE ──
document.getElementById('expandBtn').addEventListener('click', function () {
  isExpanded = !isExpanded;
  document.body.classList.toggle('mapfull', isExpanded);
  document.body.classList.toggle('mapwhite', isExpanded);

  if (isExpanded) {
    map.removeLayer(darkTile);
    lightTile.addTo(map);
    toast('🗺️ Харитаи калон — сафед', 'blue');
  } else {
    map.removeLayer(lightTile);
    darkTile.addTo(map);
    toast('Панел баргашт', 'blue');
  }

  setTimeout(function () { map.invalidateSize(); }, 420);
});

// ── ONLINE/OFFLINE ──
var tog = document.getElementById('onlineToggle');
tog.addEventListener('change', function () {
  isOnline = tog.checked;
  document.body.classList.toggle('offline', !isOnline);
  updateStatusUI();
  if (isOnline) { showAllOnMap(); toast('🟢 Шумо онлайн — фармоишҳо дастрасанд', 'green'); }
  else { clearAllPendingMarks(); clearMap(); toast('🔴 Шумо офлайн шудед', 'red'); }
  render();
});

function updateStatusUI() {
  var lbl = document.getElementById('tlbl');
  var bar = document.getElementById('sbar');
  var dot = document.getElementById('sdot');
  var ico = document.getElementById('sicon');
  var txt = document.getElementById('stxt');
  if (isOnline) {
    lbl.textContent = 'Онлайн'; lbl.className = 'toggle-label on';
    bar.className = 'sbar online'; dot.className = 'sdot online';
    ico.className = 'fas fa-wifi'; txt.textContent = 'Шумо онлайн — фармоишҳо нишон дода мешаванд';
  } else {
    lbl.textContent = 'Офлайн'; lbl.className = 'toggle-label off';
    bar.className = 'sbar offline'; dot.className = 'sdot offline';
    ico.className = 'fas fa-wifi-slash'; txt.textContent = 'Шумо офлайн — фармоишҳо намоиш нест';
  }
}

// ── SHOW ALL ON MAP ──
function showAllOnMap() {
  clearAllPendingMarks();
  var pending = ORDERS.filter(function (o) { return o.status === 'pending'; });
  var bounds = [];
  pending.forEach(function (o) {
    var m = L.marker(o.fC, { icon: icon('#d29922', 'fa-box', 30) }).addTo(map);
    m.bindPopup(
      '<b style="color:#d29922">📦 ФАРМОИШИ НАВ №' + pad(o.id) + '</b><br>' +
      '<b>Аз:</b> ' + o.from + '<br><b>Ба:</b> ' + o.to + '<br>' +
      o.cargo + ' · ' + o.wt + ' кг<br>' +
      '<b style="color:#3fb950">' + o.price + '</b><br>' +
      '<small style="color:#8b949e">' + o.fP + '</small>'
    );
    pendingMarks[o.id] = m;
    bounds.push(o.fC); bounds.push(o.tC);
  });
  var mine = ORDERS.filter(function (o) { return o.cid === ME.id && o.status === 'accepted'; });
  mine.forEach(function (o) { bounds.push(o.fC); bounds.push(o.tC); });
  if (bounds.length) map.fitBounds(L.latLngBounds(bounds), { padding: [55, 55] });
}

function clearAllPendingMarks() {
  Object.keys(pendingMarks).forEach(function (id) { map.removeLayer(pendingMarks[id]); });
  pendingMarks = {};
}

// ── CLEAR MAP ──
function clearMap() {
  if (rLayer) { map.removeLayer(rLayer); rLayer = null; }
  if (fMark) { map.removeLayer(fMark); fMark = null; }
  if (tMark) { map.removeLayer(tMark); tMark = null; }
  document.getElementById('rstrip').classList.remove('show');
  activeId = null; render();
}

// ── SHOW ROUTE ──
async function showRoute(o) {
  if (pendingMarks[o.id]) { map.removeLayer(pendingMarks[o.id]); delete pendingMarks[o.id]; }
  if (rLayer) { map.removeLayer(rLayer); rLayer = null; }
  if (fMark) { map.removeLayer(fMark); fMark = null; }
  if (tMark) { map.removeLayer(tMark); tMark = null; }
  activeId = o.id;
  document.getElementById('rs-from').textContent = o.from;
  document.getElementById('rs-to').textContent = o.to;
  document.getElementById('rstrip').classList.add('show');

  if (!o.geom) {
    try {
      var url = 'https://router.project-osrm.org/route/v1/driving/' + o.fC[1] + ',' + o.fC[0] + ';' + o.tC[1] + ',' + o.tC[0] + '?overview=full&geometries=geojson';
      var r = await fetch(url);
      if (r.ok) { var d = await r.json(); if (d.routes && d.routes[0]) o.geom = d.routes[0].geometry; }
    } catch (e) { }
  }

  var lineColor = isExpanded ? '#2563eb' : '#4493f8';
  if (o.geom) {
    rLayer = L.geoJSON(o.geom, { style: { color: lineColor, weight: 5, opacity: .9, lineCap: 'round', lineJoin: 'round' } }).addTo(map);
  } else {
    rLayer = L.polyline([o.fC, o.tC], { color: lineColor, weight: 4, dashArray: '8 8', opacity: .8 }).addTo(map);
  }

  fMark = L.marker(o.fC, { icon: icon('#3fb950', 'fa-store') }).addTo(map);
  fMark.bindPopup('<b style="color:#3fb950">🟢 АЗ КУҶО</b><br>' + o.from + '<br><a href="tel:' + o.fP + '">' + o.fP + '</a>').openPopup();
  tMark = L.marker(o.tC, { icon: icon('#f85149', 'fa-flag-checkered') }).addTo(map);
  tMark.bindPopup('<b style="color:#f85149">🔴 БА КУҶО</b><br>' + o.to + '<br><a href="tel:' + o.tP + '">' + o.tP + '</a>');
  map.fitBounds(L.latLngBounds([o.fC, o.tC]), { padding: [55, 55] });
  if (o.status === 'accepted' && o.cid === ME.id && !cTimers[o.id]) startAnim(o);
  render();
}

// ── ANIMATION ──
function startAnim(o) {
  if (cTimers[o.id]) clearInterval(cTimers[o.id]);
  if (!o.geom) return;
  var coords = o.geom.type === 'LineString' ? o.geom.coordinates.map(function (c) { return [c[1], c[0]]; }) : [o.fC, o.tC];
  if (coords.length < 2) return;
  var step = o.step || 0;
  if (step >= coords.length - 1) step = 0;
  if (cMarks[o.id]) map.removeLayer(cMarks[o.id]);
  var cm = L.marker(coords[step], { icon: icon('#4493f8', 'fa-motorcycle'), zIndexOffset: 1000 }).addTo(map);
  cm.bindPopup('<b>🏍️ ' + ME.name + '</b><br>' + ME.phone);
  cMarks[o.id] = cm;
  cTimers[o.id] = setInterval(function () {
    if (o.status !== 'accepted') { clearInterval(cTimers[o.id]); delete cTimers[o.id]; return; }
    if (step < coords.length - 1) {
      step++; o.step = step;
      cm.setLatLng(coords[step]);
      var pct = Math.round((step / (coords.length - 1)) * 100);
      var pb = document.getElementById('pb-' + o.id);
      if (pb) pb.style.width = pct + '%';
      if (step === coords.length - 1) {
        clearInterval(cTimers[o.id]); delete cTimers[o.id];
        o.status = 'delivered'; o.step = 0;
        map.removeLayer(cm); delete cMarks[o.id];
        if (activeId === o.id) clearMap();
        render();
        toast('🎉 Фармоиш №' + o.id + ' расонида шуд!', 'green');
      }
    }
  }, 1300);
}

// ── ACCEPT / DELIVER ──
function accept(id) {
  if (!isOnline) { toast('⚠️ Аввал онлайн шавед!', 'red'); return; }
  var o = ORDERS.find(function (x) { return x.id === id; });
  if (!o || o.status !== 'pending') return;
  o.status = 'accepted'; o.cid = ME.id; o.step = 0;
  if (pendingMarks[id]) { map.removeLayer(pendingMarks[id]); delete pendingMarks[id]; }
  toast('✅ Фармоиш №' + id + ' қабул карда шуд!', 'green');
  setTab('ac'); showRoute(o);
}

function deliver(id) {
  var o = ORDERS.find(function (x) { return x.id === id; });
  if (!o || o.status !== 'accepted') return;
  o.status = 'delivered'; o.step = 0;
  if (cTimers[id]) { clearInterval(cTimers[id]); delete cTimers[id]; }
  if (cMarks[id]) { map.removeLayer(cMarks[id]); delete cMarks[id]; }
  if (activeId === id) clearMap();
  render();
  toast('✅ Фармоиш №' + id + ' расонида шуд!', 'green');
}

function viewMap(id) { var o = ORDERS.find(function (x) { return x.id === id; }); if (o) showRoute(o); }
function trackOrder(id) { var o = ORDERS.find(function (x) { return x.id === id; }); if (o) showRoute(o); }

// ── RENDER ──
function render() {
  var pending = ORDERS.filter(function (o) { return o.status === 'pending'; });
  var mine = ORDERS.filter(function (o) { return o.cid === ME.id && o.status === 'accepted'; });
  document.getElementById('acnt').textContent = mine.length;

  var av = document.getElementById('pane-av');
  if (!isOnline) {
    av.innerHTML = '<div class="offline-msg"><i class="fas fa-wifi-slash"></i><p>Барои дидани фармоишҳо<br><strong>онлайн шавед</strong></p></div>';
  } else if (!pending.length) {
    av.innerHTML = '<div class="empty"><i class="fas fa-box-open"></i>Ҳоло фармоиши нав нест</div>';
  } else {
    var h = '';
    pending.forEach(function (o) {
      h += '<div class="card' + (activeId === o.id ? ' on' : '') + '" onclick="viewMap(' + o.id + ')">' +
        '<div class="ctop"><span class="cnum">№' + pad(o.id) + '</span><span class="pill pill-p">Интизори курьер</span></div>' +
        '<div class="rb">' +
        '<div class="rrow"><div class="rdot from"></div><span class="radr">' + o.from + '</span></div>' +
        '<div style="display:flex;padding:0 4px"><div class="rdash"></div></div>' +
        '<div class="rrow"><div class="rdot to"></div><span class="radr">' + o.to + '</span></div>' +
        '</div>' +
        '<div class="chips">' +
        '<div class="chip"><i class="fas fa-box"></i>' + o.cargo + '</div>' +
        '<div class="chip"><i class="fas fa-weight-hanging"></i>' + o.wt + ' кг</div>' +
        '<div class="chip"><i class="fas fa-road"></i>' + o.dist + '</div>' +
        '<div class="chip"><i class="fas fa-coins"></i>' + o.price + '</div>' +
        '</div>' +
        '<div class="tel"><i class="fas fa-phone" style="color:var(--blue);font-size:9px"></i>Фиристанда: <a href="tel:' + o.fP + '" onclick="event.stopPropagation()">' + o.fP + '</a></div>' +
        '<div class="acts">' +
        '<button class="btn btn-g" onclick="event.stopPropagation();accept(' + o.id + ')"><i class="fas fa-check-circle"></i> Қабул</button>' +
        '<button class="btn btn-b" onclick="event.stopPropagation();viewMap(' + o.id + ')"><i class="fas fa-map-marked-alt"></i> Харита</button>' +
        '</div></div>';
    });
    av.innerHTML = h;
  }

  var ac = document.getElementById('pane-ac');
  if (!mine.length) {
    ac.innerHTML = '<div class="empty"><i class="fas fa-motorcycle"></i>Фармоиши фаъол нест</div>';
  } else {
    var h2 = '';
    mine.forEach(function (o) {
      var maxS = o.geom && o.geom.coordinates ? o.geom.coordinates.length - 1 : 1;
      var pct = maxS > 0 ? Math.round((o.step / maxS) * 100) : 0;
      h2 += '<div class="card' + (activeId === o.id ? ' on' : '') + '" onclick="trackOrder(' + o.id + ')">' +
        '<div class="ctop"><span class="cnum">№' + pad(o.id) + '</span><span class="pill pill-a">Дар роҳ — ' + pct + '%</span></div>' +
        '<div class="rb">' +
        '<div class="rrow"><div class="rdot from"></div><span class="radr">' + o.from + '</span></div>' +
        '<div style="display:flex;padding:0 4px"><div class="rdash"></div></div>' +
        '<div class="rrow"><div class="rdot to"></div><span class="radr">' + o.to + '</span></div>' +
        '</div>' +
        '<div class="chips"><div class="chip"><i class="fas fa-road"></i>' + o.dist + '</div><div class="chip"><i class="fas fa-coins"></i>' + o.price + '</div></div>' +
        '<div class="tel"><i class="fas fa-user" style="color:var(--blue);font-size:9px"></i>Фиристанда: <a href="tel:' + o.fP + '" onclick="event.stopPropagation()">' + o.fP + '</a></div>' +
        '<div class="tel" style="margin-top:-3px"><i class="fas fa-user-check" style="color:var(--green);font-size:9px"></i>Қабулкунанда: <a href="tel:' + o.tP + '" onclick="event.stopPropagation()">' + o.tP + '</a></div>' +
        '<div class="pbar"><div class="pfill" id="pb-' + o.id + '" style="width:' + pct + '%"></div></div>' +
        '<div class="acts">' +
        '<button class="btn btn-b" onclick="event.stopPropagation();trackOrder(' + o.id + ')"><i class="fas fa-location-dot"></i> Пайгирӣ</button>' +
        '<button class="btn btn-r" onclick="event.stopPropagation();deliver(' + o.id + ')"><i class="fas fa-check-double"></i> Расонида шуд</button>' +
        '</div></div>';
    });
    ac.innerHTML = h2;
  }
}

function pad(n) { return String(n).padStart(3, '0'); }

// ── TABS ──
function setTab(id) {
  document.querySelectorAll('.tbtn').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === id); });
  document.querySelectorAll('.pane').forEach(function (p) { p.classList.toggle('active', p.id === 'pane-' + id); });
}

document.querySelectorAll('.tbtn').forEach(function (b) {
  b.addEventListener('click', function () { setTab(b.dataset.tab); });
});

// ── MAP BUTTONS ──
document.getElementById('showAllBtn').addEventListener('click', function () {
  if (!isOnline) { toast('⚠️ Онлайн шавед!', 'red'); return; }
  showAllOnMap(); toast('Ҳама фармоишҳо дар харита', 'blue');
});

document.getElementById('resetBtn').addEventListener('click', function () {
  map.flyTo(CENTER, 13, { duration: 1.2 }); toast('Харита ба марказ баргашт', 'blue');
});

document.getElementById('clearBtn').addEventListener('click', function () {
  clearMap(); if (isOnline) showAllOnMap(); toast('Харита тоза шуд', 'blue');
});

// ── TOAST ──
function toast(msg, type) {
  var el = document.getElementById('toast');
  var c = { green: 'rgba(63,185,80,.08)', blue: 'rgba(68,147,248,.08)', red: 'rgba(248,81,73,.08)' };
  var b = { green: '#86efac', blue: '#bfdbfe', red: '#fca5a5' };
  var t = { green: '#15803d', blue: '#1d4ed8', red: '#dc2626' };
  el.style.background = c[type] || c.blue;
  el.style.borderColor = b[type] || b.blue;
  el.style.color = t[type] || t.blue;
  el.textContent = msg; el.style.opacity = '1';
  clearTimeout(window._tt);
  window._tt = setTimeout(function () { el.style.opacity = '0'; }, 3000);
}

window.addEventListener('resize', function () { map.invalidateSize(); });

// ── INIT ──
render();
toast('Хуш омадед! Онлайн шавед ва фармоиш қабул кунед 👋', 'blue');
