
# Landing Page + Palette Refresh

## Overview
Port the uploaded HTML mock into a React landing page at `/`, move the dashboard to `/dashboard`, and roll the new "Forest + Lime + Cream" palette and Lora/DM Sans typography across the existing app.

## Palette & Typography
New tokens (replace current lime-on-cream values):

```text
--green-dark   #1A4731   (sidebar, headings on light bg)
--green-mid    #2D6A4F   (secondary surfaces, gradients)
--green-light  #3D8C68
--lime         #76B041   (primary action / accent)
--lime-bright  #9CCC4A   (hover, highlights)
--cream        #F5F6F0   (page bg)
--white        #FFFFFF   (card surface)
--charcoal     #1C1F1A   (body text)
--muted        #5A6358
--border       #D4DCCE
```
Fonts: `Lora` (600/700) for headings, `DM Sans` (300–600) for body.

## Routing changes (`src/App.tsx`)
- `/` → new public `LandingPage` (no auth required, no AppLayout)
- `/dashboard` → existing DashboardPage (Protected + AppLayout)
- All other protected routes unchanged
- Sign-In CTAs link to `/auth`; after login, redirect target becomes `/dashboard`

## New file: `src/pages/LandingPage.tsx`
Faithful React port of the uploaded HTML, broken into sections:
1. Fixed top nav (forest bg, lime "Sign In" pill linking to `/auth`)
2. Hero with badge, Lora headline, sub copy, primary + secondary CTAs, floating decorative rings, floating glassmorphic mock dashboard card on the right
3. Stats band (5 stats on green-mid)
4. Features grid (6 cards on white)
5. How It Works (3 numbered steps with connector line)
6. Roles (3 cards on green-dark)
7. CTA banner with gradient
8. Footer
- Uses `CatiLogo` (light variant) in nav/footer instead of the "E" tile
- Lucide icons replace emoji where it improves polish (keep emoji for role/feature accents per mock)
- Section animations via existing `fadeUp` keyframe added to `index.css`

## Theme rollout

### `src/index.css`
- Add `Lora` + `DM Sans` to the Google Fonts import
- Update `:root` HSL tokens to the new palette (background = cream, primary = lime, sidebar-background = green-dark, etc.)
- Update `.status-in-progress` accent to lime; keep other status colors readable on cream
- Add `@keyframes fadeUp`, `floatCard`, `pulse` used by the landing page
- Body uses DM Sans; add a `.font-display` utility mapped to Lora for headings

### `tailwind.config.ts`
- Extend `fontFamily`: `sans: ['DM Sans', ...]`, `display: ['Lora', 'serif']`

### `src/components/AppLayout.tsx`
- Sidebar bg → `#1A4731`, active item → `rgba(156,204,74,0.18)` with `#9CCC4A` text
- Avatar chip uses lime tint; navbar search focus ring uses `#76B041`
- Page bg → `#F5F6F0`

### `src/components/BrandLogo.tsx`
- Update hex constants: dark variant outer `#1A4731`, light variant outer `#9CCC4A`, accent dot `#76B041`
- Keep the `variant` API intact

### `src/pages/AuthPage.tsx`
- Swap accent hexes (focus ring, primary button, links) to new lime/forest tokens
- Floating-hex SVG strokes use `#76B041` and `#3D8C68` instead of purple

### `src/pages/DashboardPage.tsx` & `src/pages/ProfilePage.tsx`
- Replace any remaining `#65A30D`, `#BEF264`, `#0F2A1E`, `#F7F8F4` references with the new tokens via targeted edits

### `src/components/AIChatFAB.tsx`
- FAB gradient → `linear-gradient(135deg,#1A4731,#2D6A4F)` with lime ring; tooltip pill uses cream/forest

## Memory updates
- Replace `mem://style/deep-aurora-theme` content with the new "Forest & Lime" palette description
- Update the Core "Theme" line in `mem://index.md` to reflect light theme + new palette
- Add `mem://style/landing-page` describing the public landing structure and section order

## Out of scope
- No backend or DB changes
- No copy changes inside the dashboard / complaints / inventory pages beyond color tokens
- No new dependencies (Lora & DM Sans pulled via Google Fonts import, already the existing pattern)
