# ISEP Test Cases — TC-04: All 15 Modules (Complete Coverage)
> **Document Ref:** ISEP-TC-04 | **Version:** 1.0 | **Layer:** L1 (Jest) + L2 (JUnit) + L5 (Playwright)  
> **Format:** Step-by-step numbered (UAT style) | **Depth:** Full detail  
> **Classification:** CONFIDENTIAL

---

## Module Index

| # | Module | Screens | Priority |
|---|---|---|---|
| M-01 | System Administration | SCR-SYS-01 to 05 | High |
| M-02 | Dashboard | SCR-DSH-01 to 03 | Critical |
| M-03 | Meeting Management | SCR-MTG-01 to 05 | Critical |
| M-04 | Agenda Management | SCR-AGN-01 to 04 | Critical |
| M-05 | Document Management | SCR-DOC-01 to 03 | High |
| M-06 | Task Management | SCR-TSK-01 to 04 | High |
| M-07 | Collaboration | SCR-COL-01 to 03 | Critical |
| M-08 | Paper Drafting & Approval | SCR-PAPER-01 to 05 | Critical |
| M-09 | Feedback & Comments | SCR-FBK-01 to 03 | High |
| M-10 | Notifications | SCR-NTF-01 to 02 | Medium |
| M-11 | Reports & Analytics | SCR-RPT-01 to 03 | Medium |
| M-12 | Search | SCR-SRC-01 to 02 | Medium |
| M-13 | User Profile | SCR-PRF-01 to 02 | Low |
| M-14 | Audit Trail | SCR-AUD-01 to 02 | High |
| M-15 | Help & Reference | SCR-HLP-01 to 02 | Low |

---

## M-01: System Administration

### TC-04-SYS-001: Create New User
**Tool:** Playwright E2E | **Screen:** SCR-SYS-01 | **Role:** SYSTEM_ADMIN

**Steps:**
1. Login as `admin.test`
2. Navigate to **Admin → User list** (`/admin/users`)
3. Click **Add User**
4. Fill: Name: `Rajiv Mehta`, Email: `rajiv@dgs.gov.in`, Role: `COORDINATOR`, Organisation: `DGS HQ`
5. Click **Create User**

**Expected Output:**
- User created in Keycloak dev realm
- User record in `users` table with `status = ACTIVE`
- Welcome email trigger logged (actual email suppressed in test env)
- User appears in user list with correct role badge

**Edge Cases:**
- Duplicate email → "Email already registered"
- Invalid email format → inline validation
- No role selected → "Role is required"

---

### TC-04-SYS-002: Assign User to Meeting as Participant
**Tool:** Playwright E2E | **Screen:** SCR-SYS-02 | **Role:** SYSTEM_ADMIN

**Steps:**
1. Navigate to meeting **Sea Fire Fighting** (from `/meetings` list) and open **Participants** tab (`/meetings/{meetingId}?tab=participants` or tab within meeting page)
2. Click **Add Participant**
3. Search: `Rajiv Mehta`
4. Assign role in meeting: `COORDINATOR`
5. Assign to delegation: `DGS HQ`
6. Click **Save**

**Expected Output:**
- Participant record created for meeting (meeting_id = meeting UUID), user and role assigned
- RLS policy grants Rajiv access to DGS HQ delegation data for this meeting
- Rajiv receives "You have been added to Sea Fire Fighting meeting" notification

---

### TC-04-SYS-003: Deactivate User
**Tool:** Playwright E2E | **Role:** SYSTEM_ADMIN

**Steps:**
1. Navigate to **Admin → User list** (`/admin/users`)
2. Find `Rajiv Mehta`
3. Click **Deactivate**
4. Confirm deactivation
5. Attempt login as `rajiv@dgs.gov.in`

**Expected Output:**
- Step 5: Keycloak returns "Account disabled"
- User status in DB: `ACTIVE = false`
- All Rajiv's active sessions terminated

---

### TC-04-SYS-004: System Configuration — Manage Organisations
**Tool:** Playwright E2E | **Screen:** SCR-SYS-03 | **Role:** SYSTEM_ADMIN

**Steps:**
1. Navigate to **Admin → System config** (`/admin/system/config`)
2. If organisation management is a subsection, click **Add Organisation**; otherwise use the config screen for platform/organisation settings
3. Fill: Code: `MMD-HYD`, Name: `Mercantile Marine Department, Hyderabad`, Type: `MMD`
4. Click **Save**

**Expected Output:**
- Organisation appears in dropdown for user creation (when implemented)
- Organisation code is unique (attempt duplicate → "Code already exists")

**Note:** Organisation management may be a subsection of System config or a future screen. Admin menu has no separate "Admin Home" submenu; use **Admin** → **System admin** → **System config**.

---

## M-02: Dashboard

### TC-04-DSH-001: Dashboard Loads Correctly — COORDINATOR
**Tool:** Playwright E2E | **Screen:** SCR-DSH-01

**Steps:**
1. Login as `coord.test`
2. Verify redirect to **Dashboard** at `/dashboard/executive`
3. Observe dashboard (Executive Dashboard: summary view when no meeting selected)

**Expected Output:**
- **Dashboard** shows: collapsible sections **Meetings in progress**, **Upcoming meetings**, **Archived meetings**; **Papers by stage** (Draft, In review, Finalized); **Tasks & actions** (Overdue, Due soon, My pending); **Insights** block; and **Select a meeting for detailed view** (or similar)
- Selecting a meeting opens detailed Executive Dashboard for that meeting (agenda readiness, paper pipeline, etc.)
- No data from other delegations visible inappropriately

---

### TC-04-DSH-002: Dashboard — VIEWER Sees Read-Only Summary
**Tool:** Playwright E2E | **Screen:** SCR-DSH-02

**Steps:**
1. Login as `viewer.test`
2. Observe Dashboard at `/dashboard/executive`

**Expected Output:**
- Executive Dashboard summary visible (Meetings, Papers by stage, Tasks & actions, Insights) in read-only form
- No create/edit/approve actions; VIEWER can open meeting links for read-only detail
- No action buttons that allow write operations

---

### TC-04-DSH-003: Dashboard — Calendar Page
**Tool:** Playwright E2E | **Screen:** SCR-DSH-03

**Steps:**
1. Login as `coord.test`
2. Navigate to **Calendar** from sidebar (`/calendar`)
3. Navigate to February 2027 (or month where Sea Fire Fighting is scheduled)
4. Click date with "Sea Fire Fighting" (or open meeting from calendar)

**Expected Output:**
- Calendar shows meetings (e.g. Sea Fire Fighting) on correct dates
- Clicking meeting opens meeting detail or link to meeting
- Meeting shows: Title, Location, Type, Body

---

## M-03: Meeting Management

### TC-04-MTG-001: Create New Meeting
**Tool:** Playwright E2E | **Screen:** SCR-MTG-01 | **Role:** SYSTEM_ADMIN / IC_DIVISION_HEAD

**Steps:**
1. Login as `icdh.test`
2. Navigate to `/meetings/create`
3. Fill:
   - Title: `MEPC 82 — Marine Environment Protection`
   - Body: `MEPC (IMO)`
   - Session: `82`
   - Start Date: `2027-09-15`
   - End Date: `2027-09-19`
   - Location: `IMO HQ, London`
   - Type: `In-Person`
4. Click **Create Meeting**

**Expected Output:**
- Meeting created with unique ID
- Appears in meetings list with status `UPCOMING`
- Creator (icdh.test) auto-assigned as IC_DIVISION_HEAD for meeting
- Audit log entry created

**Edge Cases:**
- End date before start date → "End date must be after start date"
- Duplicate session number for same body → warning (not block): "Session 82 for MEPC already exists"

---

### TC-04-MTG-002: Meeting List — Filter and Search
**Tool:** Playwright E2E | **Screen:** SCR-MTG-02

**Steps:**
1. Navigate to `/meetings`
2. Filter by Status: `UPCOMING`
3. Filter by Body: `SSE`
4. Search: `Sea Fire`

**Expected Output:**
- "Sea Fire Fighting" meeting appears in results
- Other meetings filtered out
- Result count updates dynamically

---

### TC-04-MTG-003: Meeting Detail View
**Tool:** Playwright E2E | **Screen:** SCR-MTG-03

**Steps:**
1. Navigate to `/meetings` and open **Sea Fire Fighting** (or navigate to `/meetings/{meetingId}` using meeting UUID from list)
2. Observe all sections (Overview, Participants, Agenda, Tasks, Documents, etc.)

**Expected Output:**
- Title, dates, location, body displayed correctly
- **Participants** tab: participants listed with roles
- **Agenda** tab: agenda items listed; HIGH PRIORITY items marked
- **Executive view** link available to open Executive Dashboard for this meeting
- **Documents** tab: meeting documents listed

---

### TC-04-MTG-004: Edit Meeting Details
**Tool:** Playwright E2E | **Screen:** SCR-MTG-04 | **Role:** IC_DIVISION_HEAD / SYSTEM_ADMIN

**Steps:**
1. Login as `icdh.test`
2. Open the meeting (e.g. Sea Fire Fighting from meetings list)
3. Click **Edit**
4. Change location from `Colombo` to `IMO HQ, London`
5. Click **Save**

**Expected Output:**
- Location updated
- All participants notified: "Meeting details updated: Sea Fire Fighting — Location changed to IMO HQ, London"
- Audit log entry: `"Location updated by icdh.test"`

---

### TC-04-MTG-005: COORDINATOR Cannot Edit Meeting Details
**Tool:** Playwright E2E

**Steps:**
1. Login as `coord.test`
2. Open the meeting (e.g. Sea Fire Fighting from meetings list)

**Expected Output:**
- No **Edit** button visible
- All meeting detail fields display in read-only mode

---

## M-04: Agenda Management

### TC-04-AGN-001: Add Agenda Item
**Tool:** Playwright E2E | **Screen:** SCR-AGN-01 | **Role:** IC_DIVISION_HEAD

**Steps:**
1. Navigate to meeting and open **Agenda** tab (`/meetings/{meetingId}` with Agenda tab)
2. Click **Add Agenda Item**
3. Fill: Item Number: `8`, Title: `Any Other Business`, Priority: `LOW`, Submission Required: `No`
4. Click **Save**

**Expected Output:**
- Item 8 added to agenda list
- Item appears with `LOW` priority badge
- No formal paper submission flagged

---

### TC-04-AGN-002: Agenda Item — HIGH PRIORITY Flag
**Tool:** Playwright E2E | **Screen:** SCR-AGN-02

**Steps:**
1. Open Agenda Item 4 in the meeting (e.g. Sea Fire Fighting)

**Expected Output:**
- Red `HIGH PRIORITY` badge displayed
- `Formal Submission Required` indicator shown
- `Get AI Position Suggestion` button visible (COORDINATOR and above)
- Related documents section shows linked papers

---

### TC-04-AGN-003: Agenda Item — AI Position Suggestion Button Visibility
**Tool:** Jest + React Testing Library

**Steps:**
1. Render `<AgendaItemDetail priority="HIGH" role="MEMBER" />`
2. Render `<AgendaItemDetail priority="HIGH" role="COORDINATOR" />`

**Expected Output:**
- MEMBER render: No `Get AI Position Suggestion` button
- COORDINATOR render: `Get AI Position Suggestion` button present

---

### TC-04-AGN-004: Reorder Agenda Items
**Tool:** Playwright E2E | **Role:** IC_DIVISION_HEAD

**Steps:**
1. Navigate to meeting and open Agenda tab
2. Drag Item 7 to position 3
3. Click **Save Order**

**Expected Output:**
- Agenda order updated in DB
- All participants see new order on next page load
- Audit log: "Agenda reordered by icdh.test"

---

## M-05: Document Management

### TC-04-DOC-001: Upload Document
**Tool:** Playwright E2E | **Screen:** SCR-DOC-01 | **Role:** COORDINATOR

**Steps:**
1. Navigate to meeting and open **Documents** tab (or `/meetings/{meetingId}` then Documents)
2. Click **Upload Document**
3. Select file: `SOLAS_Chapter_II2_Current.pdf` (2.3MB)
4. Set Category: `Reference Document`
5. Link to Agenda Item: `Item 4`
6. Click **Upload**

**Expected Output:**
- File stored (e.g. MinIO or configured storage) for the meeting
- Document record in DB with `meeting_id`, `agenda_item_id`, `uploaded_by`, `file_size`
- Document appears in Document list with download link
- Virus scan triggered (async) — status: `SCANNING`
- After scan: status: `CLEAN` or `QUARANTINED`

**Edge Cases:**
- File > 10MB → reject with message
- `.exe`, `.bat`, `.sh` → reject: "File type not permitted"
- MinIO unavailable → "Upload service temporarily unavailable. Try again."

---

### TC-04-DOC-002: Download Document
**Tool:** Playwright E2E | **Screen:** SCR-DOC-02

**Steps:**
1. Login as `viewer.test`
2. Navigate to meeting documents
3. Click download on `SOLAS_Chapter_II2_Current.pdf`

**Expected Output:**
- File downloads correctly
- MinIO pre-signed URL generated (expires in 15 minutes)
- Download logged in audit trail: `"Downloaded by viewer.test"`

---

### TC-04-DOC-003: Document Version Control
**Tool:** Playwright E2E | **Screen:** SCR-DOC-03 | **Role:** COORDINATOR

**Steps:**
1. Upload `India_Position_Draft_v1.docx`
2. Upload `India_Position_Draft_v2.docx` with same logical name

**Expected Output:**
- Both versions retained
- Version history tab shows v1 and v2
- Latest version shown by default
- Old version downloadable from history

---

## M-06: Task Management

### TC-04-TSK-001: Create Task
**Tool:** Playwright E2E | **Screen:** SCR-TSK-01 | **Role:** COORDINATOR

**Steps:**
1. Navigate to meeting and open **Tasks** tab (`/meetings/{meetingId}` then Tasks)
2. Click **Create Task**
3. Fill: Title: `Review SOLAS Amendment Paper`, Assigned To: `member1.test`, Due: `2027-01-15`, Priority: `HIGH`, Agenda Item: `Item 4`
4. Click **Save**

**Expected Output:**
- Task created with ID
- `member1.test` receives task notification
- Task appears in `member1.test`'s My Tasks dashboard widget
- Task visible in meeting task list for COORDINATOR

---

### TC-04-TSK-002: MEMBER Completes Task
**Tool:** Playwright E2E | **Screen:** SCR-TSK-02

**Steps:**
1. Login as `member1.test`
2. Navigate to My Tasks
3. Open task `Review SOLAS Amendment Paper`
4. Add completion note: "Reviewed. Key concern: Regulation 10.4 conflicts with India's current legislation."
5. Click **Mark Complete**

**Expected Output:**
- Task status: `DONE`
- COORDINATOR notified: "Task 'Review SOLAS Amendment Paper' completed by member1.test"
- Completion note saved and visible to COORDINATOR
- Preparedness Score recalculates (task completion increases score)

---

### TC-04-TSK-003: MEMBER Cannot See Other Delegation's Tasks
**Tool:** Playwright E2E + Testcontainers  
**Priority:** Critical (Security)

**Steps:**
1. Seed tasks for delegation `IND` and delegation `GBR`
2. Login as `member1.test` (delegation: IND)
3. Navigate to `/tasks`

**Expected Output:**
- Only IND delegation tasks visible
- No GBR delegation tasks in list
- API response also filtered: `GET /api/tasks` returns only IND tasks for member1.test JWT

---

### TC-04-TSK-004: Overdue Task Indicator
**Tool:** Playwright E2E | **Screen:** SCR-TSK-03

**Steps:**
1. Seed task with `due_date = yesterday`, status = `PENDING`
2. Login as `coord.test`
3. View task list

**Expected Output:**
- Overdue badge (red) shown on task
- Task appears in "Overdue" filter section
- Dashboard widget "My Tasks" shows overdue count separately

---

## M-07: Collaboration

### TC-04-COL-001: MEMBER Submits Feedback on Agenda Item
**Tool:** Playwright E2E | **Screen:** SCR-COL-01 | **Role:** MEMBER

**Steps:**
1. Login as `member1.test`
2. Navigate to `/collaboration/AI-004`
3. Click **Add Feedback**
4. Select Feedback Type: `Position Statement`
5. Enter: `India should support this amendment with the condition that Phase 2 timeline is extended to 2030.`
6. Click **Submit Feedback**

**Expected Output:**
- Feedback saved with `delegation_code = IND`, `submitted_by = member1.test`
- Feedback visible ONLY to `member1.test` and COORDINATOR (participant isolation)
- COORDINATOR notified: "New feedback on Item 4 from member1.test"
- Other MEMBER users from other delegations CANNOT see this feedback

---

### TC-04-COL-002: COORDINATOR Consolidates Feedback
**Tool:** Playwright E2E | **Screen:** SCR-COL-01 | **Role:** COORDINATOR

**Steps:**
1. Login as `coord.test`
2. Navigate to `/collaboration/AI-004`
3. View all feedback from all IND delegation members (3 items)
4. Click **Consolidate Feedback**
5. Draft consolidated position: `India supports the amendment with a Phase 2 extension to 2030. Reference: feedback from DGS, MMD Mumbai.`
6. Click **Submit for DL Review**

**Expected Output:**
- Consolidated position record created: `CP-004`
- Status: `PENDING_DL_REVIEW`
- `dl.test` notified: "Consolidated position for Item 4 ready for your review"
- Individual feedback items linked to consolidated position record
- Preparedness Score recalculates

---

### TC-04-COL-003: DELEGATION_LEADER Reviews Consolidated Position
**Tool:** Playwright E2E | **Screen:** SCR-COL-02

**Steps:**
1. Login as `dl.test`
2. Navigate to `/collaboration/AI-004`
3. View consolidated position `CP-004`
4. Edit DL's position note: `Approved. Emphasis on Phase 2 timeline is critical.`
5. Click **Approve Consolidated Position**

**Expected Output:**
- `CP-004` status: `DL_APPROVED`
- COORDINATOR notified
- `Generate Submission Draft` button now active (triggers AI Draft Assistant)
- Approved position locked — MEMBER feedback no longer editable

---

## M-08: Paper Drafting & Approval
> Full coverage in TC-02. Additional screen-level tests below.

### TC-04-PAP-001: Paper List View — Status Filters
**Tool:** Playwright E2E | **Screen:** SCR-PAPER-03

**Steps:**
1. Login as `coord.test`
2. Navigate to **Papers** (`/papers`); filter by meeting if needed
3. Filter by Status: `DRAFT`
4. Filter by Status: `FINALIZED`

**Expected Output:**
- DRAFT filter: shows only papers with `DRAFT` status
- FINALIZED filter: shows only `FINALIZED` papers
- Each paper row shows: ID, Title, Agenda Item, Status badge, Last Updated, Actions

---

## M-09: Feedback & Comments

### TC-04-FBK-001: Document Comment — Three Comment Tracks
**Tool:** Playwright E2E | **Screen:** SCR-FBK-01 | **Role:** COORDINATOR

**Steps:**
1. Open a paper in review
2. Select text in "Proposal" section
3. Click **Add Comment**
4. Choose track: `Document Comment`
5. Enter: `This paragraph needs a specific regulation reference.`
6. Click **Save Comment**

**Expected Output:**
- Comment anchored to selected text (highlighted)
- Comment appears in right-side comment panel
- Comment track: `DOCUMENT_COMMENT`
- Other comment tracks visible: `STRUCTURED_AGENDA_FEEDBACK`, `PAPER_TRACK_CHANGES`
- MEMBER can only see own track comments until consolidated

---

### TC-04-FBK-002: Track Changes on Paper
**Tool:** Playwright E2E | **Screen:** SCR-FBK-02

**Steps:**
1. Login as `coord.test`
2. Open paper in edit mode
3. Enable Track Changes toggle
4. Delete word `amendment` and type `regulation`
5. Save

**Expected Output:**
- `amendment` shown with strikethrough (red)
- `regulation` shown in green (insertion)
- Track change author: `coord.test`
- DL review screen shows tracked changes with accept/reject options

---

## M-10: Notifications

### TC-04-NTF-001: Notification Bell — Unread Count
**Tool:** Playwright E2E | **Screen:** SCR-NTF-01

**Steps:**
1. Login as `coord.test`
2. Trigger 3 notifications (complete 3 tasks from other browser)
3. Observe header notification bell

**Expected Output:**
- Badge shows count `3`
- Clicking bell opens notification panel
- Each notification shows: message, timestamp, action link
- Marking one as read → count decreases to `2`

---

### TC-04-NTF-002: Email Notification Trigger Log
**Tool:** JUnit | **Layer:** L2

**Steps:**
1. Call `notificationService.sendPaperApprovalNotification(paperId, recipientId, stage)`
2. Verify notification record in DB

**Expected Output:**
- `notifications` table has record: `type = EMAIL`, `status = QUEUED`, `recipient_id = recipientId`
- Actual email sending suppressed in test (mock SMTP)

---

## M-11: Reports & Analytics

### TC-04-RPT-001: Generate Meeting Readiness Report
**Tool:** Playwright E2E | **Screen:** SCR-RPT-01 | **Role:** IC_DIVISION_HEAD

**Steps:**
1. Login as `icdh.test`
2. Navigate to `/reports`
3. Select: `Meeting Readiness Report`, Meeting: Sea Fire Fighting (or meeting UUID)
4. Click **Generate**

**Expected Output:**
- Report generated (PDF/Excel)
- Contains: Task completion %, Paper status summary, Pending approvals by stage
- Download link appears within 10 seconds
- Report stored in MinIO with access restricted to IC_DIVISION_HEAD and above

---

### TC-04-RPT-002: MEMBER Cannot Access Reports
**Tool:** Playwright E2E

**Steps:**
1. Login as `member1.test`
2. Attempt direct navigation to `/reports`

**Expected Output:**
- Redirect to `/403`

---

## M-12: Search (Elasticsearch)

### TC-04-SRC-001: Full-Text Search — Agenda Papers
**Tool:** Playwright E2E | **Screen:** SCR-SRC-01

**Steps:**
1. Login as `coord.test`
2. Click global search bar
3. Type: `SOLAS fire fighting equipment`
4. Press Enter

**Expected Output:**
- Results within 2 seconds (Elasticsearch)
- Results include papers, documents, tasks containing search terms
- Results filtered by user's RBAC (no other delegation's private docs)
- Each result shows: Type badge (Paper/Document/Task), Title, Excerpt with highlighted terms

---

### TC-04-SRC-002: Search — No Results
**Tool:** Playwright E2E

**Steps:**
1. Search for: `xyznonexistentterm12345`

**Expected Output:**
- "No results found for 'xyznonexistentterm12345'"
- Suggested: "Try broader search terms" or similar helpful message
- No error or blank page

---

## M-13: User Profile

### TC-04-PRF-001: Update Profile
**Tool:** Playwright E2E | **Screen:** SCR-PRF-01

**Steps:**
1. Login as `member1.test`
2. Navigate to `/profile`
3. Update mobile number: `+91-9876543210`
4. Update display name: `Amit Kumar`
5. Click **Save**

**Expected Output:**
- Profile updated
- Name shown in header updates to `Amit Kumar`
- Mobile number saved (not visible to other users)

---

## M-14: Audit Trail

### TC-04-AUD-001: Audit Log — Paper Approval Events
**Tool:** Playwright E2E | **Screen:** SCR-AUD-01 | **Role:** SYSTEM_ADMIN / IC_DIVISION_HEAD

**Steps:**
1. Login as `icdh.test`
2. Navigate to `/audit`
3. Filter by: Entity Type: `PAPER`, Paper ID: (use paper UUID from list)

**Expected Output:**
- All approval events listed chronologically
- Each entry: `action`, `performed_by`, `timestamp`, `previous_status`, `new_status`
- Export to CSV button available
- MEMBER cannot access audit log

---

### TC-04-AUD-002: Audit Log — Tamper Evidence
**Tool:** JUnit + Testcontainers  
**Priority:** High

**Steps:**
1. Insert audit log entry
2. Attempt direct `UPDATE audit_log SET performed_by = 'tampered' WHERE id = 1`

**Expected Output:**
- DB role restriction: `ERROR: permission denied for table audit_log`
- Audit table is INSERT-only for application role

---

## M-15: Help & Reference

### TC-04-HLP-001: Help Page Loads
**Tool:** Playwright E2E | **Screen:** SCR-HLP-01

**Steps:**
1. Login as any role
2. Click Help icon in navigation
3. Navigate to `User Guide` section

**Expected Output:**
- Help page renders without errors
- User guide content visible
- Search within help works (basic text search)

---

*Document: ISEP-TC-04 | All 15 Modules | 38 test cases | v1.0*
