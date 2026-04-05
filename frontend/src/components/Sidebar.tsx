'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getApiUrl, getUnreadNotificationCount, type TaskV1Response } from '@/lib/api';

type NavItemSimple = { href: string; label: string };
type NavItemExpandable = {
  label: string;
  items: Array<{ href: string; label: string; roles?: string[]; disabled?: boolean }>;
  roles?: string[];
};
const nav: (NavItemSimple | NavItemExpandable)[] = [
  { href: '/dashboard/executive', label: 'Dashboard' },
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
  const base = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors';
  const active = 'bg-blue-600/90 text-white';
  const inactive = 'text-slate-300 hover:bg-slate-700/50 hover:text-white';
  const dis = 'cursor-not-allowed text-slate-500';

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
  useEffect(() => {
    if (!accessToken) return;
    getUnreadNotificationCount(accessToken).then(setUnreadCount).catch(() => {});
  }, [accessToken]);
  useEffect(() => {
    if (!accessToken) return;
    fetch(`${getApiUrl()}/api/v1/tasks/my`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: TaskV1Response[]) => {
        const list = Array.isArray(data) ? data : [];
        setTaskOverdueBadge(list.filter((t) => t.isOverdue).length);
      })
      .catch(() => setTaskOverdueBadge(0));
  }, [accessToken]);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-[width] duration-200 ease-in-out ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      <div className="flex h-14 shrink-0 items-center border-b border-slate-800">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex h-14 w-14 shrink-0 items-center justify-center text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
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
            <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 px-2">
              <span className="text-lg font-bold tracking-tight text-white">ISEP</span>
              <span className="hidden truncate text-xs font-normal text-slate-400 sm:inline">DGS · MoPSW</span>
            </Link>
            {session?.user && (
              <Link
                href="/notifications"
                className="relative shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-700/50 hover:text-white"
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
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
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
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    hasActive ? 'text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
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
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-700 pl-2">
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
      <div className="shrink-0 border-t border-slate-800 px-3 py-4">
        <div className="rounded-lg bg-slate-800/50 px-3 py-2">
          <p className="truncate text-xs font-medium text-slate-200" title={session?.user?.email ?? undefined}>
            {session?.user?.name ?? session?.user?.email ?? 'User'}
          </p>
          <p className="truncate text-xs text-slate-400" title={session?.user?.email ?? undefined}>
            {session?.user?.email ?? ''}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-1 text-[10px] text-slate-500" title="App role from token (dev only)">
              App role: {roles.length > 0 ? roles.join(', ') : 'None'}
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
          className="mt-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          Sign out
        </button>
      </div>
      )}
    </aside>
  );
}
