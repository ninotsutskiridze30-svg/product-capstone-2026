# Tech Stack Selection

**File path:** `03-build/architecture/tech-stack.md`

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** April 16, 2026
**Version:** 1.0

---

## 1. Decision Summary

Sprint 1 is a mobile-first web application that must deliver one complete user flow — search, profile view, booking, confirmation — at a publicly accessible URL by May 7. The overriding constraint is delivery speed: we have four developers, a midterm overlap in days 7–10, and no prior velocity data with AI-assisted development. Every stack decision prioritises time-to-working-feature over architectural elegance, and every deferred concern is deferred intentionally.

We chose Next.js because it gives us server-side rendering, API routes, and a React component model in a single framework — reducing the number of deployment targets and configuration surfaces in Sprint 1. We chose Supabase because it provides authentication, a Postgres database, and row-level security without requiring a separately managed auth service, and Luka has prior experience with it. We chose PostHog because it is self-hostable (relevant to Georgian data privacy expectations established in our event schema), has a generous free tier, and provides the funnel and retention views we need for the NSM dashboard. We are accepting several shortcuts deliberately: no native apps, no payment processing, no email notification system. These are recorded in Section 6.

---

## 2. Stack by Layer

| Layer | Selected Technology | Why This Fits | Alternative Considered | Why Rejected | Owner |
|------|---------------------|--------------|------------------------|--------------|------|
| Frontend | Next.js 14 (React) | Server-side rendering for tutor profile SEO; API routes collocated with UI; Luka and Nino have prior React experience | Remix | Similar capability but smaller team familiarity; adds migration risk with no benefit for Sprint 1 scope | Nino, Mari |
| Backend | Next.js API routes (Node.js) | Collocated with frontend — no separate server to deploy or maintain in Sprint 1; sufficient for CRUD and booking logic | Express.js + separate server | More flexibility but doubles the deployment surface and adds environment configuration overhead | Luka, Lizi |
| Database | Supabase (Postgres) | Relational model fits booking/tutor/student entities cleanly; Supabase provides ORM, migrations, and RLS without custom auth backend; Luka has prior experience | Firebase (Firestore) | NoSQL document model is awkward for relational booking logic (student → booking → tutor → availability slot); team planned SQL-first data model from the start | Luka |
| Authentication | Supabase Auth | Built into Supabase — no separate auth service; handles email verification and Google OAuth; role-based user types (student/tutor) supported via user metadata | NextAuth.js | More configuration required; does not integrate as cleanly with Supabase RLS; adds dependency without benefit | Nino |
| Analytics | PostHog (cloud) | Self-hostable option satisfies Georgian data privacy expectations; free tier (1M events/month) sufficient for MVP; funnel and retention views built in; works with the 7-event schema already defined | Mixpanel | Excellent funnel analysis but data is US-hosted with no EU/Georgian option; privacy concern for students' session data | Lizi |
| Hosting | Vercel | Zero-config deployment for Next.js; automatic preview deployments per PR; free tier sufficient for MVP traffic; GitHub integration means merging to `main` deploys automatically | Railway | Slightly more configuration for Next.js; less team familiarity; no meaningful advantage for Sprint 1 | Luka |
| Testing | Vitest + React Testing Library | Fast unit testing for Next.js; RTL handles component testing; Luka uses Vitest in prior projects; sufficient for Sprint 1 AC verification | Jest | Marginally slower with Next.js 14 due to ES module handling; Vitest is a drop-in replacement with better DX | Luka |
| Diagramming | Mermaid (in Markdown) + Excalidraw for export | Mermaid renders in GitHub natively for architecture diagrams in docs; Excalidraw for PNG export; no paid tool required | Lucidchart, draw.io | Paid or login-required; adds friction for async collaboration; Excalidraw is free and collaborative | All |

---

## 3. Approved AI Tools for Sprint 1

| Tool | Approved Use | Not For | Review Rule | Owner |
|------|--------------|---------|-------------|------|
| Google Stitch | UI screen scaffolding — signup form, search screen, tutor profile layout, booking confirmation screen | Complex backend logic; multi-file architecture; any feature requiring business logic beyond display | Developer reads entire output, checks against all AC, annotates AI-generated blocks with inline comments, logs entry in ai-usage-log.md before PR | Mari, Nino |
| Claude Code | Multi-file backend logic — booking API, concurrency handling, Supabase RLS rules, search endpoint with filtering | Generating boilerplate that Copilot handles adequately; UI screens that Stitch handles better | Full AC check required; all generated code annotated; security review for any data-handling endpoint; ai-usage-log.md entry before PR | Luka, Lizi |
| GitHub Copilot | Inline completion — login form boilerplate, repetitive CRUD patterns, docstrings, test boilerplate | Substantial new logic; anything requiring understanding of the full codebase; architectural decisions | Accept suggestions with Tab only after reading the line; no whole-function acceptance without reading; ai-usage-log.md entry if > 5 lines of generated code accepted | All |
| Google AI Studio | Not used in Sprint 1 product runtime. Reserved for Sprint 3–4 if AI product features are added (e.g. tutor matching assistant). | All Sprint 1 scope | N/A for Sprint 1 | — |

Any tool not listed above is not approved for Sprint 1 without a team discussion and a process-map.md amendment.

---

## 4. Deployment Target

- **Public deployment target:** Vercel (automatic deployment from `main` branch on GitHub push)
- **Database region:** Supabase EU West (Frankfurt) — closest available region to Georgia; relevant to data residency
- **How local and production differ:** Local uses Supabase local dev stack (`supabase start`); production uses the hosted Supabase project. Environment variables control which endpoint is hit. Local never writes to production database.
- **What gets deployed first:** Sprint 1, Day 1 — Luka deploys the scaffolded Next.js app to Vercel before any features are built, to confirm the deployment pipeline works. The Sprint 1 Review will use this URL.
- **What stays local:** Supabase local dev stack for development and testing. Production Supabase is used for the Sprint Review demo and any real user testing.

---

## 5. Rejected Architecture Paths

### Rejected Option 1: Separate Frontend (React SPA) + Separate Backend (Express.js)
- **Why it was attractive:** Decoupled architecture; backend could later become a standalone API serving mobile apps; more conventional separation of concerns.
- **Why it was rejected:** Two deployment targets (Vercel for frontend, Railway or similar for backend) doubles configuration overhead. API routes in Next.js are sufficient for all Sprint 1 backend logic and eliminate the separation cost with no Sprint 1 benefit. The mobile app concern is out of scope for the sprint arc.

### Rejected Option 2: Firebase (Auth + Firestore)
- **Why it was attractive:** Fast setup, Google ecosystem (compatible with Stitch and AI Studio), well-documented, team members have seen it used in other projects.
- **Why it was rejected:** Firestore's document model is a poor fit for the booking data model, which is inherently relational: a student has many bookings, a booking references one tutor, a tutor has many availability slots. Modeling this in Firestore requires denormalisation and multiple collection reads per booking, adding complexity with no benefit. Supabase with Postgres handles it cleanly. Additionally, Firebase data is US-hosted with no EU option, raising the same privacy concern as Mixpanel.

---

## 6. Technical Debt Accepted on Purpose

| Shortcut | Why Accepted Now | Risk Created | When to Revisit |
|----------|------------------|-------------|-----------------|
| No server-side input sanitisation beyond Supabase RLS | Supabase RLS provides row-level access control; full input sanitisation layer adds time in Sprint 1 | SQL injection or unexpected data if RLS is misconfigured | Sprint 2 — add explicit input validation middleware before real users access the product |
| Seeded fictional tutor data for Sprint 1 demo | No real tutor self-signup until Sprint 2 (S2-01); demo needs data to be testable | Demo does not reflect real supply; misleads stakeholders if presented as live | Sprint 2 — S2-01 replaces seed data with real tutor profiles |
| No email notifications to tutors when a booking is made | Adds async job queue complexity out of scope for Sprint 1 | Tutors booked via the seeded demo data will not receive confirmation | Sprint 3 — add booking notification after real tutor profiles are live |
| No automated end-to-end tests beyond the booking concurrency test | Full E2E test suite (Playwright) adds setup time not available in Sprint 1 | A regression in the booking flow could go undetected until Sprint Review | Sprint 2 — add Playwright E2E suite covering the core booking flow |

---

## 7. Final Stack Lock

- **Frontend:** Next.js 14 with React, deployed on Vercel
- **Backend:** Next.js API routes (Node.js), collocated with frontend, no separate server
- **Database:** Supabase (Postgres), EU West region, with row-level security
- **Auth:** Supabase Auth — email verification and Google OAuth, user role stored in user metadata
- **Analytics:** PostHog cloud, EU region, receiving all 7 events defined in the event schema
- **Hosting:** Vercel for frontend and API routes; Supabase cloud for database and auth

No TBD entries remain.

---

*Tech Stack | TutorLink Team | CS-PD-2026 | Spring 2026*