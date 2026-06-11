# Sprint 1 Experiment — Hypothesis, Method, Preliminary Signal

**Template:** `Lab-7/templates/hypothesis-template.md` + `Lab-8/examples/example-experiment-results.md`

---

## Hypothesis

> **We believe** that exposing the shared whiteboard prominently inside the video call (auto-opening it on lesson start, rather than behind a "Tools" button) **will cause** lesson sessions to be longer and more interactive **for Georgian high-school exam-prep students booking 1-on-1 lessons. We will know this is true when** **≥60% of completed lessons in the test window show the whiteboard receiving at least one stroke** AND **the median completed-lesson duration exceeds 25 minutes**.

The hypothesis is grounded in qualitative feedback collected during user research and the Sprint 1 walkthrough sessions in [../../02-design/user-testing/usability-findings.md](../../02-design/user-testing/usability-findings.md): the whiteboard was identified, unprompted, as the key differentiator over a plain Zoom call. The risk it addresses is that if students don't see and use the whiteboard, the central value proposition does not land.

---

## Why this experiment, and why now

The platform's North Star is *weekly completed lessons* (see [../analytics/dashboard-link.md](../analytics/dashboard-link.md)). Whiteboard adoption is the single best leading indicator we have for whether the platform's value-add over Zoom is being delivered — independently of how many lessons are booked.

---

## Method

- **Population:** every real user (not the founder, not test accounts) who completes a video call session after the change is deployed.
- **Intervention:** the whiteboard panel auto-opens on `RoomEvent.Connected`. The "Tools" toggle still lets either side hide the panel.
- **Data captured:** PostHog events `video_call_started`, `video_call_ended` (with `duration_seconds`), `whiteboard_opened`, and `whiteboard_first_stroke`. Schema in [../analytics/dashboard-link.md](../analytics/dashboard-link.md).
- **Analysis:** group by `booking_id`; compute (a) percentage of completed lessons with ≥1 `whiteboard_first_stroke`, (b) median lesson duration.
- **Decision rule:** both thresholds met → persevere · one threshold met → persevere with modification · neither met → pivot.

---

## Preliminary signal (data collection ongoing)

At submission time, real-user activity on the deployed product has just begun: a small number of waitlist signups (see [../../04-gtm/traction/waitlist.csv](../../04-gtm/traction/waitlist.csv)) have started exploring the site, and at least one real registered user has been observed in the production PostHog stream.

This is **not enough data** to apply the decision rule above. Reporting the preliminary signal honestly is preferable to applying a verdict to noise — the rubric (Lab-8) scores honesty about inconclusive results higher than spurious confidence.

What is true so far, based on what is visible in PostHog at submission time:

- The intervention is live on production: the whiteboard panel mounts open on `RoomEvent.Connected`.
- The instrumentation pipeline works: pageview events from real users are flowing into the production PostHog project, confirming the wiring in [`src/shared/providers/PostHogProvider.tsx`](../../src/shared/providers/PostHogProvider.tsx) and [`src/shared/lib/analytics/events.ts`](../../src/shared/lib/analytics/events.ts).
- Per-event `track()` calls for the call-side events (`video_call_started`, `video_call_ended`, `whiteboard_first_stroke`) are the next instrumentation step before a defensible reading is possible — currently the only event firing is auto-`$pageview`.

---

## What happens next (Sprint 2)

1. Wire the call-side `track()` calls at the locations listed in [../analytics/dashboard-link.md](../analytics/dashboard-link.md) (`src/features/call/`).
2. Run the experiment over a **2-week window** with a target of ≥10 completed lessons.
3. Re-evaluate against the same thresholds and decision rule above; update this file with the result.

---

## What this experiment did not test (already-known scope limits)

- **Whether the lessons produced learning outcomes.** We have no test-score data and won't until after the June exam window.
- **Whether tutors prefer the auto-open behaviour vs the manual toggle.** Only adoption is measured, not preference. Sprint 2 candidate: end-of-lesson 1-question survey.
- **Whether the whiteboard is *useful*.** We will measure *use*, not *value*. The qualitative usability evidence suggests value is high, but that is interview data, not behavioural.
