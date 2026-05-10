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

export function renderButton({
  label,
  href,
  type = "button",
  tone = "primary",
  block = false,
  loading = false,
  disabled = false,
  className = "",
  attributes = {}
}) {
  const classes = ["button", `button--${tone}`];
  if (block) {
    classes.push("button--block");
  }
  if (loading) {
    classes.push("is-loading");
  }
  if (className) {
    classes.push(className);
  }

  const content = `
    ${loading ? '<span class="button__spinner" aria-hidden="true"></span>' : ""}
    <span>${label}</span>
  `;

  if (href) {
    const linkAttributes = renderAttributes({
      href,
      "data-link": true,
      "aria-disabled": disabled || loading ? "true" : false,
      tabindex: disabled || loading ? "-1" : false,
      ...attributes
    });

    return `<a class="${classes.join(" ")}" ${linkAttributes}>${content}</a>`;
  }

  const buttonAttributes = renderAttributes({
    type,
    disabled: disabled || loading,
    ...attributes
  });

  return `<button class="${classes.join(" ")}" ${buttonAttributes}>${content}</button>`;
}
