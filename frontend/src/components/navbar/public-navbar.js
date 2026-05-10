import { renderButton } from "../button/action-button.js";
import { renderAppNavbar } from "./app-navbar.js";
import { renderBrandMark } from "./brand-mark.js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/login", label: "Login" }
];

export function renderPublicNavbar({ currentPath = "/", showPrimaryCta = true } = {}) {
  return renderAppNavbar({
    shellClassName: "public-nav-shell",
    navClassName: "public-nav",
    brand: renderBrandMark({
      subtitle: "Advance reservations and on-site operations"
    }),
    navLabel: "Primary",
    navItems: navLinks.map((link) => ({
      ...link,
      active: currentPath === link.href
    })),
    actions: `
      ${renderButton({ label: "Staff access", href: "/login?role=cashier", tone: "ghost" })}
      ${showPrimaryCta ? renderButton({ label: "Advance booking", href: "/register", tone: "primary" }) : ""}
    `
  });
}
