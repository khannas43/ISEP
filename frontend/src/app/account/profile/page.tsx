import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

/**
 * SCR-USR-03 — User profile (self). View own profile and activity.
 */
export default async function AccountProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const user = session.user;

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Dashboard</Link>
      </div>
      <div className="card max-w-2xl">
        <div className="card-body">
          <h1 className="page-title">My profile</h1>
          <p className="page-subtitle">View your account details and roles.</p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Name</dt>
              <dd className="mt-1 text-slate-900">{user.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="mt-1 text-slate-900">{user.email ?? '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Roles</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {roles.length === 0 ? (
                  <span className="text-slate-500">No roles assigned (dev mode may show full access)</span>
                ) : (
                  roles.map((r) => (
                    <span key={r} className="rounded bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-700">
                      {r.replace(/_/g, ' ')}
                    </span>
                  ))
                )}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/account/change-password" className="btn-secondary text-sm">Change password</Link>
            <Link href="/account/notification-preferences" className="btn-secondary text-sm">Notification preferences</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
