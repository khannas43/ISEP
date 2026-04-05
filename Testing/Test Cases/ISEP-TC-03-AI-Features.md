# ISEP Test Cases — TC-03: AI Features (Claude-Powered)
> **Document Ref:** ISEP-TC-03 | **Version:** 1.0 | **Layer:** L4 (Pytest + respx) + L5 (Playwright)  
> **Format:** Step-by-step numbered (UAT style) | **Depth:** Full detail  
> **Classification:** CONFIDENTIAL

**App alignment:** Meeting IDs in API are **UUIDs**. Use `{meetingId}` from meetings list (e.g. Sea Fire Fighting meeting UUID) in endpoints like `GET /api/ai/preparedness-score/{meetingId}`.

---

## AI Features Reference

| Feature | Endpoint | Screen | Trigger |
|---|---|---|---|
| Position Advisor | `POST /api/ai/position-advisor` | SCR-AGN-03 | COORDINATOR/DL requests India's position suggestion |
| Meeting Preparedness Intelligence | `GET /api/ai/preparedness-score/{meetingId}` | SCR-MTG-03 | Auto-runs on dashboard load; manual refresh |
| Submission Draft Assistant | `POST /api/ai/draft-submission` | SCR-COL-02 → SCR-PAPER-02 | DL approves consolidated position |

**Core Safety Invariant (never break):**  
All AI outputs → `status = DRAFT`, `auto_committed = false`  
Human must explicitly save/approve before any AI content enters the approval chain.

---

## Category 1 — Position Advisor (SCR-AGN-03)

### TC-03-AI-001: Position Advisor — Happy Path
**Tool:** Pytest + respx  
**Priority:** Critical

**Precondition:**
- Agenda paper for Item 4 (Sea Fire Fighting) seeded in DB
- India's historical positions for IMO SSE sessions seeded

**Steps:**
1. Prepare POST body:
   ```json
   {
     "agenda_item_id": "AI-004",
     "meeting_id": "<meeting UUID from meetings list>",
     "paper_ids": ["WP-IMO-2024-112", "WP-IMO-2023-087"],
     "requested_by": "coord.test"
   }
   ```
2. Mock Claude API response:
   ```python
   mock_response = {
     "content": [{"type": "text", "text": "Based on India's historical positions on SOLAS Chapter II-2..."}],
     "model": "claude-sonnet-4-20250514",
     "stop_reason": "end_turn"
   }
   ```
3. POST to `/api/ai/position-advisor`

**Expected Output:**
```json
{
  "suggestion_id": "PA-001",
  "status": "DRAFT",
  "auto_committed": false,
  "suggested_position": "Based on India's historical positions on SOLAS Chapter II-2...",
  "confidence_score": 0.82,
  "source_papers_referenced": ["WP-IMO-2024-112", "WP-IMO-2023-087"],
  "generated_at": "<timestamp>",
  "model_used": "claude-sonnet-4-20250514"
}
```
- `status` MUST be `"DRAFT"` — test fails if any other value
- `auto_committed` MUST be `false` — test fails if `true`
- Response time < 5 seconds (mocked)

---

### TC-03-AI-002: Position Advisor — DRAFT Invariant Enforcement
**Tool:** Pytest  
**Priority:** Critical (Safety)

**Steps:**
1. Send valid request to `/api/ai/position-advisor`
2. Check response `status` field
3. Check `auto_committed` field
4. Query database: `SELECT committed FROM ai_suggestions WHERE suggestion_id = 'PA-001'`

**Expected Output:**
- Response `status` = `"DRAFT"`
- Response `auto_committed` = `false`
- DB row: `committed = false`
- No `position_papers` record created automatically
- FastAPI endpoint must NEVER call `positionService.commit()` without explicit human action

---

### TC-03-AI-003: Position Advisor — Claude API Timeout
**Tool:** Pytest + respx  
**Priority:** High

**Steps:**
1. Mock Claude API to raise `httpx.TimeoutException`
2. POST to `/api/ai/position-advisor`

**Expected Output:**
- HTTP 504 response
- Body: `{"error": "AI service timeout. Please try again.", "retry_after": 30}`
- No partial AI suggestion saved to DB
- Error logged in application logs with full traceback

---

### TC-03-AI-004: Position Advisor — Claude API Rate Limit
**Tool:** Pytest + respx  
**Priority:** High

**Steps:**
1. Mock Claude API to return HTTP 429 with `retry-after: 60`
2. POST to `/api/ai/position-advisor`

**Expected Output:**
- HTTP 429 response
- Body: `{"error": "AI service temporarily unavailable. Please try again in 60 seconds.", "retry_after": 60}`
- No DB write

---

### TC-03-AI-005: Position Advisor — Malformed Claude Response
**Tool:** Pytest + respx  
**Priority:** High

**Steps:**
1. Mock Claude API to return `{"content": []}` (empty content array)
2. POST to `/api/ai/position-advisor`

**Expected Output:**
- HTTP 500 response
- Body: `{"error": "AI returned an empty response. Please try again."}`
- Error logged with `suggestion_id` = null
- No DB write

---

### TC-03-AI-006: Position Advisor — Unauthorised Role
**Tool:** Pytest  
**Priority:** Critical

**Steps:**
1. Send request with JWT for role `VIEWER`
2. POST to `/api/ai/position-advisor`

**Expected Output:**
- HTTP 403 response
- Body: `{"error": "Insufficient permissions. Position Advisor requires COORDINATOR or above."}`
- Claude API never called (verify `respx.mock` received 0 calls)

---

### TC-03-AI-007: Position Advisor — UI Integration
**Tool:** Playwright E2E  
**Priority:** High  
**Screen:** SCR-AGN-03

**Steps:**
1. Login as `coord.test`
2. Navigate to `/agenda/AI-004`
3. Click **Get AI Position Suggestion**
4. Wait for loading spinner
5. Observe suggestion panel

**Expected Output:**
- Loading spinner shown during API call
- Suggestion panel appears with content
- Yellow `DRAFT` badge visible on suggestion panel
- Buttons available: `Accept as Draft`, `Edit Suggestion`, `Discard`
- No "Submit" or "Commit" button — only Draft acceptance
- Suggestion text is NOT editable inline without clicking `Edit Suggestion`

**Edge Cases:**
- If API times out → show "AI suggestion unavailable. Try again." with retry button
- If no historical positions found for India on this topic → show "Insufficient historical data. Suggestion may be generic."

---

## Category 2 — Meeting Preparedness Intelligence (SCR-MTG-03)

### TC-03-AI-008: Preparedness Score — Happy Path
**Tool:** Pytest + respx  
**Priority:** Critical

**Precondition:**
- Meeting (e.g. Sea Fire Fighting) with 33 tasks seeded; use meeting UUID
- 7 agenda items, Items 4/5/7 marked HIGH PRIORITY
- 8 participants with various task completion states

**Steps:**
1. Mock Claude API with preparedness analysis response
2. GET `/api/ai/preparedness-score/{meetingId}` (use meeting UUID)

**Expected Output:**
```json
{
  "meeting_id": "<meeting UUID from meetings list>",
  "preparedness_score": 67,
  "status": "DRAFT",
  "auto_committed": false,
  "score_breakdown": {
    "tasks_completed_pct": 72,
    "papers_approved_pct": 33,
    "feedback_consolidated_pct": 57,
    "high_priority_items_ready_pct": 40
  },
  "risk_flags": [
    {"item": "AI-007", "risk": "HIGH", "reason": "No paper submitted for HIGH PRIORITY item"},
    {"item": "AI-005", "risk": "MEDIUM", "reason": "Feedback not yet consolidated"}
  ],
  "recommendations": ["..."],
  "generated_at": "<timestamp>"
}
```
- `preparedness_score` must be integer 0–100
- `status` MUST be `"DRAFT"` — score is advisory only, never committed

---

### TC-03-AI-009: Preparedness Score — 100% Complete Meeting
**Tool:** Pytest  
**Priority:** Medium

**Steps:**
1. Seed meeting where all tasks complete, all papers FINALIZED, all feedback consolidated
2. GET `/api/ai/preparedness-score/M-COMPLETE`

**Expected Output:**
- `preparedness_score` = 100 (or 95–100 range acceptable)
- `risk_flags` = empty array `[]`
- `recommendations` = `["Meeting preparation is complete. Ready for submission."]`

---

### TC-03-AI-010: Preparedness Score — Dashboard Auto-Refresh
**Tool:** Playwright E2E  
**Priority:** High  
**Screen:** SCR-MTG-03

**Steps:**
1. Login as `coord.test`
2. Navigate to dashboard
3. Observe Preparedness Score widget

**Expected Output:**
- Score displayed as circular gauge (0–100)
- Colour coding: 0–40 = red, 41–70 = amber, 71–100 = green
- `DRAFT` label shown beneath score
- Last updated timestamp visible
- `Refresh` button available for manual re-calculation
- Clicking score widget opens drill-down: breakdown by task/paper/feedback

---

### TC-03-AI-011: Preparedness Score — MEMBER Cannot Access
**Tool:** Pytest  
**Priority:** High

**Steps:**
1. Send GET with MEMBER JWT to `/api/ai/preparedness-score/{meetingId}`

**Expected Output:**
- HTTP 403
- Claude API never called

---

## Category 3 — Submission Draft Assistant (SCR-COL-02 → SCR-PAPER-02)

### TC-03-AI-012: Draft Assistant — Happy Path
**Tool:** Pytest + respx  
**Priority:** Critical

**Precondition:**
- DL has approved consolidated position for Agenda Item 4
- `consolidated_position_id = CP-004` exists in DB

**Steps:**
1. Prepare POST body:
   ```json
   {
     "consolidated_position_id": "CP-004",
     "agenda_item_id": "AI-004",
     "meeting_id": "<meeting UUID from meetings list>",
     "paper_type": "WORKING_PAPER",
     "requested_by": "dl.test"
   }
   ```
2. Mock Claude response with formal IMO-style working paper text
3. POST to `/api/ai/draft-submission`

**Expected Output:**
```json
{
  "draft_id": "DA-001",
  "status": "DRAFT",
  "auto_committed": false,
  "paper_type": "WORKING_PAPER",
  "draft_content": {
    "title": "India's Working Paper on Sea Fire Fighting Equipment Standards",
    "submitted_by": "Government of India",
    "executive_summary": "...",
    "sections": [
      {"heading": "Background", "content": "..."},
      {"heading": "Proposal", "content": "..."},
      {"heading": "Action Requested", "content": "..."}
    ]
  },
  "imo_format_compliant": true,
  "generated_at": "<timestamp>"
}
```
- `status` = `"DRAFT"` — absolute invariant
- `auto_committed` = `false` — absolute invariant
- Draft NOT added to paper approval chain until DL explicitly clicks "Use as Draft"

---

### TC-03-AI-013: Draft Assistant — Only DL Can Trigger
**Tool:** Pytest  
**Priority:** Critical

**Steps:**
1. POST to `/api/ai/draft-submission` with COORDINATOR JWT
2. POST to `/api/ai/draft-submission` with MEMBER JWT

**Expected Output (both):**
- HTTP 403
- Body: `{"error": "Submission Draft Assistant can only be triggered by DELEGATION_LEADER or above."}`
- Claude API never called

---

### TC-03-AI-014: Draft Assistant — Requires Consolidated Position
**Tool:** Pytest  
**Priority:** High

**Steps:**
1. POST request where `consolidated_position_id` refers to a position NOT yet approved by DL
2. POST to `/api/ai/draft-submission`

**Expected Output:**
- HTTP 422
- Body: `{"error": "Consolidated position CP-004 is pending DL approval. Draft cannot be generated before approval."}`

---

### TC-03-AI-015: Draft Assistant — UI to Paper Chain Integration
**Tool:** Playwright E2E  
**Priority:** Critical  
**Screen:** SCR-COL-02 → SCR-PAPER-02

**Steps:**
1. Login as `dl.test`
2. Navigate to `/collaboration/AI-004`
3. View consolidated position
4. Click **Generate Submission Draft**
5. Wait for draft to load
6. Review generated draft sections
7. Edit "Proposal" section content
8. Click **Use as Paper Draft**

**Expected Output:**
- Step 4: Loading state with message "Generating formal submission draft..."
- Step 5: Draft panel opens with sections (Background, Proposal, Action Requested)
- Step 5: `DRAFT (AI-Generated)` badge prominently displayed
- Step 7: Section is editable inline
- Step 8: Confirmation: "This draft will be saved and submitted to Group Leader for review. Confirm?"
- After confirm: New paper record created in `GROUP_LEADER_REVIEW` status
- Audit log: `"Paper created from AI Draft DA-001, modified by dl.test"`

**Edge Cases:**
- DL discards draft → no paper record created
- DL generates draft twice → second generation creates new `draft_id`; previous draft retained in history

---

### TC-03-AI-016: All AI Features — Response Time SLA
**Tool:** Pytest (with timing assertions)  
**Priority:** High

**Steps:**
1. For each AI endpoint, record response time with mocked Claude API
2. For each AI endpoint, record response time with real Claude API (integration test only — do not run in CI)

**Expected Output:**

| Endpoint | Mocked (CI) | Real (Integration) |
|---|---|---|
| `/api/ai/position-advisor` | < 500ms | < 8 seconds |
| `/api/ai/preparedness-score/{id}` | < 300ms | < 6 seconds |
| `/api/ai/draft-submission` | < 500ms | < 12 seconds |

---

### TC-03-AI-017: AI Feature Audit Log Completeness
**Tool:** Pytest + Testcontainers  
**Priority:** High

**Steps:**
1. Call all three AI endpoints successfully
2. Query: `SELECT * FROM ai_audit_log ORDER BY created_at`

**Expected Output per call:**
- `feature_name`: `POSITION_ADVISOR` / `PREPAREDNESS_INTELLIGENCE` / `DRAFT_ASSISTANT`
- `requested_by`: username of caller
- `model_used`: `claude-sonnet-4-20250514`
- `status`: `DRAFT`
- `tokens_used`: integer > 0
- `latency_ms`: integer > 0
- `error_code`: null (on success)

---

*Document: ISEP-TC-03 | AI Features | 17 test cases | v1.0*
