# Royal Service Parking Stitch Prompt: Admin

## Purpose

Use this prompt when generating only the admin management and reporting portal for Royal Service Parking.

## Product Context

Royal Service Parking includes an admin workspace for oversight across users, bookings, pricing, restrictions, and reporting.

This is a management and analytics interface. It should feel denser and more data-driven than the customer portal, while still sharing the same product identity.

## Admin Experience Goals

- Make management views easy to scan
- Support strong filtering and oversight
- Keep reports and exports prominent but structured
- Present pricing and restriction controls clearly
- Feel reliable and analytical without looking generic

## Business Rules The Design Must Respect

- Admin oversees users, bookings, pricing, restrictions, and reports
- Admin can update current hourly parking rate
- Admin can review and manually remove blocklists
- Manual blocklist-add flow is not guaranteed first-pass scope, so do not assume it is a required screen
- Reports include completed bookings, earnings, completion rate, no-show counts, and export actions
- This remains a single-facility system

## Routes In Scope

- `/admin/dashboard`
- `/admin/users`
- `/admin/users/detail`
- `/admin/bookings`
- `/admin/parking-cost`
- `/admin/blocklist`
- `/admin/reports`

## Admin Shell

Use a left-sidebar shell with:

- Dashboard
- Users
- Bookings
- Parking Rate
- Blocklist
- Reports

Shell requirements:

- Persistent sidebar on desktop
- Strong page headers
- KPI-friendly content framing
- Space for dense tables and filter bars

## Visual Direction

- Denser and more analytical than user pages
- Clean management look
- Serious and readable
- Data-heavy without clutter
- Strong hierarchy for filters, KPIs, and results

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

- Admin sidebar
- KPI cards
- Filter bars
- Search inputs
- Data tables
- Status badges
- Management forms
- Reports panels
- Export buttons
- Loading, empty, and error states

## Page Inventory And Structure

### 1. Admin Dashboard

Purpose:

- High-level overview

Structure:

- KPI row
- quick links
- system or operational overview panels

Suggested KPIs:

- total users
- reserved
- available
- parked

### 2. Admin Users Page

Purpose:

- Search and oversee customer accounts

Structure:

- search/filter bar
- results table

Useful columns:

- user name
- email
- vehicle summary
- verification status
- restriction state
- action to open details

### 3. Admin User Details Page

Purpose:

- Full customer record review

Structure:

- summary card
- contact details
- vehicle details
- verification status
- blocklist / restriction summary
- missed-booking summary
- booking context summary

### 4. Admin Bookings Page

Purpose:

- Oversight across system bookings

Structure:

- filter bar
- result counts or KPI strip
- oversight table

Filters:

- status
- date
- user
- slot / level
- search

Table emphasis:

- clear status visibility
- user and slot context
- high scanability

### 5. Admin Parking Rate Page

Purpose:

- Manage the current hourly parking rate

Structure:

- current rate summary
- update form
- impact note

Important messaging:

- rate affects current calculation logic
- keep management simple and explicit

### 6. Admin Blocklist Page

Purpose:

- Review and manage restricted users

Structure:

- summary panel
- blocklist table

Important fields:

- user
- reason
- restriction until date
- missed-booking count
- status

Primary action:

- manual unblock

Important note:

- Do not assume manual blocklist-add is a required main-page flow

### 7. Admin Reports Page

Purpose:

- Booking and earnings analytics

Structure:

- report filter panel
- export controls
- KPI cards
- analytics panels

Filters:

- start date
- end date
- group by day / week / month

KPIs:

- completed bookings
- total earnings
- completion rate
- no-show bookings

Panels:

- booking trend
- earnings trend
- vehicle type distribution
- booking status distribution

Actions:

- export Excel
- export PDF

## States To Include

- loading
- empty
- error
- no results after filtering
- success state after rate update or unblock action

## Responsive Expectations

- Desktop-first
- Tablet usable
- Tables can scroll horizontally, but filters and actions must remain reachable
- Use stacked cards when necessary rather than crushing columns

## Ready-To-Paste Stitch Prompt

```text
Design the admin management and reporting portal for "Royal Service Parking", a premium but practical parking reservation and parking-operations system for a single parking facility.

Only design the admin portal, not the public, user, or cashier experiences.

Pages in scope:
- admin dashboard
- admin users page
- admin user details page
- admin bookings page
- admin parking rate page
- admin blocklist page
- admin reports page

Important business rules:
- admin oversees users, bookings, pricing, restrictions, and reports
- admin can update the current hourly parking rate
- admin can review and manually remove blocklists
- manual blocklist-add is not guaranteed first-pass scope, so do not assume it is a required core screen
- reports include completed bookings, earnings, completion rate, no-show counts, and export actions
- this is a single-facility system

Use a left-sidebar shell with:
- Dashboard
- Users
- Bookings
- Parking Rate
- Blocklist
- Reports

The portal should feel:
- analytical
- dense
- serious
- readable
- management-focused

Dashboard:
- KPI cards
- quick links
- overview panels

Users page:
- searchable management table
- verification and restriction visibility
- route into detailed user view

User details page:
- full customer record
- contact details
- vehicle details
- verification state
- restriction state
- missed-booking summary
- booking context summary

Bookings page:
- filters by status, date, user, slot or level, and search
- oversight table
- strong status visibility
- high scanability

Parking rate page:
- current hourly rate card
- rate update form
- note explaining pricing impact

Blocklist page:
- blocklisted users table
- reason
- restriction-until date
- missed-booking count
- manual unblock action
- do not assume manual blocklist-add is a required first-pass core screen

Reports page:
- start date and end date filters
- day/week/month grouping
- KPI summaries
- booking trend
- earnings trend
- vehicle type distribution
- booking status distribution
- export Excel
- export PDF

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
- filter bars
- search inputs
- data tables
- status badges
- management forms
- reports panels
- export buttons
- loading, empty, and error states

Show states where relevant:
- loading
- empty
- error
- no results
- success state after management actions

Responsive expectation:
- desktop-first
- tablet usable
- filters and export controls remain reachable
- use stacked cards when tables become too cramped

Output:
- admin shell
- key reusable components
- high-fidelity concepts for all listed admin pages
- responsive notes
```
