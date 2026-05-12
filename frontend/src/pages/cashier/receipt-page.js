import { renderButton } from "../../components/button/action-button.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { fetchCashierBookingReceipt } from "../../services/cashier-service.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";

function durationText(receipt) {
  return `${receipt.parkingDays > 0 ? `${receipt.parkingDays} day${receipt.parkingDays === 1 ? "" : "s"} ` : ""}${receipt.parkingHours} hour${receipt.parkingHours === 1 ? "" : "s"}`;
}

export function createCashierReceiptPage({ session, pathname, query }) {
  const bookingId = query?.get("id") ?? "";

  return {
    html: renderCashierShell({
      session,
      currentPath: pathname,
      eyebrow: "Cashier receipt",
      title: "Review the print-ready session receipt",
      description:
        "Use the finalized session record for handoff, then print the receipt without the operational shell.",
      headerActions: `
        ${renderButton({ label: "Back to bookings", href: "/cashier/bookings", tone: "secondary" })}
      `,
      notice: `
        <div class="operations-notice-panel__content">
          <span class="metric-card__label">Receipt output</span>
          <h2>This screen is the final printable record after a parking session has been completed.</h2>
          <p class="page-copy">
            Confirm the booking, vehicle, time-in, time-out, duration, rate, and total before printing for the customer.
          </p>
        </div>
      `,
      content: `
        <div data-cashier-receipt-alerts></div>
        <section class="receipt-print-page" data-cashier-receipt-root>
          ${renderLoadingPanelCards({ count: 1, lines: 4 })}
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindCashierShell({ navigate });

      const alertsRoot = document.querySelector("[data-cashier-receipt-alerts]");
      const receiptRoot = document.querySelector("[data-cashier-receipt-root]");

      if (!bookingId) {
        navigate("/cashier/bookings", { replace: true });
        return;
      }

      function bindPrintButton() {
        document.querySelector("[data-print-receipt]")?.addEventListener("click", () => {
          window.print();
        });
      }

      try {
        const receipt = await fetchCashierBookingReceipt(bookingId);

        if (receiptRoot) {
          receiptRoot.innerHTML = `
            <div class="receipt-page__actions no-print">
              ${renderButton({
                label: "Print receipt",
                tone: "primary",
                attributes: { "data-print-receipt": true }
              })}
              ${renderButton({
                label: "Back to bookings",
                href: "/cashier/bookings",
                tone: "secondary"
              })}
            </div>
            <article class="receipt-card">
              <header class="receipt-card__header">
                <h2>Royal Service Parking</h2>
                <p>Official Parking Receipt</p>
                <span>Receipt #${receipt.bookingId}</span>
              </header>
              <div class="receipt-card__rows">
                <div class="receipt-row"><span>Customer</span><strong>${receipt.fullName}</strong></div>
                <div class="receipt-row"><span>Plate number</span><strong>${receipt.plateNumber}</strong></div>
                <div class="receipt-row"><span>Vehicle type</span><strong>${receipt.vehicleType}</strong></div>
                <div class="receipt-row"><span>Date</span><strong>${formatDate(receipt.date)}</strong></div>
                <div class="receipt-row"><span>Location</span><strong>${receipt.level} - ${receipt.slotName}</strong></div>
                <div class="receipt-row"><span>Time in</span><strong>${formatTime(receipt.startTime)}</strong></div>
                <div class="receipt-row"><span>Time out</span><strong>${formatTime(receipt.exitTime)}</strong></div>
                <div class="receipt-row"><span>Duration</span><strong>${durationText(receipt)}</strong></div>
                <div class="receipt-row"><span>Total hours</span><strong>${receipt.totalHours}</strong></div>
                <div class="receipt-row"><span>Rate per hour</span><strong>${formatCurrency(receipt.hourlyRate)}</strong></div>
              </div>
              <div class="receipt-total">
                <span>Total amount</span>
                <strong>${formatCurrency(receipt.totalCost)}</strong>
              </div>
              <footer class="receipt-card__footer">
                <p>Thank you for choosing Royal Service Parking.</p>
                <p>Status: ${receipt.status}</p>
              </footer>
            </article>
          `;
        }

        bindPrintButton();
      } catch (error) {
        if (alertsRoot) {
          alertsRoot.innerHTML = renderErrorState({
            title: "Receipt unavailable",
            message: error.message || "The receipt could not be loaded."
          });
        }
        if (receiptRoot) {
          receiptRoot.innerHTML = "";
        }
      }
    }
  };
}
