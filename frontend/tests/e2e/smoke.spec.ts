import { test, expect } from '@playwright/test';

/**
 * Smoke E2E — app is up and login or dashboard is visible (ACT-T08, TC-06 blueprint).
 * Requires app running at baseURL. See Testing/E2E-PREREQUISITES.md if this fails.
 */
test.describe('Smoke', () => {
  test('home page loads and shows login or dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ISEP|Strategic|IMO/i, { timeout: 10_000 });
    await expect(page.locator('body')).toBeVisible();
    const hasLogin = await page.getByRole('button', { name: /sign in/i }).isVisible().catch(() => false);
    const hasDashboard = await page.getByRole('link', { name: /dashboard|sign out/i }).isVisible().catch(() => false);
    const hasContent = await page.locator('body').getByText(/ISEP|Sign in/i).first().isVisible().catch(() => false);
    expect(hasLogin || hasDashboard || hasContent).toBeTruthy();
  });
});
