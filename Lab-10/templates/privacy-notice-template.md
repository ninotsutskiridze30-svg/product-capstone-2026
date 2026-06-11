# Privacy Notice

**Product:** TutorLink
**Team:** TutorLink Team
**Version:** 1.0
**Date:** May 21, 2026
**Effective from:** May 8, 2026 (date of first real user signup in Sprint 2)

---

## 1. Who We Are

TutorLink is a web platform that connects university students in Georgia with private tutors through searchable profiles with visible rates, availability, and peer reviews. It is developed by TutorLink Team, a student team at Kutaisi International University as part of CS-PD-2026.

**Data controller contact:**
Name: Nino Tsutskiridze
Email: nino.tsutskiridze@student.kiu.edu.ge

---

## 2. What Personal Data We Collect and Why

### 2.1 Account and Identity Data

| Data category | Specific fields | Why we collect it | Lawful basis | Who can access it |
|---------------|----------------|-------------------|--------------|------------------|
| Account credentials | Email address, hashed password (bcrypt via Supabase Auth) | To create and authenticate your account | Contract: necessary to provide the service | Supabase Auth service only; password hash is never readable in plaintext by any team member |
| Google OAuth identity | Google account ID (not the full profile), email address | To allow login via Google without a separate password | Contract: necessary to provide the service when the user chooses Google login | Supabase Auth service only |
| User role | Student or tutor (stored in Supabase Auth user metadata) | To route the user to the correct product experience and enforce access control | Contract: necessary to provide the service | Stored server-side; not accessible by the user's browser directly |
| Tutor profile information | First name only, subject expertise tags, hourly rate in GEL, bio (up to 150 characters), language(s) offered | To display a searchable tutor profile to students | Contract: tutors provide this information to receive the service (visibility to students) | All authenticated TutorLink users can view tutor profile pages; email address is never displayed publicly |
| Booking records | Student user ID, tutor user ID, session date, time slot, subject, rate in GEL, booking reference number, booking timestamp | To record confirmed sessions and provide booking history to students | Contract: necessary to fulfil the booking | Student who made the booking; tutor whose slot was booked; no third parties |

### 2.2 Usage and Behavioural Data

| Data category | Specific fields | Why we collect it | Lawful basis | Third-party processor |
|---------------|----------------|-------------------|--------------|----------------------|
| Event data | `user_signup_completed` (user role, signup method), `tutor_search_submitted` (subject, language filter, results count), `tutor_profile_viewed` (tutor ID, subject, has reviews, view source), `session_booked` (tutor ID, subject, session date, rate, is first booking, search-to-booking time), `user_session_started` (user role, days since signup, days since last session, total bookings lifetime), `tutor_profile_shared` (tutor ID, share method), `subscription_started` (plan name, price, billing period) | To measure how users use the product, identify friction in the core flow, and improve the product | Legitimate interest: we have a legitimate interest in understanding how our product is used to improve it. None of these events contain personally identifying information beyond a system-generated user ID. | PostHog (EU region cloud instance) |
| Session data | Session ID (system-generated UUID), timestamp, platform (web) | To maintain your session, correlate events within a session, and diagnose errors | Legitimate interest | Supabase Auth (session token management); Vercel (server logs) |
| Server request logs | IP address, request path, HTTP method, response status code, timestamp | To diagnose errors and monitor reliability | Legitimate interest | Vercel (automatic server-side logging; logs retained 30 days by Vercel) |

### 2.3 Location Data

We do not collect GPS location data. Vercel server logs include IP addresses, which may be used by Vercel to derive an approximate city-level location for routing purposes. We do not use IP address data for user profiling.

### 2.4 Transaction and Activity Data

| Data category | Specific fields | Why we collect it | Lawful basis | Third-party processor |
|---------------|----------------|-------------------|--------------|----------------------|
| Booking records | See Section 2.1 above | To record and fulfil confirmed tutoring sessions | Contract | Stored in Supabase Postgres (EU West region) only |
| Tutor subscription records (Sprint 3 onwards) | Plan name, price in GEL, billing period, subscription start date, user ID | To manage tutor subscription billing | Contract | Stripe (if payment processing is added in Sprint 3; privacy policy at stripe.com/privacy) |

---

## 3. Third-Party Processors

| Processor | Service type | Data they receive | Their privacy policy |
|-----------|-------------|-------------------|---------------------|
| Supabase | Database (Postgres) and authentication | Account credentials (email, hashed password, Google ID), all user-generated content (tutor profiles, bookings), session tokens | supabase.com/privacy — EU data residency, Frankfurt region |
| Vercel | Hosting and serverless functions (Next.js API routes) | Server-side request logs including IP addresses, request paths, response codes | vercel.com/legal/privacy-policy |
| PostHog | Product analytics | Event data with system-generated user IDs (no PII — email addresses are never included in any event property; see event schema at `03-build/analytics/event-schema.md`) | posthog.com/privacy — EU region instance |
| Google (OAuth) | Authentication only | Google account ID and email address, used solely for login via Supabase Auth | policies.google.com/privacy — data passed through Supabase, not stored by TutorLink separately |
| Stripe | Payment processing (Sprint 3, if activated) | Tutor billing information for subscription payments | stripe.com/privacy |

We do not use Google Analytics, Facebook Pixel, or any advertising technology. No user data is shared with advertisers.

---

## 4. How Long We Keep Your Data

| Data category | Retention period | What triggers deletion |
|---------------|-----------------|----------------------|
| Account credentials (email, hashed password) | Until account deletion request + 30 days | User submits deletion request to nino.tsutskiridze@student.kiu.edu.ge |
| Tutor profile information | Until the tutor deletes their profile or account + 30 days | Tutor or TutorLink admin initiates deletion |
| Booking records | 12 months from session date, then deleted | Automatic deletion on a rolling schedule (to be implemented in Sprint 4) |
| Event analytics data (PostHog) | 12 months rolling, then automatically deleted by PostHog | PostHog retention policy applied automatically |
| Server request logs (Vercel) | 30 days | Automatic deletion by Vercel after 30 days |
| Consent records | Life of the account + 2 years | Account deletion + 2-year hold for dispute resolution |

---

## 5. Your Rights

Under GDPR, you have the following rights.

| Right | What it means | How to exercise it | Our response time |
|-------|--------------|-------------------|------------------|
| Right to access | You can request a copy of all personal data we hold about you | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Data Access Request" | Within 30 days |
| Right to erasure | You can request deletion of all your personal data | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Erasure Request" | Within 30 days |
| Right to rectification | You can request correction of inaccurate data | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Rectification Request" | Within 30 days |
| Right to restriction | You can request we stop processing your data in certain ways | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Processing Restriction" | Within 30 days |
| Right to portability | You can request your data in a machine-readable format (JSON) | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Data Portability Request" | Within 30 days |
| Right to object | You can object to processing based on legitimate interest (event analytics) | Email nino.tsutskiridze@student.kiu.edu.ge with subject "Processing Objection" | Within 30 days |

If you believe we are processing your data unlawfully, you have the right to lodge a complaint with the Georgian Personal Data Protection Service (pdp.gov.ge) or the supervisory authority in your country of residence.

---

## 6. Data Breach Procedure

In the event of a personal data breach, we will:

1. Assess the breach within 24 hours of becoming aware of it
2. Notify the relevant supervisory authority (Georgian Personal Data Protection Service) within 72 hours if the breach is likely to result in a risk to the rights and freedoms of natural persons
3. Notify affected users without undue delay if the breach is likely to result in a high risk to their rights and freedoms, by email to the address on their account

**Person responsible for breach response:** Nino Tsutskiridze (nino.tsutskiridze@student.kiu.edu.ge)

In the event of a Supabase security incident affecting our database, we will follow Supabase's incident response process and rotate all service role keys immediately.

---

## 7. Cookies and Tracking Technologies

| Cookie or tracker | Purpose | Duration | Can you opt out? |
|-------------------|---------|----------|-----------------|
| Supabase session cookie (HTTP-only) | Maintains your login session. Required for the product to function. Not accessible to JavaScript — XSS-resistant. | 7 days from last login, then expires | No — removing this cookie logs you out of TutorLink |
| PostHog analytics cookie | Tracks product usage events to help us understand how TutorLink is used. Tied to a system-generated anonymous ID, not your email. | 12 months | Yes — contact nino.tsutskiridze@student.kiu.edu.ge with subject "Opt out of analytics" and we will suppress PostHog tracking for your user ID |

We do not use advertising cookies, retargeting pixels, or third-party tracking cookies.

---

## 8. Changes to This Notice

We will update this notice when our data practices change. We will notify users of material changes by email to the address on their account at least 14 days before the change takes effect. The version number and effective date at the top of this document will be updated with each revision. Continued use of TutorLink after a notified change constitutes acceptance of the updated notice.

---

## 9. Contact

For any question related to this privacy notice or to exercise your rights:

**Name:** Nino Tsutskiridze
**Email:** nino.tsutskiridze@student.kiu.edu.ge
**Response time:** Within 5 business days for general questions, within 30 days for formal rights requests

---

*This privacy notice was last updated on May 21, 2026. Version 1.0.*