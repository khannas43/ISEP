# SRS-02 — Overall Description
**Project:** IMO Strategic Engagement Platform (ISEP)
**Version:** 2.1
**Date:** 04 April 2026

> **Change log v2.1:** VIEWER role read-only design intent explicitly documented (A-K-01). Version bump to reflect suite-level update.

---

## 1. System Context

ISEP is a Government of India platform serving DGS's engagement with international maritime bodies. It replaces fragmented, offline coordination processes with a centralised, audit-ready digital workflow covering the full lifecycle of India's participation in IMO, ILO, and IMSO sessions.

The platform interfaces with:
- Internal DGS stakeholders (IC Division, Delegation Leaders, Members)
- Mercantile Marine Departments (MMDs)
- MoPSW (as approver — configurable per OI-001)
- External inter-ministerial agencies (MoEFCC, MEA — as external consultees in Phase 4)
- Future: IMO GISIS, ILO, IMSO portals (post Go-Live integration)

---

## 2. User Classes & Characteristics

| Role | Code | Description | Access Level |
|---|---|---|---|
| System Administrator | SYSTEM_ADMIN | Full configuration rights — committee setup, user onboarding, workflow management, oversight | Full |
| IC Division Head | IC_DIVISION_HEAD | Reviews and approves at IC Division stage of approval chain | Senior |
| Delegation Leader | DELEGATION_LEADER | Leads committee activities, consolidates feedback, approves final papers, manages delegation outputs | High |
| Coordinator / Group Leader | COORDINATOR | Manages sub-groups or correspondence groups, assigns tasks, consolidates member feedback | Medium |
| Member | MEMBER | Reviews agenda documents, provides comments/feedback, completes assigned tasks, submits drafts | Standard |
| Viewer | VIEWER | Read-only access — views documents, meeting information, and outcomes. **No drafting, editing, upload, or approval rights by design.** | Read-only |

> **VIEWER role design intent (A-K-01):** The VIEWER role is intentionally read-only. This is a documented design decision, not a gap. It must be communicated to DGS before demo/UAT to prevent the client flagging absent editing capabilities as a defect. Update the ISEP-Screens-RBAC.md to confirm read-only intent explicitly for all 70 screens mapped to VIEWER.

External agency representatives (MoEFCC, MEA) use a separate provisioned MEMBER-equivalent role scoped to the specific consultation. This is not a seventh system role — it is a scoped MEMBER provisioning.

---

## 3. Platform Summary

| Parameter | Value |
|---|---|
| Total screens | 70 |
| Modules | 15 |
| User roles | 6 |
| RBAC layers | 3 (PostgreSQL RLS + Spring Security + frontend RoleGuard) |
| Feedback tracks | 3 (Document Comments, Structured Agenda Feedback, Paper Track Changes) |
| Approval stages | 7 (DRAFT → Group Leader → Delegation Leader → IC Division → CS/NA/CSS → DG → [MoPSW — configurable] → FINALIZED) |
| Concurrent users | 150 standard / 300 peak |
| Max file upload | 100 MB |
| Backup retention | 90 days |

---

## 4. Operating Environment

- Cloud-hosted on MeitY-empanelled Cloud Service Provider
- Web-based application: Chrome, Edge, Firefox (latest 2 major versions)
- Responsive: desktop, tablet, mobile
- No client-side installation required — pure browser application
- Government intranet and internet accessible (with appropriate network policy)

---

## 5. Design & Implementation Constraints

| Constraint | Details |
|---|---|
| Open source only | No proprietary licensing; all third-party components properly licensed and disclosed |
| OpenSearch (not Elasticsearch) | Elasticsearch SSPL licence not permissible — OpenSearch 2.x mandatory |
| Thin client | All business logic in backend; frontend is rendering + API calls only; CI-enforced |
| i18n scaffold mandatory | All UI strings externalised; no hardcoded display strings in JSX; CI-enforced |
| MeitY cloud hosting | Platform hosted exclusively on MeitY-empanelled CSP |
| Source code ownership | All source code and artefacts are exclusive property of DGS |
| WCAG 2.1 Level AA | Accessibility compliance is a Go-Live gate |
| GIGW 3.0 | Government website guidelines compliance mandatory |
| RPWD Act 2016 | Accessibility for persons with disabilities mandatory |
| DGS approval for deviations | Any deviation from approved architecture requires prior written DGS approval |

---

## 6. Assumptions

1. DGS will provide timely written responses to Open Issues (OI-001, OI-008, OI-012, OI-013, OI-014, OI-015)
2. NIC/government SSO infrastructure is not available in Phase 1 — Keycloak standalone credentials are acceptable for Go-Live
3. The VIEWER role's read-only nature is acceptable to DGS — to be confirmed before UAT
4. MoPSW approval step will be clarified by DGS (OI-001) — configurable implementation is interim
5. RFP Sections 1, 2, 6+ and full Annexure 1 have not been read — additional requirements may emerge

---

## 7. Dependencies

| Dependency | Type | Risk |
|---|---|---|
| MeitY-empanelled CSP selection and provisioning | External | Medium |
| DGS network access for external agencies (MoEFCC, MEA) | External | Medium |
| NIC SMTP relay for email notifications | External | Low |
| STQC certification process | External | High (payment milestone) |
| DGS sign-off on open issues (OI-001, OI-008) | Client | High |
