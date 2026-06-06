# Growth Strategy

**Team:** TutorLink Team
**Product:** TutorLink — a mobile-first web platform connecting university students in Georgia with private tutors through searchable profiles with visible rates, availability, and reviews.
**Document version:** 1.0
**Last updated:** May 8, 2026

---

## 1. Target User (Reference)

University students at KIU and similar Georgian institutions who need a private tutor for a specific subject and currently have no structured way to find one — relying entirely on WhatsApp group chats, word-of-mouth, and individual manual outreach that takes one to six weeks and ends in abandonment for a significant minority. The immediate pain is not the absence of tutors but the total invisibility of tutor availability, rates, and quality until after direct contact is made.

---

## 2. Activation Metric

**Aha moment:** A student searches for a tutor, views a profile with real availability and rate, and confirms a booking — receiving a reference number — within a single session.

**Activation metric:** 60% of students who complete signup book their first session within 7 days of account creation.

The 7-day window is intentional. Our interview data shows students search for tutors in response to a specific academic trigger (falling behind, approaching exams). A student who signs up and does not book within a week is likely no longer in the trigger state that brought them to TutorLink. Activation must happen while the need is live.

---

## 3. Three Acquisition Channels

### Channel 1 — KIU International Student Office and Orientation Materials

**Type:** Organic / Partnership

**Why this channel:**
- **Fit:** International students are the highest-pain segment in our dataset. SN (Interview 4) failed an exam directly because they could not find a tutor — the consequences are severe and the current system is structurally inaccessible to students without a Georgian social network. The International Student Office reaches this exact segment at the moment of highest need: arrival and first semester.
- **Speed:** Weeks. Nino and Lizi approach the KIU International Student Office coordinator in Sprint 2 Week 1 to request inclusion in orientation materials and the welcome email sequence. If approved, TutorLink appears in front of the entire incoming international cohort at orientation.
- **Cost:** Zero direct cost. Time investment is one meeting and producing a one-page explainer in English. This is the highest-leverage zero-cost channel available to us.

**What we will do in Sprint 2:** Lizi drafts a one-page TutorLink explainer (problem, solution, how to sign up) and schedules a meeting with the KIU international student coordinator by May 12. Goal: secure placement in the orientation welcome email and the international student WhatsApp group pinned message. Nino follows up with the coordinator for the TSU international student office by May 19.

**What success looks like in 4 weeks:** 30 international student signups traceable to the orientation channel (tracked via referral_source UTM on the signup link distributed by the coordinator).

---

### Channel 2 — University Programme Group Chats (WhatsApp and Messenger)

**Type:** Organic / Viral

**Why this channel:**
- **Fit:** Every interviewee in our dataset used WhatsApp and Messenger group chats as their primary (and only) tutor discovery channel. These groups are the current status quo that TutorLink replaces. Posting in them is reaching users in exactly the context where the problem lives — they are already looking for tutors in this channel.
- **Speed:** Immediate. All four team members are already members of multiple KIU programme group chats. The first posts can go out on Sprint 2 Day 1.
- **Cost:** Zero. Time cost is 30 minutes per week across the team for posting and responding.

**What we will do in Sprint 2:** Each team member posts one message per week in two of their programme group chats describing TutorLink and including the signup link. Message framing: not an ad but a "we built something for the problem you all know" — referencing the tutor search experience directly. Nino tracks how many signups arrive with `referral_source = whatsapp_group` in PostHog.

**What success looks like in 4 weeks:** 50 student signups from group chat posts. A post in the CS group chat and the Business group chat should reach approximately 300 students combined; 15–20% click-through and 30% signup conversion from clicks gives a realistic 15–20 signups per post cycle.

---

### Channel 3 — Tutor-Side Word of Mouth (Tutors Recruit Their Own Students)

**Type:** Viral / Two-sided referral

**Why this channel:**
- **Fit:** TutorLink is a two-sided platform. Tutors benefit from the platform (reduced inbox noise, only matched students reach them) and have an existing relationship with students they have previously taught. MT (Interview 5) declines 4–5 students per week who do not match her availability or subject — those declined students are warm leads for TutorLink, and MT has a direct channel to them.
- **Speed:** Weeks. Requires at least 10 active tutor profiles before this channel generates meaningful volume. Sprint 2 tutor self-registration (S2-01) is the prerequisite.
- **Cost:** Zero direct cost. The mechanic is tutors sharing their TutorLink profile link with students who enquire via WhatsApp — directing them to book through the platform instead of via chat. This already aligns with tutor self-interest (reduces manual scheduling coordination).

**What we will do in Sprint 2:** Mari contacts MT (Interview 5) and two other active tutors identified through our interview referral network and asks them to share their TutorLink profile link in their existing student WhatsApp threads when redirecting enquiries. Each tutor who does this effectively becomes a micro-distributor. We track profile views with `view_source = direct_link` vs `view_source = search_results` in PostHog to measure how many views come via tutor-shared links.

**What success looks like in 4 weeks:** 3 active tutors sharing their profile links, generating 20+ profile views and 8+ bookings from the tutor-referral path.

---

## 4. Channel Ranking and Rationale

| Rank | Channel | One-Sentence Rationale |
|------|---------|------------------------|
| 1 | KIU International Student Office | Highest-pain segment, zero cost, institutional reach that scales beyond our personal networks, and the channel the segment would least expect to have access to a tool like TutorLink. |
| 2 | University Programme Group Chats | Immediate, zero cost, and reaches users in the exact context where the problem currently lives — these are the channels our users already use to search for tutors. |
| 3 | Tutor-Side Word of Mouth | Leverages existing tutor-student relationships to seed demand-side users, aligns with tutor self-interest, and creates a compounding referral dynamic without requiring any paid spend. |

---

## 5. Channels We Considered and Rejected

**Instagram and TikTok content marketing** — Rejected because our target segment is not passively browsing content when they experience the tutor search problem. The need is triggered by an academic event (falling behind, approaching exam) and is acute and time-sensitive. Content marketing builds brand over weeks; our users need a solution today. Content marketing may become relevant in Sprint 4 for brand awareness, not Sprint 2 for acquisition.

**Paid Google Ads targeting "tutor Georgia" or "private tutor Kutaisi"** — Rejected because the search volume for these terms in Georgia is too low to generate meaningful traffic at any budget we could justify for a student project. The market is informal and users do not currently search for tutors on Google — they post in WhatsApp groups. Paid search requires existing search demand; we are creating the category, not competing in one.

**Referral incentive program (give a discount for each friend referred)** — Rejected for Sprint 2 because we have no revenue yet and cannot fund a discount program. The tutor-side word of mouth channel achieves a similar referral mechanic without requiring a monetary incentive. This can be revisited in Sprint 3 if the revenue model is activated.

---

## 6. Open Questions

What we do not yet know that we need to answer in Sprint 2:

1. What is the actual conversion rate from landing page visit to signup for our smoke test cohort — and does it validate the 25% success threshold set in the experiment plan, or do we need to revise the value proposition framing?
2. Are tutors willing to actively share their TutorLink profile link when redirecting WhatsApp enquiries, or does it feel too transactional relative to the personal relationship they have with students?
3. Does the KIU international student coordinator have the authority to include third-party student tools in orientation materials, or does this require a formal faculty approval process that exceeds our Sprint 2 timeline?

---

**Filed by:** Nino Tsutskiridze, Lizi Margvelashvili, Luka Khimshiashvili, Mari Janjghava