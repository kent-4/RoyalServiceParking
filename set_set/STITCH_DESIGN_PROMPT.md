# Royal Service Parking Stitch Design Prompt

## Purpose

This document gives Google Stitch a detailed, system-level prompt for generating UI design concepts for the Royal Service Parking rebuild.

Use this as the base prompt when you want Stitch to understand:

- what the product is
- which roles exist
- which pages the system has
- how the routes are grouped
- what each page should contain
- how the design should differ across public, user, cashier, and admin experiences

This prompt is aligned with:

- `set_set/FEATURE_REBUILD_SPEC.md`
- `set_set/UI_UX_DESIGN_STANDARDS.md`
- `set_set/FRONTEND_ARCHITECTURE.md`
- `frontend/src/app/routes.js`

## Product Summary

Royal Service Parking is a role-based parking reservation and parking-operations system for a single parking facility.

The system supports four experiences:

- Public / guest visitors
- Registered customers (`USER`)
- Parking staff (`CASHIER`)
- System administrators (`ADMIN`)

The product flow is:

1. A guest visits the public site.
2. A customer registers and verifies email.
3. The verified customer logs in and creates a parking reservation.
4. The customer selects a booking date, time, level, and exact slot.
5. A cashier handles arrival, payment, completion, and receipt generation.
6. An admin monitors users, bookings, pricing, restrictions, and reporting.

## Core Business Rules The Designs Must Respect

- Verified email is required before customer login.
- Customers can be temporarily blocklisted after a no-show.
- Blocklisted users cannot create new bookings.
- Current product behavior allows only one active booking per user at a time.
- Cashier workflow is state-based: `RESERVED` -> `ARRIVED` -> `COMPLETED`.
- User cancellation is allowed only for `RESERVED` bookings.
- Parking duration is rounded up and billed with a minimum of 1 hour.
- Reports count completed bookings for earnings metrics.
- The system is for one facility, not multi-branch parking management.

## Current App Structure

The frontend is organized into four route groups:

### Public / Shared

- `/`
- `/register`
- `/register-success`
- `/verify`
- `/login`
- `/login/user`
- `/login/cashier`
- `/login/admin`
- `/forgot-password`
- `/forgot-password-confirmation`
- `/reset-password`
- `/reset-success`

### User

- `/user/dashboard`
- `/user/profile`
- `/user/book`
- `/user/select-slot`
- `/user/bookings`
- `/user/notifications`
- `/user/parking-cost`

### Cashier

- `/cashier/dashboard`
- `/cashier/users`
- `/cashier/users/detail`
- `/cashier/bookings`
- `/cashier/bookings/payment`
- `/cashier/bookings/receipt`
- `/cashier/notifications`
- `/cashier/parking-cost`

### Admin

- `/admin/dashboard`
- `/admin/users`
- `/admin/users/detail`
- `/admin/bookings`
- `/admin/parking-cost`
- `/admin/blocklist`
- `/admin/reports`

## Shell And Navigation Expectations

### Public Shell

- Top navigation
- Branded hero layout
- Footer
- Clear entry points for register, login, cashier access, and admin access
- Spacious and premium but still practical

### User Shell

- Top navigation
- Navigation items:
  - Dashboard
  - Book Parking
  - My Bookings
  - Notifications
  - Profile
  - Parking Cost
- Visible notification badge
- Visible account restriction warning when blocklisted

### Cashier Shell

- Left sidebar
- Dense but readable operational workspace
- Tablet-friendly layout
- Navigation items:
  - Dashboard
  - Users
  - Bookings
  - Notifications
  - Parking Rate

### Admin Shell

- Left sidebar
- Denser management layout than cashier
- Strong filters, KPI hierarchy, and data-grid structure
- Navigation items:
  - Dashboard
  - Users
  - Bookings
  - Parking Rate
  - Blocklist
  - Reports

## Shared Design Direction

- Premium and trustworthy, not flashy
- Clean operational look with strong hierarchy
- Public and user pages can feel more spacious and polished
- Cashier pages should feel fast, clear, and action-first
- Admin pages should feel analytical, dense, and easy to scan

Use these visual tokens:

- Primary: `#0F4C81`
- Secondary accent: `#FFCB05`
- Canvas background: `#F3F4F6`
- Surface: `#FFFFFF`
- Strong text: `#1F2937`
- Muted text: `#6B7280`
- Border: `#D1D5DB`
- Success: `#10B981`
- Danger: `#EF4444`
- Warning: `#F59E0B`
- Info: `#3B82F6`

## Shared Components To Design

- Top navbar
- Role sidebar
- Primary, secondary, danger, and ghost buttons
- Form field system
- Validation messages
- KPI cards
- Summary panels
- Booking summary cards
- Status badges for `RESERVED`, `ARRIVED`, `COMPLETED`, `CANCELED`, `NO_SHOW`, `BLOCKLISTED`
- Tables with action columns
- Alerts
- Toasts
- Modals / confirmation dialogs
- Loading states
- Empty states
- Error states
- Printable receipt layout

## Screen Inventory With Structure

### 1. Public Home Page

Purpose:

- Main entry point into the system
- Explain the product clearly
- Separate customer access from staff access

Structure:

- Header / navbar
- Hero section with brand statement
- Primary CTA for advance booking
- Secondary CTA for shared login
- Shortcut CTA for cashier access
- Service highlights
- Policy highlight cards
- Entry cards for:
  - Register
  - User login
  - Cashier login
  - Admin login
- Footer

Content emphasis:

- This is a premium parking operations service
- Booking requires account creation and verification
- No-show and one-hour arrival policy should be visible early

### 2. Shared Login Page

Purpose:

- One shared sign-in page for all roles
- Backend decides the real role after login

Structure:

- Public top nav
- Split auth layout
- Left panel with role-aware explanation
- Right card with login form

Form fields:

- Email or username
- Password

Context variants:

- Default login hint
- User access hint
- Cashier access hint
- Admin access hint

Supporting elements:

- Forgot password link
- Create account link
- Access-state alerts for error, logout, and password reset success

### 3. Register Page

Purpose:

- Customer onboarding

Structure:

- Public auth layout
- Left panel explaining what the account unlocks
- Right card with long structured form

Form sections:

- Account information
  - Full name
  - Email
  - Password
  - Confirm password
- Personal details
  - Date of birth
  - Phone number
  - Gender
  - Address
- Vehicle details
  - Plate number
  - Vehicle type
  - Vehicle model
  - Vehicle color
- Confirmation checkbox for accuracy and email verification requirement

Supporting UI:

- Password strength indicator
- Inline validation
- Verification-required warning card

### 4. Register Success Page

Purpose:

- Confirm registration submission
- Instruct the customer to check email for verification

Structure:

- Simple status page
- Success icon
- Confirmation title
- Email-specific helper message if available
- Actions:
  - Go to login
  - Back to home

### 5. Verify Result Page

Purpose:

- Show email verification success or failure

Structure:

- Status screen
- Token outcome message
- Recovery guidance if token invalid or expired
- CTA back to login or home

### 6. Forgot Password Page

Purpose:

- Start password recovery

Structure:

- Public auth layout
- Simple email form
- Recovery explanation
- Submit CTA

### 7. Forgot Password Confirmation Page

Purpose:

- Confirm reset instructions were sent if the account is valid

Structure:

- Informational status page
- Inbox/spam reminder
- Actions back to login and home

### 8. Reset Password Page

Purpose:

- Validate token and let user set a new password

Structure:

- Public auth layout
- Reset form
- Password
- Confirm password
- Token validation message area

### 9. Reset Success Page

Purpose:

- Confirm password was updated

Structure:

- Success status page
- CTA back to login

### 10. User Dashboard

Purpose:

- Customer landing page after login

Structure:

- User top nav
- Welcome header
- Important notice or policy card
- Blocklist warning banner when applicable
- Quick summary area
- Booking and notification-oriented widgets

Content emphasis:

- Upcoming bookings
- Restriction visibility
- No-show reminder
- Action shortcuts into booking and bookings history

### 11. User Profile Page

Purpose:

- View and update customer and vehicle information

Structure:

- User shell
- Profile summary
- Editable details form
- Vehicle details form
- Restriction status card

Editable fields:

- Full name
- Phone number
- Address
- Plate number
- Vehicle type
- Vehicle model
- Vehicle color

Read-only or status-focused fields:

- Email
- Verification status
- Role
- Restriction / blocklist state

### 12. User Parking Cost Page

Purpose:

- Show the current hourly parking rate
- Explain pricing logic

Structure:

- User shell
- Rate summary card
- Example pricing panel
- Notes about rounded hours and minimum billing

### 13. User Book Parking Page

Purpose:

- First step of advance booking

Structure:

- User shell
- Top KPI cards for:
  - Current hourly rate
  - Available slots
  - Booking window
- Main booking form card
- Side policy / availability card

Booking form fields:

- Booking date
- Start time
- Level selection

Supporting content:

- No-show warning
- Blocklist restriction alert if applicable
- Existing active booking alert if applicable
- Level-based availability summary

### 14. User Select Slot Page

Purpose:

- Choose the exact parking slot

Structure:

- User shell
- Alert area
- Booking context meta cards:
  - Date
  - Scheduled time
  - Level
  - Estimated cost
- Slot grid
- Reservation summary side panel

Slot states:

- Available
- Unavailable
- Selected

Reservation summary:

- Level
- Date
- Start time
- Exit time
- Selected slot
- Estimated cost
- Confirm reservation button

### 15. User Bookings Page

Purpose:

- Show booking history and active reservations

Structure:

- User shell
- Filter bar
- Search field
- Results table or responsive stacked cards

Filters:

- Status
- Date
- Search

Visible columns / data:

- Booking ID
- Date
- Start time
- Exit time
- Level
- Slot
- Cost
- Status badge
- Action column

Actions:

- Cancel booking when status is `RESERVED`

### 16. User Notifications Page

Purpose:

- Personal notification inbox

Structure:

- User shell
- Inbox header with unread count
- Filter or grouping controls if helpful
- Notification list

States and actions:

- Read
- Unread
- Mark one as read
- Mark all as read

Notification types to visually support:

- Booking confirmation
- Booking reminder
- Blocklist
- Completed booking

### 17. Cashier Dashboard

Purpose:

- On-site operational overview

Structure:

- Cashier shell with sidebar
- KPI row
- Quick actions
- Time-sensitive summary panels

Suggested KPIs:

- Total users
- Reserved
- Available
- Parked

Emphasis:

- Bookings waiting for arrival
- Bookings ready for payment
- Fast operational access

### 18. Cashier Users Page

Purpose:

- Search and inspect verified users

Structure:

- Cashier shell
- Search/filter bar
- Results table

Useful columns:

- User name
- Email
- Phone
- Plate number
- Vehicle type
- Restriction state
- Action to open user details

### 19. Cashier User Details Page

Purpose:

- Show customer details needed for on-site operations

Structure:

- Cashier shell
- User summary card
- Contact and vehicle info panels
- Restriction status panel
- Recent or active booking context

### 20. Cashier Bookings Page

Purpose:

- Main cashier workflow screen

Structure:

- Cashier shell
- KPI summary row
- Filter form
- Workflow guidance panel
- Results table

Filters:

- Status
- Date
- Level or slot
- Search by booking ID, customer, or plate

Table content:

- Booking
- Vehicle
- Schedule
- Location
- Cost
- Status
- Actions

Actions by status:

- `RESERVED`: Mark arrived
- `ARRIVED`: Open payment
- `COMPLETED`: Open receipt
- Any useful row: open user details

### 21. Cashier Payment Page

Purpose:

- Complete a parking session and collect final amount

Structure:

- Cashier shell
- Booking summary
- Arrival details
- Exit preview
- Duration and final cost breakdown
- Completion confirmation action

Pricing visibility:

- Hourly rate
- Rounded-up duration
- Minimum 1 hour billing note

### 22. Cashier Receipt Page

Purpose:

- Show clean printable receipt

Structure:

- Print-friendly white surface
- Minimal controls
- Booking and customer details
- Vehicle details
- Level and slot
- Start time
- Exit time
- Duration
- Hourly rate
- Final amount

### 23. Cashier Notifications Page

Purpose:

- Operational alert feed

Structure:

- Cashier shell
- Alert filters or tabs
- Time-sensitive feed cards

Suggested filter groups:

- All
- Booking
- Blocklist

Alert emphasis:

- Upcoming bookings
- Current reserved bookings
- Arrived vehicles
- Auto-blocked users

### 24. Cashier Parking Rate Page

Purpose:

- Read-only rate reference for operational staff

Structure:

- Cashier shell
- Current hourly rate card
- Brief pricing reminder panel

### 25. Admin Dashboard

Purpose:

- Management overview

Structure:

- Admin shell with sidebar
- KPI cards
- Quick links
- System summary / operational overview panels

Suggested KPIs:

- Total users
- Reserved
- Available
- Parked

Emphasis:

- Overview and drill-down links
- Strong scanning hierarchy

### 26. Admin Users Page

Purpose:

- Search and oversee users

Structure:

- Admin shell
- Search/filter bar
- Results table

Useful columns:

- User name
- Email
- Vehicle data summary
- Verification state
- Restriction state
- Action to open user details

### 27. Admin User Details Page

Purpose:

- Full customer record view

Structure:

- Admin shell
- User profile overview
- Contact details
- Vehicle details
- Restriction and missed-booking summary
- Booking context summary

### 28. Admin Bookings Page

Purpose:

- Booking oversight

Structure:

- Admin shell
- Filters
- KPI or count summary
- Results table

Filters:

- Status
- Date
- User
- Slot / level
- Search

Table emphasis:

- Clear status badges
- High scanability
- Oversight rather than cashier action-first behavior

### 29. Admin Parking Rate Page

Purpose:

- Manage the current hourly rate

Structure:

- Admin shell
- Current rate card
- Rate update form
- Explanatory note on how pricing affects future calculations

### 30. Admin Blocklist Page

Purpose:

- Review and manage restricted users

Structure:

- Admin shell
- Blocklist summary
- Results table

Important fields:

- User
- Reason
- Restriction until date
- Missed-booking count
- Current restriction status

Primary action:

- Manual unblock

Important note:

- Do not invent a manual blocklist-add form in the main concept unless it is presented as optional, because that product decision is still open.

### 31. Admin Reports Page

Purpose:

- Booking and earnings analytics

Structure:

- Admin shell
- Report filter panel
- KPI summary cards
- Trend and distribution panels
- Export actions

Filters:

- Start date
- End date
- Group by day / week / month

KPIs:

- Completed bookings
- Total earnings
- Completion rate
- No-show bookings

Analytics panels:

- Booking trend
- Earnings trend
- Vehicle type distribution
- Booking status distribution

Actions:

- Export Excel
- Export PDF

## State Coverage Every Design Should Include

For relevant pages, show or account for:

- loading
- empty
- error
- success
- no results after filtering
- blocklisted / restricted state
- role mismatch or permission denied state

## Responsive Expectations

- Public and user flows: mobile-first discipline
- Cashier flows: tablet-first usability
- Admin flows: desktop-first, but still usable on smaller screens with scroll or stacked cards
- Do not compress data tables until unreadable; switch to responsive record cards where needed

## Things Stitch Should Not Invent

- Multi-branch or multi-location management
- Social features
- Chat support interfaces
- Consumer map discovery flows
- Payment gateway checkout flows
- Framework-specific UI assumptions
- Manual blocklist-add as a required first-pass admin feature

## Ready-To-Paste Stitch Prompt

```text
Design a complete multi-role web application for "Royal Service Parking", a premium but practical parking reservation and parking-operations system for a single parking facility.

This is not a generic parking finder. It is a role-based reservation and operations platform with 4 experiences: Public/Guest, User/Customer, Cashier, and Admin.

Backend is Spring Boot with session-based auth, role-based access, scheduled jobs, notifications, reporting, and MySQL persistence. Frontend is a plain JavaScript modular application with reusable components and clear route groups.

Create one coherent design system with 4 clearly related but distinct shells:
- Public shell with top nav, hero sections, and strong CTAs
- User shell with top nav, booking-focused account experience, and notification visibility
- Cashier shell with left sidebar, operational density, tablet-friendly layout, and action-first workflows
- Admin shell with left sidebar, strong filters, data-dense management screens, KPI hierarchy, and analytical reporting views

The system supports these routes and screens:

Public/shared:
- / home page
- /register
- /register-success
- /verify
- /login
- /forgot-password
- /forgot-password-confirmation
- /reset-password
- /reset-success
- Compatibility login aliases for /login/user, /login/cashier, /login/admin

User:
- /user/dashboard
- /user/profile
- /user/book
- /user/select-slot
- /user/bookings
- /user/notifications
- /user/parking-cost

Cashier:
- /cashier/dashboard
- /cashier/users
- /cashier/users/detail
- /cashier/bookings
- /cashier/bookings/payment
- /cashier/bookings/receipt
- /cashier/notifications
- /cashier/parking-cost

Admin:
- /admin/dashboard
- /admin/users
- /admin/users/detail
- /admin/bookings
- /admin/parking-cost
- /admin/blocklist
- /admin/reports

Core business flow:
1. Guest visits homepage
2. Customer registers and verifies email
3. Verified customer logs in
4. Customer books a slot by date, time, level, and exact slot
5. Cashier marks reserved booking as arrived
6. Cashier completes the parking session and generates a receipt
7. No-show after 1 hour triggers auto-cancel and temporary blocklist
8. Admin oversees users, bookings, pricing, restrictions, analytics, and exports

Important rules the design must visibly support:
- Verified email is required before customer login
- Blocklisted users cannot create bookings
- One active booking per user at a time in current behavior
- User cancellation is allowed only for RESERVED bookings
- Cashier workflow is RESERVED -> ARRIVED -> COMPLETED
- Parking duration is rounded up with minimum 1 hour billing
- Reports count completed bookings for earnings metrics
- This is a single-facility system, not a multi-location app

Visual direction:
- Premium and trustworthy, not flashy
- Clean operational design with strong hierarchy
- Public and user screens can be more spacious and polished
- Cashier screens should feel fast, clear, and tablet-friendly
- Admin screens should feel denser, more analytical, and easy to scan

Use these colors:
- Primary royal blue: #0F4C81
- Secondary accent gold: #FFCB05
- Canvas background: #F3F4F6
- Surface: #FFFFFF
- Strong text: #1F2937
- Muted text: #6B7280
- Border: #D1D5DB
- Success: #10B981
- Danger: #EF4444
- Warning: #F59E0B
- Info: #3B82F6

Design these shared components:
- top navbar
- role sidebar
- buttons
- forms
- validation messages
- KPI cards
- summary panels
- status badges for RESERVED, ARRIVED, COMPLETED, CANCELED, NO_SHOW, BLOCKLISTED
- tables with action columns
- alerts
- toasts
- modals
- loading states
- empty states
- error states
- printable receipt layout

Design each page with this structure:

Public home page:
- branded hero
- service overview
- no-show policy visibility
- role entry cards for register, user login, cashier login, admin login
- premium but practical first impression

Shared login page:
- one login form
- role-aware hints for user, cashier, and admin
- backend decides final destination after login
- forgot password and registration links

Register page:
- long structured onboarding form
- account information
- personal details
- vehicle details
- verification-required messaging

Register success, verify result, forgot-password confirmation, and reset-success pages:
- clean status pages with next-step CTAs

Reset password page:
- token-aware reset form
- password and confirm-password fields

User dashboard:
- welcome header
- important notice and policy area
- blocklist warning banner if needed
- booking-focused quick actions and summary widgets

User profile:
- editable profile and vehicle information
- read-only account identity
- visible restriction state

User parking cost page:
- current hourly rate
- pricing explanation
- rounded-hours and minimum-charge notes

User booking page:
- hourly rate
- total available slots
- available slots per level
- booking date
- start time
- level selection
- no-show warning
- booking window and current-active-booking guidance

User select slot page:
- selected date, time, level summary
- estimated cost
- grid of available and unavailable slots
- clear selected state
- reservation summary panel
- final confirm button

User bookings page:
- searchable and filterable booking history
- status badges
- booking ID, schedule, level, slot, cost
- cancel action only for reserved bookings

User notifications page:
- inbox with read and unread states
- unread count
- mark one as read
- mark all as read

Cashier dashboard:
- KPI cards
- quick actions
- operational focus on active work

Cashier users page:
- searchable verified users list

Cashier user details page:
- profile, vehicle, restriction state, and booking context

Cashier bookings page:
- filters for status, date, level/slot, search
- operational table
- mark-arrived action
- open-payment action
- open-receipt action

Cashier payment page:
- booking summary
- arrival details
- exit preview
- rounded-up duration
- recalculated price
- complete-session CTA

Cashier receipt page:
- printable clean receipt
- customer, vehicle, level, slot, time in, time out, hourly rate, duration, final cost

Cashier notifications page:
- operational feed
- booking alerts
- blocklist-related alerts
- filter chips like all / booking / blocklist

Cashier parking rate page:
- read-only hourly rate reference

Admin dashboard:
- KPI cards
- quick links
- system overview

Admin users page:
- searchable user table

Admin user details page:
- full customer record
- restriction info
- booking summary

Admin bookings page:
- oversight table
- filters by status, date, user, slot
- strong status visibility

Admin parking rate page:
- current hourly rate
- rate update form
- note explaining pricing impact

Admin blocklist page:
- blocklisted users table
- reason
- restriction-until date
- missed-booking count
- manual unblock action
- do not treat manual blocklist-add as a required screen

Admin reports page:
- date range filters
- day/week/month grouping
- KPI summaries
- booking trend
- earnings trend
- vehicle type distribution
- booking status distribution
- Excel export
- PDF export

For relevant screens, include or account for:
- loading states
- empty states
- error states
- success states
- no-results filtered states
- role mismatch or permission denied states

Responsive expectations:
- Public and user flows should work well on mobile
- Cashier flows should be optimized for tablet use
- Admin flows should be desktop-first but still responsive
- Use stacked cards instead of crushed tables on narrow screens

Do not invent:
- multi-location management
- consumer map discovery
- social or chat features
- payment gateway checkout
- framework-specific UI patterns

Output:
- overall design system direction
- sitemap / screen hierarchy
- Public shell
- User shell
- Cashier shell
- Admin shell
- high-fidelity concepts for all listed pages
- reusable component system
- responsive behavior notes
```

## Next Prompt Set

After this base prompt, the next recommended deliverables are split prompts for:

- public
- user
- cashier
- admin

Those role-specific prompts should be narrower and even more layout-specific than the master prompt above.

Split prompt files now available:

- `set_set/STITCH_PROMPT_PUBLIC.md`
- `set_set/STITCH_PROMPT_USER.md`
- `set_set/STITCH_PROMPT_CASHIER.md`
- `set_set/STITCH_PROMPT_ADMIN.md`
