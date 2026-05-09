# Royal Service Parking UI Rebuild Progress

This checklist tracks rebuild progress for the plain JavaScript frontend and the supporting backend/API work required to complete it.

Related references:

- `AGENTS.md`
- `set_set/FEATURE_REBUILD_SPEC.md`
- `set_set/UI_UX_DESIGN_STANDARDS.md`
- `set_set/FRONTEND_ARCHITECTURE.md`

## 1. How To Use This File

Use these markers consistently:

- `[ ]` not started
- `[/]` in progress
- `[x]` done
- `[!]` blocked or waiting on decision

When a task changes state, update:

- the checkbox
- the `Owner`
- the `Last Updated`
- the `Notes / blockers` line if needed

## 2. Current Snapshot

- Current phase: `[/] In progress`
- Current focus: `User notifications and the last remaining user-portal gaps before moving into cashier screens`
- Last updated: `2026-05-10`
- Current owner: `Codex + project owner`

## 3. Open Product / Architecture Decisions

- [x] Confirm final frontend tooling choice
  Owner: `Codex + project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `Phase 1 scaffold was implemented with Vite in line with FRONTEND_ARCHITECTURE.md.`

- [x] Confirm auth integration approach for the frontend
  Owner: `Codex + project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `Session-based auth bootstrap plus frontend-oriented login, registration, verification, forgot-password, reset-token validation, and reset-password APIs are now implemented. Staff-account modeling remains a separate product decision.`

- [ ] Confirm slot conflict behavior for the rebuilt system
  Owner: `Project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `Need final decision between current global active-slot behavior and true date/time overlap validation.`

- [ ] Confirm whether admin and cashier accounts remain hardcoded or become database-managed
  Owner: `Project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `This affects auth screens, staff management, and backend APIs.`

- [ ] Confirm whether parking rates need historical versioning
  Owner: `Project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `This affects admin UI, reporting, and backend data model.`

- [ ] Confirm whether manual blocklist UI is in scope for the first rebuild pass
  Owner: `Project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `The legacy backend appears to support it, but the current UI is incomplete.`

## 4. Phase 1: Frontend Foundation

- [x] Create `frontend/` application scaffold
  Owner: `Codex`
  Last updated: `2026-05-10`
  Notes / blockers: `Created Vite-based plain JavaScript workspace with package.json, .env.example, index.html, main entry, and local build tooling.`

- [x] Create frontend folder structure from `FRONTEND_ARCHITECTURE.md`
  Owner: `Codex`
  Last updated: `2026-05-10`
  Notes / blockers: `Added app, pages, components, modules, services, state, styles, utils, assets, and public folders. Empty architecture folders are persisted with .gitkeep placeholders.`

- [x] Create shared CSS token system
  Owner: `Codex`
  Last updated: `2026-05-10`
  Notes / blockers: `Added tokens for brand colors, status colors, spacing, radius, shadows, typography, and z-index layers in frontend/src/styles/tokens.css.`

- [x] Create global base styles and layout primitives
  Owner: `Codex`
  Last updated: `2026-05-10`
  Notes / blockers: `Added reset/base styles, focus-visible defaults, shells, hero/auth layouts, role shell layout, cards, buttons, forms, alerts, and toast presentation styles.`

- [x] Create app bootstrap and router
  Owner: `Codex`
  Last updated: `2026-05-10`
  Notes / blockers: `Implemented application bootstrap, client-side route registry, guarded navigation, redirect handling, and not-found rendering.`

- [x] Create auth guard and session bootstrap flow
  Owner: `Codex`
  Last updated: `2026-05-10`
  Notes / blockers: `Frontend now checks backend session state on load and uses role-aware client guards. Backend auth JSON endpoints were added for bootstrap/login/logout.`

- [x] Create shared UI utilities
  Owner: `Codex`
  Last updated: `2026-05-10`
  Notes / blockers: `Added shared formatter, validator, DOM, and date utility modules for the new app shell.`

## 5. Shared Components

- [ ] Navbar component
- [ ] Sidebar component
- [ ] Button styles and states
- [ ] Form field patterns
- [ ] Validation message patterns
- [x] Status badge component
- [ ] Card and KPI widget patterns
- [ ] Table patterns
- [ ] Alert component
- [ ] Toast component
- [x] Modal / dialog component
- [ ] Loading state patterns
- [ ] Empty state patterns
- [ ] Error state patterns

Owner: `Unassigned`
Last updated: `2026-05-10`
Notes / blockers: `Public auth work plus the rebuilt user booking pages now actively use shared navbar, button, alert, toast, form, status-badge, and confirmation-dialog foundations, but the checklist stays open until table/list and loading/empty/error patterns are formalized across more routes.`

## 6. Phase 2: Public and Auth Pages

- [x] Public landing page
- [x] User login page
- [x] Cashier login page
- [x] Admin login page
- [x] Register page
- [x] Register success page
- [x] Verify result page
- [x] Forgot-password page
- [x] Forgot-password confirmation page
- [x] Reset-password page
- [x] Reset-success page

Owner: `Codex`
Last updated: `2026-05-10`
Notes / blockers: `Phase 2 public/auth routes are now implemented in the JavaScript frontend, including registration, verification result handling, forgot-password request, reset-token validation, and reset-password success states. End-to-end email delivery and token lifecycle still depend on backend runtime configuration and manual verification outside the frontend build checks.`

## 7. Phase 3: User Portal

- [x] User shell and navigation
- [x] User dashboard
- [x] User profile
- [x] Parking cost page
- [x] Booking page
- [x] Slot selection page
- [x] Booking confirmation flow
- [x] User bookings/history page
- [x] Booking filters and search
- [x] Booking cancellation flow
- [ ] User notifications inbox
- [ ] Read/unread notification actions
- [x] Blocklist warning and restriction UI

Owner: `Codex`
Last updated: `2026-05-10`
Notes / blockers: `The rebuilt frontend now includes the user booking setup page, slot-selection page, reservation confirmation path, bookings/history filters, reserved-only cancellation, and repeated blocklist/restriction messaging on top of explicit JSON contracts. The current backend slot logic still preserves the existing active-slot conflict behavior rather than true time-overlap scheduling, and user notifications remain the main unfinished Phase 3 slice.`

## 8. Phase 4: Cashier Portal

- [ ] Cashier shell and navigation
- [ ] Cashier dashboard
- [ ] Cashier users page
- [ ] Cashier user details page
- [ ] Cashier bookings page
- [ ] Booking filters and search
- [ ] Mark-arrived action
- [ ] Edit/payment page
- [ ] Booking completion flow
- [ ] Receipt page
- [ ] Print receipt styling
- [ ] Cashier notifications page
- [ ] Parking rate view

Owner: `Unassigned`
Last updated: `2026-05-10`
Notes / blockers: `Tablet usability should be part of completion criteria for this phase.`

## 9. Phase 5: Admin Portal

- [ ] Admin shell and navigation
- [ ] Admin dashboard
- [ ] Admin users page
- [ ] Admin user details page
- [ ] Admin bookings page
- [ ] Admin booking filters and search
- [ ] Admin parking rate page
- [ ] Parking rate update flow
- [ ] Admin blocklist page
- [ ] Manual unblock flow
- [ ] Manual blocklist flow if approved

Owner: `Unassigned`
Last updated: `2026-05-10`
Notes / blockers: `Blocklist scope depends on the product decision recorded above.`

## 10. Phase 6: Reports and Exports

- [ ] Reports dashboard shell
- [ ] Date range filters
- [ ] Day/week/month grouping controls
- [ ] KPI summaries
- [ ] Booking trend chart
- [ ] Earnings trend chart
- [ ] Vehicle type distribution
- [ ] Booking status distribution
- [ ] Excel export flow
- [ ] PDF export flow

Owner: `Unassigned`
Last updated: `2026-05-10`
Notes / blockers: `This phase depends on stable reporting APIs and final charting/export approach.`

## 11. Backend/API Support Checklist

- [x] Define auth status endpoint for frontend bootstrap
- [x] Define frontend-friendly login/logout integration
- [/] Review current controllers for JSON API readiness
- [x] Add missing JSON endpoints for public/auth flows
- [/] Add missing JSON endpoints for user flows
- [ ] Add missing JSON endpoints for cashier flows
- [ ] Add missing JSON endpoints for admin flows
- [ ] Add missing JSON endpoints for reports/exports
- [ ] Standardize API error payload shape
- [ ] Standardize validation error payload shape
- [/] Confirm CORS / cookie strategy for local development

Owner: `Codex + project owner`
Last updated: `2026-05-10`
Notes / blockers: `Added /api/auth/me, /api/auth/login, /api/auth/logout, /api/auth/register, /api/auth/verify, /api/auth/forgot-password, /api/auth/reset-token, /api/auth/reset-password, /api/user/dashboard, /api/user/booking-context, /api/user/bookings/slots, /api/user/bookings, /api/user/bookings/{id}/cancel, /api/profile/me, and /api/parking-rates/current plus local frontend CORS support. User notifications plus all cashier/admin/reporting APIs still need review.`

## 12. QA and Verification Checklist

- [ ] Shared layout verified on mobile
- [ ] Shared layout verified on tablet
- [ ] Shared layout verified on desktop
- [ ] Keyboard navigation checked on major flows
- [ ] Focus-visible styles verified
- [ ] Empty states implemented where needed
- [ ] Error states implemented where needed
- [ ] Loading states implemented where needed
- [ ] Role access and redirect behavior verified
- [ ] Booking flow manually verified end to end
- [ ] Cashier flow manually verified end to end
- [ ] Admin flow manually verified end to end
- [ ] Print receipt verified
- [ ] Backend tests run
- [x] Frontend build verified

Owner: `Codex`
Last updated: `2026-05-10`
Notes / blockers: `Frontend npm install, lint, and production build passed. Backend compile could not be verified in this environment because Maven is running against a JDK that does not support Java 21.`

## 13. Current Next Tasks

- [ ] Review the legacy notification MVC/controller paths and define explicit user notification JSON contracts
- [ ] Build the rebuilt user notifications inbox with unread-count and read-state actions
- [ ] Continue formalizing shared table/list, loading, empty, and error primitives from the now-shipping public and user routes
- [ ] Start cashier portal API review once the user notification slice is stable

## 14. Session Handoff Notes

Use this section to record where work stopped so the next session can resume quickly.

- Current handoff note: `The main user booking slice is now implemented. The frontend has rebuilt /user/book, /user/select-slot, and /user/bookings routes with booking context, slot selection, reservation confirmation, filters, and reserved-only cancellation. Supporting backend APIs were added for /api/user/booking-context, /api/user/bookings/slots, /api/user/bookings, and /api/user/bookings/{id}/cancel, and SecurityConfig now explicitly permits /api/auth/** while protecting user APIs. Frontend lint and production build passed. Backend compile verification is still blocked by the local JDK not supporting Java 21.`
- Next recommended starting point: `Review the existing notification flows and rebuild the user notifications inbox plus read/unread actions on top of explicit JSON endpoints, then move into cashier portal API extraction.`
