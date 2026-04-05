# ISEP Test Cases — TC-02: Paper Drafting & 7-Stage Approval Chain
> **Document Ref:** ISEP-TC-02 | **Version:** 1.0 | **Layer:** L2 (JUnit) + L3 (Testcontainers) + L5 (Playwright)  
> **Format:** Step-by-step numbered (UAT style) | **Depth:** Full detail  
> **Classification:** CONFIDENTIAL

---

## Approval Chain Reference

```
DRAFT → GROUP_LEADER_REVIEW → DELEGATION_LEADER_REVIEW → IC_DIVISION_REVIEW
      → CS_NA_REVIEW → CSS_REVIEW → DG_REVIEW → FINALIZED
```

**Rules:**
- No stage can be skipped
- Any stage can "Return for Revision" → status reverts to `DRAFT`
- Only `FINALIZED` papers can be formally submitted to IMO
- All AI-generated content lands as `DRAFT` — never auto-advances

---

## Category 1 — Paper Creation

### TC-02-PAPER-001: COORDINATOR Creates New Paper
**Tool:** Playwright E2E + JUnit  
**Priority:** Critical  
**Screen:** SCR-PAPER-01  
**Precondition:** Meeting "Sea Fire Fighting" loaded; Agenda Item 4 (HIGH PRIORITY) active

**Steps:**
1. Login as `coord.test`
2. Navigate to a meeting (e.g. Sea Fire Fighting), open **Agenda** tab, open an agenda item (e.g. Item 4 — Fire Safety Systems), and use the link to create a paper for that item; or go to **Papers** (`/papers`) and create from there if the UI provides it. Paper creation may be from **Meetings → {meeting} → Agenda tab → agenda item → Create/link paper** leading to draft at `/papers/{paperId}/draft`.
3. Fill in:
   - Title: `India's Position on Sea Fire Fighting Equipment Standards`
   - Paper Type: `Working Paper`
   - Agenda Item: `Item 4 — Fire Safety Systems`
   - Abstract: `This paper proposes amendments to SOLAS Chapter II-2...`
4. Upload supporting document (PDF, < 10MB)
5. Click **Save as Draft**

**Expected Output:**
- Paper created with status `DRAFT`
- Paper ID assigned (UUID; may be shown as short id or full UUID)
- Audit log entry: `Created by coord.test at [timestamp]`
- Paper visible in `My Papers` list with status badge `DRAFT`
- Upload stored in MinIO; filename preserved

**Edge Cases:**
- Title > 500 chars → inline validation error
- Unsupported file type (e.g., `.exe`) → "Only PDF, DOCX, XLSX allowed"
- File > 10MB → "File size exceeds 10MB limit"
- Duplicate title on same agenda item → warning (not block): "A paper with this title exists"

---

### TC-02-PAPER-002: MEMBER Cannot Create Paper
**Tool:** Playwright E2E  
**Priority:** Critical

**Steps:**
1. Login as `member1.test`
2. Attempt direct navigation to a paper-creation URL (e.g. new paper from agenda if restricted, or `/papers` create flow)

**Expected Output:**
- Redirect to `/unauthorized` or no create option visible
- No paper creation form rendered

---

### TC-02-PAPER-003: Draft Auto-Save
**Tool:** Playwright E2E  
**Priority:** Medium  
**Precondition:** Paper creation form open

**Steps:**
1. Login as `coord.test`
2. Open paper creation or draft screen (e.g. from meeting agenda item or `/papers`)
3. Type in title field: `Draft Auto Save Test Paper`
4. Wait 30 seconds without clicking Save
5. Refresh browser

**Expected Output:**
- On refresh, form shows previously typed title (auto-saved to localStorage/sessionStorage or server-side draft)
- Status remains `DRAFT` — no formal paper record created until explicit Save

---

## Category 2 — Stage 1: DRAFT → GROUP_LEADER_REVIEW

### TC-02-CHAIN-001: COORDINATOR Submits to Group Leader
**Tool:** Playwright E2E + JUnit  
**Priority:** Critical

**Steps:**
1. Login as `coord.test`
2. Open a paper in `DRAFT` status (from **Papers** list or meeting agenda; use paper UUID from seed or list)
3. Click **Submit to Group Leader** (or equivalent submit action)
4. Confirm dialog: "Are you sure you want to submit this paper for Group Leader review?"
5. Click **Confirm**

**Expected Output:**
- Paper status changes to `GROUP_LEADER_REVIEW`
- Notification sent to Group Leader user
- Paper is now read-only for `COORDINATOR`
- Audit log: `Submitted to Group Leader by coord.test at [timestamp]`
- `Submit to Group Leader` button replaced by `Recall from Review` (available for 30 min)

**Edge Cases:**
- Submit paper with empty abstract → block: "Abstract is required before submission"
- Submit paper with no supporting document when agenda item is HIGH PRIORITY → warning popup (not block)

---

### TC-02-CHAIN-002: COORDINATOR Cannot Skip to DG
**Tool:** JUnit (service layer)  
**Priority:** Critical

**Steps:**
1. Set security context: `@WithMockUser(roles = "COORDINATOR")`
2. Create paper with status `DRAFT`
3. Call `paperApprovalService.submitToDG(paperId)`

**Expected Output:**
- Throws `InvalidStateTransitionException`
- Message: `"Cannot transition from DRAFT to DG_REVIEW. Expected next stage: GROUP_LEADER_REVIEW"`
- No database state change

---

## Category 3 — Stage 2: GROUP_LEADER_REVIEW → DELEGATION_LEADER_REVIEW

### TC-02-CHAIN-003: Group Leader Approves and Forwards
**Tool:** Playwright E2E  
**Priority:** Critical  
**Precondition:** Paper (use paper UUID from list) in `GROUP_LEADER_REVIEW` status

**Steps:**
1. Login as Group Leader user (assign role via SYSTEM_ADMIN)
2. Navigate to paper review/approval (e.g. **Papers** → open paper → **Approval** or `/papers/{paperId}/approval`)
3. Review content
4. Add review comment: "Good position. Recommend strengthening para 3."
5. Click **Approve & Forward to Delegation Leader**

**Expected Output:**
- Status changes to `DELEGATION_LEADER_REVIEW`
- Comment saved and visible in paper history
- Delegation Leader receives notification
- Group Leader's action logged in audit trail

---

### TC-02-CHAIN-004: Group Leader Returns for Revision
**Tool:** Playwright E2E  
**Priority:** High

**Steps:**
1. Login as Group Leader
2. Open paper in `GROUP_LEADER_REVIEW`
3. Click **Return for Revision**
4. Enter mandatory return reason: `"Section 2 needs updated statistics from 2026 IMO report"`
5. Click **Confirm Return**

**Expected Output:**
- Paper status reverts to `DRAFT`
- COORDINATOR receives notification with return reason
- Return reason visible in paper history
- Paper is editable again by COORDINATOR

**Edge Cases:**
- Return without entering reason → block: "Return reason is mandatory"
- Return reason > 1000 chars → validation error

---

## Category 4 — Stage 3: DELEGATION_LEADER_REVIEW

### TC-02-CHAIN-005: Delegation Leader Approves
**Tool:** Playwright E2E  
**Priority:** Critical  
**Screen:** SCR-PAPER-02

**Steps:**
1. Login as `dl.test`
2. Navigate to paper review (e.g. `/papers/{paperId}/approval` or Papers list → open paper)
3. Review consolidated position (if AI Draft Assistant was used, review DRAFT output)
4. Edit any AI-generated content if needed (content is in DRAFT — editable)
5. Click **Approve & Forward to IC Division**

**Expected Output:**
- Status changes to `IC_DIVISION_REVIEW`
- IC Division Head receives notification
- DL's approval recorded with timestamp
- If AI content was edited: `AI_DRAFT_MODIFIED` flag set in audit log

---

### TC-02-CHAIN-006: Delegation Leader Requests Consolidated Position First
**Tool:** JUnit + Playwright  
**Priority:** High  
**Precondition:** Paper in `DELEGATION_LEADER_REVIEW` but COORDINATOR has not yet consolidated feedback

**Steps:**
1. Login as `dl.test`
2. Attempt to approve paper where `consolidated_position_id = NULL`
3. Click **Approve & Forward to IC Division**

**Expected Output:**
- Warning shown: "Coordinator has not yet consolidated team feedback for this agenda item. Proceed anyway?"
- DL can override with confirmation (not blocked — DL has authority)
- Override action logged: `"DL approved without consolidated position: [reason]"`

---

## Category 5 — Stages 4–6: IC Division → CS/NA → CSS

### TC-02-CHAIN-007: IC Division Head Reviews
**Tool:** Playwright E2E  
**Priority:** High

**Steps:**
1. Login as `icdh.test`
2. Navigate to pending approvals dashboard
3. Open the paper in `IC_DIVISION_REVIEW` (from Papers list or approval queue)
4. Review paper + all previous stage comments
5. Click **Approve & Forward to CS/NA**

**Expected Output:**
- Status: `CS_NA_REVIEW`
- Full history of all previous stage comments visible on review screen
- CS/NA officer notified

---

### TC-02-CHAIN-008: Complete Stages 4 and 5 (CS/NA and CSS)
**Tool:** Playwright E2E  
**Priority:** Medium  
**Note:** Repeat approval pattern for CS/NA and CSS stages — same flow as IC Division

**Steps:**
1. Login as CS/NA officer
2. Approve from `CS_NA_REVIEW` → `CSS_REVIEW`
3. Login as CSS officer
4. Approve from `CSS_REVIEW` → `DG_REVIEW`

**Expected Output per stage:**
- Correct status transition
- Previous approver notified of progression
- All stage comments accumulate in paper history

---

## Category 6 — Stage 7: DG_REVIEW → FINALIZED

### TC-02-CHAIN-009: DG Approves — Paper Finalized
**Tool:** Playwright E2E  
**Priority:** Critical

**Steps:**
1. Login as DG user
2. Navigate to paper review (e.g. `/papers/{paperId}/approval`)
3. Review full paper + all stage comments (6 previous stages visible)
4. Click **Finalize Paper**
5. Confirm dialog: "This action will finalize the paper for IMO submission. This cannot be undone."
6. Click **Confirm Finalize**

**Expected Output:**
- Status: `FINALIZED`
- Paper locked — no further edits permitted by any role
- `Submit to IMO` button becomes active on paper detail screen
- Finalization certificate generated (PDF with DG approval timestamp)
- All participants notified that the paper has been finalized

**Edge Cases:**
- Attempt to edit `FINALIZED` paper → 403 response; UI shows "This paper is finalized and cannot be edited"
- DG returns for revision → status reverts to `DRAFT` (full chain must restart)

---

### TC-02-CHAIN-010: Return from DG — Full Chain Restart
**Tool:** JUnit (state machine)  
**Priority:** High

**Steps:**
1. Paper in `DG_REVIEW` status
2. DG calls `paperApprovalService.returnForRevision(paperId, reason)`

**Expected Output:**
- Status: `DRAFT`
- All previous stage approvals cleared
- `revision_count` incremented (track how many times paper has been through chain)
- COORDINATOR notified to restart process

---

## Category 7 — Concurrent & Edge Case Scenarios

### TC-02-CHAIN-011: Concurrent Edit Prevention
**Tool:** Playwright E2E (two browser contexts)  
**Priority:** High

**Steps:**
1. Login as `coord.test` in Browser A — open paper edit screen
2. Login as another COORDINATOR in Browser B — open same paper
3. Browser A edits title and saves
4. Browser B attempts to save different changes

**Expected Output:**
- Browser B receives: "This paper was modified by coord.test at [time]. Your changes may conflict. Please review and reapply."
- Optimistic lock version mismatch detected
- Browser B's changes NOT silently overwritten

---

### TC-02-CHAIN-012: Full 7-Stage Audit Trail Integrity
**Tool:** JUnit + Testcontainers  
**Priority:** Critical

**Steps:**
1. Run paper through complete 7-stage chain programmatically
2. Query paper audit/history for the paper (e.g. `paper_approval_stages` or equivalent audit table by paper_id UUID)

**Expected Output:**
- Exactly 7 audit entries (one per stage transition)
- Each entry has: `stage_from`, `stage_to`, `actioned_by`, `timestamp`, `comment`
- No gaps in stage sequence
- Timestamps are in chronological order

---

*Document: ISEP-TC-02 | Paper Drafting & Approval Chain | 12 test cases | v1.0*
