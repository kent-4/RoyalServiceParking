import { renderButton } from "../../components/button/action-button.js";
import { renderPanelCard } from "../../components/card/panel-card.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { fetchCurrentParkingRate } from "../../services/parking-rate-service.js";
import { formatCurrency } from "../../utils/formatters.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";

export function createCashierParkingRatePage({ session, pathname }) {
  return {
    html: renderCashierShell({
      session,
      currentPath: pathname,
      eyebrow: "Parking rate",
      title: "Keep the active hourly rate visible during cashier operations",
      description:
        "Use the current backend rate as a read-only reference during arrival explanations, payment review, and receipt confirmation.",
      headerActions: `
        ${renderButton({ label: "Open bookings", href: "/cashier/bookings", tone: "primary" })}
        ${renderButton({ label: "Dashboard", href: "/cashier/dashboard", tone: "ghost" })}
      `,
      notice: `
        <div class="operations-notice-panel__content">
          <span class="metric-card__label">Read-only pricing</span>
          <h2>Cashiers can review the active rate here, but rate management stays in the admin workflow.</h2>
          <p class="page-copy">
            The same backend rate is reused by booking completion and receipt generation, so this page is the right place to verify pricing at the desk.
          </p>
        </div>
      `,
      content: `
        <section class="dashboard-grid cashier-rate-grid" data-cashier-rate-panels>
          ${renderLoadingPanelCards({ count: 2 })}
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindCashierShell({ navigate });

      const panelsRoot = document.querySelector("[data-cashier-rate-panels]");

      try {
        const data = await fetchCurrentParkingRate();
        const hourlyRate = Number(data.hourlyRate || 0);

        if (panelsRoot) {
          panelsRoot.innerHTML = `
            ${renderPanelCard({
              eyebrow: "Current rate",
              title: "Active hourly pricing",
              className: "operations-card-accent",
              content: `
                <span class="metric-card__label">Backend source of truth</span>
                <strong class="panel-card__value">${formatCurrency(hourlyRate)}</strong>
                <p class="page-copy">This exact rate is used by booking completion and the final printed receipt.</p>
                <div class="detail-list">
                  <div><span>1-hour example</span><strong>${formatCurrency(hourlyRate)}</strong></div>
                  <div><span>4-hour example</span><strong>${formatCurrency(hourlyRate * 4)}</strong></div>
                  <div><span>12-hour example</span><strong>${formatCurrency(hourlyRate * 12)}</strong></div>
                </div>
              `
            })}
            ${renderPanelCard({
              eyebrow: "Pricing reminders",
              title: "What the cashier should remember",
              content: `
                <div class="operations-panel-list">
                  <article>
                    <strong>Read-only role</strong>
                    <p>Cashiers can verify the active rate here but should not change it from this workspace.</p>
                  </article>
                  <article>
                    <strong>Rounded billing</strong>
                    <p>Partial hours are rounded up by the backend during session completion.</p>
                  </article>
                  <article>
                    <strong>Receipt alignment</strong>
                    <p>The printed receipt uses the same hourly rate and completion totals shown in the cashier payment flow.</p>
                  </article>
                </div>
              `
            })}
          `;
        }
      } catch (error) {
        if (panelsRoot) {
          panelsRoot.innerHTML = renderErrorState({
            title: "Parking rate unavailable",
            message: error.message || "The active parking rate could not be loaded."
          });
        }
      }
    }
  };
}
