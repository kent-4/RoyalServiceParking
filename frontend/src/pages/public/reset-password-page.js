import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";
import { resetPassword, validateResetToken } from "../../services/auth-service.js";
import { pushToast } from "../../state/ui-store.js";
import { getPasswordStrength } from "../../utils/validators.js";

export function createResetPasswordPage(context) {
  const token = context.query.get("token") ?? "";

  return {
    html: `
      ${renderPublicNavbar({ currentPath: context.pathname, showPrimaryCta: false })}
      <main class="app-main">
        <section class="shell shell--auth">
          <div class="public-form-layout public-form-layout--narrow">
            <aside class="auth-layout__panel">
              <span class="eyebrow">Token-based recovery</span>
              <h1 class="page-title" tabindex="-1" data-page-heading>Set a new password</h1>
              <p class="page-copy page-copy--lead">
                Reset tokens are validated by the backend before any password update is accepted.
              </p>
              <div class="auth-story-card">
                <h2>Password reset rules</h2>
                <ul class="auth-story-list">
                  <li>Reset links must still be valid when you open this page.</li>
                  <li>Passwords must match before submission.</li>
                  <li>Successful resets return the customer to the shared login route.</li>
                </ul>
              </div>
              <div class="auth-policy-card">
                <span class="metric-card__label">Security note</span>
                <p>
                  If the token is invalid or expired, the password cannot be updated and a new recovery email must be requested.
                </p>
              </div>
            </aside>
            <div class="auth-card auth-card--elevated">
              <span class="eyebrow">Reset form</span>
              <h2 class="auth-card__title">Choose your new password</h2>
              <p class="page-copy" data-reset-status>
                Validating the reset token before allowing password changes.
              </p>
              <div class="auth-policy-card auth-policy-card--compact">
                <span class="metric-card__label">Password quality</span>
                <p>Use at least 6 characters and confirm the same value in both password fields before submission.</p>
              </div>
              <form class="stack-sm" data-reset-password-form novalidate>
                <div class="field-group">
                  <label for="reset-password">New password</label>
                  <input id="reset-password" name="password" type="password" autocomplete="new-password" required />
                  <div class="password-meter" aria-hidden="true">
                    <div class="password-meter__bar" data-password-strength-bar></div>
                  </div>
                  <p class="field-error" data-field-error="password"></p>
                </div>
                <div class="field-group">
                  <label for="reset-confirm-password">Confirm password</label>
                  <input id="reset-confirm-password" name="confirmPassword" type="password" autocomplete="new-password" required />
                  <p class="field-error" data-field-error="confirmPassword"></p>
                </div>
                <div class="form-feedback" role="status" aria-live="polite" data-form-feedback></div>
                <div class="auth-support-links">
                  <button class="button button--primary" type="submit" data-submit-button disabled>Reset password</button>
                  <a class="button button--secondary" href="/forgot-password" data-link>Request another link</a>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      ${renderPublicFooter()}
    `,
    onMount: async ({ navigate }) => {
      const form = document.querySelector("[data-reset-password-form]");
      const statusNode = document.querySelector("[data-reset-status]");
      const feedback = document.querySelector("[data-form-feedback]");
      const submitButton = document.querySelector("[data-submit-button]");
      const passwordField = document.querySelector("#reset-password");
      const strengthBar = document.querySelector("[data-password-strength-bar]");

      function setFieldError(fieldName, message = "") {
        const input = form?.querySelector(`[name="${fieldName}"]`);
        const errorNode = form?.querySelector(`[data-field-error="${fieldName}"]`);

        if (input) {
          input.setAttribute("aria-invalid", message ? "true" : "false");
        }

        if (errorNode) {
          errorNode.textContent = message;
        }
      }

      function renderPasswordStrength(password) {
        if (!strengthBar) {
          return;
        }

        const score = getPasswordStrength(password);
        strengthBar.style.width = `${score}%`;
        strengthBar.className = "password-meter__bar";

        if (score < 40) {
          strengthBar.classList.add("is-weak");
        } else if (score < 80) {
          strengthBar.classList.add("is-medium");
        } else {
          strengthBar.classList.add("is-strong");
        }
      }

      passwordField?.addEventListener("input", (event) => {
        renderPasswordStrength(event.target.value);
      });

      if (!token) {
        statusNode.textContent = "The reset link is missing its token. Request a new password reset email.";
        feedback.textContent = "A reset token is required.";
        feedback.className = "form-feedback form-feedback--error";
        return;
      }

      try {
        const response = await validateResetToken(token);
        statusNode.textContent = response.message;
        if (submitButton) {
          submitButton.disabled = false;
        }
      } catch (error) {
        statusNode.textContent = error.message || "This reset link is invalid or expired.";
        feedback.textContent = "Request a new password reset link to continue.";
        feedback.className = "form-feedback form-feedback--error";
        return;
      }

      form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        setFieldError("password");
        setFieldError("confirmPassword");
        feedback.textContent = "";
        feedback.className = "form-feedback";

        const password = String(new FormData(form).get("password") ?? "");
        const confirmPassword = String(new FormData(form).get("confirmPassword") ?? "");

        let hasErrors = false;

        if (!password) {
          setFieldError("password", "Password is required.");
          hasErrors = true;
        } else if (password.length < 6) {
          setFieldError("password", "Password must be at least 6 characters long.");
          hasErrors = true;
        }

        if (!confirmPassword) {
          setFieldError("confirmPassword", "Confirm your new password.");
          hasErrors = true;
        } else if (password !== confirmPassword) {
          setFieldError("confirmPassword", "Passwords do not match.");
          hasErrors = true;
        }

        if (hasErrors) {
          feedback.textContent = "Resolve the password issues before submitting.";
          feedback.className = "form-feedback form-feedback--error";
          return;
        }

        form.setAttribute("aria-busy", "true");
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Resetting password...";
        }

        feedback.textContent = "Updating your password through the backend...";

        try {
          await resetPassword({ token, password, confirmPassword });
          pushToast({
            tone: "success",
            title: "Password updated",
            message: "Your new password is ready to use."
          });
          navigate("/reset-success");
        } catch (error) {
          feedback.textContent = error.message || "Unable to reset the password.";
          feedback.className = "form-feedback form-feedback--error";
        } finally {
          form.removeAttribute("aria-busy");
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Reset password";
          }
        }
      });
    }
  };
}
