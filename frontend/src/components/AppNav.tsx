'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '@/lib/api';

function NotificationBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    if (!accessToken) return;
    getUnreadNotificationCount(accessToken).then(setUnreadCount).catch(() => {});
  }, [accessToken]);

  return (
    <Link
      href="/notifications"
      className="relative rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
  );
}

function NavDropdown({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative ${className}`}>
      <button
        type="button"
        className="flex items-center rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        aria-expanded="false"
        aria-haspopup="true"
      >
        {label}
        <svg className="ml-1 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* pt-1 bridges the gap so hover isn't lost when moving from button to menu */}
      <div className="invisible absolute left-0 top-full z-50 min-w-[180px] rounded-md border border-gray-200 bg-white py-1 pt-2 shadow-lg group-hover:visible">
        {children}
      </div>
    </div>
  );
}

function DropdownLink({
  href,
  children,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </Link>
  );
}

export function AppNav() {
  const { data: session, status } = useSession();
  const roles = (session?.user && (session as { roles?: string[] }).roles) ?? [];
  const showAdmin = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
  const canCreateMeeting = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR') || (roles.length === 0 && process.env.NODE_ENV === 'development');
  const canAddBody = roles.includes('SYSTEM_ADMIN');

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
            <span>ISEP</span>
            <span className="hidden text-sm font-normal text-gray-500 sm:inline">DGS · MoPSW</span>
          </Link>
          {session?.user && (
            <NotificationBell />
          )}
        </div>

        {status === 'loading' ? (
          <nav className="flex gap-1 text-sm text-gray-500">Loading…</nav>
        ) : session?.user ? (
          <nav className="flex flex-wrap items-center gap-1 sm:gap-0">
            <Link
              href="/dashboard"
              className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Dashboard
            </Link>

            <NavDropdown label="Bodies">
              <DropdownLink href="/bodies">Bodies list</DropdownLink>
              <DropdownLink href="/bodies/new" disabled={!canAddBody}>
                Add Body
              </DropdownLink>
            </NavDropdown>

            <NavDropdown label="Meetings">
              <DropdownLink href="/meetings">Meetings list</DropdownLink>
              <DropdownLink href="/meetings/create" disabled={!canCreateMeeting}>
                Create Meeting
              </DropdownLink>
            </NavDropdown>

            <NavDropdown label="Agenda">
              <DropdownLink href="/agenda">Agenda</DropdownLink>
            </NavDropdown>

            <NavDropdown label="Documents">
              <DropdownLink href="/documents">Document Library</DropdownLink>
            </NavDropdown>

            <NavDropdown label="Tasks">
              <DropdownLink href="/tasks">My Tasks</DropdownLink>
            </NavDropdown>

            <NavDropdown label="Reports">
              <DropdownLink href="/reports">Reports & Analytics</DropdownLink>
            </NavDropdown>

            <NavDropdown label="Calendar">
              <DropdownLink href="/calendar">Calendar</DropdownLink>
            </NavDropdown>

            {showAdmin && (
              <NavDropdown label="Admin">
                <DropdownLink href="/admin/users" disabled>User list (soon)</DropdownLink>
                <DropdownLink href="/admin/system" disabled>System health (soon)</DropdownLink>
              </NavDropdown>
            )}

            <span className="mx-1 hidden text-gray-300 sm:inline">|</span>
            <span className="hidden max-w-[120px] truncate px-2 text-xs text-gray-500 sm:inline" title={session.user.email ?? undefined}>
              {session.user.email ?? session.user.name ?? 'User'}
            </span>
            <button
              type="button"
              onClick={() => {
                const base = process.env.NEXT_PUBLIC_NEXTAUTH_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
                const keycloakLogout = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER
                  ? `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(base)}`
                  : null;
                void signOut({ callbackUrl: keycloakLogout ?? '/' });
              }}
              className="rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Sign out
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
