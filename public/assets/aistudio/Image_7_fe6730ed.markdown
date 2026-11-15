---
name: TeamForge Synapse
colors:
  surface: '#0e1323'
  surface-dim: '#0e1323'
  surface-bright: '#34394a'
  surface-container-lowest: '#080d1d'
  surface-container-low: '#161b2b'
  surface-container: '#1a1f30'
  surface-container-high: '#25293a'
  surface-container-highest: '#2f3446'
  on-surface: '#dee1f9'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#dee1f9'
  inverse-on-surface: '#2b3041'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0e1323'
  on-background: '#dee1f9'
  surface-variant: '#2f3446'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  code-tag:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  code-stat:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the high-velocity, precision-engineered world of competitive hackathons and collaborative software ventures. Merging the focused utility of Linear, the optical precision of Vercel, and the expressive kinetic craft of Framer, it creates an immersive workspace for world-class developers, designers, and founders.

The experience evokes high agency, technological speed, and frictionless assembly. Every interaction feels sharp, instantaneous, and purposeful. The aesthetic sits at the intersection of technical minimalism and futuristic developer dark mode, relying on deep abyssal space, finely calibrated translucent planes, and directional neon luminescence rather than decorative clutter.

## Colors

The palette is engineered specifically for deep-mode interfaces, centering around optical luminescence against an abyssal base.

- **Primary Canvas (`#0B1020`):** The foundational substrate. Deep void navy that reduces eye strain during prolonged sessions and provides high dynamic range for luminous accents.
- **Surface Elevation (`#111827` to `#1E293B`):** Multi-tier containment planes layered with 5% to 8% white alphas for structural depth.
- **Primary Energy (`#8B5CF6` / `#7C3AED`):** Electric Violet driving key user directives, team matchmaking signals, and interactive focal points.
- **Secondary Telemetry (`#06B6D4` / `#22D3EE`):** Cyan highlights reserved for live signals, algorithmic fit indicators, and micro-metrics.
- **State Semantics:**
  - Emerald (`#10B981`): Synchronous readiness, verified skills, and matchmaking success.
  - Amber (`#F59E0B`): Hackathon milestone countdowns, submissions closing soon.
  - Rose (`#F43F5E`): Hard deadlines, missing critical role alerts, and high-priority system actions.
- **Typography Contrast:** Crisp snow (`#F8FAFC`) on primaries; slate tiers (`#94A3B8`, `#64748B`) for context, secondary metadata, and structural delimiters.

## Typography

The typographic hierarchy establishes distinct roles across three typefaces:

1. **Plus Jakarta Sans (Headings & Display):** Modern, geometric, and high-impact. Provides structured authority for primary section titles and milestone banners without sacrificing modern friendliness.
2. **Inter (Interface & Body Text):** The universal workhorse for interface scannability, forms, team descriptions, and dynamic lists.
3. **JetBrains Mono (Telemetry & Badges):** Dedicated to technical metadata, stack tags (`Rust`, `Next.js`, `Solidity`), live latency indicators, match percentages, and timestamp metrics.

Always maintain tight tracking (`letterSpacing: -0.02em` to `-0.03em`) on large display items to replicate the precise density of developer-focused software.

## Layout & Spacing

The layout is structured upon a responsive 12-column fluid grid designed for dashboard density and rapid horizontal scannability:

- **Mobile (< 768px):** 4-column flow, `1rem` edge margin, single-card stack.
- **Tablet (768px - 1024px):** 8-column layout, `2rem` margin, bifurcated team and matchmaking panels.
- **Desktop (1024px+):** 12-column grid capped at `1440px` max-width, `3rem` margins, allowing multi-pane terminal navigation, filtering ribbons, and live participant feeds.

Vertical rhythm relies strictly on standard modular scaling (4px base factor). Dense technical panels utilize `space-sm` and `space-md` gaps, while higher-level views step outward to `space-lg` and `space-xl` for visual respiration.

## Elevation & Depth

Depth is defined through optical luminescence and translucent material tiers rather than drop shadows:

1. **Base Layer:** Canvas tone `#0B1020` with an underlying radial conic mesh of subtle purple and cyan glows (`opacity: 0.08`).
2. **Surface Tier (Glass Panels & Cards):** Background composed of `rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.06)`, filtered with `backdrop-filter: blur(16px)`. Border profile consists of a crisp, 1px perimeter stroke of `rgba(255, 255, 255, 0.08)`.
3. **Floating Overlays & Modals:** Elevated containers use `rgba(17, 24, 39, 0.85)` surface fill, combined with high-radius ambient shadows (`box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6)`) and a subtle top-edge rim-light gradient (`linear-gradient(to right, rgba(139, 92, 246, 0.3), rgba(34, 211, 238, 0.1), transparent)`).
4. **Interactive Glows:** Focused elements emanate an outer bloom: `box-shadow: 0 0 20px rgba(139, 92, 246, 0.25)`.

## Shapes

The geometry strikes a deliberate balance between technical rigidity and modern software refinement.

- **Base Radius (0.5rem / 8px):** Input fields, inline code snippets, dropdown menus, and standard utility controls.
- **Container Radius (1rem / 16px):** Project cards, participant profiles, team configuration modules, and dialogs.
- **Feature Radius (1.5rem / 24px):** Key highlight hero banners and matching radar visualizers.
- **Pill Geometry (9999px):** Status chips, skill badges, live connection markers, and key CTA action triggers.

## Components

### Buttons
- **Primary Pill Action:** Violet gradient (`linear-gradient(135deg, #8B5CF6, #7C3AED)`), white bold typography, rounded-full geometry, with a micro-glow border (`0 0 12px rgba(139, 92, 246, 0.4)`).
- **Secondary Ghost:** Transparent fill, `1px solid rgba(255, 255, 255, 0.12)`, text `#F8FAFC`. On hover, surface shifts to `rgba(255, 255, 255, 0.06)` with border brightening to `rgba(255, 255, 255, 0.25)`.
- **Destructive/Urgent:** Subtle `rgba(244, 63, 94, 0.1)` base, rose text (`#F43F5E`), with rose boundary glow on focus.

### Tags & Developer Badges
- Displayed using **JetBrains Mono** at `12px`.
- Solid `rgba(255, 255, 255, 0.04)` fill with hairline border `rgba(255, 255, 255, 0.08)`.
- Technology classifications (e.g., `TypeScript`, `PyTorch`) feature a micro dot indicator (cyan `#22D3EE` or emerald `#10B981`) preceding the label.

### Matchmaking & Project Cards
- Crafted with backdrop glass (`bg-white/5`, `border-white/10`, `backdrop-blur-md`).
- Incorporates an ultra-subtle directional gradient border: light source originating from top-left.
- Dynamic match-score ring: circular SVG metric with glowing `#8B5CF6` / `#22D3EE` dual-stop progress stroke.

### Input Fields & Controls
- Low-profile inputs: solid `#111827` surface with an inset border `#334155`.
- Active focus state overrides border with `#8B5CF6` paired with an external `0 0 0 3px rgba(139, 92, 246, 0.15)` ring.
- Checkboxes and radios leverage custom geometric frames with smooth scale transitions and cyan accent fills.

### Live Radar & Telemetry Components
- Match-engine visualization components incorporate pulsing concentric rings with a revolving radial sweep gradient in faded violet-to-transparent tones, displaying real-time peer discovery.