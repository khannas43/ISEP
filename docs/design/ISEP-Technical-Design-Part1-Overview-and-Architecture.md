# ISEP Technical Design Document — Part 1: Overview & Architecture

**Document ID:** DGS-ISEP-TDD-01  
**Version:** 1.0  
**Last Updated:** 2026-02-28  
**Status:** Draft for review  

---

## 1. Introduction

### 1.1 Purpose

This document (and its companion parts) describes the **technical design** of the **IMO Strategic Engagement Platform (ISEP)** — an internal digital platform for the Directorate General of Shipping (DGS), Ministry of Ports, Shipping and Waterways (MoPSW), Government of India. The platform manages India's engagement with IMO, ILO, IMSO and related international bodies.

This part covers **system context**, **high-level architecture**, **technology stack**, and **deployment view**. Subsequent parts cover backend/APIs, frontend/UX, and data/integration in detail.

### 1.2 Scope

- **In scope:** Architecture of the ISEP application (frontend, backend services, database, authentication, APIs). Design decisions and rationale. Interfaces and integration points.
- **Out of scope:** Business process re-engineering, organizational change, procurement, or non-ISEP legacy systems except where they integrate.

### 1.3 References

| Document | Description |
|----------|-------------|
| DGS-ISEP-SRS-03 | Functional requirements |
| DGS-ISEP-SRS-04 | Technical architecture (SRS) |
| ISEP-Screens-RBAC.md | Screen inventory and RBAC matrix |
| ISEP-Project-Plan.md | Project plan and workstreams |
| ISEP-Backend-Implementation-Roadmap.md | Backend API roadmap |
| database/README.md | Database migrations and seeds |

### 1.4 Definitions and Abbreviations

| Term | Definition |
|------|------------|
| **ISEP** | IMO Strategic Engagement Platform |
| **DGS** | Directorate General of Shipping |
| **IMO** | International Maritime Organization |
| **RBAC** | Role-Based Access Control |
| **OIDC** | OpenID Connect |
| **JWT** | JSON Web Token |
| **API** | Application Programming Interface |

---

## 2. System Context

### 2.1 Business Context

ISEP supports DGS officers and stakeholders in:

- Managing **international bodies** (committees, sub-committees, working groups).
- Scheduling and managing **meetings** (in-person, virtual, hybrid).
- Maintaining **agenda items**, **documents**, and **paper preparation** with approval workflows.
- Capturing **member feedback** on agenda items and **consolidating** positions.
- Managing **tasks** and **correspondence groups** linked to meetings.
- **Live meeting** support: interventions, outcomes.
- **Reports**, **audit**, **notifications**, and **system administration**.

### 2.2 Users and Roles

| Role | Code | Description |
|------|------|-------------|
| System Administrator | SA | Full platform access; users, config, audit |
| IC Division Head | IH | Senior approver; paper sign-off |
| Delegation Leader | DL | Heads delegation for committee/meeting |
| Coordinator | CO | Manages committee agenda and workflow |
| Member | ME | Subject expert; feedback, papers, tasks |
| Viewer | VW | Read-only stakeholder |

Access to screens and APIs is governed by **RBAC** based on these six Keycloak realm roles.

### 2.3 System Boundaries

- **Internal users:** DGS/MoPSW staff and designated experts (authenticated via Keycloak).
- **Data:** Stored in PostgreSQL; file storage via local filesystem or MinIO (optional).
- **External systems:** Keycloak (identity), optional Kong (API gateway), optional Elasticsearch (future search). No direct IMO/ILO system integration in current scope.

---

## 3. High-Level Architecture

### 3.1 Architectural Style

- **Frontend:** Single-page application (SPA) behaviour with **Next.js App Router** (React), server and client components.
- **Backend:** **Modular monolith** implemented as **Spring Boot** “meeting-service” plus optional separate services (user-service, workflow-service). APIs are REST, JSON over HTTP.
- **Data:** **PostgreSQL** as single operational database; schema split into multiple schemas (core, documents, workflow, collaboration, correspondence, notifications, audit).
- **Security:** **Keycloak** for identity and OIDC; JWT access tokens for API authorization. Frontend uses NextAuth with Keycloak credential flow (resource owner password) for development; redirect flow for production is recommended.

### 3.2 C4 Context Diagram (Level 1)

```
                    +------------------+
                    |   DGS/MoPSW      |
                    |   Users          |
                    +--------+---------+
                             |
                             | HTTPS
                             v
                    +------------------+
                    |   ISEP Web       |
                    |   (Next.js)      |
                    |   :3000          |
                    +--------+---------+
                             |
                   REST/JSON | Bearer JWT
                             v
        +--------------------+--------------------+
        |         ISEP Backend (Spring Boot)      |
        |         meeting-service :8081           |
        |  Bodies, Meetings, Agenda, Docs,        |
        |  Papers, Feedback, Tasks, CGs, Reports  |
        +--------------------+--------------------+
                             |
              +---------------+---------------+
              |               |               |
              v               v               v
     +-------------+  +-------------+  +-------------+
     | PostgreSQL  |  | Keycloak    |  | File store  |
     | (isep DB)   |  | (OIDC/JWT)  |  | (local/    |
     | :5433       |  | :8180       |  |  MinIO)    |
     +-------------+  +-------------+  +-------------+
```

### 3.3 Component Overview

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind, Radix UI | UI, routing, auth (NextAuth), server/client components, API consumption |
| **Meeting service** | Spring Boot 3, Java 21, JPA | REST APIs for bodies, meetings, agenda, documents, papers, feedback, tasks, CGs, notifications, reports, workflow, live interventions/outcomes |
| **User service** | Spring Boot (optional) | User list, Keycloak sync, role assignment |
| **Workflow service** | Python FastAPI + Celery + Redis (optional) | Workflow FSM, async tasks; approval logic currently in meeting-service |
| **Database** | PostgreSQL 15+ | All persistent data; Flyway-style migrations (V1–V12) |
| **Identity** | Keycloak | Realm `isep-realm`; OIDC; realm roles for RBAC |
| **API gateway** | Kong (optional) | Routing, rate limit; dev often bypasses (frontend → meeting-service directly) |

### 3.4 Data Flow (Simplified)

1. **Authentication:** User signs in via frontend → NextAuth uses Keycloak token endpoint (password grant in dev) → access token (JWT) stored in session.
2. **API calls:** Frontend (server or client) sends `Authorization: Bearer <access_token>` to backend. Next.js API routes can proxy to backend (e.g. `/api/*`).
3. **Backend:** Validates JWT (JWKS from Keycloak), extracts subject (user id); uses JPA to read/write PostgreSQL. File uploads stored on disk or MinIO.
4. **Reference data:** All dropdown/lookup values (meeting type, status, body type, etc.) come from `core.reference_data` via `GET /api/v1/reference?category=...`. No hardcoded option lists in frontend (project rule).

---

## 4. Technology Stack

### 4.1 Frontend

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Framework | Next.js | 14+ (App Router) |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | Utility-first |
| UI components | Radix UI | Accessible primitives |
| Auth | next-auth | Keycloak (credentials/password grant for dev) |
| HTTP | fetch | Server actions and API routes for backend calls |

### 4.2 Backend (Meeting Service)

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Runtime | Java | 21 |
| Framework | Spring Boot | 3.x |
| Security | Spring Security OAuth2 Resource Server | JWT with Keycloak JWKS |
| Persistence | Spring Data JPA, Hibernate | PostgreSQL dialect |
| Build | Maven | mvnw wrapper |
| File handling | Apache PDFBox, Apache POI | Text extraction for document diff |

### 4.3 Database

| Item | Choice |
|------|--------|
| RDBMS | PostgreSQL 15+ |
| Migrations | Versioned SQL (V1__… through V12__…) — Flyway-style naming |
| Schemas | core, documents, workflow, collaboration, correspondence, notifications, audit |
| Connection | JDBC; default port 5433 (Docker); config via POSTGRES_* env vars |

### 4.4 Infrastructure (Development)

| Component | Typical choice |
|----------|----------------|
| Container/orchestration | Docker Compose (e.g. `infrastructure/docker/docker-compose.dev.yml`) |
| Identity | Keycloak (e.g. port 8180), realm `isep-realm` |
| API gateway | Kong (optional); direct frontend → meeting-service in dev |

---

## 5. Deployment View

### 5.1 Development

- **Frontend:** `npm run dev` → http://localhost:3000  
- **Backend:** `mvn spring-boot:run` in `backend/meeting-service` → http://localhost:8081  
- **Database:** PostgreSQL on localhost:5433 (or 5432); database `isep`, user `isep_app`  
- **Keycloak:** http://localhost:8180 (realm `isep-realm`, client `isep-web`)  
- **API URL:** Frontend uses `NEXT_PUBLIC_API_URL` (default http://localhost:8081 when talking to meeting-service directly)

### 5.2 Runtime Topology (Logical)

```
[Browser] → [Next.js (Node)] → [Meeting Service (JVM)] → [PostgreSQL]
                ↓                        ↓
           [Keycloak]              [File store]
```

- No server-side server-to-server auth between Next.js and meeting-service beyond forwarding the user’s JWT.
- Session is maintained by NextAuth (cookie); access token is attached to outbound API requests.

### 5.3 Configuration Summary

| Component | Key configuration |
|-----------|-------------------|
| Meeting service | `application.yml`: datasource (POSTGRES_*), server.port (8081), Keycloak JWKS/issuer, CORS origins, multipart limits |
| Frontend | `.env`: NEXTAUTH_SECRET, KEYCLOAK_*, NEXT_PUBLIC_API_URL |
| Database | Migrations and seeds: `database/run-migrations-and-seeds.sh`, `run-remaining-and-seeds.sh` |

---

## 6. Quality Attributes and Constraints

### 6.1 Security

- All application data and dropdown options served from backend/DB; no mock data in production flows.
- JWT validation at API boundary; role-based route protection in frontend (middleware + `routePermissions.ts`).
- Audit logging for sensitive actions (stored in `audit.audit_logs`).

### 6.2 Scalability

- Stateless backend; horizontal scaling of meeting-service possible behind a load balancer.
- Database connection pooling (Spring Boot default HikariCP).
- File storage can be moved to MinIO or object store for multi-instance deployment.

### 6.3 Constraints

- Keycloak realm roles must match exactly: SYSTEM_ADMIN, IC_DIVISION_HEAD, DELEGATION_LEADER, COORDINATOR, MEMBER, VIEWER.
- PostgreSQL is the system of record; no dual-write to other stores for core entities.

---

## 7. Document Index (Multi-Part TDD)

| Part | Title | Content |
|------|--------|---------|
| **Part 1** | Overview & Architecture | This document: context, architecture, stack, deployment |
| **Part 2** | Backend & APIs | Controllers, services, API catalog, security, errors |
| **Part 3** | Frontend & UX | App structure, routing, auth, RBAC, state, key screens |
| **Part 4** | Data & Integration | Schemas, migrations, Keycloak, reference data, seeds |

---

*End of Part 1.*
