---
name: Royal Service Public System
colors:
  surface: '#FFFFFF'
  surface-dim: '#d9dadf'
  surface-bright: '#f9f9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f8'
  surface-container: '#ededf3'
  surface-container-high: '#e7e8ed'
  surface-container-highest: '#e2e2e7'
  on-surface: '#191c1f'
  on-surface-variant: '#42474f'
  inverse-surface: '#2e3034'
  inverse-on-surface: '#f0f0f5'
  outline: '#727780'
  outline-variant: '#c2c7d1'
  surface-tint: '#2d6197'
  primary: '#00355f'
  on-primary: '#ffffff'
  primary-container: '#0f4c81'
  on-primary-container: '#8ebdf9'
  inverse-primary: '#a0c9ff'
  secondary: '#745b00'
  on-secondary: '#ffffff'
  secondary-container: '#ffcb09'
  on-secondary-container: '#6f5700'
  tertiary: '#532800'
  on-tertiary: '#ffffff'
  tertiary-container: '#743b00'
  on-tertiary-container: '#f9a767'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#07497d'
  secondary-fixed: '#ffe08d'
  secondary-fixed-dim: '#f2c000'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#F3F4F6'
  on-background: '#191c1f'
  surface-variant: '#e2e2e7'
  text-strong: '#1F2937'
  text-muted: '#6B7280'
  border: '#D1D5DB'
  success: '#10B981'
  danger: '#EF4444'
  warning: '#F59E0B'
  info: '#3B82F6'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-desktop: 2.5rem
  margin-mobile: 1rem
  section-padding: 4rem
---

# Royal Service Parking Design System: Public & Shared Auth

## Visual Identity
- **Primary Brand Color**: #0F4C81 (Royal Blue) - Premium, trustworthy, stable.
- **Accent Color**: #FFCB05 (Gold) - Used for primary CTAs and highlights.
- **Background**: #F3F4F6 (Light Gray) - Clean canvas.
- **Surface**: #FFFFFF (White) - Card and section backgrounds.
- **Typography**: Professional sans-serif (Inter or similar).
  - Strong Text: #1F2937
  - Muted Text: #6B7280
- **Borders**: #D1D5DB
- **Status Colors**:
  - Success: #10B981
  - Danger: #EF4444
  - Warning: #F59E0B
  - Info: #3B82F6

## Layout & Shell
- **Public Shell**: Top navigation with logo, primary navigation links (Home, Register), and a secondary "Login" button. Standard footer with sitemap and brand info.
- **Auth Shell**: Split layout for major forms (Login, Register). Left side contains brand storytelling/context; right side contains the form card.
- **Spacing**: Generous whitespace to feel premium and spacious.

## Components
- **Buttons**:
  - Primary: Solid #FFCB05 with #1F2937 text.
  - Secondary: Outlined #0F4C81.
  - Ghost: Text-only with hover states.
- **Forms**: Clean inputs with #D1D5DB borders, active #0F4C81 focus states, and clear label hierarchy.
- **Cards**: Soft shadows, rounded corners (8px), white background.
- **Status Badges**: Rounded, low-opacity backgrounds with high-contrast text.
- **Alerts**: Full-width or inline banners for system feedback (e.g., "Email verified").