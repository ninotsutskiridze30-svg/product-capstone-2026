# Consent Flow Design

**Product:** TutorLink  
**Team:** TutorLink Team  
**Date:** June 11, 2026  
**Related file:** `08-legal/privacy-notice.md`

---

## Overview

This document describes how TutorLink obtains, records, and allows withdrawal of user consent under GDPR. Consent under GDPR must satisfy six requirements: freely given, specific, informed, unambiguous, withdrawable, and documented.

**Current state:** Our consent mechanism is partially implemented. TutorLink's current MVP is a static browsing experience with no user accounts, login, or form submissions. Gaps between current implementation and full GDPR compliance are explicitly noted in each section.

---

## 1. What Requires Consent

Not all data processing requires consent. Processing based on legitimate interest does not require consent but requires that a legitimate interest assessment has been carried out. Consent is specifically required for processing activities that cannot rely on another lawful basis.

| Processing activity | Lawful basis used | Does this require consent? |
|--------------------|-------------------|---------------------------|
| Anonymous behavioural event data sent to PostHog | Legitimate interest (product improvement) | No — legitimate interest applies. Users are informed via this privacy notice. |
| Vercel server request logs including IP address | Legitimate interest (security and reliability) | No — legitimate interest applies. This is standard infrastructure logging. |
| Marketing emails (future feature) | Consent | Yes — if we add email marketing, explicit opt-in consent will be required before any email is sent. |
| User account creation and profile data (future feature) | Contract | No — processing necessary to fulfil the contract of providing the service. |

**Current conclusion:** The MVP as deployed does not carry out any processing that strictly requires consent under GDPR. Analytics processing relies on legitimate interest and is disclosed in the privacy notice. No consent checkbox is therefore required for the current browsing-only experience.

This is documented here because it is a genuine legal assessment, not an oversight. When features requiring consent are added (marketing emails, optional personalisation), this document will be updated before those features go live.

---

## 2. Where Consent Will Be Obtained: Planned Consent Moment

Although no consent moment is required for the current MVP, we document the planned consent design for when user accounts are introduced (Sprint 3).

**Planned location in the flow:**  
After the user fills in their name and email on the signup screen, before they click the Create Account button.

**Planned UI element:**

```
Below the signup form, before the submit button:

  By creating an account, you agree to our Terms of Service.
  We use your data to provide TutorLink (contract basis).
  For details, see our Privacy Notice.

  [ ] I would like to receive product updates and tips by email (optional)

  [Create Account]
```

**Key requirements verified in this design:**

- [ ] The marketing consent checkbox is NOT pre-ticked (a pre-ticked box is not valid consent under GDPR)
- [ ] Analytics processing (legitimate interest) is disclosed in the privacy notice linked above the button — it does not require a separate consent checkbox
- [ ] Marketing consent is a separate, optional checkbox — not bundled with account creation
- [ ] A user can create an account and use the product without ticking the optional marketing checkbox
- [ ] The privacy notice is linked and accessible before the user completes signup

---

## 3. Consent Categories

### Category 1: Marketing communications (future — Sprint 3)

**Purpose:** Sending product updates, feature announcements, and tips by email  
**Is it optional?** Yes. A user can create an account and use TutorLink without consenting to marketing.  
**Default state:** Unchecked by default  
**UI element:** Checkbox with label "I would like to receive product updates and tips by email"  
**What happens if the user declines:** Account is created normally. User does not receive marketing emails. Core product functionality is unaffected.  
**Current implementation state:** Not yet built. No marketing emails are sent from the current MVP. This category will be implemented before any marketing email functionality is activated.

---

### Category 2: Analytics (not a consent category — legitimate interest)

PostHog analytics processing in the current MVP is based on legitimate interest, not consent. We collect anonymous behavioural events with no PII. This is disclosed in the privacy notice.

If we were to expand analytics to include session replay, heatmaps of individual user behaviour linked to identifiable accounts, or any processing that goes beyond product improvement, we would reassess whether legitimate interest continues to apply or whether consent becomes necessary.

---

## 4. Withdrawal Mechanism

### Current MVP (no accounts)

Users can stop PostHog tracking at any time by clearing their browser's local storage for tutoring-lyart.vercel.app. This removes the anonymous visitor ID from their device. PostHog will treat subsequent visits as a new anonymous visitor. No contact with TutorLink is required.

**Steps:**  
Browser settings → Storage / Local storage → Clear data for tutoring-lyart.vercel.app → PostHog tracking stops.

**Alternative:** Email nino.tsutskiridze@student.kiu.edu.ge with subject "Opt out of analytics" and provide the PostHog visitor ID (visible in browser local storage under a key beginning with `ph_`). We will suppress tracking for that ID in PostHog within 5 business days.

### Planned withdrawal for future account features (Sprint 3+)

**Where:** Settings → Privacy → Manage communication preferences  
**Steps for marketing email withdrawal:** Two steps — navigate to Settings, toggle off "Product updates by email"  
**Effect:** TutorLink stops sending marketing emails immediately. Event data already sent to PostHog for product analytics (legitimate interest basis) is not deleted on withdrawal — that is a separate right to erasure request.  
**Current state:** Not yet built. Will be implemented at the same time as the marketing email feature, before any marketing emails are sent.

---

## 5. Consent Storage Record

### Current MVP

No consent records need to be stored because no processing in the current MVP requires consent. The PostHog anonymous visitor ID is stored in the visitor's own browser local storage — it is not stored on our servers.

### Planned consent storage for Sprint 3 (user accounts with marketing email)

When account creation is implemented, consent records will be stored in Supabase Postgres in a `consent_records` table with the following schema:

```
consent_records table:
  user_id          UUID (foreign key to users table)
  category         TEXT ('marketing_email')
  given            BOOLEAN
  timestamp        TIMESTAMPTZ
  privacy_notice_version  TEXT ('1.0')
  method           TEXT ('checkbox on signup screen')
  ip_at_consent    INET (retained for dispute resolution only)
```

**Retention:** Consent records retained for the life of the account plus 2 years to handle any disputes about whether consent was given.  
**Current state:** Table not yet created. Will be created as part of the Sprint 3 authentication implementation before any consent-requiring feature goes live.

---

## 6. Gaps and Remediation Plan

| Gap | Owner | Target completion date |
|-----|-------|----------------------|
| Consent storage table (`consent_records`) not yet created in Supabase | Luka Khimshiashvili (Tech Lead) | Before Sprint 3 auth launch |
| Marketing email withdrawal UI not yet built | Luka Khimshiashvili | Before first marketing email is sent |
| In-product privacy notice link not yet visible to visitors on the live site | Nino Tsutskiridze | Sprint 3 |
| Legitimate interest assessment not formally documented (currently described in privacy notice) | Nino Tsutskiridze | June 2026 |