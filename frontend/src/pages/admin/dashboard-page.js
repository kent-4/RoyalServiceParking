import { renderButton } from "../../components/button/action-button.js";
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
        "Review customer activity, booking pressure, pricing, restrictions, and reporting priorities from one management shell.",
      actions: `
        ${renderButton({ label: "Open reports", href: "/admin/reports", tone: "secondary" })}
        ${renderButton({ label: "Review blocklist", href: "/admin/blocklist", tone: "primary" })}
      `,
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-admin-kpis>
          ${renderLoadingPanelCards({ count: 4, includeValue: true, lines: 0 })}
        </section>
        <section class="dashboard-grid admin-overview-grid">
          <div data-admin-rate-card>
            ${renderLoadingPanelCards({ count: 1, lines: 3 })}
          </div>
          ${renderPanelCard({
            title: "Admin control queue",
            description: "Use the current management surfaces to inspect accounts, rate controls, restrictions, and exports without leaving the admin shell.",
            content: `
              <div class="action-stack">
                <div class="action-card">
                  <strong><a href="/admin/users" data-link>User management</a></strong>
                  <p>Inspect verified customer records, review standing, and open account detail views.</p>
                </div>
                <div class="action-card">
                  <strong>Bookings oversight</strong>
                  <p><a href="/admin/bookings" data-link>Open the oversight table</a> to audit reservation status, customer activity, and slot usage.</p>
                </div>
                <div class="action-card">
                  <strong>Rate and blocklist controls</strong>
                  <p><a href="/admin/parking-cost" data-link>Adjust the active rate</a> or <a href="/admin/blocklist" data-link>review active restrictions</a> for policy overrides.</p>
                </div>
                <div class="action-card">
                  <strong><a href="/admin/reports" data-link>Reports dashboard</a></strong>
                  <p>Review booking and earnings analytics, then export the same filtered dataset to Excel or PDF.</p>
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
            renderKpiCard({ label: "Verified users", value: data.totalUsers, helper: "Eligible customer accounts", icon: "U" }),
            renderKpiCard({ label: "Reserved bookings", value: data.totalReserved, helper: "Waiting for arrival or resolution", icon: "R" }),
            renderKpiCard({ label: "Available slots", value: data.totalAvailable, helper: "Current open parking capacity", icon: "A" }),
            renderKpiCard({ label: "Currently parked", value: data.totalParked, helper: "Active on-site sessions", icon: "P" })
          ].join("");
        }

        if (rateRoot) {
          rateRoot.innerHTML = renderPanelCard({
            className: "operations-card-accent",
            title: "Current parking rate",
            description: "The dashboard keeps the current backend rate visible so pricing changes stay tied to live reservation activity.",
            content: `
              <div class="admin-account-hero admin-account-hero--compact">
                <div class="admin-avatar-badge admin-avatar-badge--rate">PHP</div>
                <div class="admin-account-hero__copy">
                  <span class="eyebrow">Active configuration</span>
                  <h2>${formatCurrency(data.currentHourlyRate)}</h2>
                  <p class="page-copy">Applies to new bookings while cashier completion continues to use backend billing rules.</p>
                </div>
                <span class="status-badge status-badge--success">Active rate</span>
              </div>
              <div class="admin-preview-grid">
                <article><span>Reserved queue</span><strong>${data.totalReserved}</strong></article>
                <article><span>Parked vehicles</span><strong>${data.totalParked}</strong></article>
                <article><span>Open capacity</span><strong>${data.totalAvailable}</strong></article>
              </div>
              <div class="auth-support-links">
                <a class="button button--secondary" href="/admin/parking-cost" data-link>Open rate management</a>
              </div>
            `
          });
        }

        if (systemRoot) {
          systemRoot.innerHTML = `
            <div class="dashboard-grid admin-overview-grid">
              ${renderPanelCard({
                title: "System oversight snapshot",
                description: "The rebuilt admin dashboard keeps operationally honest signals visible while deeper telemetry remains a future backend enhancement.",
                content: `
                  <div class="detail-list">
                    <div><span>Dashboard API</span><strong>Live</strong></div>
                    <div><span>Session model</span><strong>Server-managed</strong></div>
                    <div><span>Pricing control</span><strong>Admin writable</strong></div>
                    <div><span>Restriction review</span><strong>Active</strong></div>
                  </div>
                `
              })}
              ${renderPanelCard({
                title: "Alerts hub",
                description: "Use this panel as the current management guide until server-health telemetry and terminal monitoring are exposed directly by the backend.",
                content: `
                  <ul class="admin-policy-list">
                    <li><strong>Policy watch:</strong> Review blocklisted users before lifting restrictions on repeated no-show cases.</li>
                    <li><strong>Pricing watch:</strong> Rate changes apply to new bookings immediately and should be communicated to cashier staff.</li>
                    <li><strong>Export watch:</strong> Reports reflect completed-booking earnings only, matching the backend report contract.</li>
                  </ul>
                `
              })}
            </div>
          `;
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
