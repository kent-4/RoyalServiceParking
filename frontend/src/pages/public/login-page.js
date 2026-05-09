import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";
import { getRoleHome } from "../../app/guards.js";
import { login, fetchCurrentSession } from "../../services/auth-service.js";
import { setAuthState } from "../../state/auth-store.js";
import { pushToast } from "../../state/ui-store.js";
import { validateRequiredFields } from "../../utils/validators.js";

const roleCopy = {
  user: {
    eyebrow: "Customer access",
    title: "User login",
    description: "Sign in to manage reservations, bookings, notifications, and your parking profile.",
    accentClass: "auth-layout--user",
    panelTitle: "Advance booking remains account-based.",
    panelCopy:
      "Verified customers use this route to review bookings, restriction status, notifications, and upcoming reservations.",
    bullets: [
      "Booking access remains blocked until the backend confirms the account is verified.",
      "Reservation history, profile updates, and notification flows will continue from this role area.",
      "Forgot-password and registration routes stay available from the public experience."
    ],
    helperText: "Use the same email and password tied to your verified customer account.",
    footerLinks: `
      <a href="/forgot-password" data-link>Forgot password?</a>
      <a href="/register" data-link>Create an account</a>
    `
  },
  cashier: {
    eyebrow: "Operational access",
    title: "Cashier login",
    description: "Access the operations workspace for arrivals, active sessions, and receipts.",
    accentClass: "auth-layout--cashier",
    panelTitle: "Built for time-sensitive on-site actions.",
    panelCopy:
      "Cashier access stays separated from customer routes so arrival, payment, and receipt workflows remain fast and readable.",
    bullets: [
      "Use the cashier route only for operational tasks such as arrival check-in and booking completion.",
      "The rebuild keeps tablet-friendly layout expectations in place for this role area.",
      "Staff-account management is still a product decision, so this route remains backend-controlled."
    ],
    helperText: "Use your assigned cashier credentials.",
    footerLinks: `
      <a href="/forgot-password" data-link>Forgot password?</a>
      <a href="/login/admin" data-link>Admin login instead</a>
    `
  },
  admin: {
    eyebrow: "Management access",
    title: "Admin login",
    description: "Access pricing, user management, restrictions, and reporting controls.",
    accentClass: "auth-layout--admin",
    panelTitle: "Management routes stay separate from operations.",
    panelCopy:
      "Admin access is reserved for oversight across pricing, users, restrictions, dashboards, and reporting controls.",
    bullets: [
      "Role mismatch protection remains active so users cannot enter the wrong workspace after authentication.",
      "Backend authorization still decides access even when the frontend route appears reachable.",
      "Reporting and pricing pages will be layered into this workspace after the public/auth milestone."
    ],
    helperText: "Use your authorized administrator credentials.",
    footerLinks: `
      <a href="/forgot-password" data-link>Forgot password?</a>
      <a href="/login/cashier" data-link>Cashier login instead</a>
    `
  }
};

function renderRouteMessage({ query, loginType }) {
  if (query.get("error") === "invalid_role") {
    return renderInlineAlert({
      tone: "danger",
      title: "Role mismatch",
      message:
        "The selected login page did not match the authenticated account type. Use the route that matches your role."
    });
  }

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

  if (query.get("reset") === "true" && loginType === "user") {
    return renderInlineAlert({
      tone: "info",
      title: "Password updated",
      message: "Use your new password to sign in to the user portal."
    });
  }

  return "";
}

export function createLoginPage(context, { loginType }) {
  const copy = roleCopy[loginType];

  return {
    html: `
      ${renderPublicNavbar({ currentPath: context.pathname, showPrimaryCta: false })}
      <main class="app-main">
        <section class="shell shell--auth">
          <div class="auth-layout ${copy.accentClass}">
            <aside class="auth-layout__panel">
              <span class="eyebrow">${copy.eyebrow}</span>
              <h1 class="page-title" tabindex="-1" data-page-heading>${copy.title}</h1>
              <p class="page-copy page-copy--lead">${copy.description}</p>
              <div class="auth-story-card">
                <h2>${copy.panelTitle}</h2>
                <p>${copy.panelCopy}</p>
                <ul class="auth-story-list">
                  ${copy.bullets.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </div>
              <div class="auth-support-links">
                <a class="button button--ghost" href="/" data-link>Back to home</a>
                ${
                  loginType === "user"
                    ? '<a class="button button--secondary" href="/register" data-link>Create account</a>'
                    : '<a class="button button--secondary" href="/login/user" data-link>User login</a>'
                }
              </div>
            </aside>
            <div class="auth-card auth-card--elevated">
              <span class="eyebrow">${copy.eyebrow}</span>
              <h2 class="auth-card__title">Sign in</h2>
              <p class="page-copy">${copy.helperText}</p>
              ${renderRouteMessage({ query: context.query, loginType })}
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
                    ${
                      loginType === "user"
                        ? "For users, this is typically the registered email address."
                        : "Staff access remains controlled by the backend role configuration."
                    }
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
                    ${copy.footerLinks}
                  </div>
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
          password: String(formData.get("password") ?? ""),
          loginType
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
