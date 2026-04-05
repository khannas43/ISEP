/**
 * ACT-079: RBAC matrix for all 70 screens.
 * Maps path patterns to allowed Keycloak roles (any one grants access).
 * Source: ISEP-Screens-RBAC.md §16 Complete RBAC Summary Matrix; Part E URL reference.
 * Role codes: SYSTEM_ADMIN | IC_DIVISION_HEAD | DELEGATION_LEADER | COORDINATOR | MEMBER | VIEWER
 */

export const ROLES = [
  'SYSTEM_ADMIN',
  'IC_DIVISION_HEAD',
  'DELEGATION_LEADER',
  'COORDINATOR',
  'MEMBER',
  'VIEWER',
] as const;

export type Role = (typeof ROLES)[number];

/** Rules in order: first matching pattern wins. More specific paths must come first. */
export interface RouteRule {
  /** Path pattern: string prefix (e.g. /admin/system/health) or RegExp */
  pattern: RegExp | string;
  /** Allowed roles; empty = any authenticated; null = public (no role check) */
  roles: Role[] | null;
}

function pathMatches(pathname: string, pattern: RegExp | string): boolean {
  if (typeof pattern === 'string') {
    return pathname === pattern || pathname.startsWith(pattern + '/');
  }
  return pattern.test(pathname);
}

/**
 * Returns allowed roles for pathname. null = public (no check), [] = any authenticated.
 * First matching rule wins.
 */
export function getAllowedRoles(pathname: string): Role[] | null {
  for (const rule of ROUTE_PERMISSIONS) {
    if (pathMatches(pathname, rule.pattern)) return rule.roles;
  }
  return null;
}

/**
 * Returns true if the user (with given roles) may access the path.
 * - If allowed is null (public) → true only when path is in public list (caller handles).
 * - If allowed is [] → any authenticated user.
 * - Otherwise user must have at least one of allowed roles.
 * In dev with no roles we allow access when NODE_ENV=development.
 */
export function canAccessRoute(pathname: string, userRoles: string[], devNoRolesAllow = false): boolean {
  const allowed = getAllowedRoles(pathname);
  if (allowed === null) return true; // public
  if (allowed.length === 0) return true; // any authenticated
  if (devNoRolesAllow && userRoles.length === 0 && process.env.NODE_ENV === 'development') return true;
  return allowed.some((r) => userRoles.includes(r));
}

/** Paths that require no authentication (no token). */
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/login/complete',
  '/login/mfa',
  '/session-expired',
  '/unauthorized',
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

const ROUTE_PERMISSIONS: RouteRule[] = [
  // —— Public (no role check; middleware skips these)
  { pattern: /^\/(login|session-expired|unauthorized)(\/|$)/, roles: null },
  { pattern: '/', roles: null },

  // —— Admin: most specific first
  { pattern: '/admin/system/health', roles: ['SYSTEM_ADMIN'] },
  { pattern: '/admin/system/config', roles: ['SYSTEM_ADMIN'] },
  { pattern: '/admin/system/workflows', roles: ['SYSTEM_ADMIN'] },
  { pattern: '/admin/system/backups', roles: ['SYSTEM_ADMIN'] },
  { pattern: '/admin/audit', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD'] },
  { pattern: '/admin/users/new', roles: ['SYSTEM_ADMIN'] },
  { pattern: '/admin/users/bulk-import', roles: ['SYSTEM_ADMIN'] },
  { pattern: '/admin/announcements/new', roles: ['SYSTEM_ADMIN'] },
  { pattern: /^\/admin\/users\/[^/]+\/assignments/, roles: ['SYSTEM_ADMIN', 'COORDINATOR', 'IC_DIVISION_HEAD'] },
  { pattern: '/admin/users', roles: ['SYSTEM_ADMIN'] },
  { pattern: '/admin/system', roles: ['SYSTEM_ADMIN'] },
  { pattern: '/admin', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD'] },

  // —— Bodies
  { pattern: '/bodies/new', roles: ['SYSTEM_ADMIN'] },
  { pattern: /^\/bodies\/[^/]+\/edit/, roles: ['SYSTEM_ADMIN'] },
  { pattern: '/bodies', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER', 'VIEWER'] },

  // —— Meetings
  { pattern: '/meetings/create', roles: ['SYSTEM_ADMIN', 'COORDINATOR'] },
  { pattern: /^\/meetings\/[^/]+\/edit/, roles: ['SYSTEM_ADMIN', 'COORDINATOR'] },
  { pattern: /^\/meetings\/[^/]+\/participants/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },
  { pattern: /^\/meetings\/[^/]+\/agenda\/[^/]+\/feedback\/submit/, roles: ['MEMBER'] },
  { pattern: /^\/meetings\/[^/]+\/agenda\/[^/]+\/feedback\/consolidate/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR'] },
  { pattern: /^\/meetings\/[^/]+\/agenda\/[^/]+\/deliberations/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },
  { pattern: /^\/meetings\/[^/]+\/agenda\/new/, roles: ['SYSTEM_ADMIN', 'COORDINATOR'] },
  { pattern: /^\/meetings\/[^/]+\/agenda\/[^/]+\/edit/, roles: ['SYSTEM_ADMIN', 'COORDINATOR'] },
  { pattern: /^\/meetings\/[^/]+\/live\/interventions\/new/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR'] },
  { pattern: /^\/meetings\/[^/]+\/outcomes/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'VIEWER'] },
  { pattern: /^\/meetings\/[^/]+\/live/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER', 'VIEWER'] },
  { pattern: '/meetings', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER', 'VIEWER'] },

  // —— Documents
  { pattern: '/documents/upload', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'COORDINATOR', 'DELEGATION_LEADER', 'MEMBER'] },
  { pattern: /^\/documents\/[^/]+\/new-version/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'COORDINATOR', 'DELEGATION_LEADER', 'MEMBER'] },
  { pattern: /^\/documents\/[^/]+\/compare/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },
  { pattern: '/documents', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER', 'VIEWER'] },

  // —— Tasks
  { pattern: '/tasks/team', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR'] },
  { pattern: '/tasks/new', roles: ['SYSTEM_ADMIN', 'COORDINATOR', 'DELEGATION_LEADER'] },
  { pattern: /^\/tasks\/[^/]+\/edit/, roles: ['SYSTEM_ADMIN', 'COORDINATOR', 'DELEGATION_LEADER'] },
  { pattern: '/tasks/my', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },
  { pattern: /^\/tasks\/[^/]+$/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },
  { pattern: '/tasks', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },

  // —— Papers
  { pattern: /^\/papers\/[^/]+\/reject/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER'] },
  { pattern: /^\/papers\/[^/]+\/(draft|approval|view)/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },
  { pattern: '/papers', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },

  // —— Correspondence groups
  { pattern: '/correspondence-groups/new', roles: ['SYSTEM_ADMIN', 'COORDINATOR'] },
  { pattern: /^\/correspondence-groups\/[^/]+\/edit/, roles: ['SYSTEM_ADMIN', 'COORDINATOR'] },
  { pattern: /^\/correspondence-groups\/[^/]+\/members/, roles: ['SYSTEM_ADMIN', 'COORDINATOR'] },
  { pattern: /^\/correspondence-groups\/[^/]+\/submissions/, roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },
  { pattern: '/correspondence-groups', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER', 'VIEWER'] },

  // —— Reports
  { pattern: '/reports/audit', roles: ['SYSTEM_ADMIN'] },
  { pattern: '/reports/custom', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'COORDINATOR'] },
  { pattern: '/reports/meeting-summary', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR'] },
  { pattern: '/reports/analytics', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR'] },
  { pattern: '/reports/approval-pipeline', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR'] },
  { pattern: '/reports', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER'] },

  // —— Calendar & notifications (all roles)
  { pattern: '/calendar', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER', 'VIEWER'] },
  { pattern: '/notifications', roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER', 'VIEWER'] },
  { pattern: '/account', roles: [] }, // any authenticated
  // Catch-all for remaining protected paths (e.g. /dashboard, /agenda): any authenticated
  { pattern: /^\/.*/, roles: [] },
];
