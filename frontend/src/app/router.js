import { evaluateRouteAccess } from "./guards.js";

function getQueryParams(search) {
  return new URLSearchParams(search);
}

function createNotFoundPage(pathname) {
  return {
    html: `
      <main class="app-main">
        <section class="shell shell--centered">
          <div class="empty-state">
            <span class="eyebrow">404</span>
            <h1 class="page-title">Route not found</h1>
            <p class="page-copy">No page is registered for <code>${pathname}</code>.</p>
            <a class="button button--primary" href="/" data-link>Return home</a>
          </div>
        </section>
      </main>
    `
  };
}

export function createRouter({ mountNode, routes, getSession }) {
  async function renderCurrentRoute() {
    const pathname = window.location.pathname;
    const matchedRoute = routes.find((route) => route.path === pathname);
    const route = matchedRoute ?? null;
    const session = getSession();

    if (!route) {
      document.title = "Not Found | Royal Service Parking";
      mountNode.innerHTML = createNotFoundPage(pathname).html;
      return;
    }

    const access = evaluateRouteAccess(route, session);
    if (access.redirectTo && access.redirectTo !== pathname) {
      navigate(access.redirectTo, { replace: true });
      return;
    }

    if (route.redirectTo) {
      navigate(route.redirectTo, { replace: true });
      return;
    }

    document.title = route.title
      ? `${route.title} | Royal Service Parking`
      : "Royal Service Parking";

    const page = route.createPage({
      route,
      pathname,
      query: getQueryParams(window.location.search),
      session
    });

    mountNode.innerHTML = page.html;
    page.onMount?.({ route, session, navigate, refresh: renderCurrentRoute });

    const focusTarget = mountNode.querySelector("[data-page-heading]");
    if (focusTarget) {
      focusTarget.focus();
    }
  }

  function navigate(path, options = {}) {
    const { replace = false } = options;
    const method = replace ? "replaceState" : "pushState";

    window.history[method]({}, "", path);
    renderCurrentRoute();
  }

  function handleDocumentClick(event) {
    const link = event.target.closest("[data-link]");
    if (!link) {
      return;
    }

    const href = link.getAttribute("href");
    if (!href || href.startsWith("http")) {
      return;
    }

    event.preventDefault();
    navigate(href);
  }

  function start() {
    window.addEventListener("popstate", renderCurrentRoute);
    document.addEventListener("click", handleDocumentClick);
    renderCurrentRoute();
  }

  return {
    navigate,
    renderCurrentRoute,
    start
  };
}
