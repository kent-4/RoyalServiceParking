import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { fetchCashierDashboard } from "../../services/cashier-service.js";
import { formatCurrency } from "../../utils/formatters.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";

export function createCashierDashboardPage({ session, pathname }) {
  return {
    html: renderCashierShell({
      session,
      currentPath: pathname,
      eyebrow: "Cashier operations",
      title: "Keep the arrival queue and payment desk moving",
      description:
        "Track the live queue, current parking rate, and the next action-ready bookings from one tablet-friendly operations dashboard.",
      headerActions: `
        ${renderButton({ label: "Open bookings", href: "/cashier/bookings", tone: "primary" })}
        ${renderButton({ label: "Open notifications", href: "/cashier/notifications", tone: "secondary" })}
      `,
      notice: `
        <div class="operations-notice-panel__content">
          <span class="metric-card__label">Desk rule</span>
          <h2>Reserved bookings move to arrived first, then into payment and receipt handling.</h2>
          <p class="page-copy">
            Keep the reserved and arrived counts visible so the cashier desk always knows which sessions need action now.
          </p>
        </div>
      `,
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
          <div data-cashier-rate-card>
            <article class="panel-card panel-card--loading">
              <div class="loading-block loading-block--title"></div>
              <div class="loading-block loading-block--line"></div>
              <div class="loading-block loading-block--line"></div>
            </article>
          </div>
          <article class="panel-card operations-card-accent">
            <div class="panel-card__header">
              <span class="eyebrow">Quick routes</span>
              <h2>Cashier actions</h2>
              <p class="page-copy">Jump straight into the desks used during arrival, completion, and escalation work.</p>
            </div>
            <div class="operations-quick-grid">
              <a class="action-card" href="/cashier/bookings" data-link>
                <strong>Booking desk</strong>
                <p>Prioritize reserved and arrived sessions, then move completed work into receipt output.</p>
              </a>
              <a class="action-card" href="/cashier/users" data-link>
                <strong>User desk</strong>
                <p>Verify contact, vehicle, and restriction details before handling edge cases at the counter.</p>
              </a>
              <a class="action-card" href="/cashier/notifications" data-link>
                <strong>Operations feed</strong>
                <p>Review current-booking, arrival, and blocklist alerts without leaving the cashier workspace.</p>
              </a>
            </div>
          </article>
        </section>
        <section class="operations-split-grid">
          <div data-cashier-priority-card>
            <article class="panel-card panel-card--loading">
              <div class="loading-block loading-block--title"></div>
              <div class="loading-block loading-block--line"></div>
              <div class="loading-block loading-block--line"></div>
            </article>
          </div>
          <article class="panel-card">
            <div class="panel-card__header">
              <span class="eyebrow">Workflow guide</span>
              <h2>What the cashier desk should watch</h2>
            </div>
            <div class="operations-panel-list">
              <article>
                <strong>Reserved queue</strong>
                <p>Bookings in RESERVED are the first arrival-check candidates on site.</p>
              </article>
              <article>
                <strong>Arrived queue</strong>
                <p>Bookings in ARRIVED are the payment queue and should lead directly into completion.</p>
              </article>
              <article>
                <strong>Capacity pressure</strong>
                <p>Available-slot visibility helps the cashier spot when the facility is getting tight.</p>
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
      const priorityRoot = document.querySelector("[data-cashier-priority-card]");

      try {
        const data = await fetchCashierDashboard();

        if (kpiRoot) {
          kpiRoot.innerHTML = [
            { label: "Verified users", value: data.totalUsers, helper: "Searchable in the cashier desk", icon: "US" },
            { label: "Reserved queue", value: data.totalReserved, helper: "Arrival-ready bookings", icon: "RS" },
            { label: "Available slots", value: data.totalAvailable, helper: "Open capacity right now", icon: "SL" },
            { label: "Currently parked", value: data.totalParked, helper: "Active sessions on site", icon: "PK" }
          ]
            .map((item) => renderKpiCard(item))
            .join("");
        }

        if (rateRoot) {
          const projectedThreeHours = Number(data.currentHourlyRate || 0) * 3;
          rateRoot.innerHTML = renderPanelCard({
            eyebrow: "Rate reference",
            title: "Current hourly rate",
            description: "Use the same backend rate preview the completion and receipt flows will apply.",
            content: `
              <strong class="panel-card__value">${formatCurrency(data.currentHourlyRate)}</strong>
              <div class="detail-list">
                <div><span>3-hour sample</span><strong>${formatCurrency(projectedThreeHours)}</strong></div>
                <div><span>Reserved queue</span><strong>${data.totalReserved}</strong></div>
                <div><span>Open capacity</span><strong>${data.totalAvailable}</strong></div>
              </div>
            `,
            footer: `
              <div class="auth-support-links">
                <a class="button button--secondary" href="/cashier/parking-cost" data-link>Open rate view</a>
              </div>
            `
          });
        }

        if (priorityRoot) {
          const reservedTone = data.totalReserved > 0 ? "warning" : "success";
          const parkedTone = data.totalParked > 0 ? "info" : "success";
          const capacityTone = data.totalAvailable < 10 ? "warning" : "success";

          priorityRoot.innerHTML = renderPanelCard({
            eyebrow: "Attention now",
            title: "Queue pressure snapshot",
            description: "These counts determine where the counter should move next.",
            content: `
              <div class="operations-priority-list">
                <article data-tone="${reservedTone}">
                  <h3>${data.totalReserved > 0 ? "Reserved bookings are waiting for arrival handling" : "No reserved backlog is waiting right now"}</h3>
                  <p>${data.totalReserved > 0 ? `${data.totalReserved} booking${data.totalReserved === 1 ? "" : "s"} should be watched for check-in.` : "The desk can shift attention to active parked sessions and notifications."}</p>
                </article>
                <article data-tone="${parkedTone}">
                  <h3>${data.totalParked} parked session${data.totalParked === 1 ? "" : "s"} currently active</h3>
                  <p>These are the sessions most likely to convert into payment and receipt work next.</p>
                </article>
                <article data-tone="${capacityTone}">
                  <h3>${data.totalAvailable} slot${data.totalAvailable === 1 ? "" : "s"} available</h3>
                  <p>Use the capacity signal when explaining availability pressure to drivers at the desk.</p>
                </article>
              </div>
            `
          });
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

        if (priorityRoot) {
          priorityRoot.innerHTML = "";
        }
      }
    }
  };
}
