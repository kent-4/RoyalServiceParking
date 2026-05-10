import { routes } from "./routes.js";
import { createRouter } from "./router.js";
import { fetchCurrentSession } from "../services/auth-service.js";
import { getAuthState, setAuthState } from "../state/auth-store.js";
import { mountToastRegion } from "../components/toast/toast-region.js";
import { pushToast } from "../state/ui-store.js";

export async function bootstrap() {
  const appElement = document.querySelector("#app");
  const toastRoot = document.querySelector("#toast-root");

  if (!appElement || !toastRoot) {
    throw new Error("Application root nodes were not found.");
  }

  mountToastRegion(toastRoot);
  appElement.innerHTML = `
    <main class="app-main">
      <section class="shell shell--centered">
        <div class="status-panel">
          <span class="eyebrow">Frontend rebuild</span>
          <h1 class="page-title">Bootstrapping session</h1>
          <p class="page-copy">Checking current authentication state from Spring Boot.</p>
        </div>
      </section>
    </main>
  `;

  try {
    const session = await fetchCurrentSession();
    setAuthState({
      initialized: true,
      session
    });
  } catch {
    setAuthState({
      initialized: true,
      session: {
        authenticated: false,
        role: null
      }
    });

    pushToast({
      tone: "warning",
      title: "Backend unavailable",
      message:
        "The frontend shell loaded, but the backend session endpoint did not respond normally."
    });
  }

  const router = createRouter({
    mountNode: appElement,
    routes,
    getSession: () => getAuthState().session
  });

  router.start();
}
