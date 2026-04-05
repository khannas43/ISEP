import Link from 'next/link';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';

/**
 * SCR-AUTH-04 — Session Timeout / Re-authentication.
 * Shown when the user's session has been inactive beyond the configured timeout (default 30 min).
 * Preserves callbackUrl so they are redirected back after re-authentication.
 */
type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function SessionExpiredPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params?.callbackUrl);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-900">Session expired</h1>
          <p className="mt-2 text-sm text-slate-600">
            You have been signed out due to inactivity (default 30 minutes). Sign in again to continue.
          </p>
          <Link
            href={`/?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Sign in again
          </Link>
        </div>
      </div>
    </main>
  );
}
