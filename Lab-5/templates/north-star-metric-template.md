# North Star Metric

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** April 9, 2026
**Version:** 1.0

---

## Our North Star Metric

```
Weekly tutor sessions booked per active student user
```

**Written out:**

> The number of confirmed tutor sessions booked per active student user per 7-day rolling window.

---

## Why This Metric

**Question 1: What is the core action a user takes that proves they got value from our product?**

Our users are university students in Georgia who need a private tutor for a specific subject and have no efficient way to find one. The moment they get value from TutorLink is not when they sign up, not when they search, and not when they view a tutor profile. The moment they get value is when they successfully book a session with a tutor who matches their subject, rate, and availability — and receive a confirmation. Everything before that moment is the friction our product exists to remove. Everything after it is the outcome we need to sustain.

We chose "session booked" rather than "session attended" for the MVP because attendance requires external verification (tutor confirmation, geolocation, or calendar integration) that is out of scope for our initial build. A confirmed booking is a discrete, instrumentable event that directly represents the user completing the core value action. Our interviews confirmed this is the moment users care about: TK described the ideal outcome as "I would message one person and it would be done" — the booking confirmation is that done moment.

**Question 2: Can we measure it? Is it a discrete, countable event?**

Yes. The event `session_booked` fires exactly once per confirmed booking, after the student confirms the session and the tutor's availability slot is reserved. We count the number of `session_booked` events per `user_id` per 7-day rolling window. An "active student user" is defined as any student-role account that has fired at least one event in the past 14 days. This gives us a clean, weekly rate that is comparable across cohorts and time periods.

**Question 3: Does it change when our product gets better or worse?**

Yes. If we ship a release that breaks the booking confirmation flow, `session_booked` events drop immediately. If we improve search filtering so students find matching tutors faster, we expect the booking rate to increase because fewer searches end in abandonment. If we add a review layer that increases tutor trust signals, we expect conversion from profile view to booking to improve, which also increases the rate. If we remove the availability indicator and tutors go back to being uncontactable, the rate drops. This metric is directly sensitive to the quality of the core product experience.

---

## What Our NSM Is Not

| Alternative Metric | Why We Rejected It |
|-------------------|--------------------|
| Total signups | Measures acquisition only. A student can sign up and never search for a tutor. Tells us nothing about whether the product is working. |
| Search sessions started | Measures intent, not completion. Our interview data showed students already have intent — their problem is that the search fails. A student who searches 10 times and never books is our worst-case failure state, not a success. |
| Daily active users | Active doing what? A student who opens the app, finds no available tutor in their subject, and closes it counts as active. This metric would not detect that failure. |
| Tutor profiles viewed | Measures interest, not value. AB (Interview 2) described wanting to message one person and be done — the profile view is a step toward the value, not the value itself. |
| Total tutors listed | Supply-side metric. Measures whether we have tutors on the platform, not whether students are successfully booking them. A platform with 100 tutors and zero bookings has failed. |
| Messages sent to tutors | This is the current workaround we are replacing. Measuring messages sent would be measuring the thing we are trying to eliminate. |

---

## Connection to AARRR

Which AARRR stage does our NSM live in?

- [ ] Acquisition
- [x] Activation (most NSMs live here)
- [ ] Retention
- [ ] Referral
- [ ] Revenue

**Stage:** Activation — with a secondary function as the unit of Retention measurement.

**Why:** The first `session_booked` event is the activation moment — the user has completed the core value action for the first time. Tracked weekly, it also becomes the retention measurement: a student who books once per week is retained; a student who booked once three weeks ago and has not returned is at risk of churn. The same event drives both.

---

## Connection to Prototype

**Screen name:** Booking Confirmation

**What the user does on that screen:** Reviews the tutor name, subject, session date, time slot, and rate, then taps "Confirm Booking."

**Event that fires:** `session_booked`

**How that event feeds the NSM:** Each `session_booked` event increments the weekly session count for the associated `user_id`. Our analytics view will show: average `session_booked` events per active student per 7-day rolling window, updated daily. A rising weekly average means students are returning to book more sessions — the product is sustaining value, not just delivering it once.

---

## Team Sign-Off

| Name | Role | Agreement |
|------|------|-----------|
| Nino Tsutskiridze | Program Lead | ☑ Agreed |
| Lizi Margvelashvili | Discovery Lead | ☑ Agreed |
| Luka Khimshiashvili | Tech Lead | ☑ Agreed |
| Mari Janjghava | Discovery Lead | ☑ Agreed |

**Date agreed:** April 9, 2026

---

## Change Log

| Date | Change | Reason |
|------|--------|--------|
| April 9, 2026 | Initial definition | Lab 5 |

---

*North Star Metric | TutorLink Team | CS-PD-2026 | Spring 2026*