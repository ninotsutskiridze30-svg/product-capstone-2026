# TutorLink design system

Source of truth for all colors, spacing, typography, radii, shadows, and motion in the app. Derived from the **TutorLink Brand System** designed in Claude Design.

## How it works

Tokens live in **two mirrored files** that must stay in sync:

| File | Consumer | What it does |
|------|----------|--------------|
| [`tokens.ts`](./tokens.ts) | TypeScript code (charts, canvas, inline styles, widget configs) | Exports typed `var(--…)` references and a few raw numeric values for math. |
| [`../../app/globals.css`](../../app/globals.css) | Tailwind v4 utility generator | The `@theme { … }` block here is what produces utility classes like `bg-surface-1`, `text-strong`, `rounded-md`. The `.dark { … }` block holds dark-mode overrides. |

**Change a value in one, change it in the other.** Tailwind v4 is CSS-first and can't read TypeScript; TypeScript can't import OKLCH values directly. The mirror is unavoidable — but the surface area is small (one file, ~80 lines each side).

## How to change a token (one example)

To darken the primary brand color:

1. Edit `--color-brand-primary` in [`globals.css`](../../app/globals.css) light section, and the same in `.dark` if needed.
2. Edit `rawColors.light.brandPrimary` and `rawColors.dark.brandPrimary` in [`tokens.ts`](./tokens.ts) to match.
3. That's it. Every CTA, focus ring, link, active state, and brand-primary moment across the app updates.

You should never need to touch any component file when re-skinning the brand. If you do, that component is hardcoding a color and should be fixed to use a token.

## What to use for what

### Color — semantic first, always

| Use case | Tailwind utility | Token |
|----------|------------------|-------|
| Page background | `bg-surface-0` / `bg-background` | `surface-0` |
| Card / raised surface | `bg-surface-1` / `bg-card` | `surface-1` |
| Nested raised / hover | `bg-surface-2` / `bg-muted` | `surface-2` |
| Input bg, deeper nest | `bg-surface-3` | `surface-3` |
| Hairline divider | `border-border-subtle` | `border-subtle` |
| Default border | `border-border-default` / `border-border` | `border-default` |
| Heavy border / pill outline | `border-border-strong` | `border-strong` |
| Captions, metadata | `text-text-muted` / `text-muted-foreground` | `text-muted` |
| Secondary text | `text-text-subtle` | `text-subtle` |
| Body copy | `text-text-body` | `text-body` |
| Headings, strong emphasis | `text-text-strong` / `text-foreground` | `text-strong` |
| Primary CTAs, links, focus | `bg-brand-primary` / `text-brand-primary` / `bg-primary` | `brand-primary` |
| Brand tint (badges, hover) | `bg-brand-primary-soft` / `bg-accent` | `brand-primary-soft` |
| Success | `bg-success` (solid) / `bg-success-bg text-success` (tint) | `success` |
| Warning | `bg-warning` / `bg-warning-bg text-warning` | `warning` |
| Destructive / danger | `bg-danger` / `bg-danger-bg text-danger` / `bg-destructive` | `danger` |
| Info | `bg-info` / `bg-info-bg text-info` | `info` |

**Never use `bg-red-*`, `bg-green-*`, `bg-blue-*`, `text-amber-*`, `bg-gray-*`, etc.** They aren't part of the brand system. If you find one, replace it with the semantic token above.

### Spacing — 4-base scale, use Tailwind utilities

`p-1 = 4px · p-2 = 8px · p-3 = 12px · p-4 = 16px · p-6 = 24px · p-8 = 32px · p-12 = 48px · p-16 = 64px · p-24 = 96px`

Same for `m-*`, `gap-*`, `space-y-*`. Don't use arbitrary values like `p-[15px]` unless you have a written reason.

### Typography — semantic scale

| Utility | Size / leading | Use |
|---------|---------------|------|
| `text-display` | 56 / 60 | Hero on marketing pages. One per screen, max. |
| `text-h1` | 40 / 46 | Page title. |
| `text-h2` | 28 / 34 | Section title. |
| `text-h3` | 20 / 26 | Card title, subsection. |
| `text-h4` | 16 / 22 (body face, 600) | Smallest heading. |
| `text-body-lg` | 17 / 26 | Lede paragraphs, profile descriptions. |
| `text-body` | 15 / 23 | Default body. |
| `text-body-sm` | 13 / 19 | Metadata, help text, table cells. |
| `text-caption` | 12 / 16 / 0.01em / 500 | All-caps labels, eyebrows. |

Fonts:
- `font-display` — Noto Serif Georgian (headings)
- `font-body` / `font-sans` — Noto Sans Georgian (everything else)
- `font-mono` — JetBrains Mono (prices, timestamps, code, numerical data)

All three cover Latin **and** Mkhedruli. Georgian pages should look identical to English pages in terms of weight and rhythm — that's the whole point.

### Radius

`rounded-sm = 4 · rounded-md = 8 · rounded-lg = 12 · rounded-xl = 18 · rounded-full = 999`

Default for cards is `rounded-lg` (12px). Default for buttons is `rounded-md` (8px). Pills and avatars are `rounded-full`.

### Elevation

`shadow-sm · shadow-md · shadow-lg` — all use OKLCH with a built-in hairline border, so they hold up in both light and dark mode.

**Borders over shadows.** Use `border border-border-subtle` to separate a card from its background. Only reach for `shadow-sm`+ when borders aren't enough (popovers, dialogs, dropdowns, sticky-headers-over-content).

### Motion

`duration-fast = 120ms · duration-base = 180ms · duration-slow = 260ms`

Easing via TS: `motion.easing.standard` (most animation), `motion.easing.exit` (closing/leaving), `motion.easing.spring` (use rarely — e.g., success confirmations).

**Premium brands move less.** Don't animate layout. Don't animate type. Hover transitions stay under `duration-fast`.

## The two rules

1. **Borders over shadows.** Default to `border border-border-subtle` for separation. Shadows are for true elevation (modal lifts above page).
2. **One accent moment per screen.** The forest-green primary is loud — use it on the single most important CTA or status. Don't stack three primary buttons of equal weight.

## Dark mode

Dark mode is wired with `next-themes` (class-based). The `<ThemeSwitcher />` from `src/features/theme-switcher` is mounted in `SiteHeader` and `DashboardShell`. Every token has a dark counterpart in the `.dark { … }` block of `globals.css` — if you add a new token, add both versions.

## When to use `tokens.ts` directly instead of Tailwind utilities

Reach for the TS exports when you can't use a `className`:
- Chart libraries (Recharts, etc.) that take a `stroke` / `fill` prop: pass `colors.brand.primary`.
- Canvas / whiteboard drawing code: pass `colors.surface[0]`.
- Framer Motion animation values: pass `motion.ms.fast`.
- Inline `style={…}` props on third-party components that swallow Tailwind classes.

Everywhere else, prefer the Tailwind utility — it's shorter and gets purged correctly.
