import { dismissToast, subscribeUiStore } from "../../state/ui-store.js";

function getToastIcon(tone) {
  switch (tone) {
    case "success":
      return "OK";
    case "warning":
      return "WARN";
    case "danger":
      return "ERR";
    default:
      return "INFO";
  }
}

function renderToastList(toasts) {
  return toasts
    .map(
      (toast) => `
        <article class="toast toast--${toast.tone}">
          <span class="toast__icon" aria-hidden="true">${getToastIcon(toast.tone)}</span>
          <div>
            <strong>${toast.title}</strong>
            <p>${toast.message}</p>
          </div>
          <button class="toast__dismiss" type="button" data-dismiss-toast="${toast.id}" aria-label="Dismiss notification">
            x
          </button>
        </article>
      `
    )
    .join("");
}

export function mountToastRegion(rootElement) {
    function render(toasts) {
        rootElement.innerHTML = `<section class="toast-stack">${renderToastList(toasts)}</section>`;
    }

    rootElement.addEventListener("click", (event) => {
        const dismissButton = event.target.closest("[data-dismiss-toast]");
        if (!dismissButton) {
            return;
        }

        dismissToast(dismissButton.getAttribute("data-dismiss-toast"));
    });

    subscribeUiStore((state) => {
        render(state.toasts);
    });

  render([]);
}
