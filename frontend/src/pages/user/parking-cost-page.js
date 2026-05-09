import { fetchCurrentParkingRate } from "../../services/parking-rate-service.js";
import { formatCurrency } from "../../utils/formatters.js";
import { bindUserShell, renderUserShell } from "./user-shell.js";

export function createUserParkingCostPage({ session, pathname }) {
  return {
    html: renderUserShell({
      session,
      currentPath: pathname,
      eyebrow: "Parking cost",
      title: "Estimate your parking fee before booking",
      description:
        "Review the current hourly rate and test quick calculations before you move into the booking flow.",
      content: `
        <section class="dashboard-grid">
          <article class="panel-card" data-rate-summary>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--value"></div>
            <div class="loading-block loading-block--line"></div>
          </article>
          <article class="panel-card" data-rate-calculator>
            <h2>Cost calculator</h2>
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
            <p class="page-copy">Partial hours are rounded up by the backend during actual booking completion workflows.</p>
          </article>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindUserShell({ navigate });

      const rateSummary = document.querySelector("[data-rate-summary]");
      const hoursField = document.querySelector("#parking-hours");
      const totalCostNode = document.querySelector("[data-total-cost]");

      let hourlyRate = 0;

      function updateTotal() {
        const hours = Math.max(1, Math.min(24, Number(hoursField?.value || 1)));
        if (hoursField) {
          hoursField.value = String(hours);
        }
        if (totalCostNode) {
          totalCostNode.textContent = formatCurrency(hourlyRate * hours);
        }
      }

      try {
        const data = await fetchCurrentParkingRate();
        hourlyRate = Number(data.hourlyRate || 0);

        if (rateSummary) {
          rateSummary.innerHTML = `
            <span class="metric-card__label">Current hourly rate</span>
            <strong class="panel-card__value">${formatCurrency(hourlyRate)}</strong>
            <p class="page-copy">This is the active rate the backend currently uses for booking and completion calculations.</p>
            <div class="detail-list">
              <div><span>Example for 1 hour</span><strong>${formatCurrency(hourlyRate)}</strong></div>
              <div><span>Example for 3 hours</span><strong>${formatCurrency(hourlyRate * 3)}</strong></div>
            </div>
          `;
        }

        updateTotal();
      } catch (error) {
        if (rateSummary) {
          rateSummary.innerHTML = `
            <h2>Rate unavailable</h2>
            <p class="page-copy">${error.message || "Unable to load the parking rate."}</p>
          `;
        }
      }

      hoursField?.addEventListener("input", updateTotal);
    }
  };
}
