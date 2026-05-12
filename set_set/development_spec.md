# Royal Service Parking: Development Specification

This document provides technical specifications for the Royal Service Parking web application. It covers global design tokens, shared components, and detailed page-level requirements for the User, Cashier, and Admin portals.

## 1. Global Design Tokens (Theme)

These tokens must be applied consistently across all portals to maintain brand identity.

| Token | Value | Description |
| :--- | :--- | :--- |
| **Primary** | `#0F4C81` | Royal Blue - Used for primary actions, branding, and active states. |
| **Accent** | `#FFCB05` | Gold - Used for secondary CTAs and highlight elements. |
| **Background** | `#F3F4F6` | Canvas Background - Light grey for high contrast with white surfaces. |
| **Surface** | `#FFFFFF` | Card and section backgrounds. |
| **Text Strong** | `#1F2937` | Primary typography color. |
| **Text Muted** | `#6B7280` | Helper text and secondary labels. |
| **Border** | `#D1D5DB` | Standard divider and input border color. |
| **Success** | `#10B981` | Green - `COMPLETED` status and success alerts. |
| **Danger** | `#EF4444` | Red - `CANCELED`, `BLOCKLISTED`, and destructive actions. |
| **Warning** | `#F59E0B` | Amber - `ARRIVED` status and policy warnings. |
| **Info** | `#3B82F6` | Blue - `RESERVED` status and informational notices. |
| **Font Family** | `Inter, sans-serif` | Clean, highly legible sans-serif. |

---

## 2. Shared Component Library

### 2.1 Navigation Shells
- **User Shell**: Top navigation bar containing Dashboard, Book Parking, My Bookings, Notifications, Profile, and Parking Cost. Includes a user avatar and notification badge.
- **Staff Shell (Cashier/Admin)**: Left sidebar containing role-specific links. Desktop: Persistent. Tablet: Collapsible drawer. Includes a compact brand logo at the top.

### 2.2 Status Badges
Consistent styling for booking and account states:
- `RESERVED`: Info Blue (outlined or light fill).
- `ARRIVED`: Warning Amber.
- `COMPLETED`: Success Green.
- `CANCELED`: Danger Red.
- `NO SHOW`: Danger Red (alt style).
- `BLOCKLISTED`: Danger Red (bold fill).

### 2.3 Data Tables
- **Layout**: Dense but readable rows.
- **Interactions**: Row hover states; right-aligned action buttons or "kebab" menus for row-level operations.
- **Responsiveness**: Convert to stacked "Card" view on mobile/tablet portrait.

---

## 3. Page-Level Specifications

### 3.1 User Portal (Customer Facing)

#### Dashboard (`/user/dashboard`)
- **Header**: Personalized welcome message ("Welcome back, Alexander").
- **Notice Area**: Prominent "Arrival Protocol Notice" card explaining the 1-hour arrival rule.
- **Summary Cards**: Quick view of next upcoming booking (Date, Time, Slot ID).
- **Recent Activity**: Vertical timeline of recent payment and vehicle status updates.

#### Book Parking (`/user/book`)
- **KPIs**: Display Hourly Rate ($15.00), Available Slots, and Booking Window (30 Days Adv.).
- **Form**: Date Picker, Start Time Picker, and Level Selector (VIP, Level 2, Rooftop).
- **Validation**: Prevent booking if user is blocklisted or has an active booking.

#### Select Slot (`/user/select-slot`)
- **Map Interface**: Interactive grid showing Slot IDs. 
- **States**: Available (bordered), Unavailable (greyed out), Selected (Primary Blue/Gold fill).
- **Summary Sidebar**: Real-time cost calculation and "Confirm Reservation" button.

#### My Bookings (`/user/bookings`)
- **Filters**: Status dropdown, Date range, and Search by ID.
- **Record Cards**: Display ID, Date, Schedule, Location, and Cost.
- **Logic**: "Cancel Booking" button visible ONLY for `RESERVED` status.

#### Profile (`/user/profile`)
- **Personal Details**: Form for Full Name, Phone, Email (Read-only), Address.
- **Vehicle Details**: Form for Plate Number, Type (Dropdown), Make/Model, Color.
- **Status Card**: Clear indicator of "Active" vs "Restricted" account status.

---

### 3.2 Cashier Portal (Operations)

#### Dashboard (`/cashier/dashboard`)
- **Live KPIs**: Available, Parked, Reserved, Total Users.
- **Attention Feed**: List of immediate Arrivals and pending Payments with "Process" buttons.
- **Equipment Status**: Monitoring panel for Gates and Pay Stations (Online/Service/Offline).

#### Bookings Manager (`/cashier/bookings`)
- **Filter Suite**: Status (All/Active/Upcoming), Date, Level/Slot, and Search.
- **Actions**:
    - `RESERVED` -> "Mark Arrived"
    - `ARRIVED` -> "Open Payment"
    - `COMPLETED` -> "View Receipt"

#### Payment Collection (`/cashier/bookings/payment`)
- **Calculation Logic**: 
    - Duration = (Departure - Arrival) rounded up to the nearest hour.
    - Cost = Duration * Hourly Rate.
    - Minimum 1-hour billing applies.
- **Action**: "Complete Session & Collect Payment" updates status to `COMPLETED`.

#### Receipt (`/cashier/bookings/receipt`)
- **Print View**: Minimalist, high-contrast black-on-white layout.
- **Contents**: QR Code, Booking ID, Customer/Vehicle details, Timestamps, Duration, and Total Paid.

---

### 3.3 Admin Portal (Management)

#### Admin Dashboard (`/admin/dashboard`)
- **System Health**: Server Uptime (%), API Latency (ms), and Active Terminals count.
- **Alerts Hub**: System-level notifications (e.g., "Gate 3 Sensor Offline").

#### User Management (`/admin/users`)
- **Oversight**: Table showing all registered users with "Verification" and "Restriction" status icons.
- **Bulk Actions**: Export List (CSV), Add User manually.

#### Reports & Analytics (`/admin/reports`)
- **Metrics**: Total Earnings, Completion Rate, Total Volume.
- **Charts**:
    - Revenue & Booking Trends (Area Chart).
    - Vehicle Distribution (Pie/Donut Chart).
- **Export**: PDF and Excel buttons.

#### Blocklist Manager (`/admin/blocklist`)
- **List**: Users restricted due to policy violations (e.g., 3+ No-Shows).
- **Fields**: User Info, Reason, Missed Bookings count, Restriction End Date.
- **Action**: "Unblock Manually" button.

#### Rate Configuration (`/admin/parking-cost`)
- **Interface**: Current Rate display with "Update Hourly Rate" input field.
- **Business Rule**: Updates apply immediately to NEW bookings; existing active sessions use the rate at time of entry.

---

## 4. Development Notes & Constraints

1. **State Persistence**: All role-based shells must check for valid session and role-match before rendering.
2. **Form Validation**: Standard required-field validation for all inputs. Plate numbers must follow `AAA-1234` or similar patterns.
3. **Print Styles**: Ensure `@media print` CSS is applied to the Receipt page to hide navigation and sidebars.
4. **Rounding Logic**: `Math.ceil(minutes / 60)` for billing hours.
5. **Auto-Cancellation**: Background job should transition `RESERVED` to `NO_SHOW` and auto-cancel if vehicle does not arrive within 1 hour of start time.