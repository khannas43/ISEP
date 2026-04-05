# user-service

ISEP User and Role Management (ACT-B03). CRUD for users, Keycloak sync, and JWT validation.

## Stack

- Spring Boot 3.2, Java 21
- PostgreSQL (`core` schema)
- OAuth2 Resource Server (Keycloak JWT)

## Schema

Expects `core.users` table as per SRS-06 (Data Model). If your database was created from an older schema (e.g. meeting-service only), add the missing columns: `system_role`, `phone`, `mfa_enabled`, `last_login_at`, `created_at`, `updated_at`, `created_by`, `deleted_at`.

## Run

```bash
mvn spring-boot:run
```

Defaults: port **8087**, same DB as meeting-service (`POSTGRES_*` env or `localhost:5432/isep`).

## API

- `GET /api/v1/users` — list (search, systemRole, activeOnly, pageable)
- `GET /api/v1/users/{id}` — get one
- `POST /api/v1/users` — create (SYSTEM_ADMIN)
- `PATCH /api/v1/users/{id}` — update (SYSTEM_ADMIN)
- `PATCH /api/v1/users/{id}/deactivate` — deactivate (SYSTEM_ADMIN)

Frontend calls the same API base URL as meetings; ensure the gateway routes `/api/v1/users` to this service (port 8087).
