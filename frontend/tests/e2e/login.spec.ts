import { test, expect } from '@playwright/test';

/**
 * Login page E2E (TC-06 Phase 1). Requires app at baseURL. See Testing/E2E-PREREQUISITES.md if this fails.
 */
test.describe('Login', () => {
  test('login page has username and password fields', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel(/username/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});
