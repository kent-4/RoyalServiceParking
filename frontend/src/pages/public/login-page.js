import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";
import { getRoleHome } from "../../app/guards.js";
import { login, fetchCurrentSession } from "../../services/auth-service.js";
import { setAuthState } from "../../state/auth-store.js";
import { pushToast } from "../../state/ui-store.js";
import { validateRequiredFields } from "../../utils/validators.js";

const roleCopy = {
  default: {
    eyebrow: "Unified access",
    title: "Sign in once and open the correct workspace",
    description: "Use one login page and let the backend resolve whether this account belongs in the user, cashier, or admin experience.",
    accentClass: "auth-layout--user",
    panelTitle: "One session flow, role-aware landing after authentication.",
    panelCopy:
      "Spring Security still owns the real authentication and authority checks. The frontend now asks the backend who you are, then opens the right workspace automatically.",
    bullets: [
      "Verified customer accounts still land in the user portal.",
      "Cashier credentials still open the operational workspace.",
      "Admin credentials still open management and reporting controls."
    ],
    helperText: "Use your email or username and password. The system will detect the correct role after authentication.",
    footerLinks: `
      <a href="/forgot-password" data-link>Forgot password?</a>
      <a href="/register" data-link>Create an account</a>
    `
  },
  user: {
    eyebrow: "Customer access hint",
    title: "Sign in to the customer portal",
    description: "Use the same unified login form, then continue into reservations, bookings, notifications, and your parking profile.",
    accentClass: "auth-layout--user",
    panelTitle: "Advance booking remains account-based.",
    panelCopy:
      "Verified customers use this shared route to review bookings, restriction status, notifications, and upcoming reservations.",
    bullets: [
      "Booking access remains blocked until the backend confirms the account is verified.",
      "Reservation history, profile updates, and notification flows continue from the user role area.",
      "Forgot-password and registration routes stay available from the public experience."
    ],
    helperText: "For customer access, use the verified email and password tied to your account.",
    footerLinks: `
      <a href="/forgot-password" data-link>Forgot password?</a>
      <a href="/register" data-link>Create an account</a>
    `
  },
  cashier: {
    eyebrow: "Operational access hint",
    title: "Sign in for cashier operations",
    description: "Use the same unified login form, then continue into the arrivals, bookings, payment, and receipt workspace if your credentials are cashier-authorized.",
    accentClass: "auth-layout--cashier",
    panelTitle: "Built for time-sensitive on-site actions.",
    panelCopy:
      "Cashier access still stays operationally separate after authentication so arrival, payment, and receipt workflows remain fast and readable.",
    bullets: [
      "Use cashier credentials only for on-site tasks such as arrival check-in and booking completion.",
      "The rebuild keeps tablet-friendly layout expectations in place for this role area.",
      "Staff-account management remains a backend/product decision, but the login route itself is now shared."
    ],
    helperText: "Use your assigned cashier credentials. The backend will route you to the cashier portal automatically.",
    footerLinks: `
      <a href="/forgot-password" data-link>Forgot password?</a>
      <a href="/login?role=admin" data-link>Admin hint instead</a>
    `
  },
  admin: {
    eyebrow: "Management access hint",
    title: "Sign in for admin oversight",
    description: "Use the same unified login form, then continue into pricing, user management, restrictions, reports, and export controls if your credentials are admin-authorized.",
    accentClass: "auth-layout--admin",
    panelTitle: "Management routes stay separate from operations after sign-in.",
    panelCopy:
      "Admin access remains reserved for oversight across pricing, users, restrictions, dashboards, and reporting controls.",
    bullets: [
      "Backend authorization still decides access even when the shared login route is publicly reachable.",
      "The redirect after authentication is based on the resolved authority, not a selected login page.",
      "Reports and pricing controls stay isolated from cashier and customer workflows."
    ],
    helperText: "Use your authorized administrator credentials. The backend will route you to the admin workspace automatically.",
    footerLinks: `
      <a href="/forgot-password" data-link>Forgot password?</a>
      <a href="/login?role=cashier" data-link>Cashier hint instead</a>
    `
  }
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
  const selectedRole = String(context.query.get("role") ?? "default").toLowerCase();
  const copy = roleCopy[selectedRole] ?? roleCopy.default;
  const roleHints = [
    { key: "default", label: "All roles", href: "/login" },
    { key: "user", label: "Customer", href: "/login?role=user" },
    { key: "cashier", label: "Cashier", href: "/login?role=cashier" },
    { key: "admin", label: "Admin", href: "/login?role=admin" }
  ];

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
              <div class="auth-policy-card">
                <span class="metric-card__label">How the shared login behaves</span>
                <p>
                  This page is publicly reachable, but the backend still decides whether the credentials belong to the customer,
                  cashier, or admin workspace after authentication.
                </p>
              </div>
              <div class="auth-support-links">
                <a class="button button--ghost" href="/" data-link>Back to home</a>
                ${
                  selectedRole === "user"
                    ? '<a class="button button--secondary" href="/register" data-link>Create account</a>'
                    : '<a class="button button--secondary" href="/login?role=user" data-link>Customer access</a>'
                }
              </div>
            </aside>
            <div class="auth-card auth-card--elevated">
              <span class="eyebrow">${copy.eyebrow}</span>
              <h2 class="auth-card__title">Shared sign in</h2>
              <p class="page-copy">${copy.helperText}</p>
              <div class="role-hint-grid" aria-label="Role hints">
                ${roleHints
                  .map(
                    (role) => `
                      <a
                        class="role-hint-chip ${selectedRole === role.key ? "is-active" : ""}"
                        href="${role.href}"
                        data-link
                      >
                        ${role.label}
                      </a>
                    `
                  )
                  .join("")}
              </div>
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
                    ${
                      selectedRole === "user"
                        ? "For users, this is typically the registered email address."
                        : selectedRole === "cashier" || selectedRole === "admin"
                          ? "Staff access remains controlled by the backend role configuration."
                          : "The backend resolves the real role after authentication."
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
                <div class="auth-policy-card auth-policy-card--compact">
                  <span class="metric-card__label">Before you continue</span>
                  <p>
                    Customers still need a verified account before login, while cashier and admin access stays controlled by backend authorization.
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
