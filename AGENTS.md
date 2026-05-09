# Repository Guidelines

## Project Structure & Module Organization

This project is now being rebuilt as a split application:

- `set_set/` is the Spring Boot 3.2.5 backend targeting Java 21
- `frontend/` is the plain JavaScript frontend application

Backend Java sources remain under `set_set/src/main/java/com/appdev/set`, organized by responsibility: `controller`, `service`, `repository`, `model`, and `config`.

The existing Thymeleaf files under `set_set/src/main/resources/templates` are legacy reference material during migration. Do not treat them as the target UI architecture unless a task explicitly says to patch legacy screens.

Frontend code should be organized around reusable UI modules and role-based routes. Prefer a structure like:

- `frontend/src/pages`
- `frontend/src/components`
- `frontend/src/modules`
- `frontend/src/services`
- `frontend/src/styles`
- `frontend/src/utils`

Shared product behavior and rebuild decisions are documented in:

- `set_set/FEATURE_REBUILD_SPEC.md`
- `set_set/UI_UX_DESIGN_STANDARDS.md`
- `set_set/FRONTEND_ARCHITECTURE.md`
- `set_set/UI_REBUILD_PROGRESS.md`

Read those before changing booking, notification, blocklist, reporting, auth, or role-based flows.

## Build, Test, and Development Commands

Backend commands run from `set_set`:

```powershell
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
.\mvnw.cmd clean package
```

Frontend commands run from `frontend` once the app scaffold exists:

```powershell
npm install
npm run dev
npm run build
npm run lint
```

Use `spring-boot:run` to run the backend locally on port `8080`. Use `npm run dev` for the JavaScript frontend dev server. Use `npm run build` to produce the frontend production bundle, and `.\mvnw.cmd test` before submitting backend changes.

## Rebuild Intent

The rebuild target is not a Thymeleaf refresh. It is a plain JavaScript frontend backed by Spring Boot APIs and Spring Security.

Default expectations:

- The frontend owns presentation, route transitions, client-side state, and interaction behavior
- The backend owns business rules, persistence, security, scheduling, and reporting logic
- UI work must preserve the business rules captured in `FEATURE_REBUILD_SPEC.md` unless the spec is deliberately updated first
- Legacy templates may be used as behavior and content references, but new UI work should land in the JavaScript frontend unless the task explicitly says otherwise

## Required Documentation Workflow

Before starting any UI rebuild, frontend architecture, or API-support task, the agent must review:

1. `set_set/UI_REBUILD_PROGRESS.md`
2. `set_set/FEATURE_REBUILD_SPEC.md`
3. `set_set/UI_UX_DESIGN_STANDARDS.md`
4. `set_set/FRONTEND_ARCHITECTURE.md`

These documents are not optional references. They are the working contract for this rebuild.

The agent must:

- check `UI_REBUILD_PROGRESS.md` first to see what is already done, in progress, blocked, or next
- avoid repeating tasks already marked `[x]` or `[/]` unless the user explicitly asks for rework
- confirm the relevant feature behavior in `FEATURE_REBUILD_SPEC.md` before implementing or changing UI
- confirm the visual and interaction rules in `UI_UX_DESIGN_STANDARDS.md` before styling or structuring screens
- confirm routing, state, API, and frontend structure expectations in `FRONTEND_ARCHITECTURE.md` before building modules
- update `UI_REBUILD_PROGRESS.md` after completing meaningful work
- add or refresh the handoff note in `UI_REBUILD_PROGRESS.md` before ending a work session

If a task is ambiguous and the docs do not cover it, the agent should update the docs or ask for clarification before making the implementation drift.

## No-Drift Rule

Do not jump straight into coding when working on the rebuild. The expected sequence is:

1. Review `UI_REBUILD_PROGRESS.md`
2. Review the relevant rebuild docs
3. Confirm scope and dependencies
4. Implement the change
5. Update `UI_REBUILD_PROGRESS.md`

If the current task conflicts with the documented architecture or scope, pause and resolve the documentation mismatch first instead of silently coding past it.

## Coding Style & Naming Conventions

### Backend

Use standard Java conventions:

- four-space indentation
- PascalCase classes
- camelCase fields and methods
- uppercase enum or status constants where applicable

Keep controllers thin, business rules in services, and persistence logic in repositories.

### Frontend

Use plain JavaScript with ES modules. Prefer:

- camelCase for variables and functions
- PascalCase for reusable component factory modules only when they behave like components
- kebab-case for CSS files, route folders, and static asset filenames
- one responsibility per module where practical

Keep DOM structure predictable and prefer small reusable render helpers over large page scripts. Avoid inline event handlers in HTML. Bind events from JavaScript modules instead.

## Frontend Architecture Rules

- Do not introduce React, Vue, Angular, jQuery, or other UI frameworks unless the docs are updated first
- Prefer `fetch` wrappers and small service modules for API access
- Centralize design tokens and shared layout rules before adding page-specific styling
- Reuse shared components for navbar, sidebar, cards, forms, badges, tables, modals, alerts, and toasts
- Route groups must stay clearly separated for `public`, `user`, `cashier`, and `admin` experiences
- Preserve role access expectations aligned with `/user/**`, `/cashier/**`, and `/admin/**`, even if the frontend uses client-side routing

## Testing Guidelines

The backend includes `spring-boot-starter-test` and `spring-security-test`, but there are currently no committed tests. Add backend tests under `set_set/src/test/java` using JUnit 5.

Frontend work should include, at minimum:

- manual verification of the changed flow
- responsive verification for mobile, tablet, and desktop
- role-based route/access verification
- empty, error, loading, and success-state checks for affected pages

When frontend tests are added, place them inside the frontend workspace and keep them focused on reusable modules and critical flows.

## UI Rebuild Workflow

Before rebuilding a page or module:

1. Check `UI_REBUILD_PROGRESS.md` to confirm current status and avoid duplication
2. Confirm the feature behavior in `FEATURE_REBUILD_SPEC.md`
3. Confirm the visual and interaction rules in `UI_UX_DESIGN_STANDARDS.md`
4. Confirm route, state, and API expectations in `FRONTEND_ARCHITECTURE.md`
5. Identify whether the backend already exposes the required data contract
6. Reuse or introduce shared frontend components before building page-specific UI

For each page, define done as:

- visually aligned with the design standards
- responsive on intended device classes
- accessible enough for keyboard and focus navigation
- connected to real or clearly defined backend data
- free of obvious regression in role flows or booking rules
- reflected accurately in `UI_REBUILD_PROGRESS.md`

## Commit & Pull Request Guidelines

Prefer short imperative commit messages such as:

- `Add user booking shell layout`
- `Create shared table and badge tokens`
- `Expose booking summary API for admin dashboard`

Pull requests should include:

- the user-facing change
- whether the change is frontend, backend, or both
- verification commands used
- screenshots for UI changes
- any API, database, or auth contract changes

## Security & Configuration Tips

Do not commit real credentials. Move mail, database, app URL, and frontend origin values out of shared source files for team environments.

For auth and frontend integration:

- prefer secure session handling over exposing sensitive tokens to browser storage
- keep CORS and cookie settings explicit when frontend and backend run on different local origins
- preserve role separation and backend authorization even if frontend route guards exist

## Do Not Break

During UI rebuild work, be especially careful not to silently change:

- booking eligibility rules
- no-show and blocklist processing
- cashier arrival and completion workflows
- notification timing and unread behavior
- report totals and export expectations
- auth and role mismatch handling
