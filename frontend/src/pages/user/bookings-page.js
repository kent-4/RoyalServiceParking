import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { openConfirmDialog } from "../../components/dialog/confirm-dialog.js";
import { cancelUserBooking, fetchUserBookings } from "../../services/booking-service.js";
import { pushToast } from "../../state/ui-store.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindUserShell, renderUserShell } from "./user-shell.js";

function renderBookingsSkeleton() {
  return Array.from({ length: 3 })
    .map(
      () => `
        <article class="panel-card panel-card--loading">
          <div class="loading-block loading-block--title"></div>
          <div class="loading-block loading-block--line"></div>
          <div class="loading-block loading-block--line"></div>
        </article>
      `
    )
    .join("");
}

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
            ? `<button class="button button--danger" type="button" data-cancel-booking="${booking.id}">Cancel booking</button>`
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
          ${renderBookingsSkeleton()}
        </section>
        <section class="dashboard-grid booking-flow-grid">
          <article class="panel-card booking-form-card">
            <div class="booking-form-card__header">
              <h2>Filter bookings</h2>
              <p class="page-copy">Search by booking ID, plate number, level, or slot name.</p>
            </div>
            <form class="stack-sm" data-bookings-filter-form>
              <div class="field-row">
                <div class="field-group">
                  <label for="booking-filter-status">Status</label>
                  <select id="booking-filter-status" name="status">
                    <option value="">All statuses</option>
                    <option value="RESERVED" ${initialFilters.status === "RESERVED" ? "selected" : ""}>Reserved</option>
                    <option value="ARRIVED" ${initialFilters.status === "ARRIVED" ? "selected" : ""}>Arrived</option>
                    <option value="COMPLETED" ${initialFilters.status === "COMPLETED" ? "selected" : ""}>Completed</option>
                    <option value="CANCELED" ${initialFilters.status === "CANCELED" ? "selected" : ""}>Canceled</option>
                  </select>
                </div>
                <div class="field-group">
                  <label for="booking-filter-date">Date</label>
                  <input id="booking-filter-date" name="date" type="date" value="${initialFilters.date}" />
                </div>
              </div>
              <div class="field-group">
                <label for="booking-filter-search">Search</label>
                <input
                  id="booking-filter-search"
                  name="search"
                  type="search"
                  value="${initialFilters.search}"
                  placeholder="Booking ID, plate number, level, or slot"
                />
              </div>
              <div class="auth-support-links">
                <button class="button button--primary" type="submit">Apply filters</button>
                <a class="button button--secondary" href="/user/bookings" data-link>Clear</a>
                <a class="button button--ghost" href="/user/book" data-link>Book new parking</a>
              </div>
            </form>
          </article>
          <article class="panel-card">
            <h2>Booking rules</h2>
            <ul class="journey-list">
              <li>Only reserved bookings can be canceled from the user portal.</li>
              <li>Users must arrive within one hour of the scheduled start time to avoid automatic cancellation.</li>
              <li>The current backend logic still allows only one active reserved or arrived booking per user.</li>
            </ul>
          </article>
        </section>
        <section class="stack-sm">
          <div data-bookings-alerts></div>
          <div class="booking-results-grid" data-bookings-results>
            ${renderBookingsSkeleton()}
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

        summaryRoot.innerHTML = `
          <article class="panel-card kpi-card">
            <span class="metric-card__label">Matching results</span>
            <strong>${currentResponse.totalResults}</strong>
          </article>
          <article class="panel-card kpi-card">
            <span class="metric-card__label">Reserved</span>
            <strong>${currentResponse.reservedCount}</strong>
          </article>
          <article class="panel-card kpi-card">
            <span class="metric-card__label">Completed</span>
            <strong>${currentResponse.completedCount}</strong>
          </article>
        `;
      }

      function renderResults() {
        if (!resultsRoot || !currentResponse) {
          return;
        }

        if (!currentResponse.bookings.length) {
          resultsRoot.innerHTML = `
            <article class="panel-card booking-empty-state">
              <h2>No bookings match the current filter</h2>
              <p class="page-copy">Clear one or more filters, or create a new booking to start the reservation history.</p>
            </article>
          `;
          return;
        }

        resultsRoot.innerHTML = currentResponse.bookings.map(renderBookingRecord).join("");
      }

      async function loadBookings(filters) {
        if (summaryRoot) {
          summaryRoot.innerHTML = renderBookingsSkeleton();
        }
        if (resultsRoot) {
          resultsRoot.innerHTML = renderBookingsSkeleton();
        }

        try {
          currentResponse = await fetchUserBookings(filters);
          renderAlerts();
          renderSummary();
          renderResults();
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderInlineAlert({
              tone: "danger",
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
