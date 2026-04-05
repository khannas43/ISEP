# SRS-08 — Deployment
**Project:** IMO Strategic Engagement Platform (ISEP)
**Version:** 2.1
**Date:** 04 April 2026

> **Change log v2.1:** OpenSearch 2.x replaces Elasticsearch in all deployment configurations (C-02). DR drill remains mandatory. Exit Management Plan Section 8 unchanged.

---

## 1. Deployment Architecture

ISEP is deployed on a MeitY-empanelled Cloud Service Provider. The SI must confirm and document the CSP's MeitY empanelment status as a contractual obligation.

### 1.1 Environment Strategy

| Environment | Purpose | Notes |
|---|---|---|
| Development | Active feature development | Developer-local + shared dev server |
| Testing / SIT | System integration testing | Automated CI deploys |
| UAT | User acceptance testing | DGS-facing; demo environment |
| Production | Live system | HA, monitored 24×7 |
| Disaster Recovery | DR standby | Active-passive; separate AZ or region |

---

## 2. Container Orchestration — Docker Swarm

All services deployed as Docker containers orchestrated via Docker Swarm.

### 2.1 Services

| Service | Image | Notes |
|---|---|---|
| `isep-frontend` | Custom Next.js build | |
| `isep-backend` | Custom Spring Boot build | |
| `isep-workflow` | Custom Python FastAPI build | |
| `postgres` | `postgres:15` | Persistent volume |
| `opensearch` | `opensearchproject/opensearch:2.13.0` | **Replaces elasticsearch** |
| `opensearch-dashboards` | `opensearchproject/opensearch-dashboards:2.13.0` | Admin only — not public |
| `minio` | `minio/minio:latest` | Persistent volume |
| `kong` | `kong:latest` (CE) | API gateway |
| `keycloak` | `quay.io/keycloak/keycloak:latest` | Identity provider |
| `sonarqube` | `sonarqube:community` | Code quality gate |
| `logstash` | `logstash:8.x` | Log shipper to OpenSearch |

> No `elasticsearch` image shall be present in any deployment configuration. Replace with `opensearchproject/opensearch:2.13.0`.

### 2.2 CI/CD Pipeline (GitLab CI)

```
Push to branch
    ↓
Lint (ESLint — thin client + i18n rules enforced)
    ↓
Unit Tests (Jest / JUnit / Pytest)
    ↓
SonarQube Code Quality Gate
    ↓
Build Docker Images
    ↓
Integration Tests
    ↓
Deploy to Testing/UAT (on merge to main)
    ↓
Manual gate → Deploy to Production
```

---

## 3. High Availability

- Spring Boot backend: minimum 2 replicas behind Kong load balancer
- PostgreSQL: primary + read replica; point-in-time recovery enabled
- OpenSearch: single-node for dev/test; 3-node cluster for production (dedicated master + 2 data nodes)
- MinIO: distributed mode in production for redundancy
- Kong: 2 replicas

---

## 4. Backup & Disaster Recovery

- Automated encrypted backups: PostgreSQL (daily full + continuous WAL), MinIO (daily)
- Backup retention: 90 days minimum
- RPO: ≤ 4 hours
- RTO: ≤ 8 hours
- DR environment: separate availability zone or region, active-passive

### 4.1 DR Drill — Mandatory

Periodic DR drills are a contractual obligation. Schedule and results must be:
- Documented in the DR Runbook
- Executed at minimum once per quarter during O&M
- Results reported to DGS within 5 working days of each drill
- Failures remediated and re-drilled within 30 days

Failure to execute DR drills may constitute an SLA breach.

---

## 5. Monitoring & Alerting

- 24×7 application and infrastructure monitoring
- Metrics: CPU, memory, disk, network, response times, error rates
- Alerting: PagerDuty or equivalent; escalation to on-call engineer
- OpenSearch Dashboards for log analysis and operational visibility
- SLA compliance dashboards available to DGS on request

---

## 6. Security — Deployment Layer

- All secrets managed via environment variables or a secrets management service (Vault or equivalent); never hardcoded in source
- TLS terminated at Kong; internal traffic optionally encrypted
- Container images scanned for vulnerabilities at build time (Trivy or equivalent in CI)
- Network policies: services only communicate on defined ports; no direct internet access from backend services
- MinIO buckets: private by default; pre-signed URLs for document access only

---

## 7. Environment Configuration

All environment-specific configuration managed via:
- GitLab CI/CD variables (secrets, credentials)
- Docker Swarm secrets for runtime credential injection
- Separate `.env` files per environment — never committed to repository

---

## 8. Exit Management Plan

In case of contract termination or expiry, the SI shall:

1. **Data export:** Provide complete export of all data in open, non-proprietary formats (PostgreSQL dump, JSON/CSV exports, MinIO object archive)
2. **Source code handover:** Full source code, scripts, configurations, deployment artefacts, and GitLab repository access transferred to DGS or designated agency
3. **Documentation handover:** All SRS volumes, HLD, LLD, test plans, test reports, user manuals, admin manuals, security documentation, and as-built documentation
4. **Knowledge transfer:** Structured sessions for DGS IT and functional teams covering system architecture, operations, and support procedures
5. **Credential revocation:** All SI access credentials revoked post-handover; written certification provided
6. **Data sanitisation:** Certification that no data or system access is retained by the SI post-exit
7. **Transition continuity:** Services maintained and operational throughout transition period; no degradation of service during handover
8. **Final handover report:** Signed and submitted to DGS confirming completion of all exit obligations

Handover documentation includes: FRS, SRS (all volumes), HLD, LLD, test plans and reports, user and admin manuals, security and cloud architecture documents, and as-built documentation.
