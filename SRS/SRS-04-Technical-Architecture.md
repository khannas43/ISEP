# SRS-04 — Technical Architecture
**Project:** IMO Strategic Engagement Platform (ISEP)
**Version:** 2.1
**Date:** 04 April 2026

> **Change log v2.1:** Elasticsearch replaced with OpenSearch 2.x (OI-006 closed, C-02); i18n scaffold added as mandatory dev rule (F-03); thin client mandate reinforced with CI enforcement requirement (F-04).

---

## 1. Architecture Principles

- Cloud-native, modular, and scalable architecture aligned with MeitY guidelines
- Open standards and industry-accepted frameworks — no vendor lock-in
- Security embedded across all layers
- API-first: all functionalities exposed through well-documented RESTful APIs
- Thin client: all business logic centralised in the backend; frontend is a rendering and API-call layer only
- Horizontal and vertical scalability to handle up to 300 concurrent users at peak

---

## 2. Tech Stack (v2.1 — Approved)

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend | Next.js | Latest stable | React-based; i18n scaffold mandatory |
| Backend | Spring Boot | 3.x | All business logic; @PreAuthorize RBAC |
| Workflow Engine | Python FastAPI | Latest stable | Workflow orchestration service |
| Relational Database | PostgreSQL | 15+ | Row-Level Security (RLS) enforced |
| Search & Indexing | **OpenSearch** | **2.x** | **Replaces Elasticsearch. Apache 2.0 licensed. Drop-in compatible with ES 7.10 API.** |
| Object Storage | MinIO | Latest stable | Document and file storage |
| API Gateway | Kong CE | Latest stable | Auth, throttling, logging |
| Identity & Access | Keycloak | Latest stable | OIDC; SSO deferred to Phase 2 |
| CI/CD | GitLab CI | — | Pipelines with lint, test, build, deploy |
| Code Quality | SonarQube | Installed | Code review gate |
| Orchestration | Docker Swarm | — | Multi-node deployment |
| Logging & Monitoring | ELK Stack (with OpenSearch) | — | Centralised log management |

> **Hard rule — OpenSearch only:** No Elasticsearch dependency shall be introduced anywhere in the stack. All search configuration, Docker images, Spring Boot clients, and documentation must reference OpenSearch 2.x. Use `opensearchproject/opensearch:2.x` as the Docker image. Non-compliance is a contractual breach per RFP Section 3.4.

---

## 3. Frontend Architecture

### 3.1 Core Requirements

- Web-based, responsive interface compatible with Chrome, Edge, Firefox
- Responsive design: desktop, tablet, mobile
- Role-based UI rendering per six defined roles
- Secure session management with inactivity timeouts
- Protection against XSS, CSRF, and clickjacking

### 3.2 Thin Client Mandate — Hard Rule (F-04)

> **The frontend is a thin client. All business logic lives in Spring Boot backend services.**

The following are **prohibited** in the frontend codebase (`/pages`, `/components`, `/hooks`):
- Direct database queries or ORM calls
- Business computation functions (pricing, workflow routing, approval logic)
- Validation logic beyond basic input formatting
- Any transformation of data that should be the backend's responsibility

**CI enforcement:** An ESLint rule must be configured in the CI pipeline to flag violations at build time. Any build with business logic in frontend components must fail the CI gate. This is a contractual obligation per RFP Section 3.2 (thin client architecture).

### 3.3 Internationalisation Scaffold — Hard Rule (F-03)

> **All UI display strings must be externalised. No hardcoded text in JSX components.**

Implementation:
- Use `next-i18next` (or equivalent approved i18n library) for string externalisation
- All display strings stored in translation key files (e.g. `public/locales/en/common.json`)
- No hardcoded string literals in `<text>`, button labels, tooltips, error messages, or headings in JSX
- **CI enforcement:** ESLint rule to flag hardcoded display strings in JSX at build time

> Active multi-language translation is not required at Go-Live. The scaffold must be in place so future translations can be added without code changes. This is mandated by RFP Section 3.2 ("Internationalization support — future-ready").

### 3.4 Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation throughout all screens
- Screen reader compatibility (NVDA, JAWS)
- Colour contrast minimum 4.5:1
- Alt-text on all non-decorative images
- Full GIGW 3.0 and RPWD Act 2016 compliance

---

## 4. Backend Architecture

- Service-oriented / microservices-based architecture
- Stateless application design for horizontal scalability
- Role-based access enforcement at API level via Spring Security `@PreAuthorize`
- Workflow engine supporting multi-level approvals and task routing
- Centralised exception handling and logging
- High availability and horizontal scalability

---

## 5. Middleware & Integration Layer

- API-first architecture using RESTful APIs
- Kong CE as API Gateway: authentication, throttling, rate limiting, logging
- Support for future integration with IMO, ILO, IMSO, and other Government systems
- Message-based integration (where required) for asynchronous processing
- Versioned APIs to ensure backward compatibility

---

## 6. Data Layer

- PostgreSQL 15+ as primary relational database
- Row-Level Security (RLS) enforced at database level
- Data normalisation and indexing for performance
- Support for structured and unstructured data (documents, feedback, logs)
- Role-based data access control
- Encryption at rest (AES-256) and in transit (TLS 1.2+)
- Point-in-time recovery and automated backups
- Archival and retention policies aligned with Government norms (90-day minimum backup retention)

---

## 7. Search & Indexing (OpenSearch)

**OpenSearch 2.x replaces Elasticsearch.** OI-006 is closed.

Rationale:
- Elasticsearch switched to SSPL licence from version 7.11 onward — not OSI-approved, not permissible for Government procurement
- OpenSearch is a community fork of Elasticsearch 7.10, maintained by AWS, licensed under Apache 2.0
- API compatibility with Elasticsearch 7.10 — no functional change required
- No vendor lock-in; aligns with RFP open standards mandate

Migration steps (developer action):
1. Replace `docker pull elasticsearch` with `docker pull opensearchproject/opensearch:2.x` in all Compose/Swarm configs
2. Update `application.yml` — change client endpoint to OpenSearch; use OpenSearch Java client or compatible Elasticsearch 7.x REST client with endpoint override
3. Replace all `elasticsearch` references in CURSOR-PROJECT-CONTEXT.md, deployment scripts, and documentation

---

## 8. Logging, Monitoring & Audit Architecture

- Centralised logging across all components (ELK stack with OpenSearch)
- Real-time monitoring of application and infrastructure health
- Comprehensive audit trails for all user actions including:
  - User identity and role
  - Timestamp
  - Action performed
  - Data objects touched
  - IP address
  - Device type and user agent
- Dashboard for system administrators
- Log retention as per Government norms
- Audit trail completeness is a contractual obligation per RFP Section 3.16H

> See SRS-06-Data-Model.md for the updated `audit.audit_logs` schema with device attributes.

---

## 9. Security Architecture

- Multi-factor authentication (MFA) for sensitive roles via Keycloak
- Three-layer RBAC: PostgreSQL RLS + Spring Security `@PreAuthorize` + frontend RoleGuard
- Zero Trust posture: every API request authenticated and authorised independently
- Non-repudiation: audit logs are immutable
- Protection against XSS, CSRF, clickjacking in frontend
- ISO 27001, ISO 27017, ISO 27018, and CERT-In compliance on cloud infrastructure

---

## 10. Architecture Governance

- Any deviation from this approved architecture requires prior written approval from DGS
- Non-compliance with approved standards (including OpenSearch mandate, thin client mandate, i18n mandate) is a contractual breach per RFP Section 3.4
- Architecture reviewed at design, pre-Go-Live, and post-Go-Live stages
