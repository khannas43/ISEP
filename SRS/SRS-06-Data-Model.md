# SRS-06 — Data Model
**Project:** IMO Strategic Engagement Platform (ISEP)
**Version:** 2.1
**Date:** 04 April 2026

> **Change log v2.1:** `audit.audit_logs` table updated — added `ip_address`, `device_type`, `user_agent` columns (F-05, B-01, NFR-8). Elasticsearch index references updated to OpenSearch (C-02).

---

## 1. PostgreSQL Schema Overview

All tables use UUID primary keys. Row-Level Security (RLS) policies enforced at schema level. Timestamps in UTC.

---

## 2. Core Tables

### 2.1 users

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `email` | VARCHAR(255) UNIQUE | Official/government email |
| `full_name` | VARCHAR(255) | |
| `role` | ENUM | SYSTEM_ADMIN, IC_DIVISION_HEAD, DELEGATION_LEADER, COORDINATOR, MEMBER, VIEWER |
| `is_active` | BOOLEAN | |
| `keycloak_id` | VARCHAR(255) | Keycloak user reference |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### 2.2 committees

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | VARCHAR(255) | e.g. MSC, MEPC, HTW |
| `parent_id` | UUID FK → committees | For sub-committees |
| `type` | ENUM | COMMITTEE, SUB_COMMITTEE, WORKING_GROUP, OTHER |
| `organisation` | ENUM | IMO, ILO, IMSO, BILATERAL, REGIONAL |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |

### 2.3 meetings

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `committee_id` | UUID FK → committees | |
| `title` | VARCHAR(500) | |
| `session_number` | VARCHAR(50) | e.g. MSC 108 |
| `location` | VARCHAR(255) | |
| `start_date` | DATE | |
| `end_date` | DATE | |
| `status` | ENUM | UPCOMING, ACTIVE, COMPLETED, CANCELLED |
| `mopw_approval_required` | BOOLEAN | Configurable MoPSW step — see OI-001 |
| `created_at` | TIMESTAMPTZ | |

### 2.4 agenda_items

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `meeting_id` | UUID FK → meetings | |
| `item_number` | VARCHAR(50) | e.g. 4.1, 4.2 |
| `title` | VARCHAR(500) | |
| `description` | TEXT | |
| `assigned_group_id` | UUID FK → groups | |
| `created_at` | TIMESTAMPTZ | |

### 2.5 documents

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `meeting_id` | UUID FK → meetings | |
| `agenda_item_id` | UUID FK → agenda_items | |
| `committee_id` | UUID FK → committees | |
| `title` | VARCHAR(500) | |
| `file_name` | VARCHAR(255) | |
| `minio_object_key` | VARCHAR(1000) | MinIO storage path |
| `file_size_bytes` | BIGINT | Max 100MB |
| `mime_type` | VARCHAR(100) | |
| `version` | INTEGER | Auto-incremented |
| `status` | ENUM | DRAFT, UNDER_REVIEW, APPROVED, FINALIZED, LOCKED |
| `is_locked` | BOOLEAN | True after finalisation |
| `uploaded_by` | UUID FK → users | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### 2.6 tasks

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `meeting_id` | UUID FK → meetings | |
| `agenda_item_id` | UUID FK → agenda_items | Task must be linked to agenda |
| `document_id` | UUID FK → documents | Optional — task may be linked to document |
| `title` | VARCHAR(500) | |
| `description` | TEXT | |
| `created_by` | UUID FK → users | Leader or coordinator |
| `assigned_to` | UUID[] | Array of user UUIDs |
| `due_date` | DATE | |
| `priority` | ENUM | HIGH, MEDIUM, LOW |
| `status` | ENUM | PENDING, IN_PROGRESS, COMPLETED, ESCALATED, OVERDUE |
| `escalated_at` | TIMESTAMPTZ | Set when auto-escalation triggers |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### 2.7 papers (paper approval workflow)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `document_id` | UUID FK → documents | |
| `meeting_id` | UUID FK → meetings | |
| `agenda_item_id` | UUID FK → agenda_items | |
| `current_stage` | ENUM | DRAFT, GROUP_LEADER, DELEGATION_LEADER, IC_DIVISION, CS_NA_CSS, DG, MOPSW, FINALIZED |
| `mopsw_step_active` | BOOLEAN | Configurable — controls whether MOPSW stage is in the chain |
| `is_locked` | BOOLEAN | True after FINALIZED |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### 2.8 paper_approvals

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `paper_id` | UUID FK → papers | |
| `stage` | ENUM | Matches paper.current_stage enum |
| `approver_id` | UUID FK → users | |
| `action` | ENUM | APPROVE, REJECT, RETURN |
| `comments` | TEXT | |
| `acted_at` | TIMESTAMPTZ | |

### 2.9 feedback

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `document_id` | UUID FK → documents | |
| `agenda_item_id` | UUID FK → agenda_items | |
| `meeting_id` | UUID FK → meetings | |
| `submitted_by` | UUID FK → users | |
| `feedback_type` | ENUM | DOCUMENT_COMMENT, STRUCTURED_FEEDBACK, TRACK_CHANGE |
| `content` | TEXT | |
| `is_archived` | BOOLEAN | Historical archive flag |
| `created_at` | TIMESTAMPTZ | |

### 2.10 groups

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `meeting_id` | UUID FK → meetings | |
| `agenda_item_id` | UUID FK → agenda_items | |
| `name` | VARCHAR(255) | |
| `type` | ENUM | WORKING_GROUP, CORRESPONDENCE_GROUP |
| `created_by` | UUID FK → users | |
| `created_at` | TIMESTAMPTZ | |

### 2.11 group_members

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `group_id` | UUID FK → groups | |
| `user_id` | UUID FK → users | |
| `role` | ENUM | CONVENER, COORDINATOR, MEMBER | |
| `joined_at` | TIMESTAMPTZ | |

---

## 3. Audit Logs Table (Updated v2.1)

### 3.1 audit.audit_logs

> **v2.1 change:** `ip_address`, `device_type`, and `user_agent` columns added. All three are mandatory per RFP Section 3.16H. All services must capture and persist these fields on every auditable action.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | Authenticated user |
| `user_role` | VARCHAR(50) | Role at time of action |
| `action` | ENUM | LOGIN, LOGOUT, UPLOAD, DOWNLOAD, EDIT, APPROVE, REJECT, SUBMIT, DELETE, VIEW, ESCALATE, LOCK |
| `entity_type` | VARCHAR(100) | Document, Task, Paper, Comment, Meeting, etc. |
| `entity_id` | UUID | ID of the acted-upon object |
| `timestamp` | TIMESTAMPTZ | UTC — indexed |
| `ip_address` | VARCHAR(45) | **NEW v2.1** — IPv4 or IPv6 |
| `device_type` | VARCHAR(50) | **NEW v2.1** — DESKTOP, TABLET, MOBILE, UNKNOWN |
| `user_agent` | TEXT | **NEW v2.1** — full browser/device user agent string |
| `outcome` | ENUM | SUCCESS, FAILURE |
| `details` | JSONB | Additional context — change diffs, rejection reasons, etc. |

**Indexes:** `user_id`, `timestamp`, `entity_type + entity_id`, `action`

**Retention:** As per Government norms — minimum 3 years.

**Immutability:** Audit logs are append-only. No UPDATE or DELETE permitted. Enforce via PostgreSQL RLS policy and service-layer restriction.

---

## 4. OpenSearch Index Definitions

> **v2.1:** All index definitions updated — Elasticsearch replaced with OpenSearch 2.x. Index structure is compatible with OpenSearch 2.x and Elasticsearch 7.10 API.

### 4.1 documents_index

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": { "type": "text", "analyzer": "standard" },
      "committee_id": { "type": "keyword" },
      "meeting_id": { "type": "keyword" },
      "agenda_item_id": { "type": "keyword" },
      "status": { "type": "keyword" },
      "uploaded_by": { "type": "keyword" },
      "created_at": { "type": "date" },
      "file_content": { "type": "text", "analyzer": "standard" }
    }
  }
}
```

### 4.2 feedback_index

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "document_id": { "type": "keyword" },
      "agenda_item_id": { "type": "keyword" },
      "meeting_id": { "type": "keyword" },
      "submitted_by": { "type": "keyword" },
      "feedback_type": { "type": "keyword" },
      "content": { "type": "text", "analyzer": "standard" },
      "created_at": { "type": "date" }
    }
  }
}
```

### 4.3 audit_logs_index

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "user_role": { "type": "keyword" },
      "action": { "type": "keyword" },
      "entity_type": { "type": "keyword" },
      "entity_id": { "type": "keyword" },
      "timestamp": { "type": "date" },
      "ip_address": { "type": "ip" },
      "device_type": { "type": "keyword" },
      "user_agent": { "type": "text" },
      "outcome": { "type": "keyword" }
    }
  }
}
```
