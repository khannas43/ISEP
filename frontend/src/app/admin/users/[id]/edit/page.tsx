import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type UserDto } from '@/lib/api';
import { UserForm } from '../../UserForm';

async function getUser(id: string, accessToken: string): Promise<UserDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/users/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

const SYSTEM_ROLE_OPTIONS = [
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'COORDINATOR', label: 'Coordinator' },
  { value: 'DELEGATION_LEADER', label: 'Delegation Leader' },
  { value: 'IC_DIVISION_HEAD', label: 'IC Division Head' },
  { value: 'SYSTEM_ADMIN', label: 'System Admin' },
];

type Props = { params: Promise<{ id: string }> };

export default async function EditUserPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

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

  return (
    <>
      <div className="mb-6">
        <Link href={`/admin/users/${id}`} className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Back to user profile
        </Link>
      </div>
      <div className="page-header">
        <h1 className="page-title">Edit user</h1>
        <p className="page-subtitle">Update user details and role (SCR-USR-02).</p>
      </div>
      <div className="card">
        <div className="card-body">
          <UserForm user={user} systemRoleOptions={SYSTEM_ROLE_OPTIONS} />
        </div>
      </div>
    </>
  );
}
