# Product Roadmap

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** April 16, 2026
**Version:** 1.0
**Sprint Arc:** April 24 to June 11 2026 (4 sprints, 8 weeks)

---

## MVP Scope

### What We Are Building

TutorLink is a mobile-first web application that connects university students in Georgia with private tutors by making tutor availability, rates, subject coverage, and social proof visible in one place — replacing a fragmented word-of-mouth search that currently takes students one to six weeks and ends in abandonment for a significant minority. Students post in WhatsApp group chats, collect names, and message each tutor individually; each failed contact resets the search to zero. TutorLink solves this by giving students a searchable, filterable tutor directory and giving tutors a way to signal their status and receive only matched inbound demand.

### North Star Metric

> Weekly tutor sessions booked per active student user

### In Scope (Sprints 1 to 4)

| Feature | Sprint | Interview Evidence |
|---------|--------|--------------------|
| Student signup and login | Sprint 1 | Interviews 1–8 — all interviewees are students who would be the primary user; authentication is a prerequisite for all personalised features |
| Tutor search by subject and language | Sprint 1 | Interview 1 (TK): "Everything. I did not know their rate, I did not know when they were free." Interview 2 (AB): searched for academic writing, got general English tutors — subject filtering is the primary need |
| Tutor profile view (subject, rate, availability, reviews) | Sprint 1 | Interview 6 (DK): "The worst part is you don't know if the person is any good until you've already committed and paid." Review and rate visibility on the profile directly addresses this |
| Booking creation and confirmation screen | Sprint 1 | Core activation moment. Drives NSM directly. Interview 2 (AB): "I would message one person and it would be done." |
| Tutor signup and profile creation | Sprint 2 | Interview 5 (MT): "I would like to say somewhere: I have two spots left, I teach second-year maths, I charge 35 GEL per hour." Supply side must be self-serve for the platform to scale |
| Tutor availability management (set and update slots) | Sprint 2 | Interview 5 (MT): "I get messages from people who want subjects I do not teach... it wastes both our time." Availability status prevents mismatched inbound |
| Analytics instrumentation (all 7 events firing, dashboard live) | Sprint 2 | Required for Checkpoint 3. `session_booked` must fire reliably to measure the NSM |
| Student booking history | Sprint 2 | Interview 3 (GM): repeat searchers need to track past sessions and return to the same tutor — history view reduces the cost of a second booking |
| Student review submission (after completed session) | Sprint 3 | Interview 1 (TK): "I just needed someone to vouch for them." Interview 2 (AB): described wanting "some reviews maybe" unprompted. Reviews are the trust layer that converts profile views into bookings |
| Tutor profile share (WhatsApp deep link) | Sprint 3 | Interview 1 (TK): found their tutor via personal vouching. The share feature formalises this existing behaviour and drives referral. Event: `tutor_profile_shared` |
| Usability testing with 5 real users, documented | Sprint 3 | Required for Checkpoint 3 qualitative evidence |
| Repository documentation, AI usage log complete | Sprint 4 | Required for Demo Day and Checkpoint 3 audit |
| Pitch deck and one-pager updated with real usage data | Sprint 4 | Demo Day requirement |

### Out of Scope (MVP Phase)

| Feature | Reason Out of Scope |
|---------|---------------------|
| In-app messaging between student and tutor | No interview evidence that students want to message inside the platform — they are comfortable with WhatsApp once a match is confirmed. Adds significant complexity without driving the activation event. |
| Payment processing | No interview evidence of willingness to pay through the platform at MVP stage. Tutors are paid directly in cash or bank transfer. Will validate in Sprint 3 or post-course. |
| iOS / Android native apps | Mobile web is sufficient for the MVP booking flow. All interviewees accessed content on mobile web. Native apps add deployment complexity with no additional value at this stage. |
| AI tutor matching / recommendation engine | Insufficient usage data at MVP to train a meaningful model. Requires a dataset of completed sessions that does not exist yet. Post-course feature if usage data warrants it. |
| Calendar integration (sync with university timetable) | Technical dependency on third-party institutional systems creates unacceptable risk within the sprint arc. No interview evidence this is a priority over the core booking flow. |

### Explicitly Rejected

| Feature | Why Rejected |
|---------|-------------|
| Social feed / study community | Three interviewees independently described frustration with existing social apps competing for their time. Interview 4 (SN): focused on finding a tutor, not on community. There is no interview evidence for a social feed; adding one would contradict the product's purpose. |
| Gamification (badges, streaks, leaderboards) | Zero interview evidence. One team member suggested it during planning. The discovery data consistently showed students want utility — a faster, more reliable search — not engagement mechanics. |
| Tutor certification or credential verification | Desirable but not feasible within the sprint arc. Verification requires institutional integrations (KIU, TSU) that are out of scope. The review system is the MVP substitute for formal verification. |
| Multi-language UI (Georgian interface) | English-language interface serves the target ICP (students at English-medium institutions including international students who specifically cannot use Georgian-only platforms). Georgian interface is a Sprint 5+ consideration. |

---

## Sprint Overview

| Sprint | Dates | Theme | Key Deliverable | Checkpoint |
|--------|-------|-------|-----------------|-----------|
| Sprint 1 | Apr 24 to May 7 | Foundation | A student can sign up, search for a tutor by subject, view a profile, and complete a booking — end to end — at a deployed public URL | Midterm Apr 30 — dev continues async |
| Sprint 2 | May 8 to May 21 | Supply + Instrumentation | Tutors can self-register and manage availability. All analytics events fire. Booking history works. | Checkpoint 3 May 21 |
| Sprint 3 | May 22 to Jun 4 | Trust + Growth | Reviews live. Tutor profile sharing live. 5 real user tests documented. | Peer Assessment Jun 4 |
| Sprint 4 | Jun 5 to Jun 11 | Demo Day | Pitch-ready product, complete repository, venture packet submitted | Demo Day Jun 11 |

---

## Sprint 1: Foundation

**Dates:** April 24 to May 7 2026
**Sprint Goal:** A student can sign up, search for a tutor by subject and language, view a tutor profile with rate and availability, and confirm a booking — end to end — from a publicly accessible Vercel URL.
**Demo:** Live booking completed in front of instructor at Sprint Review (May 7, Google Meet). The deployed URL is used. No screenshots. No recordings.

### Capacity

| Team Member | Available Hours (excl. midterm prep) | Story Points Max |
|-------------|--------------------------------------|-----------------|
| Nino | 12 hrs | ~8 pts |
| Lizi | 10 hrs | ~7 pts |
| Luka | 14 hrs | ~9 pts |
| Mari | 10 hrs | ~7 pts |
| **Total** | **46 hrs** | **~31 pts max** |

**Sprint 1 commitment:** 17 story points (55% of maximum)

**Rationale:** Sprint 1 overlaps with the midterm exam on April 30. All team members have significantly reduced availability in days 7–10 of the sprint. We have not yet measured team velocity with AI-assisted development. 55% capacity is deliberately conservative for Sprint 1 — it is better to over-deliver on 17 points than under-deliver on 25.

### Stories Allocated to Sprint 1

| Story ID | Story (summary) | Points | Assignee | AI Tool |
|----------|----------------|--------|----------|---------|
| S1-01 | Student can sign up with email or Google | 3 | Nino | Google Stitch (signup UI) + Claude Code (auth backend) |
| S1-02 | Student can log in and maintain session | 2 | Nino | GitHub Copilot |
| S1-03 | Student can search for tutors by subject and language | 5 | Luka | Claude Code |
| S1-04 | Student can view a tutor profile with rate, subject tags, availability slots, and review count | 3 | Mari | Google Stitch |
| S1-05 | Student can confirm a booking and receive a confirmation screen | 4 | Lizi + Luka | Claude Code + GitHub Copilot |
| **Sprint 1 Total** | | **17** | | |

### Sprint 1 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Midterm overlap reduces development days 7–10 to near zero | High | Medium | Front-load development. S1-01 and S1-02 complete by Day 4. S1-03 by Day 6. Luka and Lizi focus on S1-05 from Day 5. |
| No real tutor data available for Sprint 1 demo | Medium | High | Seed 5–8 fictional tutor profiles in the database before Sprint Review. Label clearly as demo data. Note in Sprint Review: "Live tutor signup is Sprint 2." |
| Stitch-generated UI requires significant manual editing to pass AC | Medium | Low | Luka reviews Stitch output against AC within 30 minutes of generation before committing. Budget 30 minutes review per screen. |
| Booking concurrency — two students booking the same slot simultaneously | Low | High | Luka writes a test that fires two simultaneous booking requests and confirms only one succeeds. This test is part of the DoD for S1-05. |

---

## Sprint 2: Supply + Instrumentation

**Dates:** May 8 to May 21 2026
**Sprint Goal:** Tutors can self-register and manage their available time slots. All 7 analytics events are firing in the deployed application. Booking history is accessible to students.
**Demo:** Tutor creates a profile, student finds that tutor in search, and books a session — all in one live walkthrough. PostHog dashboard visible showing real event data from real sessions.
**Checkpoint 3 due:** May 21 at 23:59

### Capacity

**Sprint 2 commitment:** 19 story points (adjust after Sprint 1 velocity is measured)

### Stories Allocated to Sprint 2

| Story ID | Story (summary) | Points | Assignee | AI Tool |
|----------|----------------|--------|----------|---------|
| S2-01 | Tutor can sign up and create a profile (subject, rate, language, bio) | 5 | Mari | Google Stitch + Claude Code |
| S2-02 | Tutor can set and update available time slots | 3 | Luka | Claude Code |
| S2-03 | All 7 analytics events fire on correct triggers and appear in PostHog | 5 | Luka | GitHub Copilot |
| S2-04 | Student can view their booking history | 3 | Nino | Google Stitch |
| S2-05 | PostHog dashboard shows core NSM funnel (search → profile → booking) | 3 | Lizi | None |
| **Sprint 2 Total** | | **19** | | |

### Sprint 2 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Tutor signup (S2-01) requires role-based auth which may require refactoring S1-01 | Medium | High | Luka audits the S1-01 auth implementation in Sprint Planning and flags any refactor needed before committing S2-01 to the sprint |
| PostHog event verification is time-consuming without test fixtures | Medium | Medium | Liza writes test fixtures for each event in the first 3 days of Sprint 2, before integration testing begins |
| Checkpoint 3 deadline and Sprint 2 Review fall on the same day (May 21) | High | Medium | Sprint 2 Review is scheduled for May 20. Checkpoint 3 submission uses the May 20 state of the repo. |

---

## Sprint 3: Trust + Growth

**Dates:** May 22 to June 4 2026
**Sprint Goal:** Students can submit reviews after a completed session. Tutor profiles are shareable via WhatsApp deep link. Five real users have tested the product and feedback is documented.
**Demo:** Student submits a review for a completed session. Tutor profile is shared via WhatsApp. Usability test recordings or notes visible.

### Capacity

**Sprint 3 commitment:** 18 story points (adjust after Sprint 2 velocity)

### Stories Allocated to Sprint 3

| Story ID | Story (summary) | Points | Assignee | AI Tool |
|----------|----------------|--------|----------|---------|
| S3-01 | Student can submit a star rating and text review after a completed session | 5 | Mari | Google Stitch + Claude Code |
| S3-02 | Reviews display on tutor profile with average rating | 3 | Nino | GitHub Copilot |
| S3-03 | Student can share a tutor profile via WhatsApp deep link | 3 | Luka | Claude Code |
| S3-04 | Usability testing with 5 real users completed and documented | 5 | Lizi + all | None |
| S3-05 | Search results filtered by "has reviews" and "available this week" | 2 | Luka | GitHub Copilot |
| **Sprint 3 Total** | | **18** | | |

### Sprint 3 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Recruiting 5 real users for usability testing is time-consuming | High | High | Lizi begins outreach to interviewees from the discovery phase in Week 12 (before Sprint 3 starts). Target: 5 sessions confirmed before May 22. |
| S3-01 review submission requires a "session completed" state that may not exist cleanly in the data model | Medium | Medium | Luka adds a `status` field to the booking record in Sprint 2 (S2-02 or separate task) to support this. Flag in Sprint 2 planning. |

---

## Sprint 4: Demo Day

**Dates:** June 5 to June 11 2026
**Sprint Goal:** Product is pitch-ready, repository is complete with all required documentation, and the venture packet is submitted by Demo Day.
**Demo Day:** June 11 2026

### Capacity

**Sprint 4 commitment:** 10 story points (shorter sprint — Demo Day preparation is the primary activity)

### Stories Allocated to Sprint 4

| Story ID | Story (summary) | Points | Assignee | AI Tool |
|----------|----------------|--------|----------|---------|
| S4-01 | Repository documentation complete (README, architecture diagram, AI usage log finalized) | 3 | Nino | None |
| S4-02 | Pitch deck and one-pager updated with real usage data from PostHog | 3 | Lizi | None |
| S4-03 | Edge case and error handling polish (empty search results, booking conflict, network error) | 4 | Luka + Mari | GitHub Copilot |
| **Sprint 4 Total** | | **10** | | |

---

## Full Backlog Summary

| Story ID | Summary | Sprint | Points | Interview Evidence |
|----------|---------|--------|--------|--------------------|
| S1-01 | Student signup | 1 | 3 | All interviews — prerequisite |
| S1-02 | Student login | 1 | 2 | All interviews — prerequisite |
| S1-03 | Tutor search by subject and language | 1 | 5 | TK (I1), AB (I2), SN (I4), LG (I8) |
| S1-04 | Tutor profile view | 1 | 3 | DK (I6), AB (I2), GM (I3) |
| S1-05 | Booking creation and confirmation | 1 | 4 | AB (I2), TK (I1) |
| S2-01 | Tutor signup and profile creation | 2 | 5 | MT (I5) |
| S2-02 | Tutor availability management | 2 | 3 | MT (I5), GM (I3 proxy) |
| S2-03 | Analytics instrumentation (all events) | 2 | 5 | Required for CP3 |
| S2-04 | Student booking history | 2 | 3 | GM (I3) — repeat searchers |
| S2-05 | PostHog NSM dashboard | 2 | 3 | Required for CP3 |
| S3-01 | Student review submission | 3 | 5 | TK (I1), AB (I2) |
| S3-02 | Reviews on tutor profile | 3 | 3 | DK (I6), AB (I2) |
| S3-03 | Tutor profile share (WhatsApp) | 3 | 3 | TK (I1) — vouching behaviour |
| S3-04 | Usability testing with 5 users | 3 | 5 | Required for CP3 |
| S3-05 | Search filter (has reviews, available this week) | 3 | 2 | AB (I2) — specialisation filter |
| S4-01 | Repository documentation | 4 | 3 | Demo Day requirement |
| S4-02 | Pitch deck with real data | 4 | 3 | Demo Day requirement |
| S4-03 | Error handling polish | 4 | 4 | General quality |

**Total story points across all sprints:** 64
**Unallocated backlog points:** 0

---

## Milestone Alignment

| Milestone | Date | What TutorLink Must Be Able to Do |
|-----------|------|-----------------------------------|
| Checkpoint 2 | Wed 22 Apr | Roadmap submitted, Stitch prototype testable, event schema committed, Sprint 1 plan with AC complete |
| Sprint 1 Review | May 7 (Google Meet) | Student can search, view tutor profile, and complete a booking at deployed URL |
| Checkpoint 3 | Thu 21 May | MVP functional (student + tutor flows), all 7 analytics events firing in PostHog, booking history working, 5 user tests planned |
| Peer Assessment | Thu 4 Jun | Product can be demoed without explanation; reviews live; usability test results documented |
| Demo Day | Thu 11 Jun | 7-minute pitch, 5-minute live demo, Q&A ready with real usage data |

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| April 16, 2026 | 1.0 | Initial roadmap created in Lab 6 | Nino Tsutskiridze |

---

*Product Roadmap | TutorLink Team | CS-PD-2026 | Spring 2026*