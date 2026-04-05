import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UnauthorizedContent } from './UnauthorizedContent';

type Props = { searchParams: Promise<{ from?: string }> };

export default async function UnauthorizedPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const from = params.from ?? null;
  const roles = (session as { roles?: string[] })?.roles ?? [];
  const roleLabel = roles.length > 0 ? roles.join(', ') : 'None';
  const name = session?.user?.name ?? session?.user?.email ?? 'You';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <UnauthorizedContent
        from={from}
        roleLabel={roleLabel}
        userName={name}
        userEmail={session?.user?.email ?? null}
      />
      <div className="card max-w-md p-8 text-center mt-6">
        <h1 className="text-xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-2 text-slate-600">
          You do not have permission to view this page.
        </p>
        {from && (
          <p className="mt-2 text-sm text-slate-500">
            Attempted path: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{from}</code>
          </p>
        )}
        <p className="mt-2 text-sm text-slate-500">
          Your role: <strong>{roleLabel}</strong>
        </p>
        {roles.length === 0 && (
          <p className="mt-2 text-sm text-amber-700 bg-amber-50 rounded p-2">
            Your token does not include an app role (e.g. COORDINATOR). Keycloak must include realm roles in the access token. See <strong>infrastructure/keycloak/README.md</strong> → &quot;Token missing realm roles&quot;.
          </p>
        )}
        <p className="mt-4 text-xs text-slate-400">
          This attempt has been logged for audit.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link href="/dashboard" className="btn-primary">
            Return to dashboard
          </Link>
          <Link href="/api/auth/signout?callbackUrl=/" className="btn-secondary">
            Sign out
          </Link>
        </div>
      </div>
    </main>
  );
}
