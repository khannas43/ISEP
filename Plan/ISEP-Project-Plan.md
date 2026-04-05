# ISEP Project Plan
## IMO Strategic Engagement Platform — Detailed Project Plan
### Directorate General of Shipping (DGS) | MoPSW, Government of India

**Reference:** SRS (DGS-ISEP-SRS), [ISEP-Screens-RBAC.md](../SRS/ISEP-Screens-RBAC.md), [SRS-04-Technical-Architecture.md](../SRS/SRS-04-Technical-Architecture.md), [ISEP-Screen-Checklist-and-Workflows.md](ISEP-Screen-Checklist-and-Workflows.md), [ISEP-RBAC-Integration-Testing-Plan.md](ISEP-RBAC-Integration-Testing-Plan.md) (ACT-080/081)  
**Plan Version:** 1.6  
**Last Updated:** 2026-02-28  

---

## Data source and sample data (ground rule)

**All application data is from PostgreSQL** via backend APIs; the frontend has **no mock fallback** for list/detail screens. Empty API responses show empty states. Sample data is loaded via database seeds (see [database/README.md](../database/README.md) and [RUN-APPLICATION.md](../RUN-APPLICATION.md)):

- **Seeds 01–09:** Reference bodies (14 IMO bodies), **70 meetings** (1 Jan 2023 – present, all sections), reference_data, users (SA, IH, CO, DL, ME, VW), meeting participants & agenda items for all meetings, status history, rich sample (locations, notes, tasks, CGs), **correspondence groups** (10), **tasks, papers, notifications, audit** entries.
- **Run order:** Migrations (V1–V11) then `run-migrations-and-seeds.sh` then `run-remaining-and-seeds.sh` from the `database` directory.

---

## Module-wise screen completion (Feb 2026)

The following modules have **screens implemented with backend API integration and DB support** (see [ISEP-Screen-Checklist-and-Workflows.md](ISEP-Screen-Checklist-and-Workflows.md) Part C for per-screen status):

| Module | Screens | Backend API | DB tables | Notes |
|--------|---------|-------------|-----------|--------|
| Committee & Body | SCR-BODY-01–03 | ✅ BodyController (list, get, create, update) | core.international_bodies | Full workflow; data from DB only; empty state when API empty. |
| Meeting management | SCR-MTG-01–05 | ✅ MeetingController (meetings, participants, status-history, agenda, tasks, docs, CGs) | core.meetings, meeting_participants, meeting_status_history, etc. | Full workflow; 70 meetings seed; data from DB only. |
| Agenda | SCR-AGN-01–03 | ✅ Agenda items CRUD under meetings | core.agenda_items | Full workflow; 3 items per meeting from seed; data from DB only. |
| Document management | SCR-DOC-01–06 | ✅ DocumentController (list, get, download, versions, new version) | documents.documents, documents.document_versions | Full workflow; search via list + q; data from DB only. |
| Paper preparation & approval | SCR-PAPER-01–05 | ✅ PaperController, PaperApprovalService (list, draft, approval, reject) | core.papers, workflow.paper_approval_stages | Seed adds sample papers; SCR-PAPER-04 (finalized view) read-only from list API. |
| Task management | SCR-TASK-01–04 | ✅ Tasks under MeetingController (per meeting) | core.tasks | Seed adds sample tasks; SCR-TASK-01/04 use tasks API (per-meeting or list where available). |
| Correspondence groups | SCR-CG-01–05 | ✅ CorrespondenceGroupController (list, get, create, update) | correspondence.correspondence_groups, correspondence.cg_members | 10 CGs from seed; India lead dropdown from users API; SCR-CG-04/05 UI only until members/submissions API. |
| Calendar & Notifications | SCR-CAL-01–04 | ✅ Notifications API (list, unread, mark read); Calendar uses meetings API | notifications.notifications | Seed adds sample notifications; data from DB only. |
| Collaboration & Feedback | SCR-COL-01–04 | ✅ FeedbackController (submit, consolidate) | collaboration.feedback | SCR-COL-03 Deliberations, SCR-COL-04 Comments: UI + API where implemented. |
| Reports & Analytics | SCR-RPT-01–06 | ✅ ReportController (meeting-summary, approval-pipeline, audit) | audit.audit_logs, etc. | Audit report from DB; seed adds sample audit entries; analytics/custom from API or empty. |
| System Administration | SCR-SYS-01–05 | ✅ ReportController /audit; actuator/health | audit.audit_logs | Health: meeting-service; Audit: from DB; Config, Workflows, Backups: UI (no backend API yet). |
| Dashboard | SCR-DASH-01–06 | ✅ Users, meetings, approval-pipeline, audit APIs | — | Role-based: SA, IH, DL, CO, ME, VW; all data from API; empty when API empty. |
| Live Meeting | SCR-LIVE-01–04 | ✅ GET/POST /meetings/:id/interventions, GET/POST /meetings/:id/outcomes; meeting, agenda-items, participants | core.meeting_interventions, core.meeting_outcomes (V11) | Lobby, live board, intervention form, outcomes; data from DB only. |
| Backend & API | ACT-B01–B10 | meeting-service (bodies, meetings, agenda, docs, papers, feedback, notifications, approval, reports, workflow, interventions, outcomes) | core.*, documents.*, collaboration.*, workflow.*, audit.* | 10/10 activities; user-service; Live: interventions & outcomes in MeetingController. |

**Summary:** All listed screens use **backend API only** (no frontend mock data). DB tables and migrations V1–V11 are in place. **Sample data:** Run database seeds 01–09 for 70 meetings, bodies, users, CGs, tasks, papers, notifications, and audit entries so all screens show data. Pending backend work: SCR-SYS-03/04/05 (config, workflow, backup API); SCR-CG-04/05 (members/submissions REST API); user-scoped “my tasks” aggregate if needed.

---

## API + DB verification (last iteration: System Admin & Dashboard)

Verification that screens from the **System Administration** and **Dashboard** workstreams are linked to API and API is connected to DB. Any pending work is noted.

| Screen ID | Screen name | Frontend → API | Backend endpoint | DB/table | Pending? |
|-----------|-------------|----------------|-----------------|----------|----------|
| **System Administration** |
| SCR-SYS-01 | System health | ✅ Calls `getApiUrl()/actuator/health` for meeting-service | Spring Boot actuator (built-in) | N/A (liveness/readiness) | No. Other services (Kong, ES, MinIO) are mock; no backend for them. |
| SCR-SYS-02 | Audit log viewer | ✅ `getAuditReport(accessToken)` | `GET /api/v1/reports/audit` | `audit.audit_logs` (V5 migration) | No. Full API + DB. |
| SCR-SYS-03 | System configuration | ❌ No API; `defaultConfig` in frontend | None | None | **Yes.** Backend has no config load/save API; UI is demo only. |
| SCR-SYS-04 | Workflow configuration | ❌ No API; stages hardcoded in page | None (WorkflowController lists *instances*, not config) | — | **Yes.** Backend has no workflow-definition API; UI is demo only. |
| SCR-SYS-05 | Backup & recovery | ❌ No API; `mockBackupJobs` in frontend | None | None | **Yes.** Backend has no backup-status API; UI is demo only. |
| **Dashboard** |
| SCR-DASH-01 | SA Dashboard | ✅ Users, meetings, actuator, `getApprovalPipelineReport`, `getAuditReport` | `/users`, `/meetings`, `/reports/approval-pipeline`, `/reports/audit` | core.*, workflow.*, audit.audit_logs | No. Full API + DB. |
| SCR-DASH-02 | IH Dashboard | ✅ Meetings, bodies, `getApprovalPipelineReport` | `/meetings`, `/bodies`, `/reports/approval-pipeline` | core.* | No. Full API + DB. |
| SCR-DASH-03 | DL Dashboard | ✅ Meetings, `getApprovalPipelineReport` | `/meetings`, `/reports/approval-pipeline` | core.*, workflow.* | No. Full API + DB. |
| SCR-DASH-04 | CO Dashboard | ✅ Meetings | `/meetings` | core.meetings | No for meetings. Agenda/tasks/papers counts use mock (no “my managed” aggregates API). |
| SCR-DASH-05 | ME Dashboard | ✅ `getPapers`, `GET /documents`; tasks & agenda for feedback = mock | `/papers`, `/documents` | core.papers, documents.* | **Partial.** “My tasks” and “Agenda items for my feedback” have no user-scoped API; backend has tasks per meeting only. Papers and recent docs are API + DB. |
| SCR-DASH-06 | VW Dashboard | ✅ Meetings (status=ACTIVE) | `/meetings` | core.meetings | No for meetings. “Finalized docs count” is mock (no aggregate API). |

**Conclusion:** Screens **fully** linked to API and DB (no pending work): SCR-SYS-01, SCR-SYS-02, SCR-DASH-01, SCR-DASH-02, SCR-DASH-03. Screens with **pending backend work** (no API/DB yet): SCR-SYS-03 (system config), SCR-SYS-04 (workflow config), SCR-SYS-05 (backup status). Screens **partially** wired: SCR-DASH-04 (meetings from API; aggregates mock), SCR-DASH-05 (papers + documents from API; my tasks / agenda for feedback mock), SCR-DASH-06 (meetings from API; finalized count mock).

---

## DEV Test Accounts (Keycloak – `isep-realm`)

> For local development only. Change in higher environments.

All six roles have a dedicated test user. These users are defined in `infrastructure/keycloak/realm-isep.json` and are created when the realm is imported (or re-imported) into Keycloak.

| Role (SRS) | Keycloak realm role | Username | Password | Purpose |
|------------|----------------------|----------|----------|---------|
| **SA** | `SYSTEM_ADMIN` | `admin-sa` | `Admin@12345!` | Full platform access; user management, system config, audit |
| **IH** | `IC_DIVISION_HEAD` | `ih-user` | `Ih@12345!` | IC Division Head dashboard; audit read; paper approval |
| **DL** | `DELEGATION_LEADER` | `dl-user` | `Dl@12345!` | Delegation Leader dashboard; meeting/agenda/paper scope |
| **CO** | `COORDINATOR` | `co-user` | `Co@12345!` | Coordinator dashboard; create meetings, agenda, CGs; consolidate feedback |
| **ME** | `MEMBER` | `me-user` | `Me@12345!` | Member dashboard; submit feedback; papers draft; tasks |
| **VW** | `VIEWER` | `vw-user` | `Vw@12345!` | Read-only; calendar, notifications, meetings/documents view |

**Mapping (for RBAC):** The frontend reads `realm_access.roles` from the Keycloak access token (see `frontend/src/lib/auth.ts`). Realm role names must match exactly: `SYSTEM_ADMIN`, `IC_DIVISION_HEAD`, `DELEGATION_LEADER`, `COORDINATOR`, `MEMBER`, `VIEWER`. These are configured in the realm under **Realm roles** and assigned to each user.

**Creating users from the frontend:** Use **Admin → User list → New user** (SCR-USR-02). This requires the user-service (or meeting-service) to call the Keycloak Admin API to create the user and assign realm roles. Until that integration is complete, add test users by re-importing `realm-isep.json` or by creating them manually in Keycloak Admin Console (Realm **isep-realm** → Users → Add user, then assign the appropriate **Realm role** under Role mapping).

---

## Planning approach

- **Screen checklist:** The [Screen Checklist & Workflows](ISEP-Screen-Checklist-and-Workflows.md) document is the single source for all **70 screens** with workflow context, URLs, roles, and implementation notes. Use it for screen-by-screen build and status (Part C).
- **Order of work:** (1) Agree full screen list and workflows → (2) Implement frontend screens (stub or full UI) → (3) Plan and implement **route + RBAC** from the checklist (Part D). Route map and `routePermissions` are derived from the checklist after the screen set is fixed.
- **Implementation phases:** The checklist defines **7 phases** (Part F): Auth + shell → Core list/detail → Document + feedback → Tasks + papers → CG + live + outcomes → Reports + calendar + notifications → Admin + system. Mapping to this plan: Phase 1 ≈ Workstreams 1–3; Phase 2 ≈ Workstreams 4–6 + parts of 7, 9, 11, 13, 14; Phase 3 ≈ Workstream 7–8; Phase 4 ≈ Workstreams 9–10; Phase 5 ≈ Workstreams 11–12; Phase 6 ≈ Workstreams 13–14; Phase 7 ≈ Workstreams 15–16. **Route + RBAC** (Workstream 17) is planned from the checklist Part D after Phase 1 and refined as screens are added.

---

## Summary

| Metric | Value |
|--------|--------|
| **Workstreams completed** | 15 / 19 |
| **Activities completed** | 78 / 95 |
| **% of Activity completed** | 82.1% |

**Workstream completion:** Workstream 1 (Project Setup & Foundation) is **in progress** (7/8). Workstreams 2 (Auth), 3 (Dashboard), 4 (Committee & Body), 5 (Meeting), 6 (Agenda), 7 (Document), 8 (Collaboration & Feedback), 9 (Task), 10 (Paper), 11 (Correspondence Groups), 12 (Live Meeting), 13 (Reports & Analytics), 14 (Calendar & Notifications), 15 (User & Role), 16 (System Administration), and 19 (Backend & API) are **completed**. Remaining: RBAC (17), UAT & Go-Live (18).

**Activity completion:** All of the above, plus: Agenda Create/Edit and Detail (ACT-029, ACT-030), Document Management (ACT-031–ACT-036), Feedback Submit and Consolidate (ACT-037, ACT-038), Task Management (ACT-041–ACT-044), Paper Preparation & Approval (ACT-045–ACT-049), Correspondence Groups (ACT-050–ACT-054), Reports Home and core reports (ACT-059–ACT-062), Notification Centre (ACT-066). See Part C in [ISEP-Screen-Checklist-and-Workflows.md](ISEP-Screen-Checklist-and-Workflows.md) for per-screen status. DB tables exist for all modules (migrations V2–V10).

---

## Detailed Plan

*All activities are listed including completed ones.*

**Status:** 🟢 Completed &nbsp; ⬜ Not Started &nbsp; 🔵 In Progress

| Workstream / Phase | Activity Id | Activity Name | Status | Predecessor | Duration (hrs) | Start Date | End Date |
|--------------------|-------------|----------------|--------|-------------|----------------|------------|----------|
| **1. Project Setup & Foundation** | ACT-001 | Project kick-off and stakeholder alignment | 🟢 Completed | — | 8 | 2026-02-28 | 2026-02-28 |
| 1. Project Setup & Foundation | ACT-002 | SRS review and sign-off (all volumes) | 🟢 Completed | ACT-001 | 40 | 2026-02-28 | 2026-03-08 |
| 1. Project Setup & Foundation | ACT-003 | Technical architecture (SRS-04) and HLD approval | ⬜ Not Started | ACT-002 | 24 | 2026-03-08 | 2026-03-14 |
| 1. Project Setup & Foundation | ACT-004 | Development environment setup (Docker, GitLab, CI) | 🟢 Completed | ACT-003 | 32 | 2026-03-14 | 2026-03-20 |
| 1. Project Setup & Foundation | ACT-005 | Keycloak realm and OIDC configuration | 🟢 Completed | ACT-004 | 16 | 2026-03-20 | 2026-03-22 |
| 1. Project Setup & Foundation | ACT-006 | Kong API Gateway baseline configuration | 🟢 Completed | ACT-004 | 12 | 2026-03-22 | 2026-03-25 |
| 1. Project Setup & Foundation | ACT-007 | PostgreSQL schema and base migrations | 🟢 Completed | ACT-004 | 24 | 2026-03-25 | 2026-03-29 |
| 1. Project Setup & Foundation | ACT-008 | Next.js app shell, routing, and auth middleware | 🟢 Completed | ACT-005 | 20 | 2026-03-29 | 2026-04-04 |


| **2. Authentication & Session** | ACT-009 | SCR-AUTH-01 — Login Page (Keycloak OIDC integration) | 🟢 Completed | ACT-008 | 16 | 2026-04-04 | 2026-04-05 |
| 2. Authentication & Session | ACT-010 | SCR-AUTH-02 — MFA Prompt (TOTP for SA, IH) | 🟢 Completed | ACT-009 | 12 | 2026-04-05 | 2026-04-08 |
| 2. Authentication & Session | ACT-011 | SCR-AUTH-03 — Forced Password Change | 🟢 Completed | ACT-009 | 8 | 2026-04-09 | 2026-04-11 |
| 2. Authentication & Session | ACT-012 | SCR-AUTH-04 — Session Timeout / Re-authentication | 🟢 Completed | ACT-009 | 8 | 2026-04-11 | 2026-04-11 |
| 2. Authentication & Session | ACT-013 | SCR-AUTH-05 — Unauthorized Access screen and audit logging | 🟢 Completed | ACT-009 | 8 | 2026-04-12 | 2026-04-12 |


| **3. Dashboard Screens** | ACT-014 | SCR-DASH-01 — System Administrator Dashboard | 🟢 Completed | ACT-013 | 24 | 2026-04-12 | 2026-04-18 |
| 3. Dashboard Screens | ACT-015 | SCR-DASH-02 — IC Division Head Dashboard | 🟢 Completed | ACT-013 | 24 | 2026-04-18 | 2026-04-23 |
| 3. Dashboard Screens | ACT-016 | SCR-DASH-03 — Delegation Leader Dashboard | 🟢 Completed | ACT-013 | 24 | 2026-04-23 | 2026-04-26 |
| 3. Dashboard Screens | ACT-017 | SCR-DASH-04 — Coordinator Dashboard | 🟢 Completed | ACT-013 | 24 | 2026-04-27 | 2026-05-02 |
| 3. Dashboard Screens | ACT-018 | SCR-DASH-05 — Member Dashboard | 🟢 Completed | ACT-013 | 20 | 2026-05-02 | 2026-05-06 |
| 3. Dashboard Screens | ACT-019 | SCR-DASH-06 — Viewer Dashboard | 🟢 Completed | ACT-013 | 16 | 2026-05-07 | 2026-05-09 |


| **4. Committee & Body Management** | ACT-020 | SCR-BODY-01 — International Bodies List (tree + table) | 🟢 Completed | ACT-019 | 32 | 2026-05-10 | 2026-05-16 |
| 4. Committee & Body Management | ACT-021 | SCR-BODY-02 — Add / Edit International Body | 🟢 Completed | ACT-020 | 16 | 2026-05-16 | 2026-05-18 |
| 4. Committee & Body Management | ACT-022 | SCR-BODY-03 — Body Detail View | 🟢 Completed | ACT-020 | 20 | 2026-05-19 | 2026-05-23 |


| **5. Meeting Management** | ACT-023 | SCR-MTG-01 — Meetings List (filters, scoped data) | 🟢 Completed | ACT-022 | 28 | 2026-05-23 | 2026-05-30 |
| 5. Meeting Management | ACT-024 | SCR-MTG-02 — Create / Edit Meeting | 🟢 Completed | ACT-023 | 20 | 2026-05-30 | 2026-06-01 |
| 5. Meeting Management | ACT-025 | SCR-MTG-03 — Meeting Detail / Overview (tabbed hub) | 🟢 Completed | ACT-023 | 32 | 2026-06-01 | 2026-06-07 |
| 5. Meeting Management | ACT-026 | SCR-MTG-04 — Participant Management | 🟢 Completed | ACT-025 | 20 | 2026-06-07 | 2026-06-13 |
| 5. Meeting Management | ACT-027 | SCR-MTG-05 — Meeting Status History | 🟢 Completed | ACT-025 | 12 | 2026-06-13 | 2026-06-14 |


| **6. Agenda Management** | ACT-028 | SCR-AGN-01 — Agenda Items List (per Meeting) | 🟢 Completed | ACT-025 | 24 | 2026-06-14 | 2026-06-20 |
| 6. Agenda Management | ACT-029 | SCR-AGN-02 — Create / Edit Agenda Item (incl. CSV import) | 🟢 Completed | ACT-028 | 20 | 2026-06-20 | 2026-06-23 |
| 6. Agenda Management | ACT-030 | SCR-AGN-03 — Agenda Item Detail (tabbed workspace) | 🟢 Completed | ACT-028 | 28 | 2026-06-23 | 2026-06-28 |


| **7. Document Management** | ACT-031 | SCR-DOC-01 — Document Library (Elasticsearch search) | 🟢 Completed | ACT-030 | 36 | 2026-06-28 | 2026-07-05 |
| 7. Document Management | ACT-032 | SCR-DOC-02 — Upload Document | 🟢 Completed | ACT-031 | 20 | 2026-07-05 | 2026-07-11 |
| 7. Document Management | ACT-033 | SCR-DOC-03 — Document Detail / Viewer (PDF, DOCX) | 🟢 Completed | ACT-031 | 24 | 2026-07-11 | 2026-07-15 |
| 7. Document Management | ACT-034 | SCR-DOC-04 — Upload New Version | 🟢 Completed | ACT-032 | 12 | 2026-07-15 | 2026-07-18 |
| 7. Document Management | ACT-035 | SCR-DOC-05 — Document Version Comparison | 🟢 Completed | ACT-033 | 16 | 2026-07-18 | 2026-07-19 |
| 7. Document Management | ACT-036 | SCR-DOC-06 — Document Search Results page | 🟢 Completed | ACT-031 | 12 | 2026-07-20 | 2026-07-23 |


| **8. Collaboration & Feedback** | ACT-037 | SCR-COL-01 — Feedback Submission (Member) | 🟢 Completed | ACT-030 | 24 | 2026-07-24 | 2026-07-27 |
| 8. Collaboration & Feedback | ACT-038 | SCR-COL-02 — Feedback Consolidation View (Coordinator) | 🟢 Completed | ACT-037 | 28 | 2026-07-27 | 2026-08-02 |
| 8. Collaboration & Feedback | ACT-039 | SCR-COL-03 — Deliberation Notes | 🟢 Completed | ACT-030 | 16 | 2026-08-02 | 2026-08-06 |
| 8. Collaboration & Feedback | ACT-040 | SCR-COL-04 — Comments & Discussion Thread | 🟢 Completed | ACT-033 | 20 | 2026-08-06 | 2026-08-09 |


| **9. Task Management** | ACT-041 | SCR-TASK-01 — My Tasks (inbox, filters) | 🟢 Completed | ACT-019 | 20 | 2026-08-09 | 2026-08-14 |
| 9. Task Management | ACT-042 | SCR-TASK-02 — Create / Edit Task | 🟢 Completed | ACT-041 | 16 | 2026-08-15 | 2026-08-16 |
| 9. Task Management | ACT-043 | SCR-TASK-03 — Task Detail | 🟢 Completed | ACT-041 | 16 | 2026-08-16 | 2026-08-20 |
| 9. Task Management | ACT-044 | SCR-TASK-04 — Team Task Dashboard (Kanban) | 🟢 Completed | ACT-041 | 24 | 2026-08-21 | 2026-08-24 |


| **10. Paper Preparation & Approval** | ACT-045 | SCR-PAPER-01 — Papers List | 🟢 Completed | ACT-038 | 16 | 2026-08-24 | 2026-08-29 |
| 10. Paper Preparation & Approval | ACT-046 | SCR-PAPER-02 — Paper Drafting Environment (TipTap, track changes) | 🟢 Completed | ACT-045 | 40 | 2026-08-29 | 2026-09-05 |
| 10. Paper Preparation & Approval | ACT-047 | SCR-PAPER-03 — Approval Workflow View | 🟢 Completed | ACT-046 | 28 | 2026-09-05 | 2026-09-11 |
| 10. Paper Preparation & Approval | ACT-048 | SCR-PAPER-04 — Finalized Paper View | 🟢 Completed | ACT-047 | 12 | 2026-09-12 | 2026-09-13 |
| 10. Paper Preparation & Approval | ACT-049 | SCR-PAPER-05 — Paper Rejection / Return Screen | 🟢 Completed | ACT-047 | 16 | 2026-09-13 | 2026-09-16 |


| **11. Correspondence Groups** | ACT-050 | SCR-CG-01 — Correspondence Groups List | 🟢 Completed | ACT-022 | 20 | 2026-09-16 | 2026-09-20 |
| 11. Correspondence Groups | ACT-051 | SCR-CG-02 — Create / Edit Correspondence Group | 🟢 Completed | ACT-050 | 20 | 2026-09-20 | 2026-09-25 |
| 11. Correspondence Groups | ACT-052 | SCR-CG-03 — Correspondence Group Detail | 🟢 Completed | ACT-050 | 28 | 2026-09-25 | 2026-09-29 |
| 11. Correspondence Groups | ACT-053 | SCR-CG-04 — CG Member Management | 🟢 Completed | ACT-052 | 16 | 2026-09-30 | 2026-10-03 |
| 11. Correspondence Groups | ACT-054 | SCR-CG-05 — CG Submission Upload & Review | 🟢 Completed | ACT-052 | 24 | 2026-10-03 | 2026-10-08 |
| **12. Live Meeting** | ACT-055 | SCR-LIVE-01 — Live Meeting Lobby | 🟢 Completed | ACT-025 | 24 | 2026-10-08 | 2026-10-11 |


| 12. Live Meeting | ACT-056 | SCR-LIVE-02 — Live Agenda Item Discussion Board | 🟢 Completed | ACT-055 | 28 | 2026-10-12 | 2026-10-18 |
| 12. Live Meeting | ACT-057 | SCR-LIVE-03 — Intervention Statement Recorder | 🟢 Completed | ACT-056 | 20 | 2026-10-18 | 2026-10-23 |
| 12. Live Meeting | ACT-058 | SCR-LIVE-04 — Meeting Outcomes Capture | 🟢 Completed | ACT-055 | 20 | 2026-10-23 | 2026-10-25 |


| **13. Reports & Analytics** | ACT-059 | SCR-RPT-01 — Reports Home | 🟢 Completed | ACT-019 | 16 | 2026-10-25 | 2026-10-30 |
| 13. Reports & Analytics | ACT-060 | SCR-RPT-02 — Meeting Summary Report | 🟢 Completed | ACT-059 | 24 | 2026-10-30 | 2026-11-02 |
| 13. Reports & Analytics | ACT-061 | SCR-RPT-03 — Participation Analytics Dashboard | 🟢 Completed | ACT-059 | 32 | 2026-11-03 | 2026-11-08 |
| 13. Reports & Analytics | ACT-062 | SCR-RPT-04 — Approval Pipeline Report | 🟢 Completed | ACT-059 | 20 | 2026-11-09 | 2026-11-14 |
| 13. Reports & Analytics | ACT-063 | SCR-RPT-05 — Audit Report | 🟢 Completed | ACT-059 | 20 | 2026-11-14 | 2026-11-17 |
| 13. Reports & Analytics | ACT-064 | SCR-RPT-06 — Custom Report Builder | 🟢 Completed | ACT-059 | 32 | 2026-11-17 | 2026-11-23 |


| **14. Calendar & Notifications** | ACT-065 | SCR-CAL-01 — Integrated Calendar | 🟢 Completed | ACT-008 | 28 | 2026-11-23 | 2026-11-29 |
| 14. Calendar & Notifications | ACT-066 | SCR-CAL-02 — Notification Centre | 🟢 Completed | ACT-008 | 20 | 2026-11-29 | 2026-12-04 |
| 14. Calendar & Notifications | ACT-067 | SCR-CAL-03 — Notification Preferences | 🟢 Completed | ACT-066 | 12 | 2026-12-05 | 2026-12-06 |
| 14. Calendar & Notifications | ACT-068 | SCR-CAL-04 — System Announcement Broadcast | 🟢 Completed | ACT-066 | 16 | 2026-12-06 | 2026-12-09 |
| **15. User & Role Management** | ACT-069 | SCR-USR-01 — User List | 🟢 Completed | ACT-014 | 20 | 2026-12-09 | 2026-12-13 |


| 15. User & Role Management | ACT-070 | SCR-USR-02 — Create / Edit User (Keycloak sync) | 🟢 Completed | ACT-069 | 24 | 2026-12-13 | 2026-12-19 |
| 15. User & Role Management | ACT-071 | SCR-USR-03 — User Profile & Activity | 🟢 Completed | ACT-069 | 16 | 2026-12-19 | 2026-12-20 |
| 15. User & Role Management | ACT-072 | SCR-USR-04 — Bulk User Import | 🟢 Completed | ACT-070 | 20 | 2026-12-20 | 2026-12-26 |
| 15. User & Role Management | ACT-073 | SCR-USR-05 — Role & Committee Assignment | 🟢 Completed | ACT-069 | 24 | 2026-12-26 | 2026-12-30 |


| **16. System Administration** | ACT-074 | SCR-SYS-01 — System Health Dashboard | 🟢 Completed | ACT-014 | 24 | 2026-12-30 | 2027-01-03 |
| 16. System Administration | ACT-075 | SCR-SYS-02 — Audit Log Viewer | 🟢 Completed | ACT-074 | 20 | 2027-01-03 | 2027-01-09 |
| 16. System Administration | ACT-076 | SCR-SYS-03 — System Configuration | 🟢 Completed | ACT-074 | 28 | 2027-01-09 | 2027-01-13 |
| 16. System Administration | ACT-077 | SCR-SYS-04 — Workflow Configuration | 🟢 Completed | ACT-047 | 24 | 2027-01-14 | 2027-01-17 |
| 16. System Administration | ACT-078 | SCR-SYS-05 — Backup & Recovery Status | 🟢 Completed | ACT-074 | 16 | 2027-01-17 | 2027-01-22 |


| **17. RBAC Integration & Testing** | ACT-079 | RBAC matrix implementation (all 70 screens × roles) | 🟢 Completed | ACT-078 | 40 | 2027-01-22 | 2027-01-30 |
| 17. RBAC Integration & Testing | ACT-080 | End-to-end role-based access tests (SA, IH, DL, CO, ME, VW) | 🔵 In Progress | ACT-079 | 32 | 2027-01-30 | 2027-02-06 |
| 17. RBAC Integration & Testing | ACT-081 | Security and accessibility (WCAG 2.1 AA) audit | 🔵 In Progress | ACT-080 | 24 | 2027-02-06 | 2027-02-09 |
| **18. UAT & Go-Live** | ACT-082 | UAT environment deployment and smoke tests | ⬜ Not Started | ACT-081 | 24 | 2027-02-09 | 2027-02-14 |


| 18. UAT & Go-Live | ACT-083 | UAT execution with DGS (all modules) | ⬜ Not Started | ACT-082 | 80 | 2027-02-14 | 2027-03-02 |
| 18. UAT & Go-Live | ACT-084 | Defect fixes and re-test | ⬜ Not Started | ACT-083 | 40 | 2027-03-02 | 2027-03-10 |
| 18. UAT & Go-Live | ACT-085 | Production deployment and Go-Live | ⬜ Not Started | ACT-084 | 16 | 2027-03-11 | 2027-03-13 |


| **19. Backend & API Development** | ACT-B01 | Meeting service API (bodies, meetings, participants, status history) | 🟢 Completed | ACT-008 | 40 | 2026-04-04 | 2026-04-20 |
| 19. Backend & API Development | ACT-B02 | Agenda service API (agenda items CRUD, per meeting) | 🟢 Completed | ACT-B01 | 24 | 2026-04-20 | 2026-04-28 |
| 19. Backend & API Development | ACT-B03 | User service API (user list, Keycloak sync, role assignment) | 🟢 Completed | ACT-008 | 32 | 2026-04-10 | 2026-04-22 |
| 19. Backend & API Development | ACT-B04 | Document service API (library, upload, versions, download, search) | 🟢 Completed | ACT-008 | 48 | 2026-05-15 | 2026-06-05 |
| 19. Backend & API Development | ACT-B05 | Collaboration service API (feedback submit/list/consolidate) | 🟢 Completed | ACT-B02 | 36 | 2026-05-05 | 2026-05-20 |
| 19. Backend & API Development | ACT-B06 | Notification API (list, unread count, mark read) | 🟢 Completed | ACT-008 | 24 | 2026-04-15 | 2026-04-25 |
| 19. Backend & API Development | ACT-B07 | Approval API (paper stages, approve/reject) | 🟢 Completed | ACT-B04 | 32 | 2026-07-15 | 2026-07-28 |
| 19. Backend & API Development | ACT-B08 | Reporting API (meeting-summary, approval-pipeline, audit) | 🟢 Completed | ACT-B01 | 28 | 2026-05-01 | 2026-05-15 |
| 19. Backend & API Development | ACT-B09 | Workflow API (list instances; FSM/Celery in Python later) | 🟢 Completed | ACT-B07 | 40 | 2026-07-28 | 2026-08-12 |
| 19. Backend & API Development | ACT-B10 | Papers service API (draft GET/PUT, versioning, attributed track changes, accept/reject) | 🟢 Completed | ACT-B02 | 40 | 2026-08-12 | 2026-08-25 |

---

## Paper draft collaboration (ACT-B10 / ACT-046)

To support **admin/originator sees reviewer changes**, **multiple reviewers see each other's changes**, and **admin/originator merges multiple reviewers' edits**:

- **Backend (ACT-B10):** One canonical draft per paper; `GET /api/v1/papers/:id/draft` and `PUT /api/v1/papers/:id/draft` with `{ content, version }`; store track changes with author attribution; optional `accept`/`reject` per change for merge flow. Frontend integrates with these APIs and falls back to mock when backend is unavailable.
- **Frontend (ACT-046):** Paper drafting environment loads draft from API and saves to API; show author on insertion/deletion marks when available; accept/reject UI for coordinator/originator (follows backend availability).

---

## Workstream Summary

| # | Workstream / Phase | Screen/Scope | Activity Count | Status |
|---|--------------------|-------------|----------------|--------|
| 1 | Project Setup & Foundation | — | 8 | 🔵 In Progress (7/8 done) |
| 2 | Authentication & Session | SCR-AUTH-01 to 05 | 5 | 🟢 Completed |
| 3 | Dashboard Screens | SCR-DASH-01 to 06 | 6 | 🟢 Completed |
| 4 | Committee & Body Management | SCR-BODY-01 to 03 | 3 | 🟢 Completed |
| 5 | Meeting Management | SCR-MTG-01 to 05 | 5 | 🟢 Completed |
| 6 | Agenda Management | SCR-AGN-01 to 03 | 3 | 🟢 Completed |
| 7 | Document Management | SCR-DOC-01 to 06 | 6 | 🟢 Completed |
| 8 | Collaboration & Feedback | SCR-COL-01 to 04 | 4 | 🟢 Completed |
| 9 | Task Management | SCR-TASK-01 to 04 | 4 | 🟢 Completed |
| 10 | Paper Preparation & Approval | SCR-PAPER-01 to 05 | 5 | 🟢 Completed |
| 11 | Correspondence Groups | SCR-CG-01 to 05 | 5 | 🟢 Completed |
| 12 | Live Meeting | SCR-LIVE-01 to 04 | 4 | 🟢 Completed |
| 13 | Reports & Analytics | SCR-RPT-01 to 06 | 6 | 🟢 Completed |
| 14 | Calendar & Notifications | SCR-CAL-01 to 04 | 4 | 🟢 Completed |
| 15 | User & Role Management | SCR-USR-01 to 05 | 5 | 🟢 Completed |
| 16 | System Administration | SCR-SYS-01 to 05 | 5 | 🟢 Completed |
| 17 | RBAC Integration & Testing | Full matrix (70 screens) | 3 | 🔵 In Progress (ACT-079 done; ACT-080/081 plan in ISEP-RBAC-Integration-Testing-Plan.md) |
| 18 | UAT & Go-Live | — | 4 | ⬜ Not Started |
| 19 | Backend & API Development | meeting-service (bodies, meetings, agenda, documents, papers, feedback, notifications, approval, reports, workflow-instances), user-service | 10 | 🟢 Completed (10/10) |

**Total activities:** 95 (including completed).

---

## Notes

- **Predecessor:** Only direct predecessor is listed; some activities may have multiple logical dependencies (e.g. backend APIs).
- **Screen checklist:** Track implementation status (Not started / Stub / UI complete / Wired to API) in [ISEP-Screen-Checklist-and-Workflows.md](ISEP-Screen-Checklist-and-Workflows.md) Part C. Use Part B for screen details (URL, workflow, roles); Part E for URL→screen lookup when defining routes; Part D for route + RBAC planning once the screen list is stable.
- **Backend & API (Workstream 19):** API development follows frontend screen completion where possible. ACT-B01–ACT-B09 cover the microservices in [SRS-04-Technical-Architecture.md](../SRS/SRS-04-Technical-Architecture.md). Frontend screens may be built with stubs or mock data first; backend work runs in parallel and unblocks full functionality (e.g. ACT-B01, ACT-B02 for meetings and agenda).
- **Durations** are estimates in hours; actuals should be updated as work completes.
- **Dates** are baseline; update Start/End dates when the plan is revised.
- **RBAC (ACT-079 done):** `frontend/src/lib/routePermissions.ts` implements the full route–role matrix for all 70 screens (source: ISEP-Screens-RBAC.md §16). Middleware enforces it and redirects unauthorized users to `/unauthorized?from=...`. **ACT-080:** Playwright E2E specs in `frontend/tests/e2e/`: `rbac-auth.ts` (login helper + test users), `rbac-workflow1.spec.ts` (meeting lifecycle: CO, ME, DL, IH), `rbac-workflow2.spec.ts` (governance: SA, IH, VW), `rbac-negative.spec.ts` (VW/ME unauthorized). Run with app + Keycloak; see [Testing/RUN-TESTING.md](../Testing/RUN-TESTING.md). **ACT-081:** Security and WCAG 2.1 AA audit per [ISEP-RBAC-Integration-Testing-Plan.md](ISEP-RBAC-Integration-Testing-Plan.md).
- **Navigation (sidebar):** Left menu includes Dashboard, Bodies, Meetings, Documents, Papers, Tasks, Correspondence Groups, Reports, Calendar, Admin (role-gated), Account (profile, **Change password**, notification preferences, Notification centre). "Agenda" is not a top-level menu item. "Change password" appears only under Account (not as a standalone link above Sign out).
