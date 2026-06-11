# Design Changes — Shipped in Response to Usability Findings

The rubric requires at least one documented design change linked to a specific finding from [usability-findings.md](usability-findings.md). One change is documented below.

---

## Change — Booking confirmation made explicit

**Motivating finding:**
- Participant: S-gd (see [usability-findings.md](usability-findings.md))
- Observation: after completing the booking flow the participant was uncertain the booking had actually succeeded — the founder had to confirm verbally.

**Before:** the booking server action fired, a toast appeared briefly, and the user remained on the slot picker page.

**After:** the booking server action navigates to a confirmation route that explicitly names the tutor, the slot, and the next step ("we'll remind you 15 minutes before"). The toast is retained but the page-level confirmation carries the weight.

**Files touched:** `src/features/booking/`, `src/modules/student-bookings/`.

**Verification:** change is live at https://tutoring-lyart.vercel.app .

---

## Other findings — not addressed before submission

These are real observations from [usability-findings.md](usability-findings.md) that need more than a one-evening change to address. They are recorded here so they are not lost.

- **Tutor calendar-availability settings** are reachable but not obviously placed (T-mg). Sprint 2 — small navigation polish.
- **Subject curriculum-coverage signal on tutor profiles** (S-zk wanted "this tutor knows the national-exam syllabus specifically", not just "physics tutor"). Sprint 2 — schema change required.
- **Marketplace liquidity** is the dominant cross-cutting pattern (see [usability-findings.md](usability-findings.md) §"Cross-cutting observation"). Not a UI change — addressed by the channel plan in [../../04-gtm/growth-strategy.md](../../04-gtm/growth-strategy.md).
