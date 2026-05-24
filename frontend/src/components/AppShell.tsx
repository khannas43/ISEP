'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { postAuditLog } from '@/lib/api';
import { Sidebar } from './Sidebar';

const LOGIN_AUDIT_SENT_KEY = 'isep_login_audit_sent';

const STANDALONE_PATHS = ['/login', '/unauthorized'];
// Show page content immediately; don’t block on session so login page is never stuck on spinner
const NO_BLOCK_PATHS = ['/', '/login', '/login/mfa', '/login/complete', '/unauthorized', '/session-expired', '/account/change-password'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  // Record LOGIN in audit log once per sign-in (cleared on sign out). Must run unconditionally so hook order is stable.
  useEffect(() => {
    if (!accessToken || typeof window === 'undefined') return;
    if (sessionStorage.getItem(LOGIN_AUDIT_SENT_KEY)) return;
    postAuditLog(accessToken, {
      actionType: 'LOGIN',
      entityType: 'USER',
      description: 'User logged in',
    })
      .then((ok) => {
        if (ok) sessionStorage.setItem(LOGIN_AUDIT_SENT_KEY, '1');
      })
      .catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[Audit] LOGIN audit request failed (network). Ensure backend is running and NEXT_PUBLIC_API_URL is correct.',
            err
          );
        }
      });
  }, [accessToken]);

  const isStandalone = STANDALONE_PATHS.some((p) => pathname?.startsWith(p));
  // When pathname is undefined (initial hydration), show children so server and client HTML match (avoids hydration error)
  const dontBlockOnSession =
    pathname == null ||
    pathname === '' ||
    NO_BLOCK_PATHS.some((p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/')));

  if (status === 'loading' && !dontBlockOnSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (isStandalone || !session?.user) {
    return <>{children}</>;
  }

  const isExecutiveDashboard = pathname === '/dashboard/executive';
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-h-screen min-w-0 w-full flex-1 overflow-auto pl-0 pr-0">
        {isExecutiveDashboard ? (
          <div className="m-0 min-h-screen w-full max-w-none p-0">{children}</div>
        ) : (
          <div className="page-container">{children}</div>
        )}
      </main>
    </div>
  );
}
