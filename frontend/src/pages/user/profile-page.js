import { pushToast } from "../../state/ui-store.js";
import { fetchUserProfile, updateUserProfile } from "../../services/user-service.js";
import { validateRequiredFields } from "../../utils/validators.js";
import { bindUserShell, renderUserShell } from "./user-shell.js";

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

export function createUserProfilePage({ session, pathname }) {
  return {
    html: renderUserShell({
      session,
      currentPath: pathname,
      eyebrow: "Profile management",
      title: "Manage your account details",
      description:
        "Update the customer and vehicle details that the booking flow depends on. Email, role, and verification state remain backend-controlled.",
      content: `
        <section class="dashboard-grid">
          <article class="panel-card">
            <h2>Profile editor</h2>
            <form class="stack-sm" data-profile-form novalidate>
              <div class="field-row">
                <div class="field-group">
                  <label for="profile-full-name">Full name</label>
                  <input id="profile-full-name" name="fullName" type="text" required />
                  <p class="field-error" data-field-error="fullName"></p>
                </div>
                <div class="field-group">
                  <label for="profile-email">Email</label>
                  <input id="profile-email" name="email" type="email" readonly disabled />
                </div>
              </div>
              <div class="field-row">
                <div class="field-group">
                  <label for="profile-phone">Phone number</label>
                  <input id="profile-phone" name="phoneNumber" type="tel" required />
                  <p class="field-error" data-field-error="phoneNumber"></p>
                </div>
                <div class="field-group">
                  <label for="profile-plate">Plate number</label>
                  <input id="profile-plate" name="plateNumber" type="text" required />
                  <p class="field-error" data-field-error="plateNumber"></p>
                </div>
              </div>
              <div class="field-row">
                <div class="field-group">
                  <label for="profile-vehicle-type">Vehicle type</label>
                  <select id="profile-vehicle-type" name="vehicleType" required>
                    <option value="">Select vehicle type</option>
                    ${renderVehicleOptions()}
                  </select>
                  <p class="field-error" data-field-error="vehicleType"></p>
                </div>
                <div class="field-group">
                  <label for="profile-vehicle-model">Vehicle model</label>
                  <input id="profile-vehicle-model" name="vehicleModel" type="text" required />
                  <p class="field-error" data-field-error="vehicleModel"></p>
                </div>
              </div>
              <div class="field-row">
                <div class="field-group">
                  <label for="profile-vehicle-color">Vehicle color</label>
                  <input id="profile-vehicle-color" name="vehicleColor" type="text" required />
                  <p class="field-error" data-field-error="vehicleColor"></p>
                </div>
                <div class="field-group">
                  <label for="profile-address">Address</label>
                  <textarea id="profile-address" name="address" rows="3"></textarea>
                  <p class="field-error" data-field-error="address"></p>
                </div>
              </div>
              <div class="form-feedback" role="status" aria-live="polite" data-form-feedback></div>
              <div class="auth-support-links">
                <button class="button button--primary" type="submit" data-submit-button>Save profile</button>
                <a class="button button--secondary" href="/user/dashboard" data-link>Back to dashboard</a>
              </div>
            </form>
          </article>
          <article class="panel-card" data-profile-status-card>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
          </article>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindUserShell({ navigate });

      const form = document.querySelector("[data-profile-form]");
      const feedback = document.querySelector("[data-form-feedback]");
      const submitButton = document.querySelector("[data-submit-button]");
      const statusCard = document.querySelector("[data-profile-status-card]");

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

      try {
        const profile = await fetchUserProfile();
        const fields = {
          fullName: profile.fullName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          plateNumber: profile.plateNumber,
          vehicleType: profile.vehicleType,
          vehicleModel: profile.vehicleModel,
          vehicleColor: profile.vehicleColor,
          address: profile.address ?? ""
        };

        Object.entries(fields).forEach(([name, value]) => {
          const input = form?.querySelector(`[name="${name}"]`);
          if (input) {
            input.value = value ?? "";
          }
        });

        if (statusCard) {
          statusCard.innerHTML = `
            <h2>Account status</h2>
            <div class="detail-list">
              <div><span>Verification</span><strong>${profile.verified ? "Verified" : "Pending"}</strong></div>
              <div><span>Restriction</span><strong>${profile.blocklisted ? "Restricted" : "Good standing"}</strong></div>
              <div><span>Missed bookings</span><strong>${profile.missedBookingsCount}</strong></div>
              <div><span>Vehicle summary</span><strong>${profile.vehicleType} • ${profile.plateNumber}</strong></div>
            </div>
          `;
        }
      } catch (error) {
        if (statusCard) {
          statusCard.innerHTML = `
            <h2>Profile unavailable</h2>
            <p class="page-copy">${error.message || "Unable to load profile details."}</p>
          `;
        }
      }

      form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        feedback.textContent = "";
        feedback.className = "form-feedback";

        ["fullName", "phoneNumber", "plateNumber", "vehicleType", "vehicleModel", "vehicleColor", "address"].forEach(
          (field) => setFieldError(field)
        );

        const formData = new FormData(form);
        const values = {
          fullName: String(formData.get("fullName") ?? "").trim(),
          phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
          address: String(formData.get("address") ?? "").trim(),
          plateNumber: String(formData.get("plateNumber") ?? "").trim(),
          vehicleType: String(formData.get("vehicleType") ?? ""),
          vehicleModel: String(formData.get("vehicleModel") ?? "").trim(),
          vehicleColor: String(formData.get("vehicleColor") ?? "").trim()
        };

        const requiredErrors = validateRequiredFields(values, [
          "fullName",
          "phoneNumber",
          "plateNumber",
          "vehicleType",
          "vehicleModel",
          "vehicleColor"
        ]);

        if (requiredErrors.length > 0) {
          requiredErrors.forEach((field) => {
            setFieldError(field, "This field is required.");
          });
          feedback.textContent = "Complete the required profile fields before saving.";
          feedback.className = "form-feedback form-feedback--error";
          return;
        }

        form.setAttribute("aria-busy", "true");
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Saving...";
        }

        feedback.textContent = "Saving profile changes through the backend...";

        try {
          const updated = await updateUserProfile(values);
          pushToast({
            tone: "success",
            title: "Profile updated",
            message: "Your customer details have been saved successfully."
          });
          if (statusCard) {
            statusCard.innerHTML = `
              <h2>Account status</h2>
              <div class="detail-list">
                <div><span>Verification</span><strong>${updated.verified ? "Verified" : "Pending"}</strong></div>
                <div><span>Restriction</span><strong>${updated.blocklisted ? "Restricted" : "Good standing"}</strong></div>
                <div><span>Missed bookings</span><strong>${updated.missedBookingsCount}</strong></div>
                <div><span>Vehicle summary</span><strong>${updated.vehicleType} • ${updated.plateNumber}</strong></div>
              </div>
            `;
          }
        } catch (error) {
          const fieldErrors = error.payload?.fieldErrors || {};
          Object.entries(fieldErrors).forEach(([field, message]) => {
            setFieldError(field, message);
          });
          feedback.textContent = error.message || "Unable to update your profile.";
          feedback.className = "form-feedback form-feedback--error";
        } finally {
          form.removeAttribute("aria-busy");
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Save profile";
          }
        }
      });
    }
  };
}
