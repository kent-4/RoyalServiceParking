# Royal Service Parking

Royal Service Parking is a role-based parking reservation and parking-operations system for a single facility. It supports customer advance booking, cashier arrival and payment handling, and admin oversight for pricing, restrictions, reports, and exports.

This repository is currently in a migration phase:

- `set_set/` is the active Spring Boot backend
- `frontend/` is the active plain JavaScript frontend rebuild
- the legacy Thymeleaf templates under `set_set/src/main/resources/templates` remain as reference material during migration

## Current State

The rebuild direction is already established and implemented in large parts:

- public and auth pages are rebuilt in `frontend/`
- user portal pages are rebuilt in `frontend/`
- cashier portal pages are rebuilt in `frontend/`
- admin and verification passes are still being completed and verified

Authoritative rebuild planning and status live in:

- `set_set/UI_REBUILD_PROGRESS.md`
- `set_set/FEATURE_REBUILD_SPEC.md`
- `set_set/UI_UX_DESIGN_STANDARDS.md`
- `set_set/FRONTEND_ARCHITECTURE.md`

## System Overview

The system has three main runtime concerns:

1. Customer reservation flow
   - registration
   - email verification
   - login
   - booking date/time/level selection
   - slot selection
   - booking confirmation
   - booking history and notifications

2. Cashier operations flow
   - view reserved and arrived bookings
   - mark reserved bookings as arrived
   - open payment preview
   - complete parking sessions
   - print receipts
   - monitor operational notifications

3. Admin oversight flow
   - inspect users and bookings
   - manage parking rate
   - review blocklisted users
   - view analytics and export reports

## Roles

### Guest / Public

- view landing page
- register
- log in
- access verification and password recovery pages

### Customer / User

- manage profile
- view parking rates
- create bookings
- cancel reserved bookings
- review booking history
- read notifications
- view restriction status

### Cashier

- review verified customers
- manage reserved and arrived bookings
- complete payments
- print receipts
- monitor operational notifications
- view current parking rate

### Admin

- inspect users and bookings
- update parking rate
- manage blocklist removals
- access reports and exports

## Architecture

This repository is structured as two coordinated applications.

### Backend: `set_set/`

Spring Boot 3.2.5, Java 21, MySQL, Spring Security, JPA, mail, reporting, and exports.

Backend responsibilities:

- business rules
- authentication and authorization
- session management
- persistence
- email delivery
- booking validation
- slot locking and release
- reporting and export generation

### Frontend: `frontend/`

Plain JavaScript application built with Vite and ES modules.

Frontend responsibilities:

- route transitions
- page rendering
- role-based shells
- client-side form behavior
- API consumption
- shared UI components and styles

### Runtime Model

Development:

- frontend runs on a Vite dev server
- backend runs on Spring Boot at `http://localhost:8080`
- frontend uses `VITE_API_BASE_URL` to call backend APIs

Production target:

- frontend build output is served as static assets
- backend serves APIs and session/auth endpoints

## Repository Structure

```text
RoyalServiceParking/
├─ frontend/                         # Plain JavaScript frontend rebuild
│  ├─ src/
│  │  ├─ app/                        # Bootstrap, router, guards
│  │  ├─ assets/
│  │  ├─ components/                 # Shared UI primitives
│  │  ├─ modules/
│  │  ├─ pages/
│  │  │  ├─ public/
│  │  │  ├─ user/
│  │  │  ├─ cashier/
│  │  │  └─ admin/
│  │  ├─ services/                   # API wrappers
│  │  ├─ state/                      # Small shared stores
│  │  ├─ styles/                     # Tokens, base, layout, components
│  │  └─ utils/
│  ├─ package.json
│  └─ .env.example
├─ set_set/                          # Spring Boot backend
│  ├─ src/main/java/com/appdev/set/
│  │  ├─ config/
│  │  ├─ controller/
│  │  ├─ model/
│  │  ├─ repository/
│  │  └─ service/
│  ├─ src/main/resources/
│  │  ├─ static/
│  │  └─ templates/                  # Legacy reference templates
│  ├─ FEATURE_REBUILD_SPEC.md
│  ├─ FRONTEND_ARCHITECTURE.md
│  ├─ UI_UX_DESIGN_STANDARDS.md
│  ├─ UI_REBUILD_PROGRESS.md
│  └─ pom.xml
├─ AGENTS.md                         # Repository-specific development instructions
└─ README.md
```

## Core Business Rules

These rules matter when running, testing, or changing the system:

- users must verify email before using customer flows
- blocklisted users cannot create new bookings
- a user cannot hold more than one active `RESERVED` or `ARRIVED` booking at a time
- no-show after one hour triggers automatic cancellation and temporary restriction
- partial parking hours are rounded up
- minimum billable duration is one hour
- cashier arrival changes a booking from `RESERVED` to `ARRIVED`
- cashier completion changes a booking to `COMPLETED`, computes final cost, and releases the slot

Some behaviors are still documented as open product decisions in `set_set/UI_REBUILD_PROGRESS.md`, especially around slot-conflict modeling, staff account management, and manual blocklist UI scope.

## Main Route Groups

### Public

- `/`
- `/register`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/verify`

### User

- `/user/*`

### Cashier

- `/cashier/*`

### Admin

- `/admin/*`

## API Shape

The frontend is expected to call backend JSON APIs rather than rendered views.

Main API groups include:

- `/api/auth/*`
- `/api/user/*`
- `/api/cashier/*`
- `/api/admin/*`
- `/api/profile/*`
- `/api/parking-rates/*`

Authentication is session-based. The frontend should bootstrap against `/api/auth/me` and rely on backend authorization as the source of truth.

## Prerequisites

Install the following before running locally:

- Java 21
- Maven Wrapper support via the included `mvnw.cmd`
- Node.js 18+ recommended
- npm
- MySQL 8+ recommended

## Configuration

### Backend configuration

Backend configuration currently lives in:

- `set_set/src/main/resources/application.properties`

Important settings there include:

- `server.port=8080`
- MySQL datasource URL, username, and password
- mail host and credentials
- session settings

Before running outside a personal local environment, review and replace:

- database credentials
- mail credentials
- `app.url`
- any machine-specific hostnames or IP addresses

Recommended next step for the project is to move these values to environment variables or per-developer overrides.

### Frontend configuration

Frontend environment example:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Create a local `.env` in `frontend/` if needed and point it at the backend origin you are running.

## How To Run The System

## 1. Start the backend

From the repository root:

```powershell
cd set_set
.\mvnw.cmd spring-boot:run
```

Expected backend URL:

- `http://localhost:8080`

### Other useful backend commands

```powershell
.\mvnw.cmd test
.\mvnw.cmd clean package
```

## 2. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite will print the local dev URL, typically:

- `http://localhost:5173`

If you want a production frontend build:

```powershell
cd frontend
npm run build
npm run preview
```

## 3. Use the application

Typical local development flow:

1. start MySQL
2. start the backend on port `8080`
3. start the frontend dev server
4. open the frontend URL in the browser
5. log in or register through the rebuilt frontend

## Build Artifacts

### Backend

- packaging: `war`
- final artifact name: `royal-service-parking.war`

Build command:

```powershell
cd set_set
.\mvnw.cmd clean package
```

### Frontend

- build tool: Vite
- output directory: `frontend/dist/`

Build command:

```powershell
cd frontend
npm run build
```

## Testing And Verification

### Backend

Current backend testing support exists through:

- `spring-boot-starter-test`
- `spring-security-test`

Run:

```powershell
cd set_set
.\mvnw.cmd test
```

### Frontend

Current baseline checks:

```powershell
cd frontend
npm run build
npm run lint
```

Manual verification should include:

- public/auth flows
- user booking flow
- cashier arrival and payment flow
- admin reporting and rate management flow
- responsive layout checks
- loading, empty, success, and error states

## Important Implementation Notes

- legacy Thymeleaf files are still present but are no longer the target UI architecture
- the rebuild target is plain JavaScript plus Spring Boot APIs
- backend remains the authority for validation, permissions, and booking rules
- CORS and cookie/session behavior must be kept explicit if frontend and backend run on different origins
- Flyway is present as a dependency but currently disabled in `application.properties`
- JPA is currently configured with `spring.jpa.hibernate.ddl-auto=update`

## Recommended Reading Before Development

Start here before making product or rebuild changes:

1. `AGENTS.md`
2. `set_set/UI_REBUILD_PROGRESS.md`
3. `set_set/FEATURE_REBUILD_SPEC.md`
4. `set_set/UI_UX_DESIGN_STANDARDS.md`
5. `set_set/FRONTEND_ARCHITECTURE.md`

## Known Gaps / Work In Progress

At the time of writing:

- the repo is mid-migration from the legacy UI to the rebuilt frontend
- responsive and live-runtime verification is still ongoing for some role groups
- some product decisions remain open around slot conflict logic, staff account management, and manual blocklist UI
- the backend configuration still contains local-development style settings that should be externalized

## Troubleshooting

### Backend does not start

Check:

- Java version is 21
- MySQL is running
- datasource credentials are valid
- the configured database host and port are reachable

### Frontend cannot call the backend

Check:

- backend is running on `http://localhost:8080`
- `VITE_API_BASE_URL` matches the backend origin
- backend session/CORS configuration matches your local frontend origin

### Registration / reset / email flows do not work

Check:

- SMTP settings in `application.properties`
- `frontend.public-url` points to the correct frontend host used in generated verification/reset links
- `app.url` points to the correct backend host if any backend-rendered links still depend on it

## Summary

Royal Service Parking is a split Spring Boot + plain JavaScript system centered on:

- customer advance booking
- cashier operational handling
- admin oversight and reporting

Run the backend from `set_set/`, run the frontend from `frontend/`, and treat the rebuild docs in `set_set/` as the working contract for ongoing development.
