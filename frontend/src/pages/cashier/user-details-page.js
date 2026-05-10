import { renderButton } from "../../components/button/action-button.js";
import { renderPanelCard } from "../../components/card/panel-card.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { fetchCashierUserDetails } from "../../services/cashier-service.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { bindCashierShell, renderCashierShell } from "./cashier-shell.js";
import { formatDate } from "../../utils/formatters.js";

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
      title: "Inspect one verified customer record",
      description:
        "Review account standing, contact details, and vehicle information before handling arrival or payment workflows.",
      content: `
        <div data-cashier-user-alerts></div>
        <section class="dashboard-grid cashier-dashboard-grid" data-cashier-user-details>
          ${renderLoadingPanelCards({ count: 2 })}
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
                content: `
                  <div class="record-card__header">
                    <div>
                      <h2>${user.fullName}</h2>
                      <p class="page-copy">${user.email}</p>
                    </div>
                    ${renderAccountBadge(user)}
                  </div>
                  <div class="detail-list">
                    <div><span>Phone number</span><strong>${user.phoneNumber}</strong></div>
                    <div><span>Address</span><strong>${user.address || "Not provided"}</strong></div>
                    <div><span>Total bookings</span><strong>${user.totalBookings}</strong></div>
                    <div><span>Active bookings</span><strong>${user.activeBookings}</strong></div>
                    <div><span>Missed bookings</span><strong>${user.missedBookingsCount}</strong></div>
                    <div><span>Restriction status</span><strong>${user.blocklisted ? `Until ${formatDate(user.blocklistUntil)}` : "Good standing"}</strong></div>
                  </div>
                `
              })}
              ${renderPanelCard({
                title: "Vehicle information",
                content: `
                  <div class="detail-list">
                    <div><span>Plate number</span><strong>${user.plateNumber}</strong></div>
                    <div><span>Vehicle type</span><strong>${user.vehicleType}</strong></div>
                    <div><span>Vehicle model</span><strong>${user.vehicleModel}</strong></div>
                    <div><span>Vehicle color</span><strong>${user.vehicleColor}</strong></div>
                    <div><span>Verification</span><strong>${user.verified ? "Verified" : "Pending"}</strong></div>
                    <div><span>Cashier action note</span><strong>Use this profile as the source of truth before arrival or completion actions.</strong></div>
                  </div>
                `,
                footer: `
                  <div class="auth-support-links">
                    ${renderButton({ label: "Back to users", href: "/cashier/users", tone: "secondary" })}
                    ${renderButton({ label: "Back to dashboard", href: "/cashier/dashboard", tone: "ghost" })}
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
