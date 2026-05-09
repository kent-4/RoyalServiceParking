import { renderRoleSidebar } from "../../components/sidebar/role-sidebar.js";
import { logout } from "../../services/auth-service.js";
import { setAuthState } from "../../state/auth-store.js";

export function createAdminDashboardPage({ session, pathname }) {
  return {
    html: `
      <main class="role-shell">
        ${renderRoleSidebar(session, pathname)}
        <section class="role-shell__content">
          <header class="page-header">
            <span class="eyebrow">Admin workspace</span>
            <h1 class="page-title" tabindex="-1" data-page-heading>Management shell ready</h1>
            <p class="page-copy">
              The admin route group is protected and ready for dashboards, rate management, blocklists, and reporting.
            </p>
          </header>
          <section class="panel-grid">
            <article class="panel-card">
              <h2>Immediate next pages</h2>
              <p>Dashboard KPIs, users, bookings, rate controls, and blocklist management.</p>
            </article>
            <article class="panel-card">
              <h2>Current session</h2>
              <p>Signed in as ${session.username ?? "admin"} with role ${session.role}.</p>
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
