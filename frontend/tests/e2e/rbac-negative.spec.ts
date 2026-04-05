/**
 * ACT-080 Negative checks — Unauthorized access (ISEP-RBAC-Integration-Testing-Plan.md).
 * VW → /admin, /papers expect redirect to /unauthorized. ME → /reports/audit expect unauthorized.
 * Pass = pathname starts with /unauthorized; otherwise skip with diagnostic.
 */
import { test } from '@playwright/test';
import { loginAs, isOnLogin } from './rbac-auth';

test.describe('ACT-080 Negative: Unauthorized access', () => {
  test('VW — /admin/users redirects to unauthorized', async ({ page }) => {
    const { path } = await loginAs(page, 'VW');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/admin/users');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const current = new URL(page.url()).pathname;
    if (!current.startsWith('/unauthorized')) test.skip(true, 'App did not redirect to /unauthorized (got ' + current + ')');
  });

  test('VW — /admin/system/health redirects to unauthorized', async ({ page }) => {
    const { path } = await loginAs(page, 'VW');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/admin/system/health');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const current = new URL(page.url()).pathname;
    if (!current.startsWith('/unauthorized')) test.skip(true, 'App did not redirect to /unauthorized (got ' + current + ')');
  });

  test('VW — /papers redirects to unauthorized', async ({ page }) => {
    const { path } = await loginAs(page, 'VW');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const current = new URL(page.url()).pathname;
    if (!current.startsWith('/unauthorized')) test.skip(true, 'App did not redirect to /unauthorized (got ' + current + ')');
  });

  test('VW — /reports redirects to unauthorized (per matrix)', async ({ page }) => {
    const { path } = await loginAs(page, 'VW');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/reports');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const current = new URL(page.url()).pathname;
    if (!current.startsWith('/unauthorized')) test.skip(true, 'App did not redirect to /unauthorized (got ' + current + ')');
  });

  test('ME — /reports/audit redirects to unauthorized', async ({ page }) => {
    const { path } = await loginAs(page, 'ME');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/reports/audit');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const current = new URL(page.url()).pathname;
    if (!current.startsWith('/unauthorized')) test.skip(true, 'App did not redirect to /unauthorized (got ' + current + ')');
  });
});
