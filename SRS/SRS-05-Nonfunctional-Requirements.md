# SRS-05 — Non-Functional Requirements
**Project:** IMO Strategic Engagement Platform (ISEP)
**Version:** 2.1
**Date:** 04 April 2026

> **Change log v2.1:** GIGW 3.0 / WCAG 2.1 / RPWD Act 2016 formalised as explicit compliance workstream (B-02); SSO deferral documented (C-04, OI-011 closed); device attributes added to audit trail specification (B-01, F-05).

---

## NFR-1 — Security

- Secure authentication using email/official ID-based login
- Multi-factor authentication (MFA) for sensitive roles
- Role-based access control ensuring data confidentiality and restricted permissions
- Encrypted data transmission: HTTPS / TLS 1.2 or higher
- Audit logs for all user actions including: login, upload, edits, approvals, feedback, document changes — capturing user identity, role, timestamp, action, data objects touched, IP address, device type, and user agent
- Periodic security testing and compliance with MeitY Cloud Security Guidelines
- Minimum 3 mandatory security audits (VAPT) at defined project milestones
- All critical and high-severity vulnerabilities remediated by SI at no additional cost, with re-testing and Final Security Compliance and Clearance Certificate
- STQC certification to be obtained and maintained per defined timelines — failure may result in deferment of payments (OI-012 open)
- Privacy and confidentiality controls: PII protection, restricted access by organisational hierarchy, anonymisation/pseudonymisation where applicable, consent mechanisms per DPDP Act 2023 (OI-013 open — scope pending DGS legal confirmation)
- Non-repudiation: end-to-end integrity and confidentiality of messages
- Encryption at rest (AES-256) and in transit (TLS 1.2+)
- Immutable audit logs furnished to DGS on request

---

## NFR-2 — Authentication & SSO

- Platform uses Keycloak-managed credentials (email/official ID + password) as primary authentication
- MFA enforced for SYSTEM_ADMIN, IC_DIVISION_HEAD, and DELEGATION_LEADER roles

> **SSO deferral (OI-011 — Closed):** Integration with government identity systems (NIC, MeitY) is **deferred to a subsequent phase**. This is a standalone development without NIC/government identity infrastructure dependency at this stage. SSO will be scoped and implemented once NIC/MeitY connectivity is formally established. The RFP marks SSO as a requirement; this deferral is a documented, deliberate decision and must be formally communicated to DGS.

---

## NFR-3 — Usability & User Experience

- Intuitive web-based interface accessible via standard browsers: Chrome, Edge, Firefox
- Role-specific dashboards: Member, Coordinator, Delegation Leader, Administrator
- Rich-text editor with track changes for collaborative document editing
- Responsive design: desktops, laptops, tablets, mobile
- Context-sensitive help and tooltips for first-time users
- Separation of UI and business logic (thin client architecture) — enforced via CI

---

## NFR-4 — Accessibility & Government Standards Compliance

> **This is a contractual Go-Live gate.** The RFP mandates compliance with GIGW 3.0, W3C WCAG 2.1, and RPWD Act 2016. An explicit accessibility testing workstream is required before UAT sign-off.

### NFR-4.1 — GIGW 3.0

The application shall comply with the Guidelines for Indian Government Websites (GIGW) version 3.0, including structure, navigation, content, and interoperability requirements.

### NFR-4.2 — WCAG 2.1 Level AA

Minimum conformance level: WCAG 2.1 Level AA. Specific requirements:
- Full keyboard navigation — all functionality accessible without a mouse
- Screen reader compatibility: NVDA and JAWS
- Colour contrast ratio: minimum 4.5:1 for normal text, 3:1 for large text
- Alt-text on all non-decorative images, icons, and charts
- No time-based content that cannot be paused or extended
- Error identification and suggestions in forms

### NFR-4.3 — RPWD Act 2016 (Rights of Persons with Disabilities)

The application shall be accessible to persons with disabilities in compliance with the Rights of Persons with Disabilities Act, 2016 and the associated accessibility standards notified by the Department of Empowerment of Persons with Disabilities.

### NFR-4.4 — Accessibility Testing Workstream

An accessibility testing workstream must be included in the Testing Strategy (ISEP-Testing-Strategy.md) and executed prior to UAT. Minimum scope:
- Keyboard navigation test across all 70 screens
- Screen reader walkthrough (NVDA + JAWS) for core workflows
- Colour contrast audit using automated tooling (axe, Lighthouse)
- Alt-text audit
- GIGW 3.0 self-assessment checklist completion

Results must be documented in a Accessibility Compliance Report submitted to DGS as a pre-Go-Live deliverable.

---

## NFR-5 — Performance & Scalability

- Minimum 150 concurrent users with scalable architecture to extend to 300 concurrent users during peak activity
- Response time: page load ≤ 3 seconds under normal load; ≤ 5 seconds under peak load
- Document upload limit: 100 MB per file
- Zero data loss: RPO ≤ 4 hours, RTO ≤ 8 hours

---

## NFR-6 — Availability & Reliability

- System availability: 99.5% uptime SLA during O&M phase
- 24×7 monitoring during O&M
- Automated health checks and alerting
- Graceful degradation: partial failures shall not cascade to full platform unavailability

---

## NFR-7 — Backup & Disaster Recovery

- Encrypted automated backups
- 90-day minimum backup retention
- Defined RPO/RTO benchmarks
- Periodic DR drills — mandatory (frequency per contract SLA)
- Documented business continuity procedures
- DR drill results reported to DGS

---

## NFR-8 — Audit Trail

All user actions must generate an audit log entry capturing:

| Field | Description |
|---|---|
| `user_id` | Authenticated user's unique ID |
| `user_role` | Role at time of action |
| `action` | Enum: LOGIN, LOGOUT, UPLOAD, DOWNLOAD, EDIT, APPROVE, REJECT, SUBMIT, DELETE, VIEW |
| `entity_type` | Type of object acted upon (Document, Task, Paper, Comment, etc.) |
| `entity_id` | Unique ID of the object |
| `timestamp` | UTC timestamp |
| `ip_address` | Client IP address |
| `device_type` | Desktop / Tablet / Mobile (derived from user agent) |
| `user_agent` | Full browser/device user agent string |
| `outcome` | SUCCESS / FAILURE |
| `details` | JSON blob — additional context |

> Device attributes (`ip_address`, `device_type`, `user_agent`) are contractually mandatory per RFP Section 3.16H. These must be captured by all services (Spring Boot and Python FastAPI) and persisted to `audit.audit_logs`.

---

## NFR-9 — Interoperability & Open Standards

- Interoperability Framework for e-Governance (IFEG)
- MeitY Model RFP templates
- GIGW 3.0
- UX Design Guidelines for Government Applications
- W3C WCAG 2.1 Level AA
- Web-neutral: device-agnostic, browser-agnostic
- Open data formats for export: PDF, XML, Excel
- No proprietary dependencies that restrict future migration

---

## NFR-10 — O&M & Helpdesk

- 3-year O&M period including 1-year warranty
- 24×7 system monitoring
- Tiered helpdesk support with defined SLAs per severity level
- SLA compliance reporting to DGS monthly
- Proactive attrition management for key personnel
- Monthly status reports highlighting progress, risks, issues, deviations, and mitigations
