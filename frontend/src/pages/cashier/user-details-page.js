import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { renderButton } from "../../components/button/action-button.js";
import { renderPanelCard } from "../../components/card/panel-card.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { fetchCashierUserDetails } from "../../services/cashier-service.js";
import { formatDate } from "../../utils/formatters.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";

function renderAccountBadge(user) {
  return user.blocklisted
    ? renderStatusBadge("BLOCKLISTED")
    : '<span class="status-badge status-badge--success">Active</span>';
}

export function createCashierUserDetailsPage({ session, pathname, query }) {
  const userId = query?.get("id") ?? "";

  return {
    html: renderCashierShell({
      session,
      currentPath: pathname,
      eyebrow: "Cashier users",
      title: "Review one customer profile before desk action",
      description:
        "Keep contact details, vehicle records, and current standing visible before handling arrival, payment, or exception cases.",
      headerActions: `
        ${renderButton({ label: "Back to users", href: "/cashier/users", tone: "secondary" })}
        ${renderButton({ label: "Open bookings", href: "/cashier/bookings", tone: "ghost" })}
      `,
      notice: `
        <div class="operations-notice-panel__content">
          <span class="metric-card__label">Profile check</span>
          <h2>The cashier detail view is the source of truth for identity and restriction checks at the counter.</h2>
          <p class="page-copy">
            Use it before confirming a vehicle, escalating a restriction, or explaining why a booking cannot proceed normally.
          </p>
        </div>
      `,
      content: `
        <div data-cashier-user-alerts></div>
        <section class="dashboard-grid cashier-dashboard-grid" data-cashier-user-details>
          ${renderLoadingPanelCards({ count: 4 })}
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindCashierShell({ navigate });

      const alertsRoot = document.querySelector("[data-cashier-user-alerts]");
      const detailsRoot = document.querySelector("[data-cashier-user-details]");

      if (!userId) {
        navigate("/cashier/users", { replace: true });
        return;
      }

      try {
        const user = await fetchCashierUserDetails(userId);

        if (detailsRoot) {
          detailsRoot.innerHTML = `
            ${renderPanelCard({
              eyebrow: "Customer summary",
              title: user.fullName,
              description: user.email,
              className: "operations-card-accent",
              content: `
                <div class="detail-list">
                  <div><span>Standing</span><strong>${user.blocklisted ? `Restricted until ${formatDate(user.blocklistUntil)}` : "Good standing"}</strong></div>
                  <div><span>Verified</span><strong>${user.verified ? "Yes" : "Pending"}</strong></div>
                  <div><span>Total bookings</span><strong>${user.totalBookings}</strong></div>
                  <div><span>Active bookings</span><strong>${user.activeBookings}</strong></div>
                </div>
              `,
              footer: `<div class="auth-support-links">${renderAccountBadge(user)}</div>`
            })}
            ${renderPanelCard({
              eyebrow: "Contact details",
              title: "Customer contact information",
              content: `
                <div class="detail-list">
                  <div><span>Phone number</span><strong>${user.phoneNumber || "Not provided"}</strong></div>
                  <div><span>Address</span><strong>${user.address || "Not provided"}</strong></div>
                  <div><span>Email</span><strong>${user.email}</strong></div>
                </div>
              `
            })}
            ${renderPanelCard({
              eyebrow: "Vehicle record",
              title: "Vehicle details used at the desk",
              content: `
                <div class="detail-list">
                  <div><span>Plate number</span><strong>${user.plateNumber}</strong></div>
                  <div><span>Vehicle type</span><strong>${user.vehicleType}</strong></div>
                  <div><span>Vehicle model</span><strong>${user.vehicleModel}</strong></div>
                  <div><span>Vehicle color</span><strong>${user.vehicleColor}</strong></div>
                </div>
              `
            })}
            ${renderPanelCard({
              eyebrow: "Booking context",
              title: "Restriction and booking history snapshot",
              content: `
                <div class="operations-panel-list">
                  <article>
                    <strong>${user.activeBookings} active booking${user.activeBookings === 1 ? "" : "s"}</strong>
                    <p>Reserved and arrived sessions both count as active work for cashier handling.</p>
                  </article>
                  <article>
                    <strong>${user.missedBookingsCount} missed booking${user.missedBookingsCount === 1 ? "" : "s"}</strong>
                    <p>This count is the operational signal most likely to explain a current restriction state.</p>
                  </article>
                  <article>
                    <strong>${user.blocklisted ? "Restriction active" : "No active restriction"}</strong>
                    <p>${user.blocklisted ? `The backend currently holds the restriction until ${formatDate(user.blocklistUntil)}.` : "No booking restriction is blocking normal cashier handling right now."}</p>
                  </article>
                </div>
              `,
              footer: `
                <div class="auth-support-links">
                  ${renderButton({ label: "Back to users", href: "/cashier/users", tone: "secondary" })}
                  ${renderButton({ label: "Open bookings", href: "/cashier/bookings", tone: "ghost" })}
                </div>
              `
            })}
          `;
        }
      } catch (error) {
        if (detailsRoot) {
          detailsRoot.innerHTML = "";
        }
        if (alertsRoot) {
          alertsRoot.innerHTML = renderErrorState({
            title: "User details unavailable",
            message: error.message || "The cashier user record could not be loaded."
          });
        }
      }
    }
  };
}
