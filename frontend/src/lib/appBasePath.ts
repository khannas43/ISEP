/**
 * URL path prefix for the app when deployed under a subpath (e.g. /isep).
 * Must stay in sync with `basePath` in `next.config.js`.
 *
 * Local dev: set NEXTAUTH_URL / NEXT_PUBLIC_NEXTAUTH_URL to http://localhost:3000 (no path) → "".
 * Production: use http(s)://host/isep so pathname is /isep.
 * Optional override: NEXT_PUBLIC_BASE_PATH=/isep
 */
export function getAppBasePath(): string {
  const explicit = process.env.NEXT_PUBLIC_BASE_PATH;
  if (explicit !== undefined && String(explicit).trim() !== '') {
    const p = String(explicit).replace(/\/$/, '');
    return p === '/' ? '' : p;
  }
  const u =
    process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
    (typeof process.env.NEXTAUTH_URL !== 'undefined' ? process.env.NEXTAUTH_URL : '') ||
    '';
  if (!u) return '';
  try {
    const p = new URL(u).pathname.replace(/\/$/, '');
    return p && p !== '/' ? p : '';
  } catch {
    return '';
  }
}

/**
 * `request.nextUrl.pathname` in middleware includes `basePath` (e.g. `/isep/documents/...`).
 * Public/protected checks and `canAccessRoute` use paths without the prefix (e.g. `/documents/...`).
 */
export function getLogicalPathname(pathname: string): string {
  const base = getAppBasePath().replace(/\/$/, '');
  if (!base) return pathname;
  if (pathname === base || pathname === `${base}/`) return '/';
  if (pathname.startsWith(`${base}/`)) {
    const rest = pathname.slice(base.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return pathname;
}
