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
    href: "/login",
    eyebrow: "Returning account",
    title: "Sign in through one shared login.",
    description:
      "Use one sign-in route for returning access and let the backend open the correct workspace after authentication.",
    meta: "For existing accounts"
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
    title: "One sign-in, automatic destination",
    description:
      "Returning accounts use one login page while backend authorization still controls what opens after authentication."
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
              Royal Service Parking is the public front door to a single-facility booking platform. Customers begin with a verified account and return through one shared sign-in flow.
            </p>
            <div class="hero-actions">
              <a class="button button--primary" href="${primaryAction.href}" data-link>${session.authenticated ? primaryAction.label : "Book my spot"}</a>
              <a class="button button--secondary" href="/login" data-link>Sign in</a>
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
                <span>Returning accounts use one sign-in route and are redirected automatically after authentication.</span>
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
              <span class="metric-card__label">Returning accounts</span>
              <strong>Use one shared sign-in page to continue where your account belongs.</strong>
              <p>
                The public experience stays focused on registration, booking rules, and customer guidance before authentication.
              </p>
            </div>
          </div>
        </section>
        <section class="public-section">
          <div class="section-heading">
            <span class="eyebrow">Choose your entry point</span>
            <h2>Keep the customer journey simple before the booking is made.</h2>
            <p class="page-copy">
              The rebuilt public experience keeps registration, policy clarity, and account sign-in front-and-center.
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
              <h2 class="page-title">Customers need clarity before they reserve.</h2>
              <p class="page-copy">
                The public site explains verification, booking expectations, and arrival policy up front so later account flows can stay focused.
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
