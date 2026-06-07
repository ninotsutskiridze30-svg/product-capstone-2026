# Growth Strategy Document

**Team:** TutorLink Team
**Product:** TutorLink — a mobile-first web platform connecting university students in Georgia with private tutors through searchable profiles with visible rates, availability, and reviews.
**Date:** May 8, 2026
**Version:** 1.0

---

## Activation Metric

**Activated user definition:**
A user is activated when they confirm their first tutoring session booking within 7 days of completing signup.

**Activation number:** 1 confirmed booking (the `session_booked` event fires at least once per user)

**Time window:** Within 7 days of `user_signup_completed`

**Why this action indicates real value delivered:**
A confirmed booking is the moment the student's core problem — not being able to find and trust a tutor efficiently — is resolved. Every interview confirmed that the goal was not to browse profiles but to secure a session; TK (Interview 1) described the ideal outcome as "I would message one person and it would be done." A student who completes a booking within 7 days has done exactly that, meaning the product has delivered the value it promised. A student who signs up but does not book within 7 days is no longer in the acute trigger state that brought them to TutorLink — they have solved their problem another way or abandoned. This window is intentionally short because tutoring need is time-sensitive and tied to a specific academic trigger.

**Current activation rate (from our data or benchmark):**
We do not yet have data. The `session_booked` event is instrumented in Sprint 2. Industry benchmark for two-sided marketplace activation (first transaction within 7 days of signup) is 20–35% for consumer marketplaces (Andreessen Horowitz marketplace benchmarks, 2023). Our target is 40% because our users arrive with an active and specific need — they are searching for a solution to an immediate problem, not browsing speculatively. We will measure the actual rate from PostHog cohort data at the Sprint 2 Review (May 21).

---

## Acquisition Channel Strategy

### Primary Channel

**Channel name:** KIU International Student Office — orientation emails, welcome materials, and the international student WhatsApp group

**Channel type:** Organic / Partnership

**Why this channel fits our product and audience:**
International students at KIU are the highest-pain segment in our dataset. SN (Interview 4) failed an exam directly because the existing tutor search system — which depends on a Georgian social network — was structurally inaccessible to her. International students arrive with no word-of-mouth network, cannot use Georgian-language platforms, and have no starting point for the search. The International Student Office reaches this exact segment at the moment of maximum vulnerability: their first weeks in a new country and academic system. A tool recommendation from an official university channel carries institutional trust that a peer WhatsApp post does not. This is the channel most likely to produce signups from students who would otherwise have no path to TutorLink at all — precisely the students our discovery confirmed are most harmed by the status quo.

**How we will use it in Sprint 2:**
Lizi contacts the KIU International Student Office coordinator by May 12 to request inclusion in the orientation welcome email and the pinned message in the international student WhatsApp group. Nino prepares a one-page TutorLink explainer in English (problem in plain language, solution, signup link). Mari follows up with the TSU international student office equivalent by May 19. All signup links distributed through this channel use `referral_source=kiu_international_office` as a UTM parameter to track conversion in PostHog.

**Estimated CAC via this channel:**
5 GEL per student (Expected scenario). Full breakdown in `04-gtm/financials/unit-economics.md` — Channel 1 section. Total spend is 45 GEL in team time across ~10 Month 1 signups.

**Scale ceiling:**
The international student cohort at KIU is approximately 200 students per academic year. This channel saturates at roughly 60–80 signups (30–40% of the cohort) — above that, the remaining students have already solved their problem or do not need a tutor. This is a strong launch channel, not a long-term growth engine. It must be supplemented by Channel 2 and Channel 3 as we approach saturation.

---

### Secondary Channel

**Channel name:** KIU and TSU programme WhatsApp and Messenger group chats — direct posts by team members in CS, Business, and Engineering programme groups

**Channel type:** Organic / Viral

**Why this channel fits our product and audience:**
Every interviewee in our dataset used WhatsApp and Messenger group chats as their only tutor discovery channel. These groups are the environment where the problem already lives — students currently post "does anyone know a good maths tutor?" in the same chats we will post TutorLink in. This gives our message immediate contextual relevance: we are not interrupting something unrelated, we are offering a structured alternative to the thing students are already trying to do in this exact space. Team members are existing members of these groups, so posts carry peer credibility rather than appearing as advertising from an unknown party.

**How we will use it in Sprint 2:**
Each team member posts once per week in two of their active programme group chats (8 posts per week total across the team). Framing: "We built something for the tutor search problem — here is the link if you have been through that search recently." Not ad copy. Include one specific detail from the interview data (e.g. "the average search takes a week and a half — we found a faster way") to signal genuine research behind the product. Nino tracks `referral_source=whatsapp_group` signups in PostHog weekly and reports the count at each Tuesday standup.

**Estimated CAC via this channel:**
3 GEL per student (Expected scenario). Full breakdown in `04-gtm/financials/unit-economics.md` — Channel 2 section. Total spend is 120 GEL in incremental team time for approximately 36 Month 1 signups.

**Scale ceiling:**
Individual programme group chats at KIU have 150–300 members. After 2–3 posts, message novelty declines and CTR drops. The channel can be extended by adding more group chats across programmes and universities, but marginal return decreases with each new group. We estimate this channel supports 100–200 total signups at KIU alone; expansion to TSU, IBSU, and Caucasus University group chats extends the ceiling to approximately 400–600 signups before the channel is exhausted across the Georgian university market.

---

### Tertiary Channel

**Channel name:** Tutor-side profile sharing — active tutors share their TutorLink profile link with students who enquire via WhatsApp

**Channel type:** Viral / Two-sided referral

**Why this channel fits our product and audience:**
MT (Interview 5) declines 4–5 student enquiries per week via WhatsApp because she is fully booked or the students are mismatched. Currently she declines by text and the student restarts their search from zero. If MT shares her TutorLink profile link when declining, the student lands on TutorLink, finds another tutor through search, and TutorLink gets a new user acquisition at zero direct cost. This mechanic is already latent in the existing tutor-student relationship — tutors sometimes try to refer declined students to other tutors — but it happens informally and produces no data. TutorLink formalises it with a profile link that traces back to our analytics via `view_source=direct_link`.

**How we will use it:**
Mari asks each tutor onboarded in Sprint 2 to share their TutorLink profile link in existing student WhatsApp threads when redirecting enquiries. No product feature required in Sprint 2 — tutors copy and paste their profile URL. The Sprint 3 `tutor_profile_shared` feature adds a one-tap WhatsApp share button that reduces friction and enables measurement. We track new users arriving via `view_source=direct_link` in PostHog to measure profile views and subsequent signups from this path. This channel becomes meaningful only after 15 active tutor profiles are live (the critical mass threshold from loops-and-moats.md), so it is activated in Sprint 2 Week 2, not Week 1.

---

## Channel Priority Ranking

| Priority | Channel | Type | Rationale |
|----------|---------|------|-----------|
| 1 | KIU International Student Office | Organic / Partnership | Reaches highest-pain segment at orientation with institutional trust; zero cost; cleanly UTM-trackable; addresses the segment the current system fails most completely |
| 2 | WhatsApp / Messenger programme group chats | Organic / Viral | Immediate, zero cost, reaches users in the exact context where the problem currently lives; all team members have existing access to relevant groups |
| 3 | Tutor-side profile sharing | Viral / Two-sided referral | Deferred to Sprint 2 Week 2 — requires 15 active tutor profiles before it has enough supply to be meaningful; becomes self-reinforcing as tutor base grows |

---

## Channels We Are Not Pursuing in Sprint 2 and Why

| Channel type | Reason not pursuing now |
|-------------|------------------------|
| Paid social (Instagram, TikTok, Facebook ads) | Our target users do not search for tutors passively on social media — the need is triggered by an academic event, not by content browsing. Paid social builds brand awareness over weeks; our users need a solution today. No direct spend budget justifiable at MVP stage. Will revisit post-course if organic channels saturate. |
| Paid search (Google Ads targeting "tutor Georgia") | Search volume for tutoring-related terms in Georgia is too low to generate meaningful traffic at any justifiable budget. Students do not currently search Google for tutors — they post in WhatsApp groups. We are creating a new search behaviour; paid search for a behaviour that does not yet exist is premature. |
| Referral incentive program (discounts for referred signups) | No revenue yet to fund discounts. The tutor word-of-mouth channel achieves the same referral dynamic without monetary incentives. Revisit in Sprint 3 if tutor subscription revenue is active and CAC begins to rise. |
| Content marketing (blog, YouTube study tips) | Requires 4–6 weeks of content production before any measurable acquisition impact. Sprint 2 is 2 weeks. We have a deployed product and can acquire users directly — the opportunity cost of content marketing is too high at this stage. |

---

## Connection to Growth Projection

The channels above feed directly into the 12-month growth projection workbook at `04-gtm/financials/growth-projection.xlsx`. Conversion rates and cost inputs assumed for each channel are:

- Channel 1 (Inputs rows 14–18): 40 contacts × 60% visit rate × 25% signup conversion ≈ 6–10 Month 1 students, 10% MoM growth
- Channel 2 (Inputs rows 22–27): 8 posts × 150 reach × 12% CTR × 30% conversion ≈ 36 Month 1 students, 5% MoM growth
- Channel 3 (Inputs rows 31–35): 15 tutors × 3 referrals × 40% conversion = 18 Month 1 students, 15% MoM growth

Full cost breakdown and LTV:CAC ratios per channel are documented in `04-gtm/financials/unit-economics.md`.

---

## Sign-off

All team members have reviewed and agreed on this strategy:

| Name | Role | Date |
|------|------|------|
| Nino Tsutskiridze | Program Lead | May 8, 2026 |
| Lizi Margvelashvili | Discovery Lead | May 8, 2026 |
| Luka Khimshiashvili | Tech Lead | May 8, 2026 |
| Mari Janjghava | Discovery Lead | May 8, 2026 |