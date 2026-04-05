'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';

type Props = { callbackUrl: string };

/**
 * Client-side redirect after login (SA/IH only: server already redirects others).
 * useSession() may be slow; after 2s we show manual links (never auto-redirect to callback — that breaks MFA).
 */
export function LoginCompleteRedirect({ callbackUrl }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl);
  const [showFallbackLink, setShowFallbackLink] = useState(false);
  /** Avoid re-running router.replace when session object identity changes (causes flicker + refetch storms). */
  const didNavigateRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setShowFallbackLink(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status === 'loading' || didNavigateRef.current) return;
    if (!session?.user) {
      const t = setTimeout(() => {
        if (didNavigateRef.current) return;
        didNavigateRef.current = true;
        router.replace(`/?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`);
      }, 1500);
      return () => clearTimeout(t);
    }
    const roles = (session as { roles?: string[] }).roles ?? [];
    const requiresMfa = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
    didNavigateRef.current = true;
    if (requiresMfa) {
      router.replace(`/login/mfa?${new URLSearchParams({ callbackUrl: safeCallbackUrl }).toString()}`);
    } else {
      router.replace(safeCallbackUrl);
    }
  }, [session, status, safeCallbackUrl, router]);

  // This page is only rendered for SA/IH who still need MFA. Do not force-redirect to callbackUrl
  // after a timeout — that races with /login/mfa and causes middleware ↔ MFA redirect loops.

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="text-center max-w-sm">
        <p className="text-slate-600">Completing sign-in…</p>
        <div className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mx-auto" />
        {showFallbackLink && (
          <p className="mt-6 text-sm text-slate-500">
            If nothing happens,{' '}
            <Link href={safeCallbackUrl} className="font-medium text-blue-600 hover:underline">
              continue
            </Link>
            {' '}or go to{' '}
            <Link href={`/login/mfa?${new URLSearchParams({ callbackUrl: safeCallbackUrl }).toString()}`} className="font-medium text-blue-600 hover:underline">
              two-step verification
            </Link>
            .
          </p>
        )}
      </div>
    </main>
  );
}
