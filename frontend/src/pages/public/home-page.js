import { getRoleHome } from "../../app/guards.js";
import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";

const experienceCards = [
  {
    href: "/register",
    eyebrow: "Advance booking",
    title: "Register and reserve before you arrive.",
    description:
      "Create a verified customer account, manage your vehicle details, and secure a slot ahead of time.",
    meta: "For new customers"
  },
  {
    href: "/login?role=user",
    eyebrow: "Customer access",
    title: "Return to your user portal.",
    description:
      "Review reservations, booking history, notifications, restriction status, and upcoming parking sessions.",
    meta: "For verified users"
  },
  {
    href: "/login?role=cashier",
    eyebrow: "Operations",
    title: "Open the cashier workspace.",
    description:
      "Check arrivals, complete parking sessions, and handle time-sensitive reservations from the operational portal.",
    meta: "For staff on site"
  },
  {
    href: "/login?role=admin",
    eyebrow: "Management",
    title: "Enter the admin workspace.",
    description:
      "Oversee users, bookings, pricing, restrictions, and reporting while backend rules remain authoritative.",
    meta: "For authorized administrators"
  }
];

const capabilityCards = [
  {
    title: "Verified account booking",
    description:
      "Customer reservations remain tied to verified email accounts before the booking flow is unlocked."
  },
  {
    title: "Arrival window enforcement",
    description:
      "The product keeps the existing one-hour no-show rule visible from the first public touchpoint."
  },
  {
    title: "Role-specific workspaces",
    description:
      "Public, user, cashier, and admin entry points stay separated in the new frontend just like the backend routes."
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
            <span class="eyebrow">Premium parking operations</span>
            <h1 class="hero-title" tabindex="-1" data-page-heading>
              Reserve earlier, arrive smoother, manage parking operations with clearer role-based entry points.
            </h1>
            <p class="page-copy page-copy--lead">
              Royal Service Parking is being rebuilt as a plain JavaScript frontend backed by Spring Boot. The customer journey stays guided, while cashier and admin access remains operationally separate.
            </p>
            <div class="hero-actions">
              <a class="button button--primary" href="${primaryAction.href}" data-link>${primaryAction.label}</a>
              <a class="button button--secondary" href="/login" data-link>Login</a>
              <a class="button button--ghost" href="/login?role=cashier" data-link>Cashier access</a>
            </div>
            <div class="hero-highlights">
              <div class="hero-highlight">
                <strong>104 seeded slots</strong>
                <span>Four levels with level-based selection in the current product model.</span>
              </div>
              <div class="hero-highlight">
                <strong>1-hour arrival window</strong>
                <span>No-show policy remains explicit from the public entry point onward.</span>
              </div>
              <div class="hero-highlight">
                <strong>Session-based auth</strong>
                <span>Customer and staff access stay aligned with backend authorization rules.</span>
              </div>
            </div>
          </div>
          <div class="hero-shell__panel">
            <div class="policy-card">
              <span class="metric-card__label">Reservation flow</span>
              <strong>Customer onboarding stays structured.</strong>
              <ol class="journey-list">
                <li>Create or verify your account.</li>
                <li>Reserve a slot before arrival.</li>
                <li>Check in through the cashier portal.</li>
                <li>Complete the session and receive final pricing.</li>
              </ol>
            </div>
            <div class="policy-card policy-card--warning">
              <span class="metric-card__label">Policy reminder</span>
              <strong>Missed reservations can trigger temporary restrictions.</strong>
              <p>
                The rebuild preserves visible no-show guidance so customers understand the one-hour arrival rule before booking.
              </p>
            </div>
          </div>
        </section>
        <section class="public-section">
          <div class="section-heading">
            <span class="eyebrow">Choose your entry point</span>
            <h2>Public and operational access stays clearly separated.</h2>
            <p class="page-copy">
              The first visible milestone focuses on the public site and login routes before moving into registration, verification, and password recovery screens.
            </p>
          </div>
          <div class="entry-grid">
            ${experienceCards.map(renderExperienceCard).join("")}
          </div>
        </section>
        <section class="public-section public-section--muted">
          <div class="section-heading">
            <span class="eyebrow">Built for the real workflow</span>
            <h2>Customer guidance and staff speed are both first-class requirements.</h2>
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
        </section>
      </main>
      ${renderPublicFooter()}
    `
  };
}
