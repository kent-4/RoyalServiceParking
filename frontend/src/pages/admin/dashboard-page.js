import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { fetchAdminDashboard } from "../../services/admin-service.js";
import { formatCurrency } from "../../utils/formatters.js";
import { bindAdminShell, renderAdminShell } from "./admin-shell.js";

export function createAdminDashboardPage({ session, pathname }) {
  return {
    html: renderAdminShell({
      session,
      currentPath: pathname,
      eyebrow: "Admin control center",
      title: "Monitor platform health and management priorities",
      description:
        "Review platform-wide booking pressure, user activity, current parking rate, and the next admin rebuild surfaces from one staff shell.",
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-admin-kpis>
          ${renderLoadingPanelCards({ count: 4, includeValue: true, lines: 0 })}
        </section>
        <section class="dashboard-grid cashier-dashboard-grid">
          <div data-admin-rate-card>
            ${renderLoadingPanelCards({ count: 1, lines: 3 })}
          </div>
          ${renderPanelCard({
            title: "Admin quick actions",
            description: "Use the rebuilt dashboard now, then continue into the next management surfaces from the same shell.",
            content: `
              <div class="action-stack">
                <div class="action-card">
                  <strong><a href="/admin/users" data-link>Users management</a></strong>
                  <p>Open the verified-user directory and inspect customer account records from the rebuilt admin flow.</p>
                </div>
                <div class="action-card">
                  <strong>Bookings oversight</strong>
                  <p><a href="/admin/bookings" data-link>Open the booking oversight table</a> to audit reservation status, customer activity, and slot usage.</p>
                </div>
                <div class="action-card">
                  <strong>Rate and blocklist controls</strong>
                  <p><a href="/admin/parking-cost" data-link>Open parking-rate management</a> or <a href="/admin/blocklist" data-link>review active restrictions</a> from the rebuilt admin controls.</p>
                </div>
                <div class="action-card">
                  <strong><a href="/admin/reports" data-link>Reports dashboard</a></strong>
                  <p>Review booking and earnings analytics before Excel and PDF export flows are rebuilt.</p>
                </div>
              </div>
            `
          })}
        </section>
        <section data-admin-system-card>
          ${renderLoadingPanelCards({ count: 1, lines: 4 })}
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindAdminShell({ navigate });

      const kpiRoot = document.querySelector("[data-admin-kpis]");
      const rateRoot = document.querySelector("[data-admin-rate-card]");
      const systemRoot = document.querySelector("[data-admin-system-card]");

      try {
        const data = await fetchAdminDashboard();

        if (kpiRoot) {
          kpiRoot.innerHTML = [
            renderKpiCard({ label: "Verified users", value: data.totalUsers, helper: "Eligible customer accounts" }),
            renderKpiCard({ label: "Reserved bookings", value: data.totalReserved, helper: "Waiting for arrival or resolution" }),
            renderKpiCard({ label: "Available slots", value: data.totalAvailable, helper: "Current open parking capacity" }),
            renderKpiCard({ label: "Currently parked", value: data.totalParked, helper: "Active on-site sessions" })
          ].join("");
        }

        if (rateRoot) {
          rateRoot.innerHTML = renderPanelCard({
            title: "Current parking rate",
            description: "The admin dashboard exposes the active backend rate and links into the rebuilt management screen.",
            content: `
              <p class="page-copy">The current hourly rate is <strong>${formatCurrency(data.currentHourlyRate)}</strong>.</p>
              <div class="detail-list">
                <div><span>Reserved queue</span><strong>${data.totalReserved}</strong></div>
                <div><span>Parked vehicles</span><strong>${data.totalParked}</strong></div>
                <div><span>Open capacity</span><strong>${data.totalAvailable}</strong></div>
              </div>
              <div class="auth-support-links">
                <a class="button button--secondary" href="/admin/parking-cost" data-link>Open rate management</a>
              </div>
            `
          });
        }

        if (systemRoot) {
          systemRoot.innerHTML = renderPanelCard({
            title: "System snapshot",
            description: "This keeps the legacy dashboard summary intent while staying honest about what is already exposed in the rebuild.",
            content: `
              <div class="detail-list">
                <div><span>Dashboard API</span><strong>Live</strong></div>
                <div><span>Session model</span><strong>Server-managed</strong></div>
                <div><span>Frontend shell</span><strong>Admin ready</strong></div>
                <div><span>Next rebuild slice</span><strong>Blocklist management</strong></div>
              </div>
            `
          });
        }
      } catch (error) {
        const errorMarkup = renderErrorState({
          title: "Admin dashboard unavailable",
          message: error.message || "Unable to load admin dashboard data."
        });

        if (kpiRoot) {
          kpiRoot.innerHTML = errorMarkup;
        }

        if (rateRoot) {
          rateRoot.innerHTML = "";
        }

        if (systemRoot) {
          systemRoot.innerHTML = "";
        }
      }
    }
  };
}
