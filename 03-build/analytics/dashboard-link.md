# Live Analytics Dashboard

**Provider:** PostHog Cloud (US region — `https://us.i.posthog.com`)
**Public share link:** https://us.posthog.com/shared/OdSVb05C279X-RLU8C28xgktmbiFbA

The dashboard is filtered to the production environment of https://tutoring-lyart.vercel.app . Pageview events from real users are flowing into the project; the share link above opens without login.

---

## What is in the dashboard

1. **Daily active users** (line) — uniques per day, broken down by `properties.role` (student / tutor) once role-bearing events fire
2. **Core flow funnel** — `$pageview /` → `$pageview /tutors` → `$pageview /tutor-profile/*` → `booking_confirmed`
3. **Lesson completion** — count of `video_call_ended` where `duration_seconds >= 600`; histogram of `duration_seconds`
4. **Whiteboard adoption** — % of `video_call_started` sessions that contain at least one `whiteboard_first_stroke`
5. **Homework lifecycle** funnel — `homework_created` → `homework_submitted` → `homework_graded`
6. **Locale split** — events grouped by `properties.locale` (en vs ka)

## North-star metric

**Weekly completed lessons** — count of `video_call_ended` per ISO week where `duration_seconds >= 600`. Counts only sessions that lasted long enough to be a real lesson, which is the only signal correlated with the product's actual value being delivered.

---

## Event schema (source of truth — typed in `src/shared/lib/analytics/events.ts`)

| Event | Trigger | Required properties |
|---|---|---|
| `$pageview` (auto) | App Router navigation | `$current_url`, locale via URL |
| `signup_started` | Register form mounted | `locale`, `role` |
| `signup_completed` | Auth flow complete + profile saved | `locale`, `role` |
| `user_signed_in` | Successful sign-in | `method` |
| `user_signed_out` | Sign-out action | — |
| `tutor_connection_requested` | Student requests connection with tutor | `tutor_id` |
| `booking_started` | Slot picker opened | `locale`, `tutor_id` |
| `booking_confirmed` | Server action returns success | `locale`, `tutor_id`, `slot_start`, `price` |
| `booking_invite_accepted` | Tutor accepts a booking invite | `booking_id`, `tutor_id` |
| `booking_invite_declined` | Tutor declines a booking invite | `booking_id`, `tutor_id` |
| `review_submitted` | Student posts a review | `tutor_id`, `rating`, `has_content` |
| `video_call_started` | LiveKit room connected | `locale`, `role`, `booking_id` |
| `whiteboard_opened` | TLDraw editor mounted in call | `locale`, `booking_id` |
| `whiteboard_first_stroke` | First non-empty TLDraw change in a session | `locale`, `booking_id` |
| `video_call_ended` | LiveKit room disconnect | `locale`, `role`, `booking_id`, `duration_seconds` |
| `homework_created` | Tutor publishes homework | `locale`, `booking_id`, `has_attachment` |
| `homework_submitted` | Student submits | `locale`, `homework_id` |
| `homework_graded` | Tutor saves grade | `locale`, `homework_id`, `score` |

## How instrumentation is wired

PostHog is initialised once via Next.js 15.3+ `instrumentation-client.ts`. The browser singleton is fetched through [`src/shared/lib/analytics/posthog-client.ts`](../../src/shared/lib/analytics/posthog-client.ts). All events are emitted through the typed `track()` helper in [`src/shared/lib/analytics/events.ts`](../../src/shared/lib/analytics/events.ts) — adding a new event requires adding it to `EventMap` first, which the compiler then enforces at every call site. The provider in [`src/shared/providers/PostHogProvider.tsx`](../../src/shared/providers/PostHogProvider.tsx) emits `$pageview` on every App Router navigation.

When `NEXT_PUBLIC_POSTHOG_KEY` is unset the helper short-circuits to a no-op, so non-production environments (local dev without a key, preview deploys) do not pollute the dashboard.

## Status at submission time

- ✅ PostHog Cloud project created (US region)
- ✅ `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` set in Vercel production environment
- ✅ `posthog-js` installed and `PostHogProvider` wired into the root layout
- ✅ Auto-`$pageview` events flowing from real users on the deployed product
- ✅ Public dashboard published — link at the top of this file
- ⏳ Per-event `track()` call-sites for video and homework lifecycle — first cohort wired in Sprint 2 alongside the experiment re-run documented in [../experiments/experiment-results.md](../experiments/experiment-results.md)
