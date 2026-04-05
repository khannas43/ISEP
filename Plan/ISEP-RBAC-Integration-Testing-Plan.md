# ISEP — RBAC Integration Testing Detailed Plan
## ACT-080 (E2E role-based access tests) & ACT-081 (Security and accessibility audit)

**Version:** 1.1  
**Last updated:** 2026-02-28  
**Reference:** [ISEP-Project-Plan.md](ISEP-Project-Plan.md) Workstream 17, [ISEP-Screens-RBAC.md](../SRS/ISEP-Screens-RBAC.md), [ISEP-Screen-Checklist-and-Workflows.md](ISEP-Screen-Checklist-and-Workflows.md)

---

## 1. Purpose and scope

This document defines **two end-to-end workflows** used to test the entire application with **role-based access control (RBAC)**. For each step, the plan specifies:

- **Role** — which test user (SA, IH, DL, CO, ME, VW) performs the step  
- **Task** — the action to be performed  
- **Screen** — screen ID and URL where the task is done  
- **Expected result** — access allowed/denied and UI behaviour  

Together, the two workflows cover all six roles and touch the majority of the 70 screens, so that RBAC integration (ACT-079) and E2E role-based tests (ACT-080) can be executed systematically. ACT-081 (WCAG 2.1 AA audit) is scoped in §4.

---

## 2. Test users (Keycloak `isep-realm`)

Use the test accounts from [ISEP-Project-Plan.md § DEV Test Accounts](ISEP-Project-Plan.md) and [infrastructure/keycloak/README.md](../infrastructure/keycloak/README.md):

| Role | Username  | Password    | Use in workflows |
|------|-----------|--------------|-------------------|
| SA   | admin-sa  | Admin@12345! | Workflow 2 (admin, audit, config) |
| IH   | ih-user   | Ih@12345!    | Workflow 1 (approval); Workflow 2 (audit read, reports) |
| DL   | dl-user   | Dl@12345!    | Workflow 1 (meeting view, live, interventions) |
| CO   | co-user   | Co@12345!    | Workflow 1 (create meeting, agenda, consolidate) |
| ME   | me-user   | Me@12345!    | Workflow 1 (feedback submit, papers draft) |
| VW   | vw-user   | Vw@12345!    | Workflow 2 (read-only path) |

---

## 3. Workflow 1 — Meeting lifecycle and collaboration

**Objective:** Verify that Coordinator, Member, Delegation Leader, and IC Division Head can perform their respective tasks across the meeting lifecycle (create meeting → agenda → documents → feedback → live → outcomes) and that route/screen access matches the RBAC matrix.

| Step | Role | Task | Screen (ID) | URL / path | Expected result |
|------|------|------|-------------|------------|-----------------|
| 1.1 | CO | Log in and land on role dashboard | SCR-DASH-04 | `/dashboard` | Coordinator dashboard with managed meetings, agenda consolidation, tasks, papers. |
| 1.2 | CO | Open meetings list and create a new meeting | SCR-MTG-01, SCR-MTG-02 | `/meetings`, `/meetings/create` | List visible; "Create Meeting" available; form saves (body, title, dates, type). |
| 1.3 | CO | Open the created meeting and view overview | SCR-MTG-03 | `/meetings/:id` | Meeting detail with tabs: Overview, Agenda, Documents, Participants, Tasks, Correspondence, Live, Outcomes, History. |
| 1.4 | CO | Add agenda items to the meeting | SCR-AGN-01, SCR-AGN-02 | `/meetings/:id?tab=agenda`, `/meetings/:id/agenda/new` | Agenda list; "Add agenda item" works; item created with number, title, category. |
| 1.5 | CO | Add participants to the meeting | SCR-MTG-04 | `/meetings/:id?tab=participants` | Participants tab visible; add participant (user picker); assign meeting role. |
| 1.6 | CO | Upload a document linked to the meeting | SCR-DOC-02 or meeting Documents tab | `/documents/upload` or meeting Documents | Upload form; document linked to meeting/agenda item; appears in library. |
| 1.7 | ME | Log in and land on Member dashboard | SCR-DASH-05 | `/dashboard` | Member dashboard: my tasks, agenda items for feedback, papers, recent docs. |
| 1.8 | ME | Open the same meeting and go to an agenda item | SCR-MTG-03, SCR-AGN-03 | `/meetings/:id`, `/meetings/:id/agenda/:itemId` | Meeting and agenda item detail visible (read or partial per matrix). |
| 1.9 | ME | Submit feedback for an agenda item | SCR-COL-01 | `/meetings/:id/agenda/:itemId/feedback/submit` | Feedback submit form; position, comments; submit succeeds. |
| 1.10 | ME | Open papers list and draft a paper | SCR-PAPER-01, SCR-PAPER-02 | `/papers`, `/papers/:id/draft` | Papers list; open draft; edit content; save. |
| 1.11 | CO | Open the meeting and consolidate feedback for the agenda item | SCR-COL-02 | `/meetings/:id/agenda/:itemId/feedback/consolidate` | Consolidation view; participant list and feedback; consolidate/finalize actions. |
| 1.12 | CO | Add a deliberation note on the agenda item | SCR-COL-03 | `/meetings/:id/agenda/:itemId/deliberations` | Deliberations page; add note; note appears in list. |
| 1.13 | DL | Log in and land on Delegation Leader dashboard | SCR-DASH-03 | `/dashboard` | DL dashboard: upcoming meetings, papers in pipeline, delegation tasks, live meeting link. |
| 1.14 | DL | Open the meeting and go to Live lobby | SCR-LIVE-01 | `/meetings/:id/live` | Live meeting lobby; agenda items list; participants; link to intervention recorder. |
| 1.15 | DL | Open an agenda item live discussion board | SCR-LIVE-02 | `/meetings/:id/live/agenda/:itemId` | Live board: finalized position (read-only), live inputs thread. |
| 1.16 | CO | Record an intervention for the meeting | SCR-LIVE-03 | `/meetings/:id/live/interventions/new` | Intervention form: agenda item, text, delivered by, type; save succeeds. |
| 1.17 | CO | Capture meeting outcomes for an agenda item | SCR-LIVE-04 | `/meetings/:id/outcomes` | Outcomes page; add outcome (agenda item, decision, next steps); save. |
| 1.18 | IH | Log in and land on IC Division Head dashboard | SCR-DASH-02 | `/dashboard` | IH dashboard: papers awaiting approval, upcoming meetings, participation summary. |
| 1.19 | IH | Open approval workflow for a paper | SCR-PAPER-03 | `/papers/:id/approval` | Approval view; stages; approve/reject (if at IH stage). |
| 1.20 | DL | Open task list by meeting and create a task | SCR-TASK-01, SCR-TASK-02 | `/tasks/my`, `/tasks/new` or from meeting | My tasks; create task (title, assignee, due date, linked meeting); save. |
| 1.21 | ME | Open calendar and notifications | SCR-CAL-01, SCR-CAL-02 | `/calendar`, `/notifications` | Calendar with meetings; notification centre; mark read. |
| 1.22 | CO | Open reports: meeting summary and approval pipeline | SCR-RPT-01, SCR-RPT-02, SCR-RPT-04 | `/reports`, `/reports/meeting-summary`, `/reports/approval-pipeline` | Reports home; meeting summary (select meeting); approval pipeline report. |

**Negative checks (optional):** As **ME**, attempt to open `/meetings/:id/participants` (edit) — expect read-only or no add/remove. As **VW**, attempt `/meetings/:id/live/interventions/new` — expect redirect to `/unauthorized`.

---

## 4. Workflow 2 — Governance, administration and read-only

**Objective:** Verify that System Administrator and Viewer have correct access to admin and read-only screens; IH has audit read and report access where allowed.

| Step | Role | Task | Screen (ID) | URL / path | Expected result |
|------|------|------|-------------|------------|-----------------|
| 2.1 | SA | Log in (and complete MFA if enforced) and land on SA dashboard | SCR-DASH-01 | `/dashboard` | SA dashboard: health, users count, meetings, audit snippet, announcements. |
| 2.2 | SA | Open bodies list and edit a body | SCR-BODY-01, SCR-BODY-02, SCR-BODY-03 | `/bodies`, `/bodies/:id/edit` | Bodies list; Edit visible; edit form (name, type, parent); save. |
| 2.3 | SA | Open user list and create a new user | SCR-USR-01, SCR-USR-02 | `/admin/users`, `/admin/users/new` | User list; New user; form (name, email, role); save (Keycloak sync if implemented). |
| 2.4 | SA | Open user profile and role assignments | SCR-USR-03, SCR-USR-05 | `/admin/users/:id`, `/admin/users/:id/assignments` | User detail; Assignments; matrix committee/role. |
| 2.5 | SA | Open system health dashboard | SCR-SYS-01 | `/admin/system/health` | Health cards: meeting-service (and others); status, latency. |
| 2.6 | SA | Open audit log viewer | SCR-SYS-02 | `/admin/audit` | Audit log list; filters (user, action, date); pagination. |
| 2.7 | SA | Open system config and workflow config | SCR-SYS-03, SCR-SYS-04 | `/admin/system/config`, `/admin/system/workflows` | Config tabs; workflow stages; save (demo or API). |
| 2.8 | SA | Open backup status and announcements | SCR-SYS-05, SCR-CAL-04 | `/admin/system/backups`, `/admin/announcements/new` | Backup jobs list; announcement form (subject, body, urgency). |
| 2.9 | IH | Log in and open audit log (read-only) | SCR-SYS-02 | `/admin/audit` | Audit log visible (read-only); no config/edit. |
| 2.10 | IH | Open reports: audit and custom | SCR-RPT-05, SCR-RPT-06 | `/reports/audit`, `/reports/custom` | Audit report (IH allowed read per matrix); custom report builder. |
| 2.11 | VW | Log in and land on Viewer dashboard | SCR-DASH-06 | `/dashboard` | Viewer dashboard: read-only; active meetings, finalized docs, schedule. |
| 2.12 | VW | Open meetings list (read-only) | SCR-MTG-01 | `/meetings` | Meetings list visible; no "Create Meeting" button. |
| 2.13 | VW | Open a meeting detail (read-only) | SCR-MTG-03 | `/meetings/:id` | Meeting overview; tabs visible as read-only; no Edit, no Participants management. |
| 2.14 | VW | Open document library and a document | SCR-DOC-01, SCR-DOC-03 | `/documents`, `/documents/:id` | Document library; open document; view metadata and content (no upload/edit). |
| 2.15 | VW | Open calendar and notifications | SCR-CAL-01, SCR-CAL-02 | `/calendar`, `/notifications` | Calendar; notification centre; mark read. |
| 2.16 | VW | Open reports home (if allowed) | SCR-RPT-01 | `/reports` | Per matrix VW has no access to reports; expect redirect to `/unauthorized` or no Reports in menu. |
| 2.17 | VW | Attempt to open papers list | SCR-PAPER-01 | `/papers` | Per matrix VW has no access; expect redirect to `/unauthorized`. |
| 2.18 | ME | Open account profile and notification preferences | SCR-USR-03, SCR-CAL-03 | `/account/profile`, `/account/notification-preferences` | Own profile (name, email, roles); notification preferences form. |
| 2.19 | SA | Open bulk user import (demo) | SCR-USR-04 | `/admin/users/bulk-import` | Bulk import page; CSV template; upload (demo or API). |

**Negative checks:** As **VW**, attempt `/admin/users` or `/admin/system/health` — expect redirect to `/unauthorized`. As **ME**, attempt `/reports/audit` — expect redirect to `/unauthorized`. As **CO**, attempt `/bodies/new` — expect no access (SA only).

---

## 5. ACT-081 — Security and accessibility (WCAG 2.1 AA) audit

**Scope:** After E2E RBAC tests (ACT-080), perform a security and accessibility audit.

| Activity | Description | Owner |
|----------|-------------|--------|
| **Route protection** | Confirm middleware redirects unauthenticated users to login and unauthorized roles to `/unauthorized` for each path in `routePermissions.ts`. | QA / Dev |
| **Token and session** | Verify session timeout (e.g. 30 min), secure cookies in production, and that roles in token match Keycloak realm roles. | Dev |
| **WCAG 2.1 AA** | Run automated and manual checks: keyboard navigation, focus order, labels, contrast, alt text, ARIA where needed, form errors announced. | QA |
| **Sensitive data** | Ensure no secrets in client bundle; API keys and client secret only server-side. | Dev |

**Deliverable:** Short audit report (pass/fail per criterion) and backlog of remediations if any.

---

## 6. Execution and sign-off

| Step | Action |
|------|--------|
| 1 | Ensure Keycloak is running with `isep-realm` and all six test users (see [infrastructure/keycloak/README.md](../infrastructure/keycloak/README.md)). |
| 1b | Ensure PostgreSQL has sample data: run migrations and seeds from the `database` directory (`run-migrations-and-seeds.sh` then `run-remaining-and-seeds.sh`) so that meetings, bodies, users, CGs, tasks, papers, notifications, and audit entries are present. See [RUN-APPLICATION.md](../RUN-APPLICATION.md) and [database/README.md](../database/README.md). |
| 2 | Run **Workflow 1** step-by-step with CO, ME, DL, IH (and optional negative checks). Record any access denial or UI mismatch. |
| 3 | Run **Workflow 2** step-by-step with SA, IH, VW. Record any access denial or UI mismatch. |
| 4 | Run **ACT-081** checks (route protection, session, WCAG, secrets). |
| 5 | Document results: pass/fail per step; defects and remediation plan. |
| 6 | Sign-off ACT-080 when both workflows pass for all roles/screens as per matrix; sign-off ACT-081 when audit criteria are met or remediations are scheduled. |

---

*End of RBAC Integration Testing Plan. Reference: ISEP-Screens-RBAC.md §16 Complete RBAC Summary Matrix; frontend/src/lib/routePermissions.ts.*
