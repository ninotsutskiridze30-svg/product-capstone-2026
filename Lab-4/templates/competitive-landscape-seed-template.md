# Competitive Landscape Seed

**Team:** TutorLink Team
**Date:** March 26, 2026
**Purpose:** Compile all current solutions, workarounds, and alternatives mentioned by interviewees. This document becomes the foundation for the full competitive analysis in Week 13.

---

## Instructions

During our interviews, participants described how they currently handle the tutor discovery problem. They mentioned channels, processes, and workarounds. This document captures all of those, along with why each one fails to fully solve the problem.

---

## Direct Competitors

Products or services that explicitly try to solve the same problem.

| Solution | Type | Mentioned By | What Users Said | Strengths | Weaknesses |
|----------|------|-------------|----------------|-----------|------------|
| Russian/Ukrainian tutoring websites (unspecified) | Websites | Interview 4 (SN) | "I found some websites but they were for Russia or Ukraine, not Georgia" | Structured profiles, searchable by subject | Not localised for Georgia; Georgian tutors not listed; not accessible to non-Russian speakers |
| Georgian-language tutoring website (unspecified) | Website | Interview 4 (SN) | "One was in Georgian only. I could not even read the listings" | Exists in the Georgian market | Interface and listings in Georgian only; excludes international students; unclear if still active |
| TutorLink prototype (tutoring-lyart.vercel.app) | Web platform | Not mentioned by interviewees — identified by team | Early-stage platform matching students with tutors in Georgia, English-language interface, rate and subject visible | English interface, Georgian market focus, structured profiles with rates | Pre-launch; not yet known to users; tutor pool unverified; no reviews or social proof layer yet |

---

## Indirect Competitors

Products or services that solve a related problem or serve the same need differently.

| Solution | Type | Mentioned By | What Users Said | How It Relates |
|----------|------|-------------|----------------|---------------|
| WhatsApp group chats (course groups, year groups, accommodation groups) | Messaging platform | All interviews (TK, AB, GM, SN, MT) | "I posted in the CS group chat. Someone gave me a name." (TK) / "I asked in my Business group chat. Nobody answered." (SN) | Primary discovery channel for all interviewees. Allows a student to broadcast a request to a network simultaneously. Fails because responses are inconsistent, information is stale, and names arrive without context or endorsement. |
| Messenger group chats | Messaging platform | Interviews 2, 4 (AB, SN) | Used alongside WhatsApp as a secondary channel when WhatsApp produces no results | Same function as WhatsApp. Marginally different network composition (sometimes broader, sometimes more faculty-adjacent). Same failure modes: stale information, no tutor profiles, no filtering. |
| Facebook Marketplace / Facebook groups | Social platform | Interview 4 (SN) — searched, found nothing; Interview 7 (NA, planned) — used and found nothing useful | "I looked online" — SN searched Facebook as part of their platform search and did not find relevant tutors | Has geographic search and category filtering in theory. In practice, Georgian tutor listings are absent or inactive. Listings that exist are not standardised and cannot be filtered by subject, level, or language. |
| Personal network / direct ask to a specific trusted friend | Social process | Interviews 1, 3, 5 (TK, GM, MT) | "My friend gave me the last name directly and said she had used her personally" (TK) | Highest conversion rate of any channel — a personal vouching referral almost always results in a contact. Fails because it is available only to students with a relevant and informed social connection, and it does not scale. |
| University professor or faculty member | Institutional channel | Interview 2 (AB) | "I would ask my professor if she knows anyone. But I do not want to do that because then she knows I am struggling." | Faculty sometimes know active tutors in their subject area. Fails because accessing this channel requires disclosing academic difficulty to someone in a position of authority — a social cost most students avoid. |

---

## Manual Workarounds

Things people do by hand because no good solution exists. These are the strongest signals of unmet demand.

| Workaround | Mentioned By | What They Do | Time/Effort Cost | Why They Tolerate It |
|-----------|-------------|-------------|-----------------|---------------------|
| Sequential group chat posting — post, collect names, message each individually | TK, AB, GM, SN (all interviews) | Student posts a request in 2–4 group chats, collects names from replies, messages each tutor individually to ask about availability, rate, and subject fit. Restarts from the beginning if a contact fails. | 1–2 weeks for a single subject (TK); six weeks before abandonment (SN); four contacts before a match for an experienced searcher (GM) | "There is no other way to find out." (TK) — students tolerate it because no alternative exists, not because it works. |
| Asking a specific trusted person for a direct introduction | TK, GM | Instead of a group chat post, the student identifies one person they trust and asks them specifically to introduce a tutor they have used personally. | Hours to days, depending on whether the trusted person responds and whether their tutor is available | Higher conversion rate than cold group chat posts. Only available to students with the right social connection. |
| Accepting a schedule or rate compromise to avoid restarting | TK, GM | After one or more failed contacts, students accept a tutor who is not fully suitable — wrong time slot, higher rate than preferred — rather than continuing the search | Time saved on search; cost is a suboptimal tutoring arrangement | "The fourth one worked out" (GM) — worked out means available and affordable, not necessarily the best fit |
| Asking the declined student for another name (tutor-side workaround) | MT | When MT declines a student, the student asks "do you know anyone else who tutors?" MT then tries to recall names from memory with no knowledge of their current availability | A few minutes per declined student, multiplied by 4–5 declines per week | MT does it out of a sense of professional obligation — "I feel bad saying no" |
| Tutor managing all scheduling via individual WhatsApp conversations | MT, referenced by Lizi's cousins (Lab 1 observation) | Tutor maintains separate chat threads with each student family, confirms and renegotiates sessions manually, tracks availability in personal memory or notebook | 30–45 minutes per week (Lab 1 observation from Lizi's cousins); ongoing ambient anxiety about missed messages | No scheduling tool fits the tutor-student context in Georgia — generic tools (Calendly) are not localised and not designed for informal tutoring relationships |

---

## "Do Nothing" Behavior

Users who have given up trying to solve the problem. Why did they stop trying?

| Behavior | Mentioned By | Why They Gave Up |
|----------|-------------|-----------------|
| Abandoned the tutor search entirely and studied alone | SN (directly); TK's roommate (via TK) | SN: "I did not make a decision to stop. I just stopped. There was nobody left to ask." The channel was exhausted. TK's roommate: gave up after the search felt not worth the effort — TK reported this as "he just went without." |
| Accepted failing an exam rather than continuing the search | SN | After six weeks of searching with no match, SN sat the exam without tutoring support and failed the first attempt. The search had not produced a result within the available time. |
| Stopped posting in group chats after the second attempt produced no new names | AB | AB posted twice in their Business group chat. The second post received no responses. AB did not know what to do next and had effectively paused the search at the time of the interview. |

---

## Key Takeaways

1. **Most common current solution:** Sequential WhatsApp/Messenger group chat posting followed by individual manual outreach to each name collected. Used by all five interviewees as the primary or only channel. No interviewee found a structured platform that served their context.

2. **Biggest gap in existing solutions:** All current channels — group chats, personal networks, Facebook — share the same fundamental failure: they surface names but not information. A student who receives a tutor's name still knows nothing about availability, current rate, subject specialisation, or quality without initiating a separate conversation. The information gap is total, not partial.

3. **Strongest workaround signal:** The sequential manual contact process — posting, collecting names, messaging each individually, restarting after each failure — is the strongest workaround signal in the dataset. Every interviewee has invested significant time and effort in this process. GM (an experienced searcher) still contacts 3–4 people before a match. SN invested six weeks before giving up. Students are not tolerating this workaround because it is good; they are tolerating it because there is nothing else.

4. **Your opportunity:** No Georgian-market platform exists that gives students structured, filterable access to tutor profiles with availability, rate, subject coverage, and social proof — and simultaneously gives tutors a way to signal their status and filter inbound student demand. The gap is confirmed by all five interviewees. The bilateral nature of the failure (both student-side and tutor-side information poverty) means a two-sided platform that serves both simultaneously has a stronger value proposition than one that serves only students or only tutors.

---

## Notes for Week 13

This is a seed document. In Week 13, we will expand this into a full competitive analysis with 5+ competitors, Porter's Five Forces, moat identification, and counter-strategies. Key questions to investigate before Week 13:

- Are the Russian/Ukrainian tutoring platforms SN found still active? What exactly do they offer and why do they not serve the Georgian market?
- Are there any Georgian EdTech startups working on this problem that are not yet publicly visible?
- What would it take for a general marketplace (Facebook, local equivalents) to add a tutoring category that could become a credible competitor?
- Does the trust/social-proof requirement mean platforms like Preply or Wyzant (international) could localise into Georgia and compete, or does the local network dimension create a moat?

**File location:** `/01-discovery/synthesis/competitive-landscape-seed.md`

---

*CS-PD-2026 | Kutaisi International University | Spring 2026*