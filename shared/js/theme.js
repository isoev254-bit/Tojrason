/* ═══════════════════════════════════════════
   Tojrason Delivery — Theme Manager
   Dark / Light toggle бо ёддошт
   ═══════════════════════════════════════════ */

const Theme = (() => {
  const STORAGE_KEY = "tojrason_theme";

  function get() {
    return localStorage.getItem(STORAGE_KEY) || "dark";
  }

  function set(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
    updateToggleIcons(theme);
  }

  function toggle() {
    const current = get();
    const next = current === "dark" ? "light" : "dark";
    set(next);
    return next;
  }

  function init() {
    const saved = get();
    document.documentElement.setAttribute("data-theme", saved);

    // Вақте ки DOM тайёр шуд
    document.addEventListener("DOMContentLoaded", () => {
      updateToggleIcons(saved);
      bindToggleButtons();
    });
  }

  function updateToggleIcons(theme) {
    const toggles = document.querySelectorAll(".theme-toggle");
    toggles.forEach((btn) => {
      btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
      btn.title = theme === "dark" ? "Тема: Равшан" : "Тема: Торик";
    });
  }

  function bindToggleButtons() {
    const toggles = document.querySelectorAll(".theme-toggle");
    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        toggle();
      });
    });
  }

  // Ҳозир иҷро мешавад
  init();

  return { get, set, toggle, init };
})();
