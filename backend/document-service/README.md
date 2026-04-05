# document-service

ISEP Document storage and versioning. Manages `documents.documents` and (future) `documents.document_versions`.

## API

- `GET /api/v1/documents` — paginated list (optional `q` search)
- `GET /api/v1/documents?meetingId={uuid}` — list by meeting
- `GET /api/v1/documents/{id}` — get by id

## Run

Requires PostgreSQL with `documents` schema (migrations in project `database/`). JWT from Keycloak (isep-realm).

```bash
cd backend/document-service
mvn spring-boot:run
```

Default port: **8082**. Override with `SERVER_PORT`.

## Verify

```bash
curl -s http://localhost:8082/actuator/health
```
