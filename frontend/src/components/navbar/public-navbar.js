const navLinks = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/login/user", label: "User Login" },
  { href: "/login/cashier", label: "Cashier" },
  { href: "/login/admin", label: "Admin" }
];

export function renderPublicNavbar({ currentPath = "/", showPrimaryCta = true } = {}) {
  return `
    <header class="public-nav-shell">
      <div class="public-nav">
        <a class="brand-mark" href="/" data-link aria-label="Royal Service Parking home">
          <span class="brand-mark__crest">RSP</span>
          <span class="brand-mark__text">
            <strong>Royal Service Parking</strong>
            <small>Advance reservations and on-site operations</small>
          </span>
        </a>
        <nav class="public-nav__links" aria-label="Primary">
          ${navLinks
            .map(
              (link) => `
                <a
                  class="${currentPath === link.href ? "is-active" : ""}"
                  href="${link.href}"
                  data-link
                >
                  ${link.label}
                </a>
              `
            )
            .join("")}
        </nav>
        <div class="public-nav__actions">
          <a class="button button--ghost" href="/login/cashier" data-link>Staff access</a>
          ${
            showPrimaryCta
              ? '<a class="button button--primary" href="/register" data-link>Advance booking</a>'
              : ""
          }
        </div>
      </div>
    </header>
  `;
}
