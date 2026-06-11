# Competitive Analysis

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** June 11, 2026
**Version:** 1.0 — Lab 11 submission

---

## Source Document

This analysis builds on the competitive landscape seed compiled in Lab 4:
`01-discovery/synthesis/competitive-landscape-seed.md`

---

## Competitor Matrix

Score each competitor on each dimension from 0 to 5.

**Scoring guide:**
- **5** = Excellent. This is a genuine strength of this competitor.
- **4** = Good. Above the average offering in this dimension.
- **3** = Adequate. Meets the minimum expected standard.
- **2** = Weak. Present but poorly executed.
- **1** = Minimal. Barely present.
- **0** = Absent. This dimension does not exist in this product.

Score your own product honestly. A product that scores 5 on every dimension is not credible to investors or judges.

| Dimension | Preply | iTalki | Tutorful | Superprof | WhatsApp (status quo) | TutorLink |
|-----------|--------|--------|----------|-----------|----------------------|-----------|
| Core feature coverage (find, book, learn, homework) | 3 | 3 | 2 | 1 | 0 | 5 |
| Pricing model (lower commission = higher score) | 1 | 4 | 2 | 5 | 5 | 4 |
| Target user segment fit (Georgian exam-prep) | 0 | 0 | 0 | 1 | 3 | 5 |
| Geographic or institutional reach | 5 | 5 | 3 | 4 | 5 | 1 |
| Quality of mobile experience | 4 | 4 | 3 | 2 | 4 | 4 |
| Data depth or personalisation | 3 | 3 | 2 | 1 | 0 | 3 |
| Switching cost or user lock-in | 3 | 3 | 2 | 1 | 2 | 4 |
| Georgian-language UI | 0 | 0 | 0 | 0 | 3 | 5 |
| Integrated video lesson with whiteboard | 2 | 2 | 0 | 0 | 0 | 5 |
| Homework and AI grading | 0 | 0 | 0 | 0 | 0 | 5 |

---

## Competitor Profiles

### Preply

**Type:** Direct competitor
**Description:** Global tutoring marketplace offering 1:1 video lessons in 50+ subjects across 150+ languages. Strong brand in Europe and North America.
**Primary strengths:** Large global tutor supply; polished video infrastructure; established review system; strong brand recognition.
**Primary weaknesses:** English-first platform; commission 18–33% (starts very high for new tutors); no Georgian exam-syllabus context; no whiteboard or homework integration.
**Why users choose them:** Global brand trust; large tutor supply for popular languages and subjects.

---

### iTalki

**Type:** Indirect competitor (language learning focus)
**Description:** Language learning marketplace strong in English, Chinese, Spanish. Designed for conversational practice, not curriculum-based exam prep. Commission: 15%.
**Primary strengths:** Lower commission rate aligned with ours; large supply for popular languages; well-known globally.
**Primary weaknesses:** Designed for language acquisition, not curriculum exam prep; no Georgian national exam context; no integrated lesson experience.
**Why users choose them:** Language learners who want conversational practice rather than structured curriculum tutoring.

---

### Tutorful

**Type:** Indirect competitor (different geography)
**Description:** UK tutoring marketplace strong for GCSE and A-Level exam prep. Commission: 22%. Connects tutor and student, who then use Zoom independently.
**Primary strengths:** Strong local brand in UK; good subject filters for UK curriculum; well-reviewed by UK students.
**Primary weaknesses:** Entirely UK-centric; no Georgian presence; no integrated lesson experience — tutor and student still use Zoom separately.
**Why users choose them:** UK students preparing for GCSE or A-Level who trust a locally-focused platform.

---

### Superprof

**Type:** Indirect competitor (directory model)
**Description:** Directory in 40+ countries where tutors list themselves and students contact directly. No booking or payment infrastructure. Tutors pay a subscription rather than per-lesson commission.
**Primary strengths:** Zero per-lesson commission for tutors; broad international presence; easy for tutors to list themselves.
**Primary weaknesses:** No integrated lesson experience; same fragmentation problem as WhatsApp just with a website; no Georgian exam context.
**Why users choose them:** Tutors who want visibility without paying per-lesson commissions; students who are comfortable managing the relationship manually.

---

### WhatsApp and Telegram (status quo)

**Type:** Substitute — the current behaviour our product replaces
**Description:** How all Georgian exam-prep tutor discovery actually happens today. Students post requests in group chats, collect forwarded tutor names, and contact each individually.
**Primary strengths:** Zero cost; existing social trust; familiar interface; no onboarding required.
**Primary weaknesses:** Stale information; manual serial process; no booking, payment, or lesson infrastructure; no reviews or verification.
**Why users choose them:** Default behaviour — no alternative existed before TutorLink.

---

## Synthesis

**The greatest Porter force threat to our product is:**

Threat of New Entrants. The technology stack for a tutoring marketplace — Next.js, Supabase, LiveKit — is publicly documented and replicable. A well-funded local founder with existing tutor relationships in Tbilisi could build a comparable feature set within 3 to 4 months. The barrier to entry is not technical complexity; it is the two-sided network. Our moat window is the period between now and when the marketplace achieves enough liquidity that tutor switching costs — accumulated lesson history, homework records, student relationships on the platform — make displacement costly. This is a time-sensitive race, which is why the tutor referral loop is Priority 1 in our GTM plan rather than product expansion.

**The two dimensions that create our most defensible competitive gap are:**

Georgian-language UI with national exam syllabus coverage is the first. Our competitors score 0 on this dimension. Preply and iTalki could theoretically add Georgian as a locale, but localising for a specific national exam curriculum requires deep knowledge of the ერთიანი ეროვნული გამოცდები subject structure that a remote team cannot replicate quickly. Our usability testing confirmed Georgian students default to the Georgian UI immediately and expect subject labels to map to specific exam topics, not generic subject names. A global platform's Georgian locale would still feel foreign to our ICP.

Integrated lesson experience — video call with collaborative whiteboard plus homework in the same session — is the second. Every competitor either has no video at all (Superprof, WhatsApp) or video without whiteboard or homework integration (Preply, iTalki). Our usability participant S-zk named the whiteboard unprompted as the reason to use TutorLink over a plain Zoom call. Building this integration requires significant engineering effort that no competitor has prioritised for a market as small as Georgia.

**What would have to change for this gap to close:**

A Georgian-focused investor backing a local team with existing tutor relationships could replicate the supply side within 6 months. If Preply decided to invest in a Georgian market localisation team — unlikely given the market size relative to their global priorities — they could close the language gap within a year. The integrated lesson experience gap would remain because it requires product prioritisation, not just localisation. The most realistic threat is a solo Georgian founder who sees the same gap we did and moves quickly before our tutor referral loop creates switching costs. This is why we are treating the first 60 days of tutor onboarding as the most critical window.