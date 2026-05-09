import { renderPublicFooter } from "../../components/footer/public-footer.js";
import { renderPublicNavbar } from "../../components/navbar/public-navbar.js";
import { registerUser } from "../../services/auth-service.js";
import { pushToast } from "../../state/ui-store.js";
import {
  getPasswordStrength,
  isAtLeastAge,
  isValidEmail,
  validateRequiredFields
} from "../../utils/validators.js";

const vehicleTypes = [
  "SUV",
  "Sedan",
  "CUV",
  "Van",
  "Hatchback",
  "Pick Up Car",
  "Convertible",
  "Wagon",
  "Sportscars",
  "Coupe",
  "Jeep",
  "Motorcycles"
];

function renderVehicleOptions() {
  return vehicleTypes.map((type) => `<option value="${type}">${type}</option>`).join("");
}

export function createRegisterPage(context) {
  return {
    html: `
      ${renderPublicNavbar({ currentPath: context.pathname })}
      <main class="app-main">
        <section class="shell shell--auth">
          <div class="public-form-layout">
            <aside class="auth-layout__panel">
              <span class="eyebrow">Customer onboarding</span>
              <h1 class="page-title" tabindex="-1" data-page-heading>Create your parking account</h1>
              <p class="page-copy page-copy--lead">
                Registration is the first step toward advance booking. Verified customers can reserve slots, track bookings, and receive parking notifications.
              </p>
              <div class="auth-story-card">
                <h2>What this account unlocks</h2>
                <ul class="auth-story-list">
                  <li>Verified access to advance parking reservations.</li>
                  <li>Booking history, notifications, and restriction visibility.</li>
                  <li>Vehicle and profile details prefilled into later booking flows.</li>
                </ul>
              </div>
              <div class="policy-card policy-card--warning">
                <span class="metric-card__label">Verification required</span>
                <strong>Email verification is still mandatory before user login.</strong>
                <p>
                  If an unverified account already exists for the same email, the backend replaces it during registration.
                </p>
              </div>
            </aside>
            <div class="auth-card auth-card--elevated">
              <span class="eyebrow">Registration form</span>
              <h2 class="auth-card__title">Tell us about your account, profile, and vehicle</h2>
              <p class="page-copy">
                Complete the required fields carefully. The backend remains the final validator for uniqueness and account creation.
              </p>
              <form class="stack-sm" data-register-form novalidate>
                <section class="form-section">
                  <h3>Account information</h3>
                  <div class="field-row">
                    <div class="field-group">
                      <label for="fullName">Full name</label>
                      <input id="fullName" name="fullName" type="text" required />
                      <p class="field-error" data-field-error="fullName"></p>
                    </div>
                    <div class="field-group">
                      <label for="email">Email address</label>
                      <input id="email" name="email" type="email" autocomplete="email" required />
                      <p class="field-error" data-field-error="email"></p>
                    </div>
                  </div>
                  <div class="field-row">
                    <div class="field-group">
                      <label for="password">Password</label>
                      <input id="password" name="password" type="password" autocomplete="new-password" required />
                      <div class="password-meter" aria-hidden="true">
                        <div class="password-meter__bar" data-password-strength-bar></div>
                      </div>
                      <p class="field-hint">Use at least 6 characters. Stronger combinations are better.</p>
                      <p class="field-error" data-field-error="password"></p>
                    </div>
                    <div class="field-group">
                      <label for="confirmPassword">Confirm password</label>
                      <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required />
                      <p class="field-error" data-field-error="confirmPassword"></p>
                    </div>
                  </div>
                </section>

                <section class="form-section">
                  <h3>Personal details</h3>
                  <div class="field-row">
                    <div class="field-group">
                      <label for="dateOfBirth">Date of birth</label>
                      <input id="dateOfBirth" name="dateOfBirth" type="date" required />
                      <p class="field-hint">You must be at least 15 years old.</p>
                      <p class="field-error" data-field-error="dateOfBirth"></p>
                    </div>
                    <div class="field-group">
                      <label for="phoneNumber">Phone number</label>
                      <input id="phoneNumber" name="phoneNumber" type="tel" required />
                      <p class="field-error" data-field-error="phoneNumber"></p>
                    </div>
                  </div>
                  <div class="field-row field-row--single">
                    <div class="field-group">
                      <span class="field-legend">Gender</span>
                      <div class="radio-group" role="radiogroup" aria-label="Gender">
                        <label class="choice-chip">
                          <input type="radio" name="gender" value="Male" />
                          <span>Male</span>
                        </label>
                        <label class="choice-chip">
                          <input type="radio" name="gender" value="Female" />
                          <span>Female</span>
                        </label>
                      </div>
                      <p class="field-error" data-field-error="gender"></p>
                    </div>
                  </div>
                  <div class="field-row field-row--single">
                    <div class="field-group">
                      <label for="address">Address</label>
                      <textarea id="address" name="address" rows="3"></textarea>
                      <p class="field-error" data-field-error="address"></p>
                    </div>
                  </div>
                </section>

                <section class="form-section">
                  <h3>Vehicle details</h3>
                  <div class="field-row">
                    <div class="field-group">
                      <label for="plateNumber">Plate number</label>
                      <input id="plateNumber" name="plateNumber" type="text" required />
                      <p class="field-error" data-field-error="plateNumber"></p>
                    </div>
                    <div class="field-group">
                      <label for="vehicleType">Vehicle type</label>
                      <select id="vehicleType" name="vehicleType" required>
                        <option value="">Select vehicle type</option>
                        ${renderVehicleOptions()}
                      </select>
                      <p class="field-error" data-field-error="vehicleType"></p>
                    </div>
                  </div>
                  <div class="field-row">
                    <div class="field-group">
                      <label for="vehicleModel">Vehicle model</label>
                      <input id="vehicleModel" name="vehicleModel" type="text" required />
                      <p class="field-error" data-field-error="vehicleModel"></p>
                    </div>
                    <div class="field-group">
                      <label for="vehicleColor">Vehicle color</label>
                      <input id="vehicleColor" name="vehicleColor" type="text" required />
                      <p class="field-error" data-field-error="vehicleColor"></p>
                    </div>
                  </div>
                </section>

                <label class="checkbox-row">
                  <input type="checkbox" name="termsAccepted" />
                  <span>I confirm the information above is accurate and I understand email verification is required before login.</span>
                </label>
                <p class="field-error" data-field-error="termsAccepted"></p>

                <div class="form-feedback" role="status" aria-live="polite" data-form-feedback></div>

                <div class="auth-support-links">
                  <button class="button button--primary" type="submit" data-submit-button>Create account</button>
                  <a class="button button--secondary" href="/login/user" data-link>Already have an account?</a>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      ${renderPublicFooter()}
    `,
    onMount: ({ navigate }) => {
      const form = document.querySelector("[data-register-form]");
      const feedback = document.querySelector("[data-form-feedback]");
      const submitButton = document.querySelector("[data-submit-button]");
      const dateOfBirthField = document.querySelector("#dateOfBirth");
      const passwordField = document.querySelector("#password");
      const passwordStrengthBar = document.querySelector("[data-password-strength-bar]");

      const today = new Date();
      const maxBirthDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate())
        .toISOString()
        .split("T")[0];

      if (dateOfBirthField) {
        dateOfBirthField.max = maxBirthDate;
      }

      function setFieldError(fieldName, message = "") {
        const input = form?.querySelector(`[name="${fieldName}"]`);
        const errorNode = form?.querySelector(`[data-field-error="${fieldName}"]`);

        if (input && input.type !== "radio" && input.type !== "checkbox") {
          input.setAttribute("aria-invalid", message ? "true" : "false");
        }

        if (errorNode) {
          errorNode.textContent = message;
        }
      }

      function resetFieldErrors() {
        [
          "fullName",
          "email",
          "password",
          "confirmPassword",
          "dateOfBirth",
          "phoneNumber",
          "gender",
          "address",
          "plateNumber",
          "vehicleType",
          "vehicleModel",
          "vehicleColor",
          "termsAccepted"
        ].forEach((field) => setFieldError(field));
      }

      function renderPasswordStrength(password) {
        if (!passwordStrengthBar) {
          return;
        }

        const score = getPasswordStrength(password);
        passwordStrengthBar.style.width = `${score}%`;
        passwordStrengthBar.className = "password-meter__bar";

        if (score < 40) {
          passwordStrengthBar.classList.add("is-weak");
        } else if (score < 80) {
          passwordStrengthBar.classList.add("is-medium");
        } else {
          passwordStrengthBar.classList.add("is-strong");
        }
      }

      passwordField?.addEventListener("input", (event) => {
        renderPasswordStrength(event.target.value);
      });

      form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        resetFieldErrors();
        feedback.textContent = "";
        feedback.className = "form-feedback";

        const formData = new FormData(form);
        const values = {
          fullName: String(formData.get("fullName") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
          confirmPassword: String(formData.get("confirmPassword") ?? ""),
          dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
          phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
          gender: String(formData.get("gender") ?? ""),
          address: String(formData.get("address") ?? "").trim(),
          plateNumber: String(formData.get("plateNumber") ?? "").trim(),
          vehicleType: String(formData.get("vehicleType") ?? ""),
          vehicleModel: String(formData.get("vehicleModel") ?? "").trim(),
          vehicleColor: String(formData.get("vehicleColor") ?? "").trim(),
          termsAccepted: formData.get("termsAccepted") === "on"
        };

        const validationErrors = validateRequiredFields(values, [
          "fullName",
          "email",
          "password",
          "confirmPassword",
          "dateOfBirth",
          "phoneNumber",
          "gender",
          "plateNumber",
          "vehicleType",
          "vehicleModel",
          "vehicleColor"
        ]);

        if (validationErrors.length > 0) {
          validationErrors.forEach((field) => {
            setFieldError(field, "This field is required.");
          });
        }

        if (values.email && !isValidEmail(values.email)) {
          setFieldError("email", "Enter a valid email address.");
        }

        if (values.password && values.password.length < 6) {
          setFieldError("password", "Password must be at least 6 characters long.");
        }

        if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
          setFieldError("confirmPassword", "Passwords do not match.");
        }

        if (values.dateOfBirth && !isAtLeastAge(values.dateOfBirth, 15)) {
          setFieldError("dateOfBirth", "You must be at least 15 years old.");
        }

        if (!values.termsAccepted) {
          setFieldError("termsAccepted", "You must confirm the registration statement.");
        }

        const hasErrors = form.querySelectorAll(".field-error")
          ? Array.from(form.querySelectorAll(".field-error")).some((node) => node.textContent)
          : false;

        if (hasErrors) {
          feedback.textContent = "Review the highlighted fields and try again.";
          feedback.className = "form-feedback form-feedback--error";
          return;
        }

        form.setAttribute("aria-busy", "true");
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Creating account...";
        }

        feedback.textContent = "Submitting registration and requesting verification email...";

        try {
          await registerUser(values);
          pushToast({
            tone: "success",
            title: "Registration submitted",
            message: "Check your email for the verification link."
          });
          navigate(`/register-success?email=${encodeURIComponent(values.email)}`);
        } catch (error) {
          const fieldErrors = error.payload?.fieldErrors || {};
          Object.entries(fieldErrors).forEach(([field, message]) => {
            setFieldError(field, message);
          });
          feedback.textContent = error.message || "Unable to create the account.";
          feedback.className = "form-feedback form-feedback--error";
        } finally {
          form.removeAttribute("aria-busy");
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Create account";
          }
        }
      });
    }
  };
}
