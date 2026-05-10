import { renderButton } from "../../components/button/action-button.js";
import { renderPanelCard } from "../../components/card/panel-card.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { openConfirmDialog } from "../../components/dialog/confirm-dialog.js";
import { completeCashierBooking, fetchCashierBookingPayment } from "../../services/cashier-service.js";
import { pushToast } from "../../state/ui-store.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";

function durationText(payment) {
  return `${payment.parkingDays > 0 ? `${payment.parkingDays} day${payment.parkingDays === 1 ? "" : "s"} ` : ""}${payment.parkingHours} hour${payment.parkingHours === 1 ? "" : "s"}`;
}

export function createCashierPaymentPage({ session, pathname, query }) {
  const bookingId = query?.get("id") ?? "";

  return {
    html: renderCashierShell({
      session,
      currentPath: pathname,
      eyebrow: "Cashier payment",
      title: "Review parking session payment",
      description:
        "Use the backend preview to confirm exit time, billable duration, and total amount before completing the parking session.",
      content: `
        <div data-cashier-payment-alerts></div>
        <section class="dashboard-grid cashier-dashboard-grid" data-cashier-payment-panels>
          ${renderLoadingPanelCards({ count: 2 })}
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindCashierShell({ navigate });

      const alertsRoot = document.querySelector("[data-cashier-payment-alerts]");
      const panelsRoot = document.querySelector("[data-cashier-payment-panels]");

      if (!bookingId) {
        navigate("/cashier/bookings", { replace: true });
        return;
      }

      let payment = null;
      let busy = false;

      function renderPanels() {
        if (!panelsRoot || !payment) {
          return;
        }

        panelsRoot.innerHTML = `
          ${renderPanelCard({
            title: `Booking #${payment.bookingId}`,
            description: "Current session summary from the backend billing preview.",
            content: `
              <div class="detail-list">
                <div><span>Customer</span><strong>${payment.fullName}</strong></div>
                <div><span>Email</span><strong>${payment.email}</strong></div>
                <div><span>Plate number</span><strong>${payment.plateNumber}</strong></div>
                <div><span>Vehicle type</span><strong>${payment.vehicleType}</strong></div>
                <div><span>Date</span><strong>${formatDate(payment.date)}</strong></div>
                <div><span>Location</span><strong>${payment.level} - ${payment.slotName}</strong></div>
                <div><span>Start time</span><strong>${formatTime(payment.startTime)}</strong></div>
                <div><span>Exit preview</span><strong>${formatTime(payment.previewExitTime)}</strong></div>
                <div><span>Status</span><strong>${payment.status}</strong></div>
              </div>
            `
          })}
          ${renderPanelCard({
            title: "Billing preview",
            description: "The backend remains the source of truth for duration rounding, minimum charge, and slot release on completion.",
            content: `
              <div class="detail-list">
                <div><span>Duration</span><strong>${durationText(payment)}</strong></div>
                <div><span>Total hours</span><strong>${payment.totalHours}</strong></div>
                <div><span>Hourly rate</span><strong>${formatCurrency(payment.hourlyRate)}</strong></div>
                <div><span>Total cost</span><strong>${formatCurrency(payment.previewCost)}</strong></div>
              </div>
            `,
            footer: `
              <div class="auth-support-links">
                ${
                  payment.canComplete
                    ? renderButton({
                        label: "Complete payment",
                        tone: "primary",
                        attributes: { "data-complete-booking": payment.bookingId }
                      })
                    : renderButton({
                        label: "Open receipt",
                        href: `/cashier/bookings/receipt?id=${encodeURIComponent(payment.bookingId)}`,
                        tone: "secondary"
                      })
                }
                ${renderButton({ label: "Back to bookings", href: "/cashier/bookings", tone: "ghost" })}
              </div>
            `
          })}
        `;
      }

      async function loadPayment() {
        if (panelsRoot) {
          panelsRoot.innerHTML = renderLoadingPanelCards({ count: 2 });
        }

        try {
          payment = await fetchCashierBookingPayment(bookingId);
          if (alertsRoot) {
            alertsRoot.innerHTML = payment.canComplete
              ? ""
              : renderErrorState({
                  title: "Completion unavailable",
                  message: "Only arrived bookings can be completed. Open the receipt if this session has already been closed.",
                  tone: "info"
                });
          }
          renderPanels();
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Payment preview unavailable",
              message: error.message || "The payment preview could not be loaded."
            });
          }
          if (panelsRoot) {
            panelsRoot.innerHTML = "";
          }
        }
      }

      panelsRoot?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-complete-booking]");
        if (!button || !payment || busy) {
          return;
        }

        const approved = await openConfirmDialog({
          title: "Complete this parking session",
          message: `Complete booking #${payment.bookingId} for ${payment.fullName} and finalize ${formatCurrency(payment.previewCost)}?`,
          confirmLabel: "Complete payment"
        });

        if (!approved) {
          return;
        }

        busy = true;
        button.disabled = true;
        button.textContent = "Completing...";

        try {
          const result = await completeCashierBooking(payment.bookingId);
          pushToast({
            tone: "success",
            title: "Payment completed",
            message: result.message || `Booking #${payment.bookingId} was completed successfully.`
          });
          navigate(`/cashier/bookings/receipt?id=${encodeURIComponent(result.bookingId ?? payment.bookingId)}`, {
            replace: true
          });
        } catch (error) {
          busy = false;
          button.disabled = false;
          button.textContent = "Complete payment";
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Unable to complete payment",
              message: error.message || "The parking session could not be completed."
            });
          }
        }
      });

      await loadPayment();
    }
  };
}
