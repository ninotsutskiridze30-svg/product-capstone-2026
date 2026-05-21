# Four Filters Evaluation

**Team Name:** TutorLink Team
**Date:** March 20, 2026
**Members present:** Nino Tsutskiridze, Mari Janjghava, Luka Khimshiashvili, Lizi Margvelashvili

---

## Problem Candidates Being Evaluated

All problem candidates drawn from `00-foundation/all-problem-statements.md`.

| # | Problem Candidate | Proposed by |
|---|-------------------|-------------|
| 1 | Students cannot efficiently find available, affordable tutors — search is fragmented across word-of-mouth and group chats | Nino |
| 2 | Private tutoring sessions lose time because tutor keeps no written record of previous lessons | Nino |
| 3 | Student tutors at KIU systematically undercharge and cannot raise rates with existing clients | Nino |
| 4 | Students lose the reasoning behind methods explained in tutoring sessions and cannot reconstruct it when studying alone | Lizi |
| 5 | Parents paying for private tutoring have no reliable way to assess whether sessions are producing progress | Lizi |
| 6 | Private tutors spend 30–45 minutes per week managing scheduling logistics over WhatsApp | Lizi |
| 7 | CS students who fall behind cannot find a peer tutor without publicly exposing their struggle | Luka |
| 8 | Formal peer mentoring relationships at KIU collapse after 4–5 weeks because neither party has a structured agenda | Luka |
| 9 | Private tutors cannot accurately assess a new student's level in the first session — self-reported level is consistently wrong | Luka |
| 10 | Students cannot find specialist tutors (e.g. academic writing vs. general English) through informal channels | Mari |
| 11 | Exam-prep students receive irrelevant curriculum content because tutor is unfamiliar with the specific exam format | Mari |
| 12 | Private tutors lose lesson continuity across sessions and students due to informal, non-shared record-keeping | Mari |

---

## Scoring Reference

For each filter, score 1 to 3:
- **3** = Clear evidence this passes
- **2** = Possible pass — uncertain, needs more information
- **1** = Fails this filter

| Filter | What it measures |
|--------|-----------------|
| Real and Recurring | Happens often enough to justify building a solution |
| Painful Enough to Act | People are already trying to solve it (workarounds exist) |
| Underserved Today | Existing solutions are genuinely inadequate |
| Accessible to You | You can interview users this week and build for this space |

---

## Evaluations

### Problem 1: Students cannot efficiently find available, affordable tutors

**Real and Recurring**
- Score: 3/3
- Justification: Nino experienced this directly this semester — a week-long search across three group chats, resulting in contacts that were already full, had raised their rates, or taught at inconvenient times. Luka experienced a version of this in his first semester when trying to find a peer tutor for programming. All four team members can name classmates who described the same fragmented search. It recurs at the start of every semester and before every exam period.

**Painful Enough to Act**
- Score: 3/3
- Known workaround: Students ask in multiple WhatsApp and Messenger group chats, compile names from replies, then contact each person individually to check availability, rate, and schedule fit. Each contact is a separate conversation. If a tutor is unavailable, the student starts over.
- Justification: The workaround is active and time-consuming — Nino estimates it took close to a week for one subject. The deeper consequence is that students who cannot find a tutor quickly enough simply go without, which compounds into worse academic outcomes. The pain is real and the stakes (exam performance) are high enough that students are motivated to act.

**Underserved Today**
- Score: 3/3
- Existing solutions: Facebook groups, WhatsApp group chats, word-of-mouth, and informal recommendations. No Georgian-language tutoring marketplace with real-time availability or structured search exists for the KIU context. TutorLink is an early-stage prototype attempting to address this gap, which confirms the market is unserved rather than overlooked.
- Justification: We spent time trying to find a maths tutor using only available Georgian platforms. The experience replicated exactly what Nino described — no structured search, no availability data, no rate transparency. Existing approaches are entirely manual.

**Accessible to You**
- Score: 3/3
- Who could you interview this week: Every team member can name 5+ students who have searched for tutors in the past two semesters. We can reach them by WhatsApp today. Nino can also reach student tutors directly through the CS programme network.
- Justification: We are in the target user group. Our social network is full of both sides of this problem — students who have searched for tutors and students who tutor. No special access is required.

**Total: 12/12**
**Recommendation: Strong candidate. Primary priority.**

---

### Problem 6: Private tutors spend 30–45 minutes per week managing scheduling over WhatsApp

**Real and Recurring**
- Score: 3/3
- Justification: Lizi has directly observed this in two independent cases — both cousins who tutor privately. One showed Lizi 14 unread scheduling messages during a family dinner, across six different student family chats. The problem is not occasional — it is structural to how tutoring relationships are managed in Georgia, where all communication defaults to WhatsApp with no shared tool.

**Painful Enough to Act**
- Score: 3/3
- Known workaround: Tutors maintain separate WhatsApp conversations with each student family, rely on personal memory and phone calendar reminders to hold the schedule together, and handle all rescheduling requests manually — checking their own calendar, proposing alternatives via text, and confirming back. Cancellations have no record, which creates disputes about make-up sessions.
- Justification: Both of Lizi's cousins have explicitly said they have turned down new students specifically because managing more schedules feels unsustainable. This is a direct, quantifiable financial consequence: lost income from students they would have taken if the overhead were lower.

**Underserved Today**
- Score: 3/3
- Existing solutions: Generic scheduling tools (Calendly, Google Calendar) exist but are not designed for the tutor-student context — they do not handle student-family communication, cancellation policies, or per-student session history. No Georgian-localised tool for independent tutors exists. Both cousins have been aware of scheduling tools and have not found any that fit their workflow.
- Justification: The gap is real. The existing tools solve the wrong version of the problem.

**Accessible to You**
- Score: 3/3
- Who could you interview this week: Lizi has two direct contacts who can be interviewed immediately. Through those contacts, referrals to other tutors in their network are available. KIU students who tutor privately are identifiable through the programme network.
- Justification: Lizi has first-name relationships with real people who have this problem right now. We can schedule interviews for this week with no friction.

**Total: 12/12**
**Recommendation: Strong candidate. Close second.**

---

### Problem 5: Parents cannot assess whether tutoring is producing progress

**Real and Recurring**
- Score: 3/3
- Justification: Lizi observed this directly — her neighbour paid three months of weekly tutoring sessions before discovering, via a class test result, that the tutor had been repeating the same grammar unit for six weeks. The neighbour had no way to know because the only reporting mechanism was verbal and positive at every pickup. This failure mode is structural — informal tutor reporting creates no accountability, and test scores arrive too late to course-correct.

**Painful Enough to Act**
- Score: 3/3
- Known workaround: Parents rely on verbal updates at pickup (always positive, never specific), ask their child what was covered (child gives vague answer), and wait for test scores as the only external signal. Some send a WhatsApp message to the tutor after a bad test result, but this is socially uncomfortable and most avoid it.
- Justification: Lizi's neighbour's experience resulted in three months of paid sessions producing no detectable improvement. The financial cost is direct and significant. The emotional cost — realising a child's learning was mismanaged and the opportunity to intervene was missed — is also high.

**Underserved Today**
- Score: 2/3
- Existing solutions: None specifically. The absence of solutions is the problem — there is no tool for tutor-to-parent progress reporting in the Georgian private tutoring market. However, a key dependency is tutor cooperation: a progress-reporting tool only works if the tutor uses it, which may require a separate product or incentive design.
- Justification: Underserved is clear, but the two-sided dependency (both parent and tutor must adopt the tool) adds implementation complexity that slightly reduces this score.

**Accessible to You**
- Score: 2/3
- Who could you interview this week: Lizi can reach her neighbour directly. Other parents of tutored students require one additional step — outreach through school networks or tutor referrals. This is reachable but not as immediate as problems where we are the user.
- Justification: Accessible but requires slightly more effort than problems where team members are the target user.

**Total: 10/12**
**Recommendation: Strong candidate. Keep as secondary ICP.**

---

### Problem 12: Private tutors lose lesson continuity across sessions due to informal record-keeping

**Real and Recurring**
- Score: 3/3
- Justification: Mari has direct experience from 8 months of tutoring privately — she used a handwritten notebook per student that was not shared with students or parents. When a student missed three sessions and returned, she could not reconstruct exactly where they had stopped. She inadvertently retaught already-covered content. This is not an edge case — every tutor who does not use a structured system faces this every time a session is missed or a student is paused.

**Painful Enough to Act**
- Score: 2/3
- Known workaround: Personal notebooks (not shared), mental memory between sessions, asking the student to summarise what they remember. Some tutors take photos of handwritten notes.
- Justification: The workaround exists but is low-effort relative to the pain. Tutors have normalised the problem rather than actively fighting it. This suggests the pain may be below the threshold that would motivate strong adoption of a new tool, unless the value proposition is very clear.

**Underserved Today**
- Score: 3/3
- Existing solutions: No Georgian-localised tutoring session log exists. Generic note apps (Google Keep, Notion) exist but require the tutor to design their own system, which most do not do.
- Justification: The gap is real. But this problem is most compelling when combined with the parent visibility problem (Problem 5) — a shared session log solves both simultaneously.

**Accessible to You**
- Score: 3/3
- Who could you interview this week: Mari herself is a former tutor with direct experience. Lizi has two cousins who tutor. Through the CS network we can reach several more.
- Justification: Highly accessible.

**Total: 11/12**
**Recommendation: Strong candidate. Note that it overlaps significantly with Problems 5 and 6 and may be best addressed as part of a combined tutor-side tool.**

---

### Problem 9: Tutors cannot accurately assess a new student's level in the first session

**Real and Recurring**
- Score: 3/3
- Justification: Luka knows two people who tutor maths privately. Both described the same pattern independently — students report being "fine with quadratics" and cannot solve a linear equation. One tutor now uses the entire first session for informal diagnostics, meaning the family pays for a session with no actual teaching. This is not an edge case — it happens with almost every new student.

**Painful Enough to Act**
- Score: 2/3
- Known workaround: Ad-hoc diagnostic problems at the start of the relationship (paid first session), informal questions about recent school topics, asking the parent what the child's grades have been.
- Justification: Tutors have developed workarounds but they are imprecise and costly to the family. The pain is real but less acute than Problems 1 or 6 — it is a one-time cost per student, not a recurring weekly burden.

**Underserved Today**
- Score: 2/3
- Existing solutions: Standardised curriculum frameworks exist but tutors rarely use them. No lightweight diagnostic tool designed for the Georgian tutoring context exists.
- Justification: Underserved but a relatively narrow problem. Solving it requires subject-specific diagnostic content, which significantly raises the scope of what needs to be built.

**Accessible to You**
- Score: 3/3
- Who could you interview this week: Luka can reach both tutors directly. Mari has tutoring experience. Access is immediate.

**Total: 10/12**
**Recommendation: Possible candidate. High accessibility and real problem, but narrower scope and lower recurring pain than top candidates.**

---

### Problem 3: Student tutors at KIU undercharge and cannot raise rates

**Real and Recurring**
- Score: 2/3
- Justification: Nino knows five people who tutor and has heard versions of "I don't know if I'm charging too little" from all of them. Two have not raised their rate in over a year. However, the problem is more persistent discomfort than an acute recurring crisis.

**Painful Enough to Act**
- Score: 1/3
- Known workaround: Tutors avoid raising rates rather than solving the problem. The coping mechanism is inaction.
- Justification: When the workaround is inaction, pain-to-act is low. Tutors are absorbing the loss rather than seeking a solution. This makes product adoption harder.

**Underserved Today**
- Score: 2/3
- Existing solutions: None specific to the Georgian tutoring market for rate guidance.

**Accessible to You**
- Score: 3/3

**Total: 8/12**
**Recommendation: Possible candidate. Real problem but low pain-to-act score limits product viability.**

---

### Problem 11: Exam-prep students receive irrelevant curriculum content

**Real and Recurring**
- Score: 3/3
- Justification: Mari's brother is experiencing this directly — a tutor teaching from a general secondary school maths curriculum when the student is preparing for the national university entrance exam. Two sessions were spent on topics not tested in the exam.

**Painful Enough to Act**
- Score: 3/3
- Known workaround: Students and parents do not have a reliable way to identify this misalignment until they look at the exam format themselves, which most do not do. The tutor continues teaching at their default level because no one corrects them.
- Justification: Students preparing for entrance exams have a fixed time window. Irrelevant content directly reduces preparation time for what is tested. The stakes are high — exam results determine university placement.

**Underserved Today**
- Score: 2/3
- Existing solutions: Exam syllabi are publicly available but tutors do not always consult them. No tool aligns tutor content to specific exam formats in the Georgian context.

**Accessible to You**
- Score: 2/3
- Who could you interview this week: Mari can reach her brother and, through him, classmates also preparing for the same exam. Reaching tutors in this segment requires more outreach effort.

**Total: 10/12**
**Recommendation: Strong candidate. High pain and clear consequence. Somewhat narrow — specific to exam-prep context.**

---

### Problems 2, 4, 7, 8, 10 — Rapid Evaluation

| Problem | R&R | P2A | Underserved | Accessible | Total | Note |
|---------|-----|-----|-------------|------------|-------|------|
| 2 — Sessions waste time, no lesson notes | 3 | 2 | 3 | 3 | 11/12 | Real but low pain-to-act; tutors normalise it |
| 4 — Students lose session reasoning | 2 | 1 | 2 | 3 | 8/12 | Mild pain; students have accepted this |
| 7 — CS students can't find peer tutor privately | 2 | 2 | 2 | 3 | 9/12 | Niche within a niche |
| 8 — Mentoring collapses after 4–5 weeks | 2 | 1 | 2 | 2 | 7/12 | Institutional problem, not individual pain |
| 10 — Cannot find specialist tutors | 2 | 2 | 3 | 3 | 10/12 | Variant of Problem 1; doesn't add new direction |

---

## Summary Scorecard

| Problem | R&R | P2A | Underserved | Accessible | Total | Recommendation |
|---------|-----|-----|-------------|------------|-------|----------------|
| 1 — Tutor discovery fragmented | 3 | 3 | 3 | 3 | 12/12 | Strong — Primary |
| 6 — Scheduling overhead for tutors | 3 | 3 | 3 | 3 | 12/12 | Strong — Close second |
| 12 — Lesson continuity / record-keeping | 3 | 2 | 3 | 3 | 11/12 | Strong |
| 2 — Sessions waste time, no lesson notes | 3 | 2 | 3 | 3 | 11/12 | Strong |
| 5 — Parents can't assess progress | 3 | 3 | 2 | 2 | 10/12 | Strong — Secondary ICP |
| 9 — Tutor can't assess new student level | 3 | 2 | 2 | 3 | 10/12 | Strong |
| 11 — Exam-prep gets wrong curriculum | 3 | 3 | 2 | 2 | 10/12 | Strong |
| 3 — Tutors undercharge, can't raise rates | 2 | 1 | 2 | 3 | 8/12 | Possible |
| 4 — Students lose session reasoning | 2 | 1 | 2 | 3 | 8/12 | Possible |
| 7 — CS students can't find peer tutor | 2 | 2 | 2 | 3 | 9/12 | Possible |
| 10 — Can't find specialist tutor | 2 | 2 | 3 | 3 | 10/12 | Strong (variant of #1) |
| 8 — Mentoring collapses early | 2 | 1 | 2 | 2 | 7/12 | Weak |

---

## Shortlist

1. **Problem 1 — Tutor discovery is fragmented (12/12):** Maximum score across all four filters. Grounded in direct personal experience from multiple team members. The pain is high (students go without tutoring rather than continue the exhausting search), the market is clearly unserved in Georgia, and we have immediate access to both sides of the problem. This is our primary candidate.

2. **Problem 6 — Scheduling overhead for tutors (12/12):** Equal score but chosen as second because the user (independent tutor) is slightly less immediately accessible than fellow students. The financial consequence (turned-down students) is clear and compelling. This remains a strong candidate and would be a natural second product surface if we build for Problem 1 (a discovery platform also solves the scheduling coordination problem for tutors).

3. **Problem 5 — Parents cannot assess tutoring progress (10/12):** Chosen as third because it represents a distinct user (parent, not student or tutor), keeps a genuinely different ICP alive, and is directly supported by observed evidence. It also naturally connects to Problems 6 and 12 — a tutor tool that solves scheduling and session tracking simultaneously creates the data that parents need.

---

## Team Discussion Notes

The main discussion was between Problems 1 and 6. Both scored 12/12. The argument for Problem 6 (scheduling) was that the user — an independent tutor — is a paying business user, which makes monetisation cleaner. The argument for Problem 1 (discovery) was that it affects more people more acutely, and that the tutor discovery problem also surfaces the scheduling problem as a second layer (a tutor who is hard to find is also hard to book).

The team agreed that Problem 1 is the primary commitment because it sits at the top of the funnel — a student who cannot find a tutor at all experiences a worse version of the problem than a student who found a tutor but is wasting 30 minutes on scheduling. Discovery unlocks everything else. Scheduling is a natural second surface.

Mari raised the concern that Problem 11 (exam-prep curriculum mismatch) had very high pain but lower accessibility. We agreed to note it as a future direction — if our interviews surface this frequently, we will revisit. It does not displace the primary commitment.

There were no unresolved disagreements. The decision was unanimous.

---

## Decision

**Our committed problem for Lab 2 is:**

> University students in Georgia who need private tutoring spend significantly more time and effort finding a suitable tutor than the task should require, because the discovery process is entirely fragmented across word-of-mouth channels with no visibility into tutor availability, rates, or subject specialisation.

**Four Filters score:** 12/12

**The runner-up problem we are keeping alive as our secondary ICP candidate is:**

> Parents of secondary school students in Tbilisi who pay for private tutoring have no reliable way to assess whether sessions are producing academic progress before a disappointing test result confirms a problem that has been developing for weeks.

**Four Filters score:** 10/12

---

*CS-PD-2026 | Kutaisi International University | Spring 2026*