export function renderInlineAlert({ tone = "info", title, message }) {
  return `
    <div class="alert alert--${tone}" role="status">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;
}
