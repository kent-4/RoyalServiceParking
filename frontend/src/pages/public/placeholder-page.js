import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";

export function createPlaceholderPublicPage(_context, content) {
  return {
    html: `
      ${renderPublicNavbar()}
      <main class="app-main">
        <section class="shell shell--centered">
          <div class="status-panel status-panel--wide">
            <span class="eyebrow">${content.eyebrow}</span>
            <h1 class="page-title" tabindex="-1" data-page-heading>${content.title}</h1>
            <p class="page-copy">${content.description}</p>
            <a class="button button--secondary" href="/" data-link>Return home</a>
          </div>
        </section>
      </main>
    `
  };
}
