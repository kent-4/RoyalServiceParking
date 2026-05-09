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
              <article class="action-card action-card--disabled">
                <strong>User desk</strong>
                <p>Verified-user search and customer details are the next cashier module in the rebuild queue.</p>
              </article>
              <article class="action-card action-card--disabled">
                <strong>Booking desk</strong>
                <p>Arrival, completion, and receipt actions will land after the shared cashier shell stabilizes.</p>
              </article>
              <article class="action-card action-card--disabled">
                <strong>Operations feed</strong>
                <p>Cashier notifications still need a final contract decision because the legacy feed is booking-derived.</p>
              </article>
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
