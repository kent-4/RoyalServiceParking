let dialogElement;
let titleElement;
let messageElement;
let cancelButton;
let confirmButton;
let resolvePending;

function ensureDialog() {
  if (dialogElement) {
    return dialogElement;
  }

  dialogElement = document.createElement("dialog");
  dialogElement.className = "confirm-dialog";
  dialogElement.innerHTML = `
    <form method="dialog" class="confirm-dialog__panel">
      <div class="confirm-dialog__header">
        <p class="eyebrow">Confirm action</p>
        <h2 class="confirm-dialog__title"></h2>
      </div>
      <p class="confirm-dialog__message"></p>
      <div class="confirm-dialog__actions">
        <button class="button button--secondary" type="button" data-dialog-cancel>Back</button>
        <button class="button button--primary" type="button" data-dialog-confirm>Confirm</button>
      </div>
    </form>
  `;

  titleElement = dialogElement.querySelector(".confirm-dialog__title");
  messageElement = dialogElement.querySelector(".confirm-dialog__message");
  cancelButton = dialogElement.querySelector("[data-dialog-cancel]");
  confirmButton = dialogElement.querySelector("[data-dialog-confirm]");

  cancelButton?.addEventListener("click", () => closeDialog(false));
  confirmButton?.addEventListener("click", () => closeDialog(true));
  dialogElement.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog(false);
  });
  dialogElement.addEventListener("close", () => {
    if (resolvePending) {
      resolvePending(false);
      resolvePending = null;
    }
  });

  document.body.append(dialogElement);
  return dialogElement;
}

function closeDialog(result) {
  if (!dialogElement) {
    return;
  }

  const resolver = resolvePending;
  resolvePending = null;
  dialogElement.close();
  if (resolver) {
    resolver(result);
  }
}

export function openConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Back",
  tone = "primary"
}) {
  if (typeof HTMLDialogElement === "undefined") {
    return Promise.resolve(window.confirm(message));
  }

  ensureDialog();
  titleElement.textContent = title;
  messageElement.textContent = message;
  cancelButton.textContent = cancelLabel;
  confirmButton.textContent = confirmLabel;
  confirmButton.className = `button ${tone === "danger" ? "button--danger" : "button--primary"}`;

  return new Promise((resolve) => {
    resolvePending = resolve;
    dialogElement.showModal();
  });
}
