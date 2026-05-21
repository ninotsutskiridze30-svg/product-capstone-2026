# High-Fidelity Prototype: Stitch

**Team:** TutorLink Team
**Product:** TutorLink
**Tool:** Google Stitch (https://stitch.withgoogle.com)
**Created:** April 9, 2026
**Status:** Draft (Lab 5) / Final (by April 23)

---

## Prototype Link

**Stitch shareable link:**
https://stitch.withgoogle.com/share/tutorlink-team-lab5-draft

**Tested in incognito window:** ☑ Yes

---

## What This Prototype Covers

**Core user flow prototyped:**
A student searches for a tutor by subject, views a tutor's profile with availability and rate, and confirms a booking — completing the activation moment.

**Screens included:**

| Screen | Purpose | Activation Event Fired |
|--------|---------|----------------------|
| Search | Student enters subject, selects language preference, and taps Search | None |
| Results | Student sees a list of matched tutor profiles with subject, rate, availability badge, and review count | None |
| Tutor Profile | Student views full tutor profile — subject expertise, rate, available time slots, and reviews | None |
| Booking Confirmation | Student reviews session details and taps Confirm Booking | `session_booked` |

**Activation moment screen:** Booking Confirmation
**What the user does at activation:** Taps the "Confirm Booking" button after reviewing tutor name, subject, session date, time slot, and rate in GEL.
**NSM connection:** Each tap of "Confirm Booking" fires `session_booked`, which increments the weekly session count for this `user_id` and directly drives the NSM.

---

## Stitch Brief Used

```
Product name: TutorLink

Primary user: A university student in Georgia (age 18-24, studying at KIU or a
similar institution) who needs a private tutor for a specific subject and currently
has no way to find one except by posting in WhatsApp group chats and messaging
people individually.

Most important flow: Student searches for a tutor by subject, sees a results list
with tutor availability and rate visible, opens a tutor profile, and confirms a
booking — receiving a booking confirmation screen.

Screens required:
1. Search screen — subject input, language preference selector, Search button
2. Results screen — list of 4 tutor cards showing name (anonymised), subject,
   hourly rate in GEL, availability badge (Available / Full), and star rating
3. Tutor profile screen — subject expertise tags, hourly rate, available time
   slots this week, short bio, review count and star rating, Book a Session button
4. Booking confirmation screen — confirmation of tutor, subject, date, time slot,
   rate, and a large Confirm Booking primary button

Activation moment: User taps Confirm Booking on screen 4. This fires session_booked.

Visual style: Clean and minimal. Primary colour Georgian blue (#0052A5). White
background. Mobile-first at 375px width. Body text in Inter or system sans-serif.
Warm and approachable, not corporate.
```

---

## Key Prompts Used

**Initial prompt:**
```
Build a mobile-first web app called TutorLink for university students in Georgia
who need to find a private tutor.

Screen 1 — Search:
Page title: "Find a Tutor". A subject text input labelled "What subject do you
need help with?" with placeholder text "e.g. Mathematics, English, Physics". A
segmented control labelled "Language" with two options: Georgian and English.
A large primary button labelled "Search Tutors" in Georgian blue (#0052A5).
White background. Subtle grey border on inputs.

Screen 2 — Results:
Heading: "Tutors available for Mathematics". A list of 4 tutor profile cards.
Each card: a circular avatar placeholder (no real photo), a first-name-only
label (Tutor A, Tutor B, Tutor C, Tutor D), a subject tag, an hourly rate in
GEL (e.g. "35 GEL / hour"), a green "Available this week" badge on cards 1 and
3, a grey "Currently full" badge on cards 2 and 4, a star rating (4.8, 4.5,
4.9, 4.2), a review count in grey text (e.g. "12 reviews"). Each card is
tappable and leads to Screen 3.

Screen 3 — Tutor Profile:
Back arrow at top. Tutor first name as page heading. Subject expertise tags
(e.g. "Calculus", "Algebra", "Statistics") displayed as pill-shaped badges.
Hourly rate: "35 GEL per hour". Available time slots this week displayed as
a horizontal row of pill buttons: "Mon 18:00", "Wed 16:00", "Thu 19:00" —
one is pre-selected in blue. A short bio: "Third-year Mathematics student at
KIU. Tutored 14 students over 2 semesters." Star rating and review count.
A primary button: "Book a Session" in Georgian blue.

Screen 4 — Booking Confirmation:
A summary card: tutor first name, subject, selected date and time, rate per
hour. A clear section header: "Confirm your booking". A large primary button:
"Confirm Booking" in Georgian blue. A secondary text link below: "Cancel".

Navigation: Screen 1 → Screen 2 on Search button tap. Screen 2 → Screen 3 on
card tap. Screen 3 → Screen 4 on Book a Session tap.

Style: Mobile-first, 375px wide. Georgian blue (#0052A5) primary. White
background. Inter or system sans-serif. Clean, minimal, approachable.
```

**Iteration prompts:**
```
On the Booking Confirmation screen (Screen 4): add a green checkmark icon above
the summary card. Make the Confirm Booking button larger — full width. Add a
small line below the button in grey text: "Your session is not confirmed until
you tap Confirm Booking."
```

```
On the Results screen (Screen 2): add a subtle filter row below the heading
with two filter pills: "Available this week" (pre-selected, blue) and "English
language" (unselected, grey outline). This makes the filtering visible without
adding a separate filter screen.
```

---

## Design Decisions

**Decision 1:** First-name-only display for tutors on the Results screen.
Chosen because our interview data showed students are primarily motivated by subject expertise, rate, and availability — not by knowing the tutor's full identity before viewing their profile. First-name-only reduces social awkwardness for tutors (who may not want their full name publicly searchable) while still feeling personal. This emerged directly from Interview 5 (MT), who expressed hesitation about public visibility.

**Decision 2:** Rate displayed in GEL on every card in the Results screen.
Chosen because price opacity was the single most common failure mode in our interview data. TK (Interview 1) had to contact tutors individually to find out their rate. GM (Interview 3) was surprised by a rate change mid-search. Displaying the rate visibly on the card eliminates this friction and lets students filter by affordability before initiating any contact.

**Decision 3:** Review count and star rating visible on Results cards before profile click.
Chosen because trust is a conversion blocker, not just an afterthought. AB (Interview 2) described wanting "some reviews maybe" as the first thing they mentioned when asked to describe an ideal search outcome. DK (Interview 6) paid for a session before being able to assess quality. Surfacing review data at the card level means students can assess credibility before choosing who to click.

---

## What Lab 6 Will Add

- Backend logic: user authentication, booking record creation, tutor availability slot management
- Event schema instrumentation: `session_booked`, `tutor_search_submitted`, `tutor_profile_viewed` firing with correct properties
- Real data persistence: bookings save to database; tutor profiles load from database
- Vercel deployment: public URL for real user testing

**Live app URL (completed after Lab 6):**
[Paste Vercel deployment URL here after Lab 6]

---

## Export

**Export format:** HTML/CSS/JS zip
**Export file location in repo:** `02-design/prototypes/high-fidelity/stitch-export/`

---

*Stitch Prototype | TutorLink Team | CS-PD-2026 | Spring 2026*