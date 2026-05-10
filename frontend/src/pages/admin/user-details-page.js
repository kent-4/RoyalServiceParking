import { renderButton } from "../../components/button/action-button.js";
import { renderPanelCard } from "../../components/card/panel-card.js";
import { renderErrorState } from "../../components/feedback/error-state.js";
import { renderLoadingPanelCards } from "../../components/feedback/loading-state.js";
import { renderStatusBadge } from "../../components/badge/status-badge.js";
import { fetchAdminUserDetails } from "../../services/admin-service.js";
import { formatDate } from "../../utils/formatters.js";
import { bindAdminShell, renderAdminShell } from "./admin-shell.js";

function renderAccountBadge(user) {
  return user.blocklisted
    ? renderStatusBadge("BLOCKLISTED")
    : '<span class="status-badge status-badge--success">Active account</span>';
}

export function createAdminUserDetailsPage({ session, pathname, query }) {
  const userId = query?.get("id") ?? "";

  return {
    html: renderAdminShell({
      session,
      currentPath: pathname,
      eyebrow: "Admin users",
      title: "Inspect verified customer account details",
      description:
        "Review standing, contact information, and vehicle data before bookings, pricing, or blocklist actions are rebuilt.",
      content: `
        <div data-admin-user-alerts></div>
        <section class="dashboard-grid cashier-dashboard-grid" data-admin-user-details>
          ${renderLoadingPanelCards({ count: 2 })}
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindAdminShell({ navigate });

      const alertsRoot = document.querySelector("[data-admin-user-alerts]");
      const detailsRoot = document.querySelector("[data-admin-user-details]");

      if (!userId) {
        navigate("/admin/users", { replace: true });
        return;
      }

      try {
        const user = await fetchAdminUserDetails(userId);

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
                  <div><span>Standing</span><strong>${user.blocklisted ? `Restricted until ${formatDate(user.blocklistUntil)}` : "Good standing"}</strong></div>
                </div>
              `
            })}
            ${renderPanelCard({
              title: "Vehicle and account information",
              content: `
                <div class="detail-list">
                  <div><span>Plate number</span><strong>${user.plateNumber}</strong></div>
                  <div><span>Vehicle type</span><strong>${user.vehicleType}</strong></div>
                  <div><span>Vehicle model</span><strong>${user.vehicleModel}</strong></div>
                  <div><span>Vehicle color</span><strong>${user.vehicleColor}</strong></div>
                  <div><span>Verification</span><strong>${user.verified ? "Verified" : "Pending"}</strong></div>
                  <div><span>Admin note</span><strong>${user.blocklisted ? "This account is currently listed in the admin blocklist screen." : "Use the blocklist screen if this account later needs a manual restriction review."}</strong></div>
                </div>
              `,
              footer: `
                <div class="auth-support-links">
                  ${user.blocklisted ? renderButton({ label: "Open blocklist", href: "/admin/blocklist", tone: "primary" }) : ""}
                  ${renderButton({ label: "Back to users", href: "/admin/users", tone: "secondary" })}
                  ${renderButton({ label: "Back to dashboard", href: "/admin/dashboard", tone: "ghost" })}
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
            title: "Admin user details unavailable",
            message: error.message || "The admin user record could not be loaded."
          });
        }
      }
    }
  };
}
