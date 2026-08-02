---
name: FitMemo
colors:
  surface: '#f9f9f8'
  surface-dim: '#dadad9'
  surface-bright: '#f9f9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#eeeeed'
  surface-container-high: '#e8e8e7'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#424848'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1f0'
  outline: '#727878'
  outline-variant: '#c2c8c7'
  surface-tint: '#516161'
  primary: '#516161'
  on-primary: '#ffffff'
  primary-container: '#e0f2f1'
  on-primary-container: '#5e6f6e'
  inverse-primary: '#b8cac9'
  secondary: '#675d51'
  on-secondary: '#ffffff'
  secondary-container: '#ecddce'
  on-secondary-container: '#6b6155'
  tertiary: '#5f5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#f1eeed'
  on-tertiary-container: '#6d6c6b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e6e5'
  primary-fixed-dim: '#b8cac9'
  on-primary-fixed: '#0e1e1e'
  on-primary-fixed-variant: '#3a4a49'
  secondary-fixed: '#efe0d1'
  secondary-fixed-dim: '#d2c4b5'
  on-secondary-fixed: '#211a11'
  on-secondary-fixed-variant: '#4e453a'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#f9f9f8'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 4px
  margin-page: 20px
  gutter-card: 12px
  padding-element: 16px
  stack-gap: 8px
---

## Brand & Style

The design system is centered on the concept of a "Digital Wellness Journal." It bridges the gap between the tactile, personal nature of a physical notebook and the efficiency of a modern SaaS tool. The aesthetic is clean, airy, and intentionally "human-centric" to reduce the friction and anxiety often associated with fitness tracking.

The design style is a blend of **Soft Minimalism** and **Refined Journaling**. It avoids the aggressive, high-energy visuals of typical fitness apps in favor of a calm, encouraging environment. Key characteristics include:
- **Low-Density Information:** Prioritizing whitespace to allow content to breathe.
- **Human Touch:** Using rounded forms and subtle "hand-drawn" qualities in iconography to feel approachable.
- **Tactile Clarity:** Using thin, deliberate borders instead of heavy shadows to define structure.

## Colors

The palette is anchored by a high-brightness, low-saturation foundation that mimics high-quality paper.

- **Background:** The base surface is `#F9F9F8` (Off-white), providing a softer experience than pure white.
- **Primary (Soft Mint):** Used for "Success" states, active checkboxes, and primary action buttons. It signifies growth and freshness.
- **Secondary (Pale Peach):** Used for highlighting special metrics, secondary tags, or "rest" states.
- **Typography & Strokes:** All text and structural borders use `#1A1A1A`. This "near-black" maintains high legibility while feeling warmer than a true hex-black.
- **Accents:** Use a very light gray (`#EDEDEC`) for secondary card backgrounds and inactive states.

## Typography

This design system uses **Quicksand** across all levels to maintain a friendly, rounded, and cohesive identity. 

- **Hierarchy:** Use weight (Bold vs Medium) rather than size to differentiate hierarchy where possible, keeping the "journal" feel consistent.
- **Readability:** Headlines should have slight negative letter-spacing to feel tighter and more professional. Labels use uppercase with generous letter spacing to act as clear navigational markers without overwhelming the content.
- **Mobile Scale:** On mobile views, the `display` size is reserved for empty states or workout titles only.

## Layout & Spacing

The layout follows a **Fluid Grid** model with high internal padding to simulate the margins of a diary.

- **Safe Zones:** A standard 20px margin is maintained on the left and right of all mobile screens.
- **Rhythm:** An 8px linear scale is used for vertical rhythm, while 4px increments are used for fine-tuning internal component spacing.
- **Container Strategy:** Elements are grouped in full-width containers with soft edges. Avoid complex multi-column layouts on mWeb; stick to a single-column stack for exercise logs to ensure clarity.

## Elevation & Depth

This design system eschews traditional shadows in favor of **Tonal Layering** and **Fine Outlines**.

- **Level 0 (Base):** The `#F9F9F8` background.
- **Level 1 (Cards/Inputs):** Defined by a 1px solid border of `#1A1A1A` with a 10% opacity, or a solid background of `#FFFFFF`.
- **Active State:** When an element is focused or active, the border weight does not change; instead, it gains a subtle 4px "glow" using the Primary Soft Mint color at 30% opacity.
- **Interaction:** Buttons use a "pressed" effect where the element shifts 2px down and right to simulate a physical push, rather than changing elevation via shadows.

## Shapes

The shape language is "Soft and Friendly." 

- **Components:** Standard buttons and cards use `rounded-lg` (16px) to feel substantial but gentle.
- **Interactive Small Elements:** Checkboxes and small tags use a consistent 8px radius.
- **Navigational Elements:** The bottom navigation bar uses a unique top-only `rounded-xl` (24px) radius to create a "cradle" effect for the app's core functions.

## Components

### Buttons
- **Primary:** Filled with `#E0F2F1` (Mint). Text is `#1A1A1A`. 16px border radius. No border.
- **Secondary:** Transparent background with a 1px border of `#1A1A1A` (20% opacity). 

### Input Fields
- **Style:** Light gray background (`#F1F1F0`) with 16px radius. 
- **Focus:** Border becomes 1.5px solid `#1A1A1A`. 
- **Typography:** Placeholder text in 40% opacity of the base text color.

### Exercise Cards & Set Rows
- **Card:** White background, 1px border (`#1A1A1A` at 10% opacity), 16px radius.
- **Set Rows:** Use a horizontal layout with "Input-Label" pairs. Each row is separated by a very faint horizontal line (0.5px).
- **Checkboxes:** Rounded squares (8px) that fill with Soft Mint and a checkmark icon upon completion.

### Status Tags
- **Style:** Small, pill-shaped (`rounded-xl`).
- **Coloring:** Use the Secondary Pale Peach for "Warm-up" and Primary Soft Mint for "PR" or "Personal Best."

### Bottom Navigation
- **Structure:** Floating or docked bar with a 24px top-radius. Icons are linear (1.5pt stroke). Active state indicated by a small Mint dot below the icon.

### Empty States
- **Visuals:** Use simple, hand-drawn style line illustrations (e.g., a sleeping kettlebell or a blank notebook page).
- **Text:** Centered `headline-md` followed by a gentle call-to-action button.