// ═══════════════════════════════════════════════════
// frontend/js/config.js — API + Socket configuration
// ═══════════════════════════════════════════════════
const CONFIG = {
  // Change this to your production URL
  API_BASE: window.location.origin.includes('localhost')
    ? 'http://localhost:3000/api/v1'
    : '/api/v1',

  SOCKET_URL: window.location.origin.includes('localhost')
    ? 'http://localhost:3000'
    : window.location.origin,

  DEFAULT_LAT: 38.5590,
  DEFAULT_LNG: 68.7738,

  GPS_INTERVAL_MS: 4000,
  TOAST_DURATION:  3800
};

// ── Safe localStorage wrapper (works in incognito) ──
const Store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch { return false; }
  },
  remove(key) { try { localStorage.removeItem(key); } catch {} }
};

// ── API client with JWT auto-refresh ──
const API = (() => {
  async function request(method, path, body, isFormData = false) {
    const tokens = Store.get('tokens', {});
    const headers = {};
    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`;

    const opts = { method, headers };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    let res = await fetch(CONFIG.API_BASE + path, opts);

    // Auto-refresh on 401
    if (res.status === 401 && tokens.refresh) {
      const rr = await fetch(CONFIG.API_BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refresh })
      });
      if (rr.ok) {
        const { access } = await rr.json();
        Store.set('tokens', { ...tokens, access });
        headers['Authorization'] = `Bearer ${access}`;
        res = await fetch(CONFIG.API_BASE + path, opts);
      }
    }

    const data = await res.json().catch(() => ({ ok: false, msg: 'Parse error' }));
    if (!data.ok && !res.ok) throw new Error(data.msg || 'Хатои сервер');
    return data;
  }

  return {
    get:   (path)       => request('GET',    path),
    post:  (path, body) => request('POST',   path, body),
    patch: (path, body) => request('PATCH',  path, body),
    del:   (path)       => request('DELETE', path),
    upload:(path, form) => request('POST',   path, form, true)
  };
})();

// ── Socket.io client ──
class SocketClient {
  constructor() {
    this.socket   = null;
    this.handlers = {};
  }

  connect(role) {
    if (this.socket?.connected) return;
    const tokens = Store.get('tokens', {});
    this.socket = io(CONFIG.SOCKET_URL, {
      auth: { token: tokens.access },
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    this.socket.on('connect', () => {
      console.info('[Socket] Connected as', role);
      Object.entries(this.handlers).forEach(([ev, fn]) => this.socket.on(ev, fn));
    });
    this.socket.on('disconnect', () => console.info('[Socket] Disconnected'));
    this.socket.on('connect_error', e => console.warn('[Socket] Error:', e.message));
  }

  on(event, handler) {
    this.handlers[event] = handler;
    if (this.socket) this.socket.on(event, handler);
  }

  emit(event, data) {
    this.socket?.emit(event, data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.handlers = {};
  }
}

const socketClient = new SocketClient();

// ── XSS sanitizer ──
function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ── Toast ──
let _toastTO;
function toast(msg, type = 'if') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = type;
  t.style.display = 'block';
  clearTimeout(_toastTO);
  _toastTO = setTimeout(() => t.style.display = 'none', CONFIG.TOAST_DURATION);
}
