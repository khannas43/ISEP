import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { authOptions } from '@/lib/auth';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';
import { LoginForm } from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ callbackUrl?: string; error?: string }> };

export default async function HomePage(props: Props) {
  let session = null;
  let callbackUrl = '/dashboard';
  let error: string | null = null;

  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error('[HomePage] getServerSession failed:', e);
  }

  try {
    const params = await props.searchParams;
    callbackUrl = sanitizeCallbackUrl(params?.callbackUrl as string | undefined);
    error = (params?.error as string) ?? null;
    // Never leave credentials in the URL (security)
    const p = params as Record<string, string> | undefined;
    if (p && (p.username != null || p.password != null)) {
      const clean = new URLSearchParams();
      if (p.callbackUrl) clean.set('callbackUrl', p.callbackUrl);
      if (p.error) clean.set('error', p.error);
      redirect(clean.toString() ? `/?${clean.toString()}` : '/');
    }
  } catch (e) {
    console.error('[HomePage] searchParams failed:', e);
  }

  if (session?.user) {
    // Server already has a session — go straight to the target. Routing via /login/complete + soft
    // nav caused middleware/JWT races and flicker on deep links (e.g. document editor).
    redirect(sanitizeCallbackUrl(callbackUrl));
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-none">
      <Suspense
        fallback={
          <div className="flex min-h-screen w-full flex-col lg:flex-row">
            <div
              className="min-h-[40vh] flex-[1_1_58%] lg:min-h-screen"
              style={{
                background: 'linear-gradient(160deg, var(--navy-900) 0%, var(--navy-700) 60%, var(--navy-600) 100%)',
              }}
            />
            <div className="relative flex min-h-[60vh] flex-[1_1_42%] bg-white lg:min-h-screen">
              <p className="absolute left-4 top-4 text-base text-slate-500">Loading…</p>
            </div>
          </div>
        }
      >
        <LoginForm
          defaultCallbackUrl={callbackUrl}
          initialError={error ?? undefined}
          showBackToHome={false}
          layout="split"
        />
      </Suspense>
    </div>
  );
}
