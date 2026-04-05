# agenda-service

ISEP Agenda items (core.agenda_items). Exposes meeting agenda CRUD and listing.

## API

- `GET /api/v1/meetings/{meetingId}/agenda-items` — list by meeting
- `GET /api/v1/meetings/{meetingId}/agenda-items/{itemId}` — get one

## Run

PostgreSQL with `core` schema. Keycloak JWT. Port **8083**.

```bash
cd backend/agenda-service && mvn spring-boot:run
```
