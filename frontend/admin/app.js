/* ═══════════════════════════════════════════
   Tojrason Delivery — Admin Panel App
   Мантиқи асосии Админ Панел
   ═══════════════════════════════════════════ */

// ══════ Constants ══════
const DUSHANBE = [38.5598, 68.774];
const avatarC = ['#6366f1','#ec4899','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#84cc16','#f97316','#14b8a6','#a855f7','#e11d48'];

// ══════ Data ══════
const couriers = [
  {id:1,name:'Фирдавс Ҷамолов',phone:'+992 93 123 45',status:'online',orders:8,done:245,lat:38.562,lng:68.778,vehicle:'🏍 Мотосикл',rating:4.8,joined:'2024-03-15',city:'Душанбе',exp:'2 сол'},
  {id:2,name:'Рустам Аҳмадов',phone:'+992 90 234 56',status:'busy',orders:5,done:189,lat:38.555,lng:68.769,vehicle:'🚗 Мошин',rating:4.6,joined:'2024-05-20',city:'Душанбе',exp:'1.5 сол'},
  {id:3,name:'Сорбон Мирзоев',phone:'+992 92 345 67',status:'online',orders:12,done:312,lat:38.568,lng:68.782,vehicle:'🏍 Мотосикл',rating:4.9,joined:'2023-11-01',city:'Душанбе',exp:'3 сол'},
  {id:4,name:'Далер Назаров',phone:'+992 91 456 78',status:'offline',orders:3,done:67,lat:38.55,lng:68.76,vehicle:'🚲 Велосипед',rating:4.2,joined:'2025-01-10',city:'Душанбе',exp:'6 моҳ'},
  {id:5,name:'Баҳром Каримов',phone:'+992 93 567 89',status:'online',orders:7,done:198,lat:38.564,lng:68.785,vehicle:'🏍 Мотосикл',rating:4.7,joined:'2024-07-08',city:'Душанбе',exp:'1 сол'},
  {id:6,name:'Исмоил Шарипов',phone:'+992 90 678 90',status:'busy',orders:6,done:156,lat:38.558,lng:68.772,vehicle:'🚗 Мошин',rating:4.5,joined:'2024-04-22',city:'Душанбе',exp:'2 сол'},
  {id:7,name:'Аҳмад Раҳимов',phone:'+992 92 789 01',status:'online',orders:10,done:278,lat:38.571,lng:68.765,vehicle:'🏍 Мотосикл',rating:4.8,joined:'2023-09-15',city:'Душанбе',exp:'3 сол'},
  {id:8,name:'Шерзод Бобоев',phone:'+992 91 890 12',status:'offline',orders:0,done:23,lat:38.547,lng:68.755,vehicle:'🚲 Велосипед',rating:4.0,joined:'2025-02-01',city:'Душанбе',exp:'3 моҳ'},
  {id:9,name:'Камол Давлатов',phone:'+992 93 901 23',status:'online',orders:9,done:267,lat:38.566,lng:68.79,vehicle:'🚗 Мошин',rating:4.9,joined:'2023-12-05',city:'Душанбе',exp:'2 сол'},
  {id:10,name:'Наврӯз Ғаниев',phone:'+992 90 012 34',status:'busy',orders:4,done:134,lat:38.553,lng:68.78,vehicle:'🏍 Мотосикл',rating:4.3,joined:'2024-08-18',city:'Душанбе',exp:'1 сол'},
  {id:11,name:'Зафар Исмоилов',phone:'+992 92 111 22',status:'online',orders:11,done:301,lat:38.575,lng:68.77,vehicle:'🚗 Мошин',rating:4.7,joined:'2023-10-20',city:'Душанбе',exp:'3 сол'},
  {id:12,name:'Ҳусейн Тоиров',phone:'+992 91 333 44',status:'offline',orders:1,done:12,lat:38.545,lng:68.75,vehicle:'🚲 Велосипед',rating:3.9,joined:'2025-03-01',city:'Душанбе',exp:'1 моҳ'},
];

const orders = [
  {id:'ORD-001',customer:'Мадина Шарифова',address:'к. Сино, 45',status:'delivering',courierId:1,total:'85 TJS',items:['Пицца Маргарита','Кока-кола'],lat:38.565,lng:68.78,phone:'+992 98 111 22',time:'14:15'},
  {id:'ORD-002',customer:'Алишер Каримов',address:'к. Рудакӣ, 102',status:'delivering',courierId:2,total:'120 TJS',items:['Плов','Салат','Нон'],lat:38.553,lng:68.771,phone:'+992 98 222 33',time:'14:08'},
  {id:'ORD-003',customer:'Нигина Раҳимова',address:'к. Айнӣ, 78',status:'pending',courierId:null,total:'65 TJS',items:['Қаҳва','Чизкейк'],lat:38.559,lng:68.775,phone:'+992 98 333 44',time:'14:25'},
  {id:'ORD-004',customer:'Ҳасан Мирзоев',address:'к. Шоҳмансур, 33',status:'delivered',courierId:3,total:'210 TJS',items:['Шашлик','Хачапурӣ','Лимонад'],lat:38.57,lng:68.784,phone:'+992 98 444 55',time:'13:50'},
  {id:'ORD-005',customer:'Фотима Азизова',address:'к. Исмоили С., 15',status:'delivering',courierId:5,total:'95 TJS',items:['Бургер','Картошка фрӣ'],lat:38.567,lng:68.787,phone:'+992 98 555 66',time:'14:18'},
  {id:'ORD-006',customer:'Сафар Назаров',address:'к. Дусти, 67',status:'pending',courierId:null,total:'45 TJS',items:['Самбуса x3'],lat:38.556,lng:68.768,phone:'+992 98 666 77',time:'14:32'},
];

const clients = [
  {id:1,name:'Мадина Шарифова',phone:'+992 98 111 22',orders:23,spent:'2,340₸',joined:'2024-02',addr:'к. Сино, 45',rating:5},
  {id:2,name:'Алишер Каримов',phone:'+992 98 222 33',orders:45,spent:'5,670₸',joined:'2023-11',addr:'к. Рудакӣ, 102',rating:4},
  {id:3,name:'Нигина Раҳимова',phone:'+992 98 333 44',orders:12,spent:'890₸',joined:'2024-08',addr:'к. Айнӣ, 78',rating:5},
  {id:4,name:'Ҳасан Мирзоев',phone:'+992 98 444 55',orders:67,spent:'8,900₸',joined:'2023-06',addr:'к. Шоҳмансур',rating:5},
  {id:5,name:'Фотима Азизова',phone:'+992 98 555 66',orders:34,spent:'3,450₸',joined:'2024-01',addr:'к. Исмоили С.',rating:4},
  {id:6,name:'Сафар Назаров',phone:'+992 98 666 77',orders:8,spent:'560₸',joined:'2025-01',addr:'к. Дусти, 67',rating:3},
  {id:7,name:'Зарина Олимова',phone:'+992 98 777 88',orders:56,spent:'6,780₸',joined:'2023-08',addr:'к. Лоҳутӣ, 12',rating:5},
  {id:8,name:'Бобур Содиқов',phone:'+992 98 888 99',orders:29,spent:'3,120₸',joined:'2024-03',addr:'к. Навоӣ, 88',rating:4},
];

const complaints = [
  {id:'SH-001',customer:'Мадина Ш.',courier:'Далер Н.',date:'2025-03-25',status:'new',text:'Курер хеле дер омад, ғизо хунук буд.',priority:'high'},
  {id:'SH-002',customer:'Алишер К.',courier:'Шерзод Б.',date:'2025-03-24',status:'progress',text:'Фармоиш нодуруст — ба ҷои плов манту оварда шуд.',priority:'medium'},
  {id:'SH-003',customer:'Ҳасан М.',courier:null,date:'2025-03-24',status:'new',text:'Пардохт ду маротиба гирифта шуд.',priority:'high'},
  {id:'SH-004',customer:'Зарина О.',courier:'Наврӯз Ғ.',date:'2025-03-23',status:'resolved',text:'Курер беодобона рафтор кард.',priority:'high'},
  {id:'SH-005',customer:'Бобур С.',courier:'Рустам А.',date:'2025-03-23',status:'new',text:'Нӯшокӣ рехта буд, бастаҳо тар шуд.',priority:'medium'},
  {id:'SH-006',customer:'Фотима А.',courier:null,date:'2025-03-22',status:'progress',text:'Нархҳо дар барнома фарқ мекунанд.',priority:'low'},
  {id:'SH-007',customer:'Сафар Н.',courier:'Далер Н.',date:'2025-03-22',status:'resolved',text:'Самбуса хунук буд.',priority:'low'},
];

const hiringApps = [
  {id:'APP-001',name:'Ғанӣ Сафаров',phone:'+992 93 444 55',vehicle:'🏍 Мотосикл',city:'Душанбе',date:'2025-03-25',status:'pending',exp:'1 сол',hasPhoto:true,hasPass:true},
  {id:'APP-002',name:'Шоҳин Раҳматов',phone:'+992 90 555 66',vehicle:'🚗 Мошин',city:'Душанбе',date:'2025-03-24',status:'pending',exp:'3 сол',hasPhoto:true,hasPass:true},
  {id:'APP-003',name:'Ориф Бекзода',phone:'+992 92 666 77',vehicle:'🛵 Скутер',city:'Душанбе',date:'2025-03-23',status:'pending',exp:'6 моҳ',hasPhoto:true,hasPass:false},
];

const liveEvents = [
  {time:'14:32',icon:'📦',text:'Фармоиш #ORD-006'},
  {time:'14:30',icon:'✅',text:'Сорбон ORD-004 расонд'},
  {time:'14:28',icon:'🏍',text:'Фирдавс ба масир'},
  {time:'14:25',icon:'⚠️',text:'Далер офлайн'},
  {time:'14:20',icon:'📦',text:'ORD-005 ба Баҳром'},
];

// ══════ Navigation ══════
function nav(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  const el = document.getElementById('page-' + p);
  if (el) el.classList.add('active');
  document.querySelectorAll('.snav-item').forEach(s => s.classList.toggle('active', s.dataset.page === p));
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.toggle('active', b.dataset.page === p));
  if (p === 'map') setTimeout(() => map.invalidateSize(), 100);
}

document.querySelectorAll('.snav-item').forEach(b => b.onclick = () => nav(b.dataset.page));
document.querySelectorAll('.bnav-item').forEach(b => b.onclick = () => nav(b.dataset.page));

// ══════ Clock ══════
function tick() {
  const n = new Date();
  document.getElementById('clock').textContent = [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map(v => String(v).padStart(2, '0')).join(':');
}
setInterval(tick, 1000);
tick();

// ══════ Toast ══════
function toast(t, m) {
  const e = document.createElement('div');
  e.className = 'toast ' + t;
  e.innerHTML = m;
  document.getElementById('toastBox').appendChild(e);
  setTimeout(() => {
    e.style.opacity = '0';
    e.style.transform = 'translateX(30px)';
    e.style.transition = '.3s';
    setTimeout(() => e.remove(), 300);
  }, 3500);
}

// ══════ Modal ══════
function openModal(t, b, btns = []) {
  document.getElementById('mTitle').textContent = t;
  document.getElementById('mBody').innerHTML = b;
  const f = document.getElementById('mFoot');
  f.innerHTML = '';
  btns.forEach(x => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + x.c;
    btn.textContent = x.t;
    btn.onclick = x.fn;
    f.appendChild(btn);
  });
  document.getElementById('modalBg').classList.add('open');
}

function closeModal() {
  document.getElementById('modalBg').classList.remove('open');
}

document.getElementById('modalBg').onclick = e => {
  if (e.target.id === 'modalBg') closeModal();
};

// ══════ Notifications ══════
document.getElementById('notifBtn').onclick = () => {
  const items = [
    '📦 Фармоиши нав ORD-006',
    '⚠️ Далер офлайн шуд',
    '✅ ORD-004 расонида',
    '📋 Дархост: Ғанӣ Сафаров',
    '📢 Шикояти нав'
  ];
  const times = [2, 5, 12, 15, 20];
  openModal('🔔 Огоҳиҳо',
    `<div id="nList">${items.map((t, i) =>
      `<div style="padding:10px 0;border-bottom:1px solid var(--border-1);font-size:12px;color:var(--text-1)">${t}<div style="font-size:10px;color:var(--text-3);margin-top:2px">${times[i]} дақ пеш</div></div>`
    ).join('')}</div>`,
    [{ t: 'Пӯшед', c: 'btn-ghost', fn: closeModal }]
  );
};

// ══════ Map ══════
const map = L.map('map', { center: DUSHANBE, zoom: 14 });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

const cMk = {}, oMk = {};
const sM = { online: 'on', busy: 'busy', offline: 'off' };

// Courier markers
couriers.forEach(c => {
  const m = L.marker([c.lat, c.lng], {
    icon: L.divIcon({
      className: '',
      html: `<div class="c-marker ${sM[c.status]}">🚴</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    })
  }).addTo(map);
  m.bindPopup(`<div style="font-family:var(--font)"><strong>${c.name}</strong><br><small>${c.vehicle} ⭐${c.rating}</small><br><small>📞${c.phone}</small></div>`);
  cMk[c.id] = m;
});

// Order markers
orders.forEach(o => {
  const m = L.marker([o.lat, o.lng], {
    icon: L.divIcon({
      className: '',
      html: `<div class="o-marker">📦</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  }).addTo(map);
  m.bindPopup(`<div style="font-family:var(--font)"><strong>${o.id}</strong><br><small>${o.customer} · ${o.total}</small></div>`);
  m.on('click', () => showOD(o));
  oMk[o.id] = m;
});

// ══════ Courier List (Map Sidebar) ══════
let selC = null, cF = 'all';

function rCL() {
  const s = (document.getElementById('cSearch')?.value || '').toLowerCase();
  const ls = couriers.filter(c =>
    (cF === 'all' || c.status === cF) &&
    (c.name.toLowerCase().includes(s) || c.phone.includes(s))
  );

  document.getElementById('cList').innerHTML = ls.map(c =>
    `<div class="c-card ${c.status} ${selC === c.id ? 'sel' : ''}" onclick="pickC(${c.id})">
      <div class="c-ava" style="background:${avatarC[c.id % 12]}">${c.name.split(' ').map(n => n[0]).join('')}</div>
      <div class="c-info">
        <div class="c-name">${c.name}<span class="s-dot ${sM[c.status]}"></span></div>
        <div class="c-meta"><span>${c.vehicle}</span><span>⭐${c.rating}</span><span>📦${c.orders}</span></div>
      </div>
      <div><button class="c-btn" onclick="event.stopPropagation();toast('inf','📞${c.phone}')">📞</button></div>
    </div>`
  ).join('');
}

function pickC(id) {
  selC = selC === id ? null : id;
  rCL();
  const c = couriers.find(x => x.id === id);
  if (c) {
    map.flyTo([c.lat, c.lng], 16, { duration: .6 });
    cMk[id].openPopup();
  }
}

document.getElementById('cSearch')?.addEventListener('input', rCL);

document.querySelectorAll('.ftab').forEach(t => t.onclick = () => {
  document.querySelectorAll('.ftab').forEach(x => x.classList.remove('on'));
  t.classList.add('on');
  cF = t.dataset.f;
  rCL();
});

// Map search
document.getElementById('mapSearch').onkeydown = e => {
  if (e.key !== 'Enter') return;
  const q = e.target.value.toLowerCase();
  const c = couriers.find(x => x.name.toLowerCase().includes(q));
  if (c) {
    map.flyTo([c.lat, c.lng], 17, { duration: .6 });
    cMk[c.id].openPopup();
    return;
  }
  const o = orders.find(x => x.id.toLowerCase().includes(q) || x.customer.toLowerCase().includes(q));
  if (o) {
    map.flyTo([o.lat, o.lng], 17, { duration: .6 });
    oMk[o.id].openPopup();
    showOD(o);
  } else {
    toast('wrn', 'Ёфт нашуд');
  }
};

// Routes toggle
document.getElementById('chipRoutes').onclick = function () {
  this.classList.toggle('on');
  if (this.classList.contains('on')) {
    orders.filter(o => o.courierId && o.status === 'delivering').forEach(o => {
      const c = couriers.find(x => x.id === o.courierId);
      if (c) L.polyline([[c.lat, c.lng], [o.lat, o.lng]], {
        color: '#4a90ff', weight: 3, opacity: .7, dashArray: '8,8'
      }).addTo(map);
    });
    toast('inf', '🛤 Масирҳо');
  } else {
    map.eachLayer(l => { if (l instanceof L.Polyline && !(l instanceof L.Polygon)) map.removeLayer(l); });
  }
};

// Live toggle
document.getElementById('chipLive').onclick = function () {
  this.classList.toggle('on');
  toast('inf', this.classList.contains('on') ? '📡 Зинда' : '📡 Хомӯш');
};

// ══════ Order Detail Panel ══════
function showOD(o) {
  const p = document.getElementById('detailPanel');
  const b = document.getElementById('detailBody');
  const c = o.courierId ? couriers.find(x => x.id === o.courierId) : null;
  const sL = { delivering: 'Дар роҳ', delivered: 'Расонида', pending: 'Интизорӣ' };
  const sC = { delivering: 'blue', delivered: 'green', pending: 'orange' };

  b.innerHTML = `
    <div class="d-sec">
      <div class="d-sec-title">Фармоиш</div>
      <div class="d-row"><span class="d-label">ID</span><span class="d-val">${o.id}</span></div>
      <div class="d-row"><span class="d-label">Ҳолат</span><span class="tag ${sC[o.status]}">${sL[o.status]}</span></div>
      <div class="d-row"><span class="d-label">Маблағ</span><span class="d-val">${o.total}</span></div>
    </div>
    <div class="d-sec">
      <div class="d-sec-title">Муштарӣ</div>
      <div class="d-row"><span class="d-label">Ном</span><span class="d-val">${o.customer}</span></div>
      <div class="d-row"><span class="d-label">Адрес</span><span class="d-val">${o.address}</span></div>
    </div>
    <div class="d-sec">
      <div class="d-sec-title">Маҳсулот</div>
      ${o.items.map(i => `<div class="d-row"><span class="d-label">${i}</span></div>`).join('')}
    </div>
    ${c ? `
      <div class="d-sec">
        <div class="d-sec-title">Курер</div>
        <div class="d-row"><span class="d-label">Ном</span><span class="d-val">${c.name}</span></div>
        <div class="d-row"><span class="d-label">Тел</span><span class="d-val">${c.phone}</span></div>
      </div>
    ` : `
      <div class="d-sec">
        <div style="padding:8px;background:var(--orange-dim);border-radius:6px;font-size:11px;color:var(--orange)">⚠ Курер нест</div>
        <button class="btn btn-primary btn-sm" style="width:100%;margin-top:6px" onclick="assignC('${o.id}')">Таъин кун</button>
      </div>
    `}
    <div class="d-sec">
      <div class="d-sec-title">Раванд</div>
      <div class="timeline">
        <div class="tl-item done"><div class="tl-dot"></div><div class="tl-text">Қабул</div><div class="tl-time">${o.time}</div></div>
        <div class="tl-item ${o.status !== 'pending' ? 'done' : ''}"><div class="tl-dot"></div><div class="tl-text">Тайёр</div></div>
        <div class="tl-item ${o.status === 'delivering' ? 'now' : o.status === 'delivered' ? 'done' : ''}"><div class="tl-dot"></div><div class="tl-text">Дар роҳ</div></div>
        <div class="tl-item ${o.status === 'delivered' ? 'done' : ''}"><div class="tl-dot"></div><div class="tl-text">Расонида</div></div>
      </div>
    </div>`;

  document.getElementById('detailTitle').textContent = o.id;
  p.classList.remove('closed');
}

function closeDetail() {
  document.getElementById('detailPanel').classList.add('closed');
}

function assignC(oid) {
  const ol = couriers.filter(c => c.status === 'online');
  openModal('Таъин',
    `<div class="fg"><label class="fl">Курер</label><select class="fs" id="aS">${ol.map(c =>
      `<option value="${c.id}">${c.name} ${c.vehicle}</option>`
    ).join('')}</select></div>`,
    [
      { t: 'Бекор', c: 'btn-ghost', fn: closeModal },
      {
        t: 'Таъин', c: 'btn-primary', fn: () => {
          const id = +document.getElementById('aS').value;
          const c = couriers.find(x => x.id === id);
          const o = orders.find(x => x.id === oid);
          if (o && c) {
            o.courierId = id;
            o.status = 'delivering';
            toast('ok', `✅${c.name}→${oid}`);
            showOD(o);
          }
          closeModal();
        }
      }
    ]
  );
}

// ══════ Live Feed ══════
function rLive() {
  document.getElementById('liveFeed').innerHTML = liveEvents.slice(0, 5).map(e =>
    `<div class="live-item"><span class="live-time">${e.time}</span><span>${e.icon}</span><span>${e.text}</span></div>`
  ).join('');
}

// Courier movement simulation
setInterval(() => {
  couriers.forEach(c => {
    if (c.status !== 'offline') {
      c.lat += (Math.random() - .5) * .0007;
      c.lng += (Math.random() - .5) * .0007;
      cMk[c.id]?.setLatLng([c.lat, c.lng]);
    }
  });
}, 3000);

// Random live events
const rE = [
  { icon: '📦', text: 'Фармоиши нав' },
  { icon: '✅', text: 'Расонида шуд' },
  { icon: '🏍', text: 'Курер ба масир' },
  { icon: '⭐', text: 'Баҳо: 5 ситора' }
];

setInterval(() => {
  const n = new Date();
  liveEvents.unshift({
    time: [n.getHours(), n.getMinutes()].map(v => String(v).padStart(2, '0')).join(':'),
    ...rE[Math.floor(Math.random() * rE.length)]
  });
  if (liveEvents.length > 8) liveEvents.pop();
  rLive();
}, 15000);

// ══════ Orders Table ══════
function rOrd(t) {
  const sL = { delivering: 'Дар роҳ', delivered: 'Расонида', pending: 'Интизорӣ' };
  const sC = { delivering: 'blue', delivered: 'green', pending: 'orange' };

  document.getElementById(t).innerHTML = `
    <table><thead><tr><th>ID</th><th>Муштарӣ</th><th>Маблағ</th><th>Ҳолат</th><th>Курер</th><th></th></tr></thead>
    <tbody>${orders.map(o => {
      const c = o.courierId ? couriers.find(x => x.id === o.courierId) : null;
      return `<tr>
        <td style="font-family:var(--mono);font-size:11px;color:var(--blue)">${o.id}</td>
        <td><div style="font-weight:600;font-size:12px">${o.customer}</div><div style="font-size:10px;color:var(--text-3)">${o.address}</div></td>
        <td style="font-weight:600">${o.total}</td>
        <td><span class="tag ${sC[o.status]}">${sL[o.status]}</span></td>
        <td style="font-size:12px">${c ? c.name : '—'}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="nav('map');setTimeout(()=>showOD(orders.find(x=>x.id==='${o.id}')),200)">👁</button></td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

// ══════ Courier Profiles ══════
function rCP() {
  const sC = { online: 'green', busy: 'orange', offline: 'gray' };
  const sL = { online: 'Озод', busy: 'Банд', offline: 'Офлайн' };

  document.getElementById('courierProfiles').innerHTML = couriers.map(c =>
    `<div class="profile-card" onclick="openCP(${c.id})">
      <div class="profile-top">
        <div class="profile-avatar" style="background:${avatarC[c.id % 12]}">${c.name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <div class="profile-name">${c.name} <span class="tag ${sC[c.status]}">${sL[c.status]}</span></div>
          <div class="profile-sub">${c.vehicle} · ${c.phone}</div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="profile-stat"><div class="profile-stat-val">${c.done}</div><div class="profile-stat-label">Расонида</div></div>
        <div class="profile-stat"><div class="profile-stat-val">⭐${c.rating}</div><div class="profile-stat-label">Рейтинг</div></div>
        <div class="profile-stat"><div class="profile-stat-val">${c.orders}</div><div class="profile-stat-label">Имрӯз</div></div>
        <div class="profile-stat"><div class="profile-stat-val">${c.exp}</div><div class="profile-stat-label">Таҷриба</div></div>
      </div>
    </div>`
  ).join('');
}

function openCP(id) {
  const c = couriers.find(x => x.id === id);
  openModal(c.name,
    `<div style="text-align:center;margin-bottom:14px">
      <div style="width:64px;height:64px;border-radius:var(--r);background:${avatarC[c.id % 12]};display:inline-grid;place-items:center;font-size:26px;font-weight:700;margin-bottom:8px">${c.name.split(' ').map(n => n[0]).join('')}</div>
      <div style="font-size:17px;font-weight:700">${c.name}</div>
      <div style="font-size:12px;color:var(--text-2)">${c.vehicle} · ${c.city}</div>
    </div>
    <div class="d-sec"><div class="d-sec-title">Маълумот</div>
      <div class="d-row"><span class="d-label">Телефон</span><span class="d-val">${c.phone}</span></div>
      <div class="d-row"><span class="d-label">Рейтинг</span><span class="d-val">⭐${c.rating}</span></div>
      <div class="d-row"><span class="d-label">Таҷриба</span><span class="d-val">${c.exp}</span></div>
      <div class="d-row"><span class="d-label">Аз санаи</span><span class="d-val">${c.joined}</span></div>
      <div class="d-row"><span class="d-label">Расонидаҳо</span><span class="d-val">${c.done}</span></div>
      <div class="d-row"><span class="d-label">Имрӯз</span><span class="d-val">${c.orders}</span></div>
    </div>`,
    [
      { t: 'Пӯшед', c: 'btn-ghost', fn: closeModal },
      {
        t: '📍 Харита', c: 'btn-primary', fn: () => {
          closeModal();
          nav('map');
          setTimeout(() => { map.flyTo([c.lat, c.lng], 17, { duration: .6 }); cMk[c.id].openPopup(); }, 200);
        }
      }
    ]
  );
}

// ══════ Client Profiles ══════
function rClP() {
  document.getElementById('clientProfiles').innerHTML = clients.map(c => {
    const stars = '★'.repeat(c.rating) + '☆'.repeat(5 - c.rating);
    return `<div class="profile-card" onclick="openClP(${c.id})">
      <div class="profile-top">
        <div class="profile-avatar" style="background:${avatarC[(c.id + 4) % 12]}">${c.name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <div class="profile-name">${c.name}</div>
          <div class="profile-sub">${c.phone}</div>
          <div class="stars">${stars}</div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="profile-stat"><div class="profile-stat-val">${c.orders}</div><div class="profile-stat-label">Фармоиш</div></div>
        <div class="profile-stat"><div class="profile-stat-val">${c.spent}</div><div class="profile-stat-label">Харҷ</div></div>
        <div class="profile-stat"><div class="profile-stat-val">${c.joined}</div><div class="profile-stat-label">Аз</div></div>
      </div>
    </div>`;
  }).join('');
}

function openClP(id) {
  const c = clients.find(x => x.id === id);
  const stars = '★'.repeat(c.rating) + '☆'.repeat(5 - c.rating);
  openModal(c.name,
    `<div style="text-align:center;margin-bottom:14px">
      <div style="width:64px;height:64px;border-radius:var(--r);background:${avatarC[(c.id + 4) % 12]};display:inline-grid;place-items:center;font-size:26px;font-weight:700;margin-bottom:8px">${c.name.split(' ').map(n => n[0]).join('')}</div>
      <div style="font-size:17px;font-weight:700">${c.name}</div>
      <div class="stars" style="font-size:15px">${stars}</div>
    </div>
    <div class="d-sec"><div class="d-sec-title">Маълумот</div>
      <div class="d-row"><span class="d-label">Телефон</span><span class="d-val">${c.phone}</span></div>
      <div class="d-row"><span class="d-label">Суроға</span><span class="d-val">${c.addr}</span></div>
      <div class="d-row"><span class="d-label">Фармоишҳо</span><span class="d-val">${c.orders}</span></div>
      <div class="d-row"><span class="d-label">Маблағ</span><span class="d-val">${c.spent}</span></div>
      <div class="d-row"><span class="d-label">Аз</span><span class="d-val">${c.joined}</span></div>
    </div>`,
    [{ t: 'Пӯшед', c: 'btn-ghost', fn: closeModal }]
  );
}

// ══════ Complaints ══════
let compF = 'all';

function rComp() {
  const sL = { new: 'Нав', progress: 'Баррасӣ', resolved: 'Ҳалшуда' };
  const sC = { new: 'red', progress: 'orange', resolved: 'green' };
  const pC = { high: 'red', medium: 'orange', low: 'gray' };
  const pL = { high: 'Баланд', medium: 'Миёна', low: 'Паст' };

  const fl = complaints.filter(c => compF === 'all' || c.status === compF);

  document.getElementById('compList').innerHTML = fl.map(c =>
    `<div class="complaint-item" onclick="openComp('${c.id}')">
      <div class="complaint-head"><span class="complaint-id">${c.id}</span><span class="complaint-date">${c.date}</span></div>
      <div class="complaint-text">${c.text}</div>
      <div class="complaint-footer">
        <span class="tag ${sC[c.status]}">${sL[c.status]}</span>
        <span class="tag ${pC[c.priority]}">${pL[c.priority]}</span>
        <span style="font-size:10px;color:var(--text-3)">👤${c.customer}</span>
        ${c.courier ? `<span style="font-size:10px;color:var(--text-3)">🏍${c.courier}</span>` : ''}
      </div>
    </div>`
  ).join('') || '<div style="text-align:center;padding:30px;font-size:13px;color:var(--text-3)">✅ Шикояте нест</div>';
}

document.querySelectorAll('#compTabs .ptab').forEach(t => t.onclick = () => {
  document.querySelectorAll('#compTabs .ptab').forEach(x => x.classList.remove('on'));
  t.classList.add('on');
  compF = t.dataset.cf;
  rComp();
});

function openComp(id) {
  const c = complaints.find(x => x.id === id);
  const sL = { new: 'Нав', progress: 'Баррасӣ', resolved: 'Ҳалшуда' };

  openModal('Шикоят ' + c.id,
    `<div class="d-sec"><div class="d-sec-title">Маълумот</div>
      <div class="d-row"><span class="d-label">Муштарӣ</span><span class="d-val">${c.customer}</span></div>
      <div class="d-row"><span class="d-label">Курер</span><span class="d-val">${c.courier || '—'}</span></div>
      <div class="d-row"><span class="d-label">Сана</span><span class="d-val">${c.date}</span></div>
      <div class="d-row"><span class="d-label">Ҳолат</span><span class="d-val">${sL[c.status]}</span></div>
    </div>
    <div class="d-sec"><div class="d-sec-title">Матн</div>
      <p style="font-size:12px;line-height:1.6;color:var(--text-1)">${c.text}</p>
    </div>
    <div class="fg"><label class="fl">Ҷавоб</label><textarea class="fi" placeholder="Ҷавоб нависед..."></textarea></div>`,
    [
      { t: 'Пӯшед', c: 'btn-ghost', fn: closeModal },
      c.status !== 'resolved' ? { t: '✅ Ҳал', c: 'btn-success', fn: () => { c.status = 'resolved'; rComp(); closeModal(); toast('ok', 'Ҳал шуд'); } } : null,
      c.status === 'new' ? { t: '🔄 Баррасӣ', c: 'btn-primary', fn: () => { c.status = 'progress'; rComp(); closeModal(); toast('inf', 'Ба баррасӣ'); } } : null,
    ].filter(Boolean)
  );
}

// ══════ Hiring ══════
function hStep(s) {
  document.getElementById('fs1').style.display = s === 1 ? 'block' : 'none';
  document.getElementById('fs2').style.display = s === 2 ? 'block' : 'none';
  document.getElementById('fs3').style.display = s === 3 ? 'block' : 'none';
  document.querySelectorAll('#formSteps .step').forEach((el, i) =>
    el.className = 'step ' + (i < s - 1 ? 'done' : i === s - 1 ? 'cur' : '')
  );
}

function hUp(inp, zid, pid) {
  const f = inp.files[0];
  if (!f) return;
  document.getElementById(zid).classList.add('has-file');
  const r = new FileReader();
  r.onload = e => {
    const p = document.getElementById(pid);
    p.src = e.target.result;
    p.style.display = 'block';
  };
  r.readAsDataURL(f);
}

function rH() {
  document.getElementById('pendCnt').textContent = hiringApps.filter(a => a.status === 'pending').length;
  const sC = { pending: 'orange', approved: 'green', rejected: 'red' };
  const sL = { pending: 'Интизорӣ', approved: 'Қабул', rejected: 'Рад' };

  document.getElementById('hiringList').innerHTML = hiringApps.map(a =>
    `<div class="complaint-item" onclick="openHA('${a.id}')">
      <div class="complaint-head"><span class="complaint-id">${a.id}</span><span class="complaint-date">${a.date}</span></div>
      <div style="font-size:13px;font-weight:600;margin-bottom:3px">${a.name}</div>
      <div style="font-size:11px;color:var(--text-2);margin-bottom:6px">${a.vehicle} · ${a.phone}</div>
      <div class="complaint-footer">
        <span class="tag ${sC[a.status]}">${sL[a.status]}</span>
        <span class="tag ${a.hasPhoto ? 'green' : 'red'}">${a.hasPhoto ? '📸✓' : '📸✗'}</span>
        <span class="tag ${a.hasPass ? 'green' : 'red'}">${a.hasPass ? '🪪✓' : '🪪✗'}</span>
      </div>
    </div>`
  ).join('');
}

function openHA(id) {
  const a = hiringApps.find(x => x.id === id);
  openModal(a.name,
    `<div style="text-align:center;margin-bottom:14px">
      <div style="width:64px;height:64px;border-radius:var(--r);background:var(--purple-dim);display:inline-grid;place-items:center;font-size:26px;margin-bottom:8px">👤</div>
      <div style="font-size:17px;font-weight:700">${a.name}</div>
      <div style="font-size:12px;color:var(--text-2)">${a.vehicle} · ${a.city}</div>
    </div>
    <div class="d-sec"><div class="d-sec-title">Маълумот</div>
      <div class="d-row"><span class="d-label">Тел</span><span class="d-val">${a.phone}</span></div>
      <div class="d-row"><span class="d-label">Таҷриба</span><span class="d-val">${a.exp}</span></div>
      <div class="d-row"><span class="d-label">Акс</span><span class="d-val">${a.hasPhoto ? '<span class="tag green">✓</span>' : '<span class="tag red">✗</span>'}</span></div>
      <div class="d-row"><span class="d-label">Паспорт</span><span class="d-val">${a.hasPass ? '<span class="tag green">✓</span>' : '<span class="tag red">✗</span>'}</span></div>
    </div>
    ${!a.hasPass ? '<div style="padding:8px;background:var(--orange-dim);border-radius:6px;font-size:11px;color:var(--orange);margin-bottom:10px">⚠ Паспорт бор нашудааст</div>' : ''}`,
    [
      { t: 'Пӯшед', c: 'btn-ghost', fn: closeModal },
      a.status === 'pending' ? {
        t: '❌Рад', c: 'btn-danger', fn: () => {
          a.status = 'rejected'; rH(); closeModal(); toast('err', 'Рад шуд');
        }
      } : null,
      a.status === 'pending' ? {
        t: '✅Қабул', c: 'btn-success', fn: () => {
          if (!a.hasPass) { toast('wrn', '⚠ Паспорт лозим!'); return; }
          a.status = 'approved';
          couriers.push({
            id: couriers.length + 1, name: a.name, phone: a.phone,
            status: 'online', orders: 0, done: 0,
            lat: 38.56 + (Math.random() - .5) * .02,
            lng: 68.77 + (Math.random() - .5) * .02,
            vehicle: a.vehicle, rating: 0, joined: new Date().toISOString().slice(0, 10),
            city: a.city, exp: a.exp
          });
          rH(); rCP(); rCL(); closeModal();
          toast('ok', `✅${a.name} қабул шуд!`);
        }
      } : null,
    ].filter(Boolean)
  );
}

function submitH() {
  const n = document.getElementById('hName').value.trim();
  const ph = document.getElementById('hPhone').value.trim();
  if (!n || !ph) { toast('wrn', 'Ном ва телефон лозим'); return; }

  hiringApps.unshift({
    id: 'APP-' + String(hiringApps.length + 1).padStart(3, '0'),
    name: n, phone: ph,
    vehicle: document.getElementById('hVeh').value,
    city: document.getElementById('hCity').value || 'Душанбе',
    date: new Date().toISOString().slice(0, 10),
    status: 'pending',
    exp: document.getElementById('hExp').value || '—',
    hasPhoto: !!document.getElementById('p1').src,
    hasPass: !!document.getElementById('p2').src
  });

  rH(); rDH(); hStep(1);
  ['hName', 'hPhone', 'hCity', 'hExp', 'hNote'].forEach(id => document.getElementById(id).value = '');
  ['p1', 'p2', 'p3'].forEach(id => { const e = document.getElementById(id); e.src = ''; e.style.display = 'none'; });
  ['z1', 'z2', 'z3'].forEach(id => document.getElementById(id).classList.remove('has-file'));
  toast('ok', '✅ Дархост фиристода!');
}

// ══════ Dashboard Hiring Widget ══════
function rDH() {
  document.getElementById('dashHiring').innerHTML = hiringApps
    .filter(a => a.status === 'pending')
    .slice(0, 3)
    .map(a =>
      `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-1)">
        <div style="width:32px;height:32px;border-radius:var(--r-xs);background:var(--purple-dim);display:grid;place-items:center;font-size:14px">👤</div>
        <div style="flex:1"><div style="font-size:12px;font-weight:600">${a.name}</div><div style="font-size:10px;color:var(--text-3)">${a.vehicle}</div></div>
        <span class="tag orange">Интизорӣ</span>
      </div>`
    ).join('') || '<div style="font-size:12px;color:var(--text-3);padding:10px">Дархосте нест</div>';
}

// ══════ Initialize ══════
rCL();
rLive();
rOrd('dashOrders');
rOrd('ordersTable');
rCP();
rClP();
rComp();
rH();
rDH();
setTimeout(() => map.invalidateSize(), 300);
