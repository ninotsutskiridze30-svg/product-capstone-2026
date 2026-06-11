# SLO Sheet — TutorLink

**Product:** TutorLink — Tutoring Platform for Georgian Exam-Prep Students
**Team:** TutorLink Team
**Date:** June 11, 2026
**Review cadence:** Monthly, or after every incident

---

## Overview

This document defines our Service Level Indicators, Service Level Objectives, and severity definitions. These are internal commitments, not customer-facing SLAs. They exist to make reliability visible and to give us a principled way to decide when to stop shipping features and invest in stability instead.

---

## Glossary

**SLI (Service Level Indicator):** A specific metric we measure. The raw number.
**SLO (Service Level Objective):** The target we set for an SLI over a time window. An internal commitment.
**SLA (Service Level Agreement):** A contractual commitment to a customer with consequences for breach. TutorLink does not have SLAs yet.
**Error budget:** The amount of unreliability the SLO allows. Budget = (1 - SLO target) x time window.

---

## SLI and SLO Definitions

### SLO 1: Booking Flow Availability

**SLI definition:**
- Metric: Percentage of HTTP POST requests to /api/bookings that return a 2xx response within 3 seconds
- Formula: successful_booking_requests / total_booking_requests x 100
- Measured by: Vercel function logs (dashboard → Functions → /api/bookings); secondary signal: PostHog booking_confirmed event
- Measurement frequency: Checked weekly; continuous in Vercel dashboard
- Current measured value: Not yet at statistical scale — no 5xx errors on /api/bookings observed since deployment (May 2026)

**SLO target:**
- Target: 99.5% of booking requests succeed within 3 seconds
- Time window: Rolling 30 days
- Why this target is achievable: Vercel serverless functions achieve approximately 99.9% uptime. Supabase free tier achieves approximately 99.5%. Our SLO is calibrated to the weakest link (Supabase).

**Error budget:**
```
SLO target: 99.5%
Time window: 30 days = 30 x 24 x 60 = 43,200 minutes
Error budget = (1 - 0.995) x 43,200 = 216 minutes per 30-day window
```

**Current error budget remaining this window:** 216 minutes (full budget — no booking incidents since deployment)

---

### SLO 2: Video Call Session Establishment

**SLI definition:**
- Metric: Percentage of LiveKit room-join attempts that result in a connected room state within 10 seconds
- Formula: successful_room_connections / total_room_join_attempts x 100
- Measured by: LiveKit Cloud dashboard (Connection Quality metrics); PostHog video_call_started event fires on successful connection — absence within 10 seconds of token issuance counts as a failure
- Measurement frequency: Per session; reviewed weekly in LiveKit dashboard
- Current measured value: Not yet at statistical scale — no failed connections observed during testing

**SLO target:**
- Target: 99% of room-join attempts establish a connected session within 10 seconds
- Time window: Rolling 30 days
- Why this target is achievable: LiveKit Cloud SLA is 99.9% uptime. We set our SLO at 99% to account for client-side network variability on Georgian mobile networks, which is outside our control.

**Error budget:**
```
SLO target: 99%
Time window: 30 days = 30 x 24 x 60 = 43,200 minutes
Error budget = (1 - 0.99) x 43,200 = 432 minutes per 30-day window
```

**Current error budget remaining this window:** 432 minutes (full budget — no failed connections since deployment)

---

## Error Budget Policy

When any SLO error budget is exhausted in a given window:

1. No new feature deployments until the window resets or the budget is partially restored through improved reliability
2. Engineering effort in the next sprint pivots to reliability improvement, not feature work
3. An incident review is mandatory before the next production push, even if no single incident caused the budget exhaustion

**Who owns the error budget decision:** Nino Tsutskiridze

---

## Severity Definitions

### SEV1: Core flow completely down

**Definition for TutorLink:** No user can complete a booking (booking endpoint returns 5xx for more than 50% of requests) OR no video call can be established (LiveKit token endpoint returns 500 or LiveKit Cloud is unreachable). The platform cannot deliver its core value.

**Response:** All hands. Interrupt whatever you are doing. Check Vercel function logs first; roll back the most recent deploy if the issue started within 30 minutes of a deploy.
**Communication:** Post in team Messenger group immediately. Inform teammates within 5 minutes.
**Target time to acknowledge:** 15 minutes
**Target time to mitigate:** 1 hour

### SEV2: Degraded experience, core flow partially affected

**Definition for TutorLink:** Some users cannot complete bookings (error rate 1–50% on /api/bookings). Or video calls connect but whiteboard TLDraw sync is broken. Or homework file upload fails for specific file types. Core flow works for most users.

**Response:** On-call team member investigates. Others notified but not interrupted.
**Communication:** Post in team Messenger within 30 minutes.
**Target time to acknowledge:** 30 minutes
**Target time to mitigate:** 4 hours

### SEV3: Minor issue, no user impact or minimal impact

**Definition for TutorLink:** A non-critical feature is broken (email notifications not sending, single Georgian translation missing). Error rate elevated but below 1% on core endpoints. Performance degraded but within SLO.

**Response:** Logged and scheduled for next working session.
**Communication:** GitHub issue created with SEV3 label.
**Target time to acknowledge:** Next working day
**Target time to fix:** Next sprint

---

## On-Call Rotation

| Week | On-call | Backup |
|------|---------|--------|
| Jun 11–17 | Nino Tsutskiridze | Lizi Margvelashvili |
| Jun 18–24 | Nino Tsutskiridze | Mari Janjghava |
| Jun 25–Jul 1 | Nino Tsutskiridze | Lizi Margvelashvili |

**On-call responsibilities:** Check the deployment URL once per day. Respond to SEV1 and SEV2 alerts within the target times above. Create a GitHub issue for any alert that fires, even if it resolves on its own.