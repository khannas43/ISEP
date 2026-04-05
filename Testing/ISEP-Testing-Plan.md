# ISEP Testing Plan — Tech Stack, Docker & MCP Server

**Document Ref:** ISEP-TEST-PLAN-01 | **Version:** 1.0  
**Project:** IMO Strategic Engagement Platform (ISEP) — Directorate General of Shipping, MoPSW  
**Related:** [ISEP-TESTING-CONTEXT.md](./ISEP-TESTING-CONTEXT.md) (architecture, patterns, invariants)

**Design principles:**
- All testing tools run **inside Docker** (reusable images; app and tools already in Docker).
- Same test-runner images and compose pattern are **reusable for other projects** (only mounts and paths change).
- An **MCP server** exposes test layers to Cursor so the AI can run tests and consume results; the MCP server **invokes Docker** to execute each layer.

**Test cases:** In [`Testing/Test Cases/`](./Test%20Cases/) (see [README](./README.md) for context-loading).

---

## Activities to be executed

| Id | Activity | Layer | Status |
|----|----------|--------|--------|
| ACT-T01 | Add Jest + React Testing Library + jest-dom to frontend; add `jest.config.js` and `npm test` script | L1 | 🟢 Done |
| ACT-T02 | Add one sample unit test (e.g. utility) and verify `npm test` passes | L1 | 🟢 Done |
| ACT-T03 | Create `infrastructure/docker/docker-compose.test.yml` with service `frontend-unit` (Node + mount frontend, run `npm ci && npm test`) | L1 | 🟢 Done |
| ACT-T04 | Add service `backend-unit` to docker-compose.test.yml (Maven + JDK 21, mount meeting-service, run `mvn test`) | L2 | 🟢 Done |
| ACT-T05 | Add `spring-boot-starter-test` to meeting-service `pom.xml`; add one sample JUnit test | L2 | 🟢 Done |
| ACT-T06 | Add service `backend-integration` (optional profile `-P integration`); add Testcontainers dependency if needed | L3 | 🟢 Done |
| ACT-T07 | Add service `ai-pytest` (Python + pytest, mount workflow-service or AI service) — optional until AI service has tests | L4 | ⬜ Not Started |
| ACT-T08 | Add Playwright to frontend or repo root; add `playwright.config.ts` and `tests/e2e` layout; add service `e2e-playwright` in compose | L5 | 🟢 Done |
| ACT-T09 | Add service `perf-k6` and placeholder script under `tests/performance/` — optional / defer | L6 | ⬜ Not Started |
| ACT-T10 | Implement MCP server `isep-mcp-server/` with tools invoking `docker compose -f docker-compose.test.yml run --rm <service>` | MCP | 🟢 Done |
| ACT-T11 | Add Cursor MCP config (`.cursor/mcp.json`) pointing to isep-mcp-server | MCP | 🟢 Done |

**Execution order:** ACT-T01 → ACT-T02 → ACT-T03 (L1 runnable in Docker); then ACT-T04, ACT-T05 (L2); then ACT-T06–T09 as needed; then ACT-T10, ACT-T11 (MCP).

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

## 6. Test Cases (to be provided separately)

- **Test cases** (e.g. concrete scenarios, RBAC matrices, E2E flows) will be **shared separately** and will plug into:
  - L1: Jest/RTL test files (e.g. under `frontend/app/`, `frontend/components/`).  
  - L2/L3: JUnit/Testcontainers test classes under `backend/…/src/test/java/`.  
  - L4: Pytest modules under `tests/` in the AI/FastAPI service.  
  - L5: Playwright specs under `tests/e2e/` (auth, modules, roles, api, accessibility) as in [ISEP-TESTING-CONTEXT.md §2 Layer 5]( ./ISEP-TESTING-CONTEXT.md).  
  - L6: k6 scripts under `tests/performance/`.

This plan does not duplicate the test-case content; it only defines the **tech stack**, **Docker execution model**, and **MCP server** so that when test cases are added, they run in Docker and are triggerable from Cursor via the MCP server.

---

## 7. Next Steps (implementation order)

See **Activities to be executed** above. Summary:

1. **L1:** Jest + RTL in frontend (ACT-T01, ACT-T02); `docker-compose.test.yml` with `frontend-unit` (ACT-T03).  
2. **L2:** `backend-unit` service + `spring-boot-starter-test` and sample test (ACT-T04, ACT-T05).  
3. **L3–L6:** Add remaining services to compose and optional tests (ACT-T06–T09).  
4. **MCP:** Implement isep-mcp-server and Cursor config (ACT-T10, ACT-T11).  
5. **CI:** Add/update GitLab CI so test stages run the same Docker test services.

---

*Document Ref: ISEP-TEST-PLAN-01 | Aligns with ISEP-TESTING-CONTEXT.md (ISEP-TEST-ARCH-01)*
