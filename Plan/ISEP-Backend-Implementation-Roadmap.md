# ISEP — Backend Implementation Roadmap

**Purpose:** Implement backend APIs one-by-one to support all screens and workflows.  
**Reference:** [ISEP-Project-Plan.md](ISEP-Project-Plan.md) Workstream 19 (ACT-B01–ACT-B10), [SRS-04-Technical-Architecture.md](../SRS/SRS-04-Technical-Architecture.md).

---

## Current state

| Activity | Scope | Service / location | Status | Notes |
|----------|--------|--------------------|--------|--------|
| **ACT-B03** | User list, Keycloak sync, role assignment | `backend/user-service` | ✅ Done | UserController, UserService, Postgres |
| **ACT-B01** | Bodies, meetings, participants, status history | `backend/meeting-service` | ✅ Done | BodyController, MeetingController, ReferenceController |
| **ACT-B02** | Agenda items CRUD (per meeting) | `backend/meeting-service` | ✅ Done | Under MeetingController: agenda-items, tasks |
| — | Documents (list, upload per meeting) | `backend/meeting-service` | ✅ Done | MeetingController documents; DocumentController |
| — | Correspondence groups | `backend/meeting-service` | ✅ Done | CorrespondenceGroupController |
| **ACT-B10** | Papers draft GET/PUT, versioning | `backend/meeting-service` | ✅ Done | PaperController, Paper entity, PaperService; run schema-papers.sql |
| **ACT-B04** | Document library, versions, download, search | `backend/meeting-service` | ✅ Done | DocumentController: list, get, download, versions list, new-version upload; DocumentVersion entity; local storage (MinIO optional later) |
| **ACT-B05** | Feedback (submit, list, consolidate) | `backend/meeting-service` | ✅ Done | FeedbackController, Feedback entity (collaboration schema), list by agenda item, save draft, submit, mark reviewed |
| **ACT-B06** | Notifications (list, unread count, mark read) | `backend/meeting-service` | ✅ Done | NotificationController, Notification entity (notifications schema); frontend /notifications wired with mock fallback |
| **ACT-B07** | Approval (paper stages, approve/reject) | `backend/meeting-service` | ✅ Done | workflow.paper_approval_stages (V10); PaperApprovalService, GET/POST /papers/:id/approval; frontend approval page + Approve action |
| **ACT-B08** | Reports (meeting-summary, approval-pipeline, audit) | `backend/meeting-service` | ✅ Done | ReportController GET /reports/meeting-summary, /approval-pipeline, /audit; AuditLog entity; frontend reports wired |
| **ACT-B09** | Workflow instances (list, get) | `backend/meeting-service` | ✅ Done | WorkflowController, WorkflowInstance entity; list/get workflow-instances; full FSM/Celery in Python later |

---

## Suggested implementation order (one-by-one)

1. **Papers draft API (ACT-B10)** — in `meeting-service`  
   - `GET /api/v1/papers/:id/draft`, `PUT /api/v1/papers/:id/draft`.  
   - Enables SCR-PAPER-02 with real persistence; admin/reviewers see same content.

2. **Document service (ACT-B04)** — extend or new  
   - Document library search, version history, MinIO.  
   - Needed for SCR-DOC-01–06.

3. **Collaboration (ACT-B05)** — feedback, comments  
   - Feedback submission/consolidation, deliberation notes.  
   - Needed for SCR-COL-01–04.

4. **Notification (ACT-B06)**  
   - In-app notifications, email.  
   - Needed for SCR-CAL-02–04.

5. **Approval (ACT-B07)**  
   - Workflow state, approver routing, paper locking.  
   - Needed for SCR-PAPER-03–05.

6. **Reporting (ACT-B08)**  
   - Dashboard and report APIs.  
   - Needed for SCR-RPT-01–06.

7. **Workflow service (ACT-B09)**  
   - Python FSM, Celery, escalation.  
   - Integrates with approval and notifications.

**Next in order:** Notification (ACT-B06) → Approval (ACT-B07) → Reporting (ACT-B08) → Workflow (ACT-B09).

---

## API base URL and gateway

- **Frontend** uses `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).  
- **meeting-service** runs on `SERVER_PORT` (default `8081`).  
- For local dev without Kong: set `NEXT_PUBLIC_API_URL=http://localhost:8081` so the frontend talks to meeting-service directly.  
- With Kong: route `/api/v1/*` to the appropriate service (e.g. meeting-service on 8081).

---

## Per-activity checklist (to fill as you go)

- [x] **Papers draft (ACT-B10):** Paper entity, PaperRepository, PaperService, PaperController GET/PUT draft; `backend/meeting-service/src/main/resources/db/schema-papers.sql` (run manually on Postgres).
- [x] **Document (ACT-B04):** DocumentController GET `/:id/download`, GET `/:id/versions`, POST `/:id/versions`; DocumentVersion entity/repository; DocumentService getDocumentResource, listVersions, addNewVersion; frontend proxy `/api/documents/[id]/download`, document detail Download link.
- [x] **Collaboration (ACT-B05):** Feedback entity (schema collaboration), FeedbackRepository, FeedbackService, FeedbackController GET/POST/PATCH (list by agendaItemId, save draft, submit, mark reviewed); frontend getFeedbackList, saveFeedback, submitFeedback; feedback submit/consolidate pages wired to API with mock fallback.
- [x] **Notification (ACT-B06):** Notification entity (schema notifications), NotificationRepository/Service/Controller; GET list, GET unread-count, PATCH /:id/read, POST mark-all-read; frontend getNotifications, getUnreadNotificationCount; /notifications page with mock fallback.
- [x] **Approval (ACT-B07):** V10 paper_approval_stages; PaperApprovalStage entity, PaperApprovalService; GET/POST /papers/:id/approval, approve, reject; ensureDefaultStages; frontend getPaperApproval, approvePaper; paper approval page + PaperApprovalActions.
- [x] **Reporting (ACT-B08):** ReportController meeting-summary, approval-pipeline, audit; AuditLog entity (audit schema); frontend getMeetingSummaryReport, getApprovalPipelineReport; reports pages wired.
- [x] **Workflow (ACT-B09):** WorkflowInstance entity (workflow schema), WorkflowController GET /workflow-instances, GET /:id; frontend can call for list; full FSM/Celery/Python optional later.

---

## Postgres: do you need pgAdmin?

**No.** pgAdmin is optional. You can do everything with:

- **Command line:** `psql` (see below).
- **Any other client:** DBeaver, DataGrip, VS Code extension, etc.

Install pgAdmin only if you prefer a GUI for browsing data and running ad‑hoc SQL.

---

## Postgres: "connection to server ... failed"

That usually means either Postgres is not running, or you're not connecting to the right host/port.

**1. Use Docker (recommended for this project)**  
From the repo root:

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d postgresql
```

Postgres is exposed on the host as **port 5433** (not 5432). So always use:

```bash
psql -h localhost -p 5433 -U isep_app -d isep
```

**2. Run migrations (including papers)**  
From the repo root:

```bash
export PGPASSWORD=isep_dev_password
psql -h localhost -p 5433 -U isep_app -d isep -f database/migrations/V1__create_schemas.sql
psql -h localhost -p 5433 -U isep_app -d isep -f database/migrations/V2__core_tables.sql
# ... run remaining V3–V9 in order, or use:
cd database && ./run-migrations-and-seeds.sh localhost 5433
```

To run only the papers table (if other migrations are already applied). From **repo root**:

```bash
PGPASSWORD=isep_dev_password psql -h localhost -p 5433 -U isep_app -d isep -f database/migrations/V9__papers.sql
```

Or from inside the **database** directory (use `migrations/...` not `database/migrations/...`):

```bash
cd database
PGPASSWORD=isep_dev_password psql -h localhost -p 5433 -U isep_app -d isep -f migrations/V9__papers.sql
```

**3. If you run Postgres locally (not Docker)**  
Then the server is usually on port 5432 and a Unix socket. Use:

```bash
psql -h localhost -p 5432 -U isep_app -d isep -f database/migrations/V9__papers.sql
```

(Replace `isep_app` / `isep` with your local user and DB if different.)

---

*Last updated: 2026-02-28*
