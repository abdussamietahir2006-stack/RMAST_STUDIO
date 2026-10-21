# RMAST Studio: design audit

Scope: the public website only. The dashboard (`/admin`, `src/admin/*`) is out of scope and must not change.
Copy, content, routes, forms, integrations and business logic stay as they are.

## Stack and where styles live

- Vite 8 + React 19 + TypeScript, prerendered pages, Express API on Vercel.
- Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` in `src/index.css`); no `tailwind.config`.
- Styling is almost entirely inline Tailwind utilities with **hard-coded hex values**
  (`text-[#FAF8F5]`, `bg-[#0E111C]`, `border-[#232738]` …) in `src/pages/*` and `src/components/*`.
- `src/index.css` (~780 lines) holds the light theme as a layer of attribute-selector overrides
  (`[class*="bg-[#0"] { … !important }`), plus the motion/aurora effects.
- Theme: `ThemeContext` toggles `html.theme-light` / `.theme-dark`, saved in `localStorage`; dark is the
  default, the operating-system preference is ignored.
- Fonts: Playfair Display (headings), Plus Jakarta Sans (body), Cormorant Garamond (italic quotes),
  JetBrains Mono (labels): 4 families.

## Findings

| Area | What we found |
| --- | --- |
| Typography | 4 font families. Heading sizes set per element (`text-5xl sm:text-7xl lg:text-8xl`, `text-3xl md:text-4xl` …): 13 different size classes. **272 uses of `text-xs` (12 px)** and 62 of `text-sm` (14 px), much of it body copy, below the 16 px minimum. Uppercase letter-spaced labels everywhere. |
| Spacing | Off-grid values mixed in (`p-5`, `gap-7`, `py-28`, `mt-2.5`, `space-y-3.5` …). Sections are `py-24` on every screen size (96 px on phones too). Container is `max-w-7xl` (1280 px) with `px-6 md:px-10`. |
| Colour | ~60 distinct hex values: ~40 near-black surface shades (`#0A0A0C`, `#0B0B0E`, `#0E111C`, `#121216` …), ~15 border shades, 8 greys for text. The accent `#A68BFF` is used 402 times, for buttons, labels, icons, links and decoration alike, and animates as a 4-colour gradient (violet, pink, amber, cyan) on text, buttons and card rings. |
| Hierarchy | Most sections already follow eyebrow → H2 → intro → content, but eyebrows, H2 sizes and intro widths differ per section. The hero has a headline, a supporting line and a video, but its primary CTA lives in the header only. |
| Grid / layout | Container widths vary (`max-w-7xl`, `max-w-4xl`, `max-w-3xl`, `max-w-2xl`). Card grids use 2, 3 and 4 columns with different gaps (`gap-4`, `gap-6`, `gap-8`). |
| Buttons | No shared button style: heights 36–52 px, square corners, mixed padding. The primary button has a sliding gradient fill, a glow shadow and a scale-up on hover; secondary buttons are borders of different colours. Focus rings are browser defaults or missing. |
| Cards | Square corners (`rounded-none`/`rounded-sm`), a mix of borders and fills. On hover: a 3D tilt, a coloured glow shadow, a cursor spotlight and a spinning gradient ring. |
| Radii | `rounded-sm` (54), `rounded-full` (28), `rounded-xs` (11), `rounded-md` (8), `rounded-lg` (4), `rounded-xl` (2), plus many unrounded blocks. |
| Images | Unsplash photos load at full width; some without `loading="lazy"` or fixed aspect ratios. Photos are dimmed with opacity classes. |
| Mobile | No page-level sideways scrolling was found, but the pricing tab bar runs off the right edge (it scrolls inside itself, which is easy to miss). The floating WhatsApp and Assistant pills are large on phones and cover card content at the bottom of the screen. Hero headline (48 px, 0.95 line-height) and 96 px section padding are heavy on phones. |
| Dark mode | Pure black background with near-white text and many hard-coded greys; small text needed extra overrides to stay readable over the moving background. |
| Light mode | Built by overriding dark classes with `!important` rules. Works, but fragile: any new colour needs a new override. |
| Inconsistencies | Random font sizes, margins and radii as listed above; two different "muted" greys in the same card; border colours differ between neighbouring cards. |

## Plan

1. **Design system**: semantic colour tokens (background, surface, border, text, muted, primary, accent) defined once
   for light and once for dark, exposed to Tailwind through `@theme`. Every hard-coded colour on the public site is
   replaced by a token. Type scale with `clamp()`, 8 px spacing scale, 1200 px container, one radius for cards (12 px)
   and buttons (10 px), shared button and card styles with hover, focus and active states. Plus Jakarta Sans for
   headings and body (already loaded), JetBrains Mono kept only for code: 2 families.
2. **Dark mode**: deep navy/charcoal background (`#0b0f19`) with softened text, following the system setting on the
   first visit, with the header toggle remembering the visitor's choice.
3. **Hierarchy and polish**: consistent section rhythm, one primary CTA in the hero, grid alignment, calmer effects
   (no animated 4-colour gradients or spinning rings), images lazy-loaded with fixed aspect ratios, mobile fixes.
4. **Verify**: screenshots of every page at 1440 / 768 / 390 in light and dark, checks for sideways scrolling and
   overlaps, and a summary of the final tokens below.

The dashboard keeps its current styles: new tokens and rules are scoped to the public site (`html:not(.admin-mode)`),
and no file under `src/admin/` is changed.

## What changed (steps 2–5)

Commits: `Design audit` → `Design system` → `Dark mode` → `Hierarchy and polish` → `Verify`.

- **Tokens everywhere.** Every hard-coded colour on the public site (about 1,000 class uses of ~60 hex values) now uses
  12 semantic tokens. Only brand colours (WhatsApp green, LinkedIn blue) and status colours (error reds, success
  green) stay literal. The ~120 light-mode override rules were deleted: light mode is the same tokens with other values.
- **Typography.** One family on the site (Plus Jakarta Sans; JetBrains Mono only for code). Headings use four fluid
  styles (`type-h1` … `type-h4`) instead of 13 ad-hoc sizes. Labels are 14 px, body copy never below 16 px,
  paragraphs capped at ~68 characters.
- **Spacing and layout.** All spacing snapped to the 8 px scale; 1200 px container with 24 px gutters (16 px on
  phones).
- **Components.** Shared `.btn` (48 px, 10 px radius, primary / secondary, hover, active and focus states) used by
  every call-to-action; cards share a 12 px radius, a 1 px border and a soft shadow; one visible focus ring site-wide.
- **Dark mode.** Deep navy canvas (`#0b0f19`) with softened text instead of pure black. The site opens in light mode
  for every visitor, the header toggle remembers the visitor's choice, and `public/theme-init.js` applies the
  theme before the first paint (no flash).
- **Hierarchy and polish.** The hero has one headline, one supporting line, a primary action (Start a Project, same
  destination as the header) and a secondary one (View Pricing). The crossed, tilted marquee became a single calm
  strip. Removed the animated 4-colour gradients, spinning card rings, cursor glow, 3D card tilt, magnetic buttons
  and heavy glow shadows. Photos are no longer dimmed, lazy-load, and keep fixed aspect ratios. Floating buttons are
  icon-only on phones.
- **Unchanged.** Copy, content, routes, forms, integrations and business logic. The dashboard: no file under
  `src/admin/` was edited, and its login screen renders pixel-for-pixel identical before and after (checked in both
  theme settings).

## Final design tokens

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `canvas` | `#0b0f19` | `#f8fafc` | page background |
| `surface` | `#111726` | `#ffffff` | cards, panels |
| `surface-2` | `#182033` | `#f1f5f9` | raised elements, pills |
| `line` / `line-strong` | `#222b3e` / `#33405a` | `#e2e8f0` / `#cbd5e1` | borders |
| `fg` | `#e8ebf3` | `#0f172a` | headings, strong text |
| `muted` | `#a9b1c4` | `#475569` | body copy |
| `subtle` | `#8791a8` | `#5b6679` | labels, meta |
| `primary` / `primary-hover` | `#a68bff` / `#b9a4ff` | `#6d4aff` / `#5a36f0` | buttons, fills |
| `on-primary` | `#0b0f19` | `#ffffff` | text on primary |
| `brand` | `#b8a4ff` | `#5b35e0` | links, highlights |
| `accent` | `#ff5caa` | `#c81e74` | the one accent |

- **Type** (desktop → mobile, fluid with `clamp()`): H1 64 → 36 px / 1.1 / −0.02em · H2 44 → 28 px / 1.15 / −0.015em ·
  H3 24 → 20 px / 1.3 · H4 20 → 17 px · body 18 → 16 px / 1.6 · labels 14 px / 1.5.
- **Spacing:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 120 px. Sections 96–120 px desktop, 64 px phones.
- **Radius:** cards 12 px, buttons and fields 10 px, pills fully round.
- **Motion:** 150–200 ms on interactive elements; content fades up 16 px once on scroll; all motion off with
  "reduce motion".

## Contrast (WCAG AA, 4.5:1 for normal text)

Every text token passes on every background in both themes. Lowest pairs: accent on light `surface-2` 4.92:1,
subtle on dark `surface-2` 5.14:1. Body text is 7:1 or higher; button labels 7.08:1 (dark) and 5.15:1 (light).
