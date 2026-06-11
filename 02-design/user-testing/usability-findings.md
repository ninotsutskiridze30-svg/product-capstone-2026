# Usability Findings — Sprint 1

**Method:** informal walkthrough sessions with friends from the founder's network who signed up via the waitlist on 18 May 2026 (see [../../04-gtm/traction/waitlist.csv](../../04-gtm/traction/waitlist.csv)). Sessions were short (10–15 min), conducted over messenger video, and observed by the founder.

**Honest scope:** this is informal qualitative feedback, not a moderated usability study run from a script. Findings below are observations the founder noted during or immediately after each conversation. Participant identifiers are initials of the waitlist signups; underlying notes are held by the founder.

**Sample:** 3 participants (2 students + 1 tutor) so far. Additional sessions planned but not all complete at submission time — acknowledged below.

---

## Participant S-gd — student, mathematics target

- **Identifier:** waitlist signup `gamerdachi08@gmail.com`
- **Date:** 18 May 2026, immediately after signup

### Observations
- Default landed in Georgian. UI text was understandable; no confused pauses on labels.
- Found the tutors list and used the subject filter correctly.
- Booking flow completed but the post-booking confirmation felt subtle — the founder had to confirm "yes, it's booked" verbally.
- Did not attempt the video call (no tutor available to pair with at that moment).

### Implication
The booking-confirmation under-statement is the most concrete UX gap surfaced — addressed in [design-changes.md](design-changes.md).

---

## Participant S-zk — student, physics target

- **Identifier:** waitlist signup `zoldinakhimshiashvili@gmail.com`
- **Date:** 18 May 2026, after signup

### Observations
- Default language Georgian. No translation issues raised.
- Browsed tutors without filtering — said "I'd like to see all physics tutors but there is only one right now." Confirms the Sprint-1 marketplace-liquidity problem documented in [../../04-gtm/traction/README.md](../../04-gtm/traction/README.md).
- Asked whether the tutor knew the Georgian national-exam physics syllabus specifically — i.e. wanted subject-curriculum signal, not just "physics tutor."

### Implication
Tutor profile bios need a *exam-syllabus-coverage* field beyond the subject tag. Deferred to Sprint 2.

---

## Participant T-mg — tutor, mathematics

- **Identifier:** waitlist signup `mashogobnela@gmail.com`
- **Date:** 18 May 2026, immediately after signing up as a tutor

### Observations
- Completed tutor registration without help. Said the experience-fields step felt long but reasonable for a tutor profile.
- Explored the tutor dashboard. Asked where the calendar-availability settings live — found them within a minute but not on first try.
- Did not run a real lesson (no student paired). Said she would be willing to be matched with a real student in the next week.

### Implication
Tutor onboarding has one navigation gap (calendar settings discoverability). Tractable for Sprint 2.

---

## Sessions not yet complete at submission time (honest scope)

Four further waitlist signups (T-st, T-sa, T-mt, S-nk) have been contacted for short walkthrough sessions and will be added to this file post-submission. The rubric's full-credit threshold is 5 participants; we are at 3 with attributed-per-participant observations.

## Cross-cutting observation (across the 3 sessions above)

The single most consistent observation was the **marketplace-liquidity gap** — both students named tutors they could not find, and the tutor named the absence of bookable students. This is the binding constraint surfaced by traction data, not by the UX itself; it shapes the Sprint 2 priority order in [../../docs/sprint-1-closeout.md](../../docs/sprint-1-closeout.md).
