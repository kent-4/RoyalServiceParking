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

export function renderFieldMessage({ message = "", tone = "hint", id = "" }) {
  if (!message) {
    return tone === "error"
      ? '<p class="field-error" aria-live="polite"></p>'
      : '<p class="field-hint"></p>';
  }

  return `
    <p class="field-${tone}" ${id ? `id="${id}"` : ""} ${tone === "error" ? 'aria-live="polite"' : ""}>
      ${message}
    </p>
  `;
}

export function renderFieldGroup({
  label,
  inputId,
  input,
  required = false,
  hint = "",
  hintId = "",
  error = "",
  errorId = ""
}) {
  return `
    <div class="field-group">
      <label for="${inputId}">
        ${label}
        ${required ? '<span class="field-label__required" aria-hidden="true">*</span>' : ""}
      </label>
      ${input}
      ${hint ? renderFieldMessage({ message: hint, tone: "hint", id: hintId }) : ""}
      ${renderFieldMessage({ message: error, tone: "error", id: errorId })}
    </div>
  `;
}

export function renderInputField({
  id,
  name,
  type = "text",
  value = "",
  placeholder = "",
  required = false,
  disabled = false,
  invalid = false,
  attributes = {}
}) {
  return `
    <input
      ${renderAttributes({
        id,
        name,
        type,
        value,
        placeholder: placeholder || false,
        required,
        disabled,
        "aria-invalid": invalid ? "true" : false,
        ...attributes
      })}
    />
  `;
}

export function renderSelectField({
  id,
  name,
  value = "",
  options = [],
  required = false,
  disabled = false,
  invalid = false,
  attributes = {}
}) {
  return `
    <select
      ${renderAttributes({
        id,
        name,
        required,
        disabled,
        "aria-invalid": invalid ? "true" : false,
        ...attributes
      })}
    >
      ${options
        .map(
          (option) => `
            <option value="${option.value}" ${String(option.value) === String(value) ? "selected" : ""}>
              ${option.label}
            </option>
          `
        )
        .join("")}
    </select>
  `;
}
