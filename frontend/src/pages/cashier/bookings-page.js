import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { openConfirmDialog } from "../../components/dialog/confirm-dialog.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards, renderLoadingTable } from "../../components/feedback/loading-state.js";
import { renderFieldGroup, renderInputField, renderSelectField } from "../../components/form/form-field.js";
import { renderDataTable } from "../../components/table/data-table.js";
import { fetchCashierBookings, markCashierBookingArrived } from "../../services/cashier-service.js";
import { pushToast } from "../../state/ui-store.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";

function renderStatusCell(booking) {
  const meta =
    booking.status === "ARRIVED" && booking.arrivalTime
      ? `Arrived ${formatTime(booking.arrivalTime.split("T")[1] ?? "")}`
      : booking.status === "RESERVED"
        ? "Awaiting on-site check-in"
        : booking.status === "COMPLETED"
          ? "Payment already completed"
          : "Closed or released booking";

  return `
    <div class="table-cell-stack">
      ${renderStatusBadge(booking.status)}
      <span>${meta}</span>
    </div>
  `;
}

function renderActionCell(booking) {
  const actions = [];

  if (booking.canMarkArrived) {
    actions.push(
      renderButton({
        label: "Mark arrived",
        tone: "primary",
        attributes: { "data-mark-arrived": booking.id }
      })
    );
  }

  if (booking.canOpenPayment) {
    actions.push(
      renderButton({
        label: "Open payment",
        href: `/cashier/bookings/payment?id=${encodeURIComponent(booking.id)}`,
        tone: "primary"
      })
    );
  }

  if (booking.canViewReceipt) {
    actions.push(
      renderButton({
        label: "Open receipt",
        href: `/cashier/bookings/receipt?id=${encodeURIComponent(booking.id)}`,
        tone: "ghost"
      })
    );
  }

  actions.push(
    renderButton({
      label: "User details",
      href: `/cashier/users/detail?id=${encodeURIComponent(booking.userId)}`,
      tone: "secondary"
    })
  );

  return `<div class="table-actions">${actions.join("")}</div>`;
}

const bookingColumns = [
  {
    key: "booking",
    label: "Booking",
    render: (booking) => `
      <div class="table-cell-stack">
        <strong>#${booking.id}</strong>
        <span>${booking.fullName}</span>
      </div>
    `
  },
  {
    key: "vehicle",
    label: "Vehicle",
    render: (booking) => `
      <div class="table-cell-stack">
        <strong>${booking.plateNumber}</strong>
        <span>${booking.vehicleType}</span>
      </div>
    `
  },
  {
    key: "schedule",
    label: "Schedule",
    render: (booking) => `
      <div class="table-cell-stack">
        <strong>${formatDate(booking.date)}</strong>
        <span>${formatTime(booking.startTime)}</span>
      </div>
    `
  },
  {
    key: "location",
    label: "Location",
    render: (booking) => `
      <div class="table-cell-stack">
        <strong>${booking.level}</strong>
        <span>${booking.slotName}</span>
      </div>
    `
  },
  {
    key: "cost",
    label: "Cost",
    render: (booking) => `
      <div class="table-cell-stack">
        <strong>${formatCurrency(booking.parkingCost)}</strong>
        <span>${booking.exitTime ? `Exit ${formatTime(booking.exitTime)}` : "Exit time pending"}</span>
      </div>
    `
  },
  {
    key: "status",
    label: "Status",
    render: renderStatusCell
  },
  {
    key: "actions",
    label: "Actions",
    cellClassName: "data-table__actions",
    render: renderActionCell
  }
];

export function createCashierBookingsPage({ session, pathname, query }) {
  const initialFilters = {
    status: query?.get("status") ?? "",
    date: query?.get("date") ?? "",
    slot: query?.get("slot") ?? "",
    search: query?.get("search") ?? ""
  };

  return {
    html: renderCashierShell({
      session,
      currentPath: pathname,
      eyebrow: "Cashier bookings",
      title: "Run the main arrival and payment workflow from one table",
      description:
        "Filter operational bookings, surface reserved and arrived work clearly, and move each session into payment or receipt handling.",
      headerActions: `
        ${renderButton({ label: "Notifications", href: "/cashier/notifications", tone: "secondary" })}
        ${renderButton({ label: "Dashboard", href: "/cashier/dashboard", tone: "ghost" })}
      `,
      notice: `
        <div class="operations-notice-panel__content">
          <span class="metric-card__label">Queue priority</span>
          <h2>Reserved and arrived bookings are the action-first states on this screen.</h2>
          <p class="page-copy">
            Mark on-site arrivals first, then move arrived sessions into payment and receipt completion without leaving the cashier workflow.
          </p>
        </div>
      `,
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-cashier-bookings-summary>
          ${renderLoadingPanelCards({ count: 4 })}
        </section>
        <section class="operations-split-grid">
          ${renderPanelCard({
            className: "operations-card-accent",
            eyebrow: "Filter bookings",
            title: "Search the live operations queue",
            description: "Search by booking ID, customer, plate number, level, or slot name.",
            content: `
              <form class="stack-sm" data-cashier-bookings-form>
                <div class="field-row">
                  ${renderFieldGroup({
                    label: "Status",
                    inputId: "cashier-booking-filter-status",
                    input: renderSelectField({
                      id: "cashier-booking-filter-status",
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
                    inputId: "cashier-booking-filter-date",
                    input: renderInputField({
                      id: "cashier-booking-filter-date",
                      name: "date",
                      type: "date",
                      value: initialFilters.date
                    })
                  })}
                </div>
                <div class="field-row">
                  ${renderFieldGroup({
                    label: "Level or slot",
                    inputId: "cashier-booking-filter-slot",
                    input: renderInputField({
                      id: "cashier-booking-filter-slot",
                      name: "slot",
                      type: "search",
                      value: initialFilters.slot,
                      placeholder: "Level 1 or Slot A"
                    })
                  })}
                  ${renderFieldGroup({
                    label: "Search",
                    inputId: "cashier-booking-filter-search",
                    input: renderInputField({
                      id: "cashier-booking-filter-search",
                      name: "search",
                      type: "search",
                      value: initialFilters.search,
                      placeholder: "Booking ID, customer, or plate"
                    })
                  })}
                </div>
                <div class="auth-support-links">
                  ${renderButton({ label: "Apply filters", type: "submit", tone: "primary" })}
                  ${renderButton({ label: "Clear", href: "/cashier/bookings", tone: "secondary" })}
                </div>
              </form>
            `
          })}
          ${renderPanelCard({
            eyebrow: "Workflow guide",
            title: "Action sequence",
            content: `
              <div class="operations-panel-list">
                <article>
                  <strong>Reserved -> Arrived</strong>
                  <p>Only reserved bookings can be checked in from this screen.</p>
                </article>
                <article>
                  <strong>Arrived -> Payment</strong>
                  <p>Arrived sessions are ready for the payment preview and completion route.</p>
                </article>
                <article>
                  <strong>Completed -> Receipt</strong>
                  <p>Closed sessions stay available through the print-ready receipt page.</p>
                </article>
              </div>
            `
          })}
        </section>
        <section class="stack-sm">
          <div data-cashier-bookings-alerts></div>
          <div data-cashier-bookings-results>
            ${renderLoadingTable({ columns: bookingColumns.length, rows: 5 })}
          </div>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindCashierShell({ navigate });

      const form = document.querySelector("[data-cashier-bookings-form]");
      const alertsRoot = document.querySelector("[data-cashier-bookings-alerts]");
      const summaryRoot = document.querySelector("[data-cashier-bookings-summary]");
      const resultsRoot = document.querySelector("[data-cashier-bookings-results]");

      let currentResponse = null;
      let pendingArrivalId = null;

      function renderSummary() {
        if (!summaryRoot || !currentResponse) {
          return;
        }

        summaryRoot.innerHTML = [
          renderKpiCard({ label: "Matching bookings", value: currentResponse.totalResults, helper: "Current filtered result count", icon: "RS" }),
          renderKpiCard({ label: "Reserved", value: currentResponse.reservedCount, helper: "Arrival queue", icon: "RV" }),
          renderKpiCard({ label: "Arrived", value: currentResponse.arrivedCount, helper: "Payment queue", icon: "AR" }),
          renderKpiCard({ label: "Completed", value: currentResponse.completedCount, helper: "Receipt-ready sessions", icon: "OK" })
        ].join("");
      }

      function renderResults() {
        if (!resultsRoot || !currentResponse) {
          return;
        }

        if (!currentResponse.bookings.length) {
          resultsRoot.innerHTML = renderEmptyState({
            title: "No bookings match the current filter",
            message: "Adjust the status, date, level, slot, or search query to continue cashier operations."
          });
          return;
        }

        resultsRoot.innerHTML = renderDataTable({
          columns: bookingColumns,
          rows: currentResponse.bookings,
          emptyTitle: "No bookings match the current filter",
          emptyMessage: "Adjust the status, date, level, slot, or search query to continue cashier operations."
        });
      }

      async function loadBookings(filters) {
        if (summaryRoot) {
          summaryRoot.innerHTML = renderLoadingPanelCards({ count: 4 });
        }
        if (resultsRoot) {
          resultsRoot.innerHTML = renderLoadingTable({ columns: bookingColumns.length, rows: 5 });
        }

        try {
          currentResponse = await fetchCashierBookings(filters);
          if (alertsRoot) {
            alertsRoot.innerHTML = currentResponse.arrivedCount > 0
              ? renderInlineAlert({
                  tone: "info",
                  title: "Payment queue ready",
                  message: `${currentResponse.arrivedCount} arrived booking${currentResponse.arrivedCount === 1 ? "" : "s"} are ready for payment completion.`
                })
              : currentResponse.reservedCount > 0
                ? renderInlineAlert({
                    tone: "warning",
                    title: "Arrival queue active",
                    message: `${currentResponse.reservedCount} reserved booking${currentResponse.reservedCount === 1 ? "" : "s"} still need arrival handling.`
                  })
                : "";
          }
          renderSummary();
          renderResults();
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Bookings unavailable",
              message: error.message || "The cashier bookings list could not be loaded."
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

        ["status", "date", "slot", "search"].forEach((key) => {
          const value = String(formData.get(key) ?? "").trim();
          if (value) {
            next.set(key, value);
          }
        });

        navigate(`/cashier/bookings${next.toString() ? `?${next.toString()}` : ""}`, {
          replace: true
        });
      });

      resultsRoot?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-mark-arrived]");
        if (!button || pendingArrivalId) {
          return;
        }

        const bookingId = button.getAttribute("data-mark-arrived");
        const booking = currentResponse?.bookings.find((item) => String(item.id) === bookingId);
        if (!booking) {
          return;
        }

        const approved = await openConfirmDialog({
          title: "Mark this booking as arrived",
          message: `Mark booking #${booking.id} for ${booking.fullName} at ${booking.level} ${booking.slotName} as arrived now?`,
          confirmLabel: "Mark arrived"
        });

        if (!approved) {
          return;
        }

        pendingArrivalId = bookingId;
        button.disabled = true;
        button.textContent = "Updating...";

        try {
          await markCashierBookingArrived(booking.id);
          pushToast({
            tone: "success",
            title: "Arrival confirmed",
            message: `Booking #${booking.id} is now marked as arrived.`
          });
          await loadBookings(initialFilters);
        } catch (error) {
          button.disabled = false;
          button.textContent = "Mark arrived";
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Unable to mark arrival",
              message: error.message || "The booking could not be updated."
            });
          }
        } finally {
          pendingArrivalId = null;
        }
      });

      await loadBookings(initialFilters);
    }
  };
}
