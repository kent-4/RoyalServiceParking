const listeners = new Set();

const state = {
  toasts: []
};

function emit() {
  listeners.forEach((listener) => listener(state));
}

export function subscribeUiStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushToast(toast) {
  const entry = {
    id: crypto.randomUUID(),
    tone: toast.tone || "info",
    title: toast.title,
    message: toast.message
  };

  state.toasts = [...state.toasts, entry];
  emit();

  window.setTimeout(() => {
    dismissToast(entry.id);
  }, 4000);
}

export function dismissToast(id) {
  state.toasts = state.toasts.filter((item) => item.id !== id);
  emit();
}
