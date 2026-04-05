# Push local PostgreSQL data to hosted DB

Use this when the **hosted** (production) app has no data and you want to copy data from your **local** PostgreSQL into the hosted database (e.g. after first deploy).

You can either:

- **Option A** — Copy your **actual local DB** (dump from local → restore on host), or  
- **Option B** — Load **sample/seed data** on the host (run migrations + seeds there).

---

## Prerequisites

- **Local:** PostgreSQL with `isep` database and user `isep_app` (e.g. Docker on port 5433, password `isep_dev_password`).
- **Hosted:** Docker stack running with `postgresql` service; you have SSH and the project at e.g. `/root/DG-Shipping`. Hosted DB password from `.env.production`: `POSTGRES_PASSWORD` (default `isep_prod_password`).

---

## Option A — Copy local DB to hosted (pg_dump → transfer → restore)

**Version mismatch:** If you see `pg_restore: error: unsupported version (1.16) in file header`, your local `pg_dump` is newer (e.g. PostgreSQL 17) than the server’s Postgres (15). Use **plain SQL format** below so the server can restore with `psql`; it works across versions.

### Step 1 — Dump from local

On your **local machine** (where your dev Postgres runs), from the project root.

**Recommended (plain SQL — works when server has older Postgres):**

```bash
# Plain SQL; restore on server with psql (no version mismatch)
PGPASSWORD=isep_dev_password pg_dump -h localhost -p 5433 -U isep_app -d isep -F p -f isep_dump.sql
```

- Use port **5432** if your local Postgres is not in Docker on 5433.
- Transfer **isep_dump.sql** to the server, then use **Step 4b** below to restore.

**Alternative (custom format — only if local and server Postgres versions match):**

```bash
PGPASSWORD=isep_dev_password pg_dump -h localhost -p 5433 -U isep_app -d isep -F c -f isep_dump.dump
```

- `-F c` = custom format (for `pg_restore`). Server must have same or newer Postgres than the client that created the dump.
- For **data only** (hosted already has schema): add `--data-only` and restore with `pg_restore --data-only` or use plain SQL with `--data-only`.

### Step 2 — Transfer dump to server

From your local machine:

```bash
# If you used plain SQL (recommended):
scp isep_dump.sql root@148.230.66.191:/root/DG-Shipping/

# If you used custom format:
# scp isep_dump.dump root@148.230.66.191:/root/DG-Shipping/
```

Use your server host and path as needed.

### Step 3 — On server: ensure schema exists (if using data-only)

If you used **data-only** dump, the hosted DB must already have the schema. Run migrations inside the Postgres container:

```bash
cd /root/DG-Shipping
COMPOSE="docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production"

# Postgres container name (often dg-shipping-postgresql-1 or similar)
PG_CONTAINER=$($COMPOSE ps -q postgresql)

# Copy database folder into container (or ensure it's available)
docker cp database $PG_CONTAINER:/tmp/database

# Run migrations in version order (V1, V2, … V15)
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER sh -c '
  for f in /tmp/database/migrations/V1__*.sql /tmp/database/migrations/V2__*.sql /tmp/database/migrations/V3__*.sql /tmp/database/migrations/V4__*.sql /tmp/database/migrations/V5__*.sql /tmp/database/migrations/V6__*.sql /tmp/database/migrations/V7__*.sql /tmp/database/migrations/V8__*.sql /tmp/database/migrations/V9__*.sql /tmp/database/migrations/V10__*.sql /tmp/database/migrations/V11__*.sql /tmp/database/migrations/V12__*.sql /tmp/database/migrations/V13__*.sql /tmp/database/migrations/V14__*.sql /tmp/database/migrations/V15__*.sql; do
    [ -f "$f" ] && psql -h localhost -U isep_app -d isep -v ON_ERROR_STOP=1 -f "$f" || true
  done
'
```

If the hosted DB was created by a previous `up`, it may already have been migrated; you can skip this if you know schema is there.

### Step 4 — On server: copy dump into container and restore

```bash
cd /root/DG-Shipping
PG_CONTAINER=$(docker compose -f infrastructure/docker/docker-compose.prod.yml ps -q postgresql)

# Copy dump file into the container
docker cp isep_dump.dump $PG_CONTAINER:/tmp/isep_dump.dump

# Restore (replace existing objects if full dump; use --data-only for data-only dump)
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER pg_restore -h localhost -U isep_app -d isep --no-owner --no-acl -c /tmp/isep_dump.dump || true
```

- `-c` = clean (drop) existing objects before restore. Omit if you only restored **data-only** and want to avoid dropping tables.
- For **data-only** dump, use:
  ```bash
  docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER pg_restore -h localhost -U isep_app -d isep --no-owner --no-acl --data-only /tmp/isep_dump.dump
  ```
- If you see “relation already exists” or conflicts, you may need to truncate tables first or use `--clean` with a full dump.

**If you see `pg_restore: error: unsupported version (1.16) in file header`:** Your dump was made with a newer Postgres than the server. Re-dump on your Mac using **plain SQL** and restore with **psql**:

On **local** (re-dump):
```bash
PGPASSWORD=isep_dev_password pg_dump -h localhost -p 5433 -U isep_app -d isep -F p -f isep_dump.sql
```
Transfer **isep_dump.sql** to the server (e.g. SFTP), then on **server** (filter out PG17-only settings and schema creation so restore works on existing DB):

```bash
cd /root/DG-Shipping
COMPOSE="docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production"
PG_CONTAINER=$($COMPOSE ps -q postgresql)
docker cp isep_dump.sql $PG_CONTAINER:/tmp/isep_dump.sql
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER sh -c "sed -e '/transaction_timeout/d' -e '/idle_in_transaction_session_timeout/d' -e '/^CREATE SCHEMA /d' /tmp/isep_dump.sql | psql -h localhost -U isep_app -d isep -v ON_ERROR_STOP=1 -f -"
```

If you see **`schema "audit" already exists`** or **`relation "audit_logs" already exists`**: the hosted DB already has schema and tables (from migrations). Use a **data-only** dump instead so you only load data, not DDL — see **Option A (data-only)** below.

**Option A (data-only) — when hosted DB already has schema**

If the hosted database already has schemas and tables (e.g. from migrations or a previous restore), dump only **data** from local and restore that. No CREATE SCHEMA / CREATE TABLE, so no conflicts.

On **local** (data-only plain SQL dump). You may see warnings about circular foreign-key constraints; the dump still completes. Use the restore below so FKs don’t block the load:

```bash
PGPASSWORD=isep_dev_password pg_dump -h localhost -p 5433 -U isep_app -d isep -F p --data-only -f isep_data_only.sql
```

Transfer **isep_data_only.sql** to the server (e.g. `scp isep_data_only.sql root@148.230.66.191:/root/DG-Shipping/`), then on **server**:

If the hosted DB **already has data** (e.g. from seeds or a previous partial restore), truncate tables first so the load doesn’t hit duplicate-key errors. The script `database/truncate-all-data.sql` truncates only **tables that exist** (avoids “relation does not exist” when migrations differ).

**If `database/truncate-all-data.sql` exists on the server** (same repo as docker-compose):

```bash
cd /root/DG-Shipping
COMPOSE="docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production"
PG_CONTAINER=$($COMPOSE ps -q postgresql)
docker cp isep_data_only.sql $PG_CONTAINER:/tmp/isep_data_only.sql
docker cp database/truncate-all-data.sql $PG_CONTAINER:/tmp/truncate-all-data.sql
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER sh -c "
  (echo 'SET session_replication_role = replica;';
   cat /tmp/truncate-all-data.sql;
   sed -e '/transaction_timeout/d' -e '/idle_in_transaction_session_timeout/d' /tmp/isep_data_only.sql;
   echo 'SET session_replication_role = DEFAULT;') | psql -h localhost -U isep_app -d isep -v ON_ERROR_STOP=1 -f -
" 2>&1 | tee restore.log
```

**If the file is not on the server**, create it once then run the restore (paste the whole block):

```bash
cd /root/DG-Shipping
mkdir -p database
cat > database/truncate-all-data.sql << 'ENDOFFILE'
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN (
      'core', 'audit', 'documents', 'workflow',
      'collaboration', 'correspondence', 'notifications'
    )
    ORDER BY schemaname, tablename
  LOOP
    EXECUTE format('TRUNCATE TABLE %I.%I CASCADE', r.schemaname, r.tablename);
  END LOOP;
END $$;
ENDOFFILE
COMPOSE="docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production"
PG_CONTAINER=$($COMPOSE ps -q postgresql)
docker cp isep_data_only.sql $PG_CONTAINER:/tmp/isep_data_only.sql
docker cp database/truncate-all-data.sql $PG_CONTAINER:/tmp/truncate-all-data.sql
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER sh -c "
  (echo 'SET session_replication_role = replica;';
   cat /tmp/truncate-all-data.sql;
   sed -e '/transaction_timeout/d' -e '/idle_in_transaction_session_timeout/d' /tmp/isep_data_only.sql;
   echo 'SET session_replication_role = DEFAULT;') | psql -h localhost -U isep_app -d isep -v ON_ERROR_STOP=1 -f -
" 2>&1 | tee restore.log
```

Then restart backends (only services that exist in your compose): `$COMPOSE restart meeting-service user-service workflow-service`

### Step 5 — Restart backends (optional)

So they pick up new data:

```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production restart meeting-service user-service
```

---

## Option B — Load sample data on hosted (migrations + seeds)

If you do **not** need your exact local data and just want the app to show data, run **migrations** and **seeds** on the hosted DB.

### Step 1 — Copy `database` folder to server

From your local machine (project root):

```bash
scp -r database root@148.230.66.191:/root/DG-Shipping/
```

### Step 2 — On server: run migrations and seeds inside Postgres container

```bash
cd /root/DG-Shipping
COMPOSE="docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production"
PG_CONTAINER=$($COMPOSE ps -q postgresql)

# Copy database folder into container
docker cp database $PG_CONTAINER:/tmp/database

# Run migrations in version order (V1, V2, … V15)
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER sh -c '
  cd /tmp/database
  for f in migrations/V1__*.sql migrations/V2__*.sql migrations/V3__*.sql migrations/V4__*.sql migrations/V5__*.sql migrations/V6__*.sql migrations/V7__*.sql migrations/V8__*.sql migrations/V9__*.sql migrations/V10__*.sql migrations/V11__*.sql migrations/V12__*.sql migrations/V13__*.sql migrations/V14__*.sql migrations/V15__*.sql; do
    [ -f "$f" ] && psql -h localhost -U isep_app -d isep -v ON_ERROR_STOP=1 -f "$f" || true
  done
'

# Run seeds (sample bodies, meetings, users, etc.)
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER sh -c '
  cd /tmp/database
  for f in seeds/01_reference_bodies.sql seeds/02_meetings_sample.sql seeds/03_reference_data.sql seeds/04_seed_users.sql seeds/05_seed_meeting_detail_sample.sql seeds/06_seed_meeting_status_history.sql seeds/07_seed_meeting_rich_sample.sql seeds/08_seed_correspondence_groups.sql seeds/09_seed_tasks_papers_notifications_audit.sql; do
    [ -f "$f" ] && psql -h localhost -U isep_app -d isep -v ON_ERROR_STOP=1 -f "$f" || true
  done
'
```

Use the same password as in `.env.production` (`POSTGRES_PASSWORD` / `isep_prod_password`).

### Step 3 — Restart backends

```bash
$COMPOSE restart meeting-service user-service
```

---

## Quick reference

| Goal                         | Action                                                                 |
|-----------------------------|------------------------------------------------------------------------|
| Copy **local DB as-is**     | Option A: pg_dump (local) → scp → pg_restore in postgres container     |
| Just need **sample data**   | Option B: copy `database/` to server, run migrations + seeds in container |
| Hosted DB password          | In `.env.production`: `POSTGRES_PASSWORD` (default `isep_prod_password`) |
| Postgres container name     | `docker compose -f infrastructure/docker/docker-compose.prod.yml ps -q postgresql` |

After either option, refresh the app at **http://148.230.66.191/isep** and log in; you should see meetings, bodies, and other data.

---

## Troubleshooting — Data not visible after restore

If you restored the dump and restarted services but the app still shows no data, check the following on the **server**.

### 1. Confirm data is in the database

Run inside the Postgres container to see row counts for the main tables the app uses:

```bash
cd /root/DG-Shipping
COMPOSE="docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production"
PG_CONTAINER=$($COMPOSE ps -q postgresql)

docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER psql -h localhost -U isep_app -d isep -t -c "
SELECT 'core.meetings' AS tbl, COUNT(*) FROM core.meetings
UNION ALL SELECT 'core.international_bodies', COUNT(*) FROM core.international_bodies
UNION ALL SELECT 'core.users', COUNT(*) FROM core.users
UNION ALL SELECT 'core.agenda_items', COUNT(*) FROM core.agenda_items;
"
```

- If all counts are **0**, the restore did not load data (e.g. restore failed partway, or dump had no data). Re-run the restore and capture full output; fix any errors (e.g. more `SET` lines to strip), or use Option B (migrations + seeds) to get sample data.
- If counts are **> 0**, data is present; the issue is likely between the app and the API (see below).

**Data in DB but not visible in the app:** The dashboard loads data during **server-side rendering** (SSR). The frontend container must be able to reach the API. From inside Docker, the public URL (e.g. `http://148.230.66.191/isep`) is often unreachable. Set **API_URL** so the Next.js server uses the internal URL: `API_URL: http://nginx/isep` in the frontend service (see `docker-compose.prod.yml`). Then **rebuild and restart** the frontend so SSR requests go to nginx → Kong → backends and data appears.

### 2. Restart all services that use the database

Restart every backend that reads from Postgres so they see the new data:

```bash
$COMPOSE restart meeting-service user-service workflow-service
```

If you have other services that use the DB, restart them too.

### 3. Check API and auth

- In the browser at **http://148.230.66.191/isep**, open DevTools → Network. Go to Dashboard or Meetings.
- Confirm requests to URLs like `/isep/api/v1/meetings` or `/isep/api/v1/dashboard/...` return **200** (and JSON with data), not **401** or **404**.
- If you see **401**: the JWT is rejected by the backend. Often the token’s **issuer** (iss) is the public Keycloak URL (e.g. `http://148.230.66.191/realms/isep-realm`) while the backend was expecting the internal URL (`http://keycloak:8080/realms/isep-realm`). Set **KEYCLOAK_ISSUER_URI** on meeting-service and user-service to the **public** issuer: `KEYCLOAK_ISSUER_URI: ${PUBLIC_ORIGIN:-http://148.230.66.191}/realms/isep-realm` (keep KEYCLOAK_JWKS_URI as `http://keycloak:8080/...`). Restart the backend services, then log out and log in again.
- If you see **404** or wrong path: ensure Kong has routes for `/api/v1/meetings`, `/api/v1/papers`, `/api/v1/dashboard` (all go to meeting-service in prod). Update `infrastructure/kong/kong.yml` and restart Kong. Also ensure `NEXT_PUBLIC_API_URL` ends at `/isep` (no `/api`).

### 4. Verify SSR and Kong

- **API_URL in container:** `docker exec $($COMPOSE ps -q frontend) env | grep API` (with `COMPOSE` set as in Step 1) should show `API_URL=http://nginx/isep`.
- **Frontend logs after loading dashboard:** `docker compose ... logs --tail=50 frontend`. Look for `[API] getMeetingsPage failed` (status code and URL) or `[Dashboard] Failed to load summary` (network/error). Fix the reported cause (e.g. 401 → re-login or Keycloak; 502 → Kong/meeting-service down or wrong route).
- **Kong routes:** If you added `/api/v1/papers` and `/api/v1/dashboard` to `kong.yml`, copy the updated file to the server and restart Kong so it picks up the new routes: `$COMPOSE restart kong`.

### 5. If restore failed partway

If the `sed ... | psql` restore stopped on an error, the DB may have schema but empty tables. Re-run the restore and note the first error:

```bash
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER sh -c "sed -e '/transaction_timeout/d' -e '/idle_in_transaction_session_timeout/d' -e '/^CREATE SCHEMA /d' /tmp/isep_dump.sql | psql -h localhost -U isep_app -d isep -v ON_ERROR_STOP=1 -f -" 2>&1 | tee restore.log
```

Fix any new “unrecognized configuration parameter” by adding another `-e '/parameter_name/d'` to `sed`, or run Option B (migrations + seeds) to get a working dataset.
