import { fetchUserDashboard } from "../../services/user-service.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindUserShell, renderUserShell } from "./user-shell.js";

export function createUserDashboardPage({ session, pathname }) {
  return {
    html: renderUserShell({
      session,
      currentPath: pathname,
      eyebrow: "User workspace",
      title: "Your booking overview",
      description:
        "Track account standing, next parking activity, and key account metrics from the rebuilt user portal.",
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-dashboard-kpis>
          ${Array.from({ length: 4 })
            .map(
              () => `
                <article class="panel-card panel-card--loading">
                  <div class="loading-block loading-block--title"></div>
                  <div class="loading-block loading-block--value"></div>
                </article>
              `
            )
            .join("")}
        </section>
        <section class="dashboard-grid">
          <article class="panel-card" data-dashboard-next-booking>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
          </article>
          <article class="panel-card" data-dashboard-policy>
            <h2>Parking reminder</h2>
            <p>Customers must arrive within one hour of the scheduled booking time to avoid automatic cancellation and temporary restriction.</p>
          </article>
        </section>
        <section class="dashboard-grid">
          <article class="panel-card" data-dashboard-profile>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
          </article>
          <article class="panel-card" data-dashboard-rate>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
          </article>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindUserShell({ navigate });

      const kpiRoot = document.querySelector("[data-dashboard-kpis]");
      const nextBookingRoot = document.querySelector("[data-dashboard-next-booking]");
      const profileRoot = document.querySelector("[data-dashboard-profile]");
      const rateRoot = document.querySelector("[data-dashboard-rate]");

      try {
        const data = await fetchUserDashboard();

        if (kpiRoot) {
          kpiRoot.innerHTML = [
            { label: "Total bookings", value: data.totalBookings },
            { label: "Active bookings", value: data.activeBookings },
            { label: "Completed bookings", value: data.completedBookings },
            { label: "Current hourly rate", value: formatCurrency(data.currentHourlyRate) }
          ]
            .map(
              (item) => `
                <article class="panel-card kpi-card">
                  <span class="metric-card__label">${item.label}</span>
                  <strong>${item.value}</strong>
                </article>
              `
            )
            .join("");
        }

        if (nextBookingRoot) {
          nextBookingRoot.innerHTML = data.nextUpcomingBooking
            ? `
                <h2>Next upcoming booking</h2>
                <div class="detail-list">
                  <div><span>Date</span><strong>${formatDate(data.nextUpcomingBooking.date)}</strong></div>
                  <div><span>Start time</span><strong>${formatTime(data.nextUpcomingBooking.startTime)}</strong></div>
                  <div><span>Slot</span><strong>${data.nextUpcomingBooking.level} - ${data.nextUpcomingBooking.slotName}</strong></div>
                  <div><span>Status</span><strong>${data.nextUpcomingBooking.status}</strong></div>
                </div>
              `
            : `
                <h2>Next upcoming booking</h2>
                <p class="empty-copy">No active reserved booking is scheduled right now.</p>
              `;
        }

        if (profileRoot) {
          profileRoot.innerHTML = `
            <h2>Account snapshot</h2>
            <div class="detail-list">
              <div><span>Name</span><strong>${data.fullName}</strong></div>
              <div><span>Email</span><strong>${data.email}</strong></div>
              <div><span>Vehicle</span><strong>${data.vehicleType} - ${data.plateNumber}</strong></div>
              <div><span>Account standing</span><strong>${data.blocklisted ? "Restricted" : "Good standing"}</strong></div>
            </div>
            <div class="auth-support-links">
              <a class="button button--secondary" href="/user/profile" data-link>Manage profile</a>
            </div>
          `;
        }

        if (rateRoot) {
          const threeHourSample = Number(data.currentHourlyRate || 0) * 3;
          rateRoot.innerHTML = `
            <h2>Parking cost preview</h2>
            <p class="page-copy">The current rate is <strong>${formatCurrency(data.currentHourlyRate)}</strong> per hour.</p>
            <p class="page-copy">A 3-hour stay currently estimates to <strong>${formatCurrency(threeHourSample)}</strong>.</p>
            <div class="auth-support-links">
              <a class="button button--secondary" href="/user/parking-cost" data-link>Open calculator</a>
            </div>
          `;
        }
      } catch (error) {
        if (kpiRoot) {
          kpiRoot.innerHTML = `
            <article class="panel-card">
              <h2>Dashboard unavailable</h2>
              <p class="page-copy">${error.message || "Unable to load dashboard data."}</p>
            </article>
          `;
        }

        if (nextBookingRoot) {
          nextBookingRoot.innerHTML = "";
        }

        if (profileRoot) {
          profileRoot.innerHTML = "";
        }

        if (rateRoot) {
          rateRoot.innerHTML = "";
        }
      }
    }
  };
}
