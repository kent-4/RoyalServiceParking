import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";
import { verifyEmailToken } from "../../services/auth-service.js";

export function createVerifyPage(context) {
  const token = context.query.get("token") ?? "";

  return {
    html: `
      ${renderPublicNavbar({ currentPath: context.pathname, showPrimaryCta: false })}
      <main class="app-main">
        <section class="shell shell--centered">
          <div class="status-panel status-panel--wide">
            <span class="eyebrow">Email verification</span>
            <div class="status-hero">
              <div class="status-icon status-icon--info" data-status-icon>...</div>
              <div>
                <h1 class="page-title" tabindex="-1" data-page-heading data-status-title>Checking your verification link</h1>
                <p class="page-copy page-copy--lead" data-status-description>
                  The backend is validating the verification token attached to this email link.
                </p>
              </div>
            </div>
            <div class="status-detail">
              <p data-status-detail>
                Do not close this page while we confirm the account status.
              </p>
            </div>
            <div class="status-actions" data-status-actions>
              <a class="button button--secondary" href="/" data-link>Back to home</a>
            </div>
          </div>
        </section>
      </main>
      ${renderPublicFooter()}
    `,
    onMount: async () => {
      const iconNode = document.querySelector("[data-status-icon]");
      const titleNode = document.querySelector("[data-status-title]");
      const descriptionNode = document.querySelector("[data-status-description]");
      const detailNode = document.querySelector("[data-status-detail]");
      const actionsNode = document.querySelector("[data-status-actions]");

      function renderState({ tone, iconText, title, description, detail, actions }) {
        if (iconNode) {
          iconNode.className = `status-icon status-icon--${tone}`;
          iconNode.textContent = iconText;
        }

        if (titleNode) {
          titleNode.textContent = title;
        }

        if (descriptionNode) {
          descriptionNode.textContent = description;
        }

        if (detailNode) {
          detailNode.textContent = detail;
        }

        if (actionsNode) {
          actionsNode.innerHTML = actions
            .map(
              (action) => `
                <a class="button ${action.variant || "button--secondary"}" href="${action.href}" data-link>
                  ${action.label}
                </a>
              `
            )
            .join("");
        }
      }

      if (!token) {
        renderState({
          tone: "danger",
          iconText: "!",
          title: "Verification link is incomplete",
          description: "This page needs a verification token to activate the account.",
          detail: "Request another verification email by registering again with the same unverified address if needed.",
          actions: [
            { href: "/register", label: "Register again", variant: "button--primary" },
            { href: "/", label: "Back to home" }
          ]
        });
        return;
      }

      try {
        const response = await verifyEmailToken(token);
        renderState({
          tone: "success",
          iconText: "OK",
          title: "Email verified successfully",
          description: response.message,
          detail: "You can now sign in to the customer portal using the verified account credentials.",
          actions: [
            { href: "/login/user", label: "Proceed to user login", variant: "button--primary" },
            { href: "/", label: "Back to home" }
          ]
        });
      } catch (error) {
        renderState({
          tone: "danger",
          iconText: "!",
          title: "Verification failed",
          description: error.message || "The verification link is invalid or expired.",
          detail: "If the account is still unverified, register again with the same email address to request a fresh verification link.",
          actions: [
            { href: "/register", label: "Open registration", variant: "button--primary" },
            { href: "/", label: "Back to home" }
          ]
        });
      }
    }
  };
}
