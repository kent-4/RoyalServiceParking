import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { openConfirmDialog } from "../../components/dialog/confirm-dialog.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards, renderLoadingTable } from "../../components/feedback/loading-state.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { renderDataTable } from "../../components/table/data-table.js";
import { fetchAdminBlocklist, removeAdminBlocklist } from "../../services/admin-service.js";
import { pushToast } from "../../state/ui-store.js";
import { formatIsoDateTime } from "../../utils/dates.js";
import { bindAdminShell, renderAdminShell } from "./admin-shell.js";

function renderActionCell(user) {
  return `
    <div class="table-actions">
      ${renderButton({
        label: "Unblock user",
        tone: "danger",
        attributes: { "data-unblock-user": user.id }
      })}
      ${renderButton({
        label: "User details",
        href: `/admin/users/detail?id=${encodeURIComponent(user.id)}`,
        tone: "secondary"
      })}
    </div>
  `;
}

const blocklistColumns = [
  {
    key: "customer",
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
  {
    key: "standing",
    label: "Standing",
    render: (user) => `
      <div class="table-cell-stack">
        ${renderStatusBadge("BLOCKLISTED")}
        <span>${user.isPermanent ? "Permanent restriction" : `Until ${formatIsoDateTime(user.blocklistUntil)}`}</span>
      </div>
    `
  },
  {
    key: "missedBookingsCount",
    label: "Missed bookings",
    render: (user) => `<strong>${user.missedBookingsCount}</strong>`
  },
  {
    key: "actions",
    label: "Actions",
    cellClassName: "data-table__actions",
    render: renderActionCell
  }
];

export function createAdminBlocklistPage({ session, pathname }) {
  return {
    html: renderAdminShell({
      session,
      currentPath: pathname,
      eyebrow: "Admin blocklist",
      title: "Review active account restrictions",
      description:
        "Monitor currently blocklisted users, review restriction timing, and manually remove restrictions when an admin decision overrides the automatic policy.",
      actions: `
        ${renderButton({ label: "Open users", href: "/admin/users", tone: "secondary" })}
        ${renderButton({ label: "Back to dashboard", href: "/admin/dashboard", tone: "ghost" })}
      `,
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-admin-blocklist-summary>
          ${renderLoadingPanelCards({ count: 3 })}
        </section>
        <section class="dashboard-grid admin-overview-grid">
          ${renderPanelCard({
            className: "operations-card-accent",
            title: "Restriction policy",
            content: `
              <ul class="admin-policy-list">
                <li><strong>Automatic policy:</strong> This screen manages active restrictions only. Automatic blocklisting still comes from backend no-show rules.</li>
                <li><strong>Manual override:</strong> Manual unblock is available now for approved admin override cases.</li>
                <li><strong>Deferred scope:</strong> Manual blocklist-add remains pending the documented product decision and is intentionally not exposed yet.</li>
              </ul>
            `
          })}
          ${renderPanelCard({
            title: "Admin note",
            content: `
              <div class="admin-note-surface">
                <strong>Review before override</strong>
                <p>Open the customer detail view before unblocking an account so missed-booking history, vehicle data, and current booking context remain visible.</p>
              </div>
            `,
            footer: `
              <div class="auth-support-links">
                ${renderButton({ label: "Review users", href: "/admin/users", tone: "secondary" })}
                ${renderButton({ label: "Open bookings", href: "/admin/bookings", tone: "ghost" })}
              </div>
            `
          })}
        </section>
        <section class="stack-sm">
          <div data-admin-blocklist-alerts></div>
          <div data-admin-blocklist-results>
            ${renderLoadingTable({ columns: blocklistColumns.length, rows: 4 })}
          </div>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindAdminShell({ navigate });

      const alertsRoot = document.querySelector("[data-admin-blocklist-alerts]");
      const summaryRoot = document.querySelector("[data-admin-blocklist-summary]");
      const resultsRoot = document.querySelector("[data-admin-blocklist-results]");

      let currentResponse = null;
      let pendingUserId = null;

      function renderSummary() {
        if (!summaryRoot || !currentResponse) {
          return;
        }

        summaryRoot.innerHTML = [
          renderKpiCard({ label: "Restricted users", value: currentResponse.totalResults, helper: "Currently active restrictions", icon: "BL" }),
          renderKpiCard({ label: "Expiring within 7 days", value: currentResponse.expiringSoonCount, helper: "Time-based restrictions nearing release", icon: "EX" }),
          renderKpiCard({ label: "Missed bookings in scope", value: currentResponse.totalMissedBookings, helper: "No-show volume behind the current list", icon: "NS" })
        ].join("");
      }

      function renderResults() {
        if (!resultsRoot || !currentResponse) {
          return;
        }

        resultsRoot.innerHTML = currentResponse.users.length
          ? renderDataTable({
              columns: blocklistColumns,
              rows: currentResponse.users,
              emptyTitle: "No blocklisted users",
              emptyMessage: "There are no active account restrictions to review right now."
            })
          : renderEmptyState({
              title: "No blocklisted users",
              message: "There are no active account restrictions to review right now."
            });
      }

      async function loadBlocklist() {
        if (summaryRoot) {
          summaryRoot.innerHTML = renderLoadingPanelCards({ count: 3 });
        }
        if (resultsRoot) {
          resultsRoot.innerHTML = renderLoadingTable({ columns: blocklistColumns.length, rows: 4 });
        }

        try {
          currentResponse = await fetchAdminBlocklist();
          if (alertsRoot) {
            alertsRoot.innerHTML = renderInlineAlert({
              tone: "info",
              title: "Manual blocklist add remains deferred",
              message: "Only review and unblock actions are exposed until the product owner confirms whether manual blocklist creation belongs in the first rebuild pass."
            });
          }
          renderSummary();
          renderResults();
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Blocklist unavailable",
              message: error.message || "The admin blocklist could not be loaded."
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

      resultsRoot?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-unblock-user]");
        if (!button || pendingUserId) {
          return;
        }

        const userId = button.getAttribute("data-unblock-user");
        const user = currentResponse?.users.find((item) => String(item.id) === userId);
        if (!user) {
          return;
        }

        const approved = await openConfirmDialog({
          title: "Remove this restriction",
          message: `Remove the current blocklist restriction for ${user.fullName}?`,
          confirmLabel: "Unblock user",
          tone: "danger"
        });

        if (!approved) {
          return;
        }

        pendingUserId = userId;
        button.disabled = true;
        button.textContent = "Updating...";

        try {
          await removeAdminBlocklist(user.id);
          pushToast({
            tone: "success",
            title: "User unblocked",
            message: `${user.fullName} was removed from the active blocklist.`
          });
          await loadBlocklist();
        } catch (error) {
          button.disabled = false;
          button.textContent = "Unblock user";
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Unable to unblock user",
              message: error.message || "The user could not be removed from the blocklist."
            });
          }
        } finally {
          pendingUserId = null;
        }
      });

      await loadBlocklist();
    }
  };
}
