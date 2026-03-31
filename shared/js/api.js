/* ═══════════════════════════════════════════
   Tojrason Delivery — API Helper
   Барои ҳамаи HTTP запросҳо ба backend
   ═══════════════════════════════════════════ */

const API = (() => {
  const BASE_URL = "http://localhost:3000/api";

  // ── Token ── 
  function getToken() {
    return localStorage.getItem("tojrason_token");
  }

  function setToken(token) {
    localStorage.setItem("tojrason_token", token);
  }

  function removeToken() {
    localStorage.removeItem("tojrason_token");
  }

  // ── User ──
  function getUser() {
    const data = localStorage.getItem("tojrason_user");
    return data ? JSON.parse(data) : null;
  }

  function setUser(user) {
    localStorage.setItem("tojrason_user", JSON.stringify(user));
  }

  function removeUser() {
    localStorage.removeItem("tojrason_user");
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function logout() {
    removeToken();
    removeUser();
    window.location.href = "/frontend/login.html";
  }

  // ── Fetch wrapper ──
  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Агар токен нодуруст бошад — logout
      if (response.status === 401) {
        logout();
        return null;
      }

      if (!response.ok) {
        throw { status: response.status, message: data.error || "Хатои сервер", data };
      }

      return data;
    } catch (err) {
      if (err.status) throw err;
      throw { status: 0, message: "Сервер дастрас нест. Интернетро санҷед." };
    }
  }

  // ── Shorthand methods ──
  function get(endpoint) {
    return request(endpoint, { method: "GET" });
  }

  function post(endpoint, body) {
    return request(endpoint, { method: "POST", body });
  }

  function put(endpoint, body) {
    return request(endpoint, { method: "PUT", body });
  }

  function patch(endpoint, body) {
    return request(endpoint, { method: "PATCH", body });
  }

  function del(endpoint) {
    return request(endpoint, { method: "DELETE" });
  }

  // ── Auth shortcuts ──
  async function login(phone, password) {
    const data = await post("/auth/login", { phone, password });
    if (data && data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }

  async function register(name, phone, password, role = "client") {
    const data = await post("/auth/register", { name, phone, password, role });
    if (data && data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }

  async function getProfile() {
    return await get("/auth/me");
  }

  return {
    BASE_URL,
    getToken, setToken, removeToken,
    getUser, setUser, removeUser,
    isLoggedIn, logout,
    get, post, put, patch, del,
    login, register, getProfile,
  };
})();
