# Royal Service Parking Frontend Architecture

## 1. Purpose

This document defines the target architecture for the Royal Service Parking frontend rebuild.

The approved frontend direction is:

- plain JavaScript
- semantic HTML
- shared CSS design system
- Spring Boot backend
- backend-owned security and business rules

This is intentionally not a React, Vue, or Thymeleaf-first rebuild.

## 2. High-Level Architecture

The system should be treated as two coordinated applications:

- `set_set/`: Spring Boot backend, data access, business logic, auth, email, scheduled jobs, reporting
- `frontend/`: plain JavaScript application for the full user interface

Production model:

- frontend build output is served as static assets
- backend serves APIs and auth/session endpoints
- backend remains the source of truth for authorization and validation

Development model:

- frontend runs on its own dev server
- backend runs on Spring Boot locally
- frontend calls backend APIs through a configured base URL or proxy

## 3. Recommended Frontend Stack

Use plain JavaScript with light tooling:

- ES modules
- Vite for dev/build tooling
- Fetch API for HTTP calls
- CSS custom properties for tokens

This keeps the frontend modern without introducing a UI framework.

## 4. Frontend Goals

- replace legacy Thymeleaf-driven UI with a maintainable JavaScript frontend
- preserve current backend business behavior unless the spec is intentionally updated
- share UI components across public, user, cashier, and admin experiences
- make booking and operations flows faster, clearer, and more responsive
- support gradual migration from legacy templates to the new frontend

## 5. Project Structure

Recommended frontend structure:

```text
frontend/
  src/
    app/
      bootstrap.js
      router.js
      guards.js
    assets/
    components/
      alert/
      badge/
      button/
      card/
      dialog/
      form/
      navbar/
      sidebar/
      table/
      toast/
    modules/
      auth/
      bookings/
      dashboard/
      notifications/
      parking-rates/
      reports/
      slots/
      users/
    pages/
      public/
      user/
      cashier/
      admin/
    services/
      api-client.js
      auth-service.js
      booking-service.js
      notification-service.js
      report-service.js
      slot-service.js
      user-service.js
    state/
      auth-store.js
      ui-store.js
    styles/
      tokens.css
      base.css
      layout.css
      components.css
      utilities.css
    utils/
      dates.js
      dom.js
      formatters.js
      validators.js
  public/
  index.html
  package.json
```

## 6. Routing Model

Use client-side routing in plain JavaScript, but preserve the product's role separation.

Recommended route groups:

- `/`
- `/register`
- `/login/user`
- `/login/cashier`
- `/login/admin`
- `/forgot-password`
- `/reset-password`
- `/verify`
- `/user/*`
- `/cashier/*`
- `/admin/*`

Routing rules:

- public routes must remain reachable without authentication
- role routes must be guarded on the client for UX
- backend authorization remains mandatory even if frontend guards exist
- role mismatch should redirect to the correct landing page or show a clear access message

## 7. Auth and Session Strategy

Recommended default:

- Spring Security session-based authentication
- secure cookie-based session handling
- frontend stores only minimal non-sensitive UI state
- frontend calls an auth status endpoint such as `/api/auth/me` on boot

Do not place sensitive tokens in `localStorage` by default.

Auth flow expectations:

1. User opens a login page
2. Frontend submits credentials to backend auth endpoint
3. Backend establishes the authenticated session
4. Frontend fetches current user and role context
5. Frontend routes the user into the proper role area

## 8. API Contract Expectations

The frontend should talk to backend APIs, not rendered server views.

Recommended API groups:

- `/api/auth/*`
- `/api/users/*`
- `/api/profile/*`
- `/api/bookings/*`
- `/api/slots/*`
- `/api/parking-rates/*`
- `/api/notifications/*`
- `/api/blocklist/*`
- `/api/reports/*`

API response expectations:

- predictable JSON shape
- explicit success and error payloads
- validation error details for forms
- pagination metadata where relevant
- server-generated timestamps in consistent format

## 9. State Management

Do not introduce Redux-like complexity for this rebuild.

Recommended state approach:

- module-local state for page-specific UI
- tiny shared stores for auth and global UI concerns
- normalized service responses where it improves reuse
- no hidden global mutable objects outside defined store modules

Shared state is most appropriate for:

- authenticated user and role context
- global toast queue
- shared modal or overlay state when needed
- route-level loading indicators

## 10. UI Composition Strategy

Build the frontend from reusable pieces rather than large page scripts.

Recommended layers:

1. tokens and base styles
2. layout primitives
3. shared components
4. page shells per role
5. module-specific page controllers

Examples:

- shared `Table` component rules for admin and cashier lists
- shared `StatusBadge` component for booking state
- shared `FormSection` and validation rendering
- shared `Toast` and `Dialog` behavior

## 11. Page Shell Strategy

Each role should have a predictable shell:

- Public shell: hero/header/footer oriented
- User shell: compact top navigation, notification access, profile access
- Cashier shell: operational sidebar, KPI strip, action-first layout
- Admin shell: sidebar, filters, report controls, denser tables

Shell responsibilities:

- route framing
- navigation
- page title region
- shared status surfaces such as alerts and toasts

## 12. Data Fetching and Error Handling

All remote calls should pass through service modules.

Rules:

- show a visible loading state for async page loads
- disable destructive or duplicate-submit actions during requests
- map validation errors to fields where possible
- display recoverable failures inline
- display system-level failures in a consistent alert/toast pattern

## 13. Form Strategy

Forms in this system are important and numerous. Standardize:

- centralized field rendering patterns
- client-side basic validation for faster feedback
- server-side validation as the source of truth
- explicit pending, success, and failure states
- confirmation steps for high-impact actions

Priority forms:

- registration
- login
- password reset
- booking creation
- booking completion
- rate update
- blocklist management

## 14. Table and List Strategy

Cashier and admin screens rely heavily on data-heavy interfaces.

Standard behavior:

- filters above the results
- visible count of matching results where useful
- empty state messaging
- inline status badges
- action buttons grouped consistently
- horizontal overflow handled intentionally on smaller widths

On narrow screens, use stacked record cards if a table becomes unreadable.

## 15. Accessibility and Device Support

Minimum expectations:

- keyboard navigation across all major flows
- visible focus state
- readable contrast
- touch-friendly controls for cashier tablet usage
- responsive layouts across mobile, tablet, desktop

## 16. Legacy Migration Strategy

The existing Thymeleaf templates are not the final architecture, but they are useful references for:

- route inventory
- field names
- current page content
- current workflow order
- wording and labels that map to backend behavior

Migration approach:

1. keep backend logic stable
2. extract and confirm API contracts
3. rebuild highest-value screens in the frontend
4. verify parity with legacy behavior
5. retire legacy templates page by page when replaced

## 17. Suggested Delivery Phases

Phase 1:

- frontend scaffold
- auth shell
- public landing and login pages
- shared tokens and components

Phase 2:

- user dashboard
- user booking flow
- slot selection
- booking history
- profile

Phase 3:

- cashier dashboard
- cashier booking operations
- payment and receipt flows
- cashier notifications

Phase 4:

- admin dashboard
- users
- bookings
- parking rate management
- blocklist management

Phase 5:

- reports
- exports
- frontend polish and regression cleanup

## 18. Definition of Frontend Done

A frontend module is done when:

- it follows the route and shell strategy
- it uses shared components and tokens where appropriate
- it is connected to a stable backend contract
- it handles loading, empty, validation, and error states
- it is responsive for its target device class
- it preserves role and business-rule expectations from `FEATURE_REBUILD_SPEC.md`
