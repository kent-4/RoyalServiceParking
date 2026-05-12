import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards, renderLoadingTable } from "../../components/feedback/loading-state.js";
import { renderFieldGroup, renderInputField } from "../../components/form/form-field.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { renderDataTable } from "../../components/table/data-table.js";
import { fetchAdminUsers } from "../../services/admin-service.js";
import { formatDate } from "../../utils/formatters.js";
import { bindAdminShell, renderAdminShell } from "./admin-shell.js";

function renderAccountBadge(user) {
  return user.blocklisted
    ? renderStatusBadge("BLOCKLISTED")
    : '<span class="status-badge status-badge--success">Verified</span>';
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
    key: "standing",
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
        href: `/admin/users/detail?id=${encodeURIComponent(user.id)}`,
        tone: "secondary"
      })
  }
];

export function createAdminUsersPage({ session, pathname, query }) {
  const initialSearch = query?.get("search") ?? "";

  return {
    html: renderAdminShell({
      session,
      currentPath: pathname,
      eyebrow: "Admin users",
      title: "Manage verified customer accounts",
      description:
        "Search verified users, review standing, and open detailed records before moving into blocklist or booking oversight work.",
      actions: `
        ${renderButton({ label: "Open blocklist", href: "/admin/blocklist", tone: "secondary" })}
        ${renderButton({ label: "Review bookings", href: "/admin/bookings", tone: "ghost" })}
      `,
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-admin-users-summary>
          ${renderLoadingPanelCards({ count: 3 })}
        </section>
        <section class="dashboard-grid admin-overview-grid">
          ${renderPanelCard({
            className: "booking-form-card",
            title: "Search verified users",
            description: "Filter the verified-user directory by name, email, or plate number.",
            content: `
              <form class="stack-sm" data-admin-users-form>
                <div class="field-row field-row--single">
                  ${renderFieldGroup({
                    label: "Search verified users",
                    inputId: "admin-users-search",
                    input: renderInputField({
                      id: "admin-users-search",
                      name: "search",
                      type: "search",
                      value: initialSearch,
                      placeholder: "Name, email, or plate number"
                    }),
                    hint: "This view remains restricted to verified customer accounts. Staff accounts are still managed separately."
                  })}
                </div>
                <div class="admin-note-surface">
                  <strong>Directory scope</strong>
                  <p>This list is limited to verified customer accounts. Staff-account administration remains a separate product decision.</p>
                </div>
                <div class="auth-support-links">
                  ${renderButton({ label: "Apply search", type: "submit", tone: "primary" })}
                  ${renderButton({ label: "Clear", href: "/admin/users", tone: "secondary" })}
                  ${renderButton({ label: "Back to dashboard", href: "/admin/dashboard", tone: "ghost" })}
                </div>
              </form>
            `
          })}
          ${renderPanelCard({
            className: "operations-card-accent",
            title: "Management notes",
            content: `
              <ul class="admin-policy-list">
                <li><strong>Account standing:</strong> Restricted users remain visible here so support and policy review start from one directory.</li>
                <li><strong>Account detail flow:</strong> Open a customer record before lifting restrictions or reviewing booking history.</li>
                <li><strong>Current gap:</strong> Manual staff-account management is still outside the first rebuild pass.</li>
              </ul>
            `
          })}
        </section>
        <section class="stack-sm">
          <div data-admin-users-alerts></div>
          <div data-admin-users-list>
            ${renderLoadingTable({ columns: userColumns.length, rows: 4 })}
          </div>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindAdminShell({ navigate });

      const form = document.querySelector("[data-admin-users-form]");
      const summaryRoot = document.querySelector("[data-admin-users-summary]");
      const alertsRoot = document.querySelector("[data-admin-users-alerts]");
      const listRoot = document.querySelector("[data-admin-users-list]");

      async function loadUsers(search) {
        if (summaryRoot) {
          summaryRoot.innerHTML = renderLoadingPanelCards({ count: 3 });
        }
        if (listRoot) {
          listRoot.innerHTML = renderLoadingTable({ columns: userColumns.length, rows: 4 });
        }

        try {
          const data = await fetchAdminUsers({ search });

          if (summaryRoot) {
            summaryRoot.innerHTML = [
              renderKpiCard({ label: "Matching users", value: data.totalResults, helper: "Current filtered directory result", icon: "MU" }),
              renderKpiCard({ label: "Verified customers", value: data.totalVerifiedUsers, helper: "Eligible customer accounts", icon: "VC" }),
              renderKpiCard({ label: "Restricted users", value: data.restrictedUsers, helper: "Accounts with active restrictions", icon: "BL" })
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
              title: "Admin users unavailable",
              message: error.message || "The admin users list could not be loaded."
            });
          }
        }
      }

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const search = String(formData.get("search") ?? "").trim();
        navigate(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
          replace: true
        });
      });

      await loadUsers(initialSearch);
    }
  };
}
