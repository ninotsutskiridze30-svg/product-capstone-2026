/**
 * TutorLink design tokens — single source of truth.
 *
 * Two consumers:
 *   1. Tailwind (via @theme block in src/app/globals.css) — values are mirrored
 *      there for utility-class generation. If you change a value here, change
 *      the matching CSS variable in globals.css too. The READMe explains why.
 *   2. TypeScript code that can't use Tailwind utilities (chart libs, canvas,
 *      inline styles in widgets). Import `colors`, `spacing`, `radius`,
 *      `fontSize`, `motion` etc. — they expose `var(--...)` references so the
 *      dark-mode toggle still works at runtime.
 *
 * Rule: never hardcode a color, spacing, radius, font size, shadow, or motion
 * value anywhere else in the codebase. Always reach through this file (or its
 * Tailwind utility-class equivalent).
 */

// -----------------------------------------------------------------------------
// Raw values — the brand book (TutorLink Brand System.html) values, verbatim.
// These are what get inlined into globals.css. Keep them in sync.
// -----------------------------------------------------------------------------

export const rawColors = {
  light: {
    brandPrimary: "oklch(38% 0.058 155)",
    brandPrimaryHover: "oklch(32% 0.058 155)",
    brandPrimaryActive: "oklch(28% 0.055 155)",
    brandPrimarySoft: "oklch(95% 0.022 155)",
    brandPrimaryFg: "oklch(98% 0.006 85)",

    surface0: "oklch(99% 0.004 85)",
    surface1: "oklch(97.5% 0.006 85)",
    surface2: "oklch(95% 0.007 85)",
    surface3: "oklch(92% 0.008 85)",

    borderSubtle: "oklch(92% 0.008 85)",
    borderDefault: "oklch(87% 0.010 85)",
    borderStrong: "oklch(78% 0.012 85)",

    textMuted: "oklch(58% 0.012 85)",
    textSubtle: "oklch(45% 0.013 85)",
    textBody: "oklch(32% 0.012 85)",
    textStrong: "oklch(18% 0.010 85)",

    success: "oklch(44% 0.09 155)",
    successBg: "oklch(95% 0.025 155)",
    warning: "oklch(48% 0.11 70)",
    warningBg: "oklch(96% 0.040 80)",
    danger: "oklch(49% 0.15 25)",
    dangerBg: "oklch(96% 0.030 25)",
    info: "oklch(45% 0.08 235)",
    infoBg: "oklch(96% 0.020 235)",
  },
  dark: {
    brandPrimary: "oklch(72% 0.09 155)",
    brandPrimaryHover: "oklch(78% 0.09 155)",
    brandPrimaryActive: "oklch(66% 0.09 155)",
    brandPrimarySoft: "oklch(24% 0.04 155)",
    brandPrimaryFg: "oklch(14% 0.01 155)",

    surface0: "oklch(13% 0.008 85)",
    surface1: "oklch(16% 0.009 85)",
    surface2: "oklch(19% 0.010 85)",
    surface3: "oklch(22% 0.011 85)",

    borderSubtle: "oklch(22% 0.011 85)",
    borderDefault: "oklch(28% 0.012 85)",
    borderStrong: "oklch(38% 0.014 85)",

    textMuted: "oklch(60% 0.012 85)",
    textSubtle: "oklch(72% 0.010 85)",
    textBody: "oklch(86% 0.008 85)",
    textStrong: "oklch(97% 0.005 85)",

    success: "oklch(72% 0.10 155)",
    successBg: "oklch(24% 0.04 155)",
    warning: "oklch(78% 0.11 75)",
    warningBg: "oklch(26% 0.05 75)",
    danger: "oklch(72% 0.14 25)",
    dangerBg: "oklch(26% 0.05 25)",
    info: "oklch(75% 0.09 235)",
    infoBg: "oklch(24% 0.04 235)",
  },
} as const;

// -----------------------------------------------------------------------------
// CSS-variable references — use these from TS/JSX.
// They resolve at runtime so dark-mode toggling Just Works.
// -----------------------------------------------------------------------------

export const colors = {
  brand: {
    primary: "var(--color-brand-primary)",
    primaryHover: "var(--color-brand-primary-hover)",
    primaryActive: "var(--color-brand-primary-active)",
    primarySoft: "var(--color-brand-primary-soft)",
    primaryFg: "var(--color-brand-primary-fg)",
  },
  surface: {
    0: "var(--color-surface-0)",
    1: "var(--color-surface-1)",
    2: "var(--color-surface-2)",
    3: "var(--color-surface-3)",
  },
  border: {
    subtle: "var(--color-border-subtle)",
    default: "var(--color-border-default)",
    strong: "var(--color-border-strong)",
  },
  text: {
    muted: "var(--color-text-muted)",
    subtle: "var(--color-text-subtle)",
    body: "var(--color-text-body)",
    strong: "var(--color-text-strong)",
  },
  semantic: {
    success: "var(--color-success)",
    successBg: "var(--color-success-bg)",
    warning: "var(--color-warning)",
    warningBg: "var(--color-warning-bg)",
    danger: "var(--color-danger)",
    dangerBg: "var(--color-danger-bg)",
    info: "var(--color-info)",
    infoBg: "var(--color-info-bg)",
  },
} as const;

// -----------------------------------------------------------------------------
// Spacing — 4-base scale. Numeric values are kept here for places that need
// math (e.g., framer-motion offsets, canvas drawing). For CSS, prefer the
// Tailwind utility (p-4 = 16px, gap-6 = 24px, etc.) or `spacing.css.*`.
// -----------------------------------------------------------------------------

export const spacing = {
  px: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    6: 24,
    8: 32,
    12: 48,
    16: 64,
    24: 96,
  },
  css: {
    1: "var(--spacing-1)",
    2: "var(--spacing-2)",
    3: "var(--spacing-3)",
    4: "var(--spacing-4)",
    6: "var(--spacing-6)",
    8: "var(--spacing-8)",
    12: "var(--spacing-12)",
    16: "var(--spacing-16)",
    24: "var(--spacing-24)",
  },
} as const;

// -----------------------------------------------------------------------------
// Radius
// -----------------------------------------------------------------------------

export const radius = {
  sm: "var(--radius-sm)", // 4px
  md: "var(--radius-md)", // 8px
  lg: "var(--radius-lg)", // 12px
  xl: "var(--radius-xl)", // 18px
  full: "var(--radius-full)", // 999px
} as const;

// -----------------------------------------------------------------------------
// Type scale — [size, line-height, letter-spacing, weight].
// Use the Tailwind utilities `text-display`, `text-h1`, ... `text-caption`.
// -----------------------------------------------------------------------------

export const fontSize = {
  display: { size: 56, lineHeight: 60, letterSpacing: "-0.025em", weight: 500 },
  h1: { size: 40, lineHeight: 46, letterSpacing: "-0.02em", weight: 500 },
  h2: { size: 28, lineHeight: 34, letterSpacing: "-0.015em", weight: 500 },
  h3: { size: 20, lineHeight: 26, letterSpacing: "-0.01em", weight: 500 },
  h4: { size: 16, lineHeight: 22, letterSpacing: "-0.005em", weight: 600 }, // body face
  bodyLg: { size: 17, lineHeight: 26, letterSpacing: "0", weight: 400 },
  body: { size: 15, lineHeight: 23, letterSpacing: "0", weight: 400 },
  bodySm: { size: 13, lineHeight: 19, letterSpacing: "0", weight: 400 },
  caption: { size: 12, lineHeight: 16, letterSpacing: "0.01em", weight: 500 },
  mono: { size: 12, lineHeight: 16, letterSpacing: "0", weight: 400 },
} as const;

export const fontFamily = {
  display: "var(--font-display)",
  body: "var(--font-body)",
  mono: "var(--font-mono)",
} as const;

// -----------------------------------------------------------------------------
// Elevation — sparingly used. Prefer borders for separation; reach for shadows
// only when borders aren't enough (popovers, dialogs, dropdowns).
// -----------------------------------------------------------------------------

export const shadow = {
  none: "var(--shadow-none)",
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
} as const;

// -----------------------------------------------------------------------------
// Motion
// -----------------------------------------------------------------------------

export const motion = {
  duration: {
    fast: "var(--dur-fast)", // 120ms
    base: "var(--dur-base)", // 180ms
    slow: "var(--dur-slow)", // 260ms
  },
  easing: {
    standard: "var(--ease-standard)",
    exit: "var(--ease-exit)",
  },
  ms: {
    fast: 120,
    base: 180,
    slow: 260,
  },
} as const;

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const tokens = {
  colors,
  spacing,
  radius,
  fontSize,
  fontFamily,
  shadow,
  motion,
} as const;

export type Tokens = typeof tokens;
