# Privacy Notice

**Product:** TutorLink  
**Team:** TutorLink Team  
**Version:** 1.0  
**Date:** June 11, 2026  
**Effective from:** May 2026 (date of first public deployment)

---

## 1. Who We Are

TutorLink is a web platform that helps university students in Georgia discover private tutors through browsable profiles with visible subject expertise, rates, and language offerings. It is developed by TutorLink Team, a student team at Kutaisi International University as part of CS-PD-2026.

**Data controller contact:**  
Name: Nino Tsutskiridze  
Email: nino.tsutskiridze@student.kiu.edu.ge

---

## 2. What Personal Data We Collect and Why

### 2.1 Data You Provide Directly

TutorLink's current MVP does not require account creation, login, or any form registration. Visitors browse tutor profiles without submitting any personal information. We do not collect names, email addresses, phone numbers, or any other directly identifying information from visitors.

### 2.2 Data Collected Automatically

#### 2.2.1 Product Analytics Event Data

| Data category | Specific fields | Why we collect it | Lawful basis | Third-party processor |
|---------------|----------------|-------------------|--------------|----------------------|
| Behavioural event data | Page views, button clicks, navigation paths, session duration, device type (desktop/mobile), browser language, approximate country derived from IP at time of event | To understand how visitors use TutorLink, identify friction in the discovery flow, and improve the product | Legitimate interest: we have a legitimate interest in understanding how our product is used to improve it. No personally identifying information — names, emails, or user accounts — is collected or sent to PostHog. | PostHog (EU region cloud instance — eu.posthog.com) |
| Anonymous visitor ID | A randomly generated device-level identifier created by the PostHog JavaScript SDK on first visit. This ID persists in the visitor's browser local storage. It is not linked to any name or email address. | To distinguish unique visitors and measure return usage without requiring login | Legitimate interest | PostHog (EU region) |

**Specificity note for instructor:** The lawful basis for sending event data to PostHog is legitimate interest. The specific line: we send anonymous behavioural events and a randomly generated visitor ID to PostHog's EU region instance. No PII is included in any event payload.

#### 2.2.2 Server Request Logs

| Data category | Specific fields | Why we collect it | Lawful basis | Third-party processor |
|---------------|----------------|-------------------|--------------|----------------------|
| Server request logs | IP address, request path, HTTP method, response status code, response time, timestamp | To diagnose errors and monitor reliability of the deployment | Legitimate interest | Vercel (automatic server-side logging; logs retained 30 days by Vercel before automatic deletion) |

### 2.3 Data We Do Not Collect

We do not collect: names, email addresses, passwords, payment information, GPS location, uploaded files, or any form submissions. There is no user account system in the current MVP.

---

## 3. Third-Party Processors

| Processor | Service type | Data they receive | Their privacy policy |
|-----------|-------------|-------------------|---------------------|
| PostHog | Product analytics | Anonymous behavioural event data and a randomly generated visitor ID. No names, emails, or account identifiers. EU region instance (eu.posthog.com) — data does not leave the EU. | posthog.com/privacy |
| Vercel | Hosting and CDN | Server-side request logs including IP addresses, request paths, and response codes. Logs retained 30 days by Vercel. | vercel.com/legal/privacy-policy |

We do not use Google Analytics, Facebook Pixel, advertising networks, or any other analytics or tracking tools beyond those listed above.

---

## 4. How Long We Keep Your Data

| Data category | Retention period | What triggers deletion |
|---------------|-----------------|----------------------|
| PostHog event data and visitor ID | 12 months rolling, then automatically deleted by PostHog | PostHog's retention policy applied automatically; we have configured the 12-month retention window in our PostHog project settings |
| Vercel server request logs | 30 days | Automatic deletion by Vercel after 30 days |

---

## 5. Your Rights

Under GDPR, you have the following rights even as an anonymous visitor where technically feasible.

| Right | What it means | How to exercise it | Our response time |
|-------|--------------|-------------------|------------------|
| Right to access | You can request information about what data we hold derived from your visit | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Data Access Request" | Within 30 days |
| Right to erasure | You can request deletion of your PostHog visitor ID and associated events. You will need to provide your PostHog anonymous ID (visible in browser local storage under key `ph_*`). | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Erasure Request" | Within 30 days |
| Right to object | You can object to processing based on legitimate interest (event analytics and server logs) | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Processing Objection" | Within 30 days |
| Right to restriction | You can request we stop processing your data in certain ways | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Processing Restriction" | Within 30 days |

You can also opt out of PostHog tracking at any time by clearing your browser's local storage for tutoring-lyart.vercel.app, which removes the anonymous visitor ID from your device.

If you believe we are processing your data unlawfully, you have the right to lodge a complaint with the Georgian Personal Data Protection Service (pdp.gov.ge) or the supervisory authority in your country of residence.

---

## 6. Data Breach Procedure

In the event of a personal data breach affecting data processed by our third-party processors:

1. We will assess the breach within 24 hours of becoming aware of it
2. We will notify the relevant supervisory authority (Georgian Personal Data Protection Service, pdp.gov.ge) within 72 hours if the breach is likely to result in a risk to the rights and freedoms of natural persons
3. We will notify affected individuals where required and where contact information is available

**Person responsible for breach response:** Nino Tsutskiridze (nino.tsutskiridze@student.kiu.edu.ge)

In the event of a PostHog security incident, we will follow PostHog's incident response process. In the event of a Vercel security incident, we will follow Vercel's incident response process and assess whether visitor log data was exposed.

---

## 7. Cookies and Tracking Technologies

| Tracker | Purpose | Duration | Can you opt out? |
|---------|---------|----------|--------------------|
| PostHog visitor ID (browser local storage) | Tracks anonymous product usage events to help us understand how TutorLink is used. Tied to a randomly generated ID — not linked to any name or email. | Persists until local storage is cleared by the user | Yes — clear local storage for tutoring-lyart.vercel.app in your browser settings. This removes the visitor ID from your device. PostHog will treat subsequent visits as a new anonymous visitor. |

We do not use advertising cookies, retargeting pixels, session replay, or third-party social tracking pixels.

---

## 8. Changes to This Notice

We will update this notice when our data practices change. As the product adds features such as user accounts or booking functionality, new categories of data collection will be documented here before those features go live. The version number and date at the top of this document will be updated with each revision.

---

## 9. Contact

For any question related to this privacy notice or to exercise your rights:

**Name:** Nino Tsutskiridze  
**Email:** nino.tsutskiridze@student.kiu.edu.ge  
**Response time:** Within 5 business days for general questions; within 30 days for formal rights requests

---

*This privacy notice was last updated on June 11, 2026. Version 1.0.*