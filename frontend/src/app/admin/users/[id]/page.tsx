import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type UserDto } from '@/lib/api';

async function getUser(id: string, accessToken: string): Promise<UserDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/users/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

const SYSTEM_ROLE_LABELS: Record<string, string> = {
  SYSTEM_ADMIN: 'System Admin',
  IC_DIVISION_HEAD: 'IC Division Head',
  DELEGATION_LEADER: 'Delegation Leader',
  COORDINATOR: 'Coordinator',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

type Props = { params: Promise<{ id: string }> };

export default async function UserProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const isAdmin = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
  if (!isAdmin) redirect('/unauthorized');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let user: UserDto | null = null;
  if (accessToken) {
    try {
      user = await getUser(id, accessToken);
    } catch {
      user = null;
    }
  }
  if (!user) notFound();

  const canEdit = roles.includes('SYSTEM_ADMIN');

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/users" className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Back to User list
        </Link>
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="card-body">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="page-title">{user.fullName}</h1>
              <p className="page-subtitle">{user.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={user.isActive ? 'badge badge-success' : 'badge badge-neutral'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              {canEdit && (
                <Link href={`/admin/users/${user.userId}/edit`} className="btn-secondary">
                  Edit user
                </Link>
              )}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-base sm:grid-cols-4">
            <div>
              <dt className="text-slate-500">Designation</dt>
              <dd className="font-medium text-slate-900">{user.designation ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Organization</dt>
              <dd className="font-medium text-slate-900">{user.organization ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-medium text-slate-900">{user.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">System role</dt>
              <dd className="font-medium text-slate-900">
                {SYSTEM_ROLE_LABELS[user.systemRole] ?? user.systemRole}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Keycloak ID</dt>
              <dd className="font-mono text-sm text-slate-600 break-all">{user.keycloakId}</dd>
            </div>
            {user.lastLoginAt && (
              <div>
                <dt className="text-slate-500">Last login</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(user.lastLoginAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-700">Role & committee assignment</h2>
        </div>
        <div className="card-body">
          <p className="text-slate-500">
            Committee and correspondence group assignments (SCR-USR-05) — coming soon.
          </p>
          <Link
            href={`/admin/users/${user.userId}/assignments`}
            className="mt-2 inline-block text-base font-medium text-blue-600 hover:underline"
          >
            Manage assignments →
          </Link>
        </div>
      </div>
    </div>
  );
}
