# ISEP Technical Design Document — Part 2: Backend & APIs

**Document ID:** DGS-ISEP-TDD-02  
**Version:** 1.0  
**Last Updated:** 2026-02-28  
**Status:** Draft for review  

---

## 1. Introduction

This part describes the **backend architecture** of ISEP: the **meeting-service** (Spring Boot), API design, security, and main service/controller responsibilities. It is intended for developers and integrators.

**Prerequisite reading:** Part 1 (Overview & Architecture).

---

## 2. Backend Service Overview

### 2.1 Meeting Service (Primary Backend)

The **meeting-service** is a single Spring Boot 3 application (Java 21) that implements all core ISEP REST APIs. It is a **modular monolith**: one deployable unit with clear package boundaries (web, service, repository, domain).

| Package / layer | Responsibility |
|-----------------|----------------|
| `in.gov.dgs.isep.meeting.web` | REST controllers; DTOs; request/response mapping |
| `in.gov.dgs.isep.meeting.service` | Business logic; orchestration; transactions |
| `in.gov.dgs.isep.meeting.repository` | Spring Data JPA repositories |
| `in.gov.dgs.isep.meeting.domain` | JPA entities |

**Configuration:** `src/main/resources/application.yml`  
- Datasource: PostgreSQL (default port 5433), DB `isep`, user `isep_app`  
- Server port: 8081  
- JWT: Keycloak JWKS URI and issuer  
- CORS: configurable allowed origins (default http://localhost:3000)  
- Multipart: 20 MB max file size  

### 2.2 Optional Services

- **user-service:** User list, Keycloak sync, role assignment (separate deployable).  
- **workflow-service:** Python FastAPI + Celery for workflow FSM; approval state machine is currently implemented inside meeting-service (PaperApprovalService, paper_approval_stages).

---

## 3. API Catalog

All APIs are under base path `/api/v1`. Authentication: **Bearer JWT** (Keycloak access token). Unless noted, responses are JSON.

### 3.1 Bodies (International Bodies)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/bodies | List all bodies (optional query params) |
| GET | /api/v1/bodies/{id} | Get body by ID |
| POST | /api/v1/bodies | Create body (JWT) |
| PUT | /api/v1/bodies/{id} | Update body (JWT) |

**Controller:** `BodyController`  
**Service:** `BodyService`  
**Entity:** `InternationalBody`; table `core.international_bodies`

---

### 3.2 Meetings

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/meetings | Paginated list (optional bodyId, status) |
| GET | /api/v1/meetings/{id} | Get meeting by ID |
| GET | /api/v1/meetings/{id}/participants | List participants |
| GET | /api/v1/meetings/{id}/agenda-items | List agenda items |
| GET | /api/v1/meetings/{id}/agenda-items/{itemId} | Get single agenda item |
| POST | /api/v1/meetings/{id}/agenda-items | Create agenda item |
| PATCH | /api/v1/meetings/{id}/agenda-items/{itemId} | Update agenda item |
| GET | /api/v1/meetings/{id}/status-history | Status history |
| GET | /api/v1/meetings/{id}/tasks | List tasks for meeting |
| GET | /api/v1/meetings/{id}/documents | List documents for meeting |
| POST | /api/v1/meetings/{id}/documents | Upload document (multipart) |
| GET | /api/v1/meetings/{id}/correspondence-groups | List CGs with assigned flag |
| PUT | /api/v1/meetings/{id}/correspondence-groups | Set linked CGs (body JSON: array of UUIDs) |
| POST | /api/v1/meetings | Create meeting |
| PATCH | /api/v1/meetings/{id} | Update meeting |
| PATCH | /api/v1/meetings/{id}/status | Update status (e.g. ?status=ACTIVE) |
| POST | /api/v1/meetings/{id}/participants | Add participant |
| DELETE | /api/v1/meetings/{id}/participants/{participantId} | Remove participant |
| PATCH | /api/v1/meetings/{id}/participants/{participantId} | Update participant |
| GET | /api/v1/meetings/{id}/tasks/{taskId} | Get task |
| POST | /api/v1/meetings/{id}/tasks | Create task (triggers notification to assignee) |
| PATCH | /api/v1/meetings/{id}/tasks/{taskId} | Update task (reassignment triggers notification) |
| GET | /api/v1/meetings/{id}/interventions | List interventions (live meeting) |
| POST | /api/v1/meetings/{id}/interventions | Create intervention |
| GET | /api/v1/meetings/{id}/outcomes | List outcomes |
| POST | /api/v1/meetings/{id}/outcomes | Create outcome |

**Controller:** `MeetingController`  
**Service:** `MeetingService`  
**Entities:** Meeting, AgendaItem, MeetingParticipant, Task, MeetingCorrespondenceGroup, MeetingIntervention, MeetingOutcome

---

### 3.3 Documents

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/documents | List documents (optional meetingId, q for search) |
| GET | /api/v1/documents/{id} | Get document metadata |
| GET | /api/v1/documents/{id}/download | Download current version (binary) |
| GET | /api/v1/documents/{id}/versions/{versionNumber}/download | Download specific version |
| GET | /api/v1/documents/{id}/versions/{versionNumber}/text | Plain text for version (for diff) |
| GET | /api/v1/documents/{id}/versions | List versions |
| POST | /api/v1/documents/{id}/versions | Upload new version (multipart) |

**Controller:** `DocumentController`  
**Service:** `DocumentService`  
**Entities:** Document, DocumentVersion; tables in `documents` schema. Version 1 may be resolved from main document file when no explicit version row exists.

---

### 3.4 Reference Data

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/reference | Query param `category` (e.g. meeting_type, body_type, agenda_category). Returns [{ code, label, sort_order }] |

**Controller:** `ReferenceController`  
**Table:** `core.reference_data`  
**Rule:** All dropdown options in the frontend must come from this API; no hardcoded lists.

---

### 3.5 Papers

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/papers | List papers (optional filters) |
| POST | /api/v1/papers | Create paper |
| GET | /api/v1/papers/{id}/draft | Get draft content (HTML/text) |
| PUT | /api/v1/papers/{id}/draft | Update draft |
| GET | /api/v1/papers/{id}/approval | Get approval stages and current state |
| POST | /api/v1/papers/{id}/approval/approve | Approve (body: optional comment) |
| POST | /api/v1/papers/{id}/approval/reject | Reject (body: comment) |

**Controller:** `PaperController`  
**Services:** `PaperService`, `PaperApprovalService`  
**Entities:** Paper; workflow.paper_approval_stages

---

### 3.6 Feedback (Collaboration)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/feedback | Query param `agendaItemId` — list all feedback for agenda item |
| GET | /api/v1/feedback/my | Query param `agendaItemId` — current user's feedback |
| GET | /api/v1/feedback/{id} | Get by feedback ID |
| POST | /api/v1/feedback | Save draft (body: agendaItemId, position, comments, suggestedAmendments, documentId) |
| PATCH | /api/v1/feedback/{id}/submit | Submit feedback |
| PATCH | /api/v1/feedback/{id}/reviewed | Mark as reviewed |

**Controller:** `FeedbackController`  
**Service:** `FeedbackService`  
**Entity:** Feedback; table `collaboration.feedback`. User resolution: if JWT subject (Keycloak user id) not in core.users, fallback to first active user for demo compatibility.

---

### 3.7 Correspondence Groups

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/correspondence-groups | List CGs |
| GET | /api/v1/correspondence-groups/{id} | Get CG by ID |
| POST | /api/v1/correspondence-groups | Create CG |
| PATCH | /api/v1/correspondence-groups/{id} | Update CG |

**Controller:** `CorrespondenceGroupController`  
**Service:** `CorrespondenceGroupService`  
**Entities:** CorrespondenceGroup, CgMember; junction `core.meeting_correspondence_groups` for meeting–CG linking (see MeetingController).

---

### 3.8 Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/notifications | List notifications for current user (paginated) |
| GET | /api/v1/notifications/unread-count | Unread count |
| GET | /api/v1/notifications/{id} | Get one |
| PATCH | /api/v1/notifications/{id}/read | Mark as read |
| POST | /api/v1/notifications/mark-all-read | Mark all read for user |

**Controller:** `NotificationController`  
**Service:** `NotificationService`  
**Entity:** Notification; table `notifications.notifications`. Created on task create/reassign.

---

### 3.9 Reports

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/reports/meeting-summary | Meeting summary report (query params as needed) |
| GET | /api/v1/reports/approval-pipeline | Approval pipeline report |
| GET | /api/v1/reports/audit | Audit log (paginated/filtered) |

**Controller:** `ReportController`  
**Entities:** AuditLog in `audit.audit_logs`

---

### 3.10 Workflow Instances

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/workflow-instances | List workflow instances |
| GET | /api/v1/workflow-instances/{id} | Get instance by ID |

**Controller:** `WorkflowController`  
**Entity:** WorkflowInstance (workflow schema). Full FSM/Celery can be in Python workflow-service later.

---

### 3.11 Users

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/users | List users |
| GET | /api/v1/users/{id} | Get user by ID |

**Controller:** `UserController` (may live in user-service or meeting-service). Used for participant/coordinator/India lead dropdowns and admin user list.

---

### 3.12 Actuator

| Method | Path | Description |
|--------|------|-------------|
| GET | /actuator/health | Health check (used by System Health screen) |
| GET | /actuator/info | Info |
| GET | /actuator/metrics | Metrics (when exposed) |

---

## 4. Security

### 4.1 JWT Validation

- **Resource server:** Spring Security OAuth2 Resource Server with JWT.  
- **JWKS URI:** From Keycloak (e.g. `http://localhost:8180/realms/isep-realm/protocol/openid-connect/certs`).  
- **Issuer:** Must match token `iss` claim.  
- **Scope:** Stateless; no session store on backend. Every request must send valid `Authorization: Bearer <access_token>`.

### 4.2 User Identity in Backend

- **Subject:** `jwt.getSubject()` is used as the user identifier (Keycloak user UUID).  
- **Optional mapping:** Backend may resolve this to `core.users.user_id` for authorisation or display (e.g. feedback save uses fallback to first active user if subject not in users table, for demo).  
- **Role:** Realm roles are in the token (e.g. `realm_access.roles`). Backend may enforce role-based access per endpoint in future; currently frontend RBAC is primary for route protection.

### 4.3 CORS

- Allowed origins configured in `application.yml` (`cors.allowed-origins`). Default development: `http://localhost:3000`.

### 4.4 File Upload

- Multipart max 20 MB.  
- Document and version uploads stored under configured path or MinIO; object key and metadata stored in DB.

---

## 5. Error Handling and HTTP Semantics

- **200 OK:** Success with body.  
- **204 No Content:** Success, no body (e.g. PUT meeting CGs).  
- **400 Bad Request:** Validation or business rule (e.g. missing agendaItemId).  
- **401 Unauthorized:** Missing or invalid JWT.  
- **404 Not Found:** Resource not found (e.g. meeting, document, feedback).  
- **500 Internal Server Error:** Unhandled exception; message may be generic in production.  

Controllers often catch `RuntimeException` and map "not found" messages to 404. Global exception handler can standardise error payloads (e.g. `{ "error": "..." }`).

---

## 6. Service Layer Summary

| Service | Responsibility |
|---------|----------------|
| BodyService | CRUD international bodies |
| MeetingService | Meetings, participants, agenda items, tasks, documents list/upload, meeting–CG link, interventions, outcomes; calls NotificationService on task assign/reassign |
| DocumentService | Document CRUD, versioning, file path resolution, text extraction (PDF/DOCX) for diff, version 1 fallback when no version row |
| FeedbackService | List by agenda item, save draft, submit, mark reviewed; user fallback for Keycloak id not in users |
| PaperService | Paper CRUD, draft get/put |
| PaperApprovalService | Approval stages, approve/reject, state transitions |
| CorrespondenceGroupService | CG CRUD |
| NotificationService | Create notification, list, unread count, mark read |
| LiveMeetingService | Interventions, outcomes |
| (Report logic) | Meeting summary, approval pipeline, audit report |

---

## 7. Document Versioning and Compare

- **Current version:** Stored on `documents.documents.current_version` and main file (minio_object_key).  
- **History:** `documents.document_versions` stores each version (version_number, object key, upload metadata).  
- **Version 1:** If no row in document_versions for v1, backend resolves version 1 from the main document file. When adding version 2, a version 1 row is persisted so future compares work.  
- **Compare/diff:** Frontend requests `/documents/{id}/versions/{v}/text` for two versions and uses jsdiff for content diff. Backend uses PDFBox/POI to extract text from binary files.

---

## 8. Dependencies (Meeting Service)

- Spring Boot Starter Web, Data JPA, Security (OAuth2 Resource Server), Validation  
- PostgreSQL driver  
- Apache PDFBox, Apache POI (document text extraction)  
- Lombok (optional)  
- Flyway or manual migrations (project uses versioned SQL scripts in `database/migrations`)

---

*End of Part 2.*
