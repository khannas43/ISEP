import { Suspense } from 'react';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';
import { LoginCompleteClient } from './LoginCompleteClient';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ callbackUrl?: string }> };

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
    </div>
  );
}

/**
 * Post-login handoff: client session + single guarded redirect (see LoginCompleteClient).
 * Server-side redirect was removed to avoid RSC/middleware/JWT timing loops with the editor route.
 */
export default async function LoginCompletePage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params?.callbackUrl);

  return (
    <Suspense fallback={<Fallback />}>
      <LoginCompleteClient callbackUrl={callbackUrl} />
    </Suspense>
  );
}
