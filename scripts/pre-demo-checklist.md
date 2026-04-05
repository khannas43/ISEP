# ISEP — Pre-Demo Checklist

Run through this before every demo session.

## Before any testing — ensure containers are current

If any backend code changed since last build:

```bash
cd infrastructure/docker
docker compose -f docker-compose.dev.yml build meeting-service
docker compose -f docker-compose.dev.yml up -d meeting-service
# Wait ~30 seconds for Spring Boot to start
curl -s http://localhost:8082/actuator/health | python3 -m json.tool
```

Never test against a stale container — you will get false 403s from old security rules.

## Infrastructure

- [ ] `docker compose -f infrastructure/docker/docker-compose.dev.yml ps` — all services healthy
- [ ] Meeting-service: `curl -s http://localhost:8082/actuator/health | grep UP`
- [ ] OpenSearch: `curl -s http://localhost:9200/_cat/health | grep green`
- [ ] MinIO: `curl -s http://localhost:9001/minio/health/live`
- [ ] Y.js server: `curl -s http://localhost:1234` (may return empty or connection refused — confirm the process or compose service is up if you use collaboration)
- [ ] Keycloak: `curl -s http://localhost:8180/realms/isep-realm | grep realm`

## Database

- [ ] All migrations applied through **V22** (meeting participant `COORDINATOR` role, etc.)
- [ ] Demo seed loaded: `SELECT count(*) FROM core.meetings WHERE title LIKE '%MSC 108%'` → 1
- [ ] Demo document has 2 versions: `SELECT count(*) FROM documents.document_versions WHERE document_id = '00000000-0000-0000-0000-000000000201'` → 2
- [ ] Demo paper (optional): `SELECT paper_id, status FROM core.papers WHERE paper_id = '00000000-0000-0000-0000-000000000501'`
- [ ] Demo meeting participants: `SELECT count(*) FROM core.meeting_participants WHERE meeting_id = '00000000-0000-0000-0000-000000000001'` → &gt; 0

## Demo users (log in and verify)

- [ ] SYSTEM_ADMIN: log in, see admin dashboard
- [ ] DELEGATION_LEADER: log in, see delegation dashboard, see MSC 108
- [ ] COORDINATOR: log in, see MSC 108, create task
- [ ] MEMBER: log in, see assigned task in `/tasks/my`

## Feature smoke

- [ ] Upload PDF to agenda item 4.1 → HTTP 2xx (or document row created)
- [ ] Create task as COORDINATOR → member sees it
- [ ] Open demo document in editor → TipTap loads with content
- [ ] Open `/documents/{demo-doc-id}/compare` → diff loads (v1 vs v2)
- [ ] Accept one change → Generate clean copy → `CLEAN_COPY` / workflow status as designed
- [ ] Submit demo paper from draft → `POST /api/v1/papers/{id}/workflow/submit` → status `IN_APPROVAL`

## UI checks

- [ ] Dashboard shows role-specific “To-Do” (member pending tasks, DL approvals / team badge, CO assigned count) when API is up
- [ ] Notification bell shows unread count from `GET /api/v1/notifications/unread-count`
- [ ] Paper approval chain shows on `/papers/{id}/approval`
- [ ] Phase 4–6 wireframe screens load with Sprint 3 banners (if applicable)
- [ ] No console errors on dashboard, meeting detail, editor pages
