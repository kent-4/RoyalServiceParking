function renderAttributes(attributes = {}) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== false && value !== null && value !== undefined)
    .map(([key, value]) => {
      if (value === true) {
        return key;
      }

      return `${key}="${String(value)}"`;
    })
    .join(" ");
}

export function renderPanelCard({
  title,
  eyebrow,
  description,
  content = "",
  footer = "",
  className = "",
  attributes = {}
}) {
  const classes = ["panel-card"];
  if (className) {
    classes.push(className);
  }

  return `
    <article class="${classes.join(" ")}" ${renderAttributes(attributes)}>
      ${
        title || eyebrow || description
          ? `
            <div class="panel-card__header">
              ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}
              ${title ? `<h2>${title}</h2>` : ""}
              ${description ? `<p class="page-copy">${description}</p>` : ""}
            </div>
          `
          : ""
      }
      ${content}
      ${footer ? `<div class="panel-card__footer">${footer}</div>` : ""}
    </article>
  `;
}

export function renderKpiCard({ label, value, helper = "", className = "" }) {
  return `
    <article class="panel-card kpi-card ${className}">
      <span class="metric-card__label">${label}</span>
      <strong>${value}</strong>
      ${helper ? `<p class="panel-card__meta">${helper}</p>` : ""}
    </article>
  `;
}
