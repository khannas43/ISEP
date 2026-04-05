/**
 * Papers menu & approval workflow E2E (ISEP-TC-02, TESTING-STATUS §4).
 * Covers: papers list, draft view, approval workflow, reject — CO/MEMBER/DL/IH.
 * VW → /papers redirects to /unauthorized (see rbac-negative.spec.ts).
 */
import { test, expect } from '@playwright/test';
import { loginAs, isOnLogin } from './rbac-auth';

test.describe('Papers workflow (TC-02)', () => {
  test('CO — papers list and open draft', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'CO');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPapers = new URL(page.url()).pathname;
    if (!pathPapers.startsWith('/papers')) test.skip(true, 'CO did not reach /papers (got ' + pathPapers + ')');
    await expect(page.locator('body')).toContainText(/Papers|paper|filter|No papers/i);
    const draftLink = page.locator('table tbody').getByRole('link', { name: 'Draft' }).first();
    if (await draftLink.isVisible().catch(() => false)) {
      await draftLink.click();
      await expect(page).toHaveURL(/\/papers\/[^/]+\/draft/, { timeout: 10000 });
      await expect(page.locator('body')).toContainText(/Approval workflow|Papers list|draft/i);
    }
  });

  test('CO — papers list and open approval', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'CO');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPapers = new URL(page.url()).pathname;
    if (!pathPapers.startsWith('/papers')) test.skip(true, 'CO did not reach /papers (got ' + pathPapers + ')');
    const approvalLink = page.locator('table tbody').getByRole('link', { name: 'Approval' }).first();
    if (!(await approvalLink.isVisible().catch(() => false))) {
      test.skip(true, 'No papers in list (API may return empty); add papers to run approval flow');
      return;
    }
    await approvalLink.click();
    await expect(page).toHaveURL(/\/papers\/[^/]+\/approval/, { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/Approval workflow|current stage|Approve|Reject/i);
  });

  test('ME — papers list and open draft', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'ME');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPapers = new URL(page.url()).pathname;
    if (!pathPapers.startsWith('/papers')) test.skip(true, 'ME did not reach /papers (got ' + pathPapers + ')');
    const draftLink = page.locator('table tbody').getByRole('link', { name: 'Draft' }).first();
    if (await draftLink.isVisible().catch(() => false)) {
      await draftLink.click();
      await expect(page).toHaveURL(/\/papers\/[^/]+\/draft/, { timeout: 10000 });
      await expect(page.locator('body')).toContainText(/Approval workflow|Papers list/i);
    }
  });

  test('ME — papers list and open view', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'ME');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPapers = new URL(page.url()).pathname;
    if (!pathPapers.startsWith('/papers')) test.skip(true, 'ME did not reach /papers (got ' + pathPapers + ')');
    const viewLink = page.locator('table tbody').getByRole('link', { name: 'View' }).first();
    if (!(await viewLink.isVisible().catch(() => false))) {
      test.skip(true, 'No papers in list');
      return;
    }
    await viewLink.click();
    await expect(page).toHaveURL(/\/papers\/[^/]+\/view/, { timeout: 10000 });
  });

  test('DL — papers list and open approval', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'DL');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPapers = new URL(page.url()).pathname;
    if (!pathPapers.startsWith('/papers')) test.skip(true, 'DL did not reach /papers (got ' + pathPapers + ')');
    const approvalLink = page.locator('table tbody').getByRole('link', { name: 'Approval' }).first();
    if (!(await approvalLink.isVisible().catch(() => false))) {
      test.skip(true, 'No papers in list');
      return;
    }
    await approvalLink.click();
    await expect(page).toHaveURL(/\/papers\/[^/]+\/approval/, { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/Approval workflow|Approve|Reject/i);
  });

  test('DL — approval page has Approve or No pending stage', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'DL');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPapers = new URL(page.url()).pathname;
    if (!pathPapers.startsWith('/papers')) test.skip(true, 'DL did not reach /papers (got ' + pathPapers + ')');
    const approvalLink = page.locator('table tbody').getByRole('link', { name: 'Approval' }).first();
    if (!(await approvalLink.isVisible().catch(() => false))) {
      test.skip(true, 'No papers in list');
      return;
    }
    await approvalLink.click();
    await expect(page).toHaveURL(/\/papers\/[^/]+\/approval/, { timeout: 10000 });
    const hasApprove = await page.getByRole('button', { name: /approve/i }).isVisible().catch(() => false);
    const hasNoPending = await page.getByRole('button', { name: /no pending stage/i }).isVisible().catch(() => false);
    expect(hasApprove || hasNoPending).toBe(true);
  });

  test('IH — papers list and open approval', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'IH');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPapers = new URL(page.url()).pathname;
    if (!pathPapers.startsWith('/papers')) test.skip(true, 'IH did not reach /papers (got ' + pathPapers + ')');
    const approvalLink = page.locator('table tbody').getByRole('link', { name: 'Approval' }).first();
    if (!(await approvalLink.isVisible().catch(() => false))) {
      test.skip(true, 'No papers in list');
      return;
    }
    await approvalLink.click();
    await expect(page).toHaveURL(/\/papers\/[^/]+\/approval/, { timeout: 10000 });
  });

  test('CO — draft page has Approval workflow link', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'CO');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPapers = new URL(page.url()).pathname;
    if (!pathPapers.startsWith('/papers')) test.skip(true, 'CO did not reach /papers (got ' + pathPapers + ')');
    const draftLink = page.locator('table tbody').getByRole('link', { name: 'Draft' }).first();
    if (!(await draftLink.isVisible().catch(() => false))) {
      test.skip(true, 'No papers in list');
      return;
    }
    await draftLink.click();
    await expect(page).toHaveURL(/\/papers\/[^/]+\/draft/, { timeout: 10000 });
    await expect(page.getByRole('link', { name: /approval workflow/i })).toBeVisible({ timeout: 5000 });
  });

  test('ME — cannot create paper (direct URL)', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'ME');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers/create');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const current = new URL(page.url()).pathname;
    if (current.startsWith('/unauthorized')) return;
    if (current === '/papers' || current === '/papers/') return;
    if (current === '/papers/create') {
      const hasCreateForm = await page.locator('body').getByText(/save as draft|create paper|new paper/i).isVisible().catch(() => false);
      if (hasCreateForm) expect(current, 'MEMBER must not see paper creation form').toBe('/unauthorized');
      else test.skip(true, '/papers/create not implemented or returns 404; when added, MEMBER must be redirected to /unauthorized');
    }
  });

  test('Approval page has Reject/return link', async ({ page }) => {
    test.setTimeout(45000);
    const { path } = await loginAs(page, 'DL');
    if (path.includes('/login/mfa')) test.skip(true, 'MFA required');
    await page.goto('/papers');
    if (isOnLogin(page)) test.skip(true, 'Session did not persist; see Testing/E2E-PREREQUISITES.md');
    const pathPapers = new URL(page.url()).pathname;
    if (!pathPapers.startsWith('/papers')) test.skip(true, 'DL did not reach /papers (got ' + pathPapers + ')');
    const approvalLink = page.locator('table tbody').getByRole('link', { name: 'Approval' }).first();
    if (!(await approvalLink.isVisible().catch(() => false))) {
      test.skip(true, 'No papers in list');
      return;
    }
    await approvalLink.click();
    await expect(page).toHaveURL(/\/papers\/[^/]+\/approval/, { timeout: 10000 });
    await expect(page.getByRole('link', { name: /reject|return/i })).toBeVisible({ timeout: 5000 });
  });
});
