import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { authOptions } from '@/lib/auth';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';
import { isMfaEnforcedInThisEnvironment } from '@/lib/mfaPolicy';
import { LoginCompleteRedirect } from './LoginCompleteRedirect';

export const dynamic = 'force-dynamic';

/**
 * Post-login: ensure session exists, then client component does MFA vs dashboard redirect
 * (client session has roles; avoids server cache issues)
 */
type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function LoginCompletePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params?.callbackUrl);

  if (!session?.user) {
    redirect(`/?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const roles = (session as { roles?: string[] }).roles ?? [];
  const requiresMfa = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
  // Match middleware: in development, skip MFA unless NEXT_PUBLIC_REQUIRE_MFA_IN_DEV is set (otherwise / → login/complete always showed OTP while session already existed).
  if (!requiresMfa || !isMfaEnforcedInThisEnvironment()) {
    redirect(callbackUrl);
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" /></div>}>
      <LoginCompleteRedirect callbackUrl={callbackUrl} />
    </Suspense>
  );
}
