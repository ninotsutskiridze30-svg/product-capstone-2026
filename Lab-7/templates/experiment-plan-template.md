# Experiment Plan

**File path:** `03-build/experiments/experiment-plan.md`

**Team:** TutorLink Team
**Product:** TutorLink
**Date launched:** April 24, 2026
**Owner:** Lizi Margvelashvili

---

## 1. Hypothesis

```text
We believe university students in Georgia who have searched for a private tutor
in the past semester experience significant friction in the discovery process.
If we show them a landing page describing a searchable tutor directory with
visible rates, availability, and reviews, at least 25% will sign up for early
access because finding a tutor quickly and with confidence is a high-priority
unmet need.
```

---

## 2. Assumption Being Tested

The single most important assumption underlying TutorLink is that students who have experienced the tutor search problem will take an action — signing up — to get access to a solution, without being shown the product itself. If they will not sign up for early access from a description alone, they are unlikely to adopt the product even after it is built.

This is the demand assumption. All discovery interviews confirmed the problem exists and is painful. This experiment confirms that the pain is strong enough to motivate a low-cost action (signup) when a credible solution is described.

---

## 3. Top 3 Riskiest Assumptions

| Rank | Assumption | Why Risky | Why This Experiment Addresses It |
|------|------------|----------|----------------------------------|
| 1 | Students will take an action (signup) based on a description of TutorLink, without seeing the product | If they will not sign up from a description, build effort may produce a product nobody uses | The smoke test directly measures signup conversion from a description — the action is the signal |
| 2 | The value proposition (searchable directory with rate, availability, and reviews visible) resonates with the target segment | Our interview data is from 8 people — the wider population may not share the same pain intensity | The landing page presents the value proposition and signup conversion tells us if it resonates at a broader sample size |
| 3 | Students who found their current tutor through word-of-mouth are still open to a platform-based alternative | Some students may have normalised the word-of-mouth process and see no need to change | The post-signup question asks how they currently find tutors — this surfaces resistance to the platform model |

---

## 4. Experiment Method

**Method:** Smoke test

A smoke test measures demand before the product exists. We publish a landing page describing TutorLink and the problem it solves. Real target users see it and are invited to sign up for early access. The number of signups relative to visits is the primary signal.

**Exact setup:**

- **Channel:** WhatsApp and Messenger — direct message to KIU students in the team's networks. Posted in the KIU CS student group chat and the Business student group chat where AB (Interview 2) and NA (Interview 7) are active. NOT posted in the team's personal social media profiles — this would contaminate the sample with non-ICP users.
- **Asset used:** A single-page landing page built in Google Sites or Carrd (free, no-code, deployable in under 2 hours). The page includes: the problem statement in plain language ("Finding a tutor in Georgia takes days of messaging and often fails"), the TutorLink value proposition ("Search by subject, see rates, check availability, book in one step"), three specific quotes from discovery interviews (anonymised), and a single call to action: "Sign up for early access."
- **Call to action:** Email address field + "Get early access" button. On submit, the form shows: "You're on the list. We'll send you access when TutorLink launches." No further action required from the user.
- **Real target users reached by:** Direct WhatsApp/Messenger messages to students who match the primary ICP (university students at KIU who have searched for a tutor in the past semester). Each team member sends the link to 10 personally known contacts who match this description. Total outreach: 40 contacts across all team members.
- **What happens after a user responds:** Signup email is captured in a Google Sheet via the Carrd/Google Sites form integration. Lizi reviews signups daily. Any signup who mentions a specific subject need in a follow-up message is added to the outreach tracker as a potential early user for Sprint 2 usability testing.

---

## 5. Success, Gray Zone, Failure

**Pre-launch thresholds — frozen before the experiment starts:**

- **Success:** 25% or more signup conversion (signups / landing page visits). At 40 outreach contacts, success is 10 or more signups from the outreach cohort.
- **Gray zone:** 15–24% signup conversion. Data is ambiguous — the problem may be real but the value proposition framing may be unclear or the channel may have been too warm (people signed up out of social obligation). Run a second experiment with a colder audience before proceeding with full confidence.
- **Failure:** Below 15% signup conversion. The problem may be less acute than interviews suggested, the value proposition may not resonate, or the target segment is narrower than assumed. Convene a team retrospective on the discovery data before Sprint 2 begins.

These thresholds are set before launch. They will not be adjusted after results arrive.

---

## 6. Time Window and Sample Size

- **Experiment starts:** April 24, 2026 (Sprint 1 Day 1 — runs in parallel with Sprint 1 development)
- **Experiment ends:** May 4, 2026 (Sprint 1 Day 11 — 11 days before Sprint Review)
- **Minimum sample target:** 40 outreach messages sent (10 per team member), producing at minimum 40 landing page visits if all open the link. 25 visits is the minimum for the conversion rate to be statistically meaningful at this scale.
- **What counts as one valid data point:** A unique landing page visit from a student who received the link through one of the four team members' outreach messages — not a visit from a team member themselves, not a visit from a friend who is not a KIU student, not a bot visit.

---

## 7. Data Capture Plan

| Signal | How Captured | Where Recorded | Owner |
|--------|--------------|---------------|------|
| Landing page visits | Carrd built-in analytics (unique visitors) or Google Analytics if Carrd free tier does not provide this | Google Sheet: `experiment-results.gsheet` tab "Visits" | Lizi |
| Signups (email form submits) | Carrd form → Google Sheet integration (automatic) | Google Sheet: `experiment-results.gsheet` tab "Signups" | Lizi |
| Outreach messages sent | Each team member logs their 10 outreach contacts in the outreach tracker (`01-discovery/outreach-tracker.md`) with date sent and channel | `outreach-tracker.md` | All — each member logs their own |
| Post-signup follow-up responses | Any reply to the "You're on the list" confirmation that includes a subject or comment — recorded manually by Lizi | Google Sheet: `experiment-results.gsheet` tab "Follow-ups" | Lizi |

Lizi reviews the Google Sheet every evening during the experiment window and posts a daily update in the Messenger standup group: visits to date, signups to date, conversion rate to date.

---

## 8. Live Asset Checklist

- [ ] Landing page is published at a public URL (Carrd or Google Sites)
- [ ] Form integration to Google Sheet is tested (one test submission before outreach begins)
- [ ] All four team members have their 10 outreach contacts identified and messaged by April 24 EOD
- [ ] Success and failure thresholds are frozen in this document (do not edit after April 24)
- [ ] Lizi is monitoring the Google Sheet daily
- [ ] Decision review date is set: May 5, 2026 (day after experiment closes)

---

## 9. Decision Rule

- **If result meets success threshold (25%+ conversion):** Proceed with Sprint 2 confidence. Use the signup list as the primary pool for usability testing in Sprint 3. Share the result in the Sprint Review on May 7 as demand validation evidence.
- **If result falls in gray zone (15–24%):** Run a second smoke test in Sprint 2 with a colder audience (students the team does not know personally — approached in the KIU library or via a Facebook group post). Do not interpret the ambiguous result as validation. Document the gray zone outcome and the follow-up plan in the Sprint 2 retrospective.
- **If result falls below failure threshold (<15%):** Convene a team retrospective before Sprint 2 planning. Review the discovery data to check whether the problem is narrower than assumed (e.g. only international students, not all students). Consider whether the value proposition framing needs to change. Do not interpret low signup conversion as a problem with the product — the product does not exist yet. Interpret it as a signal about demand strength or framing.

---

## 10. What Would Make This Experiment Invalid

- Team members sign up themselves to inflate the conversion rate
- Outreach is sent to people the team knows will sign up out of social obligation (family members, close friends who are not KIU students)
- The landing page describes a significantly different product than the one being built (e.g. promises features not in the sprint arc)
- The form integration fails silently and signups are not captured — Lizi checks the Google Sheet within 2 hours of the experiment launching to confirm form submissions are recording correctly
- The experiment window is extended after results come in below the success threshold — the window closes May 4 regardless of results

---

*Experiment Plan | TutorLink Team | CS-PD-2026 | Spring 2026*