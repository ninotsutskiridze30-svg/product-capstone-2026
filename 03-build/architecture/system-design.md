# System Design — Sakheli Tutoring Platform

**Product:** Sakheli — tutoring platform for Georgian high-school exam prep
**Repo:** https://github.com/lukakh1/tutoring
**Live URL:** https://tutoring-lyart.vercel.app
**Template:** `Lab-7/templates/system-design-template.md`
**Last reviewed against running system:** 2026-05-18

---

## 1. Architecture pattern and why it fits

**Pattern: Server-rendered web app on managed BaaS, with a separate realtime media plane.**

Concretely: a Next.js App Router monolith (rendered and hosted on Vercel) talks to a managed Postgres / auth / storage backend (Supabase). For anything that needs sub-200 ms two-way streaming — video, audio, shared whiteboard state — the client opens a direct connection to a LiveKit SFU room. The Next.js server stays out of the realtime path; it only mints short-lived LiveKit room access tokens.

**Why this fits the product:**

- **Solo team, 4-week MVP build window.** A BaaS (Supabase) removes the need to operate Postgres, auth, file storage, or RLS infrastructure. A SFU-as-a-service (LiveKit Cloud) removes the need to operate a media server. Building both from scratch would have been an entire sprint each and would have added zero product value at this stage.
- **The product has two very different traffic profiles.** Profile pages, tutor search, bookings, and homework are request/response workloads that benefit from SSR (SEO on tutor profiles, fast first paint for students on mobile networks in Georgia). Video lessons and whiteboard sync are continuous-stream workloads where the right answer is "don't proxy through your web server." Splitting the planes lets each use the right transport.
- **Bilingual (en + ka) is a first-class requirement.** Per-locale routing under `src/app/[locale]/` plus next-intl message catalogues gives every screen a Georgian variant without forking the codebase or doing client-side translation hacks.
- **Row-level security at the data layer.** Because Supabase Postgres enforces RLS, the Next.js route handlers don't need to re-implement authorization for every read. The same policies apply whether a query comes from the browser, a server action, or a third-party tool that gets API access later. This is a significant correctness win for a solo team — fewer places to forget a check.

**Alternatives considered and rejected:** see [risk-spikes.md](risk-spikes.md) for the mesh-WebRTC vs SFU spike result and the BaaS-vs-custom-backend trade-off.

---

## 2. Component breakdown

```
src/
├── app/[locale]/        Next.js App Router — per-locale entry points and route handlers
│   ├── (auth)/          login, register-student, register-tutor, complete-profile
│   ├── (public)/        public-home, public-tutors, public-tutor-profile
│   ├── (student)/       student-dashboard, student-bookings, student-homework, student-messages
│   ├── (tutor)/         tutor-dashboard, tutor-bookings, tutor-calendar, tutor-groups,
│   │                    tutor-homework, tutor-messages, tutor-profile, tutor-settings
│   └── api/             LiveKit token mint, webhook handlers, file upload signers
├── modules/             Page-level compositions; one module per route screen
├── features/            Cross-cutting interactive behaviour
│   ├── auth/            session bootstrap, role detection
│   ├── booking/         search → slot → confirm state machine
│   ├── calendar/        react-big-calendar adapter, slot availability
│   ├── call/            LiveKit room + TLDraw whiteboard
│   ├── homework-create / -submit / -grade / -shared
│   ├── messaging/       Supabase realtime chat panel
│   ├── notifications/   notification list (channel: in-app only in Sprint 1)
│   ├── reviews/         post-lesson reviews (read in Sprint 1, write deferred)
│   ├── tutor-profile/   public profile data fetching
│   └── groups/          group lesson scaffolding (Sprint 2)
├── entities/            Domain entities (DDD-style) — schema + API + types per entity
│   booking, calendar, call, favorite, group, homework, message, notification,
│   review, session, student, tutor, user
├── widgets/             Reusable composite UI blocks (header, sidebar, cards)
├── shared/              Design tokens, primitives (shadcn-based), shared utilities,
│                        providers (PostHog + TanStack Query), analytics helpers
└── proxy.ts             Next.js middleware — auth session refresh, locale routing
```

**Layer responsibilities:**

- `entities/` defines the domain — schemas, API call definitions, types. No UI.
- `features/` composes entities into user-facing behaviour. May render UI.
- `modules/` is the page-level composition of features that maps 1-to-1 with a route screen.
- `widgets/` and `shared/` are pure UI / utility.
- `app/` is only routing, layouts, and SSR data loading; logic lives below.

This layering keeps the dependency direction one-way (`app → modules → features → entities → shared`) — a violation is visible in code review.

---

## 3. Data flow — the three core surfaces

### 3a. Find and book a tutor

```
Student browser
   │  GET /[locale]/tutors
   ▼
Next.js (Vercel)  ─────────────────►  Supabase Postgres
   │  SSR query: tutors + availability       (RLS: public read on visible tutors)
   ◄─────────────────────────────────
   │  HTML stream with hydrated TanStack Query cache
   ▼
Student browser
   │  POST /api/bookings (server action)
   ▼
Next.js (Vercel)  ─────────────────►  Supabase Postgres
   │  INSERT booking (UNIQUE(tutor_id, slot_start))
   ◄─────────────────────────────────
   │  redirect → /student/bookings
```

Concurrency control on overbooking: Postgres unique constraint on `(tutor_id, slot_start)` — the second writer to a contested slot gets a 409 and the UI explains.

### 3b. Attend a video lesson with shared whiteboard

```
At lesson time, both browsers:
   │  POST /api/livekit/token   { roomName, identity }
   ▼
Next.js mints JWT (LiveKit server SDK)
   │  returns short-lived access token (TTL = lesson duration + 10 min)
   ▼
Browser opens WebSocket → LiveKit SFU (LiveKit Cloud)
   │
   ├── Audio + video tracks: published + subscribed via SFU
   ├── TLDraw store snapshots: published over LiveKit data channel
   └── Presence + connection state: LiveKit room events
```

The Next.js server is out of the path once tokens are issued. Whiteboard sync goes over the LiveKit data channel rather than Supabase realtime — one fewer moving part, latency matches the audio/video, and there's no second authorization layer to coordinate.

### 3c. Homework submit + grade

```
Tutor browser                              Student browser
   │  POST homework (title, file)             │  list homework (TanStack Query)
   ▼                                           ▼
Next.js server action                       Next.js server action
   │  insert row in homeworks                  │  fetch (RLS: student can read own)
   │  upload file → Supabase Storage          │
   │  (bucket: homework, RLS: tutor-owned)    │
   ▼                                           │  POST submission (file)
Supabase Postgres + Storage                    ▼
   ▲                                        Next.js server action
   │  insert submission row                    │  upload → Supabase Storage
   │  (RLS: student owns)                      │  (bucket: submissions, RLS: student-owned)
   └────────── grade flow: tutor writes grade + feedback → student reads via RLS
```

Files are stored in Supabase Storage with RLS policies tying each object to its row owner; the API never serves files directly.

---

## 4. Hosting and operational footprint

| Plane | Provider | Region | Notes |
|---|---|---|---|
| Next.js app | Vercel | EU (Frankfurt) | Single project, `main` → production, PR → preview |
| Postgres + auth + storage | Supabase Cloud | EU (Frankfurt) | Free tier today; budget for Pro at ~$25/mo as traction grows |
| Video SFU + data channel | LiveKit Cloud | EU PoPs | Pay-per-minute; this is the dominant variable cost — see [../../04-gtm/financials/unit-economics.md](../../04-gtm/financials/unit-economics.md) |
| Analytics | PostHog Cloud | US | Free tier sufficient for MVP traffic. Region choice to revisit before paid launch — see note below |
| DNS / CDN | Vercel (default) | Global | No custom DNS yet |

App, database, storage, and video planes are EU-resident for GDPR alignment given that target users are in Georgia and minors are involved. Analytics is currently on the PostHog US region — the trade-off (US data residency for analytics aggregates only, no PII captured beyond user IDs) is acceptable for the MVP traffic level and is flagged for re-evaluation if/when we begin paid acquisition or onboard minors at scale.

---

## 5. AI tool touchpoints (per rubric Component 2)

Cross-references with the per-story disposition log at [../../docs/ai-usage-log.md](../../docs/ai-usage-log.md).

| Component | AI tool | Task | Disposition |
|---|---|---|---|
| Supabase SSR auth client & middleware (`src/shared/api/supabase-*.ts`, `src/proxy.ts`) | Claude Code | Generate SSR client + route protection middleware | Modified — middleware matcher narrowed to avoid intercepting `/api/livekit/*` |
| Registration forms (`src/modules/auth-register-{student,tutor}/`) | Claude Code | Draft RHF + Zod schemas and field layout | Modified — adjusted validation and required-field set for the Georgian high-school context |
| Booking state machine (`src/features/booking/`) | Claude Code | Design search→slot→confirm flow + bookings table | Accepted with one schema rename (`status` enum) |
| Dashboard layout consolidation | Claude Code | Refactor student/tutor sidebars under one shell | Modified — kept role-specific top-bar, dropped unified shell |
| i18n wiring (`src/app/[locale]/`, `next-intl` setup, `messages/*.json`) | Claude Code | Wire next-intl, scaffold message catalogues, draft Georgian translations | Modified — Georgian text reviewed informally for tone |
| Messaging (`src/features/messaging/`) | Claude Code | Optimistic chat panel over Supabase realtime | Accepted |
| Dialog primitive (`src/shared/ui/dialog/`) | Claude Code | Refactor for keyboard focus + esc-close | Modified — AI version used only on confirmations |
| Homework lifecycle (`src/features/homework-*/`) | Claude Code | Implement create/submit/grade/shared flows with file uploads | Modified — switched to RLS for student file ownership instead of signed URLs |
| Video + whiteboard (`src/features/call/`, `src/app/api/livekit/token/route.ts`) | Claude Code | LiveKit room scaffolding + TLDraw sync over data channel | Modified — chose LiveKit data channel over Supabase realtime for whiteboard sync |
| Analytics layer (`src/shared/lib/analytics/`, `src/shared/providers/PostHogProvider.tsx`) | Claude Code | PostHog client + typed events helper + provider wired into root layout | Modified — made client env-key-gated so unconfigured environments are silent no-ops |
| This architecture doc + tech-stack doc | Claude Code | Draft from `package.json` + `src/` survey | Modified — every claim cross-checked against running code before committing |

**Discarded AI output worth noting:** an early AI-suggested mesh-WebRTC video implementation was discarded in favour of an SFU because mesh would not support the Sprint 2 group-lesson use case. The replacement (LiveKit Cloud SFU) is documented as the canonical decision in [risk-spikes.md](risk-spikes.md).

---

## 6. What this doc deliberately does not cover

- **Sequence diagrams per UI screen** — the relevant flows are in section 3 above; per-screen sequencing would duplicate `src/modules/`.
- **Detailed database schema** — see `supabase/migrations/` for source of truth.
- **Sprint 2+ surfaces** (notifications channels, group lessons, review writes) — documented as backlog in [../../docs/sprint-1-closeout.md](../../docs/sprint-1-closeout.md).
