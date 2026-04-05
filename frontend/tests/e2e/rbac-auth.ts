import { Page } from '@playwright/test';

/**
 * Test users for ACT-080 RBAC E2E (ISEP-RBAC-Integration-Testing-Plan.md).
 * Keycloak isep-realm must be running with these users.
 */
export const RBAC_USERS = {
  SA: { username: 'admin-sa', password: 'Admin@12345!' },
  IH: { username: 'ih-user', password: 'Ih@12345!' },
  DL: { username: 'dl-user', password: 'Dl@12345!' },
  CO: { username: 'co-user', password: 'Co@12345!' },
  ME: { username: 'me-user', password: 'Me@12345!' },
  VW: { username: 'vw-user', password: 'Vw@12345!' },
} as const;

/**
 * Log in via the app login form. Waits for redirect to /dashboard or /login/mfa.
 * Returns the path we landed on. Caller can skip or fail if path is /login/mfa (MFA required).
 */
const LOGIN_FORM_TIMEOUT = 15_000;

export async function loginAs(
  page: Page,
  role: keyof typeof RBAC_USERS
): Promise<{ path: string }> {
  const { username, password } = RBAC_USERS[role];
  await page.goto('/');
  const body = page.locator('body');
  if (await body.getByText('This page could not be found.', { exact: false }).isVisible().catch(() => false)) {
    throw new Error('App returned 404 at /. Start the app with: cd frontend && npm run dev. See Testing/E2E-PREREQUISITES.md');
  }
  const usernameField = page.getByLabel(/username/i);
  await usernameField.waitFor({ state: 'visible', timeout: LOGIN_FORM_TIMEOUT }).catch(() => {
    throw new Error('Login form not found at /. Is the app running at http://localhost:3000? Start: cd frontend && npm run dev. See Testing/E2E-PREREQUISITES.md');
  });
  await usernameField.fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(dashboard|login\/complete|login\/mfa)(\?|$)/, { timeout: 20000 });
  const url = page.url();
  if (url.includes('/login/complete')) {
    await page.waitForURL(/\/(dashboard|login\/mfa)(\?|$)/, { timeout: 10000 });
  }
  const path = new URL(page.url()).pathname;
  // Ensure session is committed: wait for dashboard shell (Sign out) so cookies are stable before next navigation
  if (path.includes('/dashboard')) {
    await page.getByRole('link', { name: /sign out/i }).waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
  }
  return { path };
}

/** True if the current page is login (/) or a login subpath. Call after page.goto(protectedUrl); then in test: if (isOnLogin(page)) test.skip(true, '...'). */
export function isOnLogin(page: Page): boolean {
  const path = new URL(page.url()).pathname;
  return path === '/' || path.startsWith('/login');
}
