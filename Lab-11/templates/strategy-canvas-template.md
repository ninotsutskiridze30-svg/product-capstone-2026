# Strategy Canvas

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** June 4, 2026

---

## Competitive Factors

Factors drawn from the competitive landscape seed (`01-discovery/synthesis/competitive-landscape-seed.md`) and the discovery interview dataset (8 interviews, March 22–27, 2026). Industry average calculated from the three meaningful alternatives students currently use: WhatsApp/Messenger group chats (the dominant channel), Facebook Marketplace / Georgian Facebook groups (the one structured channel SN found), and Georgian-language tutoring websites (inaccessible to non-Georgian speakers). Scores are on a 1–5 scale (1 = very poor, 5 = excellent).

| Factor | WhatsApp / Group Chats | Facebook Groups (GEO) | Georgian Tutoring Sites | Industry Average | TutorLink Score |
|--------|----------------------|----------------------|------------------------|-----------------|-----------------|
| Tutor discoverability without prior contact | 2 | 3 | 2 | 2.3 | 5 |
| Rate transparency (visible before contact) | 1 | 2 | 2 | 1.7 | 5 |
| Availability visibility (real-time slots) | 1 | 1 | 1 | 1.0 | 4 |
| Subject specialisation filtering | 1 | 2 | 2 | 1.7 | 4 |
| Language of instruction filter | 1 | 1 | 1 | 1.0 | 5 |
| Social proof / trust signals (reviews, ratings) | 3 | 1 | 1 | 1.7 | 4 |
| Booking confirmation and reference | 1 | 1 | 1 | 1.0 | 5 |
| Need for a Georgian social network | 5 | 3 | 2 | 3.3 | 1 |
| Manual coordination overhead (scheduling by chat) | 5 | 4 | 3 | 4.0 | 1 |
| Language accessibility (English UI) | 2 | 1 | 1 | 1.3 | 5 |

*Note: For "Need for a Georgian social network" and "Manual coordination overhead," a score of 5 = very high burden on the student, which is bad. TutorLink scores 1 = eliminates this burden entirely. Industry averages are high = bad for the user.*

---

## ERRC Framework

| Factor | Action | Rationale |
|--------|--------|-----------|
| Need for a Georgian social network to start a search | **Eliminate** | The single biggest barrier for international students (SN, Interview 4: "There was nobody left to ask") and the structural reason new arrivals cannot find tutors at all. TutorLink replaces network dependency with a searchable, public directory accessible to any student regardless of how long they have been in Georgia. |
| Manual coordination overhead (scheduling by chat) | **Eliminate** | MT (Interview 5) spends 30–45 minutes per week on scheduling messages; both of Lizi's tutor cousins described turning down new students because the overhead felt unsustainable. TutorLink's availability slot system removes the back-and-forth negotiation entirely. |
| Social proof dependency on personal vouching only | **Reduce** | The current system requires a personal introduction from someone who has already used the tutor — a high-friction, network-dependent trust mechanism. TutorLink reduces this dependency by replacing it with structured reviews and ratings, while preserving the ability for users to share profile links (formalising the vouching behaviour rather than eliminating it). |
| Rate transparency (visible before contact) | **Raise** | Currently a student must initiate a separate conversation to discover a tutor's rate, and rates are stale the moment they are shared (GM, Interview 3: "rates change, nothing is written down"). TutorLink raises this to 5 by displaying the current rate on every profile and every search result card — no contact required to find out what a tutor charges. |
| Subject specialisation filtering | **Raise** | AB (Interview 2) received a recommendation for an English tutor who turned out to teach general English, not academic writing. No existing channel allows filtering by specialisation before contact. TutorLink raises this from 1.7 industry average to 4 by adding subject tags and search filtering. |
| Booking confirmation and reference number | **Create** | No existing channel produces a confirmed booking record. A student who arranges a session via WhatsApp has no reference — if the tutor does not show up, there is no record the session was scheduled. TutorLink creates a confirmed booking with a reference number (TL-XXXXXXXX), which is a genuine new-to-market feature in the Georgian tutoring context. |
| Language of instruction filter | **Create** | No existing channel allows filtering by the language a tutor teaches in. For Georgian students, this is optional convenience. For international students without Georgian language ability, it is the difference between a usable and an unusable platform (SN, Interview 4: "she gave me a name but told me the tutor only speaks Georgian"). TutorLink creates an English/Georgian language filter that does not exist anywhere in the current market. |
| English-language platform UI | **Create** | Every existing Georgian tutoring resource — group chats, Facebook groups, tutoring websites — operates primarily in Georgian. SN (Interview 4) searched online and found nothing she could read. TutorLink creates a fully English-language platform UI, making the product accessible to all international students studying in Georgia regardless of Georgian language proficiency. |

---

## Blue Ocean Narrative

### What we stopped competing on

TutorLink eliminates two dimensions that every existing alternative competes on intensely: dependency on a Georgian social network, and manual coordination overhead through chat.

Every existing channel — WhatsApp groups, Facebook groups, Georgian tutoring sites, word-of-mouth — assumes the student already knows people who know tutors. The entire discovery process is mediated by personal connections: you ask someone, they give you a name, you message that person. Students who arrive at KIU in September and know nobody cannot participate in this system. SN (Interview 4) tried for six weeks and exhausted the system entirely, failing her first exam as a direct consequence. TutorLink does not ask the student to bring their own network — it provides the network.

We also eliminate the scheduling negotiation that tutors like MT (Interview 5) describe as a "second job." The current system requires a separate WhatsApp thread per student, manual availability checking, and a back-and-forth negotiation for every session change. We replace this with a slot-based availability system that lets tutors publish their open times and students book directly — no chat required beyond the initial booking confirmation.

By eliminating these two dimensions, we deliberately reduce TutorLink's complexity and scope relative to what a general-purpose platform might offer. We do not have in-app messaging, a social feed, AI tutor matching, or native apps. These are deliberate reductions, not gaps. Our target user needs to find a tutor and book a session in one visit — not to build a study community.

### What we introduced

TutorLink creates three dimensions that genuinely do not exist in the current Georgian tutoring market.

The first is a confirmed booking with a reference number. No existing channel — not WhatsApp, not Facebook, not any Georgian website — produces a booking record. A student who arranges a session via a group chat has no confirmation and no recourse if the tutor does not show. A booking reference number is trivially simple but structurally new in this context.

The second is a language-of-instruction filter. International students at KIU represent a disproportionately high-pain segment (43% of our smoke test signups despite being a minority of the student population) precisely because no existing channel lets them filter by tutoring language. Georgian group chats, Georgian websites, and Georgian social networks all assume Georgian fluency. A language filter on a fully English-language platform is a new-to-market feature that directly addresses the structural exclusion of international students from the existing system.

The third, emerging in Sprint 3, is structured social proof via reviews tied to confirmed completed sessions. The current market relies on personal vouching — TK (Interview 1) only converted when a trusted friend personally endorsed the tutor. Reviews at scale replace the network-dependency of vouching with a persistent, accessible trust signal that benefits students who have no existing network connections.

### Why this combination is right for our specific users

Our target users split into two distinct groups who both benefit from this specific set of trade-offs, but for different reasons.

Domestic students with established Georgian networks lose very little from TutorLink's elimination of the social-network-dependency dimension — they already have that network. What they gain is time. TK (Interview 1) spent a week and a half searching for one tutor through a channel they already knew how to use. The efficiency improvement alone — from a week to a same-day search — is the value proposition for this group, even without the language filter or the English UI.

International students gain something qualitatively different: access to a market that was previously structurally inaccessible to them. SN (Interview 4) could not participate in the existing system at all. For this group, TutorLink is not a faster version of something they could already do — it is a functional alternative to something that did not work. This is why the language filter and the English UI are create-level innovations rather than raise-level improvements: they do not make an existing experience better, they make an experience possible that previously was not.

The elimination of manual coordination overhead benefits tutors as much as students, which is the supply-side reason TutorLink's two-sided network effect is plausible. MT (Interview 5) turned down students because scheduling was unsustainable. Eliminating that overhead is not a student-facing feature — it is the reason tutors will maintain their profiles and the reason the supply side of the platform will not collapse from coordinator fatigue.

---

*Strategy Canvas | TutorLink Team | CS-PD-2026 | Spring 2026*