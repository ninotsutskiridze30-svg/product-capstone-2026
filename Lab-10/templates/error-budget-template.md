# Error Budget — TutorLink

**Product:** TutorLink — Tutoring Platform for Georgian Exam-Prep Students
**Team:** TutorLink Team
**Window:** June 11, 2026 – July 11, 2026
**Date last updated:** June 11, 2026

---

## Error Budget Summary

| SLO | Target | Window | Budget (minutes) | Consumed | Remaining | Status |
|-----|--------|--------|-----------------|----------|-----------|--------|
| Booking Flow Availability | 99.5% | 30 days | 216 min | 0 min | 216 min | Green |
| Video Call Establishment | 99% | 30 days | 432 min | 0 min | 432 min | Green |

**Status key:**
- Green: more than 50% of budget remaining
- Amber: 10% to 50% of budget remaining
- Red: less than 10% of budget remaining, or budget exhausted

---

## Budget Calculation

### SLO 1: Booking Flow Availability

SLO target: 99.5%
Allowed failure rate: 1 - 0.995 = 0.005 = 0.5%
Window in minutes:
30 days x 24 hours x 60 minutes = 43,200 minutes
Error budget:
0.005 x 43,200 = 216 minutes per 30-day window
Equivalent in hours: 216 / 60 = 3.6 hours
Equivalent in days: 3.6 / 24 = 0.15 days

### SLO 2: Video Call Session Establishment

SLO target: 99%
Allowed failure rate: 1 - 0.99 = 0.01 = 1%
Window in minutes:
30 days x 24 hours x 60 minutes = 43,200 minutes
Error budget:
0.01 x 43,200 = 432 minutes per 30-day window
Equivalent in hours: 432 / 60 = 7.2 hours
Equivalent in days: 7.2 / 24 = 0.3 days

---

---

## Incident Log for This Window

No incidents this window.

| Incident | Date | Duration | SLOs affected | Budget consumed | Postmortem link |
|----------|------|----------|--------------|----------------|-----------------|
| — | — | — | — | — | — |

**Total budget consumed this window:**

| SLO | Budget consumed | Budget remaining | % remaining |
|-----|----------------|-----------------|-------------|
| Booking Flow Availability | 0 min | 216 min | 100% |
| Video Call Establishment | 0 min | 432 min | 100% |

---

## Error Budget Policy

| Budget remaining | Action |
|-----------------|--------|
| More than 50% | Normal operations. Feature development continues. |
| 10% to 50% | Amber alert. Reliability items added to next sprint. No risky deployments without rollback plan. |
| Less than 10% | Red alert. Feature freeze. Engineering effort pivots to reliability. On-call review mandatory before any production push. |
| 0% or negative | Hard freeze. No deployments. Incident review required. SLO target may need revision. |

**Who owns the budget freeze decision:** Nino Tsutskiridze

---

## Planned Maintenance

No planned maintenance scheduled for this window.

| Maintenance activity | Date | Duration | SLOs affected | Budget consumed |
|--------------------|------|----------|--------------|-----------------|
| — | — | — | — | — |

---

## Next Window

**Next window:** July 11, 2026 – August 11, 2026
**Budget resets:** July 11, 2026

Budget does not roll over. Each window is evaluated independently.