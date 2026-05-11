# Royal Service Parking Stitch Prompt: User

## Purpose

Use this prompt when generating only the customer-facing authenticated user portal for Royal Service Parking.

## Product Context

Royal Service Parking lets verified customers reserve a parking slot in advance, manage bookings, view notifications, and maintain account and vehicle details.

This user portal is part of a larger role-based system that also has cashier and admin workspaces, but this prompt is only for the customer experience.

## User Experience Goals

- Make booking feel clear and guided
- Keep account and reservation context visible
- Show policy and restriction states clearly
- Balance premium presentation with practical booking utility
- Keep the portal clean on mobile

## Business Rules The Design Must Respect

- Verified email is required before access
- Blocklisted users cannot create bookings
- Current behavior allows one active booking per user at a time
- Booking begins with date, time, and level selection
- Slot selection is a second step
- User can cancel only `RESERVED` bookings
- Notifications include booking confirmation, reminders, blocklist, and completion events

## Routes In Scope

- `/user/dashboard`
- `/user/profile`
- `/user/book`
- `/user/select-slot`
- `/user/bookings`
- `/user/notifications`
- `/user/parking-cost`

## User Shell

Use a customer-focused top navigation shell with:

- Dashboard
- Book Parking
- My Bookings
- Notifications
- Profile
- Parking Cost

Shell requirements:

- Top navbar
- Notification badge
- Clear page header area
- Inline alert area for account restrictions
- Cleaner and more spacious than staff dashboards

## Visual Direction

- Premium but calm
- Clear service utility
- Guided and confidence-building
- Mobile-friendly
- Less dense than cashier or admin

Use these tokens:

- Primary: `#0F4C81`
- Accent: `#FFCB05`
- Background: `#F3F4F6`
- Surface: `#FFFFFF`
- Strong text: `#1F2937`
- Muted text: `#6B7280`
- Border: `#D1D5DB`
- Success: `#10B981`
- Danger: `#EF4444`
- Warning: `#F59E0B`
- Info: `#3B82F6`

## Shared Components To Show

- User top navbar
- Notification badge
- KPI cards
- Booking summary cards
- Policy / notice panels
- Slot cards
- Booking table or responsive booking cards
- Status badges
- Inline alerts
- Confirmation dialog
- Loading, empty, and error states

## Page Inventory And Structure

### 1. User Dashboard

Purpose:

- Main landing page after login

Structure:

- Welcome header
- Important notice or policy panel
- Blocklist warning banner if restricted
- Quick actions
- Booking summary widgets
- Notification or account summary card

Emphasis:

- Upcoming parking actions
- Restriction visibility
- Fast routes into booking and history

### 2. User Profile Page

Purpose:

- Manage account and vehicle information

Structure:

- Profile summary
- Editable personal details section
- Editable vehicle details section
- Read-only account identity / verification section
- Restriction status card

Editable fields:

- full name
- phone number
- address
- plate number
- vehicle type
- vehicle model
- vehicle color

Read-only emphasis:

- email
- role
- verification state
- restriction state

### 3. User Parking Cost Page

Purpose:

- Explain current hourly rate and pricing model

Structure:

- Current hourly rate card
- Example cost breakdown
- Billing notes

Important notes to surface:

- partial hours round up
- minimum 1 hour billing

### 4. User Book Parking Page

Purpose:

- First step of the booking flow

Structure:

- KPI row with:
  - current hourly rate
  - available slots
  - booking window
- Main booking form card
- Availability by level panel
- Alert area

Fields:

- booking date
- start time
- level selection

Important supporting states:

- blocklisted alert
- active booking alert
- no-show policy reminder

### 5. User Select Slot Page

Purpose:

- Select the exact parking slot

Structure:

- Booking context header or meta cards
  - date
  - scheduled time
  - level
  - estimated cost
- Alert area
- Slot selection grid
- Reservation summary side panel

Slot states:

- available
- unavailable
- selected

Reservation summary should show:

- level
- date
- start time
- exit time
- selected slot
- estimated cost
- final confirm action

### 6. User Bookings Page

Purpose:

- View booking history and active bookings

Structure:

- Filter bar
- Search
- Results table or responsive card list

Filters:

- status
- date
- search text

Displayed information:

- booking ID
- date
- start time
- exit time
- level
- slot
- cost
- status

Actions:

- cancel button only when booking is `RESERVED`

### 7. User Notifications Page

Purpose:

- Personal inbox for parking-related system notifications

Structure:

- Inbox header
- unread count
- list of notifications
- action bar

Actions:

- mark one as read
- mark all as read

Notification types to support visually:

- booking confirmation
- booking reminder
- blocklist
- completed booking

## States To Include

- loading
- empty
- error
- success
- no results after filtering
- blocklisted restriction state
- active booking lock state

## Responsive Expectations

- Mobile-first
- Booking flow should be easy to use on phone
- Slot grid should stay readable on smaller screens
- Tables should convert to cards when needed

## Ready-To-Paste Stitch Prompt

```text
Design the authenticated customer portal for "Royal Service Parking", a premium but practical parking reservation system for a single parking facility.

Only design the user/customer experience, not the cashier or admin portals.

Pages in scope:
- user dashboard
- user profile
- user parking cost page
- user book parking page
- user select slot page
- user bookings page
- user notifications page

Important business rules:
- verified email is required before access
- blocklisted users cannot create bookings
- current behavior allows one active booking per user at a time
- booking starts with date, time, and level selection
- exact slot selection happens in a second step
- users can cancel only RESERVED bookings

Use a top navigation shell with:
- Dashboard
- Book Parking
- My Bookings
- Notifications
- Profile
- Parking Cost

The portal should feel:
- premium
- calm
- customer-friendly
- guided
- mobile-friendly

Dashboard:
- welcome area
- important notice or policy card
- blocklist warning banner when needed
- quick actions
- booking-related summary widgets

Profile page:
- editable personal details
- editable vehicle details
- read-only account identity
- restriction state card

Parking cost page:
- current hourly rate
- pricing explanation
- rounded-hour note
- minimum 1 hour billing note

Book parking page:
- current hourly rate
- total available slots
- booking window
- availability by level
- date field
- start time field
- level selection
- blocklisted or active-booking alerts
- no-show warning

Select slot page:
- selected date, time, level, and estimated cost summary
- slot grid with available, unavailable, and selected states
- reservation summary panel
- final confirm reservation action

Bookings page:
- filters by status and date
- search
- booking history list
- clear status badges
- cancel action only for RESERVED bookings

Notifications page:
- inbox with read/unread states
- unread count
- mark one as read
- mark all as read

Use these colors:
- primary royal blue: #0F4C81
- accent gold: #FFCB05
- background: #F3F4F6
- surface: #FFFFFF
- strong text: #1F2937
- muted text: #6B7280
- border: #D1D5DB
- success: #10B981
- danger: #EF4444
- warning: #F59E0B
- info: #3B82F6

Key components to design:
- top navbar
- notification badge
- KPI cards
- booking summary cards
- slot cards
- status badges
- alerts
- confirmation dialog
- table and responsive card patterns
- loading, empty, and error states

Show states where relevant:
- loading
- empty
- error
- success
- no results
- blocklisted restriction
- active booking lock state

Responsive expectation:
- mobile-first
- booking flow should be comfortable on phone screens
- slot selection remains clear on small devices

Output:
- user shell
- key reusable components
- high-fidelity concepts for all listed user pages
- responsive notes
```
