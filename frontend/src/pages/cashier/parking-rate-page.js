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
      title: "Review the active parking rate",
      description:
        "Use the backend’s current hourly rate as the source of truth during arrival, payment, and receipt workflows.",
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
              title: "Current hourly rate",
              content: `
                <span class="metric-card__label">Active backend rate</span>
                <strong class="panel-card__value">${formatCurrency(hourlyRate)}</strong>
                <p class="page-copy">This is the same rate used in booking completion and receipt totals.</p>
                <div class="detail-list">
                  <div><span>Example for 1 hour</span><strong>${formatCurrency(hourlyRate)}</strong></div>
                  <div><span>Example for 4 hours</span><strong>${formatCurrency(hourlyRate * 4)}</strong></div>
                  <div><span>Example for 12 hours</span><strong>${formatCurrency(hourlyRate * 12)}</strong></div>
                </div>
              `
            })}
            ${renderPanelCard({
              title: "Cashier note",
              content: `
                <ul class="journey-list">
                  <li>Cashiers can review the active rate but should not change it from this area.</li>
                  <li>Partial hours are rounded up by the backend during booking completion.</li>
                  <li>Rate management remains an admin responsibility in the rebuild plan.</li>
                </ul>
              `,
              footer: `
                <div class="auth-support-links">
                  ${renderButton({ label: "Back to dashboard", href: "/cashier/dashboard", tone: "secondary" })}
                  ${renderButton({ label: "Open bookings", href: "/cashier/bookings", tone: "ghost" })}
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
