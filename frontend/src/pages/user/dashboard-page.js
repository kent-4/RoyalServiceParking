import { renderButton } from "../../components/button/action-button.js";
import { renderKpiCard, renderPanelCard } from "../../components/card/panel-card.js";
import { fetchUserDashboard } from "../../services/user-service.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindUserShell, renderUserShell } from "./user-shell.js";

export function createUserDashboardPage({ session, pathname }) {
  return {
    html: renderUserShell({
      session,
      currentPath: pathname,
      eyebrow: "User dashboard",
      title: "Plan your next parking session with confidence",
      description:
        "Keep your next booking, account standing, and current parking rate visible from one cleaner customer dashboard.",
      headerActions: `
        ${renderButton({ label: "Book parking", href: "/user/book", tone: "primary" })}
        ${renderButton({ label: "My bookings", href: "/user/bookings", tone: "secondary" })}
      `,
      notice: `
        <div class="user-notice-panel__content">
          <span class="metric-card__label">Arrival policy</span>
          <h2>Advance reservations still require on-time arrival.</h2>
          <p class="page-copy">
            Customers must arrive within one hour of the scheduled booking time to avoid automatic cancellation and temporary restriction.
          </p>
        </div>
      `,
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
          <article class="panel-card" data-dashboard-account>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
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
      const accountRoot = document.querySelector("[data-dashboard-account]");
      const profileRoot = document.querySelector("[data-dashboard-profile]");
      const rateRoot = document.querySelector("[data-dashboard-rate]");

      try {
        const data = await fetchUserDashboard();

        if (kpiRoot) {
          kpiRoot.innerHTML = [
            { label: "Total bookings", value: data.totalBookings, icon: "BK" },
            { label: "Active bookings", value: data.activeBookings, icon: "ON" },
            { label: "Completed bookings", value: data.completedBookings, icon: "OK" },
            { label: "Current hourly rate", value: formatCurrency(data.currentHourlyRate), icon: "$" }
          ]
            .map((item) => renderKpiCard(item))
            .join("");
        }

        if (nextBookingRoot) {
          nextBookingRoot.innerHTML = data.nextUpcomingBooking
            ? `
                <div class="panel-card__header">
                  <span class="eyebrow">Next action</span>
                  <h2>Upcoming reserved booking</h2>
                  <p class="page-copy">Keep the date, time, and slot visible before you arrive on site.</p>
                </div>
                <div class="detail-list">
                  <div><span>Date</span><strong>${formatDate(data.nextUpcomingBooking.date)}</strong></div>
                  <div><span>Start time</span><strong>${formatTime(data.nextUpcomingBooking.startTime)}</strong></div>
                  <div><span>Slot</span><strong>${data.nextUpcomingBooking.level} - ${data.nextUpcomingBooking.slotName}</strong></div>
                  <div><span>Status</span><strong>${data.nextUpcomingBooking.status}</strong></div>
                </div>
                <div class="auth-support-links">
                  <a class="button button--primary" href="/user/bookings" data-link>Review booking</a>
                </div>
              `
            : `
                <div class="panel-card__header">
                  <span class="eyebrow">Next action</span>
                  <h2>No reserved booking is scheduled right now</h2>
                  <p class="page-copy">Create an advance reservation before you arrive to secure a slot.</p>
                </div>
                <div class="auth-support-links">
                  <a class="button button--primary" href="/user/book" data-link>Start booking</a>
                </div>
              `;
        }

        if (accountRoot) {
          accountRoot.innerHTML = `
            <div class="panel-card__header">
              <span class="eyebrow">Account standing</span>
              <h2>Restriction and profile visibility</h2>
              <p class="page-copy">Customer status stays visible so booking eligibility is never ambiguous.</p>
            </div>
            <div class="detail-list">
              <div><span>Restriction</span><strong>${data.blocklisted ? "Restricted" : "Good standing"}</strong></div>
              <div><span>Vehicle on file</span><strong>${data.vehicleType} - ${data.plateNumber}</strong></div>
              <div><span>Email</span><strong>${data.email}</strong></div>
            </div>
            <div class="auth-support-links">
              <a class="button button--secondary" href="/user/profile" data-link>Open profile</a>
            </div>
          `;
        }

        if (profileRoot) {
          profileRoot.innerHTML = renderPanelCard({
            eyebrow: "Customer profile",
            title: "Identity and vehicle snapshot",
            description: "Use the saved profile details as the base for your future booking steps.",
            content: `
              <div class="detail-list">
                <div><span>Name</span><strong>${data.fullName}</strong></div>
                <div><span>Email</span><strong>${data.email}</strong></div>
                <div><span>Vehicle</span><strong>${data.vehicleType} - ${data.plateNumber}</strong></div>
              </div>
            `,
            footer: `
              <div class="auth-support-links">
                <a class="button button--secondary" href="/user/profile" data-link>Manage profile</a>
              </div>
            `
          });
        }

        if (rateRoot) {
          const threeHourSample = Number(data.currentHourlyRate || 0) * 3;
          rateRoot.innerHTML = renderPanelCard({
            eyebrow: "Parking cost",
            title: "Current pricing preview",
            description: "Review the active hourly rate before moving into the booking flow.",
            content: `
              <div class="detail-list">
                <div><span>Hourly rate</span><strong>${formatCurrency(data.currentHourlyRate)}</strong></div>
                <div><span>3-hour sample</span><strong>${formatCurrency(threeHourSample)}</strong></div>
              </div>
            `,
            footer: `
              <div class="auth-support-links">
                <a class="button button--secondary" href="/user/parking-cost" data-link>Open calculator</a>
              </div>
            `
          });
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

        if (accountRoot) {
          accountRoot.innerHTML = "";
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
