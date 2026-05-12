import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards, renderLoadingTable } from "../../components/feedback/loading-state.js";
import { renderFieldGroup, renderInputField } from "../../components/form/form-field.js";
import { renderDataTable } from "../../components/table/data-table.js";
import { fetchCashierUsers } from "../../services/cashier-service.js";
import { formatDate } from "../../utils/formatters.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";

function renderAccountBadge(user) {
  return user.blocklisted
    ? renderStatusBadge("BLOCKLISTED")
    : '<span class="status-badge status-badge--success">Active</span>';
}

const userColumns = [
  {
    key: "fullName",
    label: "Customer",
    render: (user) => `
      <div class="table-cell-stack">
        <strong>${user.fullName}</strong>
        <span>${user.email}</span>
      </div>
    `
  },
  {
    key: "contact",
    label: "Contact",
    render: (user) => `
      <div class="table-cell-stack">
        <strong>${user.phoneNumber || "Not provided"}</strong>
        <span>${user.address || "Address not provided"}</span>
      </div>
    `
  },
  { key: "plateNumber", label: "Plate" },
  {
    key: "restriction",
    label: "Standing",
    render: (user) => `
      <div class="table-cell-stack">
        ${renderAccountBadge(user)}
        <span>${user.blocklisted ? `Until ${formatDate(user.blocklistUntil)}` : "Good standing"}</span>
      </div>
    `
  },
  {
    key: "actions",
    label: "Action",
    cellClassName: "data-table__actions",
    render: (user) =>
      renderButton({
        label: "View details",
        href: `/cashier/users/detail?id=${encodeURIComponent(user.id)}`,
        tone: "secondary"
      })
  }
];

export function createCashierUsersPage({ session, pathname, query }) {
  const initialSearch = query?.get("search") ?? "";

  return {
    html: renderCashierShell({
      session,
      currentPath: pathname,
      eyebrow: "Cashier users",
      title: "Search customer records used during on-site operations",
      description:
        "Review verified customer accounts, check restriction state, and open vehicle details before moving into arrival or payment work.",
      headerActions: `
        ${renderButton({ label: "Open bookings", href: "/cashier/bookings", tone: "primary" })}
        ${renderButton({ label: "Dashboard", href: "/cashier/dashboard", tone: "ghost" })}
      `,
      notice: `
        <div class="operations-notice-panel__content">
          <span class="metric-card__label">User desk</span>
          <h2>Use this list to confirm identity, standing, and plate details before counter actions.</h2>
          <p class="page-copy">
            Verified customer records stay separate from staff accounts, and restricted users should be escalated before further booking handling.
          </p>
        </div>
      `,
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-cashier-users-summary>
          ${renderLoadingPanelCards({ count: 3 })}
        </section>
        <section class="operations-split-grid">
          ${renderPanelCard({
            className: "operations-card-accent",
            eyebrow: "Search and filter",
            title: "Find verified users quickly",
            description: "Search by customer name, email, or plate number.",
            content: `
              <form class="stack-sm" data-cashier-users-form>
                <div class="field-row field-row--single">
                  ${renderFieldGroup({
                    label: "Search verified users",
                    inputId: "cashier-users-search",
                    input: renderInputField({
                      id: "cashier-users-search",
                      name: "search",
                      type: "search",
                      value: initialSearch,
                      placeholder: "Name, email, or plate number"
                    }),
                    hint: "Only verified customer accounts are shown here."
                  })}
                </div>
                <div class="auth-support-links">
                  ${renderButton({ label: "Apply search", type: "submit", tone: "primary" })}
                  ${renderButton({ label: "Clear", href: "/cashier/users", tone: "secondary" })}
                </div>
              </form>
            `
          })}
          ${renderPanelCard({
            eyebrow: "Desk guidance",
            title: "What the cashier should confirm",
            content: `
              <div class="operations-panel-list">
                <article>
                  <strong>Restriction state</strong>
                  <p>Blocklisted users should be treated as exceptions before booking or completion work continues.</p>
                </article>
                <article>
                  <strong>Plate accuracy</strong>
                  <p>Use the stored plate number as the first vehicle-matching checkpoint at the desk.</p>
                </article>
                <article>
                  <strong>Recent account context</strong>
                  <p>The detail view carries the richer contact, vehicle, and booking summary needed during live operations.</p>
                </article>
              </div>
            `
          })}
        </section>
        <section class="stack-sm">
          <div data-cashier-users-alerts></div>
          <div data-cashier-users-list>
            ${renderLoadingTable({ columns: userColumns.length, rows: 4 })}
          </div>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindCashierShell({ navigate });

      const form = document.querySelector("[data-cashier-users-form]");
      const summaryRoot = document.querySelector("[data-cashier-users-summary]");
      const alertsRoot = document.querySelector("[data-cashier-users-alerts]");
      const listRoot = document.querySelector("[data-cashier-users-list]");

      async function loadUsers(search) {
        if (summaryRoot) {
          summaryRoot.innerHTML = renderLoadingPanelCards({ count: 3 });
        }
        if (listRoot) {
          listRoot.innerHTML = renderLoadingTable({ columns: userColumns.length, rows: 4 });
        }

        try {
          const data = await fetchCashierUsers({ search });

          if (summaryRoot) {
            summaryRoot.innerHTML = [
              renderKpiCard({ label: "Matching users", value: data.totalResults, helper: "Current search result count", icon: "RS" }),
              renderKpiCard({ label: "Verified customers", value: data.totalVerifiedUsers, helper: "Available to cashier workflows", icon: "VR" }),
              renderKpiCard({ label: "Restricted users", value: data.restrictedUsers, helper: "Needs escalation before action", icon: "BL" })
            ].join("");
          }

          if (listRoot) {
            listRoot.innerHTML = data.users.length
              ? renderDataTable({
                  columns: userColumns,
                  rows: data.users,
                  emptyTitle: "No verified users matched this search",
                  emptyMessage: "Try a different name, email, or plate-number query."
                })
              : renderEmptyState({
                  title: "No verified users matched this search",
                  message: "Try a different name, email, or plate-number query."
                });
          }

          if (alertsRoot) {
            alertsRoot.innerHTML = data.restrictedUsers > 0
              ? renderErrorState({
                  title: "Restricted users are present in the directory",
                  message: `${data.restrictedUsers} verified user${data.restrictedUsers === 1 ? "" : "s"} currently show a booking restriction.`
                })
              : "";
          }
        } catch (error) {
          if (summaryRoot) {
            summaryRoot.innerHTML = "";
          }
          if (listRoot) {
            listRoot.innerHTML = "";
          }
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "User records unavailable",
              message: error.message || "The cashier users list could not be loaded."
            });
          }
        }
      }

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const search = String(formData.get("search") ?? "").trim();
        navigate(`/cashier/users${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
          replace: true
        });
      });

      await loadUsers(initialSearch);
    }
  };
}
