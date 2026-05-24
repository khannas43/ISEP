'use client';

import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';
import { getAppBasePath } from '@/lib/appBasePath';

type Props = {
  defaultCallbackUrl?: string;
  initialError?: string | null;
  showBackToHome?: boolean;
  /** `split` = full-screen navy identity + form (Batch 12). `card` = compact card on neutral background. */
  layout?: 'card' | 'split';
};

export function LoginForm({
  defaultCallbackUrl = '/dashboard',
  initialError,
  showBackToHome = true,
  layout = 'card',
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = getAppBasePath();
  const callbackUrl = sanitizeCallbackUrl(searchParams?.get('callbackUrl') ?? defaultCallbackUrl);
  const errorFromUrl = searchParams?.get('error');
  const error = errorFromUrl ?? initialError ?? null;
  const { status } = useSession();
  const postAuthRedirectStarted = useRef(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const shouldRedirect = status === 'authenticated' && !error;

  // Only clear the guard when the user is actually signed out. Resetting on `loading` would
  // re-fire redirect to /login/complete after session refetch and cause redirect / RSC loops.
  useEffect(() => {
    if (status === 'unauthenticated') {
      postAuthRedirectStarted.current = false;
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated' || error) return;
    if (postAuthRedirectStarted.current) return;
    postAuthRedirectStarted.current = true;
    const query = new URLSearchParams({ callbackUrl }).toString();
    router.replace(`/login/complete?${query}`);
  }, [status, error, callbackUrl, router]);

  const runSignIn = () => {
    setMessage(null);
    setLoading(true);
    void (async () => {
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
            setTimeout(
              () => reject(new Error('Sign-in timed out. Check the browser Network tab for /api/auth requests.')),
              15000
            )
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
          // Same-origin relative path — avoids new URL() throwing on rare malformed env/base combinations
          window.location.href = path;
          return;
        }
        const httpStatus = (result as { status?: number })?.status;
        const fallbackMsg =
          httpStatus === 500
            ? 'Server error during sign-in. Check frontend container logs for the error.'
            : 'Sign-in failed. Check frontend container logs or browser Console for details.';
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
  };

  if (shouldRedirect) {
    if (layout === 'split') {
      return (
        <div className="flex min-h-[100dvh] min-h-screen w-full max-w-none flex-col lg:flex-row">
          <div
            className="min-h-[40vh] flex-[1_1_58%] lg:min-h-screen"
            style={{
              background: 'linear-gradient(160deg, var(--navy-900) 0%, var(--navy-700) 60%, var(--navy-600) 100%)',
            }}
          />
          <div className="flex min-h-[60vh] flex-[1_1_42%] flex-col bg-white pt-4 pl-4 lg:min-h-screen lg:pl-8 lg:pr-8">
            <p className="text-slate-600">Signed in. Redirecting…</p>
            <div className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--navy-600)]" />
          </div>
        </div>
      );
    }
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">Signed in. Redirecting…</p>
        <div className="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--navy-600)]" />
      </div>
    );
  }

  const splitForm = layout === 'split';
  const labelClass = splitForm
    ? 'mb-1 block text-[1rem] font-semibold text-[var(--slate-700)]'
    : 'mb-1 block text-base font-medium text-[var(--slate-700)]';
  const inputClass = splitForm ? 'input-base w-full text-[1rem]' : 'input-base w-full';
  const inputPasswordClass = splitForm ? 'input-base w-full pr-10 text-[1rem]' : 'input-base w-full pr-10';
  const submitClass = splitForm
    ? 'w-full rounded-lg px-4 py-3 text-[1rem] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-[var(--slate-300)]'
    : 'w-full rounded-lg px-4 py-3 text-base font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-[var(--slate-300)]';

  const formBlock = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        runSignIn();
        return false;
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="username" className={labelClass}>
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
          className={inputClass}
          placeholder="Enter your username"
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
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
            className={inputPasswordClass}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--slate-500)] hover:bg-slate-100 hover:text-[var(--slate-700)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-400)]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-1.765 3.257m0 0A9.75 9.75 0 0118 12a9.75 9.75 0 01-3.657 7.657m0 0l-2.121 2.121" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5s8.577 3.007 9.963 7.178c.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5s-8.577-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {(message || error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-700">
          {message || error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={submitClass}
        style={{ background: loading ? undefined : 'var(--navy-600)' }}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );

  if (layout === 'split') {
    return (
      <div
        className="login-split-root box-border flex min-h-[100dvh] min-h-screen h-full w-full max-w-none flex-col lg:flex-row"
        style={{ fontFamily: 'var(--font-body), sans-serif' }}
      >
        <div
          className="relative flex min-h-[280px] flex-[1_1_58%] flex-col items-center justify-center overflow-hidden px-10 py-12 lg:min-h-screen lg:max-w-[58%] lg:flex-[1_1_58%] lg:px-16 lg:py-16"
          style={{
            background: 'linear-gradient(160deg, var(--navy-900) 0%, var(--navy-700) 60%, var(--navy-600) 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(26,58,107,0.4) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(37,99,168,0.3) 0%, transparent 50%)`,
            }}
          />
          <div className="relative z-[1] w-full max-w-md text-center">
            <div className="flex justify-center">
              <Image
                src={`${basePath}/dgs-logo-light.jpeg`}
                alt="Directorate General of Shipping"
                width={120}
                height={120}
                className="rounded-full border-[3px] border-[rgba(212,160,23,0.6)] object-cover"
                priority
                unoptimized
              />
            </div>
            <div className="mt-8 border-t border-[rgba(212,160,23,0.4)] pt-6">
              <p
                className="mb-2 text-[14px] uppercase tracking-[3px] text-white/50"
                style={{ fontFamily: 'var(--font-body), sans-serif' }}
              >
                Government of India · Ministry of Ports, Shipping &amp; Waterways
              </p>
              <h1
                className="mb-1 font-bold tracking-tight text-white"
                style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '3.5rem' }}
              >
                ISEP
              </h1>
              <p className="text-[1rem] tracking-wide text-white/90">IMO Strategic Engagement Platform</p>
              <p className="mt-1 text-[0.9rem] tracking-wide text-[rgba(212,160,23,0.85)]">
                Directorate General of Shipping
              </p>
            </div>
            <div className="mt-12 space-y-4 text-left text-[1rem]" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {[
                { icon: '⚓', text: 'Centralised IMO engagement management' },
                { icon: '📋', text: 'Multi-level document approval workflows' },
                { icon: '🔒', text: 'Secure, role-based access control' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/30 py-2 text-center text-[14px] tracking-wide text-white/50">
            RESTRICTED — GOVERNMENT USE ONLY
          </div>
        </div>

        <div className="flex min-h-[60vh] flex-[1_1_42%] flex-col items-stretch justify-start bg-white px-6 pt-4 pb-8 sm:px-8 lg:min-h-screen lg:max-w-[42%] lg:flex-[1_1_42%] lg:px-10">
          <div className="w-full max-w-md">
            <h2
              className="mb-2 font-bold text-[var(--navy-800)]"
              style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '2rem' }}
            >
              Sign in
            </h2>
            <p className="mb-8 text-[1rem] text-[var(--slate-500)]">Use your DGS official credentials</p>
            {formBlock}
            <div className="mt-10 border-t border-[var(--slate-100)] pt-6 text-center text-sm text-[var(--slate-300)]">
              <p>Directorate General of Shipping · Mumbai — 400 001</p>
              <p className="mt-1">For access issues contact your system administrator</p>
            </div>
            {showBackToHome && (
              <p className="mt-6 text-center">
                <Link href="/" className="text-base font-medium text-[var(--slate-600)] hover:text-[var(--navy-800)]">
                  ← Back to home
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">ISEP</h1>
          <p className="mt-1 text-base text-slate-600">IMO Strategic Engagement Platform</p>
          <p className="text-sm text-slate-500">DGS · MoPSW, Government of India</p>
        </div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Sign in</h2>
        {formBlock}
        {showBackToHome && (
          <p className="mt-6 text-center">
            <Link href="/" className="text-base font-medium text-slate-600 hover:text-slate-900">
              ← Back to home
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
