#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getRepoRoot, runDockerCompose } from "./docker.js";

const mcp = new McpServer({
  name: "isep-test-runner",
  version: "0.1.0",
});

function runTool(service: string, profile?: string) {
  const repoRoot = getRepoRoot();
  const result = runDockerCompose(repoRoot, service, profile);
  const out = [result.stdout, result.stderr].filter(Boolean).join("\n");
  const summary = result.success
    ? `Exit code: 0. Output (last 4000 chars):\n${out.slice(-4000)}`
    : `Exit code: ${result.exitCode}. Stderr:\n${result.stderr}\nStdout:\n${result.stdout}`.slice(0, 4000);
  return {
    content: [{ type: "text" as const, text: summary }],
    isError: !result.success,
  };
}

mcp.registerTool(
  "run_jest_tests",
  {
    description:
      "Run L1 frontend unit tests (Jest + React Testing Library) via Docker. Use when asked to run frontend tests or unit tests.",
    inputSchema: {},
  },
  async () => runTool("frontend-unit")
);

mcp.registerTool(
  "run_junit_tests",
  {
    description:
      "Run L2 backend unit tests (JUnit + Mockito, meeting-service) via Docker. Use when asked to run backend tests or Java unit tests.",
    inputSchema: {},
  },
  async () => runTool("backend-unit")
);

mcp.registerTool(
  "run_integration_tests",
  {
    description:
      "Run L3 backend integration tests (Testcontainers + Postgres) via Docker. Requires Docker. Use when asked to run integration tests.",
    inputSchema: {},
  },
  async () => runTool("backend-integration", "full")
);

mcp.registerTool(
  "run_playwright_tests",
  {
    description:
      "Run L5 E2E tests (Playwright) via Docker. App should be running at PLAYWRIGHT_BASE_URL. Use when asked to run E2E or Playwright tests.",
    inputSchema: {},
  },
  async () => runTool("e2e-playwright", "full")
);

async function main() {
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
