'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';
import { getAppBasePath } from '@/lib/appBasePath';
import { isMfaEnforcedInThisEnvironment } from '@/lib/mfaPolicy';

type Props = { callbackUrl: string };

function Spinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <p className="text-slate-600">Completing sign-in...</p>
      <div className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
    </div>
  );
}

/**
 * Single place for post-login navigation: wait for client session, then redirect once (ref guard).
 * Avoids server redirect vs middleware/JWT timing loops and duplicate router.replace from LoginForm.
 * Uses same-origin relative paths only (no `new URL`) so malformed callback query cannot throw here.
 */
export function LoginCompleteClient({ callbackUrl }: Props) {
  const { data: session, status } = useSession();
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl);
  const didRedirectRef = useRef(false);
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSlowHint(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (didRedirectRef.current) return;
    if (status === 'loading') return;
    if (status === 'unauthenticated') return;
    if (!session?.user) return;

    const roles = (session as { roles?: string[] }).roles ?? [];
    const requiresMfa = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
    const mfaEnforced = isMfaEnforcedInThisEnvironment();

    didRedirectRef.current = true;
    const base = getAppBasePath();
    const target =
      requiresMfa && mfaEnforced
        ? `${base}/login/mfa?${new URLSearchParams({ callbackUrl: safeCallbackUrl }).toString()}`
        : `${base}${safeCallbackUrl}`;

    if (typeof window !== 'undefined') {
      window.location.assign(target);
    }
  }, [session, status, safeCallbackUrl]);

  if (status === 'loading') {
    return <Spinner />;
  }

  if (status === 'unauthenticated') {
    const signInHref = `/?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
        <div className="max-w-sm text-center">
          <p className="text-slate-800">We could not confirm your session.</p>
          <p className="mt-2 text-sm text-slate-600">Sign in again to continue.</p>
          <Link
            href={signInHref}
            className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-sm text-center">
        <p className="text-slate-600">Completing sign-in...</p>
        <div className="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        {showSlowHint && (
          <p className="mt-6 text-sm text-slate-500">
            If nothing happens,{' '}
            <Link href={safeCallbackUrl} className="font-medium text-blue-600 hover:underline">
              continue to your destination
            </Link>
            .
          </p>
        )}
      </div>
    </main>
  );
}
