# Royal Service Parking UI/UX Design Standards

This document defines the target UI and interaction standards for the Royal Service Parking frontend rebuild.

The rebuild target is a plain JavaScript frontend, not a Thymeleaf redesign. The backend remains Spring Boot and continues to own business rules, security, data persistence, scheduled jobs, and reporting logic.

The UI must support four experiences:

- Public / guest entry
- Registered user booking experience
- Cashier operations portal
- Admin management portal

## 1. Design Principles

- Premium and trustworthy: the product handles real parking operations and should feel reliable, calm, and professional
- Role-centric: customer flows should feel guided and simple, while cashier and admin screens should be dense, efficient, and readable
- Responsive by default: desktop-first for admin, tablet-first for cashier, mobile-first discipline for public and user flows
- Accessible by default: keyboard-focus visibility, readable contrast, clear status communication, and large-enough touch targets
- Component-driven: build the interface from shared tokens and reusable modules instead of page-specific one-off styles
- Plain JavaScript friendly: interactions should be implementable with HTML, CSS, and ES modules without framework-specific assumptions

## 2. Frontend Technology Expectations

- Use semantic HTML
- Use plain JavaScript with ES modules
- Use shared CSS tokens and component classes before page-specific overrides
- Avoid inline styles except where a runtime-calculated style is genuinely necessary
- Avoid inline `onclick` and similar HTML event attributes
- Prefer progressive hydration of page modules over giant all-page scripts

## 3. Brand and Visual Direction

The product should present itself as a premium operational service, not a consumer gimmick. Visual choices should feel clean, controlled, and slightly elevated.

### Brand Colors

- Primary: `#0F4C81` for primary actions, strong highlights, active navigation
- Secondary: `#FFCB05` for accents, highlights, and emphasis
- Canvas Background: `#F3F4F6` for app surfaces
- Surface: `#FFFFFF` for cards, forms, dialogs, and tables
- Strong Text: `#1F2937`
- Muted Text: `#6B7280`
- Border: `#D1D5DB`

### Status Colors

- Success: `#10B981`
- Danger: `#EF4444`
- Warning: `#F59E0B`
- Info: `#3B82F6`
- Neutral Dark: `#374151`

### Role Accent Use

- Public/User screens may use more spacious layouts and stronger brand storytelling
- Cashier screens should prioritize speed, contrast, and action visibility
- Admin screens should prioritize density, hierarchy, filters, and scanning efficiency

## 4. Design Tokens

Create and use shared CSS custom properties before styling pages directly.

### Spacing Scale

- `4px`
- `8px`
- `12px`
- `16px`
- `24px`
- `32px`
- `48px`
- `64px`

### Radius Scale

- `4px` for inputs and compact buttons
- `8px` for cards and standard buttons
- `12px` for larger cards and modals

### Shadow Scale

- subtle card shadow: `0 4px 6px rgba(0, 0, 0, 0.05)`
- raised panel shadow: `0 10px 30px rgba(15, 76, 129, 0.12)`
- modal shadow: `0 20px 50px rgba(0, 0, 0, 0.18)`

### Z-Index Expectations

- sticky header / sidebar layer
- dropdown layer
- toast layer
- modal backdrop layer
- modal content layer

Define explicit token values in the frontend stylesheet instead of hardcoding them repeatedly.

## 5. Typography

Use one agreed font stack across the rebuild. Default recommendation:

```css
font-family: "Inter", "Segoe UI", system-ui, sans-serif;
```

Type rules:

- `h1`: strong, high emphasis, used once per page
- `h2`: section title
- `h3`: card or subsection title
- body text: `16px` default
- compact table text: `14px`
- helper/meta text: `12px` to `14px`

Use bold type sparingly and intentionally. Staff screens should use clearer spacing and alignment rather than heavy text everywhere.

## 6. Responsive Layout Standards

Use consistent breakpoints:

- mobile: `0px` to `767px`
- tablet: `768px` to `1023px`
- desktop: `1024px` and above
- wide desktop: `1280px` and above

Layout expectations:

- Public and user screens should collapse cleanly to one-column mobile layouts
- Cashier screens must remain usable on tablets in portrait and landscape
- Admin tables may scroll horizontally on smaller widths, but filters and primary actions must remain reachable
- Sidebars may collapse into a drawer below desktop

## 7. Shared Components

All role experiences should be composed from reusable patterns.

### Buttons

- Primary button: royal blue background, white text
- Secondary button: white or transparent background with royal blue border and text
- Danger button: red background, white text
- Ghost button: low-emphasis action for utility tasks
- Disabled buttons: reduced opacity, no hover affordance, `not-allowed` cursor

Buttons should support:

- default
- hover
- focus-visible
- active
- disabled
- loading

### Inputs and Form Fields

- labels sit above inputs
- use clear required-state notation
- support text, email, password, select, date, time, textarea, checkbox, and radio styles
- validation text should appear below the field
- error states must be visible without relying on color alone

Long forms like registration and booking should be grouped into logical sections:

- account information
- personal details
- vehicle details
- booking details

### Status Badges

Provide reusable badge variants for:

- `RESERVED`
- `ARRIVED`
- `COMPLETED`
- `CANCELED`
- `NO_SHOW`
- `BLOCKLISTED`
- generic info, success, warning, and neutral states

Badges should remain readable on both light surfaces and dense data tables.

### Cards and Panels

Use cards for:

- KPI summaries
- profile sections
- booking summaries
- rate display
- warnings and notices

Cards should define consistent padding, heading spacing, and empty-state behavior.

### Tables

Tables are critical in cashier and admin views. Standardize:

- sticky header when useful
- compact row height for operations screens
- visible sort and filter alignment
- badge-friendly columns
- action column patterns
- empty-state row treatment

When a table becomes unusable on smaller screens, switch to a stacked-card list rather than squeezing columns indefinitely.

### Navigation

Public/user navigation:

- clean top navigation
- clear login and booking entry points
- mobile menu support

Cashier/admin navigation:

- persistent sidebar on desktop
- collapsible sidebar or drawer on smaller widths
- active route indicator
- user menu with profile/logout actions

### Alerts and Toasts

Use:

- in-page alerts for persistent warnings or policy notices
- toast notifications for temporary success or utility feedback

Toasts should include:

- icon
- title
- short message
- dismiss control

### Modals and Confirmations

Use modals for destructive or high-impact actions only, such as:

- cancel booking
- unblock user
- complete payment/session

Modals must trap focus, support keyboard dismissal when appropriate, and make the primary action unmistakable.

## 8. Booking and Operations UX Rules

### Booking Flow

- Show current parking rate and availability context before slot selection
- Keep date, time, level, slot, and vehicle information visually distinct
- Show no-show policy clearly before confirmation
- Present a concise confirmation summary before final submission

### Slot Selection

- Available slots should be immediately scannable
- Unavailable slots must be clearly disabled
- Selected slot state must be unmistakable
- Show selected date, scheduled time, and level persistently during selection

### Cashier Operations

- Prioritize `RESERVED`, `ARRIVED`, and action-ready bookings
- Surface time-sensitive bookings visually
- Make `Mark Arrived`, `Complete`, and `Open Receipt` actions obvious
- Keep filters fast to scan and easy to reset

### Admin Operations

- Prioritize searchable data grids and dashboard summaries
- Place exports, filters, and rate management in predictable areas
- Keep blocklist and reporting screens explicit about dates, reasons, and status definitions

## 9. States Every Screen Must Handle

Each page or component should be designed for:

- loading
- empty
- error
- success
- permission denied or role mismatch where applicable
- no results after filtering/search

Do not leave these states to ad hoc implementation.

## 10. Accessibility Baseline

- meet readable color contrast
- visible `:focus-visible` styling on all interactive elements
- keyboard access for navigation, dialogs, menus, and forms
- proper labels for form controls
- semantic headings and landmarks
- status changes should be announced where practical for assistive tech
- print receipt view should remain readable without color dependence

## 11. Print and Receipt Standards

Receipt and report print views should:

- use white background and dark text
- remove decorative navigation and controls
- preserve booking, pricing, and timestamp clarity
- fit cleanly on common paper sizes

## 12. CSS Organization Rules

Recommended style layering:

1. design tokens
2. reset/base
3. layout primitives
4. shared components
5. role-specific screens
6. utility overrides

Avoid giant role-specific CSS files that repeat button, form, and card definitions already covered by shared styles.

## 13. JavaScript Interaction Rules

- Use small page controllers or modules per route
- Keep API calls inside service modules, not directly inside every event handler
- Keep DOM query selectors local and explicit
- Prefer event delegation for repeated list actions where appropriate
- Use clear loading and disabled states during async actions
- Always handle API failure visibly

## 14. Definition of UI Done

A rebuilt screen is only considered done when it:

- matches the visual standards in this document
- uses shared tokens and reusable components where appropriate
- works on its target device sizes
- handles loading, empty, and error states
- respects role-specific behavior
- does not rely on legacy Thymeleaf rendering assumptions
