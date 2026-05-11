# Royal Service Parking Stitch Prompt: Public

## Purpose

Use this prompt when generating only the public-facing and shared-auth experience for Royal Service Parking.

This prompt covers:

- homepage
- shared login
- register
- verification
- forgot password
- reset password
- status / confirmation screens

## Product Context

Royal Service Parking is a parking reservation and parking-operations system for a single parking facility.

This public experience is the front door to a role-based platform with:

- guests
- registered customers
- cashiers
- administrators

The public side should explain the service clearly, guide customers into registration and login, and provide visible access points for cashier and admin users without making the public site feel like a staff portal.

## Public Experience Goals

- Establish trust immediately
- Present the product as premium, reliable, and operationally serious
- Make the advance-booking flow easy to understand
- Make account creation and verification feel guided
- Keep staff entry points visible but secondary to the customer journey
- Make the shared login understandable even though role routing happens after authentication

## Core Business Rules The Design Must Respect

- Customers must register before booking
- Customer email verification is required before login
- Booking is advance reservation, not walk-in discovery
- No-show after 1 hour can lead to temporary restriction
- Login is shared, but the backend routes authenticated users to the correct role workspace
- This is a single parking facility, not a multi-branch app

## Routes In Scope

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

Important note:

- `/login/user`, `/login/cashier`, and `/login/admin` are compatibility or hint routes
- `/login` is the primary shared login page

## Shell Structure

### Public Shell

- Top navbar
- Hero-led layout
- Footer
- Spacious content sections
- Strong CTA hierarchy
- Public-safe visual tone

Navigation should include:

- Home
- Login
- Register
- Optional direct cashier/admin access links

## Visual Direction

- Premium and trustworthy
- Calm and polished
- Clean service-brand look
- Strong hierarchy without looking corporate-heavy
- More spacious than cashier/admin screens

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

- Public top navbar
- Footer
- Hero CTA buttons
- Auth layout
- Multi-section form layout
- Inline validation
- Status / confirmation page pattern
- Alerts for error, logout, verification, and reset outcomes

## Page Inventory And Structure

### 1. Home Page

Purpose:

- Introduce the service
- Explain advance booking
- Separate customer access from staff access

Structure:

- Top navigation
- Hero section
- Brand statement
- Main CTA for advance booking
- Secondary CTA for login
- Optional cashier shortcut
- Highlights / trust indicators
- Policy reminder card
- Entry cards for:
  - register
  - customer login
  - cashier access
  - admin access
- Footer

Messaging emphasis:

- Reserve before you arrive
- Verified account required
- No-show and one-hour arrival rule should be visible
- Staff and management access remain separate from customer experience

### 2. Shared Login Page

Purpose:

- One login page for all roles
- Explain that the system resolves the correct workspace after sign-in

Structure:

- Public top nav
- Split auth layout
- Left story / explanation panel
- Right login card

Form fields:

- Email or username
- Password

Role-aware states:

- default
- user hint
- cashier hint
- admin hint

Support links:

- Forgot password
- Create account
- Back to home

Visible feedback states:

- invalid credentials
- signed out
- password reset completed

### 3. Register Page

Purpose:

- Customer onboarding

Structure:

- Left contextual panel
- Right elevated registration card
- Long structured form

Form sections:

- Account information
  - full name
  - email
  - password
  - confirm password
- Personal details
  - date of birth
  - phone number
  - gender
  - address
- Vehicle details
  - plate number
  - vehicle type
  - vehicle model
  - vehicle color
- confirmation checkbox

Supporting content:

- Password strength indicator
- Email verification warning
- Clear next-step explanation

### 4. Register Success Page

Purpose:

- Confirm account creation request
- Direct user to verify email

Structure:

- Clean status page
- Success icon
- Main message
- Optional email-specific note
- CTA to login
- CTA back to home

### 5. Verify Result Page

Purpose:

- Show verification success or failure

Structure:

- Status layout
- Token result message
- Recovery guidance for invalid or expired verification
- CTA back to login or home

### 6. Forgot Password Page

Purpose:

- Start password recovery

Structure:

- Shared auth shell
- Recovery explanation panel
- Email form
- Submit CTA

### 7. Forgot Password Confirmation Page

Purpose:

- Confirm reset instructions were sent if valid

Structure:

- Informational status page
- Inbox and spam reminder
- CTA back to login
- CTA back to home

### 8. Reset Password Page

Purpose:

- Let customer update password using reset token

Structure:

- Auth layout
- Reset card
- Password field
- Confirm password field
- Token validation area
- Submit CTA

### 9. Reset Success Page

Purpose:

- Confirm password update

Structure:

- Success status page
- Return-to-login CTA

## States To Include

- loading
- success
- inline validation error
- backend error
- invalid token
- expired token
- signed out state
- no-email-match safe confirmation state for forgot password

## Responsive Expectations

- Mobile-first
- Clear stacked auth forms on smaller screens
- Hero and content sections should collapse cleanly
- Long registration form should remain readable and sectioned on mobile

## Ready-To-Paste Stitch Prompt

```text
Design the public-facing and shared-auth experience for "Royal Service Parking", a premium but practical parking reservation and parking-operations system for a single parking facility.

This is the front door of a role-based platform with guests, registered customers, cashiers, and administrators. The public side should feel polished, trustworthy, and easy to understand, while still showing that the system supports real parking operations behind the scenes.

Only design the public and shared-auth pages:
- home page
- shared login page
- register page
- register success page
- verify result page
- forgot-password page
- forgot-password confirmation page
- reset-password page
- reset-success page

Important product rules:
- customers must register before booking
- verified email is required before customer login
- booking is for advance reservation
- no-show after 1 hour can lead to temporary restriction
- login is shared, but backend routes users to the correct role workspace after authentication
- this is a single parking facility, not a multi-location app

The main public shell should have:
- top navbar
- premium hero section
- strong CTA hierarchy
- footer
- spacious and mobile-friendly layout

The home page should include:
- brand-led hero
- explanation of advance booking
- trust or service highlights
- visible no-show policy reminder
- role entry cards for register, customer login, cashier access, and admin access

The shared login page should use one login form for all roles, but include role-aware hints for:
- customer
- cashier
- admin

The backend decides the final destination after login, so the UI must explain that clearly.

The register page should be a long structured onboarding form with sections for:
- account information
- personal details
- vehicle details

Registration fields:
- full name
- email
- password
- confirm password
- date of birth
- phone number
- gender
- address
- plate number
- vehicle type
- vehicle model
- vehicle color

Include:
- password strength indicator
- inline validation
- email verification warning

The status pages should use a reusable confirmation pattern for:
- register success
- verify result
- forgot-password confirmation
- reset success

The reset-password page should include:
- password
- confirm password
- reset token outcome handling

Visual direction:
- premium and trustworthy
- calm and clean
- polished but not flashy
- more spacious than admin or cashier screens

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

Show states where relevant:
- loading
- success
- validation error
- backend error
- invalid or expired token
- signed-out message

Responsive expectation:
- mobile-first
- auth forms stack cleanly
- long registration flow remains easy to scan on small screens

Output:
- public design system direction
- public shell
- shared auth shell
- high-fidelity concepts for each page listed above
- key reusable components
- responsive notes
```
