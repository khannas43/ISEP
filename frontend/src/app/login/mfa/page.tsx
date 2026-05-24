'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';
import { getAppBasePath } from '@/lib/appBasePath';

const SESSION_SLOW_MS = 10_000;

/**
 * SCR-AUTH-02 — MFA Prompt (TOTP for SA, IH).
 * Displayed after successful password entry for roles requiring MFA.
 */
function MFAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams?.get('callbackUrl'));
  const { data: session, status } = useSession();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSlow, setSessionSlow] = useState(false);
  const didRedirectNonMfaRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setSessionSlow(true), SESSION_SLOW_MS);
    return () => clearTimeout(t);
  }, []);

  // Never call router.replace during render — it can loop or hang after hot reload / Strict Mode.
  useEffect(() => {
    if (status !== 'unauthenticated') return;
    router.replace(`/?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }, [status, callbackUrl, router]);

  useEffect(() => {
    if (status === 'loading' || !session?.user || didRedirectNonMfaRef.current) return;
    const roles = (session as { roles?: string[] }).roles ?? [];
    const needsMfa = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
    if (!needsMfa) {
      didRedirectNonMfaRef.current = true;
      router.replace(callbackUrl);
    }
  }, [session, status, callbackUrl, router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        {sessionSlow && (
          <p className="mt-6 max-w-sm text-center text-base text-slate-600">
            Session is slow to load.{' '}
            <Link href="/api/auth/signout?callbackUrl=/" className="font-medium text-blue-600 underline">
              Sign out
            </Link>{' '}
            and sign in again, or reload the page.
          </p>
        )}
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-base text-slate-600">Redirecting to sign in…</p>
      </div>
    );
  }

  const roles = (session as { roles?: string[] }).roles ?? [];
  const needsMfa = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
  if (!needsMfa) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-base text-slate-600">Redirecting…</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const appBase = getAppBasePath();
      const res = await fetch(`${appBase}/api/auth/mfa-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Verification failed');
        setLoading(false);
        return;
      }
      // Hard navigation so the browser applies `Set-Cookie` before the next request.
      const prefix = getAppBasePath().replace(/\/$/, '');
      let path = callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`;
      if (prefix && path.startsWith(`${prefix}/`)) path = path.slice(prefix.length) || '/';
      window.location.assign(`${window.location.origin}${prefix}${path}`);
    } catch (err) {
      setError(err instanceof Error && err.name === 'AbortError' ? 'Request timed out' : 'Verification failed');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Two-step verification</h1>
            <p className="mt-2 text-base text-slate-600">
              Enter the 6-digit code from your authenticator app.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-2 text-sm text-slate-500">Development: any 6-digit code is accepted.</p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="mfa-code" className="block text-base font-medium text-slate-700 mb-1">
                Verification code
              </label>
              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="input-base w-full text-center text-lg tracking-[0.5em]"
                placeholder="000000"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-base text-red-700">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full">
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Use backup code option if you don’t have your device (coming soon).
          </p>
          <p className="mt-4 text-center text-base text-slate-600">
            Not you?{' '}
            <Link href={`/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl || '/dashboard')}`} className="font-medium text-slate-900 underline hover:no-underline">
              Sign out and use a different account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function MFAPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </main>
      }
    >
      <MFAContent />
    </Suspense>
  );
}
