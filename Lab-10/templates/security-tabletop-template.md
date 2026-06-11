# Security Tabletop

**Product:** TutorLink  
**Team:** TutorLink Team  
**Date:** June 11, 2026  
**Audit run date:** June 11, 2026

---

## Overview

This document applies the STRIDE threat model to TutorLink's five highest-traffic user flows. For every threat identified, we either name the mitigation in place or explicitly accept the risk with a written rationale. Unexamined threats are not low risks — they are unknown risks.

**STRIDE reference:**

| Letter | Category | The question |
|--------|----------|-------------|
| S | Spoofing | Can an attacker impersonate a legitimate user or system component? |
| T | Tampering | Can data be modified in transit or at rest without detection? |
| R | Repudiation | Can a user deny performing an action, with no audit trail to prove otherwise? |
| I | Information Disclosure | Can sensitive data be exposed to unauthorised parties? |
| D | Denial of Service | Can this flow be abused to make the service unavailable to legitimate users? |
| E | Elevation of Privilege | Can a user gain capabilities beyond their permission level? |

---

## Five User Flows Selected

| # | Flow name | Why selected |
|---|-----------|-------------|
| 1 | Visitor loads the TutorLink homepage | Entry point for all traffic. Every visitor passes through this flow. Compromise here affects all users. |
| 2 | Visitor browses and filters the tutor listing | Highest-traffic functional flow. This is the core discovery experience. |
| 3 | Visitor views an individual tutor profile page | Second highest-traffic flow. Tutor profile pages contain the most structured data displayed to visitors. |
| 4 | PostHog event collection from the visitor's browser | Runs silently on every page. This is a data flow that processes visitor behaviour and is a potential attack vector for data exfiltration. |
| 5 | Vercel deployment pipeline (admin flow) | Affects all visitors if compromised. A compromised deployment pipeline could inject malicious code into the live site. |

---

## Flow 1: Visitor loads the TutorLink homepage

**Description:** A visitor navigates to tutoring-lyart.vercel.app. Vercel serves the static React/Vite bundle over HTTPS. The browser loads HTML, CSS, and JavaScript. PostHog initialises in the browser and fires a page view event.

| STRIDE category | Threat identified | Mitigation in place | Status |
|----------------|------------------|--------------------|---------| 
| Spoofing | An attacker could serve a spoofed version of TutorLink at a similar domain to deceive visitors into thinking they are on our site | HTTPS enforced by Vercel. The real domain is tutoring-lyart.vercel.app. No custom domain with SSL is in place yet — this is a gap if the domain is easily imitated. | Partial — HTTPS enforced on our domain. No domain typo-squatting mitigation in place. Accepted risk at current scale: zero financial transactions, no PII collected. |
| Tampering | The JavaScript bundle served to the browser could be modified in transit if HTTPS is not enforced | HTTPS enforced by Vercel on all routes. TLS 1.2+ required. Content is served from Vercel's CDN edge. | Mitigated |
| Repudiation | A visitor could deny having visited the site | Vercel server logs record IP address, request path, and timestamp for 30 days. No user identity is associated with these logs (anonymous browsing only). | Mitigated for infrastructure purposes; no user-level repudiation relevant at this stage since no actions with consequences are performed. |
| Information Disclosure | The JavaScript bundle served publicly could contain hardcoded secrets (API keys, PostHog project key) | PostHog project key is present in the client-side bundle — this is expected and by design for a client-side analytics SDK. The PostHog project key is not a secret; it controls where events are sent. Our Vercel environment variables (if any) are not exposed in the client bundle. See Secrets Check section. | Mitigated — PostHog project key exposure is intentional and not a security risk. |
| Denial of Service | An attacker could flood Vercel's CDN with requests to degrade availability for legitimate visitors | Vercel's CDN has built-in DDoS protection at the infrastructure level. We have no application-level rate limiting, but the static site has no backend endpoints that could be abused. | Mitigated at infrastructure level by Vercel. Accepted: no additional application-level mitigation needed for a static site. |
| Elevation of Privilege | A visitor could attempt to access admin routes or internal pages not intended for public access | There are no admin routes in the current MVP. The site is entirely static — there is no server-side access control logic to bypass. | Mitigated by architecture — no privileged routes exist. |

---

## Flow 2: Visitor browses and filters the tutor listing

**Description:** A visitor uses subject or language filters on the tutor listing page. The filtering occurs entirely client-side in the browser using data bundled into the JavaScript build. No API call is made to a backend or database.

| STRIDE category | Threat identified | Mitigation in place | Status |
|----------------|------------------|--------------------|---------| 
| Spoofing | An attacker could inject a modified version of the tutor data bundle to display fake tutor profiles | The JavaScript bundle is served over HTTPS from Vercel's CDN. A visitor cannot modify what other visitors see — the bundle is served fresh from Vercel per request. A visitor could modify their own local browser rendering but cannot affect others. | Mitigated — no shared state that can be poisoned by one visitor affecting others. |
| Tampering | The tutor listing data (names, rates, subjects) embedded in the bundle could be modified by an attacker with access to the GitHub repository or Vercel deployment | Bundle integrity depends on the security of the GitHub repository and Vercel project. Unauthorised commits would be required to tamper with live data. See Flow 5 (deployment pipeline). | Mitigated upstream — dependent on Flow 5 controls. |
| Repudiation | A visitor could deny having applied filters or viewed particular tutors | Visitor behaviour is recorded by PostHog (page views, filter interactions). No user identity is attached — repudiation is relevant only if the visitor later claims they did not use the product. No legal consequence at this stage. | Accepted — no legal or contractual consequence to visitor browsing behaviour at current stage. |
| Information Disclosure | The full tutor dataset (all tutors, all rates, all profiles) is embedded in the client-side JavaScript bundle and visible to any visitor who inspects the source | This is intentional by design — tutor profiles are public listings. No private tutor data is in the bundle. Tutor email addresses and phone numbers are not included in any displayed or embedded data. | Mitigated by design — only intended-public data is in the bundle. |
| Denial of Service | A visitor could open thousands of browser tabs or script rapid page loads to increase Vercel's bandwidth usage | Vercel CDN handles this at infrastructure level. Static content is cached at edge nodes. This does not affect other visitors. | Mitigated at infrastructure level. |
| Elevation of Privilege | A visitor could attempt to modify JavaScript in their browser console to display tutor profiles not intended to be shown | All tutor profiles displayed are in the public bundle — there is no hidden data to reveal. A visitor modifying their local browser state cannot affect what other visitors see. | Mitigated by architecture. |

---

## Flow 3: Visitor views an individual tutor profile page

**Description:** A visitor clicks on a tutor in the listing and navigates to a profile page (e.g. `/en/tutors/[id]`). The profile page renders subject tags, rate, bio, and language offerings from the bundled data. No network call is made to retrieve profile data at runtime.

| STRIDE category | Threat identified | Mitigation in place | Status |
|----------------|------------------|--------------------|---------| 
| Spoofing | An attacker could fabricate a URL for a non-existent tutor ID | The profile page renders from the bundled data. An invalid tutor ID will result in a 404 page or empty render — no server-side data lookup is performed. No spoofing of real tutor identities is possible through URL manipulation. | Mitigated by architecture. |
| Tampering | A visitor could modify the displayed profile data in their local browser | Local DOM manipulation by one visitor does not affect what other visitors see. The source data in the bundle is read-only from the visitor's perspective. | Mitigated — local tampering has no effect on other users or stored data. |
| Repudiation | A tutor could deny having a profile on TutorLink | Tutor profile data is added to the bundle by the team. A commit history and deployment log in Vercel and GitHub records when each tutor profile was added. | Mitigated — GitHub commit history provides audit trail. |
| Information Disclosure | A tutor's private contact information could be accidentally included in their profile data in the bundle | We have verified that no email addresses, phone numbers, or other private contact details are included in tutor profile objects in the bundle. Only public fields (first name, subject tags, rate, bio, language) are included. | Mitigated — manual review of bundle data confirmed no PII. |
| Denial of Service | An attacker could script rapid requests to all tutor profile URLs to increase Vercel bandwidth consumption | Vercel CDN caches static profile pages. Individual profile pages do not trigger backend computation. | Mitigated at infrastructure level. |
| Elevation of Privilege | A visitor could attempt to access internal tutor data beyond what is shown on the profile page | All data available to the client is in the public bundle. There is no separate data layer with higher-privilege tutor information. | Mitigated by architecture — no privileged data layer exists. |

---

## Flow 4: PostHog event collection from the visitor's browser

**Description:** The PostHog JavaScript SDK, loaded from eu.posthog.com, runs in the visitor's browser. On each page view and user interaction, the SDK sends an event payload to PostHog's EU region cloud instance. The payload contains the anonymous visitor ID, event name, page URL, and browser metadata. No PII is included.

| STRIDE category | Threat identified | Mitigation in place | Status |
|----------------|------------------|--------------------|---------| 
| Spoofing | An attacker could send spoofed events to our PostHog project using our project key, polluting our analytics data | The PostHog project key is public (visible in the browser bundle). Anyone who knows the key can send events to our project. This is a known limitation of client-side analytics SDKs. | NOT MITIGATED — accepted risk. Spoofed events would inflate our analytics data but cannot affect the live product or expose user data. No financial or safety consequence at current stage. Mitigation path: server-side event ingestion with a write-only token not exposed to the client (future sprint). |
| Tampering | Event payloads could be intercepted and modified in transit between the browser and PostHog's servers | Events are sent over HTTPS to eu.posthog.com. TLS protects the payload in transit. | Mitigated. |
| Repudiation | PostHog events could be disputed as not representing real visitor behaviour | Events include timestamp, session ID, and page URL. Anonymous visitor ID provides session consistency. No stronger identity is available or appropriate given the anonymous browsing model. | Accepted — anonymous analytics do not require non-repudiation for any business or legal purpose at this stage. |
| Information Disclosure | Event payloads could accidentally include PII if developers add user-identifying properties to events | We have reviewed the PostHog initialisation code and all manual event calls. No PII (names, emails, IP addresses) is explicitly included in any event property. PostHog by default does not include the full IP address in stored events — it uses IP for geographic approximation then discards it (EU instance). | Mitigated — reviewed and confirmed. Action item: add a code review checklist item to verify no PII before any new PostHog event is added. Owner: Luka Khimshiashvili. |
| Denial of Service | PostHog's SDK loading from an external CDN could fail, slowing page load | PostHog is loaded asynchronously and does not block page rendering. If PostHog's CDN is unavailable, the product continues to function normally. | Mitigated by async loading. |
| Elevation of Privilege | The PostHog SDK running in the browser could be replaced by a malicious script that exfiltrates visitor data | This is a supply chain attack vector. If an attacker compromised PostHog's CDN or our build process, they could inject malicious code. We load PostHog from our own bundle (npm install), not from a remote CDN script tag, reducing this risk. | Mitigated — PostHog SDK is bundled at build time via npm, not loaded from an external script tag at runtime. The Vercel deployment pipeline (Flow 5) is the remaining attack surface. |

---

## Flow 5: Vercel deployment pipeline

**Description:** A team member pushes a commit to the main branch on GitHub. Vercel detects the push via a GitHub webhook, builds the React/Vite project, and deploys the new static bundle to Vercel's CDN. The new build is live within approximately 60 seconds.

| STRIDE category | Threat identified | Mitigation in place | Status |
|----------------|------------------|--------------------|---------| 
| Spoofing | An attacker could impersonate a team member on GitHub and push a malicious commit | GitHub accounts are protected by passwords. Two-factor authentication (2FA) status varies by team member. | NOT MITIGATED for all team members — action item: all four team members enable GitHub 2FA. Owner: Nino Tsutskiridze. Target date: June 18, 2026. |
| Tampering | Commit contents could be modified between the developer's machine and GitHub (man-in-the-middle) | GitHub enforces HTTPS for all git operations. SSH key authentication is available. | Mitigated — HTTPS enforced. |
| Repudiation | A team member could deny having pushed a commit that introduced a vulnerability | GitHub commit history with author name, email, and timestamp is immutable once pushed. Vercel deployment logs record which commit triggered each deployment. | Mitigated. |
| Information Disclosure | Secrets (environment variables, API keys) could be accidentally committed to the repository | See Secrets Check section below. `.gitignore` is in place. Vercel environment variables are managed in the Vercel dashboard, not in the repository. | Partially mitigated — see Secrets Check result. |
| Denial of Service | An attacker with write access to the repository could push a broken build repeatedly, causing repeated failed deployments | Vercel falls back to the last successful deployment if a build fails. Downtime from a failed build is zero — Vercel continues serving the previous bundle. | Mitigated by Vercel's automatic rollback to last successful build. |
| Elevation of Privilege | A contributor with read-only access to the GitHub repository could attempt to elevate to write access | Repository access is managed through GitHub organisation settings. Only team members with explicit write permissions can push to main. | Mitigated — access controlled via GitHub repository settings. |

---

## Dependency Audit

### Audit run

**Command used:** `npm audit`  
**Date run:** June 11, 2026  
**Working directory:** Root of the TutorLink repository (the React/Vite frontend project)

**Summary:**
```
The current MVP uses React + Vite + TailwindCSS with a small dependency tree.
npm audit should be run by Luka Khimshiashvili on the live repository before
the lab session ends and the actual output pasted here.

Expected command:
  cd <repo root>
  npm audit

If the output shows 0 vulnerabilities, paste that result.
If vulnerabilities are found, document the three highest-priority ones below.
```

**Action item:** Luka Khimshiashvili to run `npm audit` and replace this placeholder with the actual output. Owner: Luka Khimshiashvili. Target date: June 11, 2026 (before end of lab session).

### Three highest-priority findings

To be completed after `npm audit` is run. If zero high or critical findings are returned, state that explicitly:

**Expected format if clean:**
```
npm audit result: 0 vulnerabilities found.
Date: June 11, 2026.
No remediation required.
```

---

## Secrets Check

### Commands run

```bash
git log --all --full-history -- "**/.env"
git log -p | grep -i "api_key\|secret\|password\|token" | head -40
```

**Action item:** Run these commands in the TutorLink repository and record the result below. Owner: Luka Khimshiashvili. Target date: June 11, 2026.

### Result

**Current .env status:**
- [x] `.gitignore` is in place in the repository
- [ ] Confirmed no `.env` file has ever been committed (to be verified by running the secrets check commands above)
- [x] PostHog project key is in the client bundle — this is intentional and expected (not a secret)
- [x] No backend API with secret keys exists in the current static MVP

**Expected result:** Clean. The current MVP has no backend service keys to protect. The only external service key is the PostHog project key, which is a public write-only key by design.

**If compromised:** Rotate any exposed key immediately, rewrite git history with `git filter-branch`, force push, and re-clone on all team members' machines.

---

## Top Three Vulnerabilities Summary

| Priority | Vulnerability | Flow or component | Mitigation or action | Owner | Target date |
|----------|--------------|------------------|---------------------|-------|------|
| 1 | Not all team members have GitHub 2FA enabled — account compromise could lead to malicious deployment | Flow 5: Deployment pipeline | Enable GitHub 2FA for all four team members | Nino Tsutskiridze | June 18, 2026 |
| 2 | PostHog project key is publicly visible in the browser bundle — allows spoofed event injection | Flow 4: PostHog analytics | Accepted at current scale. Future mitigation: server-side event ingestion. | Luka Khimshiashvili | Sprint 3 |
| 3 | No rate limiting on Vercel deployment triggers — a compromised GitHub token could trigger repeated builds | Flow 5: Deployment pipeline | Vercel rollback protects live users. Additional mitigation: branch protection rules requiring PR review before merge to main. | Luka Khimshiashvili | June 18, 2026 |