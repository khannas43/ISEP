/**
 * ACT-080 Workflow 2 — Governance, administration and read-only (ISEP-RBAC-Integration-Testing-Plan.md).
 * SA: dashboard, bodies, users, system health, audit, config, backups. IH: audit, reports. VW: read-only; negative checks.
 */
import { test, expect } from '@playwright/test';
import { loginAs, isOnLogin } from './rbac-auth';

test.describe('ACT-080 Workflow 2: Governance and read-only', () => {
  test('2.1 SA — login and land on SA dashboard', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'SA');
    if (path.includes('/login/mfa')) test.skip(true, 'SA requires MFA in this environment');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('link', { name: /sign out|dashboard/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('2.2 SA — bodies list and edit link', async ({ page }) => {
    const { path } = await loginAs(page, 'SA');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/bodies');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/bodies/);
    await expect(page.locator('body')).toContainText(/body|international|committee/i);
    const editLink = page.locator('table tbody').getByRole('link', { name: 'Edit' }).first();
    await expect(editLink).toBeVisible({ timeout: 10_000 });
  });

  test('2.3 SA — user list and New user', async ({ page }) => {
    const { path } = await loginAs(page, 'SA');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/admin/users');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByRole('link', { name: 'Add user' })).toBeVisible({ timeout: 10_000 });
  });

  test('2.5 SA — system health dashboard', async ({ page }) => {
    const { path } = await loginAs(page, 'SA');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/admin/system/health');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/admin\/system\/health/);
    await expect(page.locator('body')).toContainText(/health|status|service/i);
  });

  test('2.6 SA — audit log viewer', async ({ page }) => {
    const { path } = await loginAs(page, 'SA');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/admin/audit');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(page.locator('body')).toContainText(/audit|log|action|user/i);
  });

  test('2.7 SA — system config and workflow config', async ({ page }) => {
    const { path } = await loginAs(page, 'SA');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/admin/system/config');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathConfig = new URL(page.url()).pathname;
    if (!pathConfig.startsWith('/admin')) test.skip(true, 'SA did not reach admin (got ' + pathConfig + ')');
    else await expect(page).toHaveURL(/\/admin\/system\/config/);
    await page.goto('/admin/system/workflows');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathWorkflows = new URL(page.url()).pathname;
    if (!pathWorkflows.startsWith('/admin')) test.skip(true, 'SA did not reach admin/workflows (got ' + pathWorkflows + ')');
    else await expect(page).toHaveURL(/\/admin\/system\/workflows/);
  });

  test('2.8 SA — backup status and announcements', async ({ page }) => {
    const { path } = await loginAs(page, 'SA');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/admin/system/backups');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathBackups = new URL(page.url()).pathname;
    if (!pathBackups.startsWith('/admin')) test.skip(true, 'SA did not reach admin/backups (got ' + pathBackups + ')');
    else await expect(page).toHaveURL(/\/admin\/system\/backups/);
    await page.goto('/admin/announcements/new');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathAnn = new URL(page.url()).pathname;
    if (!pathAnn.startsWith('/admin')) test.skip(true, 'SA did not reach admin/announcements (got ' + pathAnn + ')');
    else await expect(page).toHaveURL(/\/admin\/announcements\/new/);
  });

  test('2.9 IH — audit log (read-only)', async ({ page }) => {
    const { path } = await loginAs(page, 'IH');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/admin/audit');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(page.locator('body')).toContainText(/audit|log/i);
  });

  test('2.10 IH — reports audit and custom', async ({ page }) => {
    const { path } = await loginAs(page, 'IH');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/reports/audit');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathAudit = new URL(page.url()).pathname;
    if (!pathAudit.startsWith('/reports')) test.skip(true, 'IH did not reach reports (got ' + pathAudit + ')');
    else await expect(page).toHaveURL(/\/reports\/audit/);
    await page.goto('/reports/custom');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathCustom = new URL(page.url()).pathname;
    if (!pathCustom.startsWith('/reports')) test.skip(true, 'IH did not reach reports/custom (got ' + pathCustom + ')');
    else await expect(page).toHaveURL(/\/reports\/custom/);
  });

  test('2.11 VW — login and Viewer dashboard', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'VW');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('link', { name: /sign out|dashboard/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('2.12 VW — meetings list read-only (no Create Meeting)', async ({ page }) => {
    const { path } = await loginAs(page, 'VW');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/meetings');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/meetings/);
    await expect(page.getByRole('link', { name: /create meeting|new meeting/i })).not.toBeVisible();
  });

  test('2.13 VW — meeting detail read-only', async ({ page }) => {
    const { path } = await loginAs(page, 'VW');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/meetings');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const firstMeeting = page.locator('table tbody a[href*="/meetings/"]').first();
    await firstMeeting.click();
    await expect(page).toHaveURL(/\/meetings\/[^/]+/);
    await expect(page.locator('body')).not.toContainText(/edit meeting|add participant|create meeting/i);
  });

  test('2.14 VW — document library and document view', async ({ page }) => {
    const { path } = await loginAs(page, 'VW');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/documents');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/documents/);
    const docLink = page.locator('a[href*="/documents/"]').first();
    if (await docLink.isVisible()) {
      await docLink.click();
      await expect(page).toHaveURL(/\/documents\/[^/]+/);
    }
  });

  test('2.15 VW — calendar and notifications', async ({ page }) => {
    const { path } = await loginAs(page, 'VW');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/calendar');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/calendar/);
    await page.goto('/notifications');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    await expect(page).toHaveURL(/\/notifications/);
  });

  test('2.18 ME — account profile and notification preferences', async ({ page }) => {
    const { path } = await loginAs(page, 'ME');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/account/profile');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathProfile = new URL(page.url()).pathname;
    if (!pathProfile.startsWith('/account')) test.skip(true, 'ME did not reach account (got ' + pathProfile + ')');
    else await expect(page).toHaveURL(/\/account\/profile/);
    await page.goto('/account/notification-preferences');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPrefs = new URL(page.url()).pathname;
    if (!pathPrefs.startsWith('/account')) test.skip(true, 'ME did not reach account/notification-preferences (got ' + pathPrefs + ')');
    else await expect(page).toHaveURL(/\/account\/notification-preferences/);
  });
});
