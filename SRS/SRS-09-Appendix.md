# SRS-09 — Appendix
**Project:** IMO Strategic Engagement Platform (ISEP)
**Version:** 2.1
**Date:** 04 April 2026

> **Change log v2.1:** OI-006 closed (OpenSearch decision); OI-011 closed (SSO deferred); OI-015 added (document-level envelope encryption). OI-001 and OI-008 updated with recommended resolution approaches.

---

## Open Issues Register

### OI-001 — MoPSW Approval Scope

| Field | Value |
|---|---|
| **Status** | 📋 Open — DGS decision pending |
| **Raised** | Prior session |
| **Issue** | RFP states "DG → MoPSW where applicable." SRS originally routed all papers through MoPSW. The phrase "where applicable" is undefined. |
| **Recommended resolution** | Implement MoPSW as a configurable optional step in the approval chain. SYSTEM_ADMIN toggles the MoPSW stage per paper category or committee. Two routes: (a) DG → FINALIZED (default), (b) DG → MoPSW → FINALIZED (configurable). This satisfies both interpretations without a contractual conflict. |
| **SRS impact** | SRS-03 updated with configurable MoPSW step. SRS-06 `meetings.mopsw_approval_required` and `papers.mopsw_step_active` columns added. |
| **Action required** | Sameer to raise with DGS for formal written sign-off. Once confirmed, lock the default configuration and remove the toggle. |

---

### OI-006 — Elasticsearch Licence

| Field | Value |
|---|---|
| **Status** | ✅ Closed — 04 April 2026 |
| **Raised** | Prior session |
| **Issue** | Elasticsearch switched to SSPL licence from version 7.11. SSPL is not OSI-approved and is not permissible for Government procurement per open standards mandate. |
| **Resolution** | **OpenSearch 2.x adopted.** Apache 2.0 licensed. Community fork of Elasticsearch 7.10 maintained by AWS. Drop-in API compatible with ES 7.10. No functional change to search capabilities. |
| **SRS impact** | SRS-04 tech stack updated. SRS-06 OpenSearch indexes updated. SRS-07 integration section updated. SRS-08 Docker service updated. All references to "Elasticsearch" replaced with "OpenSearch 2.x" across all SRS volumes. |
| **Developer action** | Replace `elasticsearch` Docker image with `opensearchproject/opensearch:2.13.0`. Update Spring Boot client config. Update CURSOR-PROJECT-CONTEXT.md. |

---

### OI-008 — Module G Real-Time Collaboration Scope

| Field | Value |
|---|---|
| **Status** | 📋 Open — DGS decision pending |
| **Raised** | Prior session |
| **Issue** | RFP says "controlled real-time collaboration interface during live meetings." Ambiguous — could mean concurrent co-editing (CRDT/OT) or comment-capture in real time. |
| **Recommended resolution** | Base implementation: comment-capture mode — structured, timestamped comments and interventions per agenda item with real-time feed via SSE/polling. This is the deliverable for demo and Phase 1 Go-Live. Full concurrent co-editing (multiple users editing the same document simultaneously) is scoped to Phase 2, subject to DGS confirmation and separate commercial agreement. |
| **SRS impact** | SRS-03 Module G updated with base scope (G.1) and Phase 2 scope (G.2). |
| **Action required** | Sameer to raise with DGS — present both options with effort/cost implications. DGS written confirmation required before M-07 (live meeting module) dev begins. |

---

### OI-011 — NIC/Government SSO

| Field | Value |
|---|---|
| **Status** | ✅ Closed — 04 April 2026 |
| **Raised** | Prior session |
| **Issue** | RFP marks SSO with government identity systems as a base requirement. Current build does not include SSO. Question was whether to implement in Phase 1 or Phase 2. |
| **Resolution** | **SSO deferred.** This is a standalone development; NIC/government identity infrastructure is not in scope at this stage. Platform uses Keycloak-managed credentials (email/password + MFA) in the interim. SSO will be scoped and implemented once NIC/MeitY connectivity is formally established. |
| **SRS impact** | SRS-05 NFR-2 updated with SSO deferral note. SRS-07 Integration section updated. |
| **Communication required** | DGS must be formally notified that SSO is deferred. This is a documented decision, not an oversight. |

---

### OI-012 — STQC Certification Timeline

| Field | Value |
|---|---|
| **Status** | 📋 Open |
| **Issue** | STQC certification is required per RFP. Non-compliance may result in deferment of payments. Timeline not yet confirmed. |
| **Action required** | SI to confirm STQC certification timeline with DGS. Include as a milestone in the Project Management Plan. |

---

### OI-013 — DPDP Act Scope

| Field | Value |
|---|---|
| **Status** | 📋 Open — DGS legal team decision pending |
| **Issue** | DPDP Act 2023 applies to PII. Question is whether scope covers government officials only or extends to other data subjects. |
| **Action required** | DGS legal team to confirm scope. Until confirmed, implement privacy-by-design broadly: purpose limitation, consent management, data minimisation, retention controls, breach notification, DPIA where applicable. |

---

### OI-014 — 20% CR Scope Creep — Contract Value Baseline

| Field | Value |
|---|---|
| **Status** | 📋 Open — commercial/legal matter |
| **Issue** | RFP allows cumulative Change Requests up to 20% of original Contract Value. Baseline contract value not yet defined in technical documents. |
| **Action required** | Legal/commercial — no technical action. Contract team to define and document. |

---

### OI-015 — Document-Level Envelope Encryption

| Field | Value |
|---|---|
| **Status** | 📋 Open — DGS confirmation pending |
| **Raised** | 04 April 2026 (new) |
| **Issue** | Document-level envelope encryption (per-document encryption keys, separate from storage-level AES-256) may be required for classified or sensitive position papers. RFP mandates encryption at rest and confidentiality controls but does not explicitly specify document-level envelope encryption. |
| **Recommended approach** | If DGS confirms requirement: implement per-document AES-256 key encryption using a key management service (KMS). Each document in MinIO encrypted with a unique data key; data keys encrypted with a master key managed by KMS. |
| **SRS impact** | If confirmed: SRS-04 architecture section updated; SRS-06 documents table updated with `encryption_key_id` column; SRS-07 integration updated with KMS service. |
| **Action required** | Sameer to raise with DGS. If confirmed, add as OI-015 resolution and update SRS-04, SRS-06, SRS-07. |

---

## Glossary

| Term | Definition |
|---|---|
| DGS | Directorate General of Shipping |
| MoPSW | Ministry of Ports, Shipping and Waterways |
| IMO | International Maritime Organization |
| ILO | International Labour Organization |
| IMSO | International Mobile Satellite Organization |
| JWG | Joint Working Group |
| MMD | Mercantile Marine Department |
| NIC | National Informatics Centre |
| MeitY | Ministry of Electronics and Information Technology |
| STQC | Standardisation Testing and Quality Certification |
| DPDP | Digital Personal Data Protection Act 2023 |
| GIGW | Guidelines for Indian Government Websites |
| WCAG | Web Content Accessibility Guidelines |
| RPWD | Rights of Persons with Disabilities Act 2016 |
| CERT-In | Computer Emergency Response Team — India |
| VAPT | Vulnerability Assessment and Penetration Testing |
| OT | Operational Transformation (collaborative editing) |
| CRDT | Conflict-Free Replicated Data Type (collaborative editing) |
| SSE | Server-Sent Events |
| RLS | Row-Level Security (PostgreSQL) |
| RBAC | Role-Based Access Control |
| SI | System Integrator |
| SRS | Software Requirements Specification |
| FRS | Functional Requirements Specification |
| HLD | High-Level Design |
| LLD | Low-Level Design |
| RTM | Requirement Traceability Matrix |
| UAT | User Acceptance Testing |
| SIT | System Integration Testing |
| CR | Change Request |
| O&M | Operations and Maintenance |
| DR | Disaster Recovery |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| KMS | Key Management Service |
| MoM | Minutes of Meeting |
| PMP | Project Management Plan |
