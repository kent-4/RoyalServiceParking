import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { renderFieldGroup, renderInputField, renderSelectField } from "../../components/form/form-field.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { openConfirmDialog } from "../../components/dialog/confirm-dialog.js";
import { cancelUserBooking, fetchUserBookings } from "../../services/booking-service.js";
import { pushToast } from "../../state/ui-store.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindUserShell, renderUserShell } from "./user-shell.js";

function renderBookingRecord(booking) {
  return `
    <article class="booking-record">
      <div class="booking-record__header">
        <div>
          <h3>Booking #${booking.id}</h3>
          <p>${booking.level} - ${booking.slotName}</p>
        </div>
        ${renderStatusBadge(booking.status)}
      </div>
      <div class="detail-list">
        <div><span>Date</span><strong>${formatDate(booking.date)}</strong></div>
        <div><span>Start time</span><strong>${formatTime(booking.startTime)}</strong></div>
        <div><span>Exit time</span><strong>${formatTime(booking.exitTime)}</strong></div>
        <div><span>Plate number</span><strong>${booking.plateNumber}</strong></div>
        <div><span>Vehicle type</span><strong>${booking.vehicleType}</strong></div>
        <div><span>Estimated cost</span><strong>${formatCurrency(booking.parkingCost)}</strong></div>
      </div>
      <div class="booking-record__footer">
        <span class="booking-record__meta">Customer: ${booking.fullName || "Unknown user"}</span>
        ${
          booking.cancellable
            ? renderButton({
                label: "Cancel booking",
                tone: "danger",
                attributes: { "data-cancel-booking": booking.id }
              })
            : ""
        }
      </div>
    </article>
  `;
}

export function createUserBookingsPage({ session, pathname, query }) {
  const initialFilters = {
    status: query?.get("status") ?? "",
    date: query?.get("date") ?? "",
    search: query?.get("search") ?? ""
  };

  return {
    html: renderUserShell({
      session,
      currentPath: pathname,
      eyebrow: "Booking history",
      title: "Track and manage your reservations",
      description:
        "Review active and past bookings, filter by status or date, and cancel reserved bookings before arrival.",
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-bookings-summary>
          ${renderLoadingPanelCards({ count: 3 })}
        </section>
        <section class="dashboard-grid booking-flow-grid">
          ${renderPanelCard({
            className: "booking-form-card",
            title: "Filter bookings",
            description: "Search by booking ID, plate number, level, or slot name.",
            content: `
              <form class="stack-sm" data-bookings-filter-form>
                <div class="field-row">
                  ${renderFieldGroup({
                    label: "Status",
                    inputId: "booking-filter-status",
                    input: renderSelectField({
                      id: "booking-filter-status",
                      name: "status",
                      value: initialFilters.status,
                      options: [
                        { value: "", label: "All statuses" },
                        { value: "RESERVED", label: "Reserved" },
                        { value: "ARRIVED", label: "Arrived" },
                        { value: "COMPLETED", label: "Completed" },
                        { value: "CANCELED", label: "Canceled" }
                      ]
                    })
                  })}
                  ${renderFieldGroup({
                    label: "Date",
                    inputId: "booking-filter-date",
                    input: renderInputField({
                      id: "booking-filter-date",
                      name: "date",
                      type: "date",
                      value: initialFilters.date
                    })
                  })}
                </div>
                ${renderFieldGroup({
                  label: "Search",
                  inputId: "booking-filter-search",
                  input: renderInputField({
                    id: "booking-filter-search",
                    name: "search",
                    type: "search",
                    value: initialFilters.search,
                    placeholder: "Booking ID, plate number, level, or slot"
                  })
                })}
                <div class="auth-support-links">
                  ${renderButton({ label: "Apply filters", type: "submit", tone: "primary" })}
                  ${renderButton({ label: "Clear", href: "/user/bookings", tone: "secondary" })}
                  ${renderButton({ label: "Book new parking", href: "/user/book", tone: "ghost" })}
                </div>
              </form>
            `
          })}
          ${renderPanelCard({
            title: "Booking rules",
            content: `
              <ul class="journey-list">
                <li>Only reserved bookings can be canceled from the user portal.</li>
                <li>Users must arrive within one hour of the scheduled start time to avoid automatic cancellation.</li>
                <li>The current backend logic still allows only one active reserved or arrived booking per user.</li>
              </ul>
            `
          })}
        </section>
        <section class="stack-sm">
          <div data-bookings-alerts></div>
          <div class="booking-results-grid" data-bookings-results>
            ${renderLoadingPanelCards({ count: 3 })}
          </div>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindUserShell({ navigate });

      const form = document.querySelector("[data-bookings-filter-form]");
      const alertsRoot = document.querySelector("[data-bookings-alerts]");
      const summaryRoot = document.querySelector("[data-bookings-summary]");
      const resultsRoot = document.querySelector("[data-bookings-results]");

      let currentResponse = null;
      let cancelPendingId = null;

      function renderAlerts() {
        if (!alertsRoot || !currentResponse) {
          return;
        }

        if (currentResponse.blocklisted) {
          alertsRoot.innerHTML = renderInlineAlert({
            tone: "warning",
            title: "Account restriction still active",
            message:
              currentResponse.blocklistUntil
                ? `${currentResponse.blocklistMessage} Current restriction ends ${formatDate(currentResponse.blocklistUntil)}.`
                : currentResponse.blocklistMessage
          });
          return;
        }

        alertsRoot.innerHTML = "";
      }

      function renderSummary() {
        if (!summaryRoot || !currentResponse) {
          return;
        }

        summaryRoot.innerHTML = [
          renderKpiCard({ label: "Matching results", value: currentResponse.totalResults }),
          renderKpiCard({ label: "Reserved", value: currentResponse.reservedCount }),
          renderKpiCard({ label: "Completed", value: currentResponse.completedCount })
        ].join("");
      }

      function renderResults() {
        if (!resultsRoot || !currentResponse) {
          return;
        }

        if (!currentResponse.bookings.length) {
          resultsRoot.innerHTML = renderEmptyState({
            title: "No bookings match the current filter",
            message: "Clear one or more filters, or create a new booking to start the reservation history."
          });
          return;
        }

        resultsRoot.innerHTML = currentResponse.bookings.map(renderBookingRecord).join("");
      }

      async function loadBookings(filters) {
        if (summaryRoot) {
          summaryRoot.innerHTML = renderLoadingPanelCards({ count: 3 });
        }
        if (resultsRoot) {
          resultsRoot.innerHTML = renderLoadingPanelCards({ count: 3 });
        }

        try {
          currentResponse = await fetchUserBookings(filters);
          renderAlerts();
          renderSummary();
          renderResults();
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Bookings unavailable",
              message: error.message || "Your booking history could not be loaded."
            });
          }
          if (summaryRoot) {
            summaryRoot.innerHTML = "";
          }
          if (resultsRoot) {
            resultsRoot.innerHTML = "";
          }
        }
      }

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const next = new URLSearchParams();

        ["status", "date", "search"].forEach((key) => {
          const value = String(formData.get(key) ?? "").trim();
          if (value) {
            next.set(key, value);
          }
        });

        navigate(`/user/bookings${next.toString() ? `?${next.toString()}` : ""}`, {
          replace: true
        });
      });

      resultsRoot?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-cancel-booking]");
        if (!button || cancelPendingId) {
          return;
        }

        const bookingId = button.getAttribute("data-cancel-booking");
        const booking = currentResponse?.bookings.find((item) => String(item.id) === bookingId);
        if (!booking) {
          return;
        }

        const approved = await openConfirmDialog({
          title: "Cancel this booking",
          message: `Cancel booking #${booking.id} for ${booking.level} ${booking.slotName} on ${formatDate(
            booking.date
          )}?`,
          confirmLabel: "Cancel booking",
          tone: "danger"
        });

        if (!approved) {
          return;
        }

        cancelPendingId = bookingId;
        button.disabled = true;
        button.textContent = "Canceling...";

        try {
          await cancelUserBooking(booking.id);
          pushToast({
            tone: "success",
            title: "Booking canceled",
            message: `Booking #${booking.id} has been released successfully.`
          });
          await loadBookings(initialFilters);
        } catch (error) {
          button.disabled = false;
          button.textContent = "Cancel booking";
          if (alertsRoot) {
            alertsRoot.innerHTML = renderInlineAlert({
              tone: "danger",
              title: "Unable to cancel booking",
              message: error.message || "The booking could not be canceled."
            });
          }
        } finally {
          cancelPendingId = null;
        }
      });

      await loadBookings(initialFilters);
    }
  };
}
