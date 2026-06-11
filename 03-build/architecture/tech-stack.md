# Tech Stack — Sakheli Tutoring Platform

**Template:** `Lab-7/templates/tech-stack-template.md`
**Source of truth for versions:** [`package.json`](../../package.json)
**Per-choice justification format:** what it is · why this one · what it replaces · trade-off accepted

Every dependency in `package.json` is justified below. Choices made for the **solo + 4-week-MVP + Georgian-students-and-tutors** constraint set; a 5-person team with a 6-month runway might reasonably pick differently.

---

## Framework and runtime

### Next.js 16.2 (App Router)
**Why:** server-rendered React with file-based routing, server actions, and built-in Vercel deploy. App Router specifically because (a) server components let the public tutor pages SSR for SEO without shipping data-fetch JS, (b) per-segment layouts naturally map onto our auth/role boundaries (`(auth)`, `(student)`, `(tutor)`, `(public)`), (c) `[locale]` dynamic segment + `next-intl` is the cleanest path for bilingual routing.
**Replaces:** Vite + React Router + a separate Node API server.
**Trade-off:** App Router is still maturing in the React 19 / Next 16 world; some patterns (streaming, error boundaries in server actions) have rough edges. Acceptable for an MVP, would re-evaluate at scale.

### React 19 (+ react-dom 19)
**Why:** matches Next.js 16; transitions and `useOptimistic` are useful for booking and chat UIs. Already on this version because Next 16 requires it.
**Trade-off:** some libraries lag React 19 type changes; mitigated by pinning known-good versions.

### TypeScript 5
**Why:** standard for any non-trivial Next.js app; entities are domain-shaped and typed end-to-end via Supabase generated types + Zod schemas, which prevents whole classes of runtime bugs.
**Trade-off:** none material.

---

## Styling and UI primitives

### Tailwind CSS v4 (+ `@tailwindcss/postcss`, `tw-animate-css`, `tailwind-merge`)
**Why:** utility-first CSS aligned with our component-per-file React structure; v4 has the new Oxide engine and a saner config story; `tailwind-merge` is required because we compose classes through `cva` and need conflict resolution.
**Replaces:** CSS Modules or styled-components.
**Trade-off:** v4 is recent; small ecosystem-lag for some plugins. Acceptable.

### shadcn v4 + Radix UI primitives (`radix-ui`)
**Why:** shadcn = copy-in, own-the-source UI components built on Radix primitives. Better than a black-box component library for an MVP because we can patch behaviour without forking. Radix gives us accessibility (focus management, keyboard nav, ARIA) for free on dialogs, popovers, dropdowns — non-trivial to get right by hand.
**Replaces:** MUI, Chakra, or rolling our own.
**Trade-off:** more code in `src/shared/ui/` than a black-box library, but worth it.

### `class-variance-authority`, `clsx`
**Why:** `cva` for variant-typed component APIs (e.g. `<Button variant="primary" size="sm" />`); `clsx` for conditional class joining. Both small, both standard for shadcn-style components.

### `lucide-react`
**Why:** consistent icon set with a tree-shakeable per-icon import; better than Heroicons for variety, better than Font Awesome for bundle size.

### `sonner`
**Why:** toast notifications. Chosen over Radix `Toast` because the queue-management and stack UX is better with no extra wiring.

---

## Forms, validation, and state

### React Hook Form 7 (+ `@hookform/resolvers`)
**Why:** uncontrolled-input model is the right default for form-heavy flows (registration, booking, homework submission, profile editing). Resolvers package gives us a Zod adapter so the form schema = the API schema.
**Replaces:** Formik (heavier, controlled).

### Zod 4
**Why:** schema-first validation that doubles as the TypeScript type. We use the same schemas in (a) React Hook Form on the client, (b) server-action input parsing, (c) Supabase row shape mirrors. One source of truth.
**Replaces:** Yup or hand-written validators.

### TanStack Query v5 (`@tanstack/react-query` + devtools)
**Why:** caching, invalidation, optimistic updates, and request deduplication for every read path that's not SSR'd. The `queryOptions` pattern lets us co-locate the Supabase call + cache key + select transform per entity (see `src/entities/tutor/api/`). Devtools are essential for debugging stale-cache issues in a SPA-shaped app.
**Replaces:** ad-hoc `useEffect` + `useState` data fetching.

### Zustand 5
**Why:** narrow, non-reactive global state for things that don't belong in TanStack Query (e.g. the LiveKit room object, locale switcher transient state, modal-open booleans that span routes). Picked over Redux because we have ~3 stores total and bundle size matters.
**Replaces:** Redux Toolkit, Jotai.

---

## Backend-as-a-service

### Supabase JS + SSR (`@supabase/supabase-js`, `@supabase/ssr`)
**Why:** Postgres + auth + storage + RLS + realtime in one managed service. For a solo team this collapses what would be four separate operational concerns. The `@supabase/ssr` package gives us a Next.js-aware cookie-based auth helper so server components can authenticate without round-tripping JWTs themselves.
**Replaces:** Postgres on Neon + Auth0 + S3 + a Pusher/Ably channel.
**Trade-off:** vendor lock-in on auth specifically (RLS policies are portable Postgres; auth schema is not). Accepted because the alternative is operating four services with one engineer.

---

## Realtime media

### LiveKit (`livekit-client`, `livekit-server-sdk`, `@livekit/components-react`, `@livekit/components-styles`)
**Why:** a managed SFU is the only sensible answer for 2+ video participants. LiveKit Cloud gives us EU PoPs (latency for Georgian users), a JS client + React components, and a server SDK to mint room tokens from our Next.js API. The data-channel API lets us reuse the same room for our whiteboard sync.
**Replaces:** mesh WebRTC (rejected by spike — see [risk-spikes.md](risk-spikes.md)), Daily.co, or running our own mediasoup cluster.
**Trade-off:** pay-per-minute pricing is the dominant variable cost in our unit economics. Justified by the alternative being unviable.

### TLDraw v5
**Why:** an off-the-shelf, MIT-licensed, store-snapshottable collaborative canvas. Building a usable whiteboard from scratch is a 6+ week project — TLDraw gives us infinite canvas, shapes, freehand drawing, undo/redo, multi-user cursors for free, and its store snapshot model means we can sync state by piping snapshots over LiveKit's data channel.
**Replaces:** Excalidraw (less ergonomic to embed), or building on top of `react-konva`.
**Trade-off:** large dependency. Acceptable given the time savings.

---

## Calendar

### `react-big-calendar` (+ `@types/react-big-calendar`)
**Why:** week/month view with drag-to-select that maps directly onto tutor availability and booking slots. Mature, well-typed, customisable.
**Replaces:** FullCalendar (commercial license for some features), building from scratch.

### `date-fns` v4
**Why:** tree-shakeable date library with first-class timezone handling — important because we serve Georgian-timezone tutors and need to render correctly for browsers in other zones.
**Replaces:** Moment.js (deprecated), Luxon (heavier).

---

## Internationalisation

### `next-intl` 4
**Why:** App-Router-native i18n with per-locale routing under `[locale]`, server-component support, and a typed message API. Our `messages/en.json` and `messages/ka.json` are the canonical translation catalogues.
**Replaces:** `react-i18next` (less App-Router-friendly), hand-rolled.

---

## File uploads

### `react-dropzone` 15
**Why:** dependency-light dropzone for homework submission and tutor materials. Handles the awkward parts of `<input type="file" multiple>` and drag-events.

---

## Analytics

### PostHog Cloud + `posthog-js`
**Why:** product analytics with funnel/cohort/retention out of the box, public-shareable dashboards (needed for Component 3), free tier sufficient for MVP traffic. Currently hosted on the PostHog US region; EU region available and flagged for re-evaluation before paid launch (see [system-design.md](system-design.md) §4). Wired in [src/shared/providers/PostHogProvider.tsx](../../src/shared/providers/PostHogProvider.tsx) with a typed events helper at [src/shared/lib/analytics/events.ts](../../src/shared/lib/analytics/events.ts) so all event call sites are typed against the schema in [../analytics/dashboard-link.md](../analytics/dashboard-link.md).
**Replaces:** Mixpanel (more expensive), Plausible (no event-level analytics), Google Analytics (worse funnel UX, US data residency).
**Trade-off:** PostHog is a heavier client SDK than Plausible; bundle impact is acceptable because it's deferred-imported.

---

## Tooling

### ESLint 9 + `eslint-config-next`
**Why:** standard Next.js lint config; catches the App-Router-specific footguns (server/client boundary, image optimisation).

### `server-only`
**Why:** runtime-and-build error if a `server-only` module accidentally gets imported into a client component — protects our Supabase service-role usage and LiveKit secrets from leaking into the client bundle.

### `yarn` (lockfile committed)
**Why:** consistent installs across CI and local. Pinning to a lockfile is the entirety of the choice; could equally well be pnpm.

---

## What is deliberately not in the stack (and why)

- **A separate Node API server.** Server actions + route handlers in Next.js cover everything we need; adding Express/Fastify would be cargo-cult.
- **An ORM (Prisma, Drizzle).** Supabase JS + RLS gets us there with less type-shimming. Re-evaluate if/when we have queries complex enough to want a query builder.
- **Redux.** Three stores' worth of global state doesn't justify it.
- **A separate websocket server.** Supabase realtime covers chat; LiveKit covers video + whiteboard sync. No third channel needed.
- **Sentry / error monitoring.** Sprint 2 priority — Vercel + browser console is enough for the MVP traffic level.
- **A testing framework.** Honest admission: no automated tests in Sprint 1. Sprint 2 priority is Vitest + Playwright for the booking + homework flows. Risk acknowledged in [../../docs/sprint-1-closeout.md](../../docs/sprint-1-closeout.md).
