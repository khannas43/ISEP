'use client';

import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';
import { getAppBasePath } from '@/lib/appBasePath';

type Props = {
  defaultCallbackUrl?: string;
  initialError?: string | null;
  showBackToHome?: boolean;
};

export function LoginForm({ defaultCallbackUrl = '/dashboard', initialError, showBackToHome = true }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams?.get('callbackUrl') ?? defaultCallbackUrl);
  const errorFromUrl = searchParams?.get('error');
  const error = errorFromUrl ?? initialError ?? null;
  const { status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Redirect authenticated users in an effect. Use path without basePath so Next.js router does not double it (/isep/isep/...).
  const shouldRedirect = status === 'authenticated' && !error;
  useEffect(() => {
    if (!shouldRedirect) return;
    const query = new URLSearchParams({ callbackUrl }).toString();
    router.replace(`/login/complete?${query}`);
  }, [shouldRedirect, callbackUrl, router]);

  if (shouldRedirect) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Signed in. Redirecting…</p>
        <div className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">ISEP</h1>
          <p className="mt-1 text-sm text-slate-600">IMO Strategic Engagement Platform</p>
          <p className="text-xs text-slate-500">DGS · MoPSW, Government of India</p>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Sign in</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void (async () => {
              setMessage(null);
              setLoading(true);
              if (typeof window !== 'undefined') console.log('[LoginForm] Submitting credentials, signIn() will POST to .../api/auth/callback/credentials');
              try {
                const signInPromise = signIn('credentials', {
                  username: username.trim(),
                  password,
                  callbackUrl,
                  redirect: false,
                });
                const result = await Promise.race([
                  signInPromise,
                  new Promise<null>((_, reject) =>
                    setTimeout(() => reject(new Error('Sign-in timed out. Check the browser Network tab for /api/auth requests.')), 15000)
                  ),
                ]);
                if (result?.error) {
                  const msg =
                    result.error === 'CredentialsSignin'
                      ? 'Invalid credentials or auth server error. Check frontend container logs for details.'
                      : result.error;
                  setMessage(msg);
                  if (typeof window !== 'undefined') window.alert(msg);
                  return;
                }
                if (result?.ok) {
                  const base = getAppBasePath();
                  const path = `${base}/login/complete?${new URLSearchParams({ callbackUrl }).toString()}`;
                  window.location.href = new URL(path, window.location.origin).href;
                  return;
                }
                // result exists but no error and not ok (e.g. ok: false from credentials failure)
                if (typeof window !== 'undefined') {
                  console.warn('[LoginForm] signIn result (fallback branch):', JSON.stringify(result));
                }
                const status = (result as { status?: number })?.status;
                const fallbackMsg =
                  status === 500
                    ? 'Server error during sign-in. Check frontend container logs for the error.'
                    : 'Sign-in failed. Check frontend container logs (e.g. docker compose logs frontend) or browser Console for details.';
                setMessage(fallbackMsg);
                if (typeof window !== 'undefined') window.alert(fallbackMsg);
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
                setMessage(msg);
                if (typeof window !== 'undefined') window.alert(msg);
              } finally {
                setLoading(false);
              }
            })();
            return false;
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-base w-full"
              placeholder="e.g. admin-sa"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-base w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-1.765 3.257m0 0A9.75 9.75 0 0118 12a9.75 9.75 0 01-3.657 7.657m0 0l-2.121 2.121" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5s8.577 3.007 9.963 7.178c.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5s-8.577-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {(message || error) && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {message || error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-3 text-center text-xs text-slate-400">
              No Keycloak? Use <strong>demo</strong> / <strong>demo</strong>
            </p>
          )}
        </form>
        {showBackToHome && (
          <p className="mt-6 text-center">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              ← Back to home
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
