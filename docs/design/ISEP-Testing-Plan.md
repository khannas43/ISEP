# ISEP Testing Plan — Tech Stack, Docker & MCP Server

**Document Ref:** ISEP-TEST-PLAN-01 | **Version:** 1.0  
**Project:** IMO Strategic Engagement Platform (ISEP) — Directorate General of Shipping, MoPSW  
**Related:** [ISEP-TESTING-CONTEXT.md](./ISEP-TESTING-CONTEXT.md) (architecture, patterns, invariants)

**Design principles:**
- All testing tools run **inside Docker** (reusable images; app and tools already in Docker).
- Same test-runner images and compose pattern are **reusable for other projects** (only mounts and paths change).
- An **MCP server** exposes test layers to Cursor so the AI can run tests and consume results; the MCP server **invokes Docker** to execute each layer.

**Test cases:** In repo at [`Testing/Test Cases/`](../../Testing/Test%20Cases/). See [`Testing/README.md`](../../Testing/README.md) for **context-loading guidance** (e.g. approval chain: CONTEXT + TC-02; full UAT: TC-06).

---

## 1. Testing Tech Stack (7 Layers)

Aligned with [ISEP-TESTING-CONTEXT.md §2]( ./ISEP-TESTING-CONTEXT.md). Each layer runs in Docker via shared runner images.

| Layer | Tool | Runner command | Docker image (reusable) |
|-------|------|----------------|-------------------------|
| **L1** | Jest 29.x + React Testing Library + jest-dom | `npm test` (optionally `--testPathPattern=…`) | `node:20-alpine` + Jest/RTL (or project-specific Dockerfile that extends base) |
| **L2** | JUnit 5 + Mockito + AssertJ | `mvn test` | `eclipse-temurin:21-jdk` + Maven (or `maven:3.9-eclipse-temurin-21`) |
| **L3** | Spring Boot Test + Testcontainers + WireMock | `mvn verify -P integration` | Same as L2; Testcontainers starts Postgres (and other services) as sibling containers |
| **L4** | Pytest + pytest-mock + httpx + respx (FastAPI) | `pytest --cov=app --cov-report=lcov` | `python:3.12-slim` + pytest, respx, httpx |
| **L5** | Playwright 1.44.x + @axe-playwright | `npx playwright test` | `mcr.microsoft.com/playwright:latest` (official image) |
| **L6** | k6 (optional, defer) | `k6 run …` | `grafana/k6:latest` |
| **L7** | SonarQube CE (already in use) | `sonar-scanner` | Existing SonarQube + scanner (already Dockerised where needed) |

**Coverage / quality:**  
- L1: Jest → lcov + json-summary (target ≥ 80% line).  
- L2/L3: JaCoCo → lcov (target ≥ 85% unit; 100% RLS coverage in integration).  
- L4: pytest-cov → lcov (target ≥ 80%; 100% DRAFT-only paths).  
- L5: Flow coverage tracked separately; axe for accessibility.  
- L7: SonarQube quality gate (coverage, security, maintainability).

---

## 2. Docker Strategy — Reusable Test Runners

### 2.1 Principle

- **Test execution** always runs **inside containers** (not on host), so the stack stays consistent and portable.
- **Reusability:** Use **shared, generic** test-runner images (or minimal project Dockerfiles that only add deps). Other projects reuse the same images and mount their own code.

### 2.2 Reusable images (conceptual)

| Image | Base | Purpose | Used by |
|-------|------|---------|--------|
| `isep-test-node` (or generic `node-jest`) | `node:20-alpine` | L1 — Jest + RTL; run `npm ci && npm test` with app mounted | ISEP frontend; any Next.js/Node project |
| `isep-test-maven` (or generic `maven-junit`) | `eclipse-temurin:21-jdk` + Maven | L2/L3 — JUnit, Testcontainers; run `mvn test` or `mvn verify -P integration` with backend mounted | ISEP meeting-service (and other Spring Boot services); any Java project |
| `isep-test-python` (or generic `python-pytest`) | `python:3.12-slim` | L4 — Pytest; run `pytest` with AI service mounted | ISEP workflow-service / AI service; any FastAPI project |
| Playwright | `mcr.microsoft.com/playwright:latest` | L5 — E2E + API tests; run `npx playwright test` with tests + app URL | ISEP; any web app |
| k6 | `grafana/k6:latest` | L6 — Load tests; run `k6 run` with scripts mounted | ISEP; any HTTP/API project |

Naming can be generic (e.g. `your-registry/node-jest:20`) for reuse across projects.

### 2.3 How tests run in Docker (ISEP)

- **L1 (Jest):**  
  - Container: `node:20` (or custom image with Jest/RTL pre-installed).  
  - Mount: `frontend/` → `/app`.  
  - Command: `sh -c "npm ci && npm test -- --ci --coverage"` (and optionally `--testPathPattern=…`).

- **L2 (JUnit):**  
  - Container: Maven + JDK 21.  
  - Mount: `backend/meeting-service/` (and optionally other backend modules) → `/app`.  
  - Command: `mvn test` (and optionally `-Dtest=ClassName`).

- **L3 (Integration):**  
  - Same Maven image; Testcontainers brings up PostgreSQL (and optionally WireMock) as separate containers on the same Docker network.  
  - Command: `mvn verify -P integration`.

- **L4 (Pytest):**  
  - Container: Python 3.12 + pytest, pytest-cov, respx, httpx.  
  - Mount: AI/FastAPI service (e.g. `workflow-service/` or dedicated `ai-service/`) → `/app`.  
  - Command: `pytest --cov=app --cov-report=lcov -v`.

- **L5 (Playwright):**  
  - Container: Playwright image.  
  - Mount: repo root (or `frontend/` + `tests/e2e/`) so Playwright config and tests are available.  
  - App under test: either already running on host/compose (e.g. `http://host.docker.internal:3000`) or started as a service in the same compose.  
  - Command: `npx playwright install --with-deps chromium && npx playwright test`.

- **L6 (k6):**  
  - Container: `grafana/k6`.  
  - Mount: `tests/performance/` (or equivalent).  
  - Command: `k6 run scenario.js` (with env for base URL).

### 2.4 Compose layout (ISEP)

- **Option A — Single compose for tests:**  
  `infrastructure/docker/docker-compose.test.yml` defines services:  
  `frontend-unit`, `backend-unit`, `backend-integration`, `ai-pytest`, `e2e-playwright`, `perf-k6`.  
  Each service uses the appropriate image, mounts project paths, and runs the corresponding command.  
  MCP server (or CI) runs:  
  `docker compose -f infrastructure/docker/docker-compose.test.yml run --rm frontend-unit`, etc.

- **Option B — One compose per layer:**  
  e.g. `docker-compose.test-l1.yml`, `docker-compose.test-l2.yml`, …  
  Same idea: each file defines one (or a few) test runner services with mounts and commands.

- **Network:**  
  For E2E, test containers need to reach the app. Use the same Docker network as `docker-compose.dev.yml` (e.g. `network: isep_dev`) or expose app on host and use `http://host.docker.internal:3000` in Playwright config.

Recommended: **Option A** (one `docker-compose.test.yml`) for simplicity; document which service corresponds to which layer so MCP and CI can call them by name.

---

## 3. MCP Server — isep-test-runner (Cursor integration)

### 3.1 Purpose

- The **isep-test-runner** MCP server connects Cursor to the full ISEP test suite.
- Cursor’s AI can invoke test layers **by name** (e.g. “run frontend unit tests”, “run E2E for paper approval”).
- **All test execution is delegated to Docker:** the MCP server does **not** run Jest/Maven/Pytest/Playwright on the host; it runs `docker compose run …` (or `docker run …`) so that the testing tools are **part of Docker** and reusable.

### 3.2 Placement and config

- **Location:** e.g. `isep-mcp-server/` at repo root (as in [ISEP-TESTING-CONTEXT.md §4]( ./ISEP-TESTING-CONTEXT.md)).
- **Cursor config:** In `.cursor/mcp.json` (or Cursor MCP settings), add the server with `command` and `args` pointing to the built Node process.  
- **Environment:**  
  - `ISEP_ROOT`: path to repo root (for resolving compose file and project paths).  
  - Optional: `SONARQUBE_URL`, `SONARQUBE_TOKEN`, `PLAYWRIGHT_BASE_URL` for L7 and L5.

### 3.3 MCP tools (high level)

Each tool triggers the corresponding Docker test run (and optionally parses stdout/stderr/exit code to return a short result to Cursor).

| Tool name | What it does | Docker invocation (conceptual) |
|-----------|--------------|---------------------------------|
| `run_jest_tests` | Run L1 (frontend unit) | `docker compose -f …/docker-compose.test.yml run --rm frontend-unit` (optionally pass `--testPathPattern` via env or args) |
| `run_junit_tests` | Run L2 (backend unit) | `docker compose run --rm backend-unit` (optionally `-Dtest=…`) |
| `run_integration_tests` | Run L3 (Testcontainers) | `docker compose run --rm backend-integration` |
| `run_pytest_ai` | Run L4 (AI/FastAPI) | `docker compose run --rm ai-pytest` |
| `run_playwright_flow` | Run L5 E2E (named scenario/role) | `docker compose run --rm e2e-playwright npx playwright test --grep "…"` (or by project name) |
| `run_playwright_api` | Run L5 API contract tests | `docker compose run --rm e2e-playwright npx playwright test --project=api` (or equivalent) |
| `run_sonarqube_scan` | Trigger L7 SonarQube scan | Run `sonar-scanner` (in container or host; already documented) and optionally call SonarQube API for quality gate status |
| `get_coverage_report` | Aggregate L1–L4 coverage | Read lcov/coverage outputs from container runs or from mounted volumes where tests write reports |
| `run_accessibility_check` | Run axe on a route (L5) | Part of Playwright run (e.g. `--grep "accessibility"` or dedicated project) |
| `run_k6_load` | Run L6 load scenario | `docker compose run --rm perf-k6 k6 run tests/performance/<scenario>.js` |
| `generate_test_scaffold` | Generate test file skeleton | No Docker; MCP server writes a file under `ISEP_ROOT` (same as in context doc). |

Implementation detail: the MCP server can use `child_process.spawn` or `execSync` to run `docker compose -f <path> run --rm <service> [args]`, with `cwd: ISEP_ROOT`, and stream/capture stdout/stderr to return to Cursor.

### 3.4 MCP server project structure (unchanged intent)

Same as [ISEP-TESTING-CONTEXT.md §4]( ./ISEP-TESTING-CONTEXT.md):

```
isep-mcp-server/
  package.json
  tsconfig.json
  src/
    index.ts              # MCP entry; register tools
    tools/
      jest.ts             # → docker compose run frontend-unit
      junit.ts            # → docker compose run backend-unit
      integration.ts      # → docker compose run backend-integration
      pytest.ts           # → docker compose run ai-pytest
      playwright.ts       # → docker compose run e2e-playwright
      sonarqube.ts        # SonarQube trigger / quality gate
      coverage.ts         # Aggregate coverage from test runs
      scaffold.ts         # Generate test file (no Docker)
      accessibility.ts    # Part of Playwright or separate run
      k6.ts               # → docker compose run perf-k6
    utils/
      process.ts          # Run Docker commands; capture output
      reporter.ts         # Format results for Cursor
      fileDetector.ts     # Map open file → test path/class (optional)
```

The only behavioural change from the context doc is that `jest.ts`, `junit.ts`, `integration.ts`, `pytest.ts`, `playwright.ts`, `k6.ts` invoke **Docker** instead of local `npm`/`mvn`/`pytest`/`npx playwright`/`k6`.

---

## 4. Reusability for Other Projects

- **Same images:** Other projects can use the same `node-jest`, `maven-junit`, `python-pytest`, Playwright, k6 images.  
- **Same pattern:** They define their own `docker-compose.test.yml` (or equivalent) with the same service names and **different** build contexts or volume mounts pointing to their repo.  
- **MCP server:** Can be forked or parameterised (e.g. `COMPOSE_FILE`, `PROJECT_ROOT`) so the same MCP code drives tests for another repo that follows the same layout.

No change to the testing **tech stack** (Jest, JUnit, Testcontainers, Pytest, Playwright, k6, SonarQube); only the execution model is Docker-based and reusable.

---

## 5. Fitting with “Entire App and Tools in Docker”

- **App and infra:** Already in Docker (`docker-compose.dev.yml`: PostgreSQL, Redis, Keycloak, Kong, meeting-service, user-service, workflow-service, etc.).  
- **Tests:**  
  - **L1–L4:** Run in one-off containers that mount code; they do not need the full app stack (except L3, where Testcontainers starts Postgres).  
  - **L5 (E2E):** Playwright runs in a container and hits the app (same network or host.docker.internal). So the app stack can be started with `docker-compose.dev.yml` (and optionally frontend on host for dev), and E2E runs in Docker.  
  - **L6:** k6 runs in Docker and hits app/API URLs.  
  - **L7:** SonarQube already in Docker; scanner can run in container or on host.  
- **CI:** Same compose (or single-service runs) can be used in GitLab CI (or other CI) so that **all test stages run inside Docker** as well.

---

## 6. Test Cases — Location & Context Loading

- **Location:** All test-case docs live under **`Testing/Test Cases/`** (see [ISEP-TEST-CASES-INDEX.md](../../Testing/Test%20Cases/ISEP-TEST-CASES-INDEX.md)).
- **Context loading (keep context lean):**
  - **Approval chain work:** Load `ISEP-TESTING-CONTEXT.md` + `ISEP-TC-02-Paper-Approval.md`.
  - **Full UAT:** Load `ISEP-TC-06-UAT-SeaFireFighting.md`. TC-06 doubles as (1) Playwright E2E script blueprint and (2) formal UAT sign-off checklist — 18-row approval table for DGS to print and sign.
- **Where tests plug in:** L1 → Jest under `frontend/`; L2/L3 → JUnit/Testcontainers under `backend/…/src/test/java/`; L4 → Pytest under AI service `tests/`; L5 → Playwright under `tests/e2e/`; L6 → k6 under `tests/performance/`.

---

## 7. Next Steps (implementation order)

1. **Define reusable Docker images** (or Dockerfiles) for L1–L6 and add `docker-compose.test.yml` (or equivalent) under `infrastructure/docker/`.  
2. **Implement MCP server** (`isep-mcp-server/`) with tools that invoke `docker compose run …` for each layer; register in Cursor `.cursor/mcp.json`.  
3. **Add test cases** (when provided) into the appropriate layers and wire any new Playwright projects or Jest path patterns as needed.  
4. **CI:** Add/update GitLab CI (or other) so test stages run the same Docker test services (e.g. `docker compose -f docker-compose.test.yml run --rm frontend-unit`, etc.).

---

*Document Ref: ISEP-TEST-PLAN-01 | Aligns with ISEP-TESTING-CONTEXT.md (ISEP-TEST-ARCH-01)*
