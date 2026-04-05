'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function MeetingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Meetings]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600">
          An error occurred on the meetings page. You can try again or go back to the list.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button type="button" onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <Link href="/meetings" className="btn-secondary">
            Back to meetings
          </Link>
          <Link href="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
