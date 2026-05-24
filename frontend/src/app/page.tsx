import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { sanitizeCallbackUrl } from '@/lib/callbackUrl';

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

  const query = new URLSearchParams();
  if (callbackUrl) query.set('callbackUrl', callbackUrl);
  if (error) query.set('error', error);
  redirect(query.toString() ? `/login?${query.toString()}` : '/login');
}
