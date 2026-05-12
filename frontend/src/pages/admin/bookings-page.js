import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards, renderLoadingTable } from "../../components/feedback/loading-state.js";
import { renderFieldGroup, renderInputField, renderSelectField } from "../../components/form/form-field.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { renderDataTable } from "../../components/table/data-table.js";
import { fetchAdminBookings } from "../../services/admin-service.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindAdminShell, renderAdminShell } from "./admin-shell.js";

function renderStatusCell(booking) {
  const meta =
    booking.status === "ARRIVED" && booking.arrivalTime
      ? `Arrived ${formatTime(booking.arrivalTime.split("T")[1] ?? "")}`
      : booking.status === "RESERVED"
        ? "Queued for arrival monitoring"
        : booking.status === "COMPLETED"
          ? "Payment already closed"
          : "Released or canceled booking";

  return `
    <div class="table-cell-stack">
      ${renderStatusBadge(booking.status)}
      <span>${meta}</span>
    </div>
  `;
}

function renderActionCell(booking) {
  if (!booking.userId) {
    return '<div class="table-actions"><span class="status-badge status-badge--neutral">No linked user</span></div>';
  }

  return `
    <div class="table-actions">
      ${renderButton({
        label: "User details",
        href: `/admin/users/detail?id=${encodeURIComponent(booking.userId)}`,
        tone: "secondary"
      })}
    </div>
  `;
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
    key: "contact",
    label: "Contact",
    render: (booking) => `
      <div class="table-cell-stack">
        <strong>${booking.email}</strong>
        <span>${booking.plateNumber}</span>
      </div>
    `
  },
  {
    key: "vehicle",
    label: "Vehicle",
    render: (booking) => `
      <div class="table-cell-stack">
        <strong>${booking.vehicleType}</strong>
        <span>${booking.plateNumber}</span>
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

export function createAdminBookingsPage({ session, pathname, query }) {
  const initialFilters = {
    status: query?.get("status") ?? "",
    date: query?.get("date") ?? "",
    user: query?.get("user") ?? "",
    slot: query?.get("slot") ?? ""
  };

  return {
    html: renderAdminShell({
      session,
      currentPath: pathname,
      eyebrow: "Admin bookings",
      title: "Audit reservations and completed parking activity",
      description:
        "Filter bookings by status, date, user, and slot to monitor the reservation pipeline and review account-linked parking activity.",
      actions: `
        ${renderButton({ label: "Open users", href: "/admin/users", tone: "secondary" })}
        ${renderButton({ label: "Open reports", href: "/admin/reports", tone: "ghost" })}
      `,
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-admin-bookings-summary>
          ${renderLoadingPanelCards({ count: 4 })}
        </section>
        <section class="dashboard-grid admin-overview-grid">
          ${renderPanelCard({
            className: "booking-form-card",
            title: "Filter booking records",
            description: "Search by user name or email and narrow results by date, status, or slot context.",
            content: `
              <form class="stack-sm" data-admin-bookings-form>
                <div class="field-row">
                  ${renderFieldGroup({
                    label: "Status",
                    inputId: "admin-booking-filter-status",
                    input: renderSelectField({
                      id: "admin-booking-filter-status",
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
                    inputId: "admin-booking-filter-date",
                    input: renderInputField({
                      id: "admin-booking-filter-date",
                      name: "date",
                      type: "date",
                      value: initialFilters.date
                    })
                  })}
                </div>
                <div class="field-row">
                  ${renderFieldGroup({
                    label: "User search",
                    inputId: "admin-booking-filter-user",
                    input: renderInputField({
                      id: "admin-booking-filter-user",
                      name: "user",
                      type: "search",
                      value: initialFilters.user,
                      placeholder: "Customer name or email"
                    })
                  })}
                  ${renderFieldGroup({
                    label: "Slot or level",
                    inputId: "admin-booking-filter-slot",
                    input: renderInputField({
                      id: "admin-booking-filter-slot",
                      name: "slot",
                      type: "search",
                      value: initialFilters.slot,
                      placeholder: "Level 1 or Slot A"
                    })
                  })}
                </div>
                <div class="admin-note-surface">
                  <strong>Oversight intent</strong>
                  <p>This screen is for audit and policy review. Arrival, payment, and receipt actions stay inside the cashier portal.</p>
                </div>
                <div class="auth-support-links">
                  ${renderButton({ label: "Apply filters", type: "submit", tone: "primary" })}
                  ${renderButton({ label: "Clear", href: "/admin/bookings", tone: "secondary" })}
                  ${renderButton({ label: "Back to dashboard", href: "/admin/dashboard", tone: "ghost" })}
                </div>
              </form>
            `
          })}
          ${renderPanelCard({
            className: "operations-card-accent",
            title: "Management view",
            content: `
              <ul class="admin-policy-list">
                <li><strong>Flow health:</strong> Review reservation pressure here instead of performing cashier arrival or payment work.</li>
                <li><strong>Customer traceability:</strong> User details stay one click away so restrictions and booking history can be reviewed together.</li>
                <li><strong>Support review:</strong> Canceled bookings remain visible to support blocklist follow-up and dispute handling.</li>
              </ul>
            `
          })}
        </section>
        <section class="stack-sm">
          <div data-admin-bookings-alerts></div>
          <div data-admin-bookings-results>
            ${renderLoadingTable({ columns: bookingColumns.length, rows: 5 })}
          </div>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindAdminShell({ navigate });

      const form = document.querySelector("[data-admin-bookings-form]");
      const alertsRoot = document.querySelector("[data-admin-bookings-alerts]");
      const summaryRoot = document.querySelector("[data-admin-bookings-summary]");
      const resultsRoot = document.querySelector("[data-admin-bookings-results]");

      let currentResponse = null;

      function renderSummary() {
        if (!summaryRoot || !currentResponse) {
          return;
        }

        summaryRoot.innerHTML = [
          renderKpiCard({ label: "Matching bookings", value: currentResponse.totalResults, helper: "Current filtered result set", icon: "MB" }),
          renderKpiCard({ label: "Reserved", value: currentResponse.reservedCount, helper: "Waiting for arrival", icon: "RS" }),
          renderKpiCard({ label: "Arrived", value: currentResponse.arrivedCount, helper: "On-site sessions", icon: "AR" }),
          renderKpiCard({ label: "Completed", value: currentResponse.completedCount, helper: "Closed sessions", icon: "CP" })
        ].join("");
      }

      function renderResults() {
        if (!resultsRoot || !currentResponse) {
          return;
        }

        if (!currentResponse.bookings.length) {
          resultsRoot.innerHTML = renderEmptyState({
            title: "No bookings match the current filter",
            message: "Adjust the status, date, user, or slot query to continue admin review."
          });
          return;
        }

        resultsRoot.innerHTML = renderDataTable({
          columns: bookingColumns,
          rows: currentResponse.bookings,
          emptyTitle: "No bookings match the current filter",
          emptyMessage: "Adjust the status, date, user, or slot query to continue admin review."
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
          currentResponse = await fetchAdminBookings(filters);
          if (alertsRoot) {
            alertsRoot.innerHTML = currentResponse.canceledCount > 0
              ? renderInlineAlert({
                  tone: "warning",
                  title: "Canceled bookings in scope",
                  message: `${currentResponse.canceledCount} canceled booking${currentResponse.canceledCount === 1 ? "" : "s"} are included in the current admin result set.`
                })
              : "";
          }
          renderSummary();
          renderResults();
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Bookings unavailable",
              message: error.message || "The admin bookings list could not be loaded."
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

        ["status", "date", "user", "slot"].forEach((key) => {
          const value = String(formData.get(key) ?? "").trim();
          if (value) {
            next.set(key, value);
          }
        });

        navigate(`/admin/bookings${next.toString() ? `?${next.toString()}` : ""}`, {
          replace: true
        });
      });

      await loadBookings(initialFilters);
    }
  };
}
