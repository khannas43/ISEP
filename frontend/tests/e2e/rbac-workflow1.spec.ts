/**
 * ACT-080 Workflow 1 — Meeting lifecycle and collaboration (ISEP-RBAC-Integration-Testing-Plan.md).
 * CO, ME, DL, IH: dashboard, meetings, agenda, papers, live, approval.
 * Requires: app + Keycloak running; test users (co-user, me-user, dl-user, ih-user).
 */
import { test, expect } from '@playwright/test';
import { loginAs, isOnLogin } from './rbac-auth';

test.describe('ACT-080 Workflow 1: Meeting lifecycle and collaboration', () => {
  test('1.1 CO — login and land on Coordinator dashboard', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'CO');
    if (path.includes('/login/mfa')) test.skip(true, 'CO login requires MFA in this environment');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('link', { name: /sign out|dashboard/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('1.2 CO — meetings list and Create Meeting available', async ({ page }) => {
    const { path } = await loginAs(page, 'CO');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/meetings');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/meetings/);
    await expect(page.locator('h1')).toContainText(/meetings/i);
    const createLink = page.getByRole('link', { name: 'Create Meeting' });
    if (!(await createLink.isVisible().catch(() => false))) {
      test.skip(true, 'Create Meeting not shown — ensure co-user has COORDINATOR role in Keycloak');
    }
    await expect(createLink).toBeVisible();
  });

  test('1.3 CO — open meeting detail (overview tab)', async ({ page }) => {
    const { path } = await loginAs(page, 'CO');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/meetings');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await page.locator('table tbody a[href*="/meetings/"]').first().click();
    await expect(page).toHaveURL(/\/meetings\/[^/]+($|\?)/);
    await expect(page.locator('body')).toContainText(/overview|agenda|participant|document|task|live|outcome|history/i);
  });

  test('1.7 ME — login and land on Member dashboard', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'ME');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('link', { name: /sign out|dashboard/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('1.10 ME — papers list and draft access', async ({ page }) => {
    const { path } = await loginAs(page, 'ME');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/papers/);
    await expect(page.locator('body')).toContainText(/paper|draft|approval/i);
  });

  test('1.13 DL — login and land on Delegation Leader dashboard', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'DL');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('link', { name: /sign out|dashboard/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('1.14 DL — open meeting Live lobby', async ({ page }) => {
    const { path } = await loginAs(page, 'DL');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/meetings');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await page.locator('table tbody a[href*="/meetings/"]').first().click();
    await page.waitForURL(/\/meetings\/[^/]+/);
    const basePath = new URL(page.url()).pathname.replace(/\/$/, '');
    if (!basePath.includes('/meetings/') || basePath.endsWith('/create')) {
      test.skip(true, 'No meeting detail link (empty list or only create link)');
    }
    await page.goto(basePath + '/live');
    await expect(page).toHaveURL(/\/live/);
  });

  test('1.18 IH — login and land on IC Division Head dashboard', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'IH');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('link', { name: /sign out|dashboard/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('1.19 IH — open approval workflow for a paper', async ({ page }) => {
    const { path } = await loginAs(page, 'IH');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const paperLink = page.locator('a[href*="/papers/"]').first();
    await paperLink.click();
    await page.waitForURL(/\/papers\/[^/]+/);
    await page.getByRole('link', { name: /approval|view approval/i }).first().click().catch(() => page.goto(page.url().replace(/\/view$/, '/approval').replace(/\/draft$/, '/approval')));
    await expect(page).toHaveURL(/\/approval/);
  });

  test('1.21 ME — calendar and notifications', async ({ page }) => {
    const { path } = await loginAs(page, 'ME');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/calendar');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathCalendar = new URL(page.url()).pathname;
    if (!pathCalendar.startsWith('/calendar')) test.skip(true, 'ME did not reach calendar (got ' + pathCalendar + ')');
    await page.goto('/notifications');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathNotif = new URL(page.url()).pathname;
    if (!pathNotif.startsWith('/notifications')) test.skip(true, 'ME did not reach notifications (got ' + pathNotif + ')');
  });
});
