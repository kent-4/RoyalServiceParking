import { renderButton } from "../../components/button/action-button.js";
import { renderPanelCard } from "../../components/card/panel-card.js";
import { openConfirmDialog } from "../../components/dialog/confirm-dialog.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
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
      title: "Complete the parking session with the backend billing preview",
      description:
        "Confirm booking details, review the rounded duration and cost, then close the session into a printable receipt.",
      headerActions: `
        ${renderButton({ label: "Back to bookings", href: "/cashier/bookings", tone: "secondary" })}
      `,
      notice: `
        <div class="operations-notice-panel__content">
          <span class="metric-card__label">Payment rule</span>
          <h2>The backend remains the source of truth for rounded billing and final completion state.</h2>
          <p class="page-copy">
            Use this preview to confirm the customer, vehicle, time in, exit preview, and cost before finalizing the parking session.
          </p>
        </div>
      `,
      content: `
        <div data-cashier-payment-alerts></div>
        <section class="dashboard-grid cashier-dashboard-grid" data-cashier-payment-panels>
          ${renderLoadingPanelCards({ count: 3 })}
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
            eyebrow: "Booking summary",
            title: `Booking #${payment.bookingId}`,
            description: "Customer, vehicle, and scheduled session context.",
            className: "operations-card-accent",
            content: `
              <div class="detail-list">
                <div><span>Customer</span><strong>${payment.fullName}</strong></div>
                <div><span>Email</span><strong>${payment.email}</strong></div>
                <div><span>Plate number</span><strong>${payment.plateNumber}</strong></div>
                <div><span>Vehicle type</span><strong>${payment.vehicleType}</strong></div>
                <div><span>Date</span><strong>${formatDate(payment.date)}</strong></div>
                <div><span>Location</span><strong>${payment.level} - ${payment.slotName}</strong></div>
              </div>
            `
          })}
          ${renderPanelCard({
            eyebrow: "Arrival and exit",
            title: "Session timing",
            description: "Use the current preview to explain how the duration is being billed.",
            content: `
              <div class="detail-list">
                <div><span>Start time</span><strong>${formatTime(payment.startTime)}</strong></div>
                <div><span>Exit preview</span><strong>${formatTime(payment.previewExitTime)}</strong></div>
                <div><span>Duration</span><strong>${durationText(payment)}</strong></div>
                <div><span>Total billable hours</span><strong>${payment.totalHours}</strong></div>
                <div><span>Status</span><strong>${payment.status}</strong></div>
              </div>
            `
          })}
          ${renderPanelCard({
            eyebrow: "Billing preview",
            title: "Final cost before completion",
            description: "Rounded-up duration and minimum one-hour billing are already reflected below.",
            content: `
              <strong class="panel-card__value">${formatCurrency(payment.previewCost)}</strong>
              <div class="detail-list">
                <div><span>Hourly rate</span><strong>${formatCurrency(payment.hourlyRate)}</strong></div>
                <div><span>Total hours</span><strong>${payment.totalHours}</strong></div>
                <div><span>Final preview</span><strong>${formatCurrency(payment.previewCost)}</strong></div>
              </div>
              <div class="receipt-side-note">
                <h3>Billing note</h3>
                <p>Partial hours are rounded up and the preview never bills less than one hour.</p>
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
          panelsRoot.innerHTML = renderLoadingPanelCards({ count: 3 });
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
