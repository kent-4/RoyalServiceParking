import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards, renderLoadingTable } from "../../components/feedback/loading-state.js";
import { renderFieldGroup, renderInputField } from "../../components/form/form-field.js";
import { fetchCashierUsers } from "../../services/cashier-service.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { renderDataTable } from "../../components/table/data-table.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";
import { formatDate } from "../../utils/formatters.js";

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
  { key: "phoneNumber", label: "Phone" },
  { key: "plateNumber", label: "Plate" },
  { key: "address", label: "Address" },
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
      title: "Review verified customer accounts",
      description:
        "Search verified customer records, check restriction status, and open vehicle details before arrival or payment operations.",
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-cashier-users-summary>
          ${renderLoadingPanelCards({ count: 3 })}
        </section>
        <section class="stack-sm">
          ${renderPanelCard({
            title: "Search verified users",
            description: "Filter the verified customer directory by name, email, or plate number.",
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
                    hint: "Verified accounts only. Staff and unverified registrations are excluded."
                  })}
                </div>
                <div class="auth-support-links">
                  ${renderButton({ label: "Apply search", type: "submit", tone: "primary" })}
                  ${renderButton({ label: "Clear", href: "/cashier/users", tone: "secondary" })}
                  ${renderButton({ label: "Back to dashboard", href: "/cashier/dashboard", tone: "ghost" })}
                </div>
              </form>
            `
          })}
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
              renderKpiCard({ label: "Matching users", value: data.totalResults }),
              renderKpiCard({ label: "Verified customers", value: data.totalVerifiedUsers }),
              renderKpiCard({ label: "Restricted users", value: data.restrictedUsers })
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
            alertsRoot.innerHTML = "";
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
