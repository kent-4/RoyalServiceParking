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

- Current phase: `[ ] Not started`
- Current focus: `Frontend scaffold and shared foundations`
- Last updated: `2026-05-10`
- Current owner: `Codex + project owner`

## 3. Open Product / Architecture Decisions

- [ ] Confirm final frontend tooling choice
  Owner: `Project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `Docs recommend Vite for plain JavaScript, but the scaffold is not created yet.`

- [ ] Confirm auth integration approach for the frontend
  Owner: `Project owner`
  Last updated: `2026-05-10`
  Notes / blockers: `Recommended direction is Spring Security session-based auth with frontend route guards.`

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

- [ ] Create `frontend/` application scaffold
  Owner: `Unassigned`
  Last updated: `2026-05-10`
  Notes / blockers: `Set up package.json, dev/build scripts, and base app entry.`

- [ ] Create frontend folder structure from `FRONTEND_ARCHITECTURE.md`
  Owner: `Unassigned`
  Last updated: `2026-05-10`
  Notes / blockers: `Create app, pages, components, modules, services, state, styles, and utils folders.`

- [ ] Create shared CSS token system
  Owner: `Unassigned`
  Last updated: `2026-05-10`
  Notes / blockers: `Start with colors, spacing, radius, shadows, typography, breakpoints, and z-index tokens.`

- [ ] Create global base styles and layout primitives
  Owner: `Unassigned`
  Last updated: `2026-05-10`
  Notes / blockers: `Base reset, typography, containers, sections, grid helpers, and accessibility-focused defaults.`

- [ ] Create app bootstrap and router
  Owner: `Unassigned`
  Last updated: `2026-05-10`
  Notes / blockers: `Set up route registration, shell mounting, and not-found handling.`

- [ ] Create auth guard and session bootstrap flow
  Owner: `Unassigned`
  Last updated: `2026-05-10`
  Notes / blockers: `Frontend should be able to determine current user and role on app load.`

- [ ] Create shared UI utilities
  Owner: `Unassigned`
  Last updated: `2026-05-10`
  Notes / blockers: `Formatters, validators, DOM helpers, date utilities.`

## 5. Shared Components

- [ ] Navbar component
- [ ] Sidebar component
- [ ] Button styles and states
- [ ] Form field patterns
- [ ] Validation message patterns
- [ ] Status badge component
- [ ] Card and KPI widget patterns
- [ ] Table patterns
- [ ] Alert component
- [ ] Toast component
- [ ] Modal / dialog component
- [ ] Loading state patterns
- [ ] Empty state patterns
- [ ] Error state patterns

Owner: `Unassigned`
Last updated: `2026-05-10`
Notes / blockers: `These should be built before deep page work to avoid repeating layout and interaction logic.`

## 6. Phase 2: Public and Auth Pages

- [ ] Public landing page
- [ ] User login page
- [ ] Cashier login page
- [ ] Admin login page
- [ ] Register page
- [ ] Register success page
- [ ] Verify result page
- [ ] Forgot-password page
- [ ] Forgot-password confirmation page
- [ ] Reset-password page
- [ ] Reset-success page

Owner: `Unassigned`
Last updated: `2026-05-10`
Notes / blockers: `These pages should be the first visible milestone after the shared frontend foundation.`

## 7. Phase 3: User Portal

- [ ] User shell and navigation
- [ ] User dashboard
- [ ] User profile
- [ ] Parking cost page
- [ ] Booking page
- [ ] Slot selection page
- [ ] Booking confirmation flow
- [ ] User bookings/history page
- [ ] Booking filters and search
- [ ] Booking cancellation flow
- [ ] User notifications inbox
- [ ] Read/unread notification actions
- [ ] Blocklist warning and restriction UI

Owner: `Unassigned`
Last updated: `2026-05-10`
Notes / blockers: `Booking flow should not be marked done until it is connected to real backend validation behavior.`

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

- [ ] Define auth status endpoint for frontend bootstrap
- [ ] Define frontend-friendly login/logout integration
- [ ] Review current controllers for JSON API readiness
- [ ] Add missing JSON endpoints for public/auth flows
- [ ] Add missing JSON endpoints for user flows
- [ ] Add missing JSON endpoints for cashier flows
- [ ] Add missing JSON endpoints for admin flows
- [ ] Add missing JSON endpoints for reports/exports
- [ ] Standardize API error payload shape
- [ ] Standardize validation error payload shape
- [ ] Confirm CORS / cookie strategy for local development

Owner: `Unassigned`
Last updated: `2026-05-10`
Notes / blockers: `Frontend page work should move with API readiness, not drift too far ahead of backend contracts.`

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
- [ ] Frontend build verified

Owner: `Unassigned`
Last updated: `2026-05-10`
Notes / blockers: `Use this section as the release-readiness gate, not only as a final cleanup step.`

## 13. Current Next Tasks

- [ ] Create the `frontend/` scaffold
- [ ] Add base app routing and auth bootstrap
- [ ] Add shared CSS tokens and base layout styles
- [ ] Build public landing and login pages as the first visible milestone

## 14. Session Handoff Notes

Use this section to record where work stopped so the next session can resume quickly.

- Current handoff note: `Documentation alignment is complete. Frontend scaffold has not been created yet.`
- Next recommended starting point: `Create frontend workspace and implement shared foundations before building role pages.`
