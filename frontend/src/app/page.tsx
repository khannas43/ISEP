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
    redirect(`/login/complete?${new URLSearchParams({ callbackUrl }).toString()}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
        <LoginForm
          defaultCallbackUrl={callbackUrl}
          initialError={error ?? undefined}
          showBackToHome={false}
        />
      </Suspense>
    </main>
  );
}
