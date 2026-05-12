import { renderButton } from "../button/action-button.js";
import { renderAppNavbar } from "./app-navbar.js";
import { renderBrandMark } from "./brand-mark.js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/login", label: "Login" }
];

const staffLinks = [
  { href: "/login?role=cashier", label: "Cashier" },
  { href: "/login?role=admin", label: "Admin" }
];

export function renderPublicNavbar({ currentPath = "/", showPrimaryCta = true } = {}) {
  return renderAppNavbar({
    shellClassName: "public-nav-shell",
    navClassName: "public-nav",
    brand: renderBrandMark({
      subtitle: "Single-facility reservations"
    }),
    navLabel: "Primary",
    navItems: navLinks.map((link) => ({
      ...link,
      active: currentPath === link.href
    })),
    actions: `
      <div class="public-nav__utility">
        <span class="public-nav__utility-label">Staff</span>
        <div class="public-nav__utility-links">
          ${staffLinks
            .map((link) => `<a href="${link.href}" data-link>${link.label}</a>`)
            .join("")}
        </div>
      </div>
      ${showPrimaryCta ? renderButton({ label: "Book my spot", href: "/register", tone: "primary" }) : ""}
    `
  });
}
