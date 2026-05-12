import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { renderEmptyState } from "../../components/feedback/empty-state.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
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

  const heading = notification.type === "blocklist"
    ? "Blocklist alert"
    : notification.isArrived
      ? "Arrived vehicle"
      : notification.isPresent
        ? "Current booking"
        : "Upcoming booking";

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
        <h3>${heading}</h3>
        <p><strong>${notification.title}</strong></p>
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
      title: "Use the operational feed to catch booking and restriction alerts",
      description:
        "Review current-booking activity, arrived vehicles, and blocklist exceptions in one fast-scanning feed.",
      headerActions: `
        ${renderButton({ label: "Open bookings", href: "/cashier/bookings", tone: "primary" })}
        ${renderButton({ label: "Dashboard", href: "/cashier/dashboard", tone: "ghost" })}
      `,
      notice: `
        <div class="operations-notice-panel__content">
          <span class="metric-card__label">Feed purpose</span>
          <h2>This screen is for awareness and escalation, not for replacing the booking desk.</h2>
          <p class="page-copy">
            Use it to spot current activity quickly, then jump into the matching booking or user record when a desk action is needed.
          </p>
        </div>
      `,
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-cashier-notification-summary>
          ${renderLoadingPanelCards({ count: 3 })}
        </section>
        <section class="operations-split-grid">
          ${renderPanelCard({
            className: "operations-card-accent",
            eyebrow: "Feed filters",
            title: "Focus the notification stream",
            description: "Switch between all alerts, booking activity, and blocklist issues.",
            content: `
              <div class="operations-chip-group">
                ${renderButton({ label: "All", href: "/cashier/notifications", tone: activeFilter === "all" ? "primary" : "secondary" })}
                ${renderButton({ label: "Bookings", href: "/cashier/notifications?type=booking", tone: activeFilter === "booking" ? "primary" : "secondary" })}
                ${renderButton({ label: "Blocklisted", href: "/cashier/notifications?type=blocklist", tone: activeFilter === "blocklist" ? "primary" : "secondary" })}
              </div>
            `
          })}
          ${renderPanelCard({
            eyebrow: "Feed guidance",
            title: "How to use the feed",
            content: `
              <div class="operations-panel-list">
                <article>
                  <strong>Current bookings</strong>
                  <p>These alerts indicate bookings within the active operations window and deserve immediate scanning.</p>
                </article>
                <article>
                  <strong>Arrived vehicles</strong>
                  <p>Arrived sessions are the clearest payment-ready queue for the cashier desk.</p>
                </article>
                <article>
                  <strong>Blocklist issues</strong>
                  <p>Restrictions belong to exception handling and should be cross-checked in the user desk before further action.</p>
                </article>
              </div>
            `
          })}
        </section>
        <section class="stack-sm">
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
            renderKpiCard({ label: "Current bookings", value: data.currentBookingCount, helper: "Needs queue awareness", icon: "QB" }),
            renderKpiCard({ label: "Arrived vehicles", value: data.arrivedCount, helper: "Payment-ready sessions", icon: "AR" }),
            renderKpiCard({ label: "Blocklist alerts", value: data.blocklistCount, helper: "Restriction escalations", icon: "BL" })
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
