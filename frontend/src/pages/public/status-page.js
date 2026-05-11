import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";

export function createStatusPage(context, options) {
  return {
    html: `
      ${renderPublicNavbar({ currentPath: context.pathname, showPrimaryCta: false })}
      <main class="app-main">
        <section class="shell shell--centered">
          <div class="status-panel status-panel--wide">
            <span class="eyebrow">${options.eyebrow}</span>
            <div class="status-panel__header">
              <div class="status-hero">
                <div class="status-icon status-icon--${options.tone}">${options.iconText}</div>
                <div>
                  <h1 class="page-title" tabindex="-1" data-page-heading>${options.title}</h1>
                  <p class="page-copy page-copy--lead">${options.description}</p>
                </div>
              </div>
              <div class="status-panel__meta">
                <span class="status-chip">Shared auth flow</span>
                <span class="status-chip">Public route</span>
              </div>
            </div>
            ${
              options.detail
                ? `<div class="status-detail"><p>${options.detail}</p></div>`
                : ""
            }
            <div class="status-actions">
              ${options.actions
                .map(
                  (action) => `
                    <a class="button ${action.variant || "button--secondary"}" href="${action.href}" data-link>
                      ${action.label}
                    </a>
                  `
                )
                .join("")}
            </div>
          </div>
        </section>
      </main>
      ${renderPublicFooter()}
    `
  };
}
