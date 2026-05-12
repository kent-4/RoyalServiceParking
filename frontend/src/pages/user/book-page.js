import { renderInlineAlert } from "../../components/alert/inline-alert.js";
import { renderButton } from "../../components/button/action-button.js";
import { fetchBookingContext } from "../../services/booking-service.js";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters.js";
import { bindUserShell, renderUserShell } from "./user-shell.js";

function renderContextSkeleton() {
  return `
    <article class="panel-card panel-card--loading">
      <div class="loading-block loading-block--title"></div>
      <div class="loading-block loading-block--value"></div>
    </article>
    <article class="panel-card panel-card--loading">
      <div class="loading-block loading-block--title"></div>
      <div class="loading-block loading-block--value"></div>
    </article>
    <article class="panel-card panel-card--loading">
      <div class="loading-block loading-block--title"></div>
      <div class="loading-block loading-block--value"></div>
    </article>
  `;
}

export function createUserBookPage({ session, pathname, query }) {
  const initialDate = query?.get("date") ?? "";
  const initialTime = query?.get("time") ?? "";
  const initialLevel = query?.get("level") ?? "";

  return {
    html: renderUserShell({
      session,
      currentPath: pathname,
      eyebrow: "Booking setup",
      title: "Book parking",
      description:
        "Start the reservation with date, scheduled time, and parking level before the exact slot is chosen.",
      headerActions: `
        ${renderButton({ label: "My bookings", href: "/user/bookings", tone: "secondary" })}
        ${renderButton({ label: "Parking cost", href: "/user/parking-cost", tone: "ghost" })}
      `,
      notice: `
        <div class="user-notice-panel__content">
          <span class="metric-card__label">Booking window and rules</span>
          <h2>Customers can hold only one active reserved or arrived booking at a time.</h2>
          <p class="page-copy">
            This step also respects restriction status, the booking window, and the no-show policy before slot selection becomes available.
          </p>
        </div>
      `,
      content: `
        <section class="dashboard-grid dashboard-grid--kpi" data-booking-context-grid>
          ${renderContextSkeleton()}
        </section>
        <section class="dashboard-grid booking-flow-grid">
          <article class="panel-card booking-form-card">
            <div class="booking-form-card__header">
              <span class="eyebrow">Booking form</span>
              <h2>Booking details</h2>
              <p class="page-copy">Advance bookings are limited to today through the next three calendar days.</p>
            </div>
            <div data-booking-alerts></div>
            <form class="stack-sm" data-booking-form novalidate>
              <div class="field-row">
                <div class="field-group">
                  <label for="booking-date">Booking date</label>
                  <input id="booking-date" name="date" type="date" value="${initialDate}" required />
                  <p class="field-error" data-field-error="date"></p>
                </div>
                <div class="field-group">
                  <label for="booking-time">Start time</label>
                  <input id="booking-time" name="time" type="time" value="${initialTime}" required />
                  <p class="field-hint">The current rebuilt flow reserves an initial one-hour slot.</p>
                  <p class="field-error" data-field-error="time"></p>
                </div>
              </div>
              <div class="field-group">
                <label>Select level</label>
                <div class="booking-level-grid" data-level-options></div>
                <p class="field-error" data-field-error="level"></p>
              </div>
              <div class="auth-support-links">
                <button class="button button--primary" type="submit" data-booking-submit>Continue to slot selection</button>
                <a class="button button--secondary" href="/user/bookings" data-link>View my bookings</a>
              </div>
            </form>
          </article>
          <article class="panel-card" data-booking-policy-card>
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
          </article>
        </section>
      `
    }),
    onMount: async ({ navigate }) => {
      bindUserShell({ navigate });

      const form = document.querySelector("[data-booking-form]");
      const alertsRoot = document.querySelector("[data-booking-alerts]");
      const contextGrid = document.querySelector("[data-booking-context-grid]");
      const levelRoot = document.querySelector("[data-level-options]");
      const policyCard = document.querySelector("[data-booking-policy-card]");
      const submitButton = document.querySelector("[data-booking-submit]");
      const dateInput = form?.querySelector('[name="date"]');
      const timeInput = form?.querySelector('[name="time"]');

      let selectedLevel = initialLevel;
      let currentContext = null;

      function setFieldError(field, message = "") {
        const input = field === "level" ? levelRoot : form?.querySelector(`[name="${field}"]`);
        const errorNode = form?.querySelector(`[data-field-error="${field}"]`);

        if (input instanceof HTMLElement && field !== "level") {
          input.setAttribute("aria-invalid", message ? "true" : "false");
        }

        if (errorNode) {
          errorNode.textContent = message;
        }
      }

      function renderAlerts() {
        if (!alertsRoot || !currentContext) {
          return;
        }

        if (currentContext.blocklisted) {
          alertsRoot.innerHTML = renderInlineAlert({
            tone: "danger",
            title: "Booking is restricted",
            message:
              currentContext.blocklistUntil
                ? `${currentContext.blocklistMessage} Access resumes after ${formatDate(currentContext.blocklistUntil)}.`
                : currentContext.blocklistMessage
          });
          return;
        }

        if (currentContext.activeBooking) {
          alertsRoot.innerHTML = renderInlineAlert({
            tone: "warning",
            title: "One active booking already exists",
            message: `You currently hold ${currentContext.activeBooking.level} ${currentContext.activeBooking.slotName} on ${formatDate(
              currentContext.activeBooking.date
            )} at ${formatTime(currentContext.activeBooking.startTime)}. The current backend rules allow only one active reserved or arrived booking at a time.`
          });
          return;
        }

        alertsRoot.innerHTML = renderInlineAlert({
          tone: "info",
          title: "Arrival reminder",
          message: currentContext.noShowPolicy
        });
      }

      function renderContext() {
        if (!currentContext || !contextGrid || !policyCard) {
          return;
        }

        contextGrid.innerHTML = `
          <article class="panel-card kpi-card">
            <div class="kpi-card__content">
              <span class="metric-card__label">Current hourly rate</span>
              <strong>${formatCurrency(currentContext.hourlyRate)}</strong>
            </div>
            <div class="kpi-card__icon" aria-hidden="true"><span>$</span></div>
          </article>
          <article class="panel-card kpi-card">
            <div class="kpi-card__content">
              <span class="metric-card__label">Available slots on ${formatDate(currentContext.selectedDate)}</span>
              <strong>${currentContext.totalAvailableSlots}</strong>
            </div>
            <div class="kpi-card__icon" aria-hidden="true"><span>SL</span></div>
          </article>
          <article class="panel-card kpi-card">
            <div class="kpi-card__content">
              <span class="metric-card__label">Booking window</span>
              <strong>${formatDate(currentContext.minBookingDate)} to ${formatDate(currentContext.maxBookingDate)}</strong>
            </div>
            <div class="kpi-card__icon" aria-hidden="true"><span>DT</span></div>
          </article>
        `;

        policyCard.innerHTML = `
          <div class="panel-card__header">
            <span class="eyebrow">Level availability</span>
            <h2>Availability by level</h2>
            <p class="page-copy">Use the live counts below to choose the level before selecting the exact slot in the next step.</p>
          </div>
          <div class="booking-availability-grid">
            ${currentContext.availableSlotsPerLevel
              .map(
                (item) => `
                  <article class="availability-card">
                    <span>${item.level}</span>
                    <strong>${item.availableSlots}</strong>
                    <small>${item.availableSlots === 1 ? "slot ready" : "slots ready"}</small>
                  </article>
                `
              )
              .join("")}
          </div>
          ${
            currentContext.activeBooking
              ? `
                  <div class="booking-summary-card">
                    <h3>Current active booking</h3>
                    <div class="detail-list">
                      <div><span>Date</span><strong>${formatDate(currentContext.activeBooking.date)}</strong></div>
                      <div><span>Start time</span><strong>${formatTime(currentContext.activeBooking.startTime)}</strong></div>
                      <div><span>Slot</span><strong>${currentContext.activeBooking.level} | ${currentContext.activeBooking.slotName}</strong></div>
                    </div>
                  </div>
                `
              : `
                  <div class="booking-summary-card">
                    <h3>Reservation note</h3>
                    <p class="page-copy">The current backend logic still treats slot conflicts conservatively. If a slot has an active booking in RESERVED or ARRIVED, it stays unavailable until that booking is resolved.</p>
                  </div>
                `
          }
        `;
      }

      function renderLevels() {
        if (!levelRoot || !currentContext) {
          return;
        }

        const bookingLocked = currentContext.blocklisted || Boolean(currentContext.activeBooking);

        levelRoot.innerHTML = currentContext.availableSlotsPerLevel
          .map((item) => {
            const selected = item.level === selectedLevel;
            return `
              <button
                class="level-choice ${selected ? "is-selected" : ""}"
                type="button"
                data-level-option="${item.level}"
                ${bookingLocked ? "disabled" : ""}
                aria-pressed="${selected ? "true" : "false"}"
              >
                <strong>${item.level}</strong>
                <span>${item.availableSlots} available</span>
              </button>
            `;
          })
          .join("");
      }

      function syncFormState() {
        const bookingLocked = currentContext?.blocklisted || Boolean(currentContext?.activeBooking);
        if (submitButton) {
          submitButton.disabled = Boolean(bookingLocked);
        }
        if (dateInput) {
          dateInput.disabled = Boolean(bookingLocked);
        }
        if (timeInput) {
          timeInput.disabled = Boolean(bookingLocked);
        }
      }

      async function loadContext(dateValue) {
        if (contextGrid) {
          contextGrid.innerHTML = renderContextSkeleton();
        }

        if (policyCard) {
          policyCard.innerHTML = `
            <div class="loading-block loading-block--title"></div>
            <div class="loading-block loading-block--line"></div>
            <div class="loading-block loading-block--line"></div>
          `;
        }

        try {
          currentContext = await fetchBookingContext(dateValue || undefined);
          if (dateInput) {
            dateInput.min = currentContext.minBookingDate;
            dateInput.max = currentContext.maxBookingDate;
            if (!dateInput.value) {
              dateInput.value = currentContext.selectedDate;
            }
          }
          renderContext();
          renderLevels();
          renderAlerts();
          syncFormState();
        } catch (error) {
          if (alertsRoot) {
            alertsRoot.innerHTML = renderInlineAlert({
              tone: "danger",
              title: "Booking setup unavailable",
              message: error.message || "The booking context could not be loaded."
            });
          }
          if (policyCard) {
            policyCard.innerHTML = "";
          }
        }
      }

      levelRoot?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-level-option]");
        if (!button) {
          return;
        }

        selectedLevel = button.getAttribute("data-level-option") || "";
        setFieldError("level");
        renderLevels();
      });

      dateInput?.addEventListener("change", () => {
        loadContext(dateInput.value);
      });

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        setFieldError("date");
        setFieldError("time");
        setFieldError("level");

        const dateValue = String(dateInput?.value || "").trim();
        const timeValue = String(timeInput?.value || "").trim();

        let valid = true;
        if (!dateValue) {
          setFieldError("date", "Select a booking date.");
          valid = false;
        }
        if (!timeValue) {
          setFieldError("time", "Select a booking start time.");
          valid = false;
        }
        if (!selectedLevel) {
          setFieldError("level", "Choose a parking level.");
          valid = false;
        }
        if (!valid) {
          return;
        }

        navigate(
          `/user/select-slot?level=${encodeURIComponent(selectedLevel)}&date=${encodeURIComponent(
            dateValue
          )}&time=${encodeURIComponent(timeValue)}`,
          { replace: false }
        );
      });

      await loadContext(initialDate);
    }
  };
}
