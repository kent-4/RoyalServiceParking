import { renderInlineAlert } from "../../components/alert/inline-alert.js";
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
            : `<button class="button button--secondary" type="button" data-mark-notification-read="${notification.id}">Mark as read</button>`
        }
      </div>
      <div class="notification-card__content">
        <h3>${notification.title || "Notification"}</h3>
        <p>${notification.message}</p>
      </div>
    </article>
  `;
}

function renderNotificationSkeleton() {
  return Array.from({ length: 4 })
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
          ${renderNotificationSkeleton()}
        </section>
        <section class="stack-sm">
          <div data-notifications-alerts></div>
          <div class="notification-toolbar panel-card">
            <div>
              <h2>Inbox actions</h2>
              <p class="page-copy">Unread notifications stay highlighted until you mark them read.</p>
            </div>
            <div class="auth-support-links">
              <button class="button button--primary" type="button" data-mark-all-read>Mark all as read</button>
              <a class="button button--secondary" href="/user/dashboard" data-link>Back to dashboard</a>
            </div>
          </div>
          <div class="notification-list-grid" data-notifications-list>
            ${renderNotificationSkeleton()}
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
        summaryRoot.innerHTML = `
          <article class="panel-card kpi-card">
            <span class="metric-card__label">Total notifications</span>
            <strong>${response.totalCount}</strong>
          </article>
          <article class="panel-card kpi-card">
            <span class="metric-card__label">Unread</span>
            <strong>${response.unreadCount}</strong>
          </article>
          <article class="panel-card kpi-card">
            <span class="metric-card__label">Read</span>
            <strong>${readCount}</strong>
          </article>
        `;
      }

      function renderList() {
        if (!listRoot || !response) {
          return;
        }

        if (!response.notifications.length) {
          listRoot.innerHTML = `
            <article class="panel-card booking-empty-state">
              <h2>No notifications yet</h2>
              <p class="page-copy">Booking confirmations, reminders, restrictions, and other user updates will appear here when they are created by the backend.</p>
            </article>
          `;
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
          summaryRoot.innerHTML = renderNotificationSkeleton();
        }
        if (listRoot) {
          listRoot.innerHTML = renderNotificationSkeleton();
        }

        try {
          response = await fetchUserNotifications();
          renderSummary();
          renderList();
          await refreshUserNotificationBadge();
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderInlineAlert({
              tone: "danger",
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
