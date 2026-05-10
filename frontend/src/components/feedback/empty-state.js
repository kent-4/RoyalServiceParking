export function renderEmptyState({ title, message, actions = "", className = "" }) {
  return `
    <article class="panel-card empty-state ${className}">
      <h2>${title}</h2>
      <p class="empty-copy">${message}</p>
      ${actions ? `<div class="empty-state__actions">${actions}</div>` : ""}
    </article>
  `;
}
