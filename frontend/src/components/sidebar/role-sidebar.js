import { formatRoleLabel } from "../../utils/formatters.js";

const navItems = {
  USER: [
    { href: "/user/dashboard", label: "Dashboard" }
  ],
  CASHIER: [
    { href: "/cashier/dashboard", label: "Dashboard" },
    { label: "Users", disabled: true },
    { label: "Bookings", disabled: true },
    { label: "Notifications", disabled: true },
    { label: "Parking Rate", disabled: true }
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard" }
  ]
};

export function renderRoleSidebar(session, currentPath) {
  const items = navItems[session.role] ?? [];

  return `
    <aside class="role-sidebar" aria-label="${formatRoleLabel(session.role)} navigation">
      <div class="role-sidebar__header">
        <span class="eyebrow">${formatRoleLabel(session.role)}</span>
        <h2>${session.displayName ?? "Royal Service Parking"}</h2>
        <p>${session.email ?? session.username ?? "Session active"}</p>
      </div>
      <nav class="role-sidebar__nav">
        ${items
          .map(
            (item) => `
              ${
                item.disabled
                  ? `<span class="role-sidebar__item role-sidebar__item--disabled">${item.label}<small>Coming next</small></span>`
                  : `<a
                      class="${item.href === currentPath ? "is-active" : ""}"
                      href="${item.href}"
                      data-link
                    >
                      ${item.label}
                    </a>`
              }
            `
          )
          .join("")}
      </nav>
      <button class="button button--secondary role-sidebar__logout" type="button" data-logout>
        Sign out
      </button>
    </aside>
  `;
}
