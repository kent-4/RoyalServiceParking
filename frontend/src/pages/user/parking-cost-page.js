import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { fetchCurrentParkingRate } from "../../services/parking-rate-service.js";
import { formatCurrency } from "../../utils/formatters.js";
import { bindUserShell, renderUserShell } from "./user-shell.js";

function renderRateKpiSkeleton() {
  return Array.from({ length: 3 })
    .map(
      () => `
        <article class="panel-card panel-card--loading">
          <div class="loading-block loading-block--title"></div>
          <div class="loading-block loading-block--value"></div>
        </article>
      `
    )
    .join("");
}

export function createUserParkingCostPage({ session, pathname }) {
  return {
    html: renderUserShell({
      session,
      currentPath: pathname,
      eyebrow: "Parking cost",
      title: "Review the current parking rate before you reserve",
      description:
        "Use the active hourly rate, quick examples, and the simple calculator to understand the expected parking cost before booking.",
      headerActions: `
        ${renderButton({ label: "Start booking", href: "/user/book", tone: "primary" })}
        ${renderButton({ label: "Back to dashboard", href: "/user/dashboard", tone: "secondary" })}
      `,
      notice: `
        <div class="user-notice-panel__content">
          <span class="metric-card__label">Billing rules</span>
          <h2>Parking charges round partial hours up, with a one-hour minimum.</h2>
          <p class="page-copy">
            The examples on this page are guides for planning. Final cost still depends on the booking and completion data processed by the backend.
          </p>
        </div>
      `,
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-rate-summary>
          ${renderRateKpiSkeleton()}
        </section>
        <section class="dashboard-grid split-panel-grid">
          <div data-rate-calculator>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
          </div>
          <div data-rate-examples>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--value"></div>
            <div class="loading-block loading-block--line"></div>
          </div>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindUserShell({ navigate });

      const rateSummary = document.querySelector("[data-rate-summary]");
      const calculatorRoot = document.querySelector("[data-rate-calculator]");
      const examplesRoot = document.querySelector("[data-rate-examples]");

      function updateTotal(hoursField, totalNode, hourlyRate) {
        const hours = Math.max(1, Math.min(24, Number(hoursField?.value || 1)));
        if (hoursField) {
          hoursField.value = String(hours);
        }
        if (totalNode) {
          totalNode.textContent = formatCurrency(hourlyRate * hours);
        }
      }

      try {
        const data = await fetchCurrentParkingRate();
        const hourlyRate = Number(data.hourlyRate || 0);

        if (rateSummary) {
          rateSummary.innerHTML = [
            renderKpiCard({ label: "Current hourly rate", value: formatCurrency(hourlyRate), icon: "$" }),
            renderKpiCard({ label: "Minimum billable time", value: "1 hour", icon: "1H" }),
            renderKpiCard({ label: "Three-hour example", value: formatCurrency(hourlyRate * 3), icon: "3H" })
          ].join("");
        }

        if (calculatorRoot) {
          calculatorRoot.innerHTML = renderPanelCard({
            eyebrow: "Cost calculator",
            title: "Test a booking estimate",
            description: "Use a quick hour count to approximate the parking charge before starting a reservation.",
            content: `
              <div class="calculator-grid">
                <div class="field-group">
                  <label for="parking-hours">Number of hours</label>
                  <input id="parking-hours" type="number" min="1" max="24" value="1" />
                </div>
                <div class="calculator-result">
                  <span>Total estimate</span>
                  <strong data-total-cost>${formatCurrency(0)}</strong>
                </div>
              </div>
            `,
            footer: `
              <div class="auth-support-links">
                ${renderButton({ label: "Continue to booking", href: "/user/book", tone: "primary" })}
              </div>
            `
          });
        }

        if (examplesRoot) {
          examplesRoot.innerHTML = renderPanelCard({
            eyebrow: "Cost breakdown",
            title: "Quick pricing examples",
            description: "These examples use the same current hourly rate shown above and follow the one-hour minimum billing rule.",
            content: `
              <div class="cost-breakdown-list">
                <article class="cost-breakdown-item">
                  <span>1 hour stay</span>
                  <strong>${formatCurrency(hourlyRate)}</strong>
                </article>
                <article class="cost-breakdown-item">
                  <span>2 hour stay</span>
                  <strong>${formatCurrency(hourlyRate * 2)}</strong>
                </article>
                <article class="cost-breakdown-item">
                  <span>4 hour stay</span>
                  <strong>${formatCurrency(hourlyRate * 4)}</strong>
                </article>
              </div>
            `,
            footer: `
              <ul class="journey-list">
                <li>Partial hours round up to the next full hour.</li>
                <li>The minimum billing unit is one hour.</li>
                <li>Final totals remain subject to backend booking and completion records.</li>
              </ul>
            `
          });
        }

        const hoursField = document.querySelector("#parking-hours");
        const totalCostNode = document.querySelector("[data-total-cost]");
        updateTotal(hoursField, totalCostNode, hourlyRate);
        hoursField?.addEventListener("input", () => updateTotal(hoursField, totalCostNode, hourlyRate));
      } catch (error) {
        if (rateSummary) {
          rateSummary.innerHTML = `
            <article class="panel-card">
              <h2>Rate unavailable</h2>
              <p class="page-copy">${error.message || "Unable to load the parking rate."}</p>
            </article>
          `;
        }

        if (calculatorRoot) {
          calculatorRoot.innerHTML = `
            <h2>Calculator unavailable</h2>
            <p class="page-copy">Load the current rate first, then return to this page to estimate parking cost.</p>
          `;
        }

        if (examplesRoot) {
          examplesRoot.innerHTML = "";
        }
      }
    }
  };
}
