# ISEP Test Cases — TC-05: API Contract Tests (All 70 Routes)
> **Document Ref:** ISEP-TC-05 | **Version:** 1.0 | **Layer:** L5 (Playwright API) + L2 (JUnit Spring Boot Test)  
> **Format:** Step-by-step numbered | **Depth:** Full detail  
> **Classification:** CONFIDENTIAL

---

## API Testing Approach

API routes are served by **meeting-service** (and other backends). In development, base URL is typically `http://localhost:8081` (set `NEXT_PUBLIC_API_URL`). If using **Kong CE Gateway**, use `http://localhost:8000`.  
All routes use **API version prefix** `/api/v1/` (e.g. `/api/v1/users`, `/api/v1/meetings`).  
Authentication via **Keycloak JWT Bearer token** in `Authorization` header.  
**Note:** Login/token exchange may be handled by NextAuth (frontend) rather than a direct POST /api/auth/token; use session access token for API tests.

**Standard test pattern for each route:**
1. Obtain JWT for role under test
2. Send HTTP request to Kong CE route
3. Assert: HTTP status, response schema, RBAC enforcement

**Roles tested per route:**  
✅ = permitted | ❌ = must return 403 | ⚠️ = partial (read-only or limited fields)

---

## Category 1 — Authentication API

### TC-05-API-001: POST /api/auth/token
**Tool:** Playwright API  
**Purpose:** Obtain JWT from Keycloak via ISEP backend proxy

**Steps:**
1. POST `{ "username": "coord.test", "password": "Password@123" }`

**Expected Output:**
- HTTP 200
- Body: `{ "access_token": "...", "refresh_token": "...", "expires_in": 300, "token_type": "Bearer" }`
- `access_token` is valid JWT (decodable, `iss` = Keycloak realm URL)

**Edge Cases:**
- Wrong credentials → HTTP 401 `{ "error": "invalid_credentials" }`
- Disabled user → HTTP 401 `{ "error": "account_disabled" }`

---

### TC-05-API-002: POST /api/auth/refresh
**Steps:**
1. POST `{ "refresh_token": "<valid_refresh_token>" }`

**Expected Output:**
- HTTP 200, new `access_token` returned
- Old access token invalidated

**Edge Cases:**
- Expired refresh token → HTTP 401
- Tampered refresh token → HTTP 401

---

### TC-05-API-003: POST /api/auth/logout
**Steps:**
1. POST with valid Bearer token

**Expected Output:**
- HTTP 200 `{ "message": "Logged out successfully" }`
- Keycloak session terminated (verify: subsequent token use → 401)

---

## Category 2 — Users API

**Base path:** `/api/v1/users` (e.g. GET `/api/v1/users`).

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/v1/users` | GET | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| `/api/v1/users` | POST | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/api/v1/users/{id}` | GET | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| `/api/v1/users/{id}` | PUT | ✅ | ❌ | ❌ | ❌ | ⚠️(own) | ❌ |
| `/api/v1/users/{id}` | DELETE | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### TC-05-API-004: GET /api/users — Role Matrix
**Tool:** Playwright API (parametrised)

**Steps:**
1. For each role, obtain token and GET `/api/v1/users`
2. Assert status per table above

**Expected Output:**
- SYSTEM_ADMIN → 200, full user list
- IC_DIVISION_HEAD → 200, limited fields (no password hash, no internal IDs)
- DELEGATION_LEADER → 403
- COORDINATOR → 403
- MEMBER → 403
- VIEWER → 403

---

### TC-05-API-005: POST /api/users — Create User (SYSTEM_ADMIN only)
**Steps:**
1. POST with SYSTEM_ADMIN token: `{ "name": "Test User", "email": "test@dgs.gov.in", "role": "MEMBER", "org_code": "DGS" }`

**Expected Output:**
- HTTP 201 `{ "user_id": "...", "status": "ACTIVE" }`

**Edge Cases:**
- Duplicate email → HTTP 409 `{ "error": "email_already_exists" }`
- Missing required field `role` → HTTP 400 `{ "error": "validation_error", "field": "role" }`
- POST with COORDINATOR token → HTTP 403

---

## Category 3 — Meetings API

**Base path:** `/api/v1/meetings`. Meeting `{id}` is **UUID**.

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/v1/meetings` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/meetings` | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/v1/meetings/{id}` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/meetings/{id}` | PUT/PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/v1/meetings/{id}` | DELETE | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/api/v1/meetings/{id}/participants` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/meetings/{id}/participants` | POST | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### TC-05-API-006: GET /api/meetings — All Roles Permitted
**Steps:**
1. For each of 6 roles, GET `/api/meetings`

**Expected Output (all roles):**
- HTTP 200
- Body: `{ "meetings": [ { "id": "...", "title": "...", "status": "...", ... } ] }`
- Array is not empty (seed data present)

---

### TC-05-API-007: POST /api/meetings — Schema Validation
**Steps:**
1. ICDH token POST `{ "title": "Test Meeting", "body": "MEPC", "session": 83, "start_date": "2027-10-01", "end_date": "2027-10-05", "location": "London", "type": "IN_PERSON" }`

**Expected Output:**
- HTTP 201
- Body: `{ "meeting_id": "...", "status": "UPCOMING" }`
- Response contains all submitted fields

**Edge Cases:**
- Missing `title` → HTTP 400 `{ "error": "validation_error", "field": "title" }`
- `end_date` < `start_date` → HTTP 400 `{ "error": "invalid_date_range" }`
- POST with COORDINATOR → HTTP 403

---

## Category 4 — Agenda API

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/meetings/{id}/agenda` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/meetings/{id}/agenda` | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/agenda/{id}` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/agenda/{id}` | PUT | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/agenda/{id}` | DELETE | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/agenda/{id}/reorder` | PUT | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### TC-05-API-008: GET /api/meetings/{id}/agenda — Response Schema
**Steps:**
1. GET `/api/v1/meetings/{meetingId}/agenda` with COORDINATOR token (use meeting UUID)

**Expected Output:**
```json
{
  "meeting_id": "<meeting UUID>",
  "agenda_items": [
    {
      "id": "AI-001",
      "item_number": 1,
      "title": "Opening of the session",
      "priority": "LOW",
      "submission_required": false,
      "papers": []
    }
  ]
}
```
- Array has 7 items for Sea Fire Fighting meeting
- Items 4, 5, 7 have `priority: "HIGH"`

---

## Category 5 — Tasks API

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/tasks` | GET | ✅ | ✅ | ✅ | ✅ | ⚠️(own) | ❌ |
| `/api/tasks` | POST | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/tasks/{id}` | GET | ✅ | ✅ | ✅ | ✅ | ⚠️(own) | ❌ |
| `/api/tasks/{id}` | PUT | ✅ | ✅ | ✅ | ✅ | ⚠️(status only) | ❌ |
| `/api/tasks/{id}` | DELETE | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |

### TC-05-API-009: GET /api/tasks — MEMBER Sees Only Own Tasks
**Steps:**
1. Seed 5 tasks: 3 assigned to `member1.test`, 2 assigned to `member2.test`
2. GET `/api/tasks` with `member1.test` token

**Expected Output:**
- HTTP 200
- `tasks` array contains exactly 3 items (assigned to member1.test)
- No tasks from member2.test in response

---

### TC-05-API-010: PUT /api/tasks/{id} — MEMBER Can Only Update Status
**Steps:**
1. MEMBER token, PUT `/api/tasks/T-001` with body `{ "status": "DONE", "completion_note": "Reviewed." }`

**Expected Output:**
- HTTP 200, task status updated

2. MEMBER token, PUT `/api/tasks/T-001` with body `{ "assigned_to": "another.user", "priority": "LOW" }`

**Expected Output:**
- HTTP 403 `{ "error": "Members can only update task status and completion note." }`

---

## Category 6 — Documents API

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/documents` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/documents` | POST (upload) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/documents/{id}` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/documents/{id}/download` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/documents/{id}` | DELETE | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |

### TC-05-API-011: POST /api/documents — File Upload
**Steps:**
1. COORDINATOR token, multipart POST with PDF file

**Expected Output:**
- HTTP 201 `{ "document_id": "...", "filename": "...", "size_bytes": ..., "status": "SCANNING" }`
- File present in MinIO bucket

**Edge Cases:**
- MEMBER token → HTTP 403
- Malicious file type → HTTP 415 `{ "error": "unsupported_media_type" }`
- File > 10MB → HTTP 413 `{ "error": "file_too_large", "max_size_mb": 10 }`

---

### TC-05-API-012: GET /api/documents/{id}/download — Pre-signed URL
**Steps:**
1. Any authenticated role, GET `/api/documents/DOC-001/download`

**Expected Output:**
- HTTP 200 `{ "download_url": "https://minio.../...", "expires_in": 900 }`
- URL is valid MinIO pre-signed URL
- URL expires after 900 seconds

---

## Category 7 — Collaboration & Feedback API

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/collaboration/{agendaItemId}/feedback` | GET | ✅ | ✅ | ✅ | ✅ | ⚠️(own only) | ❌ |
| `/api/collaboration/{agendaItemId}/feedback` | POST | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/api/collaboration/{agendaItemId}/consolidate` | POST | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/collaboration/{agendaItemId}/position` | GET | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/collaboration/{agendaItemId}/position/{id}/approve` | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### TC-05-API-013: GET /api/collaboration/{id}/feedback — Participant Isolation
**Steps:**
1. Seed feedback: 3 items from IND delegation, 2 from GBR delegation
2. GET with MEMBER token (IND delegation)

**Expected Output:**
- HTTP 200
- `feedback` array: exactly 3 items (IND only)
- No GBR feedback present

3. GET with COORDINATOR token (IND delegation)

**Expected Output:**
- HTTP 200
- `feedback` array: all 5 items (COORDINATOR sees all for consolidation)

---

### TC-05-API-014: POST /api/collaboration/{id}/consolidate — Schema
**Steps:**
1. COORDINATOR token, POST `{ "consolidated_text": "India supports...", "feedback_ids": ["F-001", "F-002", "F-003"] }`

**Expected Output:**
- HTTP 201 `{ "position_id": "CP-004", "status": "PENDING_DL_REVIEW" }`
- All referenced feedback IDs linked to consolidated position

---

## Category 8 — Papers API

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/papers` | GET | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| `/api/papers` | POST | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/papers/{id}` | GET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/papers/{id}` | PUT | ✅ | ✅ | ✅ | ✅(DRAFT) | ❌ | ❌ |
| `/api/papers/{id}/submit` | POST | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/papers/{id}/approve` | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/api/papers/{id}/return` | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/api/papers/{id}/finalize` | POST | ✅(DG) | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/api/papers/{id}/history` | GET | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/papers/{id}/comments` | GET | ✅ | ✅ | ✅ | ✅ | ⚠️(own) | ❌ |
| `/api/papers/{id}/comments` | POST | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ |

### TC-05-API-015: POST /api/papers/{id}/submit — State Machine Enforcement
**Steps:**
1. Create paper with status `DRAFT`
2. COORDINATOR token, POST `/api/papers/WP-001/submit` `{ "target_stage": "GROUP_LEADER_REVIEW" }`

**Expected Output:**
- HTTP 200 `{ "paper_id": "WP-001", "new_status": "GROUP_LEADER_REVIEW" }`

3. Same paper, POST `/api/papers/WP-001/submit` `{ "target_stage": "DG_REVIEW" }` (skip stages)

**Expected Output:**
- HTTP 422 `{ "error": "invalid_stage_transition", "message": "Cannot transition from GROUP_LEADER_REVIEW to DG_REVIEW" }`

---

### TC-05-API-016: POST /api/papers/{id}/finalize — DG Only
**Steps:**
1. Paper in `DG_REVIEW` status
2. POST `/api/papers/WP-001/finalize` with DG JWT

**Expected Output:**
- HTTP 200 `{ "status": "FINALIZED", "finalized_at": "..." }`

3. POST same endpoint with DELEGATION_LEADER JWT

**Expected Output:**
- HTTP 403

---

## Category 9 — AI Features API

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/ai/position-advisor` | POST | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/ai/preparedness-score/{id}` | GET | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/ai/draft-submission` | POST | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

> Full test cases in TC-03. API contract assertions here:

### TC-05-API-017: AI Endpoints — Response Always Contains DRAFT Status
**Steps:**
1. Call all three AI endpoints with permitted roles

**Expected Output (all three):**
- Response body always contains `"status": "DRAFT"`
- Response body always contains `"auto_committed": false`
- HTTP 200 on success

---

## Category 10 — Search API

| Route | Method | Roles |
|---|---|---|
| `/api/search` | GET | All authenticated |
| `/api/search/suggest` | GET | All authenticated |

### TC-05-API-018: GET /api/search?q= — RBAC-Filtered Results
**Steps:**
1. Seed: 3 documents for IND delegation (private), 2 public meeting documents
2. GET `/api/search?q=fire+fighting` with MEMBER (IND) token

**Expected Output:**
- HTTP 200
- Results include IND private documents + public meeting documents
- NO results from other delegations' private documents

3. Same query with VIEWER token

**Expected Output:**
- Only public meeting documents in results
- No private delegation documents

---

## Category 11 — Notifications API

| Route | Method | Roles |
|---|---|---|
| `/api/notifications` | GET | All authenticated (own only) |
| `/api/notifications/{id}/read` | PUT | Owner only |
| `/api/notifications/read-all` | PUT | All authenticated |

### TC-05-API-019: GET /api/notifications — Own Notifications Only
**Steps:**
1. Seed 5 notifications for `coord.test`, 3 for `dl.test`
2. GET `/api/notifications` with `coord.test` token

**Expected Output:**
- HTTP 200, array of 5 notifications
- No `dl.test` notifications in response

---

## Category 12 — Audit API

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/audit` | GET | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/audit/export` | GET | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### TC-05-API-020: GET /api/audit — RBAC Strict Enforcement
**Steps:**
1. GET `/api/audit` with each role

**Expected Output:**
- SYSTEM_ADMIN → 200, full audit log
- IC_DIVISION_HEAD → 200, meeting-scoped audit entries
- DELEGATION_LEADER → 403
- COORDINATOR → 403
- MEMBER → 403
- VIEWER → 403

---

## Category 13 — Reports API

| Route | Method | SA | ICDH | DL | CO | MB | VW |
|---|---|---|---|---|---|---|---|
| `/api/reports/meeting-readiness` | POST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/reports/task-summary` | GET | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/api/reports/export/{id}` | GET | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### TC-05-API-021: POST /api/reports/meeting-readiness
**Steps:**
1. ICDH token, POST `{ "meeting_id": "<meeting UUID>", "format": "PDF" }`

**Expected Output:**
- HTTP 202 `{ "report_id": "RPT-001", "status": "GENERATING" }`
- GET `/api/reports/export/RPT-001` after generation → HTTP 200, PDF download URL

---

## Category 14 — Health & System API

| Route | Method | Roles |
|---|---|---|
| `/api/health` | GET | Public (no auth) |
| `/api/health/detailed` | GET | SYSTEM_ADMIN |
| `/api/system/config` | GET | SYSTEM_ADMIN |
| `/api/system/config` | PUT | SYSTEM_ADMIN |

### TC-05-API-022: GET /api/health — Public Endpoint
**Steps:**
1. GET `/api/health` with no Authorization header

**Expected Output:**
- HTTP 200 `{ "status": "UP", "version": "1.0.0", "timestamp": "..." }`
- No authentication required

---

### TC-05-API-023: Kong CE Gateway — Rate Limiting
**Steps:**
1. Send 100 requests to `/api/meetings` within 60 seconds from single IP

**Expected Output:**
- First 60 requests → HTTP 200
- Requests 61–100 → HTTP 429 `{ "message": "API rate limit exceeded" }` with `Retry-After` header

---

### TC-05-API-024: Kong CE — Invalid JWT
**Steps:**
1. GET `/api/meetings` with header `Authorization: Bearer invalid.jwt.token`

**Expected Output:**
- HTTP 401 `{ "message": "Unauthorized" }` (from Kong CE, before reaching Spring Boot)

---

## API Test Summary Matrix

| Category | Routes | Test Cases |
|---|---|---|
| Authentication | 3 | TC-05-API-001 to 003 |
| Users | 5 | TC-05-API-004 to 005 |
| Meetings | 7 | TC-05-API-006 to 007 |
| Agenda | 6 | TC-05-API-008 |
| Tasks | 5 | TC-05-API-009 to 010 |
| Documents | 5 | TC-05-API-011 to 012 |
| Collaboration | 5 | TC-05-API-013 to 014 |
| Papers | 11 | TC-05-API-015 to 016 |
| AI Features | 3 | TC-05-API-017 |
| Search | 2 | TC-05-API-018 |
| Notifications | 3 | TC-05-API-019 |
| Audit | 2 | TC-05-API-020 |
| Reports | 3 | TC-05-API-021 |
| Health & System | 4 | TC-05-API-022 to 024 |
| **Total** | **~70** | **24 contract suites** |

---

*Document: ISEP-TC-05 | API Contracts (70 Routes) | 24 test suites | v1.0*
