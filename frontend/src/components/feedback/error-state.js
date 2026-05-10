import { renderInlineAlert } from "../alert/inline-alert.js";

export function renderErrorState({ title, message, tone = "danger" }) {
  return renderInlineAlert({
    tone,
    title,
    message
  });
}
