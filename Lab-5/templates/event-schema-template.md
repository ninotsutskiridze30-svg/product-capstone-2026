# Event Schema

**Team:** TutorLink Team
**Product:** TutorLink
**Date:** April 9, 2026
**Version:** 1.0
**Status:** Blueprint (instrumentation code written in Lab 6)

---

## Naming Convention

All events follow this rule without exception:

```
object_action (snake_case, past tense)
```

Examples of correct names: `user_signup_completed`, `session_booked`, `tutor_profile_viewed`
Examples of incorrect names: `UserSignupCompleted`, `create_booking`, `search`, `click_button`

---

## North Star Metric

> Weekly tutor sessions booked per active student user

**Activation event that drives NSM:** `session_booked`

---

## Universal Properties

Every event automatically includes these properties. Do not repeat them in individual event definitions.

| Property | Type | Description |
|----------|------|-------------|
| `user_id` | string (UUID) | System-generated user identifier. Never an email address. |
| `timestamp` | ISO 8601 datetime | When the event fired. Always UTC (Z suffix). |
| `session_id` | string (UUID) | The app session in which the event occurred. Resets on new login. |
| `platform` | enum: web, ios, android | The platform the event was fired on. MVP is web only. |

---

## Event Definitions

### ACQUISITION

---

#### `user_signup_completed`

**AARRR Stage:** Acquisition
**Description:** A new user successfully creates a TutorLink account and reaches the authenticated home screen for the first time.
**Fires when:** Account creation succeeds and the user is redirected to the home screen. Fires once per user lifetime.
**NSM connection:** None directly. Marks the start of the activation funnel. High signup-to-first-booking drop-off indicates an onboarding or trust problem.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `user_role` | enum: student, tutor | Yes | Whether the new user registered as a student or a tutor | `"student"` |
| `signup_method` | enum: email, google | Yes | How the user chose to register | `"google"` |
| `referral_source` | string | No | UTM source if present in the URL, else null | `"kiu_orientation_poster"` |

**Example payload:**
```json
{
  "event_name": "user_signup_completed",
  "user_id": "user_abc123",
  "timestamp": "2026-04-09T14:15:00Z",
  "session_id": "sess_xyz789",
  "platform": "web",
  "user_role": "student",
  "signup_method": "google",
  "referral_source": null
}
```

**Schema rationale:** We track `user_role` at signup because students and tutors have fundamentally different activation flows and retention patterns. Separating them from the first event makes cohort analysis clean.

---

#### `tutor_search_submitted`

**AARRR Stage:** Acquisition (funnel entry) / Activation (intent signal)
**Description:** A student submits a tutor search with at least one filter applied.
**Fires when:** Student taps the Search button with a subject and at least one availability slot selected.
**NSM connection:** Indirect. This begins the flow that leads to `session_booked`. High search volume with low booking conversion indicates a results quality problem or trust gap.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `subject` | string | Yes | The subject the student searched for | `"mathematics"` |
| `language_filter` | string | No | Language filter applied, if any | `"english"` |
| `results_count` | integer | Yes | Number of tutor profiles returned | `7` |

**Example payload:**
```json
{
  "event_name": "tutor_search_submitted",
  "user_id": "user_abc123",
  "timestamp": "2026-04-09T14:17:00Z",
  "session_id": "sess_xyz789",
  "platform": "web",
  "subject": "mathematics",
  "language_filter": "english",
  "results_count": 7
}
```

**Schema rationale:** `results_count` is critical for diagnosing supply-side gaps. If a subject search returns 0 results consistently, we have a tutor acquisition problem, not a student experience problem.

---

### ACTIVATION

---

#### `tutor_profile_viewed`

**AARRR Stage:** Activation
**Description:** A student opens a tutor's profile page from search results or a direct link.
**Fires when:** The tutor profile page fully loads for the viewing student.
**NSM connection:** Indirect. Measures the step between search and booking. High profile-to-booking drop-off indicates a trust gap — the profile does not provide enough information or credibility signals to convert.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `tutor_id` | string (UUID) | Yes | System-generated identifier of the tutor whose profile was viewed | `"tutor_def456"` |
| `subject` | string | Yes | The subject listed on the viewed profile | `"mathematics"` |
| `has_reviews` | boolean | Yes | Whether the tutor profile has at least one student review | `false` |
| `view_source` | enum: search_results, direct_link, referral | Yes | How the student arrived at this profile | `"search_results"` |

**Schema rationale:** `has_reviews` tracked here because our interview data (Interview 1, TK; Interview 6, DK) showed that trust is a conversion blocker. We need to measure whether review presence changes the profile-to-booking conversion rate.

---

#### `session_booked` ← THIS IS THE ACTIVATION EVENT

**AARRR Stage:** Activation
**Description:** A student successfully books a tutoring session. This is the aha moment. The student now has a confirmed session with a tutor who matches their subject, availability, and rate. This is the moment of first value delivery.
**Fires when:** The booking record is created in the database, the tutor's availability slot is reserved, and the booking confirmation screen is shown to the student.
**NSM connection:** This event directly drives the NSM. Each firing increments the weekly session count for the associated `user_id`. The NSM is the 7-day rolling average of this count across all active student users.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `tutor_id` | string (UUID) | Yes | The tutor who was booked | `"tutor_def456"` |
| `subject` | string | Yes | Subject of the booked session | `"mathematics"` |
| `session_date` | string (YYYY-MM-DD) | Yes | The date the session is scheduled for | `"2026-04-12"` |
| `rate_gel` | float | Yes | The agreed rate in Georgian Lari | `35.00` |
| `is_first_booking` | boolean | Yes | True if this is the student's first ever booking on TutorLink | `true` |
| `search_to_booking_seconds` | integer | Yes | Seconds elapsed from `tutor_search_submitted` to `session_booked` in this session | `247` |

**Example payload:**
```json
{
  "event_name": "session_booked",
  "user_id": "user_abc123",
  "timestamp": "2026-04-09T14:23:45Z",
  "session_id": "sess_xyz789",
  "platform": "web",
  "tutor_id": "tutor_def456",
  "subject": "mathematics",
  "session_date": "2026-04-12",
  "rate_gel": 35.00,
  "is_first_booking": true,
  "search_to_booking_seconds": 247
}
```

**Schema rationale:** `is_first_booking` lets us separate first-time activation from repeat use in our analytics. `search_to_booking_seconds` measures the efficiency of our core flow — our interviews showed students spent 1–6 weeks on this in the status quo; if TutorLink users are booking in under 10 minutes, that is the headline product win.

---

### RETENTION

---

#### `user_session_started`

**AARRR Stage:** Retention
**Description:** An existing authenticated user opens TutorLink and begins a new app session. Used to measure Day 1, Day 7, and Day 30 retention curves.
**Fires when:** An authenticated user loads the TutorLink home screen.
**NSM connection:** Indirect. A student who returns to the app is a candidate to book again. A student who never returns after their first booking has churned regardless of how good that first booking was.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `user_role` | enum: student, tutor | Yes | Role of the returning user | `"student"` |
| `days_since_signup` | integer | Yes | Days since `user_signup_completed` | `14` |
| `days_since_last_session` | integer | Yes | Days since the previous `user_session_started` event | `7` |
| `total_bookings_lifetime` | integer | Yes | Total `session_booked` events for this user to date | `2` |

**Example payload:**
```json
{
  "event_name": "user_session_started",
  "user_id": "user_abc123",
  "timestamp": "2026-04-16T10:05:00Z",
  "session_id": "sess_new456",
  "platform": "web",
  "user_role": "student",
  "days_since_signup": 7,
  "days_since_last_session": 7,
  "total_bookings_lifetime": 1
}
```

**Schema rationale:** `total_bookings_lifetime` on every session start lets us segment returning users by engagement depth — a user returning for their fifth booking is a different cohort from a user returning after their first, and they need different nudges.

---

### REFERRAL

---

#### `tutor_profile_shared`

**AARRR Stage:** Referral
**Description:** A student shares a tutor profile link with another person via the in-app share function.
**Fires when:** Student taps Share on a tutor profile and the share action is dispatched.
**NSM connection:** None directly. Referral loop grows acquisition without paid spend. Our interview data showed students rely heavily on personal vouching (Interview 1, TK) — a share feature formalises this existing behaviour.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `tutor_id` | string (UUID) | Yes | The tutor profile that was shared | `"tutor_def456"` |
| `share_method` | enum: link_copy, whatsapp, messenger | Yes | How the student shared the profile | `"whatsapp"` |

**Schema rationale:** `share_method` tells us which channel students use to vouch for tutors, which directly informs how we design the sharing flow and what deep-link format to prioritise. WhatsApp is expected to dominate based on our interview data.

---

### REVENUE

---

#### `subscription_started`

**AARRR Stage:** Revenue
**Description:** A tutor upgrades to a paid visibility plan, gaining a highlighted profile placement in search results.
**Fires when:** Payment is confirmed and the tutor's account tier is updated in the database.
**NSM connection:** Not applicable for MVP student flow. This tracks tutor-side monetisation, which is our primary revenue model — students book for free; tutors pay for visibility.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `plan_name` | enum: basic, featured | Yes | The plan the tutor subscribed to | `"featured"` |
| `plan_price_gel` | float | Yes | Monthly price paid in Georgian Lari | `29.90` |
| `billing_period` | enum: monthly, annual | Yes | Whether the tutor chose monthly or annual billing | `"monthly"` |

**Schema rationale:** Revenue event is included in the MVP schema even though monetisation is not the first-sprint priority. Having the event defined now means we can add instrumentation in Lab 6 without a schema revision when we activate payments.

---

## Event Summary Table

| Event Name | AARRR Stage | Priority | NSM Driver |
|-----------|-------------|----------|-----------|
| `user_signup_completed` | Acquisition | Must | No |
| `tutor_search_submitted` | Acquisition / Activation | Must | Indirect |
| `tutor_profile_viewed` | Activation | Must | Indirect |
| `session_booked` | Activation | Must | **Yes — primary** |
| `user_session_started` | Retention | Must | Indirect |
| `tutor_profile_shared` | Referral | Should | No |
| `subscription_started` | Revenue | Should | No |

**Total events:** 7
**Must-have events:** 5
**Should-have events:** 2

---

## Privacy Confirmation

- [x] No email addresses in any event property
- [x] No user names or display names in any event property
- [x] No phone numbers in any event property
- [x] No physical addresses in any event property
- [x] No payment card details in any event property
- [x] All user identification uses system-generated UUIDs only

**Schema reviewed by:** Luka Khimshiashvili on April 9, 2026

---

## Instrumentation Notes for Lab 6

| Event Name | Where in Code | Frontend or Backend |
|-----------|--------------|-------------------|
| `user_signup_completed` | In POST /api/auth/register success callback, after user record confirmed in DB | Backend |
| `tutor_search_submitted` | On search form submit handler, after results return | Frontend |
| `tutor_profile_viewed` | In tutor profile page component on mount (useEffect), after authenticated | Frontend |
| `session_booked` | In POST /api/bookings success callback, after booking record confirmed in DB and availability slot reserved | Backend |
| `user_session_started` | In authenticated layout component on mount, on each new session | Frontend |
| `tutor_profile_shared` | In share button click handler, after share action dispatched | Frontend |
| `subscription_started` | In POST /api/subscriptions success callback, after payment confirmed and tier updated | Backend |

---

## Analytics Tool Selection

**Our choice:** PostHog
**Reason:** Self-hosted option respects Georgian user data privacy expectations and avoids sending student academic data to third-party US servers; free tier is sufficient for MVP scale; strong funnel and retention analysis built in.
**Free tier limit:** 1M events per month (more than sufficient for MVP)

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| April 9, 2026 | 1.0 | Initial schema blueprint | Luka Khimshiashvili |

---

*Event Schema | TutorLink Team | CS-PD-2026 | Spring 2026*