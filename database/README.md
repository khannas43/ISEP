# ISEP Database

PostgreSQL 15+ migrations and seeds per SRS-06.

**Push local data to hosted DB:** See **[DATA-PUSH-TO-HOSTED.md](./DATA-PUSH-TO-HOSTED.md)** for steps to copy your local PostgreSQL data to the production server (pg_dump → transfer → pg_restore) or to load sample data on the host (migrations + seeds).

## Migrations

- **migrations/** — Versioned SQL (Flyway-style naming: `V{n}__description.sql`).
- Run with Flyway, Liquibase, or manually in order against the `isep` database.

**Run all migrations and seeds** (from repo root; Postgres on Docker port 5433):

```bash
cd database
PGPASSWORD=isep_dev_password ./run-migrations-and-seeds.sh localhost 5433
```

If you see `relation "users" already exists`, the core tables are already applied. To run only a **new** migration (e.g. V9 papers), from the **database** directory:

```bash
PGPASSWORD=isep_dev_password psql -h localhost -p 5433 -U isep_app -d isep -f migrations/V9__papers.sql
```

(Use `migrations/V9__papers.sql`, not `database/migrations/...`, when you are already inside `database`.)

## Seeds

Run after migrations, in order:

To clear seed data and re-run (run in **psql**, not in the shell):

```sql
TRUNCATE core.agenda_items, core.meeting_participants, core.meetings, core.international_bodies CASCADE;
```

Then run `./run-remaining-and-seeds.sh` again.

**Important:** Seeds write to the DB that the app uses. When using Docker, run seeds while the stack is up so they hit the Postgres container (e.g. `psql -h localhost -p 5433`). After changing backend code (e.g. new meeting detail endpoints), rebuild the meeting-service so the container has the latest code: from project root run `docker compose -f infrastructure/docker/docker-compose.dev.yml up -d --build meeting-service`.

To verify that meeting detail data (participants, tasks, status history, correspondence groups) is present:

```bash
cd database
PGPASSWORD=isep_dev_password psql -h localhost -p 5433 -U isep_app -d isep -f scripts/verify-meeting-data.sql
```

- **01_reference_bodies.sql** — IMO bodies (Assembly, Council, MSC, MEPC, etc.).
- **02_meetings_sample.sql** — **70** sample meetings (1 Jan 2023 – present) covering all sections (Assembly, Council, MSC, MEPC, HTW, NCSR, PPR, SDC, SSE, CCC, LEGAL, TCC, FAL, III).
- **03_reference_data.sql** — Lookup values for all dropdowns (meeting type/status, body type, filter years, meeting roles, agenda category/priority/status). **Ground rule:** All dropdown options must come from DB via reference API; no static lists in frontend.
- **04_seed_users.sql** — Sample users including SYSTEM_ADMIN, IC_DIVISION_HEAD, COORDINATOR, DELEGATION_LEADER, MEMBER, VIEWER (for meeting participants and admin screens).
- **05_seed_meeting_detail_sample.sql** — Participants and agenda items (3 per meeting) for **all** meetings in `core.meetings` so detail pages have sample data.
- **06_seed_meeting_status_history.sql** — Status history for meetings.
- **07_seed_meeting_rich_sample.sql** — Rich sample (locations, overview notes, tasks, CGs) for all meetings.
- **08_seed_correspondence_groups.sql** — 10 sample correspondence groups (India lead dropdown and CG list).
- **09_seed_tasks_papers_notifications_audit.sql** — Sample tasks, papers, notifications, and audit log entries so Tasks, Papers, Notifications, and Admin Audit screens have data.

Backend must expose reference data, e.g. `GET /api/v1/reference?category={category}` returning `[{ "code": "...", "label": "...", "sort_order": n }, ...]`. Categories: `meeting_type`, `meeting_status`, `body_type`, `filter_year`, `agenda_category`, `agenda_priority`, `agenda_status`, `meeting_role`.

## Schema summary

| Schema         | Purpose                                      |
|----------------|----------------------------------------------|
| core           | users, international_bodies, meetings, agenda_items, meeting_participants, tasks, reference_data |
| documents      | documents, document_versions                 |
| workflow       | workflow_instances, workflow_transition_logs, paper_approval_stages (V10) |
| collaboration  | feedback                                     |
| correspondence | correspondence_groups, cg_members           |
| notifications  | notifications                                |
| audit          | audit_logs (immutable)                       |
