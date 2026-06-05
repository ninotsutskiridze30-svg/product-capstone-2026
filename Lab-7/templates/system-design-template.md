# System Design

**File path:** `03-build/architecture/system-design.md`

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** April 16, 2026
**Version:** 1.0
**Primary author:** Luka Khimshiashvili

---

## 1. Core Sprint 1 Request

```text
A university student searches for a tutor by subject and language, views a tutor
profile with rate and available slots, and confirms a booking — receiving a
booking reference number on a confirmation screen.
```

**Current Sprint 1 boundary:**
- In scope: student signup, student login, tutor search, tutor profile view, booking creation, booking confirmation screen, seeded tutor data
- Out of scope: tutor self-registration (Sprint 2), analytics instrumentation (Sprint 2), review submission (Sprint 3), push notifications (Sprint 3), payment processing (post-course)

---

## 2. System Goal

By the Sprint 1 Review on May 7, the TutorLink system must allow a student to create an account, search for a tutor by subject and language preference, view a tutor's full profile, and confirm a booking — with the booked slot marked unavailable to all other students — from a publicly accessible Vercel URL. The system must correctly handle the case where two students attempt to book the same slot simultaneously, ensuring exactly one booking succeeds. Tutor profiles in Sprint 1 will be seeded data; real tutor self-registration is Sprint 2. The deployed system must use Supabase Auth for identity, Supabase Postgres for data persistence, and Vercel for hosting.

---

## 3. Component Breakdown

| Component | Layer | Responsibility | Owner | Technology | AI Touchpoint |
|-----------|-------|----------------|-------|------------|---------------|
| Student-facing web UI | Client | Renders search form, results list, tutor profile, booking summary, and confirmation screens. Manages local form state. | Nino, Mari | Next.js 14 / React | Google Stitch generates initial screen scaffolding; developer reviews against AC |
| Next.js API routes | Server | Validates auth session, handles search queries, creates booking records, enforces slot availability. Business logic lives here, not in the client. | Luka, Lizi | Next.js API routes (Node.js) | Claude Code for booking logic and concurrency handling |
| Supabase Postgres | Data | Stores users, tutor profiles, availability slots, and booking records. Row-level security enforces access rules. | Luka | Supabase (Postgres, EU West) | None — schema designed by Luka manually |
| Supabase Auth | Auth | Handles student signup (email + Google OAuth), email verification, session tokens, and role storage (student/tutor in user metadata). | Nino | Supabase Auth | None |
| PostHog | Analytics | Receives all 7 events defined in the event schema. Funnel view shows search → profile → booking conversion. | Lizi | PostHog cloud (EU) | None in Sprint 1 — instrumentation is Sprint 2 |
| Vercel | Hosting | Hosts the Next.js application. Auto-deploys from `main` on GitHub push. Serves the public URL used for the Sprint Review demo. | Luka | Vercel free tier | None |

---

## 4. Key Data Objects

| Entity | What It Represents | Created By | Read By | Stored Where |
|--------|--------------------|-----------|---------|-------------|
| `user` | A registered account — student or tutor. Role stored in Supabase Auth user metadata. | Supabase Auth on signup | All authenticated API routes; frontend session check | Supabase Auth + `users` table in Postgres |
| `tutor_profile` | A tutor's public-facing profile: first name, subject tags, hourly rate in GEL, bio (up to 150 chars), language(s), average rating, review count. | Seeded in Sprint 1; tutor self-registration in Sprint 2 | Search endpoint, profile view endpoint, booking summary | `tutor_profiles` table in Postgres |
| `availability_slot` | A single time slot a tutor has marked open. Fields: `tutor_id`, `date`, `time_slot` (enum: morning/afternoon/evening), `is_booked` (boolean). | Seeded in Sprint 1; tutor management in Sprint 2 | Search endpoint (availability filter), profile view, booking creation | `availability_slots` table in Postgres |
| `booking` | A confirmed session between a student and tutor. Fields: `student_id`, `tutor_id`, `slot_id`, `subject`, `rate_gel`, `reference_number`, `created_at`. | Booking API route on confirmation | Student booking history (Sprint 2), analytics (Sprint 2) | `bookings` table in Postgres |

---

## 5. User Request Lifecycle

The core Sprint 1 request, step by step:

1. **Student opens TutorLink** at the Vercel URL. Next.js checks the Supabase Auth session cookie. If no valid session, the student is redirected to the signup/login screen.

2. **Student signs up or logs in.** Supabase Auth handles email verification or Google OAuth. On success, a session token is issued and stored as an HTTP-only cookie. The student is redirected to the search screen.

3. **Student enters a subject and selects a language preference**, then taps Search. The frontend sends a GET request to `/api/tutors/search?subject=mathematics&language=english`.

4. **The API route validates the session token** using Supabase Auth middleware. If the session is invalid, it returns 401 and the frontend redirects to login.

5. **The API route queries the `tutor_profiles` table** filtered by subject tag and language, joined with `availability_slots` where `is_booked = false` and `date >= today`. Results are sorted by availability (tutors with slots this week first).

6. **The API returns a JSON array of tutor cards.** Each card includes: `tutor_id`, first name, primary subject, rate in GEL, availability badge status, average rating, review count.

7. **Frontend renders the results list.** Student taps a tutor card.

8. **Frontend sends a GET request to `/api/tutors/[tutor_id]`** to load the full profile. The API returns the full `tutor_profile` record plus all available slots for the current week.

9. **Student selects an available time slot** and taps "Book a Session." Frontend shows a booking summary screen with tutor name, subject, selected slot, and rate. Student taps "Confirm Booking."

10. **Frontend sends a POST request to `/api/bookings`** with `{ tutor_id, slot_id, subject, rate_gel }`.

11. **The booking API route validates the session**, confirms the student role, then executes a Postgres transaction:
    - Locks the `availability_slots` row with `SELECT FOR UPDATE`
    - Checks `is_booked = false` — if already booked, returns 409 Conflict
    - Inserts a new row into `bookings` with a generated reference number (format: `TL-[8 alphanumeric]`)
    - Updates `availability_slots` set `is_booked = true` for the booked slot

12. **On success, the API returns the booking record** including the reference number.

13. **Frontend renders the booking confirmation screen** showing tutor name, subject, date and time, rate, and the booking reference number. The `session_booked` analytics event will fire here in Sprint 2 instrumentation.

14. **Student taps "Done"** and is returned to the search screen.

---

## 6. Data Flow Notes

- **What data enters from the user:** Subject string, language preference enum (Georgian/English), tutor ID on profile tap, slot ID on booking, confirmation tap.
- **What data is validated:** Session token on every API route. Subject field non-empty before search submits. Slot availability confirmed server-side before booking is created (client-side availability badge is UI only — the server re-validates).
- **What data is stored permanently:** `users` (via Supabase Auth), `tutor_profiles` (seeded), `availability_slots` (seeded, updated on booking), `bookings` (created on confirmation).
- **What data is temporary or computed:** Search results (computed from DB query, not cached in Sprint 1). Average rating (computed from reviews table, Sprint 3 — seeded as static value in Sprint 1). Booking reference number (generated server-side at booking creation, not pre-computed).
- **What data should never be stored:** Email addresses in event properties. Full names in analytics events. Payment card details (no payment processing in Sprint 1 or sprint arc MVP). Raw session tokens in application logs.

---

## 7. APIs and Integrations

| Service / API | Why It Exists | Request Direction | Risk | Fallback Plan |
|----------------|---------------|------------------|------|---------------|
| Supabase Auth API | Student identity, session management, Google OAuth | Frontend → Supabase Auth (direct); API routes validate session via Supabase server client | Auth token expiry or Supabase Auth outage blocks all authenticated requests | If Supabase Auth is unavailable, the application shows an error screen. No graceful degradation — auth is a hard dependency. |
| Supabase Postgres | All data storage and retrieval | Next.js API routes → Supabase Postgres via supabase-js server client | Slow query performance if availability slot joins become expensive at scale | Not a Sprint 1 concern — seeded data is small. Index `availability_slots(tutor_id, date, is_booked)` from Day 1 to prevent issues at Sprint 2 scale. |
| PostHog Events API | Analytics event ingestion | Next.js API routes → PostHog cloud (EU) | PostHog outage should not block the booking flow | PostHog calls are fire-and-forget (non-blocking). If PostHog is unreachable, the booking succeeds and the missed event is logged but not retried in Sprint 1. |
| Google OAuth | Student signup / login via Google account | Frontend → Google OAuth → Supabase Auth callback | Google OAuth misconfiguration blocks Google signup path | Email/password signup remains available as a fallback. |

---

## 8. Deployment Topology

- **Frontend hosted on:** Vercel (automatic deployment from `main` branch)
- **Backend hosted on:** Vercel (Next.js API routes, collocated with frontend — same deployment)
- **Database hosted on:** Supabase cloud, EU West (Frankfurt) region
- **Domain / public URL:** Vercel-assigned subdomain (e.g. `tutorlink-team.vercel.app`) — no custom domain in Sprint 1
- **Analytics platform:** PostHog cloud, EU region
- **Auth provider:** Supabase Auth (collocated with database)
- **File storage:** None in Sprint 1 — tutor profile photos use a placeholder avatar. Supabase Storage added in Sprint 2 when real tutor profiles go live.

---

## 9. AI in the Build and AI in the Product

### AI in the Build Workflow

| Tool | Used For | Owner | Review Rule |
|------|----------|-------|-------------|
| Google Stitch | UI screen scaffolding — signup, search, profile, booking confirmation | Mari, Nino | Read entire output; check all AC; annotate generated blocks; log in ai-usage-log.md before PR |
| Claude Code | Booking API, concurrency transaction, Supabase RLS rules, search query with joins | Luka, Lizi | Full AC check; security review for all data-handling code; annotate; log before PR |
| GitHub Copilot | Inline completion for boilerplate — login form, CRUD patterns, test setup | All | Accept only after reading; log if > 5 lines accepted |
| Google AI Studio | Not used in Sprint 1 | — | N/A |

### AI in the Product (Sprint 1)

TutorLink does not include any AI-powered product features in Sprint 1. There is no AI model called at runtime. All search and matching logic is deterministic SQL filtering. AI is used only in the development workflow. This will be reviewed at Sprint 2 planning — a tutor recommendation feature using Google AI Studio is a candidate for Sprint 3 if the booking flow is stable.

---

## 10. Security, Privacy, and Reliability Basics

- **Auth risks:** Session token stored as HTTP-only cookie — not accessible from JavaScript, mitigating XSS token theft. Google OAuth misconfiguration is the highest auth risk; Luka validates the OAuth redirect URL in Day 1 Supabase setup. Email enumeration via the signup error message is a known minor risk — the error message "An account with this email already exists" is acceptable for MVP; a generic message can replace it in Sprint 2.
- **Sensitive data handled:** Student email addresses (stored by Supabase Auth, never in analytics event properties). Tutor rate in GEL (stored in `tutor_profiles`, included in booking records — not sensitive but not to be logged in plaintext server logs). No payment data in Sprint 1.
- **Failure mode if main service goes down:** If Vercel is unreachable, the application is unavailable. No CDN caching or static fallback in Sprint 1. If Supabase Postgres is unreachable, all API routes return 503. These are acceptable failure modes at MVP scale.
- **Logging and monitoring for Sprint 1:** Vercel provides request logs automatically. Supabase provides database query logs. No custom application-level logging setup in Sprint 1. PostHog provides event monitoring. Luka reviews Vercel logs before the Sprint Review demo to confirm no unhandled errors in production.
- **One thing we will not promise yet:** Uptime SLA. TutorLink is a student MVP on free tiers of Vercel and Supabase. Neither free tier guarantees uptime. This is acceptable for the sprint arc.

---

## 11. Technical Risks and Spikes

**1. Risk: Booking concurrency — two students booking the same slot simultaneously produce a double booking**
- Why it matters: The Sprint Review demo and any real user testing will fail credibility if a slot can be double-booked. This is the correctness risk closest to the core Sprint 1 request.
- Mitigation: Postgres `SELECT FOR UPDATE` within a transaction (Step 11 of the request lifecycle). Luka writes an automated concurrency test (two simultaneous POST requests to `/api/bookings`) as part of the DoD for S1-05. This test must pass before S1-05 is marked Done.
- Owner: Luka

**2. Risk: Supabase Auth email verification breaks the first-session activation flow**
- Why it matters: If the email verification link expires before the student clicks it, or if the callback URL is misconfigured in Supabase, the student cannot complete signup — which means no user can reach the search screen and the entire Sprint 1 flow is blocked.
- Mitigation: Nino tests the full email verification flow end-to-end in the Supabase local dev environment in Day 1 of the sprint, before committing any other auth code. If misconfiguration is found, it surfaces on Day 1, not Day 9.
- Owner: Nino

**3. Risk: Search query performance degrades when filtering on subject tag and language across the join with availability slots**
- Why it matters: Seeded data is small, but if the query design is inefficient, it will fail at Sprint 2 and Sprint 3 scale when real tutor profiles are added. Redesigning the query mid-sprint is expensive.
- Mitigation: Luka adds indexes on `tutor_profiles(subject, language)` and `availability_slots(tutor_id, date, is_booked)` in the initial migration before any data is seeded. Luka runs the search query against 100 seeded rows (not 8) to confirm response time is under 200ms before Sprint Review.
- Owner: Luka

---

## 12. Open Questions

Questions that must be resolved during Sprint 1 (not nice-to-haves):

- Does Supabase RLS support the booking access pattern we need (student can only read their own bookings; tutor can only read bookings for their profile) without requiring a custom middleware layer? Luka spikes this in Day 1–2.
- What is the correct Supabase callback URL format for Google OAuth in a Vercel preview deployment, where the URL changes per PR? Nino confirms this before implementing S1-01.
- Does the Next.js 14 App Router handle the Supabase session cookie pattern correctly with the `createServerClient` approach, or do we need the Pages Router for auth? Luka confirms the approach in the Day 1 spike before Nino begins S1-01.

---

## 13. Final Readiness Check

- [x] Every component has one clear job
- [x] Core request lifecycle is written end to end (14 steps, Steps 1–14)
- [x] Stack in this file matches `tech-stack.md`
- [x] Top technical risks are named with owners and mitigations
- [x] Out of scope items are explicit (tutor self-registration, analytics instrumentation, reviews, notifications, payments)
- [x] Another developer could start work from this document

---

*System Design | TutorLink Team | CS-PD-2026 | Spring 2026*