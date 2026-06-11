# AI Usage Log — Sprint 1

**Sprint window:** 23 April 2026 – 13 May 2026
**Format per entry (Lab-6/Lab-7 sprint-plan-template):** date · story · tool · task · files changed · disposition (accepted / modified / discarded) · reviewer

**Team composition note:** this is a one-person team. The "reviewer" column reflects self-review against the acceptance criteria for the corresponding user story. The instructor has been made aware of the solo arrangement.

---

| Date | Story | Tool | Task | Files changed | Disposition | Reviewer |
|---|---|---|---|---|---|---|
| 2026-04-23 | S1-001 Auth scaffolding | Claude Code (Sonnet 4.6) | Generate Supabase SSR client helpers and route protection middleware | `src/shared/api/supabase-{server,browser}.ts`, `src/proxy.ts` | Modified — middleware matcher narrowed to avoid intercepting `/api/livekit/*` | luka khimshiashvili |
| 2026-04-25 | S1-002 Tutor & student registration | Claude Code | Draft register-tutor / register-student forms with React Hook Form + Zod schemas | `src/modules/auth-register-*/`, `src/entities/{tutor,student}/schema.ts` | Modified — adjusted validation rules and required fields to fit Georgian high-school context | luka khimshiashvili |
| 2026-04-27 | S1-003 Booking flow MVP | Claude Code | Design booking state machine (search → slot → confirm) and Supabase tables | `src/features/booking/`, `supabase/migrations/0004_booking_flow_refactor.sql` | Accepted with one schema rename (`status` enum values) | luka khimshiashvili |
| 2026-04-28 | S1-003 Booking flow MVP | Claude Code | Wire calendar slot picker into tutor profile page | `src/modules/public-tutor-profile/`, `src/features/calendar/` | Accepted | luka khimshiashvili |
| 2026-04-29 | S1-004 Dashboard navigation refactor | Claude Code | Consolidate student/tutor dashboard sidebars under one layout | `src/app/[locale]/(student)/layout.tsx`, `src/app/[locale]/(tutor)/layout.tsx` | Modified — kept role-specific top-bar, dropped AI-suggested unified shell | luka khimshiashvili |
| 2026-05-01 | S1-005 Bilingual UI (en + ka) | Claude Code | Wire next-intl, scaffold `messages/en.json` and translate to `ka.json` | `src/app/[locale]/`, `messages/*.json`, `next.config.ts` | Modified — re-checked Georgian translations against native review (informal) | luka khimshiashvili |
| 2026-05-01 | S1-005 Bilingual UI | Claude Code | Add tutor visibility status (online/away) localisation | `src/entities/tutor/`, `messages/*.json` | Accepted | luka khimshiashvili |
| 2026-05-01 | S1-006 Tutor profile data fetching | Claude Code | Replace ad-hoc Supabase calls with TanStack Query options pattern | `src/entities/tutor/api/`, `src/modules/public-tutor-profile/` | Modified — added stale-time per query type | luka khimshiashvili |
| 2026-05-01 | S1-007 Chat panel | Claude Code | Build messaging panel with optimistic updates and Supabase realtime | `src/features/messaging/`, `src/modules/{student,tutor}-messages/` | Accepted | luka khimshiashvili |
| 2026-05-04 | S1-008 Dialog polish | Claude Code | Refactor shadcn dialog usage for keyboard focus and esc-to-close consistency | `src/shared/ui/dialog/` | Modified — kept native dialog for forms, ported AI version only to confirmations | luka khimshiashvili |
| 2026-05-14 | S1-009 Homework lifecycle | Claude Code | Implement create / submit / grade / shared homework flows with file uploads to Supabase storage | `src/features/homework-*/`, `src/entities/homework/`, `supabase/migrations/0008_homework.sql` | Modified — switched AI-proposed signed URLs to row-level-security policies for student-owned files | luka khimshiashvili |
| 2026-05-14 | S1-010 Video calls + collaborative whiteboard | Claude Code | Integrate LiveKit room + TLDraw canvas; sync TLDraw store over LiveKit data channel | `src/features/call/`, `src/app/api/livekit/token/route.ts`, `supabase/migrations/0009_calls_and_whiteboard.sql` | Modified — chose LiveKit data channel over Supabase realtime for whiteboard sync (one fewer moving part, shared auth with the call) | luka khimshiashvili |
| 2026-05-17 | CP2-3-001 Submission scaffolding | Claude Code | Draft architecture docs, AI usage log, standup log, Sprint 1 close-out | `README.md`, `docs/*`, `03-build/architecture/*`, `03-build/analytics/*` | Modified — verified every fact against `git log`, `package.json`, and `src/` before committing | luka khimshiashvili |
| 2026-05-17 | CP2-3-002 Growth model + analytics wiring | Claude Code | Draft growth strategy, unit economics, loops & moats; generate xlsx via Python; wire PostHog provider into root layout with typed events helper | `04-gtm/*`, `scripts/build-financial-models.py`, `src/shared/lib/analytics/*`, `src/shared/providers/PostHogProvider.tsx`, `src/app/layout.tsx` | Modified — financial-model assumptions tightened to Georgian-market numbers; PostHog client made env-key-gated so it's a no-op without configuration | luka khimshiashvili |
| 2026-05-18 | CP2-3-003 Prototype + traction templates | Claude Code | Publish Figma prototype link in 02-design; finalise traction (Google Forms path) and usability-test scaffolding | `02-design/*`, `04-gtm/traction/*` | Accepted — prototype link added by founder | luka khimshiashvili |

---

## Notes on AI usage philosophy for Sprint 1

- **Where AI was the primary author:** boilerplate (forms, schemas, sidebar layouts, dialog primitives) and well-trodden integrations (LiveKit + Next.js, Supabase SSR auth). These have many canonical examples in AI training data and benefited most from generation.
- **Where AI was reviewed and modified:** anything touching security (auth middleware, storage policies), realtime correctness (TLDraw sync over LiveKit), and i18n quality. AI drafts were the starting point but every line was read.
- **Where AI was discarded:** an early AI-suggested mesh-WebRTC implementation for video calls was discarded in favour of LiveKit SFU once it was clear mesh would not support the Sprint 2 group-lesson use case — see [sprint-1-closeout.md](sprint-1-closeout.md) and [../03-build/architecture/risk-spikes.md](../03-build/architecture/risk-spikes.md).
