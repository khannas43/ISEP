# SRS-10 — Deliverables & Timeline
**Project:** IMO Strategic Engagement Platform (ISEP)
**Version:** 2.1
**Date:** 04 April 2026

> **Change log v2.1:** Accessibility Compliance Report added as a pre-Go-Live deliverable (D-35). Version bump to reflect suite-level update.

---

## 1. Project Timeline Overview

| Phase | Duration | Period (T=0 is contract signing date) |
|---|---|---|
| Phase 1 — Implementation | 12 months | T+0 to T+12 |
| Phase 2 — Warranty | 12 months | T+12 to T+24 |
| Phase 3 — O&M | 24 months | T+24 to T+48 |

**Total contract period:** 12 months implementation + 3 years O&M (including 1 year warranty).

---

## 2. Implementation Phase — Milestone Structure

| Milestone | Description | Target |
|---|---|---|
| M1 | Contract signing and project kickoff | T+0 |
| M2 | Requirement workshops completed; RTM baselined | T+1 month |
| M3 | SRS, HLD, LLD, Data Models approved by DGS | T+2 months |
| M4 | Architecture approved; dev environment established | T+2.5 months |
| M5 | Sprint 1 complete — core modules (A, B, D, J) | T+4 months |
| M6 | Sprint 2 complete — paper workflow, feedback, approvals (C, E, F) | T+6 months |
| M7 | Sprint 3 complete — live meeting, analytics, Others+ (G, H, I, L) | T+9 months |
| M8 | SIT complete; performance/load testing complete | T+10 months |
| M9 | VAPT 1 complete; vulnerabilities remediated | T+10.5 months |
| M10 | UAT complete; DGS acceptance sign-off | T+11 months |
| M11 | VAPT 2 complete (pre-production) | T+11.5 months |
| M12 | Go-Live | T+12 months |

---

## 3. Deliverables Register

### 3.1 Documentation Deliverables

| # | Deliverable | Due Milestone | Status |
|---|---|---|---|
| D-01 | Project Management Plan (PMP) | M2 | ⬜ |
| D-02 | Requirement Traceability Matrix (RTM) | M2 | ⬜ |
| D-03 | Functional Requirements Specification (FRS) | M3 | ⬜ |
| D-04 | Software Requirements Specification (SRS) — all 10 volumes | M3 | 🔄 (v2.1) |
| D-05 | High-Level Design (HLD) | M3 | ⬜ |
| D-06 | Low-Level Design (LLD) | M3 | ⬜ |
| D-07 | Data Models and ER Diagrams | M3 | ⬜ |
| D-08 | UI/UX Wireframes and User Journeys | M3 | ⬜ |
| D-09 | Architecture Diagrams | M3 | ⬜ |
| D-10 | API Documentation (OpenAPI / Swagger) | M5 | ⬜ |

### 3.2 Testing Deliverables

| # | Deliverable | Due Milestone | Status |
|---|---|---|---|
| D-11 | Test Strategy and Test Plans | M4 | 🔄 (ISEP-Testing-Strategy.md) |
| D-12 | Unit Test Reports (Jest, JUnit, Pytest) | M6 | ⬜ |
| D-13 | System Integration Test (SIT) Report | M8 | ⬜ |
| D-14 | Performance and Load Test Report | M8 | ⬜ |
| D-15 | VAPT 1 Report and Remediation Certificate | M9 | ⬜ |
| D-16 | VAPT 2 Report and Final Security Compliance Certificate | M11 | ⬜ |
| D-17 | UAT Test Cases (mapped to RTM) | M8 | ⬜ |
| D-18 | UAT Completion Report and DGS Sign-off | M10 | ⬜ |
| D-19 | Accessibility Compliance Report (GIGW 3.0, WCAG 2.1, RPWD 2016) | M10 | ⬜ |

### 3.3 Deployment Deliverables

| # | Deliverable | Due Milestone | Status |
|---|---|---|---|
| D-20 | Dev and UAT environment setup confirmation | M4 | ⬜ |
| D-21 | Production environment setup confirmation | M11 | ⬜ |
| D-22 | DR environment setup and first DR drill report | M11 | ⬜ |
| D-23 | Go-Live Readiness Report | M12 | ⬜ |

### 3.4 Training Deliverables

| # | Deliverable | Due Milestone | Status |
|---|---|---|---|
| D-24 | User Training Manual | M10 | ⬜ |
| D-25 | Admin Manual | M10 | ⬜ |
| D-26 | Training sessions delivered (DGS + MMD staff) | M11 | ⬜ |

### 3.5 Compliance Deliverables

| # | Deliverable | Due Milestone | Status |
|---|---|---|---|
| D-27 | STQC Certification (application) | M9 | ⬜ |
| D-28 | STQC Certificate (obtained) | M12 | ⬜ |
| D-29 | DPDP Act compliance documentation | M10 | ⬜ |
| D-30 | ISO 27001 / 27017 / 27018 compliance evidence (CSP) | M4 | ⬜ |

### 3.6 O&M Deliverables

| # | Deliverable | Frequency | Status |
|---|---|---|---|
| D-31 | Monthly Status Report | Monthly | ⬜ |
| D-32 | SLA Compliance Report | Monthly | ⬜ |
| D-33 | Quarterly DR Drill Report | Quarterly | ⬜ |
| D-34 | Annual Security Audit Report (VAPT 3) | Annual | ⬜ |
| D-35 | Exit Management / Handover Report | At contract end | ⬜ |

---

## 4. Payment Milestones

Payment milestones are linked to deliverable acceptance by DGS. Indicative split subject to final contract:

| Milestone | Payment Trigger |
|---|---|
| Contract signing | Advance (if applicable per contract) |
| M3 — SRS/HLD/LLD approved | Design phase payment |
| M6 — Sprint 2 complete and SIT partial | Development phase payment |
| M10 — UAT sign-off | UAT acceptance payment |
| M12 — Go-Live | Go-Live payment |
| T+24 — Warranty end | Warranty completion payment |
| T+36, T+48 — O&M milestones | Annual O&M payments |

> STQC certificate non-receipt may trigger payment deferment per RFP.

---

## 5. Go-Live Acceptance Criteria

The following conditions must all be met for Go-Live acceptance:

- [ ] All Sprint 1–3 features delivered and SIT-tested
- [ ] RTM demonstrating 100% coverage of approved FRS/SRS
- [ ] UAT signed off by DGS (D-18)
- [ ] VAPT 2 complete; all critical/high vulnerabilities remediated (D-16)
- [ ] Accessibility Compliance Report accepted by DGS (D-19)
- [ ] Performance test demonstrates ≥150 concurrent users at required response times
- [ ] Production and DR environments operational
- [ ] First DR drill completed and reported (D-22)
- [ ] User training completed (D-26)
- [ ] Admin and User Manuals delivered (D-24, D-25)
- [ ] STQC application submitted (D-27)
- [ ] All open OIs resolved or formally deferred in writing by DGS
