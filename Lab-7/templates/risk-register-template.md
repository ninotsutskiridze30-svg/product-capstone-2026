# Risk Register

**File path:** `03-build/architecture/risk-register.md`

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** April 16, 2026

---

## Top Technical Risks

| Risk ID | Risk Statement | Likelihood | Impact | Earliest Detection Point | Mitigation or Spike | Owner | Status |
|---------|----------------|-----------|--------|--------------------------|---------------------|-------|--------|
| R1 | Concurrent booking writes produce a double-booked slot because the booking write path lacks a database-level lock | Medium | High | S1-05 concurrency test (Day 5–6) | Postgres `SELECT FOR UPDATE` inside a transaction; automated concurrent POST test as part of S1-05 DoD | Luka | Open |
| R2 | Supabase Auth email verification callback URL is misconfigured for Vercel preview deployments, blocking all student signups | Medium | High | S1-01 end-to-end test (Day 1–2) | Nino tests full email verification and Google OAuth flows in Supabase local dev on Day 1; confirm callback URL format before writing any other auth code | Nino | Open |
| R3 | Search query joins tutor profiles and availability slots inefficiently, producing slow results that worsen as data grows | Low | Medium | S1-03 query test against 100 seeded rows (Day 3–4) | Add DB indexes on `tutor_profiles(subject, language)` and `availability_slots(tutor_id, date, is_booked)` in initial migration; Luka runs query plan against 100 rows before Sprint Review | Luka | Open |
| R4 | Supabase RLS rules for the booking access pattern (student reads own bookings only; tutor reads bookings for their profile only) require custom middleware that was not accounted for in the sprint plan | Medium | Medium | Luka spike, Day 1–2 | Spike: test the required RLS policies in Supabase local dev before committing the data model; if RLS is insufficient, add a session-based middleware check in the API route | Luka | Open |
| R5 | Stitch-generated UI screens require more manual editing than estimated to pass all AC, reducing available time for backend stories | Medium | Low | S1-04 Stitch review session (Day 2–3) | Budget 30 minutes of AC review per Stitch-generated screen; if a screen requires more than 60 minutes of editing, fall back to manual React component with Copilot | Mari | Open |
| R6 | Midterm exam on April 30 reduces team velocity to near zero for 3–4 days in the middle of Sprint 1 | High | Medium | Standup posts, Days 7–10 | Front-load development: S1-01 and S1-02 complete by Day 4; S1-03 in progress by Day 5; S1-05 starts Day 6 — leaves Days 7–10 for review, testing, and deployment confirmation only | All | Open |

---

## Notes on the Top 3

### R1 — Concurrent Booking Double-Write

**Why this matters to Sprint 1:**
The Sprint Review demo requires a live booking. If two students (or two test tabs) can book the same slot, the core correctness guarantee of the product fails. This would be immediately visible in the Sprint Review and would undermine the team's credibility with the instructor. It is also the hardest type of bug to detect late — it requires concurrent load to trigger and is invisible in single-user testing.

**What evidence would show the risk is real:**
Running two simultaneous POST requests to `/api/bookings` for the same `slot_id` and observing two rows inserted into the `bookings` table, or one booking created and the slot `is_booked` flag remaining `false`.

**What we will do first:**
Luka implements the booking API route using a Postgres transaction with `SELECT FOR UPDATE` on the `availability_slots` row before the insert. On Day 5 or 6 of the sprint, Luka writes a test script that fires two simultaneous fetch calls to the live booking endpoint and asserts that exactly one returns 200 and one returns 409. This test is part of the Definition of Done for S1-05 — S1-05 cannot be marked Done until this test passes.

---

### R2 — Auth Callback URL Misconfiguration

**Why this matters to Sprint 1:**
If the email verification link in the signup confirmation email points to the wrong URL — which is likely if the Supabase Auth redirect URL is not configured for Vercel's preview deployment URL pattern — every student who tries to sign up via email will be stuck at the verification step and cannot reach the search screen. This blocks the entire Sprint 1 user flow. It is also easy to miss in local development because `localhost` callback URLs are configured separately from production.

**What evidence would show the risk is real:**
Clicking the verification link in the signup email and landing on a 404 page or a Supabase error page rather than being redirected to the TutorLink home screen.

**What we will do first:**
On Day 1 of Sprint 1, before writing any other auth code, Nino:
1. Configures the Supabase Auth redirect URLs for both `localhost:3000` and the Vercel production URL
2. Sends a real verification email to a test Gmail account and confirms the link redirects correctly
3. Tests the Google OAuth flow end-to-end in the Supabase local dev environment

If the callback URL configuration for Vercel preview deployments (which change per PR) is not supported by Supabase Auth's static redirect URL list, Nino disables preview URL auth and restricts auth testing to the production deployment URL. This is flagged in the Day 1 standup.

---

### R3 — Search Query Performance Degradation

**Why this matters to Sprint 1:**
The search query joins `tutor_profiles` filtered by subject and language with `availability_slots` filtered by `is_booked` and `date`. With 8 seeded rows, this is trivial. At Sprint 2 and Sprint 3 scale — when real tutors self-register — the same query on unindexed columns could return in 2–3 seconds, which is unacceptable for a search experience. Redesigning the query or adding indexes mid-sprint is expensive and disruptive.

**What evidence would show the risk is real:**
Running `EXPLAIN ANALYZE` on the search query in Supabase and observing a sequential scan (Seq Scan) on a large table, or response times above 200ms in the seeded environment.

**What we will do first:**
Luka adds the following indexes in the first database migration before any data is seeded:
- `CREATE INDEX ON tutor_profiles(subject);`
- `CREATE INDEX ON tutor_profiles(language);`
- `CREATE INDEX ON availability_slots(tutor_id, date, is_booked);`

Luka then seeds 100 rows (not 8) into the development database and runs `EXPLAIN ANALYZE` on the search query to confirm index usage and sub-200ms response. Results are noted in the Day 3 standup. If a sequential scan is observed, Luka spikes a composite index or query rewrite before S1-03 is marked Done.

---

## Spike Plan

| Spike | Question to Answer | Timebox | Owner | Output |
|------|--------------------|---------|-------|--------|
| Spike 1: Supabase RLS for booking access | Can Supabase RLS enforce that a student can only read their own bookings and a tutor can only read bookings referencing their profile, without custom middleware? | 2 hours, Day 1 | Luka | Decision: RLS is sufficient OR a middleware check is needed. If middleware needed, S1-05 points estimate is revised. |
| Spike 2: Next.js 14 App Router + Supabase Auth session pattern | Does the `createServerClient` pattern from Supabase's Next.js 14 guide work correctly with the App Router for session validation on API routes? Or do we need Pages Router for auth? | 1 hour, Day 1 | Luka | Decision recorded in standup. Nino begins S1-01 only after this is confirmed. |

Both spikes are timeboxed and must produce a decision, not open-ended research. If either spike exceeds the timebox without a clear answer, Luka escalates to the full team at the next standup.

---

*Risk Register | TutorLink Team | CS-PD-2026 | Spring 2026*