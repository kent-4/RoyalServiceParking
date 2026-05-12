import { renderButton } from "../button/action-button.js";
import { renderAppNavbar } from "./app-navbar.js";

const navItems = [
  { href: "/user/dashboard", label: "Dashboard", match: ["/user/dashboard"] },
  { href: "/user/book", label: "Book Parking", match: ["/user/book", "/user/select-slot"] },
  { href: "/user/bookings", label: "My Bookings", match: ["/user/bookings"] },
  { href: "/user/notifications", label: "Notifications", match: ["/user/notifications"], badge: true },
  { href: "/user/profile", label: "Profile", match: ["/user/profile"] },
  { href: "/user/parking-cost", label: "Parking Cost", match: ["/user/parking-cost"] }
];

export function renderUserNavbar({ session, currentPath }) {
  return renderAppNavbar({
    shellClassName: "user-nav-shell",
    navClassName: "user-nav",
    brand: `
      <div class="user-nav__brand">
        <span class="brand-mark__crest">RSP</span>
        <div class="user-nav__brand-copy">
          <strong>Royal Service Parking</strong>
          <p>${session.displayName ?? session.username ?? "User"}</p>
          <small>Customer reservation portal</small>
        </div>
      </div>
    `,
    navLabel: "User navigation",
    navItems: navItems.map((item) => ({
      href: item.href,
      label: item.label,
      active: item.match.includes(currentPath),
      badge: item.badge ? '<span class="nav-badge" data-notification-badge hidden>0</span>' : ""
    })),
    actions: `
      <span class="status-chip">${session.blocklisted ? "Restricted account" : "Verified customer"}</span>
      ${renderButton({
        label: "Book parking",
        href: "/user/book",
        tone: "primary"
      })}
      ${renderButton({
        label: "Sign out",
        tone: "ghost",
        attributes: { "data-logout": true }
      })}
    `
  });
}
