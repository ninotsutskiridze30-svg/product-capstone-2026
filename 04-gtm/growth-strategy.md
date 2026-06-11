# Growth Strategy — Sakheli

**Template:** `Lab-9/templates/growth-strategy-template.md`
**Worked example reference:** `Lab-9/examples/growth-modeling-worked-example.md`

---

## Product context

**What we are:** a two-sided marketplace — Georgian high-school students (grades 10–12) preparing for the national university entrance exams on one side, and tutors who teach those exam subjects on the other.

**Monetisation:** 15% commission on every paid lesson booked through the platform. Tutors set their own hourly rate (typical range ₾20–₾50/hr based on subject and track record). No subscription, no listing fee. This positions Sakheli as tutor-friendly — Preply takes 18–33%, iTalki takes 15%, Tutorful takes 22% — and lets us start from a credible "we don't get paid unless the tutor gets paid" story when recruiting tutors.

**North-star metric:** weekly completed lessons (a video call started + ended ≥10 min apart on the same booking). Defined in [../03-build/analytics/dashboard-link.md](../03-build/analytics/dashboard-link.md).

---

## Three named acquisition channels

Channels chosen for the **first 6 months** with the explicit constraint that we have **zero marketing budget** and one founder running this alongside other commitments.

### Channel 1 — Telegram student communities (organic content + outreach)

- **Type:** organic / community (per Lab-9 taxonomy: a *content + community* channel, not paid)
- **Where:** existing Tbilisi and regional Telegram groups for ერთიანი ეროვნული გამოცდები (national exam) preparation. Estimated reachable audience: 8–15k students across the top 5 groups, plus the official KIU / TSU / Free Uni applicant chats.
- **What we do:** post helpful, *non-promotional* exam-prep content (worked-out problems from past papers, study schedules, tutor-recommended reading) under a Sakheli-branded account, with the platform mentioned as a footer link to the relevant tutor's profile when a problem is solved by a tutor in our network. Run free "ask a tutor anything" hours weekly.
- **Why this channel for us:** target users are already concentrated here; trust is the binding constraint (parents don't put their kid with a stranger they found via banner ad); content that proves competence converts. Distribution cost is near zero — only our time.
- **Justification:** the channel's audience is *literally* our ICP, the cost is right, and it earns the trust we need for a high-consideration purchase (a tutor for your child's university future).
- **Activation metric:** signups via UTM-tagged tutor profile links per week.

### Channel 2 — Tutor referral loop (product-led)

- **Type:** product-led growth / referral loop (per Lab-9 taxonomy: a *product-led* channel)
- **How it works:** every tutor on the platform gets a unique referral link they can share with their existing students (most tutors already have 3–8 private students they teach off-platform). Tutor's referred students get their first lesson at the platform's cost (we eat the ₾1.30 LiveKit cost); tutor pays nothing; we acquire the student onto the platform where they can find other tutors too.
- **Why this channel for us:** the easiest place to find Georgian exam-prep students is in the WhatsApp threads of Georgian exam-prep tutors. We just need a reason for the tutor to share, and "I can teach my existing students on a platform that handles scheduling + lesson + homework + grading for me" is that reason.
- **Justification:** lowest possible CAC (one share = one cohort of students), and aligned with the tutor's interest because their lesson admin gets easier. The loop is K = (students per tutor) × (share rate) × (signup rate) → modelled in [loops-and-moats.md](loops-and-moats.md).
- **Activation metric:** signups attributed to `referrer_tutor_id` per week.

### Channel 3 — Instagram / TikTok short-form content (organic)

- **Type:** organic content (per Lab-9 taxonomy: *content* channel)
- **What:** weekly 30–60 second videos walking through a hard problem from a recent past exam, posted on a Sakheli IG/TikTok account with on-screen captions in Georgian. Each video ends with "want this tutor to teach you? link in bio." Recruit our top 2–3 tutors to be the on-camera face — they get free promotion, we get distribution.
- **Why this channel for us:** Georgian teens spend significant time on TikTok/IG; short-form algorithmic distribution is the cheapest way to reach them outside Telegram; tutor-led content doubles as a competence proof.
- **Justification:** zero-budget paid alternative; algorithmic reach without ad spend; content compounds (videos keep being recommended for weeks).
- **Activation metric:** new follower → bio-link click → signup conversion per week.

---

## Channel priority ranking (per Lab-9 template)

| Rank | Channel | Priority justification |
|---|---|---|
| 1 | Tutor referral loop | Lowest CAC (≈₾0 marginal), aligned with the user's incentive, compounds as tutor count grows. The first channel to optimise. |
| 2 | Telegram student communities | Highest direct match to ICP; we have zero discovery cost because the audience is already pooled in known channels. Limited by our content-output cadence. |
| 3 | IG / TikTok short-form | Highest *ceiling* of the three (algorithmic distribution) but slowest to compound (need ~10–20 videos before the algorithm has signal). Worth doing in parallel because it costs only our time. |

We deliberately do **not** include paid ads (Google, Meta, TikTok Ads) in the first 6 months. With our LTV of ~₾252 (see [financials/unit-economics.md](financials/unit-economics.md)) and the cold-traffic CAC for tutoring being typically ₾80–150 on Meta in this region (industry estimate), paid would break unit economics at MVP scale. Revisit after we have a measured organic baseline.

---

## How channels feed the North Star (weekly completed lessons)

```
[Telegram content]  ────►  signups  ────►  first booking  ────►  first completed lesson
                                                     │
[Tutor referrals]  ─────────────────────────────────┼────►  weekly completed lessons (NSM)
                                                     │
[IG/TikTok content]  ──►  signups  ────►  first booking  ────┘
```

Each channel is measured first on signups → first booking conversion (because that's where the high-consideration friction sits), then on first-booking → completed-first-lesson, then on first-lesson → second-lesson (the strongest retention signal).

---

## What we are NOT doing in Sprint 2 (and why)

- **SEO on tutor profiles.** Pages are SSR-ready (Component 2) but Google traffic for "[subject] tutor Tbilisi" is a 6–12 month payoff. Build now, measure later.
- **Partnerships with schools.** High-leverage but high-overhead. Park for after the referral loop is proven.
- **A YouTube long-form channel.** Production cost too high for one founder.
- **Paid acquisition** — see above.
