import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";
import { getRoleHome } from "../../app/guards.js";
import { login, fetchCurrentSession } from "../../services/auth-service.js";
import { setAuthState } from "../../state/auth-store.js";
import { pushToast } from "../../state/ui-store.js";
import { validateRequiredFields } from "../../utils/validators.js";

const loginCopy = {
  eyebrow: "Shared access",
  title: "Sign in once and continue automatically",
  description: "Use one login page for returning accounts and let backend authorization open the correct workspace after authentication.",
  accentClass: "auth-layout--user",
  panelTitle: "One session flow, backend-controlled destination.",
  panelCopy:
    "Spring Security still owns authentication and authority checks. The frontend signs you in once, refreshes the session, and navigates to the right place automatically.",
  bullets: [
    "Verified customer accounts still require email verification before access.",
    "Registration and password recovery remain available from the public experience.",
    "The destination after sign-in is based on backend authorization, not a public role picker."
  ],
  helperText: "Use your email or username and password. The system will route the authenticated account automatically.",
  footerLinks: `
    <a href="/forgot-password" data-link>Forgot password?</a>
    <a href="/register" data-link>Create an account</a>
  `
};

function renderRouteMessage({ query }) {
  if (query.get("error") === "true") {
    return renderInlineAlert({
      tone: "danger",
      title: "Sign-in failed",
      message: "The backend rejected the credentials for this login attempt."
    });
  }

  if (query.get("logout") === "true") {
    return renderInlineAlert({
      tone: "info",
      title: "Signed out",
      message: "Your session has been cleared successfully."
    });
  }

  if (query.get("reset") === "true") {
    return renderInlineAlert({
      tone: "info",
      title: "Password updated",
      message: "Use your new password to sign in again."
    });
  }

  return "";
}

export function createLoginPage(context) {
  return {
    html: `
      ${renderPublicNavbar({ currentPath: context.pathname, showPrimaryCta: false })}
      <main class="app-main">
        <section class="shell shell--auth">
          <div class="auth-layout ${loginCopy.accentClass}">
            <aside class="auth-layout__panel">
              <span class="eyebrow">${loginCopy.eyebrow}</span>
              <h1 class="page-title" tabindex="-1" data-page-heading>${loginCopy.title}</h1>
              <p class="page-copy page-copy--lead">${loginCopy.description}</p>
              <div class="auth-story-card">
                <h2>${loginCopy.panelTitle}</h2>
                <p>${loginCopy.panelCopy}</p>
                <ul class="auth-story-list">
                  ${loginCopy.bullets.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </div>
              <div class="auth-policy-card">
                <span class="metric-card__label">How sign-in works</span>
                <p>
                  This page is publicly reachable, but backend authorization still controls where an authenticated account can go after sign-in.
                </p>
              </div>
              <div class="auth-support-links">
                <a class="button button--ghost" href="/" data-link>Back to home</a>
                <a class="button button--secondary" href="/register" data-link>Create account</a>
              </div>
            </aside>
            <div class="auth-card auth-card--elevated">
              <span class="eyebrow">${loginCopy.eyebrow}</span>
              <h2 class="auth-card__title">Shared sign in</h2>
              <p class="page-copy">${loginCopy.helperText}</p>
              ${renderRouteMessage({ query: context.query })}
              <form class="stack-sm" data-login-form novalidate>
                <div class="field-group">
                  <label for="username">Email or username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autocomplete="username"
                    required
                    aria-describedby="username-hint username-error"
                  />
                  <p class="field-hint" id="username-hint">
                    For customer accounts, this is typically the registered email address. Backend authorization resolves the destination after authentication.
                  </p>
                  <p class="field-error" id="username-error" data-field-error="username"></p>
                </div>
                <div class="field-group">
                  <label for="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    aria-describedby="password-error"
                  />
                  <p class="field-error" id="password-error" data-field-error="password"></p>
                </div>
                <div class="auth-form__meta">
                  <div class="status-chip">Session-based authentication</div>
                  <div class="auth-inline-links">
                    ${loginCopy.footerLinks}
                  </div>
                </div>
                <div class="auth-policy-card auth-policy-card--compact">
                  <span class="metric-card__label">Before you continue</span>
                  <p>
                    Verified accounts still need backend-approved access and customer accounts must complete email verification before sign-in.
                  </p>
                </div>
                <div class="form-feedback" role="status" aria-live="polite" data-form-feedback></div>
                <button class="button button--primary button--block" type="submit" data-submit-button>
                  Sign in
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      ${renderPublicFooter()}
    `,
    onMount: ({ navigate }) => {
      const form = document.querySelector("[data-login-form]");
      const feedback = document.querySelector("[data-form-feedback]");
      const submitButton = document.querySelector("[data-submit-button]");

      function setFieldError(fieldName, message = "") {
        const input = document.querySelector(`[name="${fieldName}"]`);
        const errorNode = document.querySelector(`[data-field-error="${fieldName}"]`);

        if (input) {
          input.setAttribute("aria-invalid", message ? "true" : "false");
        }

        if (errorNode) {
          errorNode.textContent = message;
        }
      }

      function resetFieldErrors() {
        setFieldError("username");
        setFieldError("password");
      }

      form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        resetFieldErrors();
        feedback.textContent = "";
        feedback.className = "form-feedback";

        const formData = new FormData(form);
        const values = {
          username: String(formData.get("username") ?? "").trim(),
          password: String(formData.get("password") ?? "")
        };

        const validationErrors = validateRequiredFields(values, ["username", "password"]);
        if (validationErrors.length > 0) {
          if (validationErrors.includes("username")) {
            setFieldError("username", "Username or email is required.");
          }

          if (validationErrors.includes("password")) {
            setFieldError("password", "Password is required.");
          }

          feedback.textContent = "Complete the required fields before signing in.";
          feedback.className = "form-feedback form-feedback--error";
          return;
        }

        form.setAttribute("aria-busy", "true");
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Signing in...";
        }

        feedback.textContent = "Verifying credentials and opening the correct workspace...";
        feedback.className = "form-feedback";

        try {
          await login(values);
          const session = await fetchCurrentSession();
          setAuthState({ session });
          pushToast({
            tone: "success",
            title: "Signed in",
            message: "Session bootstrap completed successfully."
          });
          navigate(context.query.get("next") || getRoleHome(session.role), { replace: true });
        } catch (error) {
          feedback.textContent = error.message || "Unable to sign in.";
          feedback.className = "form-feedback form-feedback--error";
        } finally {
          form.removeAttribute("aria-busy");
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Sign in";
          }
        }
      });
    }
  };
}
