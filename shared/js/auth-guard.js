/* ═══════════════════════════════════════════
   Tojrason Delivery — Auth Guard
   Санҷиши автоматикии даромад
   ═══════════════════════════════════════════ */

const AuthGuard = (() => {

  /**
   * Санҷиш мекунад ки корбар ворид шудааст ё не.
   * Агар не — ба саҳифаи login мефиристад.
   * @param {string[]} allowedRoles - Рӯйхати нақшҳои иҷозатшуда (optional)
   */
  function requireAuth(allowedRoles = []) {
    if (!API.isLoggedIn()) {
      window.location.href = "/frontend/login.html";
      return false;
    }

    if (allowedRoles.length > 0) {
      const user = API.getUser();
      if (!user || !allowedRoles.includes(user.role)) {
        window.location.href = "/frontend/login.html";
        return false;
      }
    }

    return true;
  }

  /**
   * Агар корбар аллакай ворид шудааст — ба dashboard мефиристад.
   * Барои login/register саҳифаҳо.
   */
  function redirectIfLoggedIn() {
    if (API.isLoggedIn()) {
      const user = API.getUser();
      if (user) {
        redirectToDashboard(user.role);
      }
    }
  }

  /**
   * Мувофиқи нақш ба dashboard мефиристад
   */
  function redirectToDashboard(role) {
    const dashboards = {
      admin: "/frontend/admin/index.html",
      client: "/frontend/client/index.html",
      courier: "/frontend/courier/index.html",
    };

    window.location.href = dashboards[role] || dashboards.client;
  }

  /**
   * Навбарро бо маълумоти корбар пур мекунад
   */
  function populateUserInfo() {
    const user = API.getUser();
    if (!user) return;

    const nameEls = document.querySelectorAll(".sidebar-user-name, .user-name");
    const roleEls = document.querySelectorAll(".sidebar-user-role, .user-role");
    const avatarEls = document.querySelectorAll(".sidebar-user .avatar, .user-avatar");

    nameEls.forEach((el) => (el.textContent = user.name));
    roleEls.forEach((el) => (el.textContent = UI.userRole(user.role)));
    avatarEls.forEach((el) => (el.textContent = UI.avatarInitials(user.name)));
  }

  /**
   * Logout тугмаро васл мекунад
   */
  function bindLogout() {
    document.querySelectorAll(".logout-btn, [data-action='logout']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (UI.confirm("Шумо мехоҳед аз система берун равед?")) {
          API.logout();
        }
      });
    });
  }

  /**
   * Ҳамаро иҷро мекунад
   */
  function init(allowedRoles = []) {
    if (!requireAuth(allowedRoles)) return false;

    document.addEventListener("DOMContentLoaded", () => {
      populateUserInfo();
      bindLogout();
    });

    return true;
  }

  return { requireAuth, redirectIfLoggedIn, redirectToDashboard, populateUserInfo, bindLogout, init };
})();
