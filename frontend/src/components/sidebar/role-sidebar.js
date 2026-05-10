import { renderButton } from "../button/action-button.js";
import { renderAppSidebar } from "./app-sidebar.js";
import { formatRoleLabel } from "../../utils/formatters.js";

const navItems = {
  USER: [
    { href: "/user/dashboard", label: "Dashboard", match: ["/user/dashboard"] }
  ],
  CASHIER: [
    { href: "/cashier/dashboard", label: "Dashboard", match: ["/cashier/dashboard"] },
    { href: "/cashier/users", label: "Users", match: ["/cashier/users", "/cashier/users/detail"] },
    { href: "/cashier/bookings", label: "Bookings", match: ["/cashier/bookings", "/cashier/bookings/payment", "/cashier/bookings/receipt"] },
    { href: "/cashier/notifications", label: "Notifications", match: ["/cashier/notifications"] },
    { href: "/cashier/parking-cost", label: "Parking Rate", match: ["/cashier/parking-cost"] }
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard", match: ["/admin/dashboard"] },
    { href: "/admin/users", label: "Users", match: ["/admin/users", "/admin/users/detail"] },
    { href: "/admin/bookings", label: "Bookings", match: ["/admin/bookings"] },
    { href: "/admin/parking-cost", label: "Parking Rate", match: ["/admin/parking-cost"] },
    { href: "/admin/blocklist", label: "Blocklist", match: ["/admin/blocklist"] },
    { href: "/admin/reports", label: "Reports", match: ["/admin/reports"] }
  ]
};

export function renderRoleSidebar(session, currentPath) {
  const items = navItems[session.role] ?? [];

  return renderAppSidebar({
    ariaLabel: `${formatRoleLabel(session.role)} navigation`,
    eyebrow: formatRoleLabel(session.role),
    title: session.displayName ?? "Royal Service Parking",
    subtitle: session.email ?? session.username ?? "Session active",
    items: items.map((item) => ({
      ...item,
      active: (item.match ?? [item.href]).includes(currentPath)
    })),
    footer: renderButton({
      label: "Sign out",
      tone: "secondary",
      className: "role-sidebar__logout",
      attributes: { "data-logout": true }
    })
  });
}
