# Royal Service Parking Feature Rebuild Spec

## 1. What This Web App Is

Royal Service Parking is a server-rendered parking reservation and parking-operations web application for a single parking facility.

It supports three distinct roles:

- Public/guest visitors
- Registered parking customers (`USER`)
- Parking staff (`CASHIER`)
- System administrators (`ADMIN`)

At a high level, the system lets customers register, verify their email, reserve a parking slot in advance, view or cancel their bookings, and receive notifications. Cashiers manage active reservations and parking sessions on site. Admins oversee users, bookings, pricing, blocklisted accounts, and reports.

The current implementation is a Spring Boot + Thymeleaf monolith with MySQL persistence, email notifications, scheduled background jobs, and role-based authentication.

## 2. Core Product Purpose

The app is designed to manage the full lifecycle of a parking reservation:

1. A customer creates an account and verifies their email.
2. The customer books a parking slot for a selected date, time, and level.
3. The system reserves the slot and sends confirmations.
4. The customer must arrive within 1 hour of the scheduled time.
5. A cashier marks the user as arrived when they check in.
6. When the user leaves, the cashier completes the parking session and generates a receipt.
7. If the user does not arrive on time, the booking is auto-canceled and the user is temporarily blocklisted.

## 3. User Roles

### Guest / Public

- View landing page / homepage
- Navigate to user registration
- Navigate to user login
- Navigate to cashier login
- Navigate to admin login

### Customer / User

- Register account
- Verify email address
- Log in
- Reset password
- View dashboard
- View and update profile
- View parking rates
- Book parking
- Select parking level, date, time, and slot
- View booking history
- Filter bookings
- Cancel reserved bookings
- View personal notifications
- See blocklist warnings and restriction state

### Cashier

- Log in to cashier portal
- View operational dashboard
- View verified users
- View user profile details
- View bookings
- Filter bookings by status/date/slot
- Mark reserved bookings as arrived
- Complete bookings / payment
- View and print receipt
- View operational notifications for active bookings and blocklisted users
- View current parking rate

### Admin

- Log in to admin portal
- View admin dashboard
- View verified users
- View user details
- View all bookings
- Filter bookings by status/date/user/slot
- View current parking rate
- Update parking hourly rate
- View blocklisted users
- Remove users from blocklist
- Access reports dashboard
- View booking/earnings analytics
- Export reports to Excel and PDF

## 4. Main Feature Modules

## 4.1 Public Website / Entry Point

Observed behavior:

- Landing page branded as `Royal Service Parking`
- Shows separate entry points for:
  - Advance booking / registration
  - User login
  - Admin login
  - Cashier login
- Guest booking shortcut redirects to registration first

Rebuild module requirements:

- Marketing/home page
- Role-specific login entry points
- Clear CTA for advance booking
- Optional brand assets / carousel / hero presentation

## 4.2 Authentication and Access Control

Observed behavior:

- Role-based access using three route namespaces:
  - `/user/**`
  - `/cashier/**`
  - `/admin/**`
- Separate login screens for each role
- One shared login processing endpoint
- Login flow validates that the selected login page matches the authenticated role
- Redirects users into their own dashboards after login

Rebuild requirements:

- Role-aware login UX
- Session-based or token-based auth
- Authorization middleware / guards per role
- Redirect handling after successful login
- Role mismatch handling

Current implementation note:

- `ADMIN` and `CASHIER` accounts are hardcoded in memory.
- `USER` accounts are stored in the database.

Important rebuild decision:

- Decide whether admin/cashier should remain fixed internal accounts or become database-managed staff accounts.

## 4.3 User Registration and Email Verification

Observed features:

- Registration form captures:
  - Full name
  - Email
  - Date of birth
  - Phone number
  - Gender
  - Address
  - Plate number
  - Vehicle type
  - Vehicle model
  - Vehicle color
  - Password
  - Confirm password (UI side)
- Email must be unique
- If an email already exists but is still unverified, the old unverified account is deleted and replaced
- New users receive a verification email
- User cannot log in until verified
- Verification is done through tokenized email link

Rebuild requirements:

- Registration flow
- Email verification flow
- Verified flag on users
- Verification token generation and invalidation
- Duplicate-email policy handling

## 4.4 Password Recovery

Observed features:

- Forgot password page
- Only verified accounts can request a password reset
- Reset token emailed to user
- Reset-password page validates token
- Password + confirm-password validation
- Reset success confirmation page

Rebuild requirements:

- Password reset request
- Token generation/storage
- Reset form with token validation
- Password update and token invalidation

## 4.5 User Profile Management

Observed features:

- User can view profile info
- User can update:
  - Full name
  - Phone number
  - Address
  - Plate number
  - Vehicle type
  - Vehicle model
  - Vehicle color
- Email, password, role, and verification state are not updated from the profile page
- Profile page also shows account restriction/blocklist status

Rebuild requirements:

- Profile read/update page
- Editable vehicle and contact information
- Restriction banner/status display

## 4.6 Parking Inventory / Slot Management

Observed features:

- Parking slots are auto-initialized on app startup
- Default structure:
  - 4 levels
  - `Level 1` to `Level 4`
  - 26 slots per level
  - `Slot A` to `Slot Z`
- Total default capacity: 104 slots
- Slot records store:
  - Level
  - Slot name
  - Available flag
  - Temporary unavailable flag

Observed operational behavior:

- Slot inventory is not managed through a dedicated admin CRUD UI
- Slots are created automatically if missing
- Availability is influenced by both physical availability and booking state

Rebuild requirements:

- Slot inventory model
- Level grouping
- Slot availability state
- Startup seeding or admin-managed inventory creation

Optional rebuild enhancement:

- Add a true admin UI for parking layout management

## 4.7 Parking Rate Management

Observed features:

- System stores a single current hourly parking rate
- Admin can update hourly rate
- Cashier can view rate
- User can view rate and see sample cost example
- Booking cost and completion cost are derived from this rate

Rebuild requirements:

- Parking rate settings page
- Current active rate record
- Admin-only editing
- Use current rate when computing booking/session cost

Important rebuild decision:

- Decide whether rates should be versioned historically or remain as one mutable current rate

## 4.8 Booking / Reservation Flow

Observed customer flow:

1. User opens booking page
2. User sees:
   - Current hourly rate
   - Total available slots
   - Available slots per level
   - No-show warning
3. User picks date and time
4. User picks a parking level
5. System opens slot-selection page
6. Slot-selection page shows available/unavailable slots
7. User selects a slot
8. System confirms booking and stores it as `RESERVED`

Booking data stored:

- User
- Date
- Start time
- Exit time
- Parking hours
- Parking cost
- Payment mode
- Level
- Slot name
- Plate number
- Vehicle type
- Status
- Arrival flags
- Reminder flags

Booking statuses observed:

- `PENDING`
- `RESERVED`
- `ARRIVED`
- `COMPLETED`
- `CANCELED`

User-facing booking rules:

- Blocklisted users cannot book
- User must arrive within 1 hour of scheduled time
- Booking can be canceled automatically for no-show

System booking rules:

- User cannot create a booking if they already have an active booking in status:
  - `RESERVED`
  - `ARRIVED`
- Slot is marked unavailable when reserved
- Confirmation notification is created
- Confirmation email is sent

Rebuild requirements:

- Booking form
- Slot-selection step
- Reservation confirmation step
- Pricing calculation
- Active-booking validation
- Slot locking / reservation logic
- Reservation confirmation email and in-app notification

## 4.9 Slot Availability Experience

Observed user experience:

- Slot selection is level-based
- User passes selected level, date, and optional time
- Slot cards show:
  - Slot name
  - Select button if available
  - Unavailable button if not available
- User sees formatted date and formatted time

Important observed implementation detail:

- UI implies date/time-aware booking
- Actual service logic is only partially time-aware
- `select-slot` checks availability by date
- But booking creation also globally blocks a slot if it has any active booking in `RESERVED` or `ARRIVED`, regardless of date

This means the current system behaves more like:

- one active reservation per slot at a time globally

rather than:

- multiple future reservations per slot across different dates/times

Rebuild decision needed:

- Choose whether the new system should preserve this exact behavior
- Or implement true date/time overlap validation

Recommendation for rebuild:

- Use proper interval-based reservation conflict detection
- Allow different bookings for the same slot on different dates/times when they do not overlap

## 4.10 Booking History and Filtering

Observed user features:

- View own bookings
- Filter by:
  - Status
  - Date
  - Search text
- Search supports:
  - Booking ID
  - Plate number
  - Level
  - Slot name
- Bookings sorted by:
  - Active first (`RESERVED`, then `ARRIVED`)
  - Then completed
  - Then canceled
  - Then latest date/time first

Observed displayed fields:

- Booking ID
- User name
- Plate number
- Date
- Start time
- Exit time
- Level
- Slot
- Cost
- Status badge

Rebuild requirements:

- Booking list view
- Filters
- Sorting
- Status badges
- Search

## 4.11 Booking Cancellation

Observed features:

- User can cancel their own booking
- Only `RESERVED` bookings can be canceled
- User cannot cancel someone else’s booking
- Canceling updates booking status to `CANCELED`
- Slot becomes available again

Rebuild requirements:

- User-owned booking cancellation
- Status guardrails
- Slot release on cancellation

## 4.12 Arrival Check-In

Observed cashier features:

- Cashier can mark a reserved booking as arrived
- On arrival:
  - `arrived = true`
  - `arrivalTime = now`
  - status becomes `ARRIVED`
  - start time is overwritten with the current system time
  - slot remains unavailable

Rebuild requirements:

- Cashier check-in action
- Arrival timestamp tracking
- Parking session start handling

Important rebuild decision:

- The current app overwrites the original reserved start time with actual arrival time.
- Decide whether the rebuild should preserve:
  - scheduled start time
  - actual arrival time
  - or both separately

Recommendation:

- Store both scheduled arrival time and actual arrival time explicitly.

## 4.13 Parking Session Completion and Payment

Observed cashier features:

- Cashier opens a payment/edit page for a booking
- System previews:
  - exit time
  - total duration
  - cost
- Cashier completes the booking by marking it paid/completed
- On completion:
  - status becomes `COMPLETED`
  - exit time is set to current time
  - duration is recalculated
  - partial hours are rounded up
  - minimum 1 hour charge applies
  - total cost is recalculated from hourly rate
  - slot becomes available again
- Receipt page is generated
- Receipt supports print/download behavior in UI
- Completion email and completion notification are sent to the user

Rebuild requirements:

- Check-out / payment flow
- Duration calculation
- Rounded hourly billing
- Slot release after exit
- Receipt generation
- Completed-booking notification/email

## 4.14 Cashier Operational Booking Management

Observed features:

- Cashier booking page lists all bookings
- Filters:
  - Status
  - Date
  - Slot / level text
- Actions depend on booking state
- Cashier can:
  - mark arrival
  - open payment page
  - open receipt

Rebuild requirements:

- Back-office booking operations view
- Search/filter tools
- Status-based actions
- Operational workflow for reserved -> arrived -> completed

## 4.15 Dashboards

### User Dashboard

Observed features:

- Personalized welcome message
- Full-screen image carousel
- Important notice modal
- Shows no-show/blocklist policy
- Can show account restriction warning

### Cashier Dashboard

Observed widgets:

- Total users
- Total parking reserved
- Total parking available
- Total parked
- Quick actions

### Admin Dashboard

Observed widgets:

- Total users
- Total parking reserved
- Total parking available
- Total parked
- Quick actions
- System information panel

Rebuild requirements:

- Role-specific dashboards
- KPI cards
- Quick links into main workflows

## 4.16 Notifications

There are two distinct notification experiences.

### A. User Notifications

Observed features:

- User-specific notification inbox
- Notification types observed:
  - booking confirmation
  - booking reminder
  - blocklist
  - completed
  - unblock enum exists but not clearly used
- Mark individual notification as read
- Mark all notifications as read
- Fetch unread count

Rebuild requirements:

- Notification entity
- Per-user inbox
- Read/unread state
- Unread counter endpoint

### B. Cashier Operational Notifications

Observed features:

- Separate cashier notification screen
- Built from:
  - current reserved bookings
  - current arrived bookings
  - system blocklist notifications
  - blocklisted users tied to bookings
- Notifications highlight:
  - upcoming bookings
  - present/current bookings
  - arrived vehicles
  - auto-blocked users
- Filter buttons:
  - all
  - booking
  - blocklist

Rebuild requirements:

- Staff operations notification feed
- Time-based prioritization
- Booking-state driven operational alerts

## 4.17 Email Notifications

Observed email templates:

- Verification email
- Password reset email
- Generic notification email
- Booking confirmation email
- Booking completed email
- Blocklist notification email

Observed email-trigger events:

- New user registration
- Forgot-password request
- Booking confirmed
- Booking completed
- User blocklisted after no-show

Rebuild requirements:

- Email delivery service
- Templated email rendering
- Tokenized links for verification and password reset
- Operational retry/error logging policy

## 4.18 Blocklist / Restriction Management

Observed rule set:

- If user misses a reserved booking and does not arrive within 1 hour:
  - booking becomes auto-expired
  - booking is canceled
  - slot becomes available
  - user missed-bookings count increments
  - user is blocklisted
- Duration rules observed in service:
  - first offense: 3 weeks
  - second or later offense: 1 month
- User sees restriction banners in dashboard/profile/booking pages
- Admin can view all currently blocklisted users
- Admin can remove a user from blocklist manually

Observed extra implementation:

- There is also a controller endpoint for manually adding a user to blocklist with selectable duration and reason.
- I did not find a clear corresponding admin UI form using that endpoint in the current templates.

Rebuild requirements:

- Restriction state on users
- Missed-booking counter
- Auto-blocking job
- Manual unblock
- Optional manual block action for admins
- Visibility of restriction reason and end date

## 4.19 Scheduled Background Jobs

Observed recurring jobs:

### Auto-expire no-show bookings

- Runs every minute
- Scans reserved bookings
- If current time is more than 1 hour past scheduled booking time and user has not arrived:
  - marks booking auto-expired
  - cancels booking
  - frees slot
  - increments missed-booking count
  - blocklists user
  - sends user notification/email
  - creates system notification for cashier operations

### Send booking reminders

- Runs every minute
- Finds reserved bookings starting within 30 minutes
- Sends in-app reminder once per booking

### Remove expired blocklists

- Runs every minute
- Clears blocklist flags when the blocklist end datetime has passed

Rebuild requirements:

- Background scheduler / workers
- Idempotent reminder logic
- Idempotent no-show processing
- Expired-blocklist cleanup

## 4.20 Reporting and Analytics

Observed admin reporting features:

- Reports dashboard page
- Default date range is current month
- Period grouping options:
  - day
  - week
  - month
- KPI statistics:
  - total bookings
  - completed bookings
  - canceled bookings
  - no-show bookings
  - total earnings
  - completion rate
- Charts:
  - completed bookings trend
  - earnings trend
  - vehicle type distribution
  - booking status distribution
- Export options:
  - Excel
  - PDF

Observed report logic:

- Earnings count only `COMPLETED` bookings
- Vehicle type statistics count only completed bookings
- Status breakdown includes:
  - `COMPLETED`
  - `CANCELED`
  - `RESERVED`
  - `ARRIVED`
  - `NO_SHOW`

Rebuild requirements:

- Analytics API
- Date range filtering
- Aggregation by day/week/month
- Export pipeline
- Admin reporting UI

## 5. Primary Data Entities

## 5.1 User

Fields observed:

- id
- fullName
- email
- dateOfBirth
- phoneNumber
- gender
- address
- plateNumber
- vehicleType
- vehicleModel
- vehicleColor
- password
- verified
- verificationToken
- resetToken
- role
- blocklisted
- blocklistUntil
- missedBookingsCount
- assignedParkingSlot

Notes:

- `assignedParkingSlot` exists but does not appear central to the booking flow
- roles are string-based in persistence

## 5.2 Booking

Fields observed:

- id
- userId
- date
- startTime
- exitTime
- parkingHours
- parkingCost
- paymentMode
- level
- slotName
- plateNumber
- vehicleType
- status
- arrived
- arrivalTime
- autoExpired
- reminderSent

Notes:

- `paymentMode` exists but does not appear actively used in UI
- status is stored as a string in the database

## 5.3 ParkingSlot

Fields observed:

- id
- level
- slotName
- available
- temporaryUnavailable

## 5.4 ParkingCost

Fields observed:

- id
- hourlyRate

## 5.5 Notification

Fields observed:

- id
- userId nullable
- type
- title
- message
- createdAt
- isRead

System-wide notification types observed:

- `BOOKING_CONFIRMATION`
- `BOOKING_REMINDER`
- `BLOCKLIST`
- `UNBLOCK`
- `COMPLETED`
- `SYSTEM_BLOCKLIST`

## 5.6 BookingSummary

Used for reporting only:

- date
- totalBookings
- totalEarnings
- completedBookings
- canceledBookings
- noShowBookings

## 6. End-to-End Workflows

## 6.1 Customer Onboarding Workflow

1. Guest opens landing page
2. Guest chooses registration
3. User fills registration form
4. System creates unverified account
5. System sends verification email
6. User clicks verification link
7. Account becomes verified
8. User logs in

## 6.2 Advance Booking Workflow

1. Verified user logs in
2. User opens booking page
3. User selects date, time, and level
4. System shows slot-selection page
5. User chooses an available slot
6. System validates booking conflicts
7. System stores booking as `RESERVED`
8. Slot becomes unavailable
9. User receives in-app and email confirmation

## 6.3 Arrival and Parking Workflow

1. Reserved booking appears in cashier portal
2. Customer arrives on site
3. Cashier marks booking as arrived
4. Booking becomes `ARRIVED`
5. Actual start time is set to current time

## 6.4 Exit and Payment Workflow

1. Cashier opens payment page for arrived booking
2. System previews duration and price
3. Cashier marks booking as paid/completed
4. Booking becomes `COMPLETED`
5. Exit time and cost are recalculated
6. Slot becomes available again
7. Receipt page is shown
8. Completion email/notification are sent

## 6.5 No-Show Workflow

1. User reserves a slot
2. User does not arrive within 1 hour
3. Background job detects expiration
4. Booking is canceled and flagged auto-expired
5. Slot is released
6. Missed-booking count increases
7. User is blocklisted temporarily
8. User receives notification/email
9. Cashier operations feed receives system notification

## 7. Business Rules to Preserve or Deliberately Revisit

These are important because they affect rebuild design.

### Preserve-worthy observed rules

- Verified email is required before user login
- User may cancel only reserved bookings
- Partial parking hours are rounded up
- Minimum billable parking duration is 1 hour
- No-show after 1 hour causes automatic cancellation
- No-show increments missed-booking count
- Blocklisted users cannot create new bookings
- Expired blocklists automatically clear

### Rules that need explicit product decision in rebuild

- One active booking per user globally
- One active reservation per slot globally, not true date/time overlap logic
- Arrival action overwrites scheduled start time
- Hardcoded admin/cashier accounts instead of managed staff users
- Payment mode field exists but is not truly implemented in workflows
- Manual blocklist endpoint exists but UI appears incomplete

## 8. Screens / Pages Inventory

Public / shared:

- Home page
- Register page
- Register success page
- User login page
- Cashier login page
- Admin login page
- Email verification result page
- Forgot-password page
- Forgot-password confirmation page
- Reset-password page
- Reset-success page
- Generic notifications page for users

User area:

- User dashboard
- User profile
- Book parking page
- Select slot page
- User bookings page
- User parking-cost page

Cashier area:

- Cashier dashboard
- Cashier users page
- Cashier user details page
- Cashier bookings page
- Cashier edit/payment page
- Cashier receipt page
- Cashier notifications page
- Cashier parking-cost page

Admin area:

- Admin dashboard
- Admin users page
- Admin user details page
- Admin bookings page
- Admin parking-cost page
- Admin blocklist page
- Admin reports dashboard

Email templates:

- Verification
- Password reset
- Generic notification
- Booking confirmation
- Booking completed
- Blocklist notification

## 9. Rebuild Scope Recommendation

If rebuilding in another tech stack, I would separate the system into these bounded domains:

- Identity and access
- Customer accounts and vehicle profiles
- Parking inventory
- Reservations and session lifecycle
- Pricing and billing
- Notifications and email
- Operations dashboard for cashier/admin
- Reporting and exports

Suggested implementation priorities:

1. Auth + roles + user registration/verification
2. Slot inventory + parking rate settings
3. Booking flow + availability engine
4. Cashier check-in/check-out flow
5. Notifications + scheduled jobs
6. Admin reports + exports

## 10. Recommended Improvements During Rebuild

These are not required to match current behavior, but they are strong candidates:

- Replace hardcoded staff accounts with managed admin/cashier user records
- Implement true date/time overlap conflict detection for slots
- Store scheduled time, arrival time, and exit time separately
- Add real payment mode/payment transaction handling if needed
- Add audit logs for status changes and admin actions
- Add admin UI for slot management and manual blocklisting
- Add rate history/versioning
- Add reason codes for cancellations and restrictions
- Move notifications into a unified event model with role-specific views

## 11. Short Product Summary

This application is a role-based parking reservation and parking operations system for a single facility. Its core value is advance booking for customers and real-time reservation handling for cashiers, with admin oversight for pricing, users, restrictions, and reports.

The most important functional areas to preserve in a rebuild are:

- customer registration and verification
- advance slot booking
- slot availability and reservation locking
- cashier arrival/completion workflow
- automated no-show cancellation and blocklisting
- user and staff notifications
- admin pricing and reporting
