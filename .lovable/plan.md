

# Vibrant Techy Background for Login Page

## What Changes
Add a subtle, animated tech-inspired background to the AuthPage while keeping the login card exactly as-is. The background will feature:

- **Animated gradient mesh**: Soft radial gradients in cyan (`#00D4FF` at ~5% opacity) and purple (`#8B5CF6` at ~4% opacity) that slowly drift
- **Subtle grid pattern**: A faint dot-grid overlay (`#1E2535` at ~30% opacity) giving a "blueprint" / circuit-board feel
- **Floating geometric shapes**: 3-4 very subtle hexagon outlines (matching CATI brand) slowly rotating/floating with CSS keyframe animations, in `#00D4FF` at ~6% opacity

The overall feel stays dark and minimal — no clutter, just enough visual depth to feel modern and techy.

## File: `src/pages/AuthPage.tsx`

### Background Layer (behind login card)
- Replace the plain `#07090F` div with a wrapper containing:
  1. Base layer: `#07090F` solid background
  2. CSS radial gradients for the color mesh (two overlapping radial-gradient layers)
  3. A CSS `background-image` repeating dot-grid pattern
  4. Absolutely-positioned SVG hexagon shapes with CSS `@keyframes` for slow float/rotation
- Login card div remains completely untouched

### CSS Animations (inline or in index.css)
- `@keyframes float` — gentle Y translate + slight rotation over 20s
- `@keyframes pulse-glow` — opacity oscillation on gradient blobs over 8s

## Technical Details

```text
┌──────────────────────────────────┐
│  Background layers (absolute)    │
│  ┌────────────────────────────┐  │
│  │ Radial gradient blob 1     │  │
│  │ (cyan, top-left, 5% op)   │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ Radial gradient blob 2     │  │
│  │ (purple, bottom-right, 4%) │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ Dot grid overlay (30% op)  │  │
│  └────────────────────────────┘  │
│  ┌──────┐  ┌──────┐             │
│  │ hex1 │  │ hex2 │  (floating) │
│  └──────┘  └──────┘             │
│                                  │
│      ┌──────────────────┐        │
│      │   Login Card     │        │
│      │   (unchanged)    │        │
│      └──────────────────┘        │
└──────────────────────────────────┘
```

### Files Modified
1. `src/pages/AuthPage.tsx` — add background layers and floating SVG hexagons
2. `src/index.css` — add `@keyframes` for float and glow animations

