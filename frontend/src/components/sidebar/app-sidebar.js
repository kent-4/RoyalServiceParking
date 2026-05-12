export function renderAppSidebar({
  ariaLabel,
  eyebrow,
  title,
  subtitle,
  className = "",
  items = [],
  footer = ""
}) {
  const sidebarClassName = ["role-sidebar", className].filter(Boolean).join(" ");

  return `
    <aside class="${sidebarClassName}" aria-label="${ariaLabel}">
      <div class="role-sidebar__header">
        <span class="eyebrow">${eyebrow}</span>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <nav class="role-sidebar__nav">
        ${items
          .map((item) =>
            item.disabled
              ? `<span class="role-sidebar__item role-sidebar__item--disabled">${item.label}<small>${item.meta ?? "Coming next"}</small></span>`
              : `<a class="${item.active ? "is-active" : ""}" href="${item.href}" data-link>${item.label}</a>`
          )
          .join("")}
      </nav>
      ${footer}
    </aside>
  `;
}
