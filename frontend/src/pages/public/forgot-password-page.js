import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";
import { requestPasswordReset } from "../../services/auth-service.js";
import { pushToast } from "../../state/ui-store.js";
import { isValidEmail } from "../../utils/validators.js";

export function createForgotPasswordPage(context) {
  return {
    html: `
      ${renderPublicNavbar({ currentPath: context.pathname, showPrimaryCta: false })}
      <main class="app-main">
        <section class="shell shell--auth">
          <div class="public-form-layout public-form-layout--narrow">
            <aside class="auth-layout__panel">
              <span class="eyebrow">Password recovery</span>
              <h1 class="page-title" tabindex="-1" data-page-heading>Request a password reset link</h1>
              <p class="page-copy page-copy--lead">
                Only verified customer accounts can request password recovery. The backend remains responsible for token issuance and invalidation.
              </p>
              <div class="auth-story-card">
                <h2>Before you continue</h2>
                <ul class="auth-story-list">
                  <li>Use the verified email tied to your customer account.</li>
                  <li>Reset links are delivered through the backend email service.</li>
                  <li>If the token expires, request a fresh link from this screen.</li>
                </ul>
              </div>
            </aside>
            <div class="auth-card auth-card--elevated">
              <span class="eyebrow">Recovery form</span>
              <h2 class="auth-card__title">Enter your account email</h2>
              <p class="page-copy">We’ll ask the backend to send a reset link if the account is verified.</p>
              <form class="stack-sm" data-forgot-password-form novalidate>
                <div class="field-group">
                  <label for="forgot-email">Email address</label>
                  <input id="forgot-email" name="email" type="email" autocomplete="email" required />
                  <p class="field-hint">The system checks whether the email exists and is already verified.</p>
                  <p class="field-error" data-field-error="email"></p>
                </div>
                <div class="form-feedback" role="status" aria-live="polite" data-form-feedback></div>
                <div class="auth-support-links">
                  <button class="button button--primary" type="submit" data-submit-button>Send reset link</button>
                  <a class="button button--secondary" href="/login/user" data-link>Back to login</a>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      ${renderPublicFooter()}
    `,
    onMount: ({ navigate }) => {
      const form = document.querySelector("[data-forgot-password-form]");
      const feedback = document.querySelector("[data-form-feedback]");
      const submitButton = document.querySelector("[data-submit-button]");
      const emailField = document.querySelector("#forgot-email");
      const errorNode = document.querySelector("[data-field-error='email']");

      form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = String(new FormData(form).get("email") ?? "").trim();
        emailField?.setAttribute("aria-invalid", "false");
        if (errorNode) {
          errorNode.textContent = "";
        }

        if (!email) {
          emailField?.setAttribute("aria-invalid", "true");
          if (errorNode) {
            errorNode.textContent = "Email is required.";
          }
          feedback.textContent = "Enter the email address linked to your account.";
          feedback.className = "form-feedback form-feedback--error";
          return;
        }

        if (!isValidEmail(email)) {
          emailField?.setAttribute("aria-invalid", "true");
          if (errorNode) {
            errorNode.textContent = "Enter a valid email address.";
          }
          feedback.textContent = "The email format is not valid.";
          feedback.className = "form-feedback form-feedback--error";
          return;
        }

        form.setAttribute("aria-busy", "true");
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Sending...";
        }

        feedback.textContent = "Checking verification status and requesting reset email...";
        feedback.className = "form-feedback";

        try {
          await requestPasswordReset(email);
          pushToast({
            tone: "success",
            title: "Reset email requested",
            message: "If the account is eligible, a reset link is on the way."
          });
          navigate(`/forgot-password-confirmation?email=${encodeURIComponent(email)}`);
        } catch (error) {
          feedback.textContent = error.message || "Unable to request a reset link.";
          feedback.className = "form-feedback form-feedback--error";
        } finally {
          form.removeAttribute("aria-busy");
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Send reset link";
          }
        }
      });
    }
  };
}
