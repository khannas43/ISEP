# Docker – ISEP

## DEV (single node)

```bash
# From repo root
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

Brings up:

- **PostgreSQL** 15 — port 5432, DB `isep`, user `isep_app`, password `isep_dev_password`
- **Redis** 7 — port 6379
- **MinIO** — ports 9000 (API), 9001 (console)
- **Elasticsearch** 7.17 — port 9200
- **Keycloak** 23 — port 8080 (admin/admin)
- **Kong** CE 3 — proxy 8000, admin 8001
- **Nginx** — ports 80, 443 (proxies to Kong)

Run migrations (from repo root, with PostgreSQL up):

```bash
export PGPASSWORD=isep_dev_password
psql -h localhost -U isep_app -d isep -f database/migrations/V1__create_schemas.sql
# ... run remaining migrations in order
```

Or use Flyway/Liquibase against `jdbc:postgresql://localhost:5432/isep`.

## Test runners (docker-compose.test.yml)

Run test layers in Docker. See **Testing/ISEP-Testing-Plan.md** for the full activity list.

```bash
# From repo root — L1 frontend unit tests (Jest)
docker compose -f infrastructure/docker/docker-compose.test.yml run --rm frontend-unit
```

Other services (`backend-unit`, `e2e-playwright`, `perf-k6`) are defined; use profile `full` to include them, or run by name when needed.

## SIT/UAT/PROD

Use Docker Swarm stacks and ArgoCD configs in `infrastructure/deploy/` (Phase 5).
