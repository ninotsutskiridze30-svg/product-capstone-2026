# Loop and Moat Narrative

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** May 8, 2026
**Version:** 1.0

---

## Part 1: Viral Loop Assessment

### Does your product have a viral loop?

**Our assessment:** In design — one organic loop exists today via informal vouching; one designed loop is being built for Sprint 3.

The current organic loop: when a student books a tutor through TutorLink and has a good session, they are likely to recommend the platform to classmates who ask how they found a tutor — which is exactly the conversation that already happens in every programme group chat. TK (Interview 1) converted on exactly this mechanism: "My friend gave me the last name directly and said she had used her personally." TutorLink formalises this by giving satisfied students a profile link to share rather than just a name. The designed loop — the Sprint 3 `tutor_profile_shared` one-tap WhatsApp share — makes the sharing action explicit and measurable.

---

### Loop Diagram

**Step 1:** Student searches on TutorLink, finds a matched tutor with visible rate and availability, and confirms a booking.

**Step 2:** Student completes the session and has a good experience. A classmate in their programme group chat asks "does anyone know a good [subject] tutor?"

**Step 3:** Student shares their tutor's TutorLink profile link via WhatsApp (Sprint 2: by copying the URL; Sprint 3: via the one-tap share button that fires `tutor_profile_shared`).

**Step 4:** Classmate opens the profile link, sees the tutor's subject, rate, availability, and reviews, and either books the same tutor or uses TutorLink's search to find another. Either way, the classmate is now a TutorLink user and enters the loop.

---

### K-Factor Estimate

```
K = invitations sent per user per month × conversion rate of invitations
```

| Input | Value | Source |
|-------|-------|--------|
| Average invitations sent per user per month | 0.4 | Estimated from interview data. TK (Interview 1) shared a tutor name with at least one classmate. AB (Interview 2) asked two peers for help finding a tutor — each is a potential future recipient of a TutorLink share. Conservative estimate: 1 in 2.5 students who successfully book will share the profile with at least one person in the same semester. Vouching is already the dominant trust mechanism in this market. Will measure via `tutor_profile_shared` events in Sprint 3. |
| Conversion rate of those invitations | 40% | Estimated from experiment plan smoke test threshold (25% cold channel). A WhatsApp share from a trusted peer who has used the tutor is a significantly warmer signal — we estimate 40% of recipients who receive a profile share will open the link and proceed to signup. Validate via `view_source=direct_link` → `user_signup_completed` funnel in PostHog from Sprint 3. |
| **K-factor** | **0.16** | 0.4 × 0.40 = 0.16 |

**Arithmetic shown:**
K = 0.4 invitations per user × 0.40 conversion rate = **0.16**

**What our K-factor means:**

K is 0.16, which is less than 1. Each cohort of users brings in fewer new users than itself — the loop slows decay but does not compound on its own. Our loop still matters because it reduces our blended CAC meaningfully: at K = 0.16, our effective CAC is reduced by approximately 1/(1 − 0.16) = 19% compared to a product with no viral loop. Every 100 students we acquire through paid or organic channels generate approximately 16 additional students for free through sharing. This is a CAC reducer, not a growth engine — our primary acquisition still requires active seeding via the three channels in our growth strategy.

The K-factor can improve materially if the Sprint 3 share mechanic (one-tap WhatsApp deep link) reduces friction. The current estimate assumes students copy and paste a URL; a native share button embedded in the confirmation screen could increase invitations per user from 0.4 to 0.6, raising K to 0.24 and the CAC reduction to 32%.

---

## Part 2: Network Effects Analysis

### Network Effect Type

| Type | Description | Does this apply? |
|------|-------------|-----------------|
| Direct | Users get more value from the product as more other users join | No — a student searching for a mathematics tutor does not benefit from more students also searching for mathematics tutors |
| Two-sided | Two distinct user groups need each other — more of one attracts more of the other | Yes — students need tutors; tutors need students; more tutors make the platform more useful to students and vice versa |
| Data | Each user contributes data that makes the product better for all users | Yes (emerging) — each booking generates tutor quality data (completion, repeat bookings, reviews) that improves matching for all subsequent students |
| Local | The network only matters within a specific group — team, university, city | Yes — the network effect is institutionally concentrated: KIU students benefit from KIU tutors being on the platform, independent of whether tutors at other universities are present |
| None | The product delivers the same value to user one as to user one million | No |

**Our network effect type:** Two-sided and local (data network effect emerging in Sprint 3 with review accumulation)

---

### Evidence for the Network Effect

**At zero users (zero tutor profiles):**
A student opening TutorLink sees no search results. The product is useless. This is the cold start problem — the platform has no value to students without supply, and no value to tutors without student demand.

**At 10 users (10 tutor profiles across 3 subjects):**
A student searching for a mathematics tutor sees 3 profiles. The product works — they can compare rates, see availability, and book — but the selection is thin. A student searching for a physics tutor may find zero results and leave. The platform feels incomplete. GM (Interview 3) described the current word-of-mouth system as producing "4 contacts before a match" — 10 profiles does not yet represent a clear improvement in selection over the best-connected students' existing networks.

**At 100 users (50 students + 50 tutors across 10 subjects):**
A student searching most common subjects (mathematics, English, physics, chemistry) finds at least 3–5 results with real availability data and reviews. The product now clearly outperforms word-of-mouth for most searches. Tutors with 5+ reviews begin to appear meaningfully differentiated from tutors with 0 reviews, which creates a quality signal that benefits students and rewards tutors who deliver good sessions.

**At critical mass (15 active tutors covering 5 core subjects):**
A student opening TutorLink for any common subject finds available tutors with visible rates. The product delivers on its core promise — "search and book in one session" — reliably, not just for lucky searches. Below this threshold, some searches return empty results, which breaks the product experience. Above it, the platform feels genuinely useful to any student regardless of their subject need.

---

### Critical Mass Threshold

**Our specific community:** KIU students and KIU-adjacent tutors in Kutaisi, with secondary expansion to TSU students and Tbilisi tutors.

**Critical mass threshold:** 15 active tutor profiles covering at least 5 distinct subjects, with at least 8 profiles showing availability this week.

**Rationale:** A student searching for a specific subject needs to see at least 2–3 results to feel the platform has meaningful supply — one result feels like a directory, not a marketplace. 15 profiles across 5 subjects gives an average of 3 tutors per subject, which meets this threshold for the 5 most common subjects at KIU (mathematics, English, physics, programming, Georgian language). 8 profiles showing current availability ensures the search is not purely theoretical — there are tutors a student can actually book this week. Below 15 profiles, some subject searches return 0 or 1 result, which creates a failure experience that actively damages retention.

**Current position relative to threshold:** We have 0 active tutor profiles at the time of this document. The threshold is 15. We are 0% of the way there. Mari and Lizi are personally onboarding tutors from the discovery network in Sprint 2 Week 1, with a target of 15 profiles by May 14 before student-facing acquisition channels are activated.

---

## Part 3: Moat Narrative

### Current Moat

**What protects us:** Speed of iteration and local knowledge. At our current scale, our only real protection is that we understand this specific market — Georgian university students and private tutors — better than any external competitor does, and we can ship features and respond to user feedback faster than a larger company operating in this market could.

This is a temporary moat, not a structural one.

**Evidence that this moat is real at our current scale:** We conducted 8 customer discovery interviews before writing a line of code, and those interviews produced the specific product decisions that differentiate TutorLink from a generic tutoring marketplace: the language filter (Interview 4, SN), the rate visibility on search results (Interview 1, TK; Interview 3, GM), the trust-first profile design (Interview 1, TK; Interview 2, AB; Interview 6, DK). A new entrant building without this discovery would likely build the wrong thing — a general tutoring platform without Georgian-market specificity — and fail to convert in this segment.

**Honest assessment of moat strength right now:**
Weak at current scale.

We have no structural moat today. Any competitor with sufficient resources could replicate our product in 2–3 months. Our protection is time and focus: we are building quickly in a market that large platforms (Preply, Wyzant) have not localised to, and that Georgian incumbents have not digitised. The window of opportunity is 6–18 months before a well-funded competitor could plausibly enter with a comparable product. We must use this window to build the structural moat — the reviews and ratings dataset — that will make us difficult to displace by the time a competitor arrives.

The transition from weak to moderate moat happens when we accumulate 200+ verified tutor reviews. Below that threshold, a new entrant can match our offering at launch. Above it, a new entrant faces a platform where students can compare tutors by 200 data-backed quality signals — which a new entrant cannot replicate without 200+ completed sessions of their own. We are actively building toward this by prioritising review submission (S3-01) in Sprint 3.

---

### What a Copycat Could Do

**If a well-funded competitor launched tomorrow, they could:**
- Replicate our tutor profile and booking flow in 8–12 weeks with a competent engineering team
- Outspend us on paid social and Google Ads to acquire users faster than our community-based channels
- Offer tutors a better-featured product (in-app messaging, calendar integration, payment processing) that we have deferred to post-course

**What they could NOT easily replicate:**
- Our existing tutor relationships: the 15 tutors we personally onboard in Sprint 2 have a direct relationship with our team members. A new competitor would need to go through the same cold outreach process.
- Our review dataset: every review submitted through TutorLink represents a completed session and a tutor quality signal. A new entrant has zero reviews on Day 1 regardless of budget. This moat compounds with every booking completed on our platform.
- Our institutional channel: if we secure placement in the KIU International Student Office orientation materials (Sprint 2 Channel 1), that placement requires a relationship with the coordinator that a new entrant would need to build independently.

**Our response strategy if a major competitor enters our space:**
If a well-funded competitor enters the Georgian tutoring market, our response is to accelerate supply-side lock-in: deepen relationships with the 15–30 tutors who are already active on TutorLink, make it easy for them to build their reputation on the platform (via reviews, booking history, and profile verification), and create switching costs by making their TutorLink profile the authoritative record of their tutoring reputation. A tutor with 30 reviews on TutorLink has a strong incentive to remain on TutorLink — their reputation does not transfer to a new platform. Simultaneously, we focus on the institutional channel (university orientation partnerships) that requires relationship-building a new entrant cannot shortcut with money.