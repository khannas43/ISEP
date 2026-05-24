'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiUrl, getUnreadNotificationCount, type TaskV1Response } from '@/lib/api';
import { getAppBasePath } from '@/lib/appBasePath';

type NavItemSimple = { href: string; label: string };
type NavItemExpandable = {
  label: string;
  items: Array<{ href: string; label: string; roles?: string[]; disabled?: boolean }>;
  roles?: string[];
};
const nav: (NavItemSimple | NavItemExpandable)[] = [
  { href: '/dashboard/', label: 'Dashboard' },
  {
    label: 'Bodies',
    items: [
      { href: '/bodies', label: 'Bodies list' },
      { href: '/bodies/new', label: 'Add Body', roles: ['SYSTEM_ADMIN'] },
    ],
  },
  {
    label: 'Meetings',
    items: [
      { href: '/meetings', label: 'Meetings list' },
      { href: '/meetings/create', label: 'Create Meeting', roles: ['SYSTEM_ADMIN', 'COORDINATOR'] },
    ],
  },
  { href: '/documents', label: 'Document library' },
  { href: '/papers', label: 'Papers' },
  {
    label: 'Tasks',
    items: [
      { href: '/tasks', label: 'Tasks by meeting' },
      { href: '/tasks/my', label: 'My tasks' },
      { href: '/tasks/team', label: 'Team dashboard' },
    ],
  },
  {
    label: 'Correspondence Groups',
    items: [
      { href: '/correspondence-groups', label: 'Correspondence Groups list' },
      { href: '/correspondence-groups/new', label: 'New correspondence group', roles: ['SYSTEM_ADMIN', 'COORDINATOR'] },
    ],
  },
  { href: '/reports', label: 'Reports' },
  { href: '/calendar', label: 'Calendar' },
  {
    label: 'Admin',
    roles: ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD'],
    items: [
      { href: '/admin/users', label: 'User list' },
      { href: '/admin/users/new', label: 'New user', roles: ['SYSTEM_ADMIN'] },
      { href: '/admin/users/bulk-import', label: 'Bulk import users', roles: ['SYSTEM_ADMIN'] },
      { href: '/admin/announcements/new', label: 'New announcement', roles: ['SYSTEM_ADMIN'] },
      { href: '/admin/system', label: 'System admin', roles: ['SYSTEM_ADMIN'] },
      { href: '/admin/system/health', label: 'System health', roles: ['SYSTEM_ADMIN'] },
      { href: '/admin/system/config', label: 'System config', roles: ['SYSTEM_ADMIN'] },
      { href: '/admin/system/workflows', label: 'Workflow config', roles: ['SYSTEM_ADMIN'] },
      { href: '/admin/system/backups', label: 'Backups', roles: ['SYSTEM_ADMIN'] },
      { href: '/admin/audit', label: 'Audit log' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/account/profile', label: 'My profile' },
      { href: '/account/change-password', label: 'Change password' },
      { href: '/account/notification-preferences', label: 'Notification preferences' },
      { href: '/notifications', label: 'Notification centre' },
    ],
  },
];

function NavLink({
  href,
  label,
  disabled,
  isActive,
  badge,
}: {
  href: string;
  label: string;
  disabled?: boolean;
  isActive: boolean;
  badge?: number;
}) {
  const base =
    'flex items-center gap-3 rounded-r-md py-2.5 pl-[13px] pr-3 text-base font-medium transition-all duration-150';
  const active =
    'border-l-[3px] border-[var(--gold-400)] bg-[var(--navy-700)] font-semibold text-white';
  const inactive =
    'border-l-[3px] border-transparent text-white/80 hover:bg-[var(--navy-800)] hover:text-white';
  const dis =
    'cursor-not-allowed border-l-[3px] border-transparent font-medium text-white/40';

  if (disabled) {
    return <span className={`${base} ${dis}`}>{label}</span>;
  }
  return (
    <Link
      href={href}
      className={`${base} ${isActive ? active : inactive}`}
    >
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="truncate">{label}</span>
        {badge != null && badge > 0 && (
          <span className="shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
    </Link>
  );
}

const SIDEBAR_COLLAPSED_KEY = 'isep-sidebar-collapsed';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const basePath = getAppBasePath();
  const roles = (session?.user && (session as { roles?: string[] }).roles) ?? [];

  const [collapsed, setCollapsed] = useState<boolean>(false);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Bodies: false,
    Meetings: false,
    Tasks: false,
    'Correspondence Groups': false,
    Admin: false,
    Account: false,
  });

  // Open the nav group that contains the current route (stable dep: pathname string only).
  useEffect(() => {
    setOpenSections((prev) => {
      let next = prev;
      let changed = false;
      for (const item of nav) {
        if (!('items' in item)) continue;
        const expandable = item as NavItemExpandable;
        const label = expandable.label;
        const hasMatch = expandable.items.some(
          (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
        );
        if (hasMatch && !prev[label]) {
          if (!changed) next = { ...prev };
          changed = true;
          next[label] = true;
        }
      }
      return changed ? next : prev;
    });
  }, [pathname]);

  // Only show role-restricted items when user has at least one of the required roles.
  // Do not show Admin / Add Body etc. when user has no app role (avoids "Access denied" on click).
  const canShow = (itemRoles?: readonly string[], disabled?: boolean) => {
    if (disabled) return false;
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.some((r) => roles.includes(r));
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const [taskOverdueBadge, setTaskOverdueBadge] = useState(0);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  /** Skip API calls for this bearer token until it changes (avoids 401 storms if session refetches). */
  const tasksUnauthorizedForToken = useRef<string | undefined>(undefined);
  const notificationsUnauthorizedForToken = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (tasksUnauthorizedForToken.current !== undefined && accessToken !== tasksUnauthorizedForToken.current) {
      tasksUnauthorizedForToken.current = undefined;
    }
    if (notificationsUnauthorizedForToken.current !== undefined && accessToken !== notificationsUnauthorizedForToken.current) {
      notificationsUnauthorizedForToken.current = undefined;
    }
  }, [accessToken]);
  const onNotificationsUnauthorized = useCallback(() => {
    if (accessToken) notificationsUnauthorizedForToken.current = accessToken;
  }, [accessToken]);
  useEffect(() => {
    if (!accessToken) return;
    if (notificationsUnauthorizedForToken.current === accessToken) return;
    getUnreadNotificationCount(accessToken, { onUnauthorized: onNotificationsUnauthorized })
      .then(setUnreadCount)
      .catch(() => {});
  }, [accessToken, onNotificationsUnauthorized]);
  useEffect(() => {
    if (!accessToken) return;
    if (tasksUnauthorizedForToken.current === accessToken) return;
    fetch(`${getApiUrl()}/api/v1/tasks/my`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          tasksUnauthorizedForToken.current = accessToken;
          return [] as TaskV1Response[];
        }
        if (!r.ok) return [] as TaskV1Response[];
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      })
      .then((list) => {
        setTaskOverdueBadge(list.filter((t) => t.isOverdue).length);
      })
      .catch(() => setTaskOverdueBadge(0));
  }, [accessToken]);

  const roleBadge =
    roles.length > 0 ? roles.map((r) => r.replace(/_/g, ' ')).slice(0, 2).join(' · ') : 'User';

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-white/[0.08] bg-[var(--navy-900)] transition-[width] duration-200 ease-in-out ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      <div className="flex min-h-16 shrink-0 items-center border-b border-white/[0.08]">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex min-h-16 w-14 shrink-0 items-center justify-center text-white/50 transition-colors hover:bg-[var(--navy-800)] hover:text-white"
          aria-label={collapsed ? 'Show navigation' : 'Hide navigation'}
          title={collapsed ? 'Show navigation' : 'Hide navigation'}
        >
          {collapsed ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
        {!collapsed && (
          <>
            <Link href="/dashboard/" className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1">
              <Image
                src={`${basePath}/dgs-logo-light.jpeg`}
                alt="DGS"
                width={52}
                height={52}
                className="shrink-0 rounded-full border-2 border-[rgba(212,160,23,0.5)] object-cover"
                unoptimized
              />
              <div className="min-w-0 text-left">
                <div
                  className="truncate text-base font-bold leading-tight tracking-tight text-white"
                  style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                >
                  ISEP
                </div>
                <div className="truncate text-sm uppercase tracking-wide text-white/45">DGS · MoPSW</div>
              </div>
            </Link>
            {session?.user && (
              <Link
                href="/notifications"
                className="relative shrink-0 rounded p-1.5 text-white/50 hover:bg-[var(--navy-800)] hover:text-white"
                aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </>
        )}
      </div>

      {!collapsed && (
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {nav.map((item) => {
          if ('href' in item && !('items' in item)) {
            const isActive = pathname === item.href;
            return (
              <NavLink key={item.href} href={item.href} label={item.label} isActive={isActive} />
            );
          }
          if ('items' in item) {
            const label = item.label;
            const expandable = item as NavItemExpandable;
            const showSection = expandable.roles ? canShow(expandable.roles) : true;
            if (!showSection) return null;
            const isOpen = openSections[label] ?? false;
            const hasActive = expandable.items.some((i) => pathname === i.href);

            return (
              <div key={label}>
                <button
                  type="button"
                  onClick={() => setOpenSections((s) => ({ ...s, [label]: !isOpen }))}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                    hasActive ? 'text-white' : 'text-white/80 hover:bg-[var(--navy-800)] hover:text-white'
                  }`}
                >
                  {label}
                  <svg
                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
                    {expandable.items.map((sub) => {
                      const show = sub.roles ? canShow(sub.roles) : true;
                      if (!show) return null;
                      const overdue =
                        sub.href === '/tasks/my' && taskOverdueBadge > 0 ? taskOverdueBadge : 0;
                      return (
                        <NavLink
                          key={sub.href}
                          href={sub.href}
                          label={sub.label}
                          badge={overdue}
                          disabled={sub.disabled}
                          isActive={pathname === sub.href}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </nav>
      )}

      {!collapsed && (
      <div className="shrink-0 border-t border-white/[0.08] px-4 py-3">
        <div className="px-0 py-1">
          <p className="truncate text-sm font-semibold text-white" title={session?.user?.email ?? undefined}>
            {session?.user?.name ?? session?.user?.email ?? 'User'}
          </p>
          <span
            className="mt-1 inline-block rounded px-2 py-0.5 text-sm font-medium uppercase tracking-wide text-white/80"
            style={{ background: 'var(--navy-500)' }}
            title={roles.length > 0 ? roles.join(', ') : undefined}
          >
            {roleBadge}
          </span>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-2 truncate text-[10px] text-white/40" title="App roles from token (dev only)">
              {roles.length > 0 ? roles.join(', ') : 'No app roles'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') sessionStorage.removeItem('isep_login_audit_sent');
            const base = process.env.NEXT_PUBLIC_NEXTAUTH_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
            const keycloakLogout = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER
              ? `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(base)}`
              : null;
            void signOut({ callbackUrl: keycloakLogout ?? '/' });
          }}
          className="mt-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-base font-medium text-white/50 transition-colors hover:bg-[var(--navy-800)] hover:text-white"
        >
          Sign out
        </button>
      </div>
      )}
    </aside>
  );
}
