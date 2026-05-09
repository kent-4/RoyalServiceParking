export function renderBrandMark({
  href = "/",
  crest = "RSP",
  title = "Royal Service Parking",
  subtitle = "",
  className = ""
}) {
  return `
    <a class="brand-mark ${className}" href="${href}" data-link aria-label="${title} home">
      <span class="brand-mark__crest">${crest}</span>
      <span class="brand-mark__text">
        <strong>${title}</strong>
        ${subtitle ? `<small>${subtitle}</small>` : ""}
      </span>
    </a>
  `;
}
