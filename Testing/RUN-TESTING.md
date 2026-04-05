# Running ISEP Tests — What You Need to Do

**Current status:** See [TESTING-STATUS.md](./TESTING-STATUS.md) for what’s implemented and what’s in progress (automatic testing, E2E, papers workflow).

**Recommended: Option A (repo root).** Use the commands below. Paste **one command at a time**.

Repo root = folder that contains `frontend/`, `backend/`, `Testing/`, `infrastructure/` (e.g. `DG Shipping`).

---

## Option A — Run from repo root (recommended)

**You need:** Node 20 + npm (L1), Java 21 + Maven (L2). All commands are run from repo root.

**Step 1 — Go to repo root**

```bash
cd "/Users/sameerkhanna/Documents/Projects/DG Shipping"
```

**Step 2 — Run L1 (frontend) tests and generate coverage**

```bash
cd frontend && npm run test:coverage
```

**Step 3 — Run L2 (backend) unit tests**

```bash
cd backend/meeting-service && mvn test -DskipTests=false -B
```

**Step 4 — Run L3 (backend) integration tests (optional; needs Docker running)**  
Requires Docker so Testcontainers can start Postgres.

```bash
cd backend/meeting-service && mvn verify -P integration -B
```

**Step 5 — Run L5 (E2E) Playwright tests (optional)**  
**Before running E2E**, complete the checklist in **[Testing/E2E-PREREQUISITES.md](E2E-PREREQUISITES.md)**:

1. **App running** at http://localhost:3000 (`cd frontend && npm run dev` in one terminal).
2. **Keycloak** running with **isep-realm** and test users (admin-sa, co-user, etc.).
3. **frontend/.env**: `NEXTAUTH_SECRET` and `NEXTAUTH_URL=http://localhost:3000` set; **KEYCLOAK_CLIENT_SECRET** must match Keycloak’s **isep-web** client secret (see E2E-PREREQUISITES.md).

If the app is not reachable at `http://localhost:3000`, the run fails immediately with *"Start the app with: cd frontend && npm run dev"*. If the login form is missing or tests skip with "Session did not persist", follow **E2E-PREREQUISITES.md**.  
E2E includes RBAC (workflow1, workflow2, negative) and **papers workflow** (`papers-workflow.spec.ts`). Papers tests skip when the API returns no papers.  
**Run from repo root** (then `cd frontend && npm run test:e2e`):

```bash
cd frontend && npm run test:e2e
```

**Step 6 — View L1 coverage (optional)**  
Open in browser as a file (double-click in Finder or run below from repo root):

```bash
open "Testing/coverage/frontend/lcov-report/index.html"
```

---

## Option B — Run via Docker

**You need:** Docker (or Docker Desktop) running. All commands are run from repo root.

**Step 1 — Go to repo root**

```bash
cd "/Users/sameerkhanna/Documents/Projects/DG Shipping"
```

**Step 2 — Run L1 (frontend) tests**

```bash
docker compose -f infrastructure/docker/docker-compose.test.yml run --rm frontend-unit
```

**Step 3 — Run L2 (backend) unit tests**

```bash
docker compose -f infrastructure/docker/docker-compose.test.yml run --rm backend-unit
```

**Step 4 — Run L3 (backend) integration tests (optional; profile full)**  
Uses Testcontainers; service mounts Docker socket.

```bash
docker compose -f infrastructure/docker/docker-compose.test.yml --profile full run --rm backend-integration
```

**Step 5 — Run L5 (E2E) Playwright (optional; profile full)**  
App must be running on host (e.g. `cd frontend && npm run dev`). Then from repo root:

```bash
docker compose -f infrastructure/docker/docker-compose.test.yml --profile full run --rm e2e-playwright
```

**Step 6 — View L1 coverage (optional)**  
Same as Option A Step 6: open `Testing/coverage/frontend/lcov-report/index.html` as a file.

---

## Summary

| Goal | Option A (repo root) | Option B (Docker) |
|------|----------------------|-------------------|
| L1 frontend tests | Step 2: `cd frontend && npm run test:coverage` | Step 2: `docker compose ... run --rm frontend-unit` |
| L2 backend unit tests | Step 3: `cd backend/meeting-service && mvn test -DskipTests=false -B` | Step 3: `docker compose ... run --rm backend-unit` |
| L3 backend integration tests | Step 4: `mvn verify -P integration -B` (Docker must be running) | Step 4: `docker compose ... --profile full run --rm backend-integration` |
| L5 E2E Playwright | Step 5: `cd frontend && npm run test:e2e` (app must be running) | Step 5: `docker compose ... --profile full run --rm e2e-playwright` |
| View L1 coverage | Open `Testing/coverage/frontend/lcov-report/index.html` (file) | Same |

---

## Where results go

```
Testing/
├── coverage/frontend/   ← L1 coverage (lcov-report/index.html = open in browser as file)
└── results/
    └── e2e/             ← L5 Playwright HTML report (when TEST_RESULTS_BASE set, e.g. Docker)
```
