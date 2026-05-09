import { renderRoleSidebar } from "../../components/sidebar/role-sidebar.js";
import { logout } from "../../services/auth-service.js";
import { setAuthState } from "../../state/auth-store.js";

export function renderCashierShell({ session, currentPath, eyebrow, title, description, content }) {
  return `
    <main class="role-shell role-shell--cashier">
      ${renderRoleSidebar(session, currentPath)}
      <section class="role-shell__content role-shell__content--cashier">
        <header class="page-header">
          <span class="eyebrow">${eyebrow}</span>
          <h1 class="page-title" tabindex="-1" data-page-heading>${title}</h1>
          <p class="page-copy page-copy--lead">${description}</p>
        </header>
        ${content}
      </section>
    </main>
  `;
}

export function bindCashierShell({ navigate }) {
  document.querySelector("[data-logout]")?.addEventListener("click", async () => {
    await logout();
    setAuthState({
      session: {
        authenticated: false,
        role: null
      }
    });
    navigate("/", { replace: true });
  });
}
