import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
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

function buildInitials(fullName) {
  return String(fullName ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "CU";
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
        "Review standing, contact information, and vehicle data before taking pricing, bookings, or restriction actions.",
      actions: renderButton({ label: "Back to users", href: "/admin/users", tone: "secondary" }),
      content: `
        <div data-admin-user-alerts></div>
        <section class="stack-sm" data-admin-user-details>
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
            <section class="dashboard-grid dashboard-grid--kpi">
              ${renderKpiCard({ label: "Total bookings", value: user.totalBookings, helper: "All recorded reservations", icon: "BK" })}
              ${renderKpiCard({ label: "Active bookings", value: user.activeBookings, helper: "Reserved or arrived", icon: "AC" })}
              ${renderKpiCard({ label: "Missed bookings", value: user.missedBookingsCount, helper: "No-show history", icon: "NS" })}
              ${renderKpiCard({
                label: "Account standing",
                value: user.blocklisted ? "Restricted" : "Active",
                helper: user.blocklisted ? `Until ${formatDate(user.blocklistUntil)}` : "Good standing",
                icon: user.blocklisted ? "BL" : "OK"
              })}
            </section>
            <section class="dashboard-grid admin-account-layout">
              ${renderPanelCard({
                className: "operations-card-accent",
                content: `
                  <div class="admin-account-hero">
                    <div class="admin-avatar-badge">${buildInitials(user.fullName)}</div>
                    <div class="admin-account-hero__copy">
                      <span class="eyebrow">Customer account record</span>
                      <h2>${user.fullName}</h2>
                      <p class="page-copy">${user.email}</p>
                    </div>
                    ${renderAccountBadge(user)}
                  </div>
                  <div class="detail-list">
                    <div><span>Phone number</span><strong>${user.phoneNumber}</strong></div>
                    <div><span>Address</span><strong>${user.address || "Not provided"}</strong></div>
                    <div><span>Plate number</span><strong>${user.plateNumber}</strong></div>
                    <div><span>Standing</span><strong>${user.blocklisted ? `Restricted until ${formatDate(user.blocklistUntil)}` : "Good standing"}</strong></div>
                  </div>
                `,
                footer: `
                  <div class="auth-support-links">
                    ${user.blocklisted ? renderButton({ label: "Open blocklist", href: "/admin/blocklist", tone: "primary" }) : ""}
                    ${renderButton({ label: "Open bookings", href: "/admin/bookings", tone: "secondary" })}
                  </div>
                `
              })}
              ${renderPanelCard({
                title: "Vehicle and verification",
                description: "Vehicle data remains read-only from the admin record view so staff actions stay auditable.",
                content: `
                  <div class="identity-list">
                    <div><span>Vehicle type</span><strong>${user.vehicleType}</strong></div>
                    <div><span>Vehicle model</span><strong>${user.vehicleModel}</strong></div>
                    <div><span>Vehicle color</span><strong>${user.vehicleColor}</strong></div>
                    <div><span>Verification</span><strong>${user.verified ? "Verified customer" : "Pending verification"}</strong></div>
                    <div><span>Admin note</span><strong>${user.blocklisted ? "This account is currently visible in the active blocklist review." : "Use the blocklist screen if an admin override is later required."}</strong></div>
                  </div>
                `,
                footer: `
                  <div class="auth-support-links">
                    ${renderButton({ label: "Back to users", href: "/admin/users", tone: "secondary" })}
                    ${renderButton({ label: "Return to dashboard", href: "/admin/dashboard", tone: "ghost" })}
                  </div>
                `
              })}
            </section>
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
