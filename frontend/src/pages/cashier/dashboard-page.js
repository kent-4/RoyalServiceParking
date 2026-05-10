import { fetchCashierDashboard } from "../../services/cashier-service.js";
import { formatCurrency } from "../../utils/formatters.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";

export function createCashierDashboardPage({ session, pathname }) {
  return {
    html: renderCashierShell({
      session,
      currentPath: pathname,
      eyebrow: "Cashier operations",
      title: "Monitor arrival-ready parking activity",
      description:
        "Track today’s operational totals, current slot pressure, and the rebuild sequence for the cashier workstation.",
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-cashier-kpis>
          ${Array.from({ length: 4 })
            .map(
              () => `
                <article class="panel-card panel-card--loading">
                  <div class="loading-block loading-block--title"></div>
                  <div class="loading-block loading-block--value"></div>
                </article>
              `
            )
            .join("")}
        </section>
        <section class="dashboard-grid cashier-dashboard-grid">
          <article class="panel-card" data-cashier-rate-card>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
          </article>
          <article class="panel-card">
            <h2>Quick actions</h2>
            <div class="action-stack">
              <a class="action-card" href="/cashier/users" data-link>
                <strong>User desk</strong>
                <p>Open verified-user search and inspect account or vehicle details before on-site operations.</p>
              </a>
              <a class="action-card" href="/cashier/bookings" data-link>
                <strong>Booking desk</strong>
                <p>Review operational bookings, confirm arrivals, and move active sessions into payment and receipt handling.</p>
              </a>
              <a class="action-card" href="/cashier/notifications" data-link>
                <strong>Operations feed</strong>
                <p>Track current-booking alerts, arrived vehicles, and blocklisted-user warnings from the cashier feed.</p>
              </a>
            </div>
          </article>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindCashierShell({ navigate });

      const kpiRoot = document.querySelector("[data-cashier-kpis]");
      const rateRoot = document.querySelector("[data-cashier-rate-card]");

      try {
        const data = await fetchCashierDashboard();

        if (kpiRoot) {
          kpiRoot.innerHTML = [
            { label: "Verified users", value: data.totalUsers },
            { label: "Reserved bookings", value: data.totalReserved },
            { label: "Available slots", value: data.totalAvailable },
            { label: "Currently parked", value: data.totalParked }
          ]
            .map(
              (item) => `
                <article class="panel-card kpi-card">
                  <span class="metric-card__label">${item.label}</span>
                  <strong>${item.value}</strong>
                </article>
              `
            )
            .join("");
        }

        if (rateRoot) {
          rateRoot.innerHTML = `
            <h2>Current parking rate</h2>
            <p class="page-copy">The backend’s active hourly rate is <strong>${formatCurrency(data.currentHourlyRate)}</strong>.</p>
            <div class="detail-list">
              <div><span>Reserved queue</span><strong>${data.totalReserved}</strong></div>
              <div><span>Parked vehicles</span><strong>${data.totalParked}</strong></div>
              <div><span>Open capacity</span><strong>${data.totalAvailable}</strong></div>
            </div>
            <div class="auth-support-links">
              <a class="button button--secondary" href="/cashier/parking-cost" data-link>Open rate view</a>
            </div>
          `;
        }
      } catch (error) {
        if (kpiRoot) {
          kpiRoot.innerHTML = `
            <article class="panel-card">
              <h2>Dashboard unavailable</h2>
              <p class="page-copy">${error.message || "Unable to load cashier dashboard data."}</p>
            </article>
          `;
        }

        if (rateRoot) {
          rateRoot.innerHTML = "";
        }
      }
    }
  };
}
