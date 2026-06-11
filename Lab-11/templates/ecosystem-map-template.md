# Ecosystem Map

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** June 11, 2026

---

## Overview

This document maps every relevant party in TutorLink's surrounding environment. It is used to identify strategic opportunities, manage threats proactively, and surface relationships that can accelerate growth.

---

## 1. Complements

Products or services that make TutorLink more valuable when used together.

| Complement | Description | Why it makes us more valuable |
|------------|-------------|-------------------------------|
| Telegram exam-prep groups | Existing Telegram groups where Georgian exam students share resources and ask questions. Estimated 8–15k students across the top 5 groups. | Our tutors posting content in these groups drives profile visits and bookings. Students already pooled in these groups are our exact ICP — distribution cost is near zero. |
| Instagram and TikTok | Short-form video platforms where Georgian teens spend significant daily time. | Tutors solving exam problems on camera create organic content that drives awareness and profile visits without ad spend. Algorithmic distribution amplifies reach beyond our existing network. |
| Supabase | Managed Postgres database, authentication, storage, and realtime infrastructure. | Removes the need to operate backend infrastructure. Every TutorLink feature — booking, homework, chat — runs on Supabase. Without it, the MVP would have required 3–4 additional months of infrastructure work. |
| LiveKit Cloud | Managed SFU (Selective Forwarding Unit) for video calls. | Enables HD video lessons without operating a media server. The whiteboard syncs over the LiveKit data channel, meaning one service handles both video and whiteboard state. |
| PostHog | Product analytics platform. | Measures our North Star metric (weekly completed lessons) and all funnel events. Without PostHog, we cannot evaluate our GTM experiments or make evidence-based product decisions. |

---

## 2. Partners

Organisations that give us access, distribution, data, or credibility.

| Organisation | What they provide | Relationship status | Next action |
|-------------|-------------------|--------------------|----|
| Exam-prep tutors in Tbilisi and Kutaisi | Supply side of the marketplace — their subject expertise and existing student relationships are the core product | Confirmed — 3 tutors signed up via waitlist on May 18, 2026 | Onboard all 3 to full tutor profiles; send referral links for their existing students by June 20 |
| KIU student network | Early student signups, usability testing participants, and word-of-mouth distribution within KIU | In discussion — 5 student signups from waitlist, 3 usability test participants recruited from KIU network | Ask each participant to share the platform with 3 classmates preparing for exams |
| Georgian Ministry of Education | Exam syllabus data to power subject-coverage fields on tutor profiles | Identified — not yet approached | Draft an outreach email to the Ministry's digital services contact; target first contact by August 2026 |
| KIU and Free University Tbilisi student unions | Distribution channel to reach exam-prep students at scale through trusted institutional channels | Identified — not yet approached | Contact student union representatives at both universities by July 15, 2026 |

**Relationship status definitions:**
- **Confirmed:** A formal agreement or documented signup exists and is committed to the repository.
- **In discussion:** Active conversations have occurred. A contact name exists.
- **Identified:** We know this organisation is strategically relevant but have not yet made contact.

---

## 3. Threats

Parties who could decide to enter our market and compete with us.

| Threat | Type | Likelihood | Our counter-strategy |
|--------|------|-----------|----------------------|
| Georgian-focused solo founder who sees the same gap | Direct competitor | Medium — the gap is visible to anyone doing customer discovery in Georgia | Execute the tutor referral loop immediately to build switching costs before a competitor can acquire the same tutors; the lesson history and homework records on our platform create lock-in that a new entrant cannot replicate |
| Preply or iTalki localising for Georgia | Platform threat | Low — Georgian market is too small relative to their global priorities to justify a dedicated localisation effort in the next 12 months | Build deep exam-syllabus specificity that requires local knowledge; a language locale change does not replicate understanding of the ერთიანი ეროვნული გამოცდები structure |
| Tutors taking student relationships off-platform after acquiring them through TutorLink | Direct threat to retention | Medium — tutors have financial incentive to avoid the 15% commission once the relationship is established | Whiteboard history, homework records, and payment integration must be compelling enough that staying on-platform is easier than leaving; ship payment integration by Q4 2026 |
| LiveKit significant price increase | Technology shift | Low-medium — we are on pay-as-you-go with no contract | Architecture supports swapping the media layer; self-hosted LiveKit on a VPS is a documented fallback in 03-build/architecture/risk-spikes.md |

---

## 4. Complementors

Parties whose product or service increases demand for TutorLink even without a formal relationship.

| Complementor | How they increase demand for us | Priority for engagement |
|-------------|-------------------------------|------------------------|
| Bakur Sulakauri publishing (Georgian exam prep books) | Students who are actively buying past-paper books are exactly our ICP — motivated, in active preparation, and already spending money on exam prep. A co-promotion placing TutorLink in front of their buyers at the moment of purchase would reach our target segment with near-zero acquisition cost. | High |
| Georgian university admissions offices (TSU, Free Uni, KIU) | Universities that communicate with applicants increase awareness of the exam's importance, which increases demand for exam-prep tutoring. Their communications are trusted by students and parents in a way that our own marketing is not. | Medium |
| Private schools with weak internal exam-prep programs | School counsellors who cannot meet all students' tutoring needs become natural referrers. A recommendation from a trusted teacher carries more weight than any paid channel. | Medium |

---

## Strategic Priorities

**The partner relationship we should prioritise in the next 90 days:**

KIU and Free University Tbilisi student unions are the highest-priority partner relationship. Both organisations have direct access to our exact ICP — students currently enrolled in Georgian universities who either sat the exam recently or have younger siblings preparing for it. A student union endorsement provides credibility that an unknown platform cannot buy. We would offer the platform free to union members and provide co-branded materials explaining the tutoring matching process. The specific next step is to identify the student union president at each institution and send a one-paragraph introduction by July 15, 2026, ahead of the September exam preparation cycle.

**The threat most likely to materialise and our counter-strategy:**

A Georgian-focused solo founder is the most likely threat to materialise within 12 months. The gap we identified through customer discovery is visible to anyone who talks to Georgian exam students — the problem is obvious and the market is real. Our counter-strategy is speed on the supply side: every tutor we onboard and whose students we bring onto the platform through the referral loop is a tutor that a new entrant must re-acquire. Lesson history, whiteboard snapshots, and homework records create switching costs that compound over the 24-week exam cycle. The referral link launch in Sprint 2 (target: July 1, 2026) is our most important single action for building this barrier.

**The complementor we could engage for a lightweight co-promotion:**

Bakur Sulakauri is the most accessible complementor for a lightweight co-promotion. They are the largest publisher of Georgian national exam preparation materials and their books are purchased by our exact ICP at the start of every prep cycle. A lightweight co-promotion could be as simple as a printed QR code on the inside cover of their most popular past-paper book linking to a TutorLink landing page — they get a free value-add for their readers, we get placement in front of motivated exam students at the moment they commit to serious preparation. First step: identify their marketing or editorial contact and send a one-paragraph proposal by August 2026.