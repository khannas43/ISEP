# SRS-07 — Integration
**Project:** IMO Strategic Engagement Platform (ISEP)
**Version:** 2.1
**Date:** 04 April 2026

> **Change log v2.1:** Elasticsearch integration replaced with OpenSearch 2.x (C-02, OI-006 closed). All client config, Docker references, and Spring Boot integration notes updated.

---

## 1. Integration Architecture Overview

ISEP uses an API-first, open-standards integration architecture. Kong CE serves as the single API gateway for all service-to-service and client-to-service communication. External integrations are secured via OAuth 2.0 / OIDC through Keycloak.

```
Client (Browser)
    ↓
Kong CE (API Gateway — auth, throttling, logging)
    ↓
Spring Boot Services ←→ Python FastAPI (workflow)
    ↓                ↓
PostgreSQL       OpenSearch 2.x
                     ↓
                MinIO (object store)
```

---

## 2. Kong CE — API Gateway

**Role:** Single entry point for all API traffic. Handles:
- JWT authentication (Keycloak-issued tokens)
- Rate limiting and throttling
- Request logging to centralised log store
- API versioning and routing
- Plugin: correlation-id injection for distributed tracing

**Configuration:** Kong DB-less mode using declarative YAML config. All route definitions version-controlled in GitLab.

---

## 3. Keycloak — Identity & Access Management

**Role:** OIDC-compliant identity provider for all user authentication.

- Issues JWT tokens consumed by Kong and Spring Boot
- MFA enforced for sensitive roles (SYSTEM_ADMIN, IC_DIVISION_HEAD, DELEGATION_LEADER)
- User realm: `isep-realm`
- Client: `isep-frontend` (public), `isep-backend` (confidential)

> **SSO integration deferred (OI-011 — Closed):** NIC/government identity federation deferred to Phase 2. Keycloak manages all credentials internally until SSO is established. See SRS-05 NFR-2.

---

## 4. MinIO — Object Storage

**Role:** Storage backend for all uploaded documents (agenda papers, position papers, working documents).

- Bucket structure: `isep-documents/{committee}/{meeting}/{agenda_item}/`
- Pre-signed URL generation for secure, time-limited download access
- Server-side encryption: AES-256
- Upload size limit: 100 MB per file
- Retention policy: aligned with Government norms (90-day backup minimum)
- MinIO client integrated into Spring Boot document service via `io.minio:minio` SDK

---

## 5. OpenSearch 2.x — Search & Indexing

> **v2.1:** Elasticsearch removed. OpenSearch 2.x is the approved search and indexing engine. OI-006 is closed.

**Role:** Full-text search, document indexing, audit log querying, and analytics aggregation.

### 5.1 Docker Image

```yaml
# docker-compose / Swarm service definition
services:
  opensearch:
    image: opensearchproject/opensearch:2.13.0
    environment:
      - discovery.type=single-node
      - OPENSEARCH_INITIAL_ADMIN_PASSWORD=${OPENSEARCH_ADMIN_PASSWORD}
    ports:
      - "9200:9200"
    volumes:
      - opensearch_data:/usr/share/opensearch/data
```

### 5.2 Spring Boot Client Configuration

```yaml
# application.yml
opensearch:
  uris: http://opensearch:9200
  username: ${OPENSEARCH_USERNAME}
  password: ${OPENSEARCH_PASSWORD}
```

Use the OpenSearch Java client (`org.opensearch.client:opensearch-java`) or the compatible Elasticsearch 7.x REST High Level Client with endpoint override. Do not import `co.elastic.clients` — this is the Elasticsearch 8.x proprietary client and is not permitted.

### 5.3 Indexes Managed

| Index | Purpose |
|---|---|
| `documents_index` | Full-text search over document titles and content |
| `feedback_index` | Search and filter across all feedback submissions |
| `audit_logs_index` | Queryable audit trail with device attributes |

Index definitions in SRS-06-Data-Model.md.

### 5.4 OpenSearch Dashboards (optional)

`opensearchproject/opensearch-dashboards:2.13.0` may be deployed for admin-facing analytics views. Not exposed to end users.

---

## 6. SMTP — Email Notification Delivery

**Role:** Outbound email for notifications (task assignments, approval alerts, meeting reminders, overdue escalations).

- SMTP relay: Government-approved SMTP server (NIC SMTP or equivalent)
- Spring Boot integration: `spring-boot-starter-mail`
- All emails sent with authenticated SMTP (TLS enforced)
- Email templates: Thymeleaf HTML templates, i18n-ready (string keys externalised)
- Bounce handling: delivery failures logged to audit system

> **Confirmation needed:** Developer to confirm SMTP email delivery is wired and tested end-to-end. In-portal notifications confirmed built. Email delivery unconfirmed as of v2.1. (See ISEP-Pending-Activities.md — A-I-01.)

---

## 7. ELK / Centralised Logging

- All application logs (Spring Boot, FastAPI) shipped to OpenSearch via Logstash or Fluent Bit
- Log format: structured JSON with correlation ID, service name, log level, timestamp
- Log retention: as per Government norms

---

## 8. Future Integrations (Planned — not in Phase 1 scope)

| System | Integration Type | Trigger |
|---|---|---|
| NIC SSO / eGov Identity | OIDC federation via Keycloak | OI-011 — Phase 2 |
| IMO GISIS | REST API (read) | Post Go-Live |
| ILO / IMSO portals | REST API | Post Go-Live |
| MoPSW systems | REST API / file exchange | Subject to OI-001 resolution |
| Document-level envelope encryption service | Internal service | OI-015 — pending DGS |
