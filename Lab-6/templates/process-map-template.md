# Team Development Process Map

**Team:** TutorLink Team
**Product:** TutorLink
**Last Updated:** April 16, 2026
**Version:** 1.0

---

## Overview

This document describes how work flows through the TutorLink team from idea to deployed increment. It is the operational agreement all team members commit to for the duration of the sprint arc. If a process step is unclear or disputed during a sprint, this document is the source of truth. It is a living document — amendments require unanimous team agreement and a dated commit.

---

## Scrum Roles

| Role | Name | Responsibilities |
|------|------|-----------------|
| Product Owner (semester-long) | Lizi Margvelashvili | Owns and orders the backlog. Accepts or rejects sprint increments against AC. Ensures every story traces to interview evidence before it enters the sprint backlog. Reviews AI-generated features to confirm they serve the problem the interviews identified, not the team's assumptions. |
| Scrum Master (Sprint 1) | Luka Khimshiashvili | Facilitates Sprint Planning, Review, and Retrospective. Runs blocker escalation. Monitors ai-usage-log.md for missing entries at each standup. |
| Scrum Master (Sprint 2) | Mari Janjghava | Rotates after Sprint 1 Retrospective. |
| Scrum Master (Sprint 3–4) | Nino Tsutskiridze | Rotates after Sprint 2 Retrospective. |

---

## Story Lifecycle

A story moves through these states in order. A story cannot skip states.

```
Backlog → Refined → Sprint Backlog → In Progress → In Review → Done
```

| State | Meaning | Who Sets It |
|-------|---------|------------|
| Backlog | Story exists but is not yet ready for a sprint | PO |
| Refined | Story has a complete user story, AC in Given-When-Then format, story points, and interview evidence. Ready to commit to a sprint. | PO after team refinement session |
| Sprint Backlog | Committed to the current sprint. Developer and AI tool assigned. | SM after Sprint Planning |
| In Progress | Developer has started work. Branch created. | Developer who pulled the story |
| In Review | PR raised to `main`. Awaiting human code review. | Developer |
| Done | All DoD criteria confirmed. PO has verified AC. Merged to `main`. | PO — final confirmation. SM — merge approval. |

---

## Definition of Done

A story is Done when every item below is confirmed. No exceptions.

- [ ] Code reviewed by at least one team member who is not the original author
- [ ] Pull request merged to `main` via GitHub PR — no direct pushes to `main` under any circumstances
- [ ] Acceptance criteria confirmed as met by Lizi (PO) — not by the developer who built it. PO reviews at the deployed Vercel URL, not on the developer's localhost.
- [ ] If AI-generated: all AI-generated code blocks are annotated with inline comments explaining the logic in the developer's own words
- [ ] If AI-generated: entry added to `docs/ai-usage-log.md` with correct format before the PR is raised
- [ ] Feature works at the deployed Vercel URL — confirmed with a fresh browser session (not the developer's cached session)
- [ ] No new known bugs introduced to the `main` branch

A story that is "almost Done" or "Done except for one edge case" is not Done. It stays In Review until every item passes. If a sprint ends with stories In Review, they carry over to the next sprint. They do not count toward the Sprint 1 velocity.

---

## AI Review Process

All team members use AI tools. The following process applies to every piece of AI-generated output before it is committed. This is not optional — the audit at Checkpoint 3 checks ai-usage-log.md entries against merged PRs.

### Step-by-Step Review

1. **Generate:** Developer uses the designated AI tool for the story (as assigned at Sprint Planning).
2. **Read every line:** Developer reads the entire output before accepting any of it. Tab-to-accept without reading is not permitted.
3. **Check against AC:** For every acceptance criterion in the story, run or manually test the generated output. If any AC fails, edit the output until it passes. Do not raise a PR until all AC pass.
4. **Security and privacy check:** For any endpoint, form, or data-handling code — confirm no unintended PII in logs or storage, no SQL injection vulnerability, no hardcoded secrets. Check that `user_id` is always a UUID, never an email address.
5. **Annotate:** Add inline comments to AI-generated code blocks explaining what each section does. Comments must be in the developer's own words — not the AI's explanation copied verbatim.
6. **Log:** Add an entry to `docs/ai-usage-log.md` in the required format before raising the PR.
7. **PR review:** The human reviewer reads the annotation and verifies the log entry as part of their review. A PR from AI-generated code with missing annotation is returned without merge.

### AI Tool Assignment by Story Type

| Story Type | Default AI Tool | Why |
|-----------|----------------|-----|
| UI screens and components | Google Stitch | Fastest path from AC to working high-fidelity UI |
| Complex multi-file backend logic (search, booking, auth) | Claude Code | Best at understanding full codebase context across multiple files |
| AI-powered features (if added in Sprint 3–4) | Google AI Studio | Prompt prototyping before production API integration |
| Boilerplate, repetitive patterns, docstrings, simple completions | GitHub Copilot | Ambient completion — always on, low overhead |

Tool assignments are made at Sprint Planning and recorded in the sprint plan. A developer can switch tools during execution if a better choice emerges. The switch must be noted in the ai-usage-log.md entry for that story.

---

## Branching and Pull Request Process

### Branch Naming Convention

```
feature/[story-id]-[short-description]
fix/[story-id]-[short-description]
```

Examples:
```
feature/s1-03-tutor-search-endpoint
fix/s1-05-booking-concurrency-test
```

All branches are created from `main`. Never branch from another feature branch.

### PR Requirements

Every PR to `main` must include:

1. **Title:** `[Story ID] Short description` (e.g. `[S1-03] Tutor search by subject and language`)
2. **Body must contain:**
   - Full user story (As a / I want / So that)
   - AC checklist with each criterion marked as Passed or Failed with brief evidence
   - AI tool used and a one-paragraph review summary, or "No AI used"
   - Screenshot or GIF of the feature working in the Vercel deployed environment (not localhost)
3. **Reviewer:** One team member who is not the original author reviews and approves
4. **PO confirmation:** Lizi comments "AC confirmed" in the PR before merge
5. **Merge:** The reviewer merges — not the original developer

### No direct pushes to `main`

Any commit pushed directly to `main` without a PR and review is a process violation. Luka (SM) flags it at the next standup. The commit is not counted toward the sprint increment.

---

## Standup Format

**Cadence:** Every Tuesday and Thursday at 20:00
**Location:** #standup Messenger group — async text post
**Format (every team member posts independently):**

```
Yesterday: [what I completed — include story ID and whether it is Done or still In Review]
Today: [what I am working on — include story ID]
Blocker: [anything stopping me — specific description, or "none"]
AI note: [what AI generated yesterday — tool used, what it produced, accepted / modified / discarded, and why]
```

**Posting deadline:** 20:30 on standup days. If a member has not posted by 20:30, Luka (SM) sends a direct message. If no response by 22:00, the SM assumes the member is blocked and flags it in the group.

**AI note is not optional.** If AI was not used that day, the entry reads: "No AI used today." If AI was used and the log entry is not yet added, the note reads: "Used Claude Code for [task] — log entry in progress, will be added before PR is raised."

---

## Blocker Resolution

| Blocker Type | First Action | Escalation If Unresolved After 24h |
|-------------|-------------|-------------------------------------|
| Technical (code, environment, library) | Post in standup with specific description of the problem and what has already been tried | SM posts in Messenger group tagging all team members. Consider pair programming session same day. |
| Story dependency (waiting on another story to be Done) | Flag in standup. SM reprioritises the blocking story or re-assigns it. | PO adjusts sprint scope — the blocked story moves to next sprint if dependency cannot be resolved by Day 5. |
| AI tool failure or hallucination | Note in ai-usage-log.md. Try the alternative tool assigned in the sprint plan. | Bring to next standup. Team decides whether to proceed with manual implementation or wait. |
| External dependency (Supabase API, Vercel, third-party service) | Note in risk register. Try to isolate with a mock or stub. | PO notifies instructor if dependency is on a required course tool. |

---

## Sprint Ceremonies: Who Does What

| Ceremony | Facilitator | Required Attendees | Output |
|----------|------------|-------------------|--------|
| Sprint Planning (Lab day) | Scrum Master | All 4 team members in person | Committed sprint backlog with AC, assignees, AI tools, and capacity documented |
| Daily Standup | Async — no facilitator | All 4 members post by 20:30 | Blockers surfaced within 24h of arising. AI outputs reviewed. |
| Sprint Review | Product Owner | All 4 members (Google Meet) | PO accepts or rejects each story live against AC at deployed URL. Backlog updated immediately. |
| Retrospective | Scrum Master | All 4 members (Google Meet) | 1–3 concrete process changes committed to process-map.md before next sprint begins |

---

## ai-usage-log.md Entry Format

All AI-assisted work is logged in `docs/ai-usage-log.md`. This file is audited at Checkpoint 3. Missing entries for merged AI-assisted PRs will be flagged.

```
---
Date: YYYY-MM-DD
Story: [Story ID] — [Story summary]
Tool: [Google Stitch / Claude Code / GitHub Copilot / Google AI Studio]
Task: [Specific task the AI was asked to assist with]
Prompt summary: [Brief description of the main prompt used — enough for a reviewer to understand what was asked]
Files changed: [List of files the AI output touched or informed]
Result: Accepted / Modified / Discarded
Accepted %: [Approximate percentage of the AI output that was used as-is]
Review notes: [What specifically was checked. What was changed from the AI output and why. Any errors, hallucinations, or security issues found.]
Reviewer: [Name of team member who reviewed the AI output]
---
```

All entries are appended in reverse-chronological order (most recent at the top).

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| April 16, 2026 | 1.0 | Initial process map created in Lab 6 | Luka Khimshiashvili |

---

*Process Map | TutorLink Team | CS-PD-2026 | Spring 2026*