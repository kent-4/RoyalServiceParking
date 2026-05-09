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
    { href: "/cashier/bookings", label: "Bookings", match: ["/cashier/bookings"] },
    { label: "Notifications", disabled: true },
    { label: "Parking Rate", disabled: true }
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard", match: ["/admin/dashboard"] }
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
