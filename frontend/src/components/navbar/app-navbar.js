export function renderAppNavbar({
  shellClassName,
  navClassName,
  brand,
  navLabel,
  navItems = [],
  actions = ""
}) {
  return `
    <header class="${shellClassName}">
      <div class="${navClassName}">
        ${brand}
        <nav class="${navClassName}__links" aria-label="${navLabel}">
          ${navItems
            .map(
              (item) => `
                <a class="${item.active ? "is-active" : ""}" href="${item.href}" data-link>
                  ${item.label}
                  ${item.badge ?? ""}
                </a>
              `
            )
            .join("")}
        </nav>
        <div class="${navClassName}__actions">
          ${actions}
        </div>
      </div>
    </header>
  `;
}
