import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UserForm } from '../UserForm';

const SYSTEM_ROLE_OPTIONS = [
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'COORDINATOR', label: 'Coordinator' },
  { value: 'DELEGATION_LEADER', label: 'Delegation Leader' },
  { value: 'IC_DIVISION_HEAD', label: 'IC Division Head' },
  { value: 'SYSTEM_ADMIN', label: 'System Admin' },
];

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/users" className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Back to User list
        </Link>
      </div>
      <div className="page-header">
        <h1 className="page-title">Add user</h1>
        <p className="page-subtitle">Create a new user (SCR-USR-02).</p>
      </div>
      <div className="card">
        <div className="card-body">
          <UserForm systemRoleOptions={SYSTEM_ROLE_OPTIONS} />
        </div>
      </div>
    </>
  );
}
