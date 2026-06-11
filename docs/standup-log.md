# Sprint 1 Standup Log

**Sprint window:** 23 April 2026 – 13 May 2026
**Cadence:** async daily standup, written to this file at end of each working day (per `Lab-7/templates/sprint-plan-template.md`)
**Format:** `## YYYY-MM-DD` → **Yesterday** / **Today** / **Blockers**

**Team note:** solo team. Standups are still written because the practice (forcing a daily honest reflection on what got done and what is blocked) is valuable regardless of team size, and the rubric requires visible standup history.

---

## 2026-04-23 — Sprint 1 Day 1

- **Yesterday:** finished Sprint 0 setup — Next.js 16 scaffold, Supabase project linked, Vercel preview deploys working.
- **Today:** kicked off S1-001 auth scaffolding — Supabase SSR client helpers and route protection middleware.
- **Blockers:** none.

## 2026-04-25 — Sprint 1 Day 3

- **Yesterday:** finished auth scaffolding (S1-001). Middleware was over-broad on first pass and broke the LiveKit token route; narrowed the matcher.
- **Today:** S1-002 registration forms for tutors and students. Two separate forms because the required fields diverge significantly (subjects, experience, ID verification vs. grade + target university).
- **Blockers:** none.

## 2026-04-27 — Sprint 1 Day 5

- **Yesterday:** finished both registration flows. Auth → complete-profile redirect chain working.
- **Today:** S1-003 booking flow — designing the state machine (search → slot pick → confirm → confirmed booking) and the bookings table. Want this end-to-end by Tuesday so we have something demo-able.
- **Blockers:** uncertainty on overbooking prevention — going with a unique constraint on `(tutor_id, slot_start)` plus optimistic UI, will revisit if it bites.

## 2026-04-29 — Sprint 1 Day 7

- **Yesterday:** booking happy path works end-to-end. Calendar slot picker is rendering tutor availability and locking slots after confirmation.
- **Today:** S1-004 unifying the dashboard layout between student and tutor sides — too much duplication between the two layout files.
- **Blockers:** none.

## 2026-05-01 — Sprint 1 Day 9 (end of week 1)

- **Yesterday:** dashboard refactor done — kept role-specific top bar, shared sidebar shell.
- **Today:** S1-005 bilingual UI. Wiring next-intl, scaffolding `messages/en.json`, then translating to Georgian. This is the single biggest commitment to "Georgian high-school" positioning — has to be done well.
- **Blockers:** none yet but expect tone-of-voice review will need a native speaker pass before submission.

## 2026-05-04 — Sprint 1 Day 12

- **Yesterday:** chat panel (S1-007) shipped with Supabase realtime. Optimistic updates working.
- **Today:** dialog polish (S1-008) — focus management was inconsistent across modals.
- **Blockers:** none.

## 2026-05-08 — Sprint 1 Day 16

- **Yesterday:** reviewed video-transport options for the call feature. Conclusion: mesh WebRTC will not support the Sprint 2 group-lesson use case; need to start on an SFU. Going with LiveKit Cloud as a managed SFU.
- **Today:** scaffolding `src/features/call/` against LiveKit. Need to evaluate TLDraw integration on the same room.
- **Blockers:** unsure whether to sync the TLDraw store via LiveKit data channel (one less moving part) or via a Supabase channel. Trying LiveKit first.

## 2026-05-13 — Sprint 1 Day 21 (Sprint 1 close-out day)

- **Yesterday:** finished homework lifecycle (create, submit, grade, shared library) and got LiveKit + TLDraw end-to-end. Whiteboard syncs over the LiveKit data channel.
- **Today:** Sprint 1 close-out — see [sprint-1-closeout.md](sprint-1-closeout.md). The core flow is shippable.
- **Blockers:** Sprint 1 close-out artefact landed in repo later than 23:59 deadline (acknowledged in the close-out doc). Acceptance demo to self-review against acceptance criteria done.

---

## What the standup practice surfaced this sprint

- The middleware bug on Day 1 (broad matcher → broken LiveKit token route) would have shipped to staging if I hadn't written the standup that evening and noticed the LiveKit room test was failing.
- The mesh-WebRTC → LiveKit pivot was forced by a risk spike, not by hitting production scale. Glad the spike was scheduled; without it the call story would have shipped non-functional.
- Bilingual UI was the single highest-effort vertical and will need a real native-speaker pass for grade weight (Component 1 / specificity criterion).
