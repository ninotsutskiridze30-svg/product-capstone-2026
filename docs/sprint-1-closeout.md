# Sprint 1 Close-out

**Sprint:** Sprint 1 of capstone build
**Window:** 23 April 2026 – 13 May 2026
**Close-out written:** 2026-05-17 (acknowledged late — original due date was 13 May 23:59)
**Template:** `Lab-8/README.md` Sprint 1 close-out checklist + `Lab-8/templates/validation-sprint-template.md`

---

## Sprint goal

> Ship a deployed MVP where a Georgian high-school student can find a tutor, book a lesson, attend a video lesson with a shared whiteboard, and submit homework — in Georgian or English.

**Outcome:** met. The deployed app at https://tutoring-lyart.vercel.app supports the full flow end-to-end.

---

## What shipped

| ID | Story | Status |
|---|---|---|
| S1-001 | Supabase auth + route protection | ✅ shipped |
| S1-002 | Tutor & student registration with role-specific fields | ✅ shipped |
| S1-003 | Booking flow (search → slot → confirm) | ✅ shipped |
| S1-004 | Dashboard navigation refactor | ✅ shipped |
| S1-005 | Bilingual UI (English + Georgian) | ✅ shipped |
| S1-006 | Tutor profile data fetching via TanStack Query | ✅ shipped |
| S1-007 | Chat panel with Supabase realtime | ✅ shipped |
| S1-008 | Dialog primitive polish | ✅ shipped |
| S1-009 | Homework lifecycle: create / submit / grade / shared library | ✅ shipped |
| S1-010 | Video calls (LiveKit SFU) + collaborative whiteboard (TLDraw over LiveKit data channel) | ✅ shipped |

---

## What slipped or descoped

- **Notifications surface (S1-011)** — entity scaffold exists in `src/entities/notification/` and `src/features/notifications/` but the email/push channel is not wired up. Moved to Sprint 2.
- **Reviews surface (S1-012)** — `src/features/reviews/` has the read path; write path (post-lesson review submission) deferred to Sprint 2.
- **Groups (S1-013)** — `src/modules/tutor-groups/` page exists; group lessons (multiple students in one LiveKit room) is a Sprint 2 story.
- **Analytics instrumentation** — PostHog plan agreed but not yet integrated; provider + typed events helper added 17 May as CP2-3 prep (see [../03-build/analytics/dashboard-link.md](../03-build/analytics/dashboard-link.md)).
- **Sprint 1 close-out itself** — this document landed 4 days late. The work it describes did finish on time; the writeup did not.

---

## Definition of done verification

Per `Lab-8/templates/validation-sprint-template.md`:

- [x] Deployed to a public URL accessible without a team account → https://tutoring-lyart.vercel.app
- [x] Core user flow completable end-to-end → see "Sprint goal" above
- [x] All shipped stories have passing manual smoke tests (no automated suite yet — Sprint 2 priority)
- [x] No `[TODO]` or `[placeholder]` strings in shipped UI copy (both `messages/en.json` and `messages/ka.json` reviewed)
- [ ] Analytics events firing in a live dashboard — **not done in Sprint 1**, this is CP2-3 prep work
- [x] README points to the deployment URL → updated 2026-05-17 as part of CP2-3 prep

---

## Architectural risks resolved this sprint

- **Video transport (mesh vs SFU):** decision on 2026-05-08 to start on a managed SFU rather than mesh WebRTC, because mesh would not support the Sprint 2 group-lesson use case. Chose LiveKit Cloud over self-hosted mediasoup to avoid operating a media server. Cost implication noted in [../04-gtm/financials/unit-economics.md](../04-gtm/financials/unit-economics.md). Full reasoning in [../03-build/architecture/risk-spikes.md](../03-build/architecture/risk-spikes.md).
- **Whiteboard sync transport:** decision to sync TLDraw store snapshots over the LiveKit data channel (rather than Supabase realtime) — one less moving part, the data channel shares auth with the call. Trade-off documented in [../03-build/architecture/system-design.md](../03-build/architecture/system-design.md).

---

## Sprint 2 candidate backlog (informational only — for CP2-3 readers)

1. Wire PostHog analytics events at the call sites listed in [../03-build/analytics/dashboard-link.md](../03-build/analytics/dashboard-link.md) — gates Component 3 full credit and Component 4 experiment.
2. Notifications channel (email via Supabase functions; push later).
3. Review write-path on the student side.
4. Group lessons (multi-student LiveKit rooms).
5. Usability findings → design changes loop (Component 1).

---

## Honest reflection

- **Velocity:** higher than expected — 10 stories shipped solo because the AI-assisted boilerplate path was very productive on well-trodden integrations (Supabase, LiveKit, shadcn). See [ai-usage-log.md](ai-usage-log.md) for the per-story disposition.
- **Risk-tolerance call:** chose to land the video + whiteboard story before notifications and reviews, because the risk spike result determined the whole product story. The right call — without it the demo on the deployed URL would have shown a tutor-finder, not a tutoring platform.
- **Process debt:** standup log + close-out doc were both written retroactively. The work was real and dated correctly against `git log`; the writing was batched. Going forward, write the standup at end of working day.
