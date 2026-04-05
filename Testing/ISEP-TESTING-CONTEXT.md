# ISEP Testing Architecture — Cursor Context File
> **Document Ref:** ISEP-TEST-ARCH-01 | **Version:** 1.0 | **Status:** ACTIVE  
> **Project:** IMO Strategic Engagement Platform (ISEP) — Directorate General of Shipping, MoPSW  
> **Classification:** CONFIDENTIAL — Do not share outside project team  
> **Planning (Docker + MCP):** See [ISEP-Testing-Plan.md](./ISEP-Testing-Plan.md) for tech stack in Docker, reusable images, and MCP server design.

---

## 1. Stack Overview (for Cursor AI context)

ISEP is a full-stack government platform:

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | Spring Boot 3.x (Java 21) |
| AI Services | Python FastAPI 0.111.x |
| Database | PostgreSQL 16 with Row Level Security (RLS) |
| Auth | Keycloak 24 (OIDC) |
| API Gateway | Kong CE 3.7 |
| Search | Elasticsearch 8.x |
| Object Store | MinIO |
| CI/CD | GitLab CI + SonarQube CE 10.x (installed) |
| Container | Docker Swarm |

**RBAC Model:** Three-layer — PostgreSQL RLS + Spring Security `@PreAuthorize` + Next.js `RoleGuard`  
**Roles:** `SYSTEM_ADMIN`, `IC_DIVISION_HEAD`, `DELEGATION_LEADER`, `COORDINATOR`, `MEMBER`, `VIEWER`  
**Screens:** 70 screens across 15 modules  
**AI Features:** 3 Claude-powered features (Position Advisor, Meeting Preparedness Intelligence, Submission Draft Assistant) — all outputs land in DRAFT, never auto-committed

---

## 2. Full Testing Stack — 7 Layers

### Layer 1 — Frontend Unit Tests
```
Tool:       Jest 29.x + React Testing Library 14.x + @testing-library/jest-dom 6.x
Runner:     jest (via npm test)
Config:     jest.config.ts in Next.js root
Coverage:   jest --coverage → lcov + json-summary
Target:     ≥ 80% line coverage
```

**What to test:**
- All React components in `app/` and `components/`
- `RoleGuard` component — verify correct render/hide per role
- RBAC-driven conditional rendering (e.g., approve button only for `DELEGATION_LEADER`)
- Form validation logic, custom hooks, utility functions
- API client functions (mock fetch with `msw` or `jest.fn()`)

**Test file location:** co-located — `ComponentName.test.tsx` next to `ComponentName.tsx`

**Key test patterns:**
```typescript
// Role-based rendering test pattern
import { render, screen } from '@testing-library/react'
import { RoleGuard } from '@/components/RoleGuard'

test('hides approve button for MEMBER role', () => {
  render(<RoleGuard role="MEMBER" requiredRole="DELEGATION_LEADER">
    <button>Approve</button>
  </RoleGuard>)
  expect(screen.queryByText('Approve')).not.toBeInTheDocument()
})
```

---

### Layer 2 — Backend Unit Tests
```
Tool:       JUnit 5.10.x + Mockito 5.x + AssertJ 3.x
Runner:     mvn test
Config:     pom.xml (spring-boot-starter-test includes JUnit 5)
Coverage:   JaCoCo plugin → lcov report
Target:     ≥ 85% line coverage
```

**What to test:**
- All `@Service` classes — mock all `@Repository` dependencies via `@MockitoBean`
- 7-stage paper approval chain state machine (`DRAFT → FINALIZED`)
- All `@PreAuthorize` expressions — test with `@WithMockUser(roles = "...")`
- Business rule validation (e.g., MEMBER cannot submit without COORDINATOR consolidation)
- Exception handling paths

**Test file location:** `src/test/java/` mirroring `src/main/java/` package structure

**Key test patterns:**
```java
// Approval chain test pattern
@ExtendWith(MockitoExtension.class)
class PaperApprovalServiceTest {
    @Mock PaperRepository paperRepository;
    @InjectMocks PaperApprovalService service;

    @Test
    void shouldRejectSubmissionWhenNotConsolidated() {
        Paper paper = new Paper(PaperStatus.DRAFT, false); // not consolidated
        assertThatThrownBy(() -> service.submitToGroupLeader(paper))
            .isInstanceOf(InvalidStateException.class)
            .hasMessageContaining("consolidation required");
    }
}
```

---

### Layer 3 — Backend Integration Tests
```
Tool:       Spring Boot Test 3.x + Testcontainers 1.19.x + WireMock 3.x
Runner:     mvn verify -P integration
Config:     @SpringBootTest + @Testcontainers annotations
Coverage:   JaCoCo (merged with unit coverage)
Target:     100% RLS policy coverage (all 6 roles × all key tables)
```

**What to test:**
- **PostgreSQL RLS** — CRITICAL: verify participant isolation at DB layer
- Flyway migration correctness — all migrations apply cleanly on fresh container
- Repository layer with real PostgreSQL (not H2 — H2 does not support RLS)
- WireMock stubs for Keycloak token introspection in integration tests
- Kong CE route resolution (via WireMock stub of gateway)

**Test file location:** `src/test/java/` with suffix `IT.java` (e.g., `PaperRepositoryIT.java`)

**CRITICAL — RLS test pattern:**
```java
// RLS isolation test — proves MEMBER cannot read another delegation's data
@SpringBootTest
@Testcontainers
class ParticipantIsolationIT {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withInitScript("schema-with-rls.sql");

    @Test
    void memberCannotReadOtherDelegationFeedback() {
        // Set JWT context to MEMBER role, delegation = "IND"
        SecurityContextHolder.setContext(memberContext("IND"));
        List<Feedback> results = feedbackRepository.findAll();
        // Must only contain IND delegation feedback
        assertThat(results).allMatch(f -> f.getDelegationCode().equals("IND"));
    }
}
```

> ⚠️ **Never use H2 for RLS tests.** H2 does not support PostgreSQL RLS policies. Testcontainers is mandatory.

---

### Layer 4 — AI Feature Tests (FastAPI / Python)
```
Tool:       Pytest 8.x + pytest-mock 3.x + httpx 0.27.x + respx 0.21.x
Runner:     pytest --cov=app --cov-report=lcov
Config:     pytest.ini or pyproject.toml [tool.pytest.ini_options]
Coverage:   pytest-cov → lcov
Target:     ≥ 80% line coverage; 100% coverage of DRAFT-only invariant paths
```

**Three AI features to test:**
1. `POST /api/ai/position-advisor` — Position Advisor
2. `GET /api/ai/preparedness-score/{meetingId}` — Meeting Preparedness Intelligence
3. `POST /api/ai/draft-submission` — Submission Draft Assistant

**What to test:**
- Happy path with mocked Claude API response
- Output always has `status = DRAFT` (never auto-committed) — **core safety invariant**
- Claude API timeout → 504 response, no partial save
- Claude API rate limit → 429 response with retry-after header
- Malformed Claude response → 500 response, error logged
- Input validation (missing agenda paper, unauthorized role)

**CRITICAL — Mock Claude API pattern:**
```python
# Never call real Claude API in tests — use respx to intercept httpx
import respx
import httpx
from httpx import Response

@pytest.mark.asyncio
async def test_position_advisor_returns_draft(client, sample_agenda_paper):
    mock_claude_response = {
        "content": [{"type": "text", "text": "India should SUPPORT this proposal..."}],
        "model": "claude-sonnet-4-20250514"
    }
    with respx.mock:
        respx.post("https://api.anthropic.com/v1/messages").mock(
            return_value=Response(200, json=mock_claude_response)
        )
        response = await client.post("/api/ai/position-advisor", json=sample_agenda_paper)
    
    assert response.status_code == 200
    assert response.json()["status"] == "DRAFT"          # MUST be DRAFT
    assert response.json()["auto_committed"] == False    # MUST never auto-commit

@pytest.mark.asyncio  
async def test_position_advisor_draft_on_claude_timeout(client, sample_agenda_paper):
    with respx.mock:
        respx.post("https://api.anthropic.com/v1/messages").mock(
            side_effect=httpx.TimeoutException("timeout")
        )
        response = await client.post("/api/ai/position-advisor", json=sample_agenda_paper)
    assert response.status_code == 504
    # Verify nothing was saved to DB
```

**Test file location:** `tests/` in FastAPI service root

---

### Layer 5 — E2E + API Tests
```
Tool:       Playwright 1.44.x + @axe-playwright 2.x (accessibility)
Runner:     npx playwright test
Config:     playwright.config.ts in project root
Coverage:   N/A (flow coverage tracked separately)
Target:     100% of critical user flows; ≥ 98% E2E pass rate on nightly
```

**Test organisation:**
```
tests/
  e2e/
    auth/
      login.spec.ts           # All 6 role login/logout flows
      keycloak-oidc.spec.ts   # Token refresh, session expiry
    modules/
      dashboard.spec.ts
      meeting-management.spec.ts
      agenda-documents.spec.ts
      paper-drafting.spec.ts   # Full 7-stage approval chain E2E
      collaboration.spec.ts
      ...
    roles/
      system-admin.spec.ts
      delegation-leader.spec.ts
      member-isolation.spec.ts  # Verify participant isolation in UI
    api/
      kong-gateway.spec.ts     # All 70 API routes — status + schema
      rbac-api.spec.ts         # Verify API returns 403 for wrong roles
    accessibility/
      wcag-audit.spec.ts       # axe-core on all screens
  fixtures/
    auth.ts                    # Keycloak login helpers per role
    sea-fire-fighting.ts       # Sample UAT data fixtures
```

**Page Object Model — required pattern:**
```typescript
// All screens must have a Page Object
// e.g., pages/PaperApprovalPage.ts
export class PaperApprovalPage {
  constructor(private page: Page) {}
  
  async submitToDelegationLeader() {
    await this.page.getByTestId('btn-submit-dl').click()
    await this.page.waitForSelector('[data-status="PENDING_DL_REVIEW"]')
  }
  
  async getApprovalStatus(): Promise<string> {
    return this.page.getByTestId('approval-status').innerText()
  }
}
```

**Role authentication fixture:**
```typescript
// fixtures/auth.ts — reuse across all tests
export async function loginAs(page: Page, role: ISEPRole) {
  await page.goto('/auth/login')
  await page.fill('[name=username]', TEST_USERS[role].username)
  await page.fill('[name=password]', TEST_USERS[role].password)
  await page.click('[type=submit]')
  await page.waitForURL('/dashboard')
}
```

**API testing via Playwright (Kong CE gateway):**
```typescript
test('GET /api/meetings returns 200 for COORDINATOR role', async ({ request }) => {
  const response = await request.get('/api/meetings', {
    headers: { Authorization: `Bearer ${await getToken('COORDINATOR')}` }
  })
  expect(response.status()).toBe(200)
  const body = await response.json()
  expect(body).toMatchObject({ meetings: expect.any(Array) })
})

test('GET /api/meetings returns 403 for VIEWER role on restricted endpoint', async ({ request }) => {
  const response = await request.get('/api/meetings/create', {
    headers: { Authorization: `Bearer ${await getToken('VIEWER')}` }
  })
  expect(response.status()).toBe(403)
})
```

---

### Layer 6 — Performance Tests
```
Tool:       k6 0.51.x + k6 browser (built-in)
Runner:     k6 run tests/performance/scenario.js
Config:     k6 options block in each script
Target:     p95 latency < 2s; error rate < 1% at 50 concurrent users
```

**Critical scenarios to test:**
- Concurrent login (50 users, 6 roles)
- Agenda paper list with Elasticsearch query (100 papers)
- Position Advisor AI call (10 concurrent — rate limit awareness)
- Paper approval chain submission burst

**Defer to:** Sprint 4 (pre-UAT)

---

### Layer 7 — Static Analysis (SonarQube — already installed)
```
Tool:       SonarQube CE 10.x (installed at localhost:9000)
            ESLint 8.x + eslint-plugin-testing-library
            Checkstyle 10.x (Java)
Runner:     sonar-scanner (triggered by GitLab CI)
Config:     sonar-project.properties in root
```

**Quality Gate thresholds (configure in SonarQube UI):**
| Metric | Threshold |
|---|---|
| Coverage (new code) | ≥ 80% |
| Duplications (new code) | < 3% |
| Security Rating | A |
| Reliability Rating | A |
| Maintainability Rating | A |
| Security Hotspots Reviewed | 100% |

**sonar-project.properties:**
```properties
sonar.projectKey=isep
sonar.projectName=ISEP - IMO Strategic Engagement Platform
sonar.sources=src/main,app,components,services
sonar.tests=src/test,tests,__tests__
sonar.exclusions=**/node_modules/**,**/.next/**,**/dist/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.java.coveragePlugin=jacoco
sonar.jacoco.reportPaths=target/jacoco.xml
sonar.python.coverage.reportPaths=coverage/lcov.info
sonar.qualitygate.wait=true
```

---

## 3. GitLab CI Pipeline — Test Stages

```yaml
# .gitlab-ci.yml — test stages

stages:
  - lint
  - unit
  - integration
  - e2e
  - quality-gate
  - performance   # nightly only

# ── LINT ──────────────────────────────────────────
lint:frontend:
  stage: lint
  script:
    - npm run lint
    - npm run type-check

lint:backend:
  stage: lint
  script:
    - mvn checkstyle:check

# ── UNIT ──────────────────────────────────────────
test:jest:
  stage: unit
  script:
    - npm test -- --coverage --ci
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

test:junit:
  stage: unit
  script:
    - mvn test -pl backend
  artifacts:
    reports:
      junit: backend/target/surefire-reports/TEST-*.xml

test:pytest:
  stage: unit
  script:
    - cd ai-service && pip install -r requirements-dev.txt
    - pytest --cov=app --cov-report=xml --cov-report=lcov -v
  artifacts:
    reports:
      junit: ai-service/junit-report.xml

# ── INTEGRATION ───────────────────────────────────
test:integration:
  stage: integration
  services:
    - postgres:16
  script:
    - mvn verify -P integration -pl backend
  artifacts:
    reports:
      junit: backend/target/failsafe-reports/TEST-*.xml

# ── E2E ───────────────────────────────────────────
test:playwright:
  stage: e2e
  script:
    - npx playwright install --with-deps chromium
    - npx playwright test --reporter=junit,html
  artifacts:
    when: always
    paths:
      - playwright-report/
    reports:
      junit: test-results/junit.xml

# ── QUALITY GATE ──────────────────────────────────
sonarqube:
  stage: quality-gate
  script:
    - sonar-scanner
      -Dsonar.host.url=$SONARQUBE_URL
      -Dsonar.token=$SONARQUBE_TOKEN
  allow_failure: false   # BLOCKING — MR cannot merge if gate fails

# ── PERFORMANCE (nightly) ─────────────────────────
test:k6:
  stage: performance
  rules:
    - if: '$CI_PIPELINE_SOURCE == "schedule"'
  script:
    - k6 run tests/performance/baseline.js
```

---

## 4. MCP Server — isep-test-runner

### Purpose
The `isep-test-runner` MCP server connects Cursor IDE to the full ISEP test suite. Cursor's AI agent can invoke any test layer directly from the editor without switching context.

### MCP Config — add to `.cursor/mcp.json` in project root
```json
{
  "mcpServers": {
    "isep-test-runner": {
      "command": "node",
      "args": ["./isep-mcp-server/dist/index.js"],
      "env": {
        "ISEP_ROOT": "/path/to/isep",
        "SONARQUBE_URL": "http://localhost:9000",
        "SONARQUBE_TOKEN": "${SONAR_TOKEN}",
        "PLAYWRIGHT_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

### MCP Tools Exposed to Cursor

| Tool Name | What it Does | Layers |
|---|---|---|
| `run_jest_tests` | Run Jest for the currently open component file | L1 |
| `run_junit_tests` | Run JUnit for the currently open Java class | L2 |
| `run_integration_tests` | Spin Testcontainers + run integration suite | L3 |
| `run_pytest_ai` | Run Pytest for AI feature endpoints | L4 |
| `run_playwright_flow` | Run named Playwright scenario by role (e.g., `paper_approval_dl`) | L5 |
| `run_playwright_api` | Validate all Kong CE API contracts | L5 |
| `run_sonarqube_scan` | Trigger SonarQube + return quality gate result | L7 |
| `get_coverage_report` | Aggregate Jest + JUnit + Pytest coverage summary | L1–L4 |
| `run_accessibility_check` | Run axe-core on specified screen route | L5 |
| `run_k6_load` | Run k6 scenario for named API endpoint | L6 |
| `watch_test_on_save` | Auto-run relevant tests on every file save | L1–L4 |
| `generate_test_scaffold` | Generate test file skeleton for new component/service | L1–L4 |

### MCP Server Project Structure
```
isep-mcp-server/
  package.json
  tsconfig.json
  src/
    index.ts                  # MCP server entry — registers all tools
    tools/
      jest.ts                 # Jest runner
      junit.ts                # JUnit runner (Maven child_process)
      integration.ts          # Testcontainers + Spring Boot Test runner
      pytest.ts               # Pytest runner
      playwright.ts           # Playwright scenario runner
      sonarqube.ts            # SonarQube REST API integration
      coverage.ts             # Coverage aggregator
      scaffold.ts             # Test file generator
      accessibility.ts        # axe-core runner
      k6.ts                   # k6 runner
    utils/
      process.ts              # Child process execution helper
      reporter.ts             # Format test results for Cursor display
      fileDetector.ts         # Detect which test maps to open file
```

### MCP Server — index.ts skeleton
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { runJest } from './tools/jest.js'
import { runJUnit } from './tools/junit.js'
import { runPytest } from './tools/pytest.js'
import { runPlaywright } from './tools/playwright.js'
import { runSonarQube } from './tools/sonarqube.js'
import { generateScaffold } from './tools/scaffold.js'
import { runK6 } from './tools/k6.js'
import { getCoverageReport } from './tools/coverage.js'

const server = new McpServer({
  name: 'isep-test-runner',
  version: '1.0.0'
})

server.tool('run_jest_tests',
  'Run Jest tests for the specified component file or all frontend tests',
  { filePath: z.string().optional().describe('Relative path to component file') },
  async ({ filePath }) => runJest(filePath)
)

server.tool('run_junit_tests',
  'Run JUnit tests for the specified Java class or full backend suite',
  { className: z.string().optional().describe('Java class name e.g. PaperApprovalService') },
  async ({ className }) => runJUnit(className)
)

server.tool('run_pytest_ai',
  'Run Pytest suite for FastAPI AI feature endpoints',
  { feature: z.enum(['position-advisor', 'preparedness', 'draft-assistant', 'all']).default('all') },
  async ({ feature }) => runPytest(feature)
)

server.tool('run_playwright_flow',
  'Execute a named Playwright E2E scenario for a specific role',
  {
    scenario: z.string().describe('Scenario name e.g. paper_approval_full_chain'),
    role: z.enum(['SYSTEM_ADMIN','IC_DIVISION_HEAD','DELEGATION_LEADER','COORDINATOR','MEMBER','VIEWER']).optional()
  },
  async ({ scenario, role }) => runPlaywright(scenario, role)
)

server.tool('run_sonarqube_scan',
  'Trigger SonarQube analysis and return quality gate status',
  {},
  async () => runSonarQube()
)

server.tool('generate_test_scaffold',
  'Generate a test file skeleton for a new React component or Spring Boot service',
  {
    filePath: z.string().describe('Path to the source file needing tests'),
    type: z.enum(['react-component', 'spring-service', 'fastapi-endpoint', 'playwright-e2e'])
  },
  async ({ filePath, type }) => generateScaffold(filePath, type)
)

server.tool('get_coverage_report',
  'Aggregate Jest + JUnit + Pytest coverage and return summary',
  {},
  async () => getCoverageReport()
)

server.tool('run_k6_load',
  'Run k6 load test for a named API endpoint scenario',
  { scenario: z.string().describe('k6 scenario name e.g. concurrent_login') },
  async ({ scenario }) => runK6(scenario)
)

const transport = new StdioServerTransport()
await server.connect(transport)
```

### MCP Tool — jest.ts implementation
```typescript
import { execSync } from 'child_process'
import path from 'path'

export async function runJest(filePath?: string): Promise<{ content: Array<{type: string, text: string}> }> {
  const isepRoot = process.env.ISEP_ROOT!
  let cmd = 'npm test -- --ci --coverage'
  
  if (filePath) {
    // Find corresponding test file
    const testFile = filePath.replace(/\.(tsx?|jsx?)$/, '.test.$1')
    cmd = `npm test -- --ci --coverage --testPathPattern="${path.basename(testFile)}"`
  }
  
  try {
    const output = execSync(cmd, { cwd: isepRoot, encoding: 'utf-8', timeout: 120000 })
    return { content: [{ type: 'text', text: `✅ Jest passed\n\n${output}` }] }
  } catch (err: any) {
    return { content: [{ type: 'text', text: `❌ Jest failed\n\n${err.stdout}\n\nSTDERR:\n${err.stderr}` }] }
  }
}
```

### MCP Tool — scaffold.ts implementation
```typescript
const SCAFFOLDS = {
  'react-component': (name: string) => `
import { render, screen, fireEvent } from '@testing-library/react'
import { ${name} } from './${name}'

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />)
    // TODO: add assertions
  })

  it('renders correctly for DELEGATION_LEADER role', () => {
    render(<${name} role="DELEGATION_LEADER" />)
    // TODO: assert role-specific elements
  })

  it('hides restricted elements for MEMBER role', () => {
    render(<${name} role="MEMBER" />)
    // TODO: assert restricted elements are not in document
  })
})`,

  'spring-service': (name: string) => `
@ExtendWith(MockitoExtension.class)
class ${name}Test {

    @Mock
    private ${name}Repository repository; // TODO: adjust dependencies

    @InjectMocks
    private ${name} service;

    @Test
    void shouldSucceedOnHappyPath() {
        // Arrange
        // TODO: set up mock behaviour
        
        // Act
        // var result = service.someMethod(input);
        
        // Assert
        // assertThat(result).isNotNull();
    }

    @Test
    void shouldThrowWhenPreconditionFails() {
        assertThatThrownBy(() -> service.someMethod(null))
            .isInstanceOf(IllegalArgumentException.class);
    }
}`,

  'fastapi-endpoint': (name: string) => `
import pytest
import respx
from httpx import Response

@pytest.mark.asyncio
async def test_${name}_happy_path(client):
    mock_response = {"content": [{"type": "text", "text": "mocked output"}]}
    with respx.mock:
        respx.post("https://api.anthropic.com/v1/messages").mock(
            return_value=Response(200, json=mock_response)
        )
        response = await client.post("/api/ai/${name}", json={})
    assert response.status_code == 200
    assert response.json()["status"] == "DRAFT"  # MUST always be DRAFT

@pytest.mark.asyncio
async def test_${name}_claude_timeout(client):
    import httpx
    with respx.mock:
        respx.post("https://api.anthropic.com/v1/messages").mock(
            side_effect=httpx.TimeoutException("timeout")
        )
        response = await client.post("/api/ai/${name}", json={})
    assert response.status_code == 504`,
}

export async function generateScaffold(filePath: string, type: string) {
  const name = path.basename(filePath).replace(/\.[^.]+$/, '')
  const scaffold = SCAFFOLDS[type as keyof typeof SCAFFOLDS]?.(name) ?? '// No scaffold available for this type'
  const testPath = filePath.replace(/\.(tsx?|jsx?|java|py)$/, (ext) => {
    if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) return `.test${ext}`
    if (ext === '.java') return 'Test.java'
    return '_test.py'
  })
  fs.writeFileSync(testPath, scaffold.trim())
  return { content: [{ type: 'text', text: `✅ Scaffold created at ${testPath}` }] }
}
```

---

## 5. Coverage Targets — Quick Reference

| Module | Tool | Min Target | Critical |
|---|---|---|---|
| Next.js components (70 screens) | Jest + RTL | 80% | RoleGuard, RBAC rendering |
| Spring Boot services | JUnit 5 | 85% | 7-stage approval chain |
| PostgreSQL RLS policies | Testcontainers | **100%** | All 6 roles × all tables |
| FastAPI AI endpoints | Pytest | 80% | DRAFT-only invariant |
| Kong CE API routes | Playwright API | Contract | All 70 routes |
| E2E critical paths | Playwright | **100% paths** | Paper approval, all 6 roles |

---

## 6. Key Invariants — Never Break These

These are absolute rules enforced by tests. Any code change that breaks them must be rejected:

1. **Participant isolation** — A `MEMBER` JWT must never return another delegation's feedback, position papers, or tasks from any API endpoint. Verified by: Testcontainers RLS test + Playwright API test.

2. **AI output always DRAFT** — All three AI features (`position-advisor`, `preparedness`, `draft-submission`) must set `status = DRAFT` and `auto_committed = false`. Verified by: Pytest on every AI endpoint.

3. **Approval chain sequence** — A paper cannot skip stages. `DRAFT → Group Leader` is the only valid first transition. Verified by: JUnit service tests + Playwright E2E.

4. **RBAC enforcement** — Every API endpoint must return `403` when called by a role without permission. Verified by: Playwright API tests for all 70 routes × 6 roles.

5. **SonarQube gate** — No MR can merge with SonarQube Quality Gate = `FAILED`. Enforced by GitLab CI with `allow_failure: false`.

---

## 7. Test Data — Sea Fire Fighting (UAT)

Sample meeting pre-loaded for UAT and Playwright E2E:

```
Meeting:      Sea Fire Fighting
Session:      4 | Body: SSE (IMO)
Dates:        2–5 Feb 2027 | Location: Colombo | Type: In-Person
Participants: 8 (DGS, MMD Mumbai, MMD Chennai, MMD Kolkata, MoPSW, BIS)
Agenda Items: 7 (Items 4, 5, 7 = HIGH PRIORITY — formal submissions required)
Tasks:        33 tasks across Items 1–7
Papers:       3 formal papers walking full 7-stage approval chain
```

Test user credentials (seed in Keycloak dev realm):

| Role | Username | Email |
|---|---|---|
| `SYSTEM_ADMIN` | `admin.test` | `admin@dgs.test` |
| `IC_DIVISION_HEAD` | `icdh.test` | `icdh@dgs.test` |
| `DELEGATION_LEADER` | `dl.test` | `dl@dgs.test` |
| `COORDINATOR` | `coord.test` | `coord@dgs.test` |
| `MEMBER` | `member1.test` | `member1@dgs.test` |
| `VIEWER` | `viewer.test` | `viewer@dgs.test` |

---

## 8. Quick Commands — Developer Reference

```bash
# ── FRONTEND ──────────────────────────────────────
npm test                          # Run all Jest tests
npm test -- --watch               # Watch mode
npm test -- --coverage            # With coverage report
npm test -- --testPathPattern=RoleGuard  # Run specific test

# ── BACKEND ───────────────────────────────────────
mvn test                          # Run all JUnit tests
mvn test -pl backend -Dtest=PaperApprovalServiceTest  # Specific class
mvn verify -P integration         # Run integration tests (Testcontainers)

# ── AI SERVICE ────────────────────────────────────
cd ai-service
pytest                            # All tests
pytest tests/test_position_advisor.py -v   # Specific module
pytest --cov=app --cov-report=html # With HTML coverage report

# ── E2E ───────────────────────────────────────────
npx playwright test               # All E2E tests (headless)
npx playwright test --headed      # With browser visible
npx playwright test --grep "paper approval"   # Specific test
npx playwright test --project=chromium        # Single browser

# ── SONARQUBE ─────────────────────────────────────
sonar-scanner                     # Full analysis (uses sonar-project.properties)

# ── K6 ────────────────────────────────────────────
k6 run tests/performance/baseline.js
k6 run --vus 50 --duration 5m tests/performance/concurrent-login.js

# ── MCP SERVER ────────────────────────────────────
cd isep-mcp-server
npm run build
node dist/index.js                # Start MCP server (Cursor connects via stdio)
```

---

## 9. File Structure — Testing Files Location

```
isep/                                   # Project root
├── .cursor/
│   └── mcp.json                        # MCP server config for Cursor
├── isep-mcp-server/                    # MCP server (separate package)
│   └── src/
│       ├── index.ts
│       └── tools/
├── frontend/                           # Next.js
│   ├── app/
│   │   └── **/*.test.tsx               # Co-located component tests
│   ├── components/
│   │   └── **/*.test.tsx
│   ├── jest.config.ts
│   └── playwright.config.ts
├── backend/                            # Spring Boot
│   └── src/
│       ├── main/java/
│       └── test/java/
│           ├── **/*Test.java           # Unit tests
│           └── **/*IT.java             # Integration tests (Testcontainers)
├── ai-service/                         # FastAPI
│   ├── app/
│   └── tests/
│       ├── conftest.py                 # Shared fixtures, mock Claude client
│       ├── test_position_advisor.py
│       ├── test_preparedness.py
│       └── test_draft_assistant.py
├── tests/
│   ├── e2e/                            # Playwright E2E
│   │   ├── auth/
│   │   ├── modules/
│   │   ├── roles/
│   │   ├── api/
│   │   └── accessibility/
│   ├── fixtures/
│   │   ├── auth.ts
│   │   └── sea-fire-fighting.ts
│   └── performance/                    # k6 scripts
│       └── baseline.js
└── sonar-project.properties
```

---

*Document Ref: ISEP-TEST-ARCH-01 | For Cursor AI context use only | Confidential*
