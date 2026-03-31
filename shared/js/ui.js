/* ═══════════════════════════════════════════
   Tojrason Delivery — UI Utilities
   Toast, Modal, Format, Sidebar
   ═══════════════════════════════════════════ */

const UI = (() => {

  // ══════ Toast Notifications ══════
  function _getContainer() {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  function toast(message, type = "info", duration = 3500) {
    const container = _getContainer();

    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type] || ""}</span><span>${message}</span>`;

    container.appendChild(el);

    setTimeout(() => {
      el.classList.add("toast-out");
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  function success(msg) { toast(msg, "success"); }
  function error(msg) { toast(msg, "error"); }
  function warning(msg) { toast(msg, "warning"); }
  function info(msg) { toast(msg, "info"); }

  // ══════ Modal ══════
  function openModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  function closeAllModals() {
    document.querySelectorAll(".modal-overlay.active").forEach((m) => {
      m.classList.remove("active");
    });
    document.body.style.overflow = "";
  }

  // Пӯшидан бо клик ба берун
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      closeAllModals();
    }
  });

  // Пӯшидан бо Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals();
  });

  // ══════ Sidebar Toggle (Mobile) ══════
  function initSidebar() {
    const hamburger = document.querySelector(".navbar-hamburger");
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.querySelector(".sidebar-backdrop");

    if (!hamburger || !sidebar) return;

    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      if (backdrop) backdrop.classList.toggle("active");
    });

    if (backdrop) {
      backdrop.addEventListener("click", () => {
        sidebar.classList.remove("open");
        backdrop.classList.remove("active");
      });
    }
  }

  // ══════ Confirm Dialog ══════
  function confirm(message) {
    return window.confirm(message);
  }

  // ══════ Formatting ══════
  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("tg-TJ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(price) {
    if (!price && price !== 0) return "—";
    return Number(price).toLocaleString("ru-RU") + " сомонӣ";
  }

  function formatPhone(phone) {
    if (!phone) return "—";
    return phone;
  }

  // ══════ Status Labels (тоҷикӣ) ══════
  const ORDER_STATUS = {
    new: "Нав",
    accepted: "Қабулшуда",
    picked_up: "Гирифта шуд",
    delivered: "Расонида шуд",
    cancelled: "Бекоршуда",
  };

  const COURIER_STATUS = {
    free: "Озод",
    busy: "Банд",
    offline: "Оффлайн",
  };

  const USER_ROLES = {
    admin: "Админ",
    client: "Фармоишгар",
    courier: "Курер",
  };

  function orderStatus(status) {
    return ORDER_STATUS[status] || status;
  }

  function courierStatus(status) {
    return COURIER_STATUS[status] || status;
  }

  function userRole(role) {
    return USER_ROLES[role] || role;
  }

  // ══════ Loading ══════
  function showLoading() {
    let overlay = document.querySelector(".loading-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "loading-overlay";
      overlay.innerHTML = '<div class="spinner spinner-lg"></div>';
      document.body.appendChild(overlay);
    }
    overlay.style.display = "flex";
  }

  function hideLoading() {
    const overlay = document.querySelector(".loading-overlay");
    if (overlay) overlay.style.display = "none";
  }

  // ══════ Avatar ══════
  function avatarInitials(name) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  // ══════ Init ══════
  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
  });

  return {
    toast, success, error, warning, info,
    openModal, closeModal, closeAllModals,
    initSidebar, confirm,
    formatDate, formatPrice, formatPhone,
    orderStatus, courierStatus, userRole,
    ORDER_STATUS, COURIER_STATUS, USER_ROLES,
    showLoading, hideLoading,
    avatarInitials,
  };
})();
