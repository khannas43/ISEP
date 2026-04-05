# ISEP MCP Server (isep-test-runner)

MCP server that exposes **test layer tools** to Cursor. Each tool runs the corresponding Docker Compose test service from `infrastructure/docker/docker-compose.test.yml`.

## Tools

| Tool | Service | Description |
|------|---------|-------------|
| `run_jest_tests` | frontend-unit | L1 frontend unit tests (Jest + RTL) |
| `run_junit_tests` | backend-unit | L2 backend unit tests (JUnit, meeting-service) |
| `run_integration_tests` | backend-integration (profile full) | L3 integration tests (Testcontainers) |
| `run_playwright_tests` | e2e-playwright (profile full) | L5 E2E tests (Playwright) |

## Requirements

- **Docker** running (for any tool that runs a service).
- **Repo root** must be the working directory when the server runs (Cursor typically starts MCP from the workspace folder).

## Build

**From repo root** (the folder that contains `frontend/`, `backend/`, `isep-mcp-server/`):

```bash
cd isep-mcp-server && npm install && npm run build
```

If you're in `frontend/` or another subfolder, go to repo root first: `cd ..` (or `cd ../..` if deeper), then run the command above.

## Cursor config

The project `.cursor/mcp.json` is configured to start this server. After adding or changing it, **restart Cursor** so the MCP server is loaded.

If the server fails to find the compose file, set `ISEP_ROOT` in the MCP server env to your repo root path (e.g. absolute path to the "DG Shipping" folder).

## Usage in Cursor

Ask the AI to run tests, e.g.:

- "Run frontend unit tests"
- "Run backend unit tests"
- "Run E2E Playwright tests"

The AI can call the matching tool; output (stdout/stderr and exit code) is returned to the chat.
