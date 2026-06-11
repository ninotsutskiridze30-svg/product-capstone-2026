# Moat Statement

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** June 4, 2026

---

## Section B: Moat Hypothesis

*We do not yet have three pieces of repository evidence sufficient to claim a confirmed moat. This section documents the power we are building toward, the evidence gap, and our commitment to collect it before Demo Day.*

---

### The Power We Are Building Toward

**Helmer Power:** Network Effects (Two-Sided) compounding into Switching Costs

---

### Why We Believe This Power Is Accessible

TutorLink is a two-sided marketplace where students need tutors and tutors need students — each side's participation directly increases the value of the platform for the other. As the number of active tutor profiles grows, any given student search returns more relevant results, making the platform more useful; as the number of students booking grows, tutors have more incentive to maintain their profiles, which further improves results for students. This is a classic two-sided network effect, and it is local in structure — it needs to be dense at KIU before it matters at TSU, which allows us to build a defensible position one campus at a time rather than competing nationally from day one.

The switching cost layer compounds on top of this: tutors who accumulate reviews on TutorLink have their professional reputation stored in our platform. A tutor with 20 reviews who switches to a competitor starts from zero reviews there — their reputation does not transfer. This creates a growing switching cost for tutors that strengthens with every session completed and every review submitted, which is why S3-01 (review submission) is the highest-priority Sprint 3 story.

---

### The Evidence Gap

We currently have one directional signal (36.8% smoke test conversion, documented in `03-build/experiments/experiment-evidence.md`) and early NSM data (0.6 sessions/week from 8 active students, documented in `03-build/analytics/analytics-documentation.md`). These confirm demand but do not yet demonstrate the network effect or switching cost in operation. The three pieces of evidence we need are:

| Evidence needed | What it would show | How we will collect it |
|----------------|--------------------|------------------------|
| Week 4 retention cohort showing ≥ 50% of Week 1 student users returning to book a second session | Students are building a booking habit and returning to the platform — the first signal that TutorLink is becoming their default rather than a one-time tool | Export PostHog retention cohort report for the Sprint 2 student cohort (8 users, enrolled May 8–14). Screenshot and commit to `03-build/analytics/retention-cohort-week4.png` by June 4 (Lizi) |
| At least 3 tutors with 5+ reviews who, when asked directly, express reluctance to recreate their profile elsewhere | Tutors who have accumulated reviews experience a real switching cost — their reputation is stored in TutorLink and would be lost on a competitor platform | Mari conducts structured 10-minute check-in conversations with the 5 most active tutors in Sprint 3 Week 2 (May 25–31). Records responses. Commits interview notes to `03-build/analytics/tutor-retention-interviews.md` by June 1 |
| Search result quality improvement measurable between Week 1 (8 tutor profiles) and Week 4 (15+ tutor profiles) | More tutor profiles mean more subject categories covered and more available slots shown per search — a student searching in Week 4 gets more results than a student searching in Week 1, demonstrating the supply-side network effect | Pull PostHog `tutor_search_submitted` events: compare `results_count` property distribution in Week 1 vs Week 4. If median results_count has increased, this demonstrates that adding tutors improves the search experience for students. Luka runs this query and commits output to `03-build/analytics/search-quality-improvement.md` by June 4 |

---

### Our Commitment

**Target date for evidence collection:** June 4, 2026 (Peer Assessment — 7 days before Demo Day)

**Specific first actions and owners:**

- **Lizi Margvelashvili** pulls the PostHog Week 4 cohort retention report and commits it to `03-build/analytics/retention-cohort-week4.png` by June 4. If fewer than 50% of Week 1 students have returned, she documents the actual retention rate and the team discusses whether to revise the moat hypothesis.
- **Mari Janjghava** conducts structured tutor switching-cost conversations with the 5 most active tutors in Sprint 3 Week 2 (May 25–31) and commits notes to `03-build/analytics/tutor-retention-interviews.md` by June 1.
- **Luka Khimshiashvili** runs the PostHog `results_count` query comparing Week 1 and Week 4 search quality and commits the output to `03-build/analytics/search-quality-improvement.md` by June 4.

If by June 4 we have all three pieces of evidence, we will replace this Moat Hypothesis with a Moat Statement (Section A) before Demo Day on June 11.

---

*Moat Statement | TutorLink Team | CS-PD-2026 | Spring 2026*