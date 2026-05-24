/**
 * ISEP Next.js Middleware — Auth & RBAC
 * Runs on every request matching config.matcher. Ensures: (1) Public paths need no auth.
 * (2) Protected paths require JWT else redirect to login or /session-expired.
 * (3) Forced password change redirects to /account/change-password.
 * (4) SA and IH must complete MFA before protected routes.
 * (5) canAccessRoute(pathname, roles) else /unauthorized. (6) Refreshes isep_session_active cookie.
 * With basePath (/isep), all redirect URLs must include basePath so we don't send users to the wrong app.
 */
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAppBasePath, getLogicalPathname } from '@/lib/appBasePath';
import { isMfaEnforcedInThisEnvironment } from '@/lib/mfaPolicy';
import { isPublicPath, canAccessRoute } from '@/lib/routePermissions';

/** Base path when app is served under a subpath (e.g. /isep). Same as `next.config.js` / `getAppBasePath()`. */
function getBasePath(): string {
  return getAppBasePath();
}

/** URL prefixes that require authentication. */
const protectedPrefixes = ['/dashboard', '/meetings', '/admin', '/bodies', '/agenda', '/documents', '/tasks', '/reports', '/calendar', '/account', '/correspondence-groups', '/papers', '/notifications'];

function isProtectedPath(pathname: string): boolean {
  if (isPublicPath(pathname)) return false;
  return protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function handlePublicPath(pathname: string, request: NextRequest): NextResponse {
  if (pathname === '/') {
    const res = NextResponse.next();
    res.cookies.set('isep_session_active', '', { path: '/', maxAge: 0 });
    return res;
  }
  return NextResponse.next();
}

function handleUnauthenticated(pathname: string, request: NextRequest, hadSessionCookie: boolean): NextResponse {
  const base = getBasePath();
  const prefix = base ? base + '/' : '';
  if (hadSessionCookie) {
    const sessionExpiredUrl = new URL(prefix + 'session-expired', request.url);
    sessionExpiredUrl.searchParams.set('callbackUrl', pathname);
    const res = NextResponse.redirect(sessionExpiredUrl);
    res.cookies.set('isep_session_active', '', { path: '/', maxAge: 0 });
    return res;
  }
  const signInUrl = new URL(prefix + 'login', request.url);
  signInUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(signInUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const logicalPath = getLogicalPathname(pathname);

  // Never touch Next.js internals (chunks, HMR, devtools). With basePath, assets live at /isep/_next/…
  // so pathname.startsWith('/_next/') is not enough — use logical path after stripping basePath.
  if (logicalPath.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // API routes are under basePath too (e.g. /isep/api/auth/…).
  if (logicalPath.startsWith('/api/')) {
    // Avoid 308 from Next.js trailingSlash: true — rewrite so backend sees trailing slash (POST body would be lost)
    if (request.method === 'POST' && logicalPath === '/api/auth/callback/credentials') {
      const url = request.nextUrl.clone();
      if (!url.pathname.endsWith('/')) {
        url.pathname += '/';
        return NextResponse.rewrite(url);
      }
    }
    return NextResponse.next();
  }
  if (isPublicPath(logicalPath)) return handlePublicPath(logicalPath, request);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const hadSessionCookie = request.cookies.get('isep_session_active')?.value === '1';

  if (isProtectedPath(logicalPath) && !token) {
    return handleUnauthenticated(logicalPath, request, hadSessionCookie);
  }

  const base = getBasePath();
  const prefix = base ? base + '/' : '';

  // SCR-AUTH-03: Force password change when Keycloak required_actions includes UPDATE_PASSWORD
  if (token && logicalPath !== '/account/change-password') {
    const requiredActions = (token as { requiredActions?: string[] }).requiredActions ?? [];
    if (requiredActions.includes('UPDATE_PASSWORD')) {
      const changePwUrl = new URL(prefix + 'account/change-password', request.url);
      return NextResponse.redirect(changePwUrl);
    }
  }

  // SCR-AUTH-02: SA and IH must complete MFA before accessing protected routes (see mfaPolicy.ts for dev exception).
  if (isProtectedPath(logicalPath) && token) {
    const roles = (token as { roles?: string[] }).roles ?? [];
    const requiresMfa = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
    const mfaVerified = request.cookies.get('isep_mfa_verified')?.value;
    if (requiresMfa && !mfaVerified && isMfaEnforcedInThisEnvironment()) {
      const mfaUrl = new URL(prefix + 'login/mfa', request.url);
      mfaUrl.searchParams.set('callbackUrl', logicalPath);
      return NextResponse.redirect(mfaUrl);
    }
  }

  if (isProtectedPath(logicalPath) && token) {
    const userRoles = (token as { roles?: string[] }).roles ?? [];
    const devNoRoles = process.env.NODE_ENV === 'development' && userRoles.length === 0;
    if (!canAccessRoute(logicalPath, userRoles, devNoRoles)) {
      const unauthorizedUrl = new URL(prefix + 'unauthorized', request.url);
      unauthorizedUrl.searchParams.set('from', logicalPath);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // SCR-AUTH-04: refresh “had session” cookie so we can show session-expired on next visit after timeout
  const res = NextResponse.next();
  if (token) {
    res.cookies.set('isep_session_active', '1', {
      path: '/',
      maxAge: 30 * 60, // 30 min, align with session maxAge
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return res;
}

/**
 * Run on all paths except Next internals and favicon.
 * (Previously a narrow list omitted /login/complete and other routes; a catch‑all is safer.)
 * See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: ['/((?!_next/|favicon.ico).*)'],
};
