# Unit Economics — Sakheli

**Template:** `Lab-9/templates/unit-economics-template.md`
**Worked example reference:** `Lab-9/examples/growth-modeling-worked-example.md`

All currency in **Georgian Lari (₾)** unless noted. 1 USD ≈ 2.65 GEL as of May 2026 (Bank of Georgia mid-rate, used as the conversion benchmark throughout — sourced 2026-05-17).

---

## Assumptions register (transparent inputs)

Every number that goes into the CAC and LTV calculations below is listed here with its **source class**: `measured` (we have the data), `benchmark` (industry/comparable platform reference), or `estimate` (informed guess we will replace with measured data as soon as available). Per the rubric, unsourced assumptions kill points; every input has a class label.

| # | Input | Value | Class | Source |
|---|---|---|---|---|
| A1 | Avg hourly rate set by tutors on platform | ₾35/hr | estimate | Range observed across 4 informal interviews with Georgian exam-prep tutors (Apr 2026); midpoint of ₾20–₾50 |
| A2 | Avg lesson length | 60 min | estimate | Sprint 1 booking flow defaults; informal interviews confirmed 60 min is the modal choice for high-school students |
| A3 | Platform take rate | 15% | strategic choice | Positioned vs Preply (18–33%), iTalki (15%), Tutorful (22%); see [growth-strategy.md](../growth-strategy.md) |
| A4 | Revenue per lesson (to platform) | A1 × A3 = ₾5.25 | derived | |
| A5 | Avg lessons per active student per week | 2 | benchmark | Preply 2024 marketplace report — exam-prep cohort averages 1.8–2.3 lessons/wk |
| A6 | Active student lifespan during exam-prep cycle | 24 weeks | benchmark | Georgian national exam cycle is Oct–early July; intense prep typically Oct–March (~24 weeks) per Ministry of Education timeline |
| A7 | LiveKit Cloud cost per participant-minute | $0.004 | measured | LiveKit Cloud pricing page, May 2026 |
| A8 | Lesson participants | 2 (tutor + student) | measured | 1-on-1 lessons only in MVP |
| A9 | Variable infrastructure cost per lesson | 60 min × 2 × $0.004 × 2.65 = ₾1.27 | derived | A7 × A8 × A2 × FX |
| A10 | Variable storage cost per lesson (homework files, recording metadata) | ₾0.05 | estimate | 5 MB/lesson avg × Supabase Storage pricing |
| A11 | Total variable cost per lesson | A9 + A10 = ₾1.32 | derived | |
| A12 | Contribution margin per lesson | A4 − A11 = ₾3.93 | derived | |
| A13 | Telegram-content cost per signup | ₾0 marginal | measured | Organic content channel; only our time |
| A14 | IG/TikTok content cost per signup | ₾2 estimate | estimate | Assumes occasional ₾20–₾50 boost on top-performing posts; spread over expected reach. Replace with measured number after first 30 days. |
| A15 | Referral channel cost per signup | ₾1.32 (one free first lesson eaten by platform) | derived | A11 |

---

## CAC per channel (with arithmetic shown)

### Telegram student communities

- Direct spend: ₾0
- Founder time cost: ~4 hr/week × ₾30/hr opportunity cost = ₾120/week
- Estimated signups/week at steady state (after Month 2): 15 → CAC = 120 / 15 = **₾8.00**
- Notes: this is *time-CAC* not cash-CAC; cash CAC = ₾0. The time-CAC line item is what disappears if we hire a community manager.

### Tutor referral loop

- Per-signup spend: A15 = **₾1.32** (we eat the first lesson)
- Founder time cost amortised: zero per signup once the referral mechanic is shipped
- **CAC = ₾1.32**

### IG / TikTok content

- Per-signup spend (boost): A14 = ₾2.00
- Founder + tutor time: ~3 hr/video × 1.5 videos/wk × ₾30 = ₾135/wk
- Estimated signups/wk at steady state: 10 → time-CAC = 135 / 10 = ₾13.50
- **Cash CAC = ₾2.00; blended (time + cash) CAC = ₾15.50**

### Blended CAC (weighted by expected signup share — see [growth-projection.xlsx](../growth-projection.xlsx))

Expected month-6 mix: 50% referral, 30% Telegram, 20% IG/TikTok

```
Blended cash CAC = 0.50 × 1.32 + 0.30 × 0 + 0.20 × 2.00
                 = 0.66 + 0 + 0.40
                 = ₾1.06 per signup
```

---

## LTV per student (with arithmetic shown)

```
Revenue per lesson to platform           A4   = ₾5.25
Lessons per active student per week      A5   = 2
Active lifespan in weeks                 A6   = 24
Total lessons over lifespan                   = 2 × 24 = 48
Lifetime revenue per student                  = 48 × ₾5.25 = ₾252.00

Contribution margin per lesson           A12  = ₾3.93
Lifetime contribution per student              = 48 × ₾3.93 = ₾188.64
```

**LTV (revenue basis):** **₾252.00**
**LTV (contribution basis):** **₾188.64** — the meaningful one for unit-economic ratios because it nets out the variable infrastructure cost.

We do **not** yet have measured churn data, so the 24-week lifespan above is the *cycle-driven* lifespan — students leave at the end of the exam cycle regardless of product satisfaction. For a marketplace, that bounds LTV more than churn does. If we add post-exam features (university-level tutoring) the lifespan extends; that is a Sprint 3+ product decision.

---

## LTV : CAC ratio per channel

| Channel | Cash CAC | LTV (contribution) | LTV : CAC | Verdict |
|---|---|---|---|---|
| Tutor referral | ₾1.32 | ₾188.64 | **143 : 1** | excellent; this is the channel to lean into |
| Telegram content (cash) | ₾0 | ₾188.64 | ∞ | excellent; constrained by our time, not capital |
| Telegram content (time-loaded) | ₾8.00 | ₾188.64 | 24 : 1 | still excellent even with time costed in |
| IG/TikTok content | ₾2.00 | ₾188.64 | 94 : 1 | excellent; the cash floor is low even with paid boosts |
| **Blended (cash)** | **₾1.06** | **₾188.64** | **178 : 1** | |

Rule of thumb: LTV:CAC > 3 is healthy, > 5 is excellent. Our economics look very healthy because **monetisation per lesson is small, but acquisition is near-free at MVP scale**. The risk is on the *signup-to-first-lesson* conversion rate, not on the unit economics themselves. That's why our experiment in Sprint 2 (see [../../03-build/experiments/experiment-results.md](../../03-build/experiments/experiment-results.md)) targets the activation step.

---

## Payback period

```
Avg time from signup to first paid lesson booking (estimate)         = 2 weeks
Avg revenue per active student per week = A4 × A5 = ₾5.25 × 2        = ₾10.50
Avg contribution per active student per week = A12 × A5 = ₾3.93 × 2  = ₾7.86

Blended cash CAC                                                      = ₾1.06
Payback in lessons (cash)                                             = 1.06 / 3.93 = 0.27 lessons
                                                                      → paid back on the first lesson
Payback in weeks                                                      < 1 week after first lesson

Time-loaded CAC (blended)                                            ≈ ₾10
Payback in lessons                                                    = 10 / 3.93 ≈ 2.5 lessons
                                                                      → paid back in ~1.5 weeks of active student usage
```

Cash payback is immediate. Time payback (the meaningful one for a founder-led product) is ~1.5 weeks. Both compare favourably to the 3–6 month payback that's healthy for SaaS.

---

## What this analysis is honest about

- **The take rate is a strategic choice, not a market-clearing price.** If tutor recruitment turns out to be the binding constraint, we may have to drop to 10%; LTV halves at 10% take; ratios still healthy.
- **24-week lifespan is the cycle ceiling, not a measured cohort retention.** Once we have one full exam-prep cycle of measured data (mid-2027), replace with actual.
- **Paid acquisition is excluded.** With ~₾80–150 cold-traffic CAC on Meta in this region and LTV ≈ ₾189, paid is roughly LTV:CAC of 1.3 : 1 — break-even, not investable. The plan revisits this only after organic baselines are measured.
- **Tutor-side unit economics** (the supply side) are not modelled here as a separate funnel — they're implicit in the take rate. If tutor churn turns out to be the marketplace's binding constraint we'll need a dedicated tutor-LTV view.
