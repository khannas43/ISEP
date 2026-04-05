# ISEP — Full Screen Checklist & Workflows
## Screen-by-screen list for frontend implementation, then route + RBAC planning

**Purpose:** Single checklist for all 70 screens with workflow context. Use this to implement frontend; then derive route map and RBAC from it.

**Reference:** SRS/ISEP-Screens-RBAC.md, SRS/CURSOR-PROJECT-CONTEXT.md

---

## Part A — Workflow summary (which screens belong to which flow)

| Workflow | Description | Screens in flow |
|----------|-------------|-----------------|
| **Auth & session** | Login, MFA, password change, timeout, unauthorized | SCR-AUTH-01 to SCR-AUTH-05 |
| **Dashboard** | Role-specific landing | SCR-DASH-01 to SCR-DASH-06 |
| **Bodies** | Committee/body CRUD and detail | SCR-BODY-01, SCR-BODY-02, SCR-BODY-03 |
| **Meeting lifecycle** | Create → manage → active → concluded | SCR-MTG-01, SCR-MTG-02, SCR-MTG-03, SCR-MTG-04, SCR-MTG-05 |
| **Agenda (per meeting)** | Agenda items list, add/edit, item detail | SCR-AGN-01, SCR-AGN-02, SCR-AGN-03 |
| **Document lifecycle** | Upload → view → version → compare → search | SCR-DOC-01 to SCR-DOC-06 |
| **Feedback (Track 2)** | Member submit → Coordinator consolidate → DL approve → IH finalize | SCR-COL-01 (submit), SCR-COL-02 (consolidate), SCR-AGN-03 (entry) |
| **Document comments (Track 1)** | Comments on document; isolation until consolidation | SCR-DOC-03 (viewer + comment panel), SCR-COL-04 |
| **Paper drafting & approval (Track 3)** | Draft → submit → multi-stage approval → finalized/rejected | SCR-PAPER-01 to SCR-PAPER-05 |
| **Tasks** | My tasks, create/edit, detail, team dashboard | SCR-TASK-01 to SCR-TASK-04 |
| **Correspondence groups** | CG list, create/edit, detail, members, submissions | SCR-CG-01 to SCR-CG-05 |
| **Live meeting** | Lobby → discussion board → interventions → outcomes | SCR-LIVE-01, SCR-LIVE-02, SCR-LIVE-03, SCR-LIVE-04 |
| **Deliberation notes** | Internal notes per agenda item | SCR-COL-03 |
| **Reports** | Reports home + 5 report types | SCR-RPT-01 to SCR-RPT-06 |
| **Calendar & notifications** | Calendar, notification centre, preferences, announcements | SCR-CAL-01 to SCR-CAL-04 |
| **User & admin** | User list, CRUD, profile, bulk import, assignments | SCR-USR-01 to SCR-USR-05 |
| **System admin** | Health, audit, config, workflows, backups | SCR-SYS-01 to SCR-SYS-05 |

These are total 74 screens
---

## Part B — Screen-by-screen checklist (70 screens)

**Checklist columns:** Done (Y/N), URL, Workflow(s), Roles (SA/IH/DL/CO/ME/VW), Access (Full / Read-only / Partial), Notes for implementation.

---

### 1. Authentication & session (5 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 1 | SCR-AUTH-01 | Login | `/login` | Auth | All | Full | Keycloak OIDC; branding; error + lockout message. |
| 2 | SCR-AUTH-02 | MFA prompt | `/login/mfa` | Auth | SA, IH | Full | TOTP 6-digit; backup code; 30s limit. |
| 3 | SCR-AUTH-03 | Forced password change | `/account/change-password` | Auth | All | Full | Cannot skip; policy: 12 char, upper, lower, number, special. |
| 4 | SCR-AUTH-04 | Session timeout | `/session-expired` | Auth | All | Full | Message + re-login; preserve callbackUrl. |
| 5 | SCR-AUTH-05 | Unauthorized | `/unauthorized` | Auth | All | Full | Message, current role, link to dashboard; log attempt. |

---

### 2. Dashboards (6 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 6 | SCR-DASH-01 | SA Dashboard | `/dashboard` | Dashboard | SA | Full | Health, users count, active meetings, alerts, audit (last 10), announcements. |
| 7 | SCR-DASH-02 | IH Dashboard | `/dashboard` | Dashboard | IH | Full | Papers awaiting approval, upcoming meetings, participation summary, overdue/escalated, inter-ministerial. |
| 8 | SCR-DASH-03 | DL Dashboard | `/dashboard` | Dashboard | DL | Full | Upcoming meetings, papers in pipeline, delegation tasks, feedback consolidation status, live meeting link. |
| 9 | SCR-DASH-04 | Coordinator Dashboard | `/dashboard` | Dashboard | CO | Full | Managed meetings, agenda items for consolidation, overdue tasks, papers by stage, CG activity, calendar widget. |
| 10 | SCR-DASH-05 | Member Dashboard | `/dashboard` | Dashboard | ME | Full | My tasks (overdue/due soon), agenda items for my feedback, co-draft papers, recent docs, deadlines. |
| 11 | SCR-DASH-06 | Viewer Dashboard | `/dashboard` | Dashboard | VW | Full | Read-only: active meetings, finalized docs, schedule, outcomes. |

---

### 3. Committee & body management (3 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 12 | SCR-BODY-01 | Bodies list | `/bodies` | Bodies | SA full; IH,DL,CO,ME,VW read | SA: Full; others: Read-only | Tree + table; search; SA: Add, Edit, Deactivate. |
| 13 | SCR-BODY-02 | Add / Edit body | `/bodies/new`, `/bodies/:id/edit` | Bodies | SA | Full | Name, abbreviation, type, parent, description, active. |
| 14 | SCR-BODY-03 | Body detail | `/bodies/:id` | Bodies | SA full; others read | SA: Full; others: Read-only | Attributes, hierarchy, meetings list, CGs, participation history; SA: Edit, Deactivate. |

---

### 4. Meeting management (5 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 15 | SCR-MTG-01 | Meetings list | `/meetings` | Meeting lifecycle | SA,IH,DL,CO,ME,VW | SA/IH: read; CO: partial; others: read (scoped) | Filters: body, year, status, type; Create: SA, CO. |
| 16 | SCR-MTG-02 | Create / Edit meeting | `/meetings/new`, `/meetings/:id/edit` | Meeting lifecycle | SA, CO | Full | Title, body, session, dates, location, type, URL, notes. |
| 17 | SCR-MTG-03 | Meeting detail / overview | `/meetings/:id` | Meeting lifecycle | SA,CO full; IH,DL,ME partial; VW read | Per role | Tabs: Agenda, Documents, Participants, Tasks, CGs, History, Live, Outcomes; status actions. |
| 18 | SCR-MTG-04 | Participant management | `/meetings/:id/participants` | Meeting lifecycle | SA, CO full; IH, DL read; ME read; VW no | SA,CO: Full; IH,DL,ME: Read | Add/remove, assign meeting role; notify on add. |
| 19 | SCR-MTG-05 | Meeting status history | `/meetings/:id/history` | Meeting lifecycle | SA,IH,DL,CO | Read-only | Chronological status changes; who, when, from/to, notes. |

---

### 5. Agenda management (3 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 20 | SCR-AGN-01 | Agenda items list | `/meetings/:id/agenda` | Agenda | SA, CO full; others read | Per role | Columns: number, title, category, priority, status, deadline, coordinator, inputs count; Add: SA, CO. |
| 21 | SCR-AGN-02 | Create / Edit agenda item | `/meetings/:id/agenda/new`, `/meetings/:id/agenda/:itemId/edit` | Agenda | SA, CO | Full | Number, title, description, category, priority, deadline, linked docs; bulk CSV import. |
| 22 | SCR-AGN-03 | Agenda item detail | `/meetings/:id/agenda/:itemId` | Agenda, Feedback, Papers | SA,CO full; IH,DL,ME partial; VW read | Per role | Tabs: Documents, Feedback, Tasks, Paper drafts, Deliberations, Activity; entry for feedback flow. |

---

### 6. Document management (6 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 23 | SCR-DOC-01 | Document library | `/documents` | Document lifecycle | All | Read (scoped) | Elasticsearch search; filters: body, meeting, type, source, date, status; card/list toggle. |
| 24 | SCR-DOC-02 | Upload document | `/documents/upload`, `/meetings/:id/agenda/:itemId/documents/upload` | Document lifecycle | SA,CO full; DL,ME partial; VW no | Per role | Title, type, source, meeting, agenda item, description, tags; drag-drop; MIME/size validation; duplicate check. |
| 25 | SCR-DOC-03 | Document detail / viewer | `/documents/:id` | Document lifecycle, Track 1 comments | All | View all; download per role; SA,CO: access log | Metadata, react-pdf viewer, version timeline, download (presigned), comments panel (Track 1). |
| 26 | SCR-DOC-04 | Upload new version | `/documents/:id/new-version` | Document lifecycle | SA,CO full; DL,ME partial | Full/Partial | Change summary required; version auto-increment; link to compare. |
| 27 | SCR-DOC-05 | Version comparison | `/documents/:id/compare` | Document lifecycle | SA,IH,DL,CO,ME | Read; VW no | Side-by-side diff; version selectors; green/red paragraph diff. |
| 28 | SCR-DOC-06 | Document search results | `/documents/search?q=...` | Document lifecycle | All | Read (scoped) | Elasticsearch results; relevance, excerpts, facets; sort by relevance/date/type; paginate 20. |

---

### 7. Collaboration & feedback (4 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 29 | SCR-COL-01 | Feedback submission (Member) | `/meetings/:id/agenda/:itemId/feedback/submit` | Feedback (Track 2) | ME | Full | Position (Support/Object/Neutral/Abstain), comments, amendments, attachments; deadline countdown; save draft / submit; read-only after submit until returned. |
| 30 | SCR-COL-02 | Feedback consolidation | `/meetings/:id/agenda/:itemId/feedback/consolidate` | Feedback (Track 2) | SA,CO full; IH,DL read | Full/Read | Left: participant list + status; Centre: selected feedback; Right: consolidation workspace, position distribution chart; Finalize → DL. |
| 31 | SCR-COL-03 | Deliberation notes | `/meetings/:id/agenda/:itemId/deliberations` | Deliberation | SA,DL,CO full; IH read; ME add only | Per role | Rich text, timestamped, author; ME cannot edit others' notes. |
| 32 | SCR-COL-04 | Comments & discussion | `/documents/:id/comments`, `/meetings/:id/agenda/:itemId/comments` | Track 1 (doc) / general | SA,IH,DL,CO,ME full; VW read | Full/Read | Threaded comments; reply, react; visibility: internal vs delegation; edit within 30 min; no delete (soft-hide). |

---

### 8. Task management (4 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 33 | SCR-TASK-01 | My tasks | `/tasks/my` | Tasks | SA,IH,DL,CO,ME | Full | Overdue / Due today / This week / Upcoming; filters; quick status actions. |
| 34 | SCR-TASK-02 | Create / Edit task | `/tasks/new`, `/tasks/:id/edit` | Tasks | SA,CO full; DL partial | Full/Partial | Title, description, linked entity (type + selector), assignee, priority, due date; DL: scope to their meetings. |
| 35 | SCR-TASK-03 | Task detail | `/tasks/:id` | Tasks | SA,CO full; IH read; DL,ME partial | Per role | Metadata, linked entity link, status history, attachments, comments; status buttons by role. |
| 36 | SCR-TASK-04 | Team task dashboard | `/tasks/team` | Tasks | SA,DL,CO full; IH read | Full/Read | Kanban by assignee × status; overdue highlight; reassign, export; filter by meeting, committee, date. |

---

### 9. Paper preparation & approval (5 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 37 | SCR-PAPER-01 | Papers list | `/papers` | Paper approval (Track 3) | SA,IH,DL,CO,ME; VW no | Read (scoped) | Filters: meeting, body, status, type; current stage, next approver. |
| 38 | SCR-PAPER-02 | Paper drafting | `/papers/:id/draft` | Paper approval (Track 3) | SA,CO full; DL,ME partial | Full/Partial | TipTap, track changes; GET/PUT draft API integrated with mock fallback; auto-save 60s; Submit for review. |
| 39 | SCR-PAPER-03 | Approval workflow view | `/papers/:id/approval` | Paper approval (Track 3) | SA,IH,DL full; CO,ME read | Approvers act at their stage | Timeline: stages; Approve / Reject / Request clarification per stage. |
| 40 | SCR-PAPER-04 | Finalized paper view | `/papers/:id/view` | Paper approval (Track 3) | All except VW | Read; SA,IH: Unlock | Read-only content, FINALIZED badge, approval audit trail, download; SA,IH: Unlock for amendment. |
| 41 | SCR-PAPER-05 | Paper rejection | `/papers/:id/reject` | Paper approval (Track 3) | SA, IH, DL | Full | Mandatory comments (min 50 char), return-to-stage selector; notify submitter; unlock at stage. |

---

### 10. Correspondence groups (5 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 42 | SCR-CG-01 | CG list | `/correspondence-groups` | CG | SA,CO full; others read | Per role | Columns: name, parent, India lead, dates, status; Create: SA, CO. |
| 43 | SCR-CG-02 | Create / Edit CG | `/correspondence-groups/new`, `/correspondence-groups/:id/edit` | CG | SA, CO | Full | Name, parent body, mandate, India lead, dates, IMO ref, status. |
| 44 | SCR-CG-03 | CG detail | `/correspondence-groups/:id` | CG | SA,CO full; IH,DL read; ME partial; VW read | Per role | Tabs: Overview, Submissions, Tasks, Progress, Activity; ME: upload inputs. |
| 45 | SCR-CG-04 | CG member management | `/correspondence-groups/:id/members` | CG | SA, CO | Full | Add/remove members, CG roles (Lead/Contributor/Observer); notify on add. |
| 46 | SCR-CG-05 | CG submission upload & review | `/correspondence-groups/:id/submissions` | CG | SA,CO full; IH,DL read; ME partial | Per role | Upload contributions; Coordinator: mark included, side-by-side consolidation view. |

---

### 11. Live meeting (4 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 47 | SCR-LIVE-01 | Live meeting lobby | `/meetings/:id/live` | Live meeting | All meeting participants; VW read | Full/Read | Meeting name, date, active agenda item, participant online status, links to agenda item boards. |
| 48 | SCR-LIVE-02 | Live discussion board | `/meetings/:id/live/agenda/:itemId` | Live meeting | Participants; VW read | Full/Read | Finalized position (read-only), live input panel, thread; DL: Lock discussion. |
| 49 | SCR-LIVE-03 | Intervention recorder | `/meetings/:id/live/interventions/new` | Live meeting | SA,IH,DL,CO; ME,VW no | Full | Agenda item, intervention text, delivered by, time, type (Support/Oppose/Propose/Info); stored as record. |
| 50 | SCR-LIVE-04 | Meeting outcomes | `/meetings/:id/outcomes` | Live meeting | SA,DL,CO full; IH,VW read | Full/Read | Post-meeting; per agenda item: decision, resolution, next steps; feeds archive. |

---

### 12. Reports & analytics (6 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 51 | SCR-RPT-01 | Reports home | `/reports` | Reports | SA,IH,DL,CO full; ME partial; VW no | Per role | Catalogue by category; ME: own task/submission reports only. |
| 52 | SCR-RPT-02 | Meeting summary report | `/reports/meeting-summary` | Reports | SA,IH,DL,CO | Full | Configurable meeting; agenda, docs, positions, tasks, interventions, outcomes; PDF/Excel. |
| 53 | SCR-RPT-03 | Participation analytics | `/reports/analytics` | Reports | SA,IH full; DL,CO scoped | Full/Scoped | Charts: submissions, interventions, task completion, approval turnaround; date range; drill-down. |
| 54 | SCR-RPT-04 | Approval pipeline report | `/reports/approval-pipeline` | Reports | SA,IH,DL full; CO read | Full/Read | Papers by stage; ageing; next approver; deadline highlight. |
| 55 | SCR-RPT-05 | Audit report | `/reports/audit` | Reports | SA full; IH read (IC scope) | Full/Read | Filters: user, action, entity, date, IP; table; export CSV/JSON; 50 per page. |
| 56 | SCR-RPT-06 | Custom report builder | `/reports/custom` | Reports | SA,IH full; CO scoped | Full/Scoped | Select entities, columns, filters, sort; preview; save template; Excel/PDF/XML; async + email for large. |

---

### 13. Calendar & notifications (4 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 57 | SCR-CAL-01 | Integrated calendar | `/calendar` | Calendar | All | Full (scoped) | Month/week/day; events: meetings, CG deadlines, task due, approval due; iCal export. |
| 58 | SCR-CAL-02 | Notification centre | `/notifications` | Notifications | All | Full | Bell in nav; list read/unread; mark all read; link to entity; unread badge; 90-day archive. |
| 59 | SCR-CAL-03 | Notification preferences | `/account/notification-preferences` | Notifications | All | Full | Toggles per type: in-portal, email, both; critical ones non-disabled. |
| 60 | SCR-CAL-04 | System announcement | `/admin/announcements/new` | Notifications | SA | Full | Subject, body (rich text), urgency, scope (all/roles/committee); preview; banner + email. |

---

### 14. User & role management (5 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 61 | SCR-USR-01 | User list | `/admin/users` | User admin | SA | Full | Columns: name, email, designation, org, role, status, last login; search, filter; Add, Edit, Deactivate. |
| 62 | SCR-USR-02 | Create / Edit user | `/admin/users/new`, `/admin/users/:id/edit` | User admin | SA | Full | Name, email, designation, org, phone, role, active; create → Keycloak + welcome email; edit: last login, MFA reset. |
| 63 | SCR-USR-03 | User profile & activity | `/admin/users/:id`, `/account/profile` | User admin | SA full; others own profile | Full/Own | Profile fields, assignments, recent activity (20), task rate, docs; SA: deactivate, reset password/MFA; self: edit limited fields. |
| 64 | SCR-USR-04 | Bulk user import | `/admin/users/bulk-import` | User admin | SA | Full | CSV template download; upload, validate, preview errors; confirm → create + welcome emails. |
| 65 | SCR-USR-05 | Role & committee assignment | `/admin/users/:id/assignments` | User admin | SA full; CO scoped | Full/Scoped | Matrix: user × committee, role per committee; CO: own committee only. |

---

### 15. System administration (5 screens)

| # | Screen ID | Screen name | URL | Workflow | Roles | Access | Implementation notes |
|---|-----------|-------------|-----|----------|-------|--------|------------------------|
| 66 | SCR-SYS-01 | System health | `/admin/system/health` | System admin | SA | Full | Cards: Next.js, each service, PostgreSQL, ES, MinIO, Redis, Kong, Keycloak; status, heartbeat, latency; link Grafana; refresh 30s. |
| 67 | SCR-SYS-02 | Audit log viewer | `/admin/audit` | System admin | SA full; IH read (IC) | Full/Read | Filters: user, action type, entity, date, IP; expand before/after; export; 50 per page; immutable. |
| 68 | SCR-SYS-03 | System configuration | `/admin/system/config` | System admin | SA | Full | Tabs: General, Session, Notifications, Storage, Workflow, Security; Test SMTP; audit log changes. |
| 69 | SCR-SYS-04 | Workflow configuration | `/admin/system/workflows` | System admin | SA | Full | Step diagram; enable/disable stages, deadlines, escalation; confirm save; new instances only. |
| 70 | SCR-SYS-05 | Backup & recovery status | `/admin/system/backups` | System admin | SA | Full | Jobs: PG, WAL, MinIO, ES; last run, status, next run, size; Run Now; runbook link; alert on fail. |

---

## Part C — Implementation status (to be filled as you build)

Use one of: **Not started** | **Stub (route + placeholder)** | **UI complete (mock)** | **Wired to API**.

| # | Screen ID | Status | Notes |
|---|-----------|--------|-------|
| 1 | SCR-AUTH-01 | | |
| 2 | SCR-AUTH-02 | | |
| 3 | SCR-AUTH-03 | | |
| 4 | SCR-AUTH-04 | | |
| 5 | SCR-AUTH-05 | | |
| 6 | SCR-DASH-01 | Wired to API | SA Dashboard: health, users, meetings, papers in approval, audit link; API + mock fallback. |
| 7 | SCR-DASH-02 | Wired to API | IH Dashboard: papers awaiting approval, upcoming meetings, participation; API + mock fallback. |
| 8 | SCR-DASH-03 | Wired to API | DL Dashboard: upcoming meetings, papers in pipeline, tasks, feedback; API + mock fallback. |
| 9 | SCR-DASH-04 | Wired to API | CO Dashboard: managed meetings, agenda consolidation, overdue tasks, papers; API + mock fallback. |
| 10 | SCR-DASH-05 | Wired to API | ME Dashboard: papers + documents from GET /papers, GET /documents; my tasks and agenda for feedback mock (no user-scoped API). |
| 11 | SCR-DASH-06 | Wired to API | VW Dashboard: active meetings, finalized docs, schedule; read-only; API + mock fallback. |
| 12 | SCR-BODY-01 | Wired to API | List GET /bodies; mock fallback; RBAC: SA Add/Edit/Deactivate, others read-only. |
| 13 | SCR-BODY-02 | Wired to API | Add/Edit POST/PUT /bodies; BodyForm; reference data for body_type; mock fallback. |
| 14 | SCR-BODY-03 | Wired to API | Detail GET /bodies/:id; hierarchy, meetings link; SA: Edit, Deactivate; mock fallback. |
| 15 | SCR-MTG-01 | Wired to API | List GET /meetings; filters body, status, year, type; mock fallback; Create: SA, CO. |
| 16 | SCR-MTG-02 | Wired to API | Create/Edit via /meetings/create, /meetings/:id/edit; MeetingForm/EditMeetingForm; mock fallback. |
| 17 | SCR-MTG-03 | Wired to API | Detail GET /meetings/:id; tabs Agenda, Documents, Participants, Tasks, CGs, History, Live, Outcomes; mock fallback. |
| 18 | SCR-MTG-04 | Wired to API | Participants tab: add/remove/role via API; SA, CO full; mock fallback when empty. |
| 19 | SCR-MTG-05 | Wired to API | History tab: GET /meetings/:id/status-history; chronological; SA, IH, DL, CO read. |
| 20 | SCR-AGN-01 | Wired to API | Agenda list from meeting detail (GET agenda-items); columns number, title, category, priority, status, deadline, coordinator, inputs; Add: SA, CO; mock fallback. |
| 21 | SCR-AGN-02 | Wired to API | Create/Edit via AgendaItemForm; POST/PATCH agenda-items; reference data; mock fallback on edit. |
| 22 | SCR-AGN-03 | Wired to API | Item detail GET agenda-items/:id; tabs Documents, Feedback, Tasks, Paper drafts, Deliberations, Activity; mock fallback. |
| 23 | SCR-DOC-01 | Wired to API | List/search via GET /documents; mock fallback. |
| 24 | SCR-DOC-02 | Wired to API | Upload via meeting POST /meetings/:id/documents. |
| 25 | SCR-DOC-03 | Wired to API | Detail GET /documents/:id; download via proxy /api/documents/:id/download. |
| 26 | SCR-DOC-04 | Wired to API | POST /documents/:id/versions (new version upload). |
| 27 | SCR-DOC-05 | Wired to API | GET /documents/:id/versions for version list; compare UI uses versions. |
| 28 | SCR-DOC-06 | UI complete (mock) | Search uses same list API with q param. |
| 29 | SCR-COL-01 | Wired to API | POST /feedback (save draft), PATCH /feedback/:id/submit; mock fallback. |
| 30 | SCR-COL-02 | Wired to API | GET /feedback?agendaItemId=; consolidate view; mock fallback. |
| 31 | SCR-COL-03 | UI complete (mock) | Deliberations: tab + standalone /deliberations; list notes; Add note form (mock). |
| 32 | SCR-COL-04 | UI complete (mock) | Comments: /documents/:id/comments, /meetings/:id/agenda/:itemId/comments; list + Add comment (mock). |
| 33 | SCR-TASK-01 | Wired to API | My tasks: mock (backend has tasks per meeting only); filters; link to meeting tasks. |
| 34 | SCR-TASK-02 | Wired to API | Create/Edit under meeting: POST/PATCH /meetings/:id/tasks; CreateTaskForm, TaskDetailClient. |
| 35 | SCR-TASK-03 | UI complete (mock) | Task detail /tasks/:id and /meetings/:id/tasks/:taskId; API for meeting-scoped; mock for standalone. |
| 36 | SCR-TASK-04 | UI complete (mock) | Team dashboard: Kanban-style by assignee/status; mock (no global tasks API). |
| 37 | SCR-PAPER-01 | Wired to API | List GET /papers; filters status, meetingId; mock fallback; RBAC per Part B. |
| 38 | SCR-PAPER-02 | Wired to API | Draft GET/PUT /papers/:id/draft; TipTap; version; mock fallback. |
| 39 | SCR-PAPER-03 | Wired to API | Approval GET /papers/:id/approval; Approve/Reject from API; mock fallback. |
| 40 | SCR-PAPER-04 | UI complete (mock) | Finalized paper view; read-only; mock; link from list. |
| 41 | SCR-PAPER-05 | Wired to API | Reject screen; POST /papers/:id/approval/reject via action; mock fallback. |
| 42 | SCR-CG-01 | Wired to API | List GET /correspondence-groups; search; RBAC; mock fallback. |
| 43 | SCR-CG-02 | Wired to API | Create/Edit via CGForm; POST/PATCH; bodies/users; mock fallback. |
| 44 | SCR-CG-03 | Wired to API | Detail GET /correspondence-groups/:id; Members/Submissions links; mock fallback. |
| 45 | SCR-CG-04 | UI complete (mock) | Members sub-page; list; mock (API when backend supports). |
| 46 | SCR-CG-05 | UI complete (mock) | Submissions sub-page; list; mock (API when backend supports). |
| 47 | SCR-LIVE-01 | Wired to API | Live lobby: GET meeting, agenda-items, participants; link to live/agenda, interventions, outcomes; mock fallback. |
| 48 | SCR-LIVE-02 | Wired to API | Live discussion board: GET agenda item; finalized position + live inputs (mock thread); link from lobby. |
| 49 | SCR-LIVE-03 | Wired to API | Intervention recorder: GET meeting + agenda; POST /meetings/:id/interventions via form; mock fallback. |
| 50 | SCR-LIVE-04 | Wired to API | Meeting outcomes: GET/POST /meetings/:id/outcomes; OutcomeForm; mock fallback; link from Live tab & lobby. |
| 51 | SCR-RPT-01 | Wired to API | Reports home; links to all report types. |
| 52 | SCR-RPT-02 | Wired to API | Meeting summary: GET /reports/meeting-summary; meeting selector; mock fallback. |
| 53 | SCR-RPT-03 | UI complete (mock) | Participation analytics: task stats, by-body table; mock data. |
| 54 | SCR-RPT-04 | Wired to API | Approval pipeline: GET /reports/approval-pipeline; mock fallback. |
| 55 | SCR-RPT-05 | Wired to API | Audit report: GET /reports/audit; mock fallback. |
| 56 | SCR-RPT-06 | UI complete (mock) | Custom report builder: entity selector, generate preview (mock table). |
| 57 | SCR-CAL-01 | Wired to API | Calendar: meetings by date (upcoming/past); GET /meetings; mock fallback. |
| 58 | SCR-CAL-02 | Wired to API | Notification centre: list, mark read, mark all read; GET/PATCH/POST; mock fallback. |
| 59 | SCR-CAL-03 | UI complete (mock) | Notification preferences: in-portal/email per type; Save (demo). |
| 60 | SCR-CAL-04 | UI complete (mock) | System announcement: form (subject, body, urgency); SA only; demo submit. |
| 61 | SCR-USR-01 | Wired to API | User list GET /users; mock fallback; SA only. |
| 62 | SCR-USR-02 | Wired to API | Create/Edit user; Keycloak sync; mock fallback. |
| 63 | SCR-USR-03 | Wired to API | User profile & activity; SA/user scope. |
| 64 | SCR-USR-04 | UI complete (mock) | Bulk user import; CSV template; demo. |
| 65 | SCR-USR-05 | Wired to API | Role & committee assignment; SA/CO scoped. |
| 66 | SCR-SYS-01 | Wired to API | System health: actuator/health for meeting-service; mock list + status. |
| 67 | SCR-SYS-02 | Wired to API | Audit log: GET /reports/audit; filters, pagination; mock fallback. |
| 68 | SCR-SYS-03 | UI complete (mock) | System config: tabs (General, Session, Notifications, etc.); demo save. |
| 69 | SCR-SYS-04 | UI complete (mock) | Workflow config: step diagram, stages, deadlines; demo save. |
| 70 | SCR-SYS-05 | UI complete (mock) | Backup & recovery: jobs table, Run now; mock data. |

---

## Part D — Route + RBAC planning (next step after checklist)

Once the full screen list and workflows above are agreed:

1. **Route map**  
   - List every URL from Part B.  
   - Group by layout: `(auth)` vs `(protected)`.  
   - Decide any route groups (e.g. `(protected)/dashboard`, `(protected)/meetings`, …).

2. **RBAC matrix → middleware**  
   - **Done (ACT-079):** `frontend/src/lib/routePermissions.ts` defines `ROUTE_PERMISSIONS` (path pattern → allowed roles) for all 70 screens per ISEP-Screens-RBAC.md §16. Middleware uses `canAccessRoute(pathname, userRoles)`; unauthorized redirect to `/unauthorized?from=...`.

3. **RoleGuard usage**  
   - For each screen, note which actions (buttons, tabs) are role-specific; use RoleGuard with the same role list as the route so UI and route stay in sync.

4. **Data scoping**  
   - Mark which screens need data scoped by committee/meeting/assignment (e.g. CO sees only their meetings; ME only assigned); implement in API layer when backend is built.

---

## Part E — URL quick reference (for route planning)

| URL pattern | Screen ID(s) |
|-------------|--------------|
| `/login` | SCR-AUTH-01 |
| `/login/mfa` | SCR-AUTH-02 |
| `/account/change-password` | SCR-AUTH-03 |
| `/session-expired` | SCR-AUTH-04 |
| `/unauthorized` | SCR-AUTH-05 |
| `/dashboard` | SCR-DASH-01 to 06 (role-based) |
| `/bodies`, `/bodies/new`, `/bodies/:id`, `/bodies/:id/edit` | SCR-BODY-01, 02, 03 |
| `/meetings`, `/meetings/new`, `/meetings/:id`, `/meetings/:id/edit` | SCR-MTG-01, 02, 03 |
| `/meetings/:id/participants`, `/meetings/:id/history` | SCR-MTG-04, 05 |
| `/meetings/:id/agenda`, `.../agenda/new`, `.../agenda/:itemId`, `.../agenda/:itemId/edit` | SCR-AGN-01, 02, 03 |
| `/meetings/:id/agenda/:itemId/feedback/submit`, `.../feedback/consolidate` | SCR-COL-01, 02 |
| `/meetings/:id/agenda/:itemId/deliberations` | SCR-COL-03 |
| `/documents`, `/documents/upload`, `/documents/:id`, `/documents/:id/new-version`, `/documents/:id/compare`, `/documents/search` | SCR-DOC-01 to 06 |
| `/documents/:id/comments`, `/meetings/:id/agenda/:itemId/comments` | SCR-COL-04 |
| `/tasks/my`, `/tasks/new`, `/tasks/:id`, `/tasks/:id/edit`, `/tasks/team` | SCR-TASK-01 to 04 |
| `/papers`, `/papers/:id/draft`, `/papers/:id/approval`, `/papers/:id/view`, `/papers/:id/reject` | SCR-PAPER-01 to 05 |
| `/correspondence-groups`, `.../new`, `.../:id`, `.../:id/edit`, `.../:id/members`, `.../:id/submissions` | SCR-CG-01 to 05 |
| `/meetings/:id/live`, `.../live/agenda/:itemId`, `.../live/interventions/new`, `/meetings/:id/outcomes` | SCR-LIVE-01 to 04 |
| `/reports`, `/reports/meeting-summary`, `/reports/analytics`, `/reports/approval-pipeline`, `/reports/audit`, `/reports/custom` | SCR-RPT-01 to 06 |
| `/calendar`, `/notifications`, `/account/notification-preferences`, `/admin/announcements/new` | SCR-CAL-01 to 04 |
| `/admin/users`, `/admin/users/new`, `/admin/users/:id`, `/admin/users/:id/edit`, `.../bulk-import`, `.../assignments` | SCR-USR-01 to 05 |
| `/admin/system/health`, `/admin/audit`, `/admin/system/config`, `.../workflows`, `.../backups` | SCR-SYS-01 to 05 |
| `/account/profile` | SCR-USR-03 (self) |

---

## Part F — Suggested implementation order (frontend-first)

| Phase | Screens | Goal |
|-------|---------|------|
| **1. Auth + shell** | SCR-AUTH-01 to 05, SCR-DASH-01 to 06 | All routes exist; role-based dashboard; middleware protects routes. |
| **2. Core list/detail** | SCR-BODY-01 to 03, SCR-MTG-01 to 05, SCR-AGN-01 to 03, SCR-DOC-01 to 03, SCR-TASK-01 to 03, SCR-CG-01 to 03, SCR-RPT-01, SCR-CAL-01 | Full navigation; list and detail pages; tabs on meeting/agenda item. |
| **3. Document + feedback** | SCR-DOC-02, 04, 05, 06, SCR-COL-01, 02, 03, 04 | Upload, version, compare, search; feedback submit + consolidate; deliberations; comments. |
| **4. Tasks + papers** | SCR-TASK-04, SCR-PAPER-01 to 05 | Team task dashboard; papers list, draft, approval, view, reject. |
| **5. CG + live + outcomes** | SCR-CG-04, 05, SCR-LIVE-01 to 04 | CG members, submissions; live lobby, discussion, interventions, outcomes. |
| **6. Reports + calendar + notifications** | SCR-RPT-02 to 06, SCR-CAL-02, 03, 04 | All report types; notification centre, preferences, announcements. |
| **7. Admin + system** | SCR-USR-01 to 05, SCR-SYS-01 to 05 | User CRUD, profile, bulk import, assignments; system health, audit, config, workflows, backups. |

After Phase 1, **Part D (Route + RBAC)** can be implemented: define `routePermissions` from Part B and wire middleware + RoleGuard.

---

*End of checklist. Total screens: 70. Use Part B for screen details; Part C for status; Part D for route + RBAC; Part E for URL lookup; Part F for build order.*
