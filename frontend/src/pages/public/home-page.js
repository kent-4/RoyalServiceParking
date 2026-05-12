import { getRoleHome } from "../../app/guards.js";
import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";

const experienceCards = [
  {
    href: "/register",
    eyebrow: "Advance booking",
    title: "Create a verified customer account.",
    description:
      "Start with registration so your vehicle, contact details, and future reservations stay tied to one verified account.",
    meta: "For new customers"
  },
  {
    href: "/login?role=user",
    eyebrow: "Customer access",
    title: "Return to the customer workspace.",
    description:
      "Open your bookings, notifications, restriction status, and profile from the same shared sign-in route.",
    meta: "For verified users"
  },
  {
    href: "/login?role=cashier",
    eyebrow: "Operations",
    title: "Handle on-site cashier operations.",
    description:
      "Review arrivals, complete parking sessions, and issue receipts without exposing staff actions to the customer journey.",
    meta: "For staff on site"
  },
  {
    href: "/login?role=admin",
    eyebrow: "Management",
    title: "Oversee pricing, users, and reports.",
    description:
      "Monitor bookings, pricing, restrictions, and exports from the management workspace while backend rules stay authoritative.",
    meta: "For authorized administrators"
  }
];

const capabilityCards = [
  {
    title: "Verified account before booking",
    description:
      "Advance booking stays gated behind registration and email verification instead of walk-in discovery."
  },
  {
    title: "One-hour arrival rule stays visible",
    description:
      "Public messaging keeps the no-show and temporary restriction policy clear before a customer commits to the flow."
  },
  {
    title: "Shared sign-in, separate workspaces",
    description:
      "The login route is unified, but customer, cashier, and admin experiences stay role-separated after authentication."
  }
];

function renderExperienceCard(card) {
  return `
    <article class="entry-card">
      <span class="eyebrow">${card.eyebrow}</span>
      <h2>${card.title}</h2>
      <p>${card.description}</p>
      <div class="entry-card__footer">
        <span>${card.meta}</span>
        <a class="button button--secondary" href="${card.href}" data-link>Open</a>
      </div>
    </article>
  `;
}

export function createPublicHomePage({ session, pathname }) {
  const primaryAction = session.authenticated
    ? {
        href: getRoleHome(session.role),
        label: "Open your workspace"
      }
    : {
        href: "/register",
        label: "Start advance booking"
      };

  return {
    html: `
      ${renderPublicNavbar({ currentPath: pathname })}
      <main class="app-main">
        <section class="hero-shell hero-shell--public">
          <div class="hero-shell__content">
            <span class="eyebrow">Royal Service Parking</span>
            <h1 class="hero-title" tabindex="-1" data-page-heading>
              Secure your spot before you arrive.
            </h1>
            <p class="page-copy page-copy--lead">
              Royal Service Parking is the public front door to a single-facility booking and operations platform. Customers begin with a verified account, while cashier and admin access remain visible but secondary to the reservation journey.
            </p>
            <div class="hero-actions">
              <a class="button button--primary" href="${primaryAction.href}" data-link>${session.authenticated ? primaryAction.label : "Book my spot"}</a>
              <a class="button button--secondary" href="/login" data-link>Member login</a>
              <a class="button button--ghost" href="/login?role=cashier" data-link>Staff access</a>
            </div>
            <div class="hero-stat-grid">
              <div class="hero-stat">
                <strong>Single facility</strong>
                <span>Everything in this flow is designed for one operational parking location.</span>
              </div>
              <div class="hero-stat">
                <strong>Verified account required</strong>
                <span>Customer booking opens only after registration and email verification.</span>
              </div>
              <div class="hero-stat">
                <strong>1-hour arrival window</strong>
                <span>No-show handling and temporary restrictions remain visible from the first page.</span>
              </div>
              <div class="hero-stat">
                <strong>Shared login route</strong>
                <span>The backend still routes authenticated users into the correct workspace automatically.</span>
              </div>
            </div>
          </div>
          <div class="hero-shell__panel">
            <div class="policy-card policy-card--primary">
              <span class="metric-card__label">Advance booking flow</span>
              <strong>Customers are guided from registration to reservation, then on-site completion.</strong>
              <ol class="journey-list">
                <li>Create an account and verify the email address.</li>
                <li>Choose a date, time, level, and exact slot.</li>
                <li>Arrive on time for cashier check-in.</li>
                <li>Complete the parking session and receive a receipt.</li>
              </ol>
            </div>
            <div class="policy-card policy-card--warning">
              <span class="metric-card__label">Policy reminder</span>
              <strong>Booking is for advance reservation, not walk-in slot discovery.</strong>
              <p>
                Customers must arrive within the allowed window. Missed reservations can trigger temporary booking restrictions and block future reservations for a period.
              </p>
            </div>
            <div class="policy-card">
              <span class="metric-card__label">Staff and management</span>
              <div class="access-quick-links">
                <a href="/login?role=cashier" data-link>Cashier portal</a>
                <a href="/login?role=admin" data-link>Admin portal</a>
              </div>
            </div>
          </div>
        </section>
        <section class="public-section">
          <div class="section-heading">
            <span class="eyebrow">Choose your entry point</span>
            <h2>Customer booking stays front-and-center while staff access remains available.</h2>
            <p class="page-copy">
              The rebuilt public experience keeps the premium customer path clear without hiding operational access for staff and administrators.
            </p>
          </div>
          <div class="entry-grid">
            ${experienceCards.map(renderExperienceCard).join("")}
          </div>
        </section>
        <section class="public-section public-section--muted">
          <div class="section-split">
            <div>
              <span class="eyebrow">Built for the real workflow</span>
              <h2 class="page-title">Customers need guidance. Staff need separation and speed.</h2>
              <p class="page-copy">
                The public site explains the rules up front so the later user, cashier, and admin workspaces can stay more task-focused.
              </p>
            </div>
            <div class="feature-grid">
              ${capabilityCards
                .map(
                  (card) => `
                    <article class="feature-card">
                      <h3>${card.title}</h3>
                      <p>${card.description}</p>
                    </article>
                  `
                )
                .join("")}
            </div>
          </div>
        </section>
        <section class="public-section">
          <div class="policy-band">
            <div>
              <span class="eyebrow">Before a customer books</span>
              <h2>Make the rules clear before the reservation is submitted.</h2>
            </div>
            <p>
              Email verification is required before login, bookings are made in advance, and the one-hour arrival policy remains visible across the public and shared-auth routes.
            </p>
          </div>
        </section>
      </main>
      ${renderPublicFooter()}
    `
  };
}
