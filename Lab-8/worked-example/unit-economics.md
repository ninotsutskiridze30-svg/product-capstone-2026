# Unit Economics Analysis

**Team:** TutorLink Team
**Product:** TutorLink
**Document version:** 1.0
**Last updated:** May 8, 2026

---

## 1. Lifetime Value (LTV)

LTV is the total value a customer generates across their entire relationship with your product.

TutorLink has two distinct customer types with different LTV profiles: **tutors** (the paying side) and **students** (the free side with monetisable proxy value). We calculate both.

### Formula

```
LTV = ARPU × Gross Margin × Lifetime
```

---

### LTV — Tutors (Revenue-generating customers)

**ARPU (Average Revenue Per Tutor Per Month):** 30 GEL (~$11)

Source: Unit economics assumptions in Inputs tab of growth-projection.xlsx. Tutor featured plan priced at 30 GEL/month (Expected scenario). Pricing anchor: tutors charge 30–50 GEL per hour; the platform fee pays back in under one session. Comparable SaaS tools for freelancers in similar markets (Calendly, Fiverr Pro) charge $10–$20/month.

**Gross Margin:** 80%

Calculation: (Revenue minus cost to serve) / Revenue
- Revenue per tutor per month: 30 GEL
- Cost to serve per tutor per month: ~6 GEL (Supabase + Vercel infrastructure pro-rated per active tutor at MVP scale; estimated at $20/month total infra / ~10 paying tutors in Sprint 2 = $2/tutor ≈ 5.5 GEL)
- Gross margin = (30 − 6) / 30 = **80%**

Source: Conservative estimate. At scale, infrastructure cost per tutor drops as fixed costs are spread across a larger base, improving margins to 90%+. 80% is the Sprint 2 MVP estimate.

**Average Lifetime:** 18 months

Source: Industry benchmark for B2B marketplace tools serving independent professionals: 18–24 months. Adjusted to 18 months because Georgian university tutor pool turns over with each academic year cohort — some tutors graduate and exit, new tutors enter. Churn rate of 5% monthly (from Inputs) implies an average lifetime of 1/0.05 = 20 months; we use 18 months conservatively to account for accelerated early churn before the platform builds strong retention signals.

### Calculation (Tutors — Expected Scenario)

```
LTV = 30 GEL × 80% × 18 months
LTV = 432 GEL (~$158)
```

---

### LTV — Students (Free tier, value proxy)

Students use TutorLink for free at MVP stage. ARPU = 0 GEL. However, students generate monetisable proxy value through three mechanisms:

**Value Proxy:**

- **B2B upsell potential:** Students who book through TutorLink are the most valuable acquisition vector for the tutor-side paid plan. Each active student booking generates ~0.3 tutor plan subscriptions in the Expected scenario (15 active tutors / 50 active students = 0.3 ratio). At 30 GEL/month per tutor plan, one active student generates 0.3 × 30 GEL = **9 GEL/month** in indirect tutor revenue.
- **Data value:** Each booking generates tutor quality data (completion, repeat bookings, eventual reviews) that improves the platform's matching quality and defensibility. Difficult to quantify at MVP stage — excluded from the proxy calculation conservatively.
- **Referral value:** K-factor of 0.16 means each student brings in 0.16 additional students on average. At a tutor CAC of 5 GEL (Expected) and a 0.3 student-to-tutor conversion ratio, each student indirectly reduces CAC by ~0.5 GEL.

Total monetisable value per student per month: **~9 GEL**

LTV (proxy) = 9 GEL × 80% × 18 months = **130 GEL (~$47)**

---

## 2. Customer Acquisition Cost (CAC) per Channel

All costs are denominated in GEL. Team time valued at 15 GEL/hour (equivalent to tutoring market rate — the opportunity cost of a team member's hour in this market).

---

### Channel 1 — KIU International Student Office

| Item | Value |
|------|-------|
| Ad spend | 0 GEL |
| Founder/team time (hours × rate) | 45 GEL (3 hours: 1 hr coordinator meeting prep + 1 hr meeting + 1 hr follow-up email and materials production × 15 GEL/hr) |
| Tooling specific to this channel | 0 GEL (Carrd landing page is free tier) |
| Agency or contractor fees | 0 GEL |
| **Total spend** | **45 GEL** |
| Students acquired (Expected, Month 1) | 10 (40 outreach contacts × 60% visit rate × 25% signup conversion ≈ 6; rounded up with organic spread from orientation materials) |
| **CAC (students)** | **~5 GEL per student** |

**Source for spend:** Time estimate from growth strategy Sprint 2 plan. Lizi leads coordinator outreach; 3 hours total across all team members.

**Source for customers acquired:** Experiment plan success threshold (25% signup conversion from warm channel). 40 outreach contacts is the Sprint 2 target (10 per team member per growth-strategy.md). Estimated 6–10 signups in Month 1 from this channel.

---

### Channel 2 — WhatsApp / Messenger Group Chats

| Item | Value |
|------|-------|
| Ad spend | 0 GEL |
| Founder/team time (hours × rate) | 120 GEL (2 hrs/week × 4 members × 4 weeks × 15 GEL/hr = 480 GEL; 4 weeks of posting. However, this time would largely be spent on WhatsApp anyway — adjusted to 30 min/week incremental time = 120 GEL) |
| Tooling | 0 GEL |
| Agency fees | 0 GEL |
| **Total spend** | **120 GEL** |
| Students acquired (Expected, Month 1) | 36 (8 posts × 150 reach × 12% CTR × 30% signup conversion = 43.2; apply 85% validity factor for duplicate reach across groups ≈ 36) |
| **CAC (students)** | **~3 GEL per student** |

**Source for spend:** 30 min/week incremental time per team member posting and responding. 4 members × 4 weeks = 8 hours × 15 GEL = 120 GEL.

**Source for customers acquired:** Inputs tab Calculations: 8 posts × 150 avg reach × 12% CTR × 30% signup conversion. Calculation cross-checked against smoke test estimate in experiment-plan.md.

---

### Channel 3 — Tutor-Side Word of Mouth (Profile Sharing)

| Item | Value |
|------|-------|
| Ad spend | 0 GEL |
| Founder/team time (hours × rate) | 75 GEL (1 hr per tutor for onboarding × 5 initial tutors × 15 GEL/hr = 75 GEL in Month 1. Subsequent months: tutors self-serve.) |
| Tooling | 0 GEL |
| Agency fees | 0 GEL |
| **Total spend** | **75 GEL** |
| Students acquired (Expected, Month 1) | 18 (15 tutors × 3 referrals/tutor × 40% conversion = 18) |
| **CAC (students)** | **~4 GEL per student** |

**Source for spend:** Mari owns tutor onboarding. 5 tutors personally onboarded in Month 1 (MT from Interview 5 + 4 referrals from the discovery network). 1 hour per tutor at 15 GEL = 75 GEL.

**Source for customers acquired:** Loops and moats analysis — 15 active tutors × 3 student referrals/month × 40% conversion = 18. Month 1 uses 15 tutors as the sprint target.

---

### Blended CAC (Students — Expected Scenario, Month 1)

```
Blended CAC = total spend / total customers acquired
Blended CAC = (45 + 120 + 75) GEL / (10 + 36 + 18) students
Blended CAC = 240 GEL / 64 students
Blended CAC = 3.75 GEL per student (~$1.37)
```

**Tutor CAC (Expected Scenario):**
Tutors are acquired through direct personal onboarding by Mari. Cost is the same 75 GEL spent across the 5 Month 1 tutor onboardings.
Tutor CAC = 75 GEL / 5 tutors = **15 GEL per tutor (~$5.50)**

---

## 3. LTV to CAC Ratio

### Per Channel (Student-side, Expected Scenario)

| Channel | LTV (proxy) | CAC | Ratio | Interpretation |
|---------|------------|-----|-------|----------------|
| KIU International Office | 130 GEL | 5 GEL | 26:1 | Exceptionally healthy — near-zero cost, high pain segment |
| WhatsApp Group Chats | 130 GEL | 3 GEL | 43:1 | Exceptional — best cost-efficiency of any channel |
| Tutor Word of Mouth | 130 GEL | 4 GEL | 33:1 | Exceptional — self-reinforcing as tutor base grows |

### Tutor-Side

| | LTV | CAC | Ratio | Interpretation |
|--|-----|-----|-------|----------------|
| Direct onboarding (Expected) | 432 GEL | 15 GEL | 29:1 | Healthy — high LTV relative to low onboarding cost |

### Blended (Student-side, Expected Scenario)

LTV : Blended CAC = 130 GEL : 3.75 GEL = **35:1**

### Interpretation

A ratio above 3:1 is healthy. Our ratios are 26:1 to 43:1 on the student side and 29:1 on the tutor side — all far above the 3:1 healthy threshold. These ratios are high because all three acquisition channels are zero-cost in direct spend, with only team time as an input. This is a characteristic of early-stage word-of-mouth growth in a community product: CAC is artificially low during the founder-led growth phase.

The critical question is whether these ratios hold when the founder network is exhausted and the team must expand to colder channels. Our growth strategy deliberately defers paid channels until Sprint 4 and post-course, because the community-based channels have not been exhausted — we estimate they can sustain growth through at least 150 active students without reaching saturation. At that point, blended CAC will rise as paid or institutional channels are added, and the ratio will compress toward a more typical 5:1 to 10:1 range.

The tutor LTV:CAC of 29:1 is the more strategically important ratio because tutors are the paying customers. At 432 GEL LTV and 15 GEL CAC, each tutor generates 417 GEL of gross margin over their lifetime — enough to fund the acquisition of 111 additional students at 3.75 GEL blended CAC. This is a positive feedback loop: tutor revenue funds student acquisition, which drives more bookings, which attracts more tutors.

---

## 4. Payback Period

```
Payback = CAC / (ARPU × Gross Margin per month)
```

### Per Channel

**Tutors (the revenue-generating side):**

| Channel | CAC (GEL) | Monthly margin per tutor (GEL) | Payback (months) |
|---------|-----------|-------------------------------|------------------|
| Direct onboarding — Worst | 25 GEL | 15 × 80% = 12 GEL | 2.1 months |
| Direct onboarding — Expected | 15 GEL | 30 × 80% = 24 GEL | 0.6 months |
| Direct onboarding — Best | 8 GEL | 50 × 80% = 40 GEL | 0.2 months |

**Students (proxy value — indirect revenue via tutor conversion):**

| Channel | CAC (GEL) | Monthly proxy margin (GEL) | Payback (months) |
|---------|-----------|--------------------------|------------------|
| KIU International Office | 5 GEL | 9 × 80% = 7.2 GEL | 0.7 months |
| WhatsApp Group Chats | 3 GEL | 9 × 80% = 7.2 GEL | 0.4 months |
| Tutor Word of Mouth | 4 GEL | 9 × 80% = 7.2 GEL | 0.6 months |

### Target

- SaaS: under 12 months
- Enterprise: under 18 months
- Consumer: varies, but usually under 6 months

### Interpretation

All payback periods are well under 3 months in the Expected scenario — significantly ahead of the SaaS benchmark of under 12 months. The tutor-side payback of 0.6 months means each paying tutor recoups their acquisition cost within their first session on the platform (tutors need to earn back only 15 GEL of platform value, which happens in the first month they are on the paid plan). This implies the primary business risk is not unit economics but supply-side activation: convincing tutors to create profiles and maintain them. Once activated, the economics are highly favourable.

The Worst scenario payback of 2.1 months for tutors is still well within the SaaS 12-month benchmark, indicating the model is structurally sound even under pessimistic assumptions.

---

## 5. Assumptions and Sources

| Assumption | Value (Expected) | Source | Confidence |
|------------|-----------------|--------|------------|
| Tutor plan ARPU (GEL/month) | 30 GEL | Estimated from Georgian market: tutors charge 30–50 GEL/hr; plan must pay back in < 1 session | Low–Medium (not yet validated with real tutor willingness-to-pay) |
| % tutors converting to paid plan | 25% | Benchmark: 20–30% freemium-to-paid for B2B tools with clear ROI. Comparable to Calendly paid conversion rate. | Low (not yet measured; first real data in Sprint 3) |
| Gross margin | 80% | Supabase + Vercel infra ~$20/month at MVP scale; spreads across paying tutors | Medium (infra costs confirmed; scales with users but slowly) |
| Average tutor lifetime | 18 months | Industry benchmark for B2B marketplace tools; adjusted for Georgian academic year tutor turnover | Low (no retention curve data yet; first cohort enrolled Sprint 2) |
| Monthly churn rate | 5% | Estimate based on semester-based usage patterns; students leave after completing courses | Low (no measured churn yet; validate from Sprint 2 session data) |
| Student-to-tutor indirect revenue ratio | 0.3 | 15 expected tutors / 50 expected students = 0.3; each student "sponsors" 0.3 tutor plan subscriptions | Medium (ratio depends on tutor growth model being validated) |
| Smoke test signup conversion | 25% | Experiment plan success threshold; set before launch | Low until experiment closes May 4 |
| Team time valuation | 15 GEL/hr | Georgian tutoring market rate (30–50 GEL/hr for tutors); halved to reflect student developer rate | Medium (defensible order of magnitude) |
| K-factor | 0.16 | Estimated: 0.4 invitations per user × 40% conversion; from loops-and-moats.md | Low (first real measurement requires `tutor_profile_shared` events in Sprint 3) |

---

## 6. Sensitivity Analysis

**Riskiest assumption:** Percentage of tutors who convert to the paid featured plan (currently 25% in Expected scenario).

**Current value:** 25% of active tutors on paid plan

**If it is half what we expect (12.5% conversion):**
- Monthly revenue per tutor base: halved
- At 15 active tutors: 15 × 12.5% × 30 GEL = 56 GEL/month vs 113 GEL/month expected
- LTV drops to 56% of expected: 432 GEL → 243 GEL
- LTV:CAC ratio drops from 29:1 to 16:1 — still healthy, but less comfortable
- The model remains viable; the business takes longer to reach meaningful revenue but does not break

**If it is double what we expect (50% conversion):**
- Monthly revenue: doubles
- At 15 active tutors: 15 × 50% × 30 GEL = 225 GEL/month
- LTV rises to 864 GEL
- LTV:CAC ratio rises to 58:1
- The model becomes highly attractive to external investors; accelerates the paid channel investment timeline

**Why this is the riskiest assumption:** Unlike CAC (which is observable from team time logs) and ARPU (which is a product decision), freemium-to-paid conversion is a behavioural assumption that depends on tutors perceiving sufficient value in the featured plan to pay for it. Tutors who are already filling their slots via word-of-mouth have less incentive to pay for additional visibility. The assumption will not be validated until we have 10+ tutors on the free tier and can make the upgrade offer.

**What we will do to validate this in Sprint 2:** Mari presents the paid plan offer to all tutors onboarded in Sprint 2 Week 1 (target: 15 tutors). She records how many express immediate interest, how many ask clarifying questions, and how many decline with a specific reason. These qualitative signals inform whether the 25% assumption is plausible before the payment system is built in Sprint 3.

---

## 7. What We Will Refine and When

| Number | Currently | Replace by | How |
|--------|-----------|------------|-----|
| Smoke test signup conversion rate | 25% (experiment threshold) | May 5, 2026 | After experiment closes; actual signups ÷ visits from Carrd analytics and Google Sheet |
| % tutors on paid plan | 25% (benchmark estimate) | June 4, 2026 (Sprint 3) | After Mari's Sprint 2 tutor upgrade offer conversations; adjust based on qualitative willingness-to-pay signals |
| Monthly churn rate (students) | 5% (estimate) | May 21, 2026 (Checkpoint 3) | From PostHog `user_session_started` retention data — Day 7 and Day 14 cohort retention for Sprint 2 signups |
| Monthly churn rate (tutors) | 5% (mirrored from student estimate) | June 4, 2026 | From PostHog tutor-side session data; tutors who have not logged in for 14+ days flagged as at-risk |
| Tutor plan ARPU | 30 GEL (product decision) | May 21, 2026 | Validated or revised based on Sprint 2 willingness-to-pay conversations with onboarded tutors |
| Average lifetime | 18 months (benchmark) | Post-course (Oct 2026) | Requires at least 6 months of real cohort data to measure meaningfully; first interim estimate at month 3 |
| K-factor (0.16) | Modelled estimate | June 4, 2026 (Sprint 3) | After `tutor_profile_shared` events are live in Sprint 3; measure (shares per user) × (new user conversion from shared links) from PostHog |

---

**Filed by:** Nino Tsutskiridze, Lizi Margvelashvili, Luka Khimshiashvili, Mari Janjghava