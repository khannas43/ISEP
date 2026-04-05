# SRS-00 — Master Index
**Project:** IMO Strategic Engagement Platform (ISEP)
**Client:** Directorate General of Shipping (DGS), MoPSW, Government of India
**Version:** 2.1
**Date:** 04 April 2026
**Status:** Active

---

## Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | Initial | MagicSword | First complete SRS suite — 10 volumes |
| 2.0 | Prior session | MagicSword | i18n scaffold, thin client mandate, 100MB upload, 150/300 users, 90-day backup, DPDP, STQC, GIGW, helpdesk tiers, O&M, DR drill, Exit Management Plan (SRS-08 Section 8), OI-011 to OI-014 added |
| 2.1 | 04 Apr 2026 | MagicSword | Gap analysis incorporated: Elasticsearch → OpenSearch (C-02, OI-006 closed); SSO deferred (C-04, OI-011 closed); OI-015 added; device attributes added to audit logs (F-05, B-01); GIGW 3.0 / WCAG 2.1 / RPWD Act 2016 formalised as compliance workstream (B-02); i18n and thin client rules updated (F-03, F-04); MoPSW configurable approval step pending DGS sign-off (C-01); Module G comment-capture base documented (C-03) |

---

## SRS Suite — Volume Index

| File | Title | Contents | Version |
|---|---|---|---|
| SRS-00-Master.md | **Master Index** | This document — index, version history, summary | 2.1 |
| SRS-01-Introduction.md | Introduction | Purpose, scope, objectives | 2.0 |
| SRS-02-Overall-Description.md | Overall Description | System context, user classes, constraints | 2.0 |
| SRS-03-Functional-Requirements.md | Functional Requirements | All modules FR-A through FR-K; configurable MoPSW step; Module G base scope | 2.1 |
| SRS-04-Technical-Architecture.md | Technical Architecture | OpenSearch replaces Elasticsearch; i18n scaffold mandate; thin client CI enforcement | 2.1 |
| SRS-05-Nonfunctional-Requirements.md | Non-Functional Requirements | GIGW 3.0 / WCAG 2.1 / RPWD 2016 formalised; SSO deferral documented; device attributes in audit trail | 2.1 |
| SRS-06-Data-Model.md | Data Model | PostgreSQL schema, OpenSearch indexes; `audit.audit_logs` updated with device attributes | 2.1 |
| SRS-07-Integration.md | Integration | Kong, Keycloak, MinIO, ELK → OpenSearch, SMTP | 2.1 |
| SRS-08-Deployment.md | Deployment | DR drill mandatory; Exit Management Plan (Section 8); OpenSearch in deployment stack | 2.1 |
| SRS-09-Appendix.md | Appendix | OI-001 to OI-015; OI-006 closed, OI-011 closed, OI-015 added | 2.1 |
| SRS-10-Deliverables-Timeline.md | Deliverables & Timeline | 34 deliverables, 3-phase timeline, payment milestones, Go-Live acceptance criteria | 2.0 |

---

## Platform Summary (Stable)

- **70 screens** across 15 modules
- **6 roles:** SYSTEM_ADMIN, IC_DIVISION_HEAD, DELEGATION_LEADER, COORDINATOR, MEMBER, VIEWER
- **Three-layer RBAC:** PostgreSQL RLS + Spring Security @PreAuthorize + frontend RoleGuard
- **Three feedback tracks:** Document Comments, Structured Agenda Feedback, Paper Track Changes
- **7-stage paper approval chain:** DRAFT → Group Leader → Delegation Leader → IC Division → CS/NA/CSS → DG → FINALIZED (MoPSW step configurable — see SRS-03)

## Tech Stack (Updated v2.1)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js | i18n scaffold mandatory; thin client enforced |
| Backend | Spring Boot | All business logic lives here |
| Workflow | Python FastAPI | Workflow orchestration |
| Database | PostgreSQL | RLS enforced |
| Search | **OpenSearch 2.x** | Replaces Elasticsearch (OI-006 closed) |
| Object Store | MinIO | |
| API Gateway | Kong CE | |
| Identity | Keycloak | SSO deferred to Phase 2 (OI-011 closed) |
| CI/CD | GitLab CI | |
| Code Quality | SonarQube | Installed, review done |
| Orchestration | Docker Swarm | |

---

## Open Issues Register (Summary)

| OI | Status | Summary |
|---|---|---|
| OI-001 | 📋 Open — DGS decision pending | MoPSW approval scope — configurable step recommended |
| OI-006 | ✅ Closed | Elasticsearch replaced with OpenSearch 2.x |
| OI-008 | 📋 Open — DGS decision pending | Module G scope — comment-capture base implemented; concurrent editing = Phase 2 |
| OI-011 | ✅ Closed | SSO deferred — Keycloak credentials in interim |
| OI-012 | 📋 Open | STQC certification timeline |
| OI-013 | 📋 Open | DPDP Act scope |
| OI-014 | 📋 Open | 20% CR scope creep — contract value baseline |
| OI-015 | 📋 Open | Document-level envelope encryption — pending DGS confirmation |

Full open issue details in SRS-09-Appendix.md.
