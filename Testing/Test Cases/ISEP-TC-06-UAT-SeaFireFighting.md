# ISEP Test Cases — TC-06: UAT Walkthrough — Sea Fire Fighting
> **Document Ref:** ISEP-TC-06 | **Version:** 1.0 | **Layer:** L5 Playwright E2E + Manual UAT  
> **Format:** Step-by-step numbered (UAT style) | **Depth:** Full detail  
> **Classification:** CONFIDENTIAL

**App alignment:** Meeting IDs are UUIDs. Use the **Sea Fire Fighting** meeting from the meetings list and use its UUID in URLs (`/meetings/{uuid}`). Paper IDs are UUIDs; use papers from **Papers** list or created during UAT. Audit log: **Admin → Audit log** (`/admin/audit`). Dashboard: **Dashboard** at `/dashboard/executive`.

---

## UAT Meeting Reference

| Field | Value |
|---|---|
| Meeting Title | Sea Fire Fighting |
| IMO Body | SSE (Sub-Committee on Ship Systems and Equipment) |
| Session | 4 |
| Dates | 2–5 February 2027 |
| Location | Colombo, Sri Lanka |
| Type | In-Person |
| Meeting ID | UUID (from meetings list or seed; use "Sea Fire Fighting" to identify) |
| Total Tasks | 33 |
| Agenda Items | 7 (Items 4, 5, 7 = HIGH PRIORITY) |
| Formal Papers | 3 (walk full 7-stage chain) |

## UAT Participants

| Role | User | Organisation |
|---|---|---|
| SYSTEM_ADMIN | `admin.test` | DGS HQ |
| IC_DIVISION_HEAD | `icdh.test` | DGS HQ |
| DELEGATION_LEADER | `dl.test` | DGS HQ |
| COORDINATOR | `coord.test` | DGS HQ |
| MEMBER | `member1.test` | MMD Mumbai |
| MEMBER | `member2.test` | MMD Chennai |
| MEMBER | `member3.test` | MMD Kolkata |
| VIEWER | `viewer.test` | MoPSW |

---

## Phase 1 — System Setup (Pre-Meeting)

### TC-06-UAT-001: Setup Meeting in ISEP
**Actor:** SYSTEM_ADMIN  
**Tool:** Playwright E2E  

**Steps:**
1. Login as `admin.test`
2. Navigate to `/meetings/create`
3. Enter all meeting details (Title: Sea Fire Fighting, Body: SSE, Session: 4, Dates: 2–5 Feb 2027, Location: Colombo, Type: In-Person)
4. Click **Create Meeting** → verify meeting created and note its ID (UUID)
5. Navigate to meeting **Sea Fire Fighting** (from meetings list) and open **Participants** tab (`/meetings/{meetingId}?tab=participants`)
6. Add all 8 participants with their roles (see table above)
7. Open **Agenda** tab for the meeting (agenda is under meeting: `/meetings/{meetingId}` with Agenda tab)
8. Add all 7 agenda items:
   - Item 1: Opening of the session | LOW | No submission
   - Item 2: Adoption of the agenda | LOW | No submission
   - Item 3: Review of IMO guidelines on fire detection | MEDIUM | No submission
   - Item 4: Fire safety systems — SOLAS Chapter II-2 amendments | HIGH | Submission required
   - Item 5: Fire fighting equipment standards for chemical tankers | HIGH | Submission required
   - Item 6: Correspondence group report | MEDIUM | No submission
   - Item 7: India's proposal on suppression system testing protocols | HIGH | Submission required
9. Mark Items 4, 5, 7 as HIGH PRIORITY with `Submission Required = Yes`

**Expected Output:**
- Meeting **Sea Fire Fighting** visible in meetings list with status `UPCOMING` (meeting has UUID)
- All 8 participants listed with correct roles
- 7 agenda items created; Items 4/5/7 show HIGH PRIORITY red badge
- All 8 participants receive "You have been added to Sea Fire Fighting meeting" notification

---

### TC-06-UAT-002: Upload Reference Documents
**Actor:** COORDINATOR  
**Tool:** Playwright E2E

**Steps:**
1. Login as `coord.test`
2. Navigate to the **Sea Fire Fighting** meeting and open **Documents** tab (or `/meetings/{meetingId}` then Documents / upload)
3. Upload 3 reference documents:
   - `IMO_SSE4_Agenda.pdf` → Category: Meeting Documents
   - `SOLAS_Chapter_II2_Current.pdf` → Category: Reference, Link: Item 4
   - `India_Historical_Positions_SSE.pdf` → Category: Reference, Link: All items
4. Verify all 3 documents uploaded and status = `CLEAN` (after virus scan)

**Expected Output:**
- 3 documents visible in document list
- Files stored in MinIO
- All participants can download reference documents

---

### TC-06-UAT-003: Create 33 Tasks Across 7 Agenda Items
**Actor:** COORDINATOR  
**Tool:** Playwright E2E (or seed via API)

**Sample Tasks (full 33 in seed data):**

| Task | Assigned To | Agenda Item | Due | Priority |
|---|---|---|---|---|
| Review SOLAS Ch II-2 current text | member1.test | Item 4 | 15 Jan 2027 | HIGH |
| Compile India's historical position on fire systems | member2.test | Item 4 | 15 Jan 2027 | HIGH |
| Draft India's amendment proposal | coord.test | Item 4 | 20 Jan 2027 | HIGH |
| Review chemical tanker fire standards | member3.test | Item 5 | 15 Jan 2027 | HIGH |
| Research suppression system testing protocols | member1.test | Item 7 | 20 Jan 2027 | HIGH |
| Prepare Item 3 background note | member2.test | Item 3 | 10 Jan 2027 | MEDIUM |
| Review correspondence group report | dl.test | Item 6 | 25 Jan 2027 | MEDIUM |
| ... (26 more tasks) | | | | |

**Steps:**
1. Create all 33 tasks via the meeting's **Tasks** tab and **New task** (e.g. `/meetings/{meetingId}/tasks/new` or in-meeting task creation)
2. Verify each member receives their task notifications
3. Check Dashboard (Executive Dashboard) or meeting preparedness (expected: low at start — most tasks pending)

**Expected Output:**
- 33 tasks visible in task list, distributed across 7 agenda items
- Each assigned member sees their tasks in My Tasks widget
- Preparedness Score: ~15 (red)

---

## Phase 2 — Pre-Meeting Preparation (Weeks 1–3)

### TC-06-UAT-004: Members Complete Assigned Tasks
**Actor:** MEMBER (member1, member2, member3)  
**Tool:** Playwright E2E

**Steps (repeat for each member and their tasks):**
1. Login as `member1.test`
2. Navigate to My Tasks
3. Open task: `Review SOLAS Ch II-2 current text`
4. Add completion note: `Reviewed. Key issue: Regulation 10.4 specifies outdated sprinkler standards. Recommend update to align with 2024 NFPA 13.`
5. Click **Mark Complete**
6. Open task: `Research suppression system testing protocols`
7. Add completion note: `Found 3 key international standards: ISO 15371, USCG CG-522, IMO MSC/Circ.1312. India should propose alignment.`
8. Click **Mark Complete**
9. Repeat for member2.test and member3.test tasks

**Expected Output per task:**
- Task status: `DONE`
- Completion note saved
- COORDINATOR notified
- Preparedness Score increases with each completion
- After all 33 tasks: Preparedness Score ~65 (amber) — papers not yet submitted

---

### TC-06-UAT-005: Members Submit Feedback on Agenda Items
**Actor:** MEMBER  
**Tool:** Playwright E2E  
**Screen:** SCR-COL-01

**Steps:**
1. Login as `member1.test`
2. Navigate to `/collaboration/AI-004` (Item 4)
3. Click **Add Feedback**
4. Type: `India should strongly support SOLAS Ch II-2 amendments. Specifically, Regulation 10.4 should reference ISO 15371:2015 instead of the 2001 version. Additionally, Phase 2 implementation timeline should be extended to 2030 to allow Indian flagged vessels time to comply.`
5. Submit feedback
6. Navigate to `/collaboration/AI-005` (Item 5)
7. Submit: `India supports enhanced fire fighting equipment standards for chemical tankers. Our position: Foam application rates in Table 5.4 should be increased by 15% based on our port incident data from 2023-2026.`
8. Navigate to `/collaboration/AI-007` (Item 7)
9. Submit: `India proposes adoption of a standardised testing protocol. Reference our paper to be submitted. Key ask: annual testing requirement with third-party certification.`
10. Login as `member2.test` and `member3.test` — submit their feedback on Items 4, 5, 7

**Expected Output per submission:**
- Feedback saved, visible only to submitting member and COORDINATOR
- Other members CANNOT see each other's feedback
- COORDINATOR receives notification per feedback item
- Feedback count badge shown on agenda item for COORDINATOR

---

### TC-06-UAT-006: Position Advisor — AI Suggestion for Item 4
**Actor:** COORDINATOR  
**Tool:** Playwright E2E + Pytest (automated)  
**Screen:** SCR-AGN-03

**Steps:**
1. Login as `coord.test`
2. Navigate to `/agenda/AI-004`
3. Click **Get AI Position Suggestion**
4. Wait for loading (~3–8 seconds with real Claude API)
5. Review AI suggestion panel

**Expected Output:**
- AI suggestion displayed with `DRAFT (AI-Generated)` badge
- Suggestion references India's historical positions on SOLAS fire safety
- Confidence score displayed (e.g., 82%)
- Source documents referenced: `India_Historical_Positions_SSE.pdf`, relevant agenda papers
- Buttons: `Accept as Draft`, `Edit Suggestion`, `Discard`

6. Click **Edit Suggestion**
7. Add to suggestion: `Additionally, India requests that Phase 2 timeline be extended to 2030.`
8. Click **Accept as Draft**

**Expected Output:**
- Position suggestion saved as DRAFT for Item 4
- Marked as `AI_DRAFT_MODIFIED` in audit log (human edited AI output)
- Not yet submitted for DL review

---

### TC-06-UAT-007: Repeat AI Position for Items 5 and 7
**Actor:** COORDINATOR

**Steps:** (same as TC-06-UAT-006 for Items 5 and 7)

**Expected Output:**
- 3 AI position suggestions in DRAFT for Items 4, 5, 7
- All tagged `DRAFT`, none auto-committed

---

## Phase 3 — Feedback Consolidation

### TC-06-UAT-008: COORDINATOR Consolidates Feedback — Item 4
**Actor:** COORDINATOR  
**Tool:** Playwright E2E  
**Screen:** SCR-COL-01

**Steps:**
1. Login as `coord.test`
2. Navigate to `/collaboration/AI-004`
3. View all 3 members' feedback (member1, member2, member3) — visible to COORDINATOR
4. Review AI position suggestion (DRAFT)
5. Click **Consolidate Feedback**
6. Draft consolidated position incorporating all feedback + AI suggestion:
   ```
   India's Position on Agenda Item 4 (Sea Fire Fighting):
   
   India SUPPORTS the proposed SOLAS Chapter II-2 amendments with the following conditions:
   1. Regulation 10.4: Update reference standard from 2001 to ISO 15371:2015
   2. Table 5.4: Increase foam application rates by 15%
   3. Phase 2 implementation: Extend timeline to 2030 for developing nations
   4. Testing protocols: Annual testing with third-party certification (per India's upcoming paper)
   
   Source: Feedback from DGS, MMD Mumbai, MMD Chennai, MMD Kolkata; AI Position Advisor (modified)
   ```
7. Click **Submit for DL Review**

**Expected Output:**
- Consolidated position `CP-004` created with status `PENDING_DL_REVIEW`
- `dl.test` notified: "Consolidated position for Item 4 ready for your review"
- Individual member feedback now locked (no further edits)
- Preparedness Score increases

8. Repeat consolidation for Items 5 and 7

---

### TC-06-UAT-009: DELEGATION_LEADER Reviews and Approves Consolidated Positions
**Actor:** DELEGATION_LEADER  
**Tool:** Playwright E2E  
**Screen:** SCR-COL-02

**Steps:**
1. Login as `dl.test`
2. Navigate to pending approvals — 3 consolidated positions pending
3. Open `CP-004` (Item 4)
4. Review consolidated text
5. Add DL note: "Approved. Emphasis on 2030 timeline is strategically important."
6. Click **Approve Consolidated Position**
7. Repeat for CP-005 and CP-007

**Expected Output:**
- All 3 consolidated positions → status `DL_APPROVED`
- `Generate Submission Draft` button now active for all 3
- COORDINATOR notified of all approvals
- Preparedness Score now ~80% (amber→green transition)

---

## Phase 4 — Paper Preparation (3 Formal Papers)

### TC-06-UAT-010: Draft Assistant — Generate Paper for Item 4
**Actor:** DELEGATION_LEADER  
**Tool:** Playwright E2E  
**Screen:** SCR-COL-02 → SCR-PAPER-01

**Steps:**
1. Login as `dl.test`
2. Navigate to `/collaboration/AI-004`
3. Click **Generate Submission Draft** (enabled after CP-004 approved)
4. Select paper type: `Working Paper`
5. Wait for AI Draft Assistant (~8–12 seconds)
6. Review generated sections: Background, India's Position, Proposals, Action Requested
7. Edit "Proposals" section: Add specific regulation text for Regulation 10.4 update
8. Review formatting (IMO style: `INDIA/WP.N/SSE 4`)
9. Click **Use as Paper Draft**
10. Confirm: "This will create a formal paper and submit to Group Leader for review."

**Expected Output:**
- New paper created (paper UUID assigned)
- Status: `GROUP_LEADER_REVIEW`
- Paper visible in **Papers** list (filter by meeting if needed)
- Audit log: `"Paper created from AI Draft DA-001, modified by dl.test"`
- Group Leader user notified

11. Repeat for Items 5 and 7 → two more papers created (note paper IDs for approval chain)

---

### TC-06-UAT-011: Full 7-Stage Approval — First Paper (Item 4)
**Tool:** Playwright E2E  
**Priority:** Critical UAT

**Stage 1 — Group Leader Review:**
1. Login as Group Leader
2. Open the paper created for Item 4 (from Papers list or meeting agenda)
3. Review content; add comment: "Strong position. Para 3 needs regulation citation."
4. Click **Approve & Forward to Delegation Leader**
5. Verify status: `DELEGATION_LEADER_REVIEW`

**Stage 2 — Delegation Leader Review:**
1. Login as `dl.test`
2. Open the paper created for Item 4 (from Papers list or meeting agenda)
3. Review Group Leader comment; add citation in Para 3
4. Click **Approve & Forward to IC Division**
5. Verify status: `IC_DIVISION_REVIEW`

**Stage 3 — IC Division Review:**
1. Login as `icdh.test`
2. Review paper; add comment: "Approved. Ensure consistency with India's MEPC position."
3. Click **Approve & Forward to CS/NA**
4. Verify status: `CS_NA_REVIEW`

**Stage 4 — CS/NA Review:**
1. Login as CS/NA officer
2. Review; approve
3. Verify status: `CSS_REVIEW`

**Stage 5 — CSS Review:**
1. Login as CSS officer
2. Review; approve
3. Verify status: `DG_REVIEW`

**Stage 6 — DG Review & Finalization:**
1. Login as DG user
2. Open the paper created for Item 4 (from Papers list or meeting agenda)
3. Review full paper with all 5 previous stage comments visible
4. Click **Finalize Paper**
5. Confirm finalization dialog
6. Verify status: `FINALIZED`

**Expected Output (final):**
- Paper status: `FINALIZED`
- Paper locked — no further edits
- `Submit to IMO` button active
- Finalization certificate generated
- All 8 participants notified that the paper has been FINALIZED
- Audit trail: 7 entries, one per stage, all with timestamps and actor names

---

### TC-06-UAT-012: Approval Chain — Return for Revision Scenario
**Tool:** Playwright E2E  
**Priority:** High

**Steps:**
1. Create an additional paper (fourth paper for this meeting)
2. Progress to `IC_DIVISION_REVIEW` stage
3. Login as `icdh.test`
4. Click **Return for Revision**
5. Enter reason: "This paper conflicts with India's MARPOL position agreed last month. Requires alignment."
6. Confirm

**Expected Output:**
- Paper status: `DRAFT`
- COORDINATOR notified with return reason
- Paper is editable again
- `revision_count` in DB incremented to 1
- All previous stage approvals cleared (paper must go through all stages again)

---

## Phase 5 — Meeting Readiness Check

### TC-06-UAT-013: Meeting Preparedness Score — Final Check
**Actor:** COORDINATOR / IC_DIVISION_HEAD  
**Tool:** Playwright E2E  
**Screen:** SCR-MTG-03

**Steps:**
1. After completing TC-06-UAT-001 through TC-06-UAT-011 (all 3 papers finalized, all 33 tasks complete, all feedback consolidated)
2. Login as `coord.test`
3. Navigate to dashboard
4. View Preparedness Score widget

**Expected Output:**
- Preparedness Score: 90–100 (green)
- Score breakdown:
  - Tasks Completed: 100%
  - Papers Approved (FINALIZED): 100% (3/3)
  - Feedback Consolidated: 100% (3 HIGH PRIORITY items)
  - HIGH PRIORITY Items Ready: 100%
- Risk Flags: empty (no outstanding risks)
- Recommendation: "Meeting preparation is complete."

---

### TC-06-UAT-014: Generate Meeting Readiness Report
**Actor:** IC_DIVISION_HEAD  
**Tool:** Playwright E2E  
**Screen:** SCR-RPT-01

**Steps:**
1. Login as `icdh.test`
2. Navigate to `/reports`
3. Select: `Meeting Readiness Report`, Meeting: **Sea Fire Fighting** (or meeting UUID)
4. Format: `PDF`
5. Click **Generate**
6. Download report

**Expected Output:**
- Report generated within 10 seconds
- PDF contains:
  - Meeting summary (title, dates, location)
  - Participant list (8 members, roles)
  - Task completion: 33/33 (100%)
  - Paper status: 3 papers FINALIZED
  - Preparedness Score: 95+
  - Agenda items readiness: 7/7

---

## Phase 6 — Cross-Cutting Scenarios

### TC-06-UAT-015: Full Participant Isolation Verification
**Tool:** Playwright E2E  
**Priority:** Critical Security Scenario

**Steps:**
1. Login as `member2.test` (MMD Chennai, IND delegation)
2. Navigate to `/collaboration/AI-004`
3. Observe feedback list

**Expected Output:**
- Only `member2.test`'s own feedback visible
- `member1.test` (MMD Mumbai) feedback NOT visible
- `member3.test` (MMD Kolkata) feedback NOT visible
- No GBR or other delegation feedback visible

4. Attempt direct API call: `GET /api/collaboration/AI-004/feedback` with member2.test JWT
5. Inspect all returned feedback items

**Expected Output:**
- All returned items have `submitted_by = member2.test`
- No cross-delegation data leakage at API level

---

### TC-06-UAT-016: VIEWER — Full Read-Only UAT
**Tool:** Playwright E2E  
**Priority:** High

**Steps:**
1. Login as `viewer.test` (MoPSW)
2. Navigate through: Dashboard → Meetings → Sea Fire Fighting → Agenda → Items
3. Attempt: Click any button that implies write action

**Expected Output:**
- Dashboard shows: Meeting calendar, Upcoming meetings list (read-only)
- Meeting detail: Title, dates, participants list — all read-only
- Agenda: Items visible, HIGH PRIORITY badges visible, NO feedback or position buttons
- Documents: Download available, NO upload button
- ZERO write-capable buttons anywhere in the application
- All direct URL attempts to write actions → 403

---

### TC-06-UAT-017: Notification Completeness Check
**Tool:** Playwright E2E  
**Priority:** Medium

**Verify notifications were triggered at each key event during UAT:**

| Event | Recipient | Expected Notification |
|---|---|---|
| Meeting created | All 8 participants | "You have been added to Sea Fire Fighting" |
| Task assigned | Assigned member | "New task assigned: [task title]" |
| Task completed | COORDINATOR | "Task completed by [member]: [task title]" |
| Feedback submitted | COORDINATOR | "New feedback on Item [N] from [member]" |
| Consolidated position ready | DL | "Consolidated position for Item [N] ready for review" |
| DL approves position | COORDINATOR | "Consolidated position for Item [N] approved by DL" |
| Paper progresses each stage | Previous stage approver + next approver | "[Paper ID] advanced to [stage]" |
| Paper FINALIZED | All participants | "Paper [ID] has been finalized" |

**Steps:**
1. Login as each role and check notification bell
2. Verify notification count matches number of events relevant to that role

---

### TC-06-UAT-018: Audit Trail — End-to-End Completeness
**Actor:** SYSTEM_ADMIN  
**Tool:** Playwright E2E  
**Screen:** SCR-AUD-01

**Steps:**
1. Login as `admin.test`
2. Navigate to **Admin → Audit log** (`/admin/audit`); filter by meeting if UI supports it
3. Review full audit log

**Expected Output:**
Audit log contains entries for ALL of the following events (in order):
1. Meeting created
2. 8 participants added
3. 7 agenda items created
4. 3 documents uploaded
5. 33 tasks created
6. 33 tasks completed (with completion notes)
7. 9 feedback items submitted (3 members × 3 HIGH PRIORITY items)
8. 3 consolidated positions created
9. 3 DL approvals
10. 3 AI drafts generated
11. 3 papers created (from AI drafts)
12. 21 stage transitions (3 papers × 7 stages)
13. 3 paper finalizations
14. 2 reports generated

**Total minimum audit entries: ~85**  
All entries have: `action`, `performed_by`, `entity_type`, `entity_id`, `timestamp`  
No gaps; timestamps are chronologically consistent.

---

## UAT Sign-Off Checklist

| # | UAT Scenario | Result | Sign-Off |
|---|---|---|---|
| TC-06-UAT-001 | Meeting setup with 8 participants + 7 agenda items | ⬜ | |
| TC-06-UAT-002 | Document upload and access | ⬜ | |
| TC-06-UAT-003 | 33 tasks created and assigned | ⬜ | |
| TC-06-UAT-004 | All 33 tasks completed by members | ⬜ | |
| TC-06-UAT-005 | 9 feedback items submitted (3 members × 3 items) | ⬜ | |
| TC-06-UAT-006 | AI Position Advisor — Item 4 | ⬜ | |
| TC-06-UAT-007 | AI Position Advisor — Items 5 and 7 | ⬜ | |
| TC-06-UAT-008 | Feedback consolidation — all 3 HIGH PRIORITY items | ⬜ | |
| TC-06-UAT-009 | DL approves all 3 consolidated positions | ⬜ | |
| TC-06-UAT-010 | AI Draft Assistant — 3 papers generated | ⬜ | |
| TC-06-UAT-011 | Full 7-stage approval — first paper (Item 4) | ⬜ | |
| TC-06-UAT-012 | Return for revision scenario | ⬜ | |
| TC-06-UAT-013 | Preparedness Score = 90+ after completion | ⬜ | |
| TC-06-UAT-014 | Meeting Readiness Report generated | ⬜ | |
| TC-06-UAT-015 | Participant isolation — zero cross-delegation leakage | ⬜ | |
| TC-06-UAT-016 | VIEWER — full read-only verification | ⬜ | |
| TC-06-UAT-017 | Notification completeness check | ⬜ | |
| TC-06-UAT-018 | Audit trail — 85+ entries, no gaps | ⬜ | |

**UAT Status: ⬜ IN PROGRESS / ⬜ PASSED / ⬜ FAILED**  
**Sign-Off Authority:** IC Division Head, DGS  
**Date:** _______________

---

*Document: ISEP-TC-06 | UAT Sea Fire Fighting | 18 UAT scenarios | v1.0*
