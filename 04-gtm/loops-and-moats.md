# Loops and Moats — Sakheli

**Template:** `Lab-9/templates/loops-and-moats-template.md`
**Worked example reference:** `Lab-9/examples/growth-modeling-worked-example.md`

---

## 1. Primary growth loop — the tutor referral loop

```
                  ┌──────────────────────────────────┐
                  │                                   │
                  ▼                                   │
    ┌─────────────────────────┐         ┌─────────────────────────┐
    │  Tutor joins Sakheli    │         │  New student gets a     │
    │  (subject + rate set)   │         │  better tutoring exp.   │
    └────────────┬────────────┘         │  on Sakheli than off    │
                 │                       │  (calendar, whiteboard,  │
                 │ Tutor invites their   │  homework integrated)   │
                 │ existing private      └────────────┬────────────┘
                 │ students via their                  │
                 │ referral link                       │ Student tells
                 ▼                                     │ their classmates
    ┌─────────────────────────┐                       │ ("just use this")
    │  Existing students      │                       │
    │  follow the link,       │ ◄─────────────────────┘
    │  sign up, book first    │
    │  lesson (free to        │
    │  student, platform      │
    │  eats LiveKit cost)     │
    └────────────┬────────────┘
                 │
                 │ Tutor now manages all
                 │ their students on Sakheli
                 │ (less admin pain)
                 ▼
    ┌─────────────────────────┐
    │  Tutor reduces off-     │
    │  platform fragmentation │
    │  (one calendar, one     │
    │  payment flow)          │
    └─────────────────────────┘
                 │
                 └──── stickier on the supply side ─────► more tutors
                                                          willing to refer
```

The loop creates value on three sides at once:

1. **For the tutor** — their admin (scheduling, whiteboard for the lesson, homework, payment) consolidates into one place. The tutor's WHY to participate is operational pain relief, not commission.
2. **For the existing student** — a better lesson experience (real-time whiteboard, structured homework, replayable history once we ship recording in Sprint 2).
3. **For the platform** — every tutor who onboards brings a cohort of 3–8 students *who would otherwise never have heard of Sakheli*. These students are then exposed to the marketplace and may book additional tutors for subjects their primary tutor doesn't teach.

---

## 2. K-factor arithmetic

The K-factor measures how many new users each existing user produces during a defined cycle. For our tutor referral loop, the relevant "user" is a *tutor* (the agent who shares); the "new user" is a *student* who signs up via that tutor's link.

```
K  =  i × c

where:
  i = avg invitations sent per active tutor per month
    = (students-per-tutor) × (share-rate)
    = 5 students × 0.6 sharing                      = 3.0

  c = invitation → signup conversion rate
    = (link-click rate) × (signup-completion rate)
    = 0.85 × 0.70                                   = 0.595

K  =  3.0 × 0.595                                   ≈ 1.79
```

**Interpretation:** at our modelled share rate and conversion rate, every active tutor brings 1.79 new students into the platform in their first month on Sakheli. K > 1 means the loop is technically viral; K = 1.79 is a *slow* virality (compared to consumer social where K = 2–3 is common) but for a high-consideration vertical marketplace it is a strong number.

**What can break this:**

- **Share rate of 0.6** is the most fragile input. If tutors don't share because they're worried we'll poach their students (unfounded — we have no incentive to do so, but the worry is real), share rate could drop to 0.2 and K falls to 0.60. Mitigation: tutor-side contract makes "the tutor owns the relationship; the platform takes 15% only on Sakheli-booked lessons" explicit on the tutor dashboard from the first session.
- **Signup-completion rate of 0.70** is benchmarked; not measured. The Sprint 2 experiment (Component 4) targets this number.

**What we will replace with measured data:**

- `i` after Month 1 of tutor onboarding
- `c` from the analytics funnel `tutor_referral_link_clicked` → `signup_completed`

---

## 3. Secondary loop — content → trust → tutor recruitment

```
   IG/TikTok problem-walkthroughs by tutor T
                 │
                 ▼
   Students follow T (or save the video)
                 │
                 ▼
   Some students DM T or book T directly  ────► more demand for T
                                                  on Sakheli
                                                       │
                                                       ▼
                                          T earns more on the platform
                                                       │
                                                       ▼
                                          Other tutors notice
                                          and join
                                                       │
                                                       ▼
                                          More tutors → more on-platform
                                          content → more student signups
```

This is a *content* loop, not a referral loop, and runs on a much longer cycle (~30 day video performance review). It is included because it's the only loop that grows the *supply side*.

---

## 4. Network effects classification

| Type | Present? | Strength | Notes |
|---|---|---|---|
| Direct (same-side) | weak | low | Students don't get more value because other students are present (no group lessons in MVP). Tutors don't get value from other tutors being present. |
| Cross-side (two-sided) | yes | medium | More tutors → more subject coverage → more reasons for any one student to stay; more students → more demand → more tutors. Standard marketplace dynamic. |
| Data | yes (latent) | low → growing | More completed lessons → better matching signal (subject + style + outcome). Doesn't activate until ~500 completed lessons. |
| Social | weak | low | No on-platform social graph yet (no friends-of-friends signal). Sprint 3+ if we add study groups. |

**Honest assessment:** the cross-side effect is real but weak at MVP scale. Marketplace flywheels need both sides to clear a critical-mass threshold before either side strongly benefits. See next section.

---

## 5. Critical mass thresholds

| Side | Threshold | Why |
|---|---|---|
| Tutors | ~30 active tutors across the 4 core subjects (Math, English, Georgian, History) | Below this, a random student arriving on the platform has a ~50% chance of not finding a tutor for their subject and giving up. At 30, every core subject has ≥4 options → ~95% match probability |
| Students | ~100 weekly active students | Below this, an average tutor with 5 hr/wk available sees ≤2 booking requests, which isn't worth their attention. At 100 WAU, expected requests per tutor reaches ~3–4/wk, crossing the "worth opening the app daily" line |
| Both sides paired | the platform's "two-sided liquidity" threshold | Estimated ~30 tutors + 100 students. Until both are met, retention suffers regardless of product quality |

The growth strategy in [growth-strategy.md](growth-strategy.md) is sequenced specifically to hit these — **tutors first via personal outreach (the easiest 5–10) → those tutors bring students via the referral loop → student demand recruits more tutors via the content loop**. The first 6 months target reaching both thresholds.

---

## 6. Moat narrative

A moat is whatever prevents a competitor (Preply expanding into Georgia, a local copycat) from eroding our position once we've reached critical mass.

**What we won't have a moat on:**

- The technical product. Next.js + Supabase + LiveKit + TLDraw can be replicated in a quarter by any competent team. The MVP itself is not defensible.
- Brand alone. Brand is a moat over many years, not a defensible asset in the first year.

**What we plausibly can build a moat on:**

1. **Georgian-language native experience and tutor curation.** Preply has a Georgian-language UI but its tutor pool is global and most tutors don't speak Georgian. A platform whose tutors all speak Georgian and understand the specific national exam curriculum has a recruiting moat that doesn't trivially port.
2. **Tutor-side switching cost via integrated admin.** Once a tutor's calendar, homework history, and student communications all live on Sakheli, moving costs them weeks of disruption. The deeper the workflow integration goes (Sprint 2: recording, Sprint 3: grading templates, billing reports for tutor tax filing), the higher the switching cost.
3. **Exam-cycle data moat.** Per-subject, per-school-cohort completion rates and outcome data accumulate over multiple exam cycles. After 2 cycles we can match students to tutors based on *measured* outcomes — a service no new entrant can offer without our years of data.

**What we will not claim is a moat:**

- "Network effects." See section 4 — they're weak in a 1-on-1 tutoring marketplace.
- "First mover." The Georgian market doesn't reward first-movers without sustained execution.

The realistic moat plan is to build #2 (switching costs) hard during the first year, while #1 (curation + native experience) and #3 (outcome data) compound on their own.
