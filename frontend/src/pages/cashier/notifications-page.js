import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { fetchCashierNotifications } from "../../services/cashier-service.js";
import { formatIsoDateTime } from "../../utils/dates.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";

function renderNotificationItem(notification) {
  const modifier = notification.isArrived
    ? "notification-card--arrived"
    : notification.isPresent
      ? "notification-card--present"
      : notification.type === "blocklist"
        ? "notification-card--blocklist"
        : "";

  return `
    <article class="notification-card ${modifier}">
      <div class="notification-card__header">
        <div class="notification-card__meta">
          ${
            notification.type === "blocklist"
              ? renderStatusBadge("BLOCKLISTED")
              : notification.isArrived
                ? renderStatusBadge("ARRIVED")
                : notification.isPresent
                  ? renderStatusBadge("RESERVED")
                  : '<span class="status-badge status-badge--neutral">Queue</span>'
          }
          <span class="notification-card__time">${formatIsoDateTime(notification.createdAt)}</span>
        </div>
      </div>
      <div class="notification-card__content">
        <h3>${notification.title}</h3>
        <p>${notification.message}</p>
      </div>
      <div class="table-actions">
        ${
          notification.bookingId
            ? renderButton({
                label: "Open booking",
                href: `/cashier/bookings?search=${encodeURIComponent(notification.bookingId)}`,
                tone: "secondary"
              })
            : ""
        }
        ${
          notification.userId
            ? renderButton({
                label: "User details",
                href: `/cashier/users/detail?id=${encodeURIComponent(notification.userId)}`,
                tone: "ghost"
              })
            : ""
        }
      </div>
    </article>
  `;
}

export function createCashierNotificationsPage({ session, pathname, query }) {
  const activeFilter = query?.get("type") ?? "all";

  return {
    html: renderCashierShell({
      session,
      currentPath: pathname,
      eyebrow: "Cashier notifications",
      title: "Track active operational alerts",
      description:
        "Monitor current bookings, arrived vehicles, and blocklisted-user alerts from the cashier operations feed.",
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-cashier-notification-summary>
          ${renderLoadingPanelCards({ count: 3 })}
        </section>
        <section class="stack-sm">
          ${renderPanelCard({
            className: "notification-toolbar",
            title: "Feed filters",
            description: "Switch between all alerts, booking activity, and blocklist issues.",
            content: `
              <div class="auth-support-links">
                ${renderButton({ label: "All", href: "/cashier/notifications", tone: activeFilter === "all" ? "primary" : "secondary" })}
                ${renderButton({ label: "Bookings", href: "/cashier/notifications?type=booking", tone: activeFilter === "booking" ? "primary" : "secondary" })}
                ${renderButton({ label: "Blocklisted", href: "/cashier/notifications?type=blocklist", tone: activeFilter === "blocklist" ? "primary" : "secondary" })}
              </div>
            `
          })}
          <div data-cashier-notification-alerts></div>
          <div class="notification-list-grid" data-cashier-notification-list>
            ${renderLoadingPanelCards({ count: 4 })}
          </div>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindCashierShell({ navigate });

      const alertsRoot = document.querySelector("[data-cashier-notification-alerts]");
      const summaryRoot = document.querySelector("[data-cashier-notification-summary]");
      const listRoot = document.querySelector("[data-cashier-notification-list]");

      try {
        const data = await fetchCashierNotifications();
        const notifications = activeFilter === "all"
          ? data.notifications
          : data.notifications.filter((item) => item.type === activeFilter);

        if (summaryRoot) {
          summaryRoot.innerHTML = [
            renderKpiCard({ label: "Current bookings", value: data.currentBookingCount }),
            renderKpiCard({ label: "Arrived vehicles", value: data.arrivedCount }),
            renderKpiCard({ label: "Blocklist alerts", value: data.blocklistCount })
          ].join("");
        }

        if (listRoot) {
          listRoot.innerHTML = notifications.length
            ? notifications.map(renderNotificationItem).join("")
            : renderEmptyState({
                title: "No notifications for this filter",
                message: "Try another feed view or come back when more booking activity is available."
              });
        }

        if (alertsRoot) {
          alertsRoot.innerHTML = data.currentBookingCount > 0
            ? renderErrorState({
                title: "Current bookings require attention",
                message: `${data.currentBookingCount} booking alert${data.currentBookingCount === 1 ? "" : "s"} are currently within the active operations window.`,
                tone: "warning"
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
            title: "Notifications unavailable",
            message: error.message || "The cashier operations feed could not be loaded."
          });
        }
      }
    }
  };
}
