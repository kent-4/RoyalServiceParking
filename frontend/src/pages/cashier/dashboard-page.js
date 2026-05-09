import { renderRoleSidebar } from "../../components/sidebar/role-sidebar.js";
import { logout } from "../../services/auth-service.js";
import { setAuthState } from "../../state/auth-store.js";

export function createCashierDashboardPage({ session, pathname }) {
  return {
    html: `
      <main class="role-shell">
        ${renderRoleSidebar(session, pathname)}
        <section class="role-shell__content">
          <header class="page-header">
            <span class="eyebrow">Cashier operations</span>
            <h1 class="page-title" tabindex="-1" data-page-heading>Operational shell ready</h1>
            <p class="page-copy">
              Tablet-friendly navigation and session-aware routing are in place for arrival and checkout workflows.
            </p>
          </header>
          <section class="panel-grid">
            <article class="panel-card">
              <h2>Immediate next pages</h2>
              <p>Booking operations table, arrival actions, payment flow, and receipt view.</p>
            </article>
            <article class="panel-card">
              <h2>Current session</h2>
              <p>Signed in as ${session.username ?? "cashier"} with role ${session.role}.</p>
            </article>
          </section>
        </section>
      </main>
    `,
    onMount: ({ navigate }) => {
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
  };
}
