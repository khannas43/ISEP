# ISEP Technical Design Document — Part 4: Data & Integration

**Document ID:** DGS-ISEP-TDD-04  
**Version:** 1.0  
**Last Updated:** 2026-02-28  
**Status:** Draft for review  

---

## 1. Introduction

This part describes the **data model**, **database schemas**, **migrations**, **reference data**, **seeds**, and **integration** with Keycloak and other external systems. It is intended for backend developers, DBAs, and integrators.

**Prerequisite reading:** Part 1 (Overview & Architecture), Part 2 (Backend & APIs).

---

## 2. Database Overview

### 2.1 RDBMS and Connection

- **Database:** PostgreSQL 15+  
- **Database name:** `isep`  
- **Application user:** `isep_app` (password via env, e.g. `isep_dev_password` in dev)  
- **Port:** Typically 5433 when using Docker; 5432 when using local PostgreSQL. Backend config: `application.yml` uses `POSTGRES_PORT` (default 5433).

### 2.2 Schema Strategy

Data is split into **multiple schemas** for logical separation. Migrations create schemas and tables in versioned order (V1–V12).

| Schema | Purpose |
|--------|---------|
| **core** | Users, international bodies, meetings, agenda items, meeting participants, tasks, reference_data, meeting_correspondence_groups |
| **documents** | documents, document_versions |
| **workflow** | workflow_instances, workflow_transition_logs, paper_approval_stages |
| **collaboration** | feedback |
| **correspondence** | correspondence_groups, cg_members |
| **notifications** | notifications |
| **audit** | audit_logs (immutable) |

---

## 3. Migrations

### 3.1 Naming and Order

- **Location:** `database/migrations/`  
- **Naming:** `V{n}__description.sql` (Flyway-style). Run in numerical order.  
- **Execution:** Via Flyway (if configured) or manually with `psql`. Project scripts: `run-migrations-and-seeds.sh`, `run-remaining-and-seeds.sh` from `database/` directory.

### 3.2 Migration List

| Version | File | Content |
|---------|------|---------|
| V1 | V1__create_schemas.sql | CREATE SCHEMA for core, documents, workflow, collaboration, correspondence, notifications, audit |
| V2 | V2__core_tables.sql | users, international_bodies, meetings, agenda_items, meeting_participants |
| V3 | V3__documents_tables.sql | documents.documents, documents.document_versions |
| V4 | V4__workflow_and_tasks.sql | workflow_instances, workflow_transition_logs, core.tasks |
| V5 | V5__collaboration_notifications_audit.sql | collaboration.feedback, correspondence.correspondence_groups, cg_members, notifications.notifications, audit.audit_logs |
| V6 | V6__reference_data.sql | core.reference_data |
| V7 | V7__meeting_status_history.sql | meeting_status_history (if applicable) |
| V8 | V8__agenda_assigned_coordinator.sql | Agenda/coordinator columns if any |
| V9 | V9__papers.sql | core.papers |
| V10 | V10__paper_approval_stages.sql | workflow.paper_approval_stages |
| V11 | V11__live_interventions_outcomes.sql | meeting_interventions, meeting_outcomes |
| V12 | V12__meeting_correspondence_groups.sql | core.meeting_correspondence_groups (junction meeting_id, cg_id) |

### 3.3 Running Migrations

From project root (example with Docker Postgres on 5433):

```bash
cd database
PGPASSWORD=isep_dev_password ./run-migrations-and-seeds.sh localhost 5433
PGPASSWORD=isep_dev_password ./run-remaining-and-seeds.sh localhost 5433
```

To run a single new migration (e.g. V12) when already on V11:

```bash
cd database
PGPASSWORD=isep_dev_password psql -h localhost -p 5433 -U isep_app -d isep -f migrations/V12__meeting_correspondence_groups.sql
```

---

## 4. Schema and Entity Summary

### 4.1 Core Schema

| Table | Description |
|-------|-------------|
| **users** | user_id (PK), keycloak_id, email, full_name, system_role, is_active, mfa_enabled, etc. system_role: SYSTEM_ADMIN, IC_DIVISION_HEAD, DELEGATION_LEADER, COORDINATOR, MEMBER, VIEWER |
| **international_bodies** | body_id (PK), parent_body_id (FK), name, abbreviation, body_type, description, is_active |
| **meetings** | meeting_id (PK), body_id (FK), session_number, title, start_date, end_date, location, meeting_type, status, notes, created_by (FK users) |
| **agenda_items** | agenda_item_id (PK), meeting_id (FK), item_number, title, description, category, priority, status, deadline_for_inputs |
| **meeting_participants** | participant_id (PK), meeting_id (FK), user_id (FK), meeting_role (DELEGATION_LEADER, MEMBER, OBSERVER), UNIQUE(meeting_id, user_id) |
| **tasks** | task_id (PK), title, description, agenda_item_id, meeting_id, document_id, assigned_to, assigned_by, priority, due_date, status |
| **reference_data** | (category, code) PK, label, sort_order, is_active — lookup values for all dropdowns |
| **meeting_correspondence_groups** | (meeting_id, cg_id) PK; FK to meetings and correspondence_groups |

### 4.2 Documents Schema

| Table | Description |
|-------|-------------|
| **documents** | document_id (PK), meeting_id, agenda_item_id, body_id, document_type, title, source, minio_bucket, minio_object_key, file_name, file_size_bytes, mime_type, checksum_sha256, current_version, status, uploaded_by, uploaded_at |
| **document_versions** | version_id (PK), document_id (FK), version_number, minio_object_key, uploaded_by, uploaded_at, change_summary, file_size_bytes, checksum_sha256 |

### 4.3 Workflow Schema

| Table | Description |
|-------|-------------|
| **workflow_instances** | workflow_id (PK), document_id, workflow_type, current_state, previous_state, initiated_by, initiated_at, completed_at, deadline |
| **workflow_transition_logs** | transition_id (PK), workflow_id (FK), from_state, to_state, triggered_by, trigger_action, comments, transitioned_at |
| **paper_approval_stages** | Stages for paper approval workflow (e.g. DRAFT → SUBMITTED → APPROVED / REJECTED) |

### 4.4 Collaboration Schema

| Table | Description |
|-------|-------------|
| **feedback** | feedback_id (PK), agenda_item_id (FK), document_id (FK), user_id (FK), position (SUPPORT, OBJECT, NEUTRAL, ABSTAIN), comments, suggested_amendments, status (DRAFT, SUBMITTED, REVIEWED), submitted_at, reviewed_by, reviewed_at |

### 4.5 Correspondence Schema

| Table | Description |
|-------|-------------|
| **correspondence_groups** | cg_id (PK), parent_body_id (FK international_bodies), name, mandate, india_lead_id (FK users), start_date, end_date, status |
| **cg_members** | cg_member_id (PK), cg_id (FK), user_id (FK), role; UNIQUE(cg_id, user_id) |

### 4.6 Notifications Schema

| Table | Description |
|-------|-------------|
| **notifications** | notification_id (PK), recipient_user_id (FK), notification_type, title, message, linked_entity_type, linked_entity_id, is_read, delivered_in_portal_at, delivered_email_at, created_at |

### 4.7 Audit Schema

| Table | Description |
|-------|-------------|
| **audit_logs** | audit_id (PK), timestamp, user_id, user_email, session_id, ip_address, action_type, entity_type, entity_id, description, before_state (JSONB), after_state (JSONB), trace_id. **Immutable:** no FKs to application tables to preserve history. RLS: INSERT and SELECT only. |

---

## 5. Reference Data

### 5.1 Purpose

- **All dropdown and lookup values** in the application (meeting type, meeting status, body type, filter years, meeting roles, agenda category/priority/status) must come from the **database** via the backend API. No hardcoded option lists in the frontend (project ground rule).

### 5.2 Table and API

- **Table:** `core.reference_data`  
- **Columns:** category, code (PK with category), label, sort_order, is_active, created_at  
- **API:** `GET /api/v1/reference?category={category}`  
- **Categories (examples):** meeting_type, meeting_status, body_type, filter_year, agenda_category, agenda_priority, agenda_status, meeting_role  

### 5.3 Seed

- **Script:** `database/scripts/` or seeds (e.g. `03_reference_data.sql`) populate reference_data. Idempotent where possible (INSERT ... ON CONFLICT or equivalent).

---

## 6. Seeds and Sample Data

### 6.1 Seed Scripts (Typical Order)

Run after migrations. From `database/`:

| Script | Content |
|--------|---------|
| 01_reference_bodies.sql | International bodies (IMO committees, etc.) |
| 02_meetings_sample.sql | Sample meetings (e.g. 70 meetings, Jan 2023 – present) |
| 03_reference_data.sql | Lookup values for all categories |
| 04_seed_users.sql | Users with roles (SA, IH, CO, DL, ME, VW) for participants and admin |
| 05_seed_meeting_detail_sample.sql | Participants and agenda items (e.g. 3 per meeting) |
| 06_seed_meeting_status_history.sql | Status history for meetings |
| 07_seed_meeting_rich_sample.sql | Locations, notes, tasks, CGs for meetings |
| 08_seed_correspondence_groups.sql | Sample correspondence groups (e.g. 10) |
| 09_seed_tasks_papers_notifications_audit.sql | Tasks, papers, notifications, audit log entries |

### 6.2 User–Keycloak Mapping

- **core.users** has `keycloak_id` (Keycloak user UUID, `sub` claim). For backend logic that needs a `user_id` (e.g. feedback author, task assignee), the application resolves JWT `sub` to `core.users.user_id`. If `sub` is not found (e.g. co-user in Keycloak not yet in DB), a **fallback** may be used in demo (e.g. first active user) so that feedback and tasks still work. For production, users should be synced (Keycloak Admin API or manual seed) so that `keycloak_id` matches.

### 6.3 Meeting–Correspondence Group Linking

- **Junction table:** `core.meeting_correspondence_groups` (meeting_id, cg_id). Only CGs whose `parent_body_id` matches the meeting’s `body_id` can be linked. Backend: `getCorrespondenceGroupsWithAssigned(meetingId)`, `setMeetingCorrespondenceGroups(meetingId, cgIds)`.

---

## 7. Keycloak Integration

### 7.1 Realm and Client

- **Realm:** `isep-realm`  
- **Client:** `isep-web` (confidential; client secret used for token exchange).  
- **Realm roles:** SYSTEM_ADMIN, IC_DIVISION_HEAD, DELEGATION_LEADER, COORDINATOR, MEMBER, VIEWER. Must be assigned to users and included in the access token (e.g. `realm_access.roles`) for frontend RBAC.

### 7.2 Token Endpoints

- **Issuer:** e.g. `http://localhost:8180/realms/isep-realm`  
- **Token URL:** `{issuer}/protocol/openid-connect/token`  
- **JWKS:** `{issuer}/protocol/openid-connect/certs`  
- **Grant:** In development, frontend uses **Resource Owner Password** grant (username/password) to get access_token and id_token. For production, **Authorization Code** flow with redirect is recommended.

### 7.3 Backend JWT Validation

- **Spring Security:** OAuth2 Resource Server with `jwk-set-uri` and `issuer-uri` from Keycloak.  
- **User identity:** `jwt.getSubject()` as user identifier; optional mapping to `core.users` via keycloak_id.  
- **Roles:** Taken from token for optional backend role checks; frontend RBAC is primary for route protection.

### 7.4 Test Users (Development)

Defined in Keycloak realm export (e.g. `infrastructure/keycloak/realm-isep.json`):

| Role | Username | Password (example) |
|------|----------|---------------------|
| SA | admin-sa | Admin@12345! |
| IH | ih-user | Ih@12345! |
| DL | dl-user | Dl@12345! |
| CO | co-user | Co@12345! |
| ME | me-user | Me@12345! |
| VW | vw-user | Vw@12345! |

Ensure realm roles are assigned and token includes them (see infrastructure/keycloak README if token missing realm roles).

---

## 8. File Storage

- **Documents:** Backend stores files on local filesystem or MinIO. `documents.documents` and `documents.document_versions` store minio_bucket and minio_object_key (or equivalent path).  
- **Version 1:** When no row exists in document_versions for version 1, backend resolves version 1 from the main document file. When adding version 2, a version 1 row is created so compare/diff works.  
- **Text extraction:** For compare/diff, backend uses Apache PDFBox and Apache POI to extract plain text from PDF/DOCX; exposed via `GET /api/v1/documents/{id}/versions/{versionNumber}/text`.

---

## 9. Audit and Compliance

- **audit.audit_logs:** Append-only. No foreign keys to application tables. RLS allows INSERT and SELECT.  
- **Sensitive actions:** Login failures, unauthorized access attempts, and critical business actions should be logged (action_type, entity_type, entity_id, description, user_id, timestamp).  
- **Retention and access:** Policy-defined; report via `GET /api/v1/reports/audit`.

---

## 10. Integration Summary

| System | Integration type | Notes |
|--------|------------------|--------|
| **Keycloak** | OIDC, JWT | Identity; realm roles for RBAC; token validation at backend |
| **PostgreSQL** | JDBC, JPA | Single database; multi-schema; migrations V1–V12 |
| **File store** | Local / MinIO | Document and version binaries; path/key in DB |
| **Kong** | Optional gateway | Route /api/v1/* to meeting-service; not required for dev |
| **Frontend** | REST, JSON, Bearer JWT | Next.js server/client components and server actions call backend with access token |

---

## 11. Document Index (Multi-Part TDD)

| Part | Title |
|------|--------|
| Part 1 | Overview & Architecture |
| Part 2 | Backend & APIs |
| Part 3 | Frontend & UX |
| Part 4 | Data & Integration (this document) |

---

*End of Part 4.*
