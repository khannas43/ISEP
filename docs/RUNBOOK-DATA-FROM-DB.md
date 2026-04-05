# Runbook: Getting Data to Show (Frontend + API + DB)

## Login: admin-sa / Admin@12345!

If **username or password not working** for `admin-sa`:

1. **Realm may have been imported without users** (first time before we added the user to the JSON). Create the user once:
   ```bash
   chmod +x infrastructure/keycloak/create-admin-sa-user.sh
   ./infrastructure/keycloak/create-admin-sa-user.sh
   ```
   Keycloak must be running at http://localhost:8180 (admin/admin).

2. **Or re-import the realm** (fresh Keycloak): stop containers, remove Keycloak’s data volume (e.g. `docker volume ls` to find it), then `docker compose ... up -d` again so the realm JSON (which now includes `admin-sa`) is imported.

3. **Console error "message channel closed before a response was received"** — this usually comes from a **browser extension** (e.g. password manager, ad blocker), not from the app. Try an incognito/private window or disable extensions for localhost.

When data is not showing (meetings list empty, dropdowns empty), follow these steps.

## 1. Start the stack (if not already running)

**You must run this from the repo root** (the folder that contains `frontend/`, `backend/`, `database/`, `infrastructure/`). Do not run from inside `infrastructure/docker`.

```bash
cd "/Users/sameerkhanna/Documents/Projects/DG Shipping"
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d --build
```

Wait for PostgreSQL and Kong to be healthy. Meeting-service will build and start (may take a minute).

## 2. Run database migrations and seeds

The API reads from PostgreSQL. Tables must exist and reference/meeting data must be seeded.

From **repo root** (or from `database/`):

```bash
chmod +x database/run-migrations-and-seeds.sh
./database/run-migrations-and-seeds.sh
```

Defaults: host `localhost`, port **5433** (Docker exposes Postgres on 5433). If your Postgres is on a different host/port:

```bash
./database/run-migrations-and-seeds.sh localhost 5432
```

Or run manually:

```bash
export PGPASSWORD=isep_dev_password
psql -h localhost -p 5433 -U isep_app -d isep -v ON_ERROR_STOP=1 -f database/migrations/V1__create_schemas.sql
psql -h localhost -p 5433 -U isep_app -d isep -v ON_ERROR_STOP=1 -f database/migrations/V2__core_tables.sql
# ... V3, V4, V5, V6
psql -h localhost -p 5433 -U isep_app -d isep -v ON_ERROR_STOP=1 -f database/seeds/01_reference_bodies.sql
psql -h localhost -p 5433 -U isep_app -d isep -v ON_ERROR_STOP=1 -f database/seeds/02_meetings_sample.sql
psql -h localhost -p 5433 -U isep_app -d isep -v ON_ERROR_STOP=1 -f database/seeds/03_reference_data.sql
```

## 3. Restart the API (meeting-service)

After changing Kong config or backend code:

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d --build meeting-service
```

If you use Kong and changed `infrastructure/kong/kong.yml`, restart Kong so it reloads routes:

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml restart kong
```

## 4. Restart the frontend

So the Next.js app picks up env and code changes:

```bash
cd frontend
npm run dev
```

Ensure `frontend/.env` has:

- `NEXT_PUBLIC_API_URL=http://localhost:8000` (Kong proxy)

## 5. Verify

- **Bodies:** Login, go to Bodies — list should show seeded bodies.
- **Meetings:** Meetings list should show 60 sample meetings (after seeds).
- **Dropdowns:** Filters (status, type, year) and Create Meeting / Add Body forms should show options from the reference API.

If the API is not running or Kong is not routing, the frontend will show empty lists and empty dropdowns (no static fallback).

## 6. If data still doesn’t show (401 / JWT issuer)

The browser logs in to Keycloak at **http://localhost:8180**, so the JWT issuer is `http://localhost:8180/realms/isep-realm`. The meeting-service must use that same value for `KEYCLOAK_ISSUER_URI` (see `docker-compose.dev.yml`). If you changed it or run Keycloak on another port:

1. Set `KEYCLOAK_ISSUER_URI` to the issuer in the token (the Keycloak URL the **browser** uses, e.g. `http://localhost:8180/realms/isep-realm`).
2. Restart meeting-service: `docker compose -f infrastructure/docker/docker-compose.dev.yml up -d meeting-service`
3. **Sign out and sign in again** in the app so a fresh token is used.
4. Reload Meetings and Bodies.
