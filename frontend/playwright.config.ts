import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for ISEP (ACT-T08). L5 tests; TC-06 is the UAT blueprint.
 * Run: npm run test:e2e (app must be running at baseURL).
 * Reports: when TEST_RESULTS_BASE is set (e.g. in Docker), HTML goes to Testing/results/e2e.
 */
const resultsDir = process.env.TEST_RESULTS_BASE
  ? `${process.env.TEST_RESULTS_BASE}/results/e2e`
  : 'playwright-report';

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${resultsDir}/html`, open: 'never' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  outputDir: 'test-results',
});
