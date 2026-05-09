const navItems = [
  { href: "/user/dashboard", label: "Dashboard", match: ["/user/dashboard"] },
  { href: "/user/book", label: "Book Parking", match: ["/user/book", "/user/select-slot"] },
  { href: "/user/bookings", label: "My Bookings", match: ["/user/bookings"] },
  { href: "/user/notifications", label: "Notifications", match: ["/user/notifications"], badge: true },
  { href: "/user/profile", label: "Profile", match: ["/user/profile"] },
  { href: "/user/parking-cost", label: "Parking Cost", match: ["/user/parking-cost"] }
];

export function renderUserNavbar({ session, currentPath }) {
  return `
    <header class="user-nav-shell">
      <div class="user-nav">
        <div class="user-nav__brand">
          <span class="brand-mark__crest">RSP</span>
          <div>
            <strong>Royal Service Parking</strong>
            <p>${session.displayName ?? session.username ?? "User"}</p>
          </div>
        </div>
        <nav class="user-nav__links" aria-label="User navigation">
          ${navItems
            .map(
              (item) => `
                <a class="${item.match.includes(currentPath) ? "is-active" : ""}" href="${item.href}" data-link>
                  ${item.label}
                  ${item.badge ? '<span class="nav-badge" data-notification-badge hidden>0</span>' : ""}
                </a>
              `
            )
            .join("")}
        </nav>
        <div class="user-nav__actions">
          <span class="status-chip">${session.role ?? "USER"}</span>
          <button class="button button--secondary" type="button" data-logout>Sign out</button>
        </div>
      </div>
    </header>
  `;
}
