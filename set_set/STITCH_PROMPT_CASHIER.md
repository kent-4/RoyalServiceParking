# Royal Service Parking Stitch Prompt: Cashier

## Purpose

Use this prompt when generating only the cashier operations portal for Royal Service Parking.

## Product Context

Royal Service Parking includes an on-site cashier workspace used to manage active reservations and parking sessions.

This portal is operational, time-sensitive, and action-driven. It is not a customer-facing marketing experience.

## Cashier Experience Goals

- Make high-priority tasks obvious
- Reduce friction for arrivals and completion flow
- Keep layouts readable on tablets
- Surface time-sensitive bookings clearly
- Support quick scanning across bookings, users, and alerts

## Business Rules The Design Must Respect

- Cashier works with customer bookings after reservation
- Reserved bookings can be marked as arrived
- Arrived bookings move into payment/completion flow
- Completed bookings expose printable receipt view
- Cashier needs fast visibility into booking states
- Current parking rate is view-only for cashier
- Operational notifications can include booking and blocklist-related alerts

## Routes In Scope

- `/cashier/dashboard`
- `/cashier/users`
- `/cashier/users/detail`
- `/cashier/bookings`
- `/cashier/bookings/payment`
- `/cashier/bookings/receipt`
- `/cashier/notifications`
- `/cashier/parking-cost`

## Cashier Shell

Use a left-sidebar operational shell with:

- Dashboard
- Users
- Bookings
- Notifications
- Parking Rate

Shell requirements:

- Persistent sidebar on desktop
- Collapsible or drawer behavior on tablet
- Action-first content area
- Clear page header
- Dense but not cluttered operational layout

## Visual Direction

- Fast and readable
- High-clarity operational design
- More contrast and urgency than customer pages
- Tablet-friendly
- Practical, not decorative

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

- Cashier sidebar
- KPI cards
- Operational filter form
- Dense data table
- Status badges
- Action buttons
- Payment summary card
- Receipt print layout
- Notification feed cards
- Loading, empty, and error states

## Page Inventory And Structure

### 1. Cashier Dashboard

Purpose:

- Operational overview

Structure:

- KPI strip
- Quick actions
- At-a-glance operational panels

Suggested KPIs:

- total users
- reserved
- available
- parked

Emphasis:

- what needs action now
- shortcuts to bookings and notifications

### 2. Cashier Users Page

Purpose:

- Search and inspect users relevant to current operations

Structure:

- Search/filter bar
- Results table

Useful columns:

- user name
- email
- phone number
- plate number
- vehicle type
- restriction state
- action to open details

### 3. Cashier User Details Page

Purpose:

- View customer information needed during operations

Structure:

- user summary card
- contact details
- vehicle details
- restriction state panel
- active or recent booking context

### 4. Cashier Bookings Page

Purpose:

- Main operations workflow page

Structure:

- KPI summary row
- filter form
- workflow guidance panel
- operational results table

Filters:

- status
- date
- level or slot
- search

Table columns:

- booking
- vehicle
- schedule
- location
- cost
- status
- actions

Actions:

- mark arrived
- open payment
- open receipt
- open user details

Emphasis:

- `RESERVED` and `ARRIVED` bookings are most action-relevant

### 5. Cashier Payment Page

Purpose:

- Complete booking and collect final payment

Structure:

- booking summary
- customer and vehicle reference
- arrival details
- exit preview
- duration and cost breakdown
- complete session CTA

Pricing emphasis:

- rounded-up duration
- minimum 1 hour billing
- current hourly rate

### 6. Cashier Receipt Page

Purpose:

- Printable final receipt

Structure:

- print-oriented white layout
- booking info
- customer info
- vehicle info
- level and slot
- time in
- time out
- duration
- hourly rate
- final amount

### 7. Cashier Notifications Page

Purpose:

- Operational feed for real-time awareness

Structure:

- filter chips or tabs
- alert feed
- visual hierarchy for urgency

Possible filter groups:

- all
- booking
- blocklist

Types to surface:

- upcoming bookings
- present/current bookings
- arrived vehicles
- auto-blocked users

### 8. Cashier Parking Rate Page

Purpose:

- Show current hourly rate as read-only reference

Structure:

- current rate card
- pricing reminder panel

## States To Include

- loading
- empty
- error
- no results after filter
- action in progress
- completed state

## Responsive Expectations

- Tablet-first
- Booking table and actions must remain usable in portrait and landscape
- Action buttons should stay easy to tap

## Ready-To-Paste Stitch Prompt

```text
Design the cashier operations portal for "Royal Service Parking", a premium but practical parking reservation and parking-operations system for a single parking facility.

Only design the cashier portal, not the public, user, or admin experiences.

Pages in scope:
- cashier dashboard
- cashier users page
- cashier user details page
- cashier bookings page
- cashier payment page
- cashier receipt page
- cashier notifications page
- cashier parking rate page

Important business rules:
- cashier handles bookings after reservation
- RESERVED bookings can be marked as arrived
- ARRIVED bookings move into payment/completion flow
- COMPLETED bookings expose printable receipt view
- parking rate is read-only for cashier
- operational notifications can include booking and blocklist-related alerts

Use a left-sidebar shell with:
- Dashboard
- Users
- Bookings
- Notifications
- Parking Rate

The portal should feel:
- fast
- operational
- clear
- tablet-friendly
- action-first

Dashboard:
- KPI cards
- quick actions
- panels showing what needs attention now

Users page:
- searchable users table
- quick route into user details

User details page:
- contact info
- vehicle info
- restriction state
- booking context

Bookings page:
- filters for status, date, level/slot, search
- operational table
- clear status badges
- actions for mark arrived, open payment, open receipt, and user details
- strong emphasis on RESERVED and ARRIVED work

Payment page:
- booking summary
- arrival details
- exit preview
- duration breakdown
- rounded-up billing
- minimum 1 hour note
- final cost
- complete-session CTA

Receipt page:
- clean printable receipt
- customer, vehicle, level, slot, time in, time out, duration, hourly rate, final amount

Notifications page:
- operational alert feed
- filter chips like all / booking / blocklist
- visual emphasis for urgent or active items

Parking rate page:
- read-only current hourly rate
- pricing reference note

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
- sidebar
- KPI cards
- operational filter forms
- dense but readable tables
- status badges
- action buttons
- payment summary cards
- print receipt layout
- alert feed cards
- loading, empty, and error states

Show states where relevant:
- loading
- empty
- error
- no results
- action in progress
- completed state

Responsive expectation:
- tablet-first
- usable in portrait and landscape
- action buttons remain easy to tap

Output:
- cashier shell
- key reusable components
- high-fidelity concepts for all listed cashier pages
- responsive notes
```
