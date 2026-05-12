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
- Current focus: `DESIGN.md + development_spec.md-driven Stitch page design boards, followed by responsive/runtime verification for the public/shared-auth, user, cashier, and admin passes`
- Last updated: `2026-05-13`
- Current owner: `Codex + project owner`

## 3. Open Product / Architecture Decisions

- [x] Confirm final frontend tooling choice
  Owner: `Codex + project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `Phase 1 scaffold was implemented with Vite in line with FRONTEND_ARCHITECTURE.md.`

- [x] Confirm auth integration approach for the frontend
  Owner: `Codex + project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `Session-based auth bootstrap plus frontend-oriented login, registration, verification, forgot-password, reset-token validation, and reset-password APIs are now implemented. The rebuild now treats /login as the primary shared sign-in page, with backend-resolved role redirects and legacy role-specific login URLs kept only as compatibility aliases. Staff-account modeling remains a separate product decision.`

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

- [x] Navbar component
- [x] Sidebar component
- [x] Button styles and states
- [x] Form field patterns
- [x] Validation message patterns
- [x] Status badge component
- [x] Card and KPI widget patterns
- [x] Table patterns
- [x] Alert component
- [x] Toast component
- [x] Modal / dialog component
- [x] Loading state patterns
- [x] Empty state patterns
- [x] Error state patterns

Owner: `Codex`
Last updated: `2026-05-10`
Notes / blockers: `The shared UI layer now includes generic app-navbar/app-sidebar primitives, shared button rendering, field-group helpers, panel/KPI cards, responsive data tables, alert/toast/dialog surfaces, and reusable loading/empty/error patterns. Public, user, and cashier routes have been refactored onto these foundations so cashier/admin pages can reuse them directly.`

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
Last updated: `2026-05-12`
Notes / blockers: `Phase 2 public/auth routes are now implemented in the JavaScript frontend, including a shared /login route with role-aware hints, compatibility redirects from the legacy role-specific login URLs, registration, verification result handling, forgot-password request, reset-token validation, and reset-password success states. A follow-up visual refinement pass also aligned the shared public/auth shell more closely with DESIGN.md plus development_spec.md by tightening the blue/gold hierarchy, replacing the earlier glass-heavy treatment with cleaner premium surfaces, and updating the public navbar/footer/home hero styling before deeper responsive/runtime verification. End-to-end email delivery and token lifecycle still depend on backend runtime configuration and manual verification outside the frontend build checks.`

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
- [x] User notifications inbox
- [x] Read/unread notification actions
- [x] Blocklist warning and restriction UI

Owner: `Codex`
Last updated: `2026-05-12`
Notes / blockers: `Phase 3 user routes are now fully rebuilt in the JavaScript frontend, including notifications inbox and read/unread actions on top of explicit JSON endpoints. A follow-up DESIGN.md + development_spec.md refinement pass has now also started landing directly in the runtime user portal: the customer navbar, dashboard, booking setup, slot selection, bookings history, profile presentation, and shared user-shell treatment were visually tightened toward the newer Stitch direction while preserving the current backend-owned booking and restriction rules. The current backend slot logic still preserves the existing active-slot conflict behavior rather than true time-overlap scheduling, which remains a product decision rather than a user-portal blocker.`

## 8. Phase 4: Cashier Portal

- [x] Cashier shell and navigation
- [x] Cashier dashboard
- [x] Cashier users page
- [x] Cashier user details page
- [x] Cashier bookings page
- [x] Booking filters and search
- [x] Mark-arrived action
- [x] Edit/payment page
- [x] Booking completion flow
- [x] Receipt page
- [x] Print receipt styling
- [x] Cashier notifications page
- [x] Parking rate view

Owner: `Codex`
Last updated: `2026-05-12`
Notes / blockers: `Phase 4 cashier routes are now functionally rebuilt and visually realigned in the JavaScript frontend, including the Stitch-aligned dashboard, users, user-details, bookings, payment, receipt, notifications, and parking-rate views backed by explicit JSON APIs. The receipt flow has also now been tightened against development_spec.md by adding a frontend-generated print QR code plus stronger receipt presentation in the final print-ready screen. The current notifications implementation keeps the legacy booking-derived feed behavior behind a frontend-oriented API for this pass. Responsive browser verification and live backend/runtime checks still remain before the cashier pass can be considered fully verified.`

## 9. Phase 5: Admin Portal

- [x] Admin shell and navigation
- [x] Admin dashboard
- [x] Admin users page
- [x] Admin user details page
- [x] Admin bookings page
- [x] Admin booking filters and search
- [x] Admin parking rate page
- [x] Parking rate update flow
- [x] Admin blocklist page
- [x] Manual unblock flow
- [ ] Manual blocklist flow if approved

Owner: `Codex`
Last updated: `2026-05-13`
Notes / blockers: `The rebuilt admin shell, dashboard, users page, user-details page, bookings oversight table, parking-rate management screen, and blocklist review/unblock flow are now live in the JavaScript frontend and wired through dedicated /api/admin/dashboard, /api/admin/users*, /api/admin/bookings, /api/admin/parking-rates/current, and /api/admin/blocklist* endpoints. Follow-up Stitch-driven refinement passes have now tightened the runtime admin sidebar, control-center header, users directory, bookings oversight, reports filter shell, account-detail view, blocklist review, and rate-management presentation toward the generated admin boards in project 2455191244461890766 while preserving the current backend data contracts. The only remaining Phase 5 item is the still-decision-gated manual blocklist-add flow, plus responsive/runtime verification of the rebuilt admin routes.`

## 10. Phase 6: Reports and Exports

- [x] Reports dashboard shell
- [x] Date range filters
- [x] Day/week/month grouping controls
- [x] KPI summaries
- [x] Booking trend chart
- [x] Earnings trend chart
- [x] Vehicle type distribution
- [x] Booking status distribution
- [x] Excel export flow
- [x] PDF export flow

Owner: `Codex`
Last updated: `2026-05-10`
Notes / blockers: `The rebuilt admin reports dashboard is now live in the JavaScript frontend with date filters, day/week/month grouping, KPI summaries, lightweight trend/distribution visuals, and direct Excel/PDF export actions backed by /api/admin/reports/dashboard, /api/admin/reports/export/excel, and /api/admin/reports/export/pdf. Live file-download verification still depends on running the backend locally because this session only verified the frontend build.`

## 11. Backend/API Support Checklist

- [x] Define auth status endpoint for frontend bootstrap
- [x] Define frontend-friendly login/logout integration
- [x] Review current controllers for JSON API readiness
- [x] Add missing JSON endpoints for public/auth flows
- [x] Add missing JSON endpoints for user flows
- [x] Add missing JSON endpoints for cashier flows
- [x] Add missing JSON endpoints for admin flows
- [x] Add missing JSON endpoints for reports/exports
- [x] Standardize API error payload shape
- [x] Standardize validation error payload shape
- [x] Confirm CORS / cookie strategy for local development

Owner: `Codex + project owner`
Last updated: `2026-05-12`
Notes / blockers: `Public/auth, user, cashier, admin, and reports JSON APIs are now in place, including /api/auth/me, /api/auth/login, /api/auth/logout, /api/auth/register, /api/auth/verify, /api/auth/forgot-password, /api/auth/reset-token, /api/auth/reset-password, /api/user/dashboard, /api/user/booking-context, /api/user/bookings/slots, /api/user/bookings, /api/user/bookings/{id}/cancel, /api/user/notifications, /api/user/notifications/unread-count, /api/user/notifications/{id}/read, /api/user/notifications/read-all, /api/cashier/dashboard, /api/cashier/users, /api/cashier/users/{id}, /api/cashier/bookings, /api/cashier/bookings/{id}/arrive, /api/cashier/bookings/{id}/payment, /api/cashier/bookings/{id}/complete, /api/cashier/bookings/{id}/receipt, /api/cashier/notifications, /api/admin/dashboard, /api/admin/users, /api/admin/users/{id}, /api/admin/bookings, /api/admin/parking-rates/current, /api/admin/blocklist, /api/admin/blocklist/{id}/remove, /api/admin/reports/dashboard, /api/admin/reports/export/excel, /api/admin/reports/export/pdf, /api/profile/me, and /api/parking-rates/current. Rebuilt API controllers now share common ApiErrorResponse and ValidationErrorResponse payloads instead of per-controller inline map/error-record variants. The local dev strategy is also aligned around one primary frontend login route, backend-resolved authority/session handling, frontend.origin-based CORS, and frontend.public-url-backed email verification/reset links, with app.url kept as the backend fallback. A manual blocklist-add API remains intentionally deferred until the product owner confirms that UI belongs in the first rebuild pass.`

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
- [ ] Manually verify Excel and PDF downloads against a live backend runtime

Owner: `Codex`
Last updated: `2026-05-10`
Notes / blockers: `Frontend npm install, lint, and production build passed. Backend compile could not be verified in this environment because Maven is running against a JDK that does not support Java 21.`

## 13. Current Next Tasks

- Perform responsive/runtime verification across the public, user, cashier, and admin portals with emphasis on tablet cashier workflows and admin table/card transitions.
- Manually verify live receipt printing, role redirects, and report export/download flows against a running backend.
- Decide whether the first rebuild pass includes manual admin blocklist creation or keeps review/unblock-only behavior.

## 14. Handoff Note

- Stitch project in active use: `2455191244461890766`
- Stitch design system asset in use: `assets/9f7194fc301747c79dcb48130ecbcc7f`
- New admin design boards generated this session: `Blocklist Management - Admin Portal`, `Rate Management - Admin Portal`, and `Customer Detail - James Sterling - Admin Portal`
- Runtime implementation pass completed this session: admin sidebar/shell refinement plus live updates to admin dashboard, account-detail, rate-management, and blocklist pages
- Remaining practical work: browser-level responsive verification and live backend validation for report exports, receipt printing, and role flows

- [ ] Run responsive browser verification on the Stitch-aligned public/shared-auth routes
- [ ] Manually verify the register, verify, forgot-password, and reset-password flows against a live backend runtime
- [ ] Manually verify the shared /login flow against USER, CASHIER, and ADMIN accounts in a live backend runtime
- [ ] Run responsive browser verification on the Stitch-aligned user routes
- [ ] Manually verify the user booking, profile, bookings, notifications, and parking-cost flows against a live backend runtime
- [ ] Run responsive browser verification on the Stitch-aligned cashier routes
- [ ] Manually verify the cashier dashboard, users, bookings, payment, notifications, parking-rate, and receipt flows against a live backend runtime
- [ ] Run responsive browser verification on the Stitch-aligned admin routes
- [ ] Manually verify the admin dashboard, users, user-details, bookings, parking-rate, blocklist, and reports flows against a live backend runtime
- [ ] Decide whether the manual blocklist-add UI belongs in the first rebuild pass
- [ ] Manually verify Excel and PDF downloads against the rebuilt reports page in a live backend runtime
- [ ] Resolve the local Java 21 toolchain issue so backend tests can run in this environment

## 14. Stitch Migration Workstream

- [x] Map shared frontend primitives to the Stitch `Design Library | Component Specifications` screen before final shared-component signoff
- [x] Migrate public/shared-auth pages from Stitch using `set_set/STITCH_PROMPT_PUBLIC.md`
- [x] Migrate user pages from Stitch using `set_set/STITCH_PROMPT_USER.md`
- [x] Migrate cashier pages from Stitch using `set_set/STITCH_PROMPT_CASHIER.md`
- [x] Migrate admin pages from Stitch using `set_set/STITCH_PROMPT_ADMIN.md`
- [x] Create Stitch design boards from `set_set/DESIGN.md` and `set_set/development_spec.md`
- [ ] Run responsive and live-runtime verification after each role-group Stitch pass

Owner: `Codex + project owner`
Last updated: `2026-05-13`
Notes / blockers: `The migration target remains the existing plain JavaScript frontend. Stitch is the visual and content source, not the runtime implementation. The public/shared-auth execution pass is implemented in code across Home, Login, Register, Verify, Forgot Password, Reset Password, and the shared status surfaces. The user execution pass is implemented in code across Dashboard, Profile, Parking Cost, Book Parking, Select Slot, My Bookings, and Notifications using the user Stitch prompt plus the shared design-library component language. The cashier execution pass is implemented in code across Dashboard, Users, User Details, Bookings, Payment, Receipt, Notifications, and Parking Rate using the cashier Stitch prompt and the shared operational design language. The admin execution pass is also implemented in code across Dashboard, Users, User Details, Bookings, Parking Rate, Blocklist, and Reports using the admin Stitch prompt and the same shared operational/admin design language, with the latest runtime pass tightening the remaining users/bookings/reports admin screens to match the refined control-center shell. A dedicated Stitch design project now exists at project id 2455191244461890766, with DESIGN.md uploaded and role-group design boards generated from DESIGN.md plus development_spec.md for public/shared-auth, user, cashier, and admin page sets. Stitch rejected the direct create_design_system_from_design_md and create_design_system RPCs with invalid-argument responses, but generate_screen_from_text still materialized a usable design-system asset (assets/9f7194fc301747c79dcb48130ecbcc7f) and the page mockups from the repo docs. The remaining gate before signoff is responsive browser verification plus live backend/runtime checks across all role groups.`

## 15. Session Handoff Notes

Use this section to record where work stopped so the next session can resume quickly.

- Current handoff note: `A new Stitch design project now exists at project id 2455191244461890766. It uses set_set/DESIGN.md and set_set/development_spec.md as the current visual/page-spec source for the public/shared-auth, user, cashier, and admin boards. Stitch accepted the DESIGN.md upload and generated a reusable design-system asset during screen generation (assets/9f7194fc301747c79dcb48130ecbcc7f), but the explicit create_design_system_from_design_md and create_design_system RPCs returned invalid-argument errors and should be treated as a Stitch-side tooling issue unless the API shape changes. The frontend runtime target has now started consuming that direction directly: the shared public/auth shell plus the live user portal shell, dashboard, booking setup, slot-selection, bookings, and profile presentation were visually realigned in code and the frontend build still passes. The next implementation pass should continue the same DESIGN.md/development_spec.md refinement into the cashier and admin routes before broader responsive/runtime verification.`
- Current handoff note: `The Stitch project at 2455191244461890766 remains the visual source of truth, backed by design-system asset assets/9f7194fc301747c79dcb48130ecbcc7f and the role-based boards generated from set_set/DESIGN.md plus set_set/development_spec.md. The runtime admin pass now covers the full shell treatment across dashboard, users, user-details, bookings, parking-rate, blocklist, and reports, and the cashier receipt flow has been brought closer to development_spec.md by adding a frontend-generated QR code plus stronger print layout structure. The frontend build still passes after the latest receipt update. The next meaningful gate is responsive/runtime verification. In the prior verification attempt the local Vite frontend was reachable at http://localhost:5173, but the in-app browser control path could not be used because the required browser execution tool was not exposed, so browser-level verification still remains open rather than completed.`
- Next recommended starting point: `Resume responsive verification as soon as the in-app browser execution tool is available again, then validate live role flows against http://localhost:5173 and the backend runtime on http://localhost:8080, with specific attention to cashier receipt printing and admin reports exports.`
