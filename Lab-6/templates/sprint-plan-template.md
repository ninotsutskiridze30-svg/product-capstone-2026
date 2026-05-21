# Sprint 1 Plan

**Team:** TutorLink Team
**Product:** TutorLink
**Sprint:** 1 of 4
**Dates:** April 24 to May 7 2026
**Product Owner:** Lizi Margvelashvili
**Scrum Master:** Luka Khimshiashvili
**Version:** 1.0

---

## Sprint Goal

A student can sign up, search for a tutor by subject and language preference, view a tutor profile with rate and availability, and confirm a booking — end to end — from a publicly accessible Vercel URL.

---

## Sprint Ceremonies

| Ceremony | When | Where | Who Facilitates |
|----------|------|-------|----------------|
| Sprint Planning | Lab 8, Apr 24 (Group B) | In person | Luka (SM) |
| Daily Standup | 20:00 every Tuesday and Thursday | #standup Messenger group | Async — each member posts independently |
| Sprint Review | May 7, 12:00 | Google Meet | Lizi (PO) |
| Retrospective | May 8, 18:00 | Google Meet | Luka (SM) |

**Async standup format:**
```
Yesterday: [what I completed — include story ID]
Today: [what I am working on — include story ID]
Blocker: [anything stopping me — or "none"]
AI note: [what AI generated yesterday and whether it was accepted / modified / discarded]
```

**Blocker escalation:** If a blocker is not resolved within 24 hours of being posted, Luka posts in the Messenger group tagging all affected members. If still unresolved after another 24 hours, Lizi (PO) adjusts sprint scope.

---

## Definition of Done

A story is Done when every item below is confirmed:

- [ ] Code reviewed by at least one team member who is not the original author
- [ ] Pull request merged to `main` via GitHub PR — no direct pushes to `main`
- [ ] Acceptance criteria confirmed as met by Lizi (PO) — not by the developer who built it
- [ ] If AI-generated: all AI-generated code is annotated with inline comments explaining the logic in the developer's own words
- [ ] If AI-generated: entry added to `docs/ai-usage-log.md` with tool, task, files changed, and review notes
- [ ] Feature works at the deployed Vercel URL — not just locally
- [ ] No new known bugs introduced to the main branch

A story that is "almost done" or "done except for one edge case" is not Done. It stays In Review until every DoD item passes.

---

## Calibration Anchors

| Points | What It Looks Like for TutorLink |
|--------|----------------------------------|
| 1 | Change a button label on the booking confirmation screen |
| 3 | Add subject tag display to the tutor profile card with correct data from the API |
| 5 | Build the tutor search API endpoint with subject and language filtering, returning sorted results |
| 8 | Build tutor profile creation including image upload, subject tagging, rate input, and availability grid — consider splitting before committing |

---

## Sprint 1 Backlog

### Story S1-01: Student Signup

**User Story:**
As a university student looking for a tutor, I want to sign up for TutorLink with my email address or Google account so that I can access the platform and book a session without creating and memorising a new password.

**Interview Evidence:**
Source: Interview 4 (SN, international student, March 25 2026) — searched online for a tutoring platform and found nothing in Georgia; would have created an account immediately if one existed.
Source: Interview 2 (AB, first-year student, March 23 2026) — described the ideal experience as finding a tutor and booking "today" — friction at signup would be the first drop-off point.

**Story Points:** 3
**Assignee:** Nino Tsutskiridze
**AI Tool:** Google Stitch (signup UI screens) + Claude Code (email verification and Google OAuth backend logic)
**AI Tool Rationale:** Stitch generates the signup form UI efficiently from the AC prompt. Claude Code handles the multi-step auth flow (email verification link + Google OAuth) which requires understanding the full backend context, not just autocomplete.

**Acceptance Criteria:**

```
AC1:
Given I am on the signup screen,
When I enter a valid email address and tap "Create Account",
Then I see the message "Check your email to confirm your account" and receive
a verification email within 60 seconds.

AC2:
Given I have received the verification email,
When I click the confirmation link,
Then I am redirected to TutorLink and automatically logged in to the home screen.

AC3:
Given I tap "Continue with Google" on the signup screen,
When I complete the Google OAuth flow,
Then I am logged in and redirected to the home screen without a separate
email verification step.

AC4:
Given I enter an email address that is already registered,
When I tap "Create Account",
Then the form displays: "An account with this email already exists. Log in instead?"
with a link to the login screen.

AC5:
Given I enter a malformed email address (missing @ or domain),
When I tap "Create Account",
Then the form displays "Please enter a valid email address" without submitting.
```

**Notes:** Use Supabase Auth for both email verification and Google OAuth — Luka has prior experience with Supabase. Do not build custom auth. Stitch prompt must include all five error and success states from the AC so Nino can review output against them immediately.

---

### Story S1-02: Student Login

**User Story:**
As a returning student, I want to log in to TutorLink with my email and password so that I can access my bookings and search for tutors without going through signup again.

**Interview Evidence:**
Source: Implicit in all interviews — all 8 interviewees described returning to find the same or a different tutor across multiple sessions. A persistent login is prerequisite for booking history (Sprint 2) and repeat use that drives the NSM.

**Story Points:** 2
**Assignee:** Nino Tsutskiridze
**AI Tool:** GitHub Copilot
**AI Tool Rationale:** Login form is straightforward boilerplate once Supabase Auth is set up in S1-01. Copilot handles the implementation via ambient completion. No new architectural decisions required.

**Acceptance Criteria:**

```
AC1:
Given I am on the login screen,
When I enter my registered email and correct password and tap "Log In",
Then I am taken to the search screen and my session persists for 7 days
without requiring re-authentication.

AC2:
Given I am on the login screen,
When I enter a registered email with an incorrect password,
Then the form displays "Incorrect email or password" without specifying which
field is wrong, and I remain on the login screen.

AC3:
Given I am logged in on one device,
When I open TutorLink on a second device with the same account,
Then I am logged in on both devices simultaneously.
```

**Notes:** S1-02 depends on S1-01 (Supabase Auth must be configured). Do not start S1-02 until S1-01 is Done. Mark this dependency in the sprint tracker. The session persistence duration (7 days) is specified in AC1 — confirm this is set correctly in the Supabase session configuration.

---

### Story S1-03: Tutor Search by Subject and Language

**User Story:**
As a student who needs help with a specific subject, I want to search for available tutors by subject and language preference so that I only see tutors who can actually help me in a language I can work in — without having to message each one individually to find out.

**Interview Evidence:**
Source: Interview 1 (TK, March 22 2026) — "Everything. I did not know their rate, I did not know when they were free. You find out all of that by messaging them."
Source: Interview 2 (AB, March 23 2026) — "I messaged her, she does general English, not academic writing. That is not what I need." Specialisation filter is the specific gap.
Source: Interview 4 (SN, March 25 2026) — "She gave me a name but told me the tutor only speaks Georgian. I do not speak Georgian well enough for a maths lesson." Language filter is critical for international students.
Source: Interview 8 (LG, March 27 2026) — "I can see people in my year who tutor. I just don't know who they are." Visibility is the core problem; search is the solution.

**Story Points:** 5
**Assignee:** Luka Khimshiashvili
**AI Tool:** Claude Code
**AI Tool Rationale:** The search logic requires filtering across subject and language, querying the tutor database, handling empty results, and sorting by availability. This touches multiple files (API endpoint, database query, frontend state management). Claude Code handles multi-file context better than Copilot for this level of complexity.

**Acceptance Criteria:**

```
AC1:
Given I am on the search screen,
When I type "Mathematics" in the subject field and select "English" from the
language dropdown and tap "Search Tutors",
Then I see a results list showing only tutors who teach Mathematics and offer
sessions in English, sorted by availability (available this week first).

AC2:
Given I am on the search results screen,
When there are no tutors matching my search,
Then I see the message: "No tutors found for this subject and language. Try a
different subject or remove the language filter." with a button to clear filters.

AC3:
Given search results are displayed,
When I view a tutor card in the results list,
Then I can see: tutor first name only, primary subject, hourly rate in GEL,
availability badge ("Available this week" or "Currently full"), and star rating
with review count.

AC4:
Given I am on the search screen,
When I tap "Search Tutors" without entering a subject,
Then the subject field displays the error "Please enter a subject to search."
and the search does not submit.

AC5:
Given I have completed a search,
When I tap the back button from the results screen,
Then I return to the search screen with my previous subject and language
filter values pre-filled.
```

**Notes:** Use seeded database with 8 fictional tutor profiles for Sprint 1 demo. Real tutor profiles via self-signup are Sprint 2. Seed data must include tutors in multiple subjects (Mathematics, English, Physics) and both language options (Georgian, English) to make the filter testable. Luka to seed the database by Day 3 of the sprint.

---

### Story S1-04: Tutor Profile View

**User Story:**
As a student who has found a potentially suitable tutor in search results, I want to view their full profile — including subject expertise, hourly rate, available time slots, and reviews — so that I can decide whether to book without needing to message them first.

**Interview Evidence:**
Source: Interview 6 (DK, March 27 2026) — "The worst part is you don't know if the person is any good until you've already committed to a session and paid for it."
Source: Interview 2 (AB, March 23 2026) — described the ideal outcome unprompted: "I would see their name, what they teach, what they charge, some reviews maybe."
Source: Interview 3 (GM, March 24 2026) — "Rates change, availability changes, nothing is written down anywhere." The profile must show current, not historical, information.

**Story Points:** 3
**Assignee:** Mari Janjghava
**AI Tool:** Google Stitch
**AI Tool Rationale:** The tutor profile view is a display screen with no complex backend logic beyond a data fetch. Stitch generates the layout from a detailed AC prompt efficiently, and Mari can review the output against AC quickly.

**Acceptance Criteria:**

```
AC1:
Given I tap a tutor card in the search results,
When the tutor profile screen loads,
Then I see: tutor first name, primary subject and any secondary subjects as
tags, hourly rate in GEL, a list of available time slots for the current week,
a short bio (up to 150 characters), star rating, review count, and a
"Book a Session" primary button.

AC2:
Given I am on the tutor profile screen,
When the tutor has no available slots this week,
Then the "Book a Session" button is replaced with "No slots available this week"
(greyed out) and I see: "Check back next week or message the tutor directly."

AC3:
Given I am on the tutor profile screen,
When the tutor has zero reviews,
Then the review section shows "No reviews yet" rather than a star rating,
and the "Book a Session" button remains active.

AC4:
Given I am on the tutor profile screen,
When I tap the back button,
Then I return to the search results with my previous search filters and scroll
position preserved.
```

**Notes:** For Sprint 1, the review display (AC3) shows static seed data or "No reviews yet" — real review submission is Sprint 3 (S3-01). Mari to confirm with Luka that the tutor object returned by the S1-03 search API includes all fields needed for the profile view before starting Stitch generation, to avoid a mismatch between API response and UI.

---

### Story S1-05: Booking Creation and Confirmation

**User Story:**
As a student who has found a suitable tutor, I want to select a time slot and confirm a booking so that I receive an immediate confirmation that my session is secured and I have a reference I can refer back to.

**Interview Evidence:**
Source: Interview 2 (AB, March 23 2026) — "I would message one person and it would be done." The confirmation is the done moment — it must feel definitive.
Source: Interview 1 (TK, March 22 2026) — described the anxiety of not knowing whether a tutor was actually available until after initiating contact. Confirmation eliminates this anxiety.
Source: Interview 6 (DK, March 27 2026) — "That felt like luck, not a system." A booking reference transforms a lucky outcome into a reliable system output.

**Story Points:** 4
**Assignee:** Lizi Margvelashvili + Luka Khimshiashvili
**AI Tool:** Claude Code (booking API, concurrency handling, reference number generation) + GitHub Copilot (confirmation screen UI boilerplate)
**AI Tool Rationale:** The booking logic — availability slot reservation, concurrency prevention, reference number generation — requires careful multi-file backend implementation. Claude Code handles this. The confirmation screen is simpler UI — Copilot handles that efficiently via completion.

**Acceptance Criteria:**

```
AC1:
Given I am on the tutor profile screen and the tutor has an available slot,
When I tap a time slot and then tap "Book a Session",
Then I am shown a booking summary screen with: tutor first name, subject,
selected date and time, and hourly rate in GEL.

AC2:
Given I am on the booking summary screen,
When I tap "Confirm Booking",
Then a booking record is created, the selected slot is marked unavailable to
all other students, and the confirmation screen appears within 3 seconds.

AC3:
Given the booking is confirmed,
When the confirmation screen loads,
Then I see: tutor first name, subject, date and time of session, rate in GEL,
a unique booking reference number (format: TL-[8 alphanumeric characters]),
and a "Done" button that returns me to the search screen.

AC4:
Given two students attempt to book the same tutor for the same slot at the
same time,
When both submit their booking simultaneously,
Then exactly one booking succeeds and shows the confirmation screen. The other
student sees: "Sorry, this slot was just taken. Please choose another slot."
with a link back to the tutor profile.

AC5:
Given I tap "Done" on the confirmation screen,
When I am returned to the search screen,
Then the tutor's booked slot no longer appears as available in their profile.
```

**Notes:** AC4 (concurrency) is critical for correctness and must be tested with an automated test that fires two simultaneous POST requests to the booking endpoint. Luka writes this test as part of the DoD for S1-05 — it is not optional. The booking reference format (TL-[8 alphanumeric]) must be consistent with the format displayed in the Stitch prototype. Lizi owns the confirmation screen UI; Luka owns the booking API and concurrency test.

---

## Sprint 1 Summary

| Story ID | Summary | Points | Assignee | AI Tool | Status |
|----------|---------|--------|----------|---------|--------|
| S1-01 | Student signup | 3 | Nino | Stitch + Claude Code | Not started |
| S1-02 | Student login | 2 | Nino | Copilot | Not started |
| S1-03 | Tutor search by subject and language | 5 | Luka | Claude Code | Not started |
| S1-04 | Tutor profile view | 3 | Mari | Stitch | Not started |
| S1-05 | Booking creation and confirmation | 4 | Lizi + Luka | Claude Code + Copilot | Not started |
| **Total** | | **17** | | | |

**Capacity check:** 17 points committed out of approximately 31 maximum (55% — target 60% or below) ✓

---

## Sprint Review Criteria

At Sprint Review (May 7, Google Meet), Lizi (PO) will demo:

1. Sign up as a new student using email (S1-01) — live, using a real email address
2. Search for a Mathematics tutor with English language filter (S1-03, S1-04)
3. Open a tutor profile and select an available time slot (S1-04)
4. Confirm the booking and show the confirmation screen with the reference number (S1-05)

The entire flow runs live at the Vercel deployment URL. No screenshots. No recordings. No switching to localhost. If any step fails, the Sprint Review pauses until it is resolved or the story is marked as not Done.

---

## AI Usage Log Reference

All AI-assisted work in Sprint 1 must be logged in `docs/ai-usage-log.md` before the PR is raised.

Entry format:
```
Date: [YYYY-MM-DD]
Story: [Story ID] — [Story summary]
Tool: [Google Stitch / Claude Code / GitHub Copilot / Google AI Studio]
Task: [What the AI was asked to generate or assist with]
Prompt summary: [Brief description of the prompt used]
Files changed: [List of files the AI output touched]
Result: Accepted / Modified / Discarded
Review notes: [What was checked. What was changed from the AI output. Any errors or hallucinations found.]
Reviewer: [Name of team member who reviewed]
```

---

## Change Log

| Date | Changes | Author |
|------|---------|--------|
| April 16, 2026 | Sprint 1 plan created in Lab 6 | Lizi Margvelashvili |

---

*Sprint 1 Plan | TutorLink Team | CS-PD-2026 | Spring 2026*