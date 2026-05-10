import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { markAllUserNotificationsRead, markUserNotificationRead, fetchUserNotifications } from "../../services/notification-service.js";
import { pushToast } from "../../state/ui-store.js";
import { formatIsoDateTime } from "../../utils/dates.js";
import { bindUserShell, refreshUserNotificationBadge, renderUserShell } from "./user-shell.js";

const typeConfig = {
  BOOKING_CONFIRMATION: { label: "Booking", tone: "success" },
  BOOKING_REMINDER: { label: "Reminder", tone: "info" },
  BLOCKLIST: { label: "Restriction", tone: "danger" },
  UNBLOCK: { label: "Unblock", tone: "success" },
  COMPLETED: { label: "Completed", tone: "success" }
};

function renderNotificationType(type) {
  const config = typeConfig[type] || { label: type || "System", tone: "neutral" };
  return `<span class="status-badge status-badge--${config.tone}">${config.label}</span>`;
}

function renderNotificationItem(notification) {
  return `
    <article class="notification-card ${notification.read ? "" : "is-unread"}" data-notification-card="${notification.id}">
      <div class="notification-card__header">
        <div class="notification-card__meta">
          ${renderNotificationType(notification.type)}
          <span class="notification-card__time">${formatIsoDateTime(notification.createdAt)}</span>
        </div>
        ${
          notification.read
            ? '<span class="notification-card__read-state">Read</span>'
            : renderButton({
                label: "Mark as read",
                tone: "secondary",
                attributes: { "data-mark-notification-read": notification.id }
              })
        }
      </div>
      <div class="notification-card__content">
        <h3>${notification.title || "Notification"}</h3>
        <p>${notification.message}</p>
      </div>
    </article>
  `;
}

export function createUserNotificationsPage({ session, pathname }) {
  return {
    html: renderUserShell({
      session,
      currentPath: pathname,
      eyebrow: "Notifications",
      title: "Track account and booking updates",
      description:
        "Review booking confirmations, reminders, restriction notices, and completion updates from the backend notification pipeline.",
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-notifications-summary>
          ${renderLoadingPanelCards({ count: 3 })}
        </section>
        <section class="stack-sm">
          <div data-notifications-alerts></div>
          ${renderPanelCard({
            className: "notification-toolbar",
            title: "Inbox actions",
            description: "Unread notifications stay highlighted until you mark them read.",
            content: `
              <div class="auth-support-links">
                ${renderButton({
                  label: "Mark all as read",
                  tone: "primary",
                  attributes: { "data-mark-all-read": true }
                })}
                ${renderButton({ label: "Back to dashboard", href: "/user/dashboard", tone: "secondary" })}
              </div>
            `
          })}
          <div class="notification-list-grid" data-notifications-list>
            ${renderLoadingPanelCards({ count: 4 })}
          </div>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindUserShell({ navigate });

      const alertsRoot = document.querySelector("[data-notifications-alerts]");
      const summaryRoot = document.querySelector("[data-notifications-summary]");
      const listRoot = document.querySelector("[data-notifications-list]");
      const markAllButton = document.querySelector("[data-mark-all-read]");

      let response = null;
      let busy = false;

      function renderSummary() {
        if (!summaryRoot || !response) {
          return;
        }

        const readCount = response.totalCount - response.unreadCount;
        summaryRoot.innerHTML = [
          renderKpiCard({ label: "Total notifications", value: response.totalCount }),
          renderKpiCard({ label: "Unread", value: response.unreadCount }),
          renderKpiCard({ label: "Read", value: readCount })
        ].join("");
      }

      function renderList() {
        if (!listRoot || !response) {
          return;
        }

        if (!response.notifications.length) {
          listRoot.innerHTML = renderEmptyState({
            title: "No notifications yet",
            message: "Booking confirmations, reminders, restrictions, and other user updates will appear here when they are created by the backend."
          });
          if (markAllButton) {
            markAllButton.disabled = true;
          }
          return;
        }

        listRoot.innerHTML = response.notifications.map(renderNotificationItem).join("");
        if (markAllButton) {
          markAllButton.disabled = response.unreadCount <= 0 || busy;
        }
      }

      async function loadNotifications() {
        if (summaryRoot) {
          summaryRoot.innerHTML = renderLoadingPanelCards({ count: 3 });
        }
        if (listRoot) {
          listRoot.innerHTML = renderLoadingPanelCards({ count: 4 });
        }

        try {
          response = await fetchUserNotifications();
          renderSummary();
          renderList();
          await refreshUserNotificationBadge();
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderErrorState({
              title: "Notifications unavailable",
              message: error.message || "The notification inbox could not be loaded."
            });
          }
          if (summaryRoot) {
            summaryRoot.innerHTML = "";
          }
          if (listRoot) {
            listRoot.innerHTML = "";
          }
          if (markAllButton) {
            markAllButton.disabled = true;
          }
        }
      }

      listRoot?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-mark-notification-read]");
        if (!button || busy || !response) {
          return;
        }

        const notificationId = Number(button.getAttribute("data-mark-notification-read"));
        if (!notificationId) {
          return;
        }

        busy = true;
        button.disabled = true;
        button.textContent = "Updating...";

        try {
          const result = await markUserNotificationRead(notificationId);
          response = {
            ...response,
            unreadCount: result.unreadCount,
            notifications: response.notifications.map((item) =>
              item.id === notificationId ? { ...item, read: true } : item
            )
          };
          renderSummary();
          renderList();
          await refreshUserNotificationBadge();
          pushToast({
            tone: "success",
            title: "Notification updated",
            message: "The notification has been marked as read."
          });
        } catch (error) {
          button.disabled = false;
          button.textContent = "Mark as read";
          if (alertsRoot) {
            alertsRoot.innerHTML = renderInlineAlert({
              tone: "danger",
              title: "Unable to update notification",
              message: error.message || "The notification could not be marked as read."
            });
          }
        } finally {
          busy = false;
        }
      });

      markAllButton?.addEventListener("click", async () => {
        if (!response || response.unreadCount <= 0 || busy) {
          return;
        }

        busy = true;
        markAllButton.disabled = true;
        markAllButton.textContent = "Updating...";

        try {
          await markAllUserNotificationsRead();
          response = {
            ...response,
            unreadCount: 0,
            notifications: response.notifications.map((item) => ({ ...item, read: true }))
          };
          renderSummary();
          renderList();
          await refreshUserNotificationBadge();
          pushToast({
            tone: "success",
            title: "Inbox updated",
            message: "All notifications have been marked as read."
          });
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderInlineAlert({
              tone: "danger",
              title: "Unable to update inbox",
              message: error.message || "The notifications could not be updated."
            });
          }
        } finally {
          busy = false;
          markAllButton.textContent = "Mark all as read";
          renderList();
        }
      });

      await loadNotifications();
    }
  };
}
