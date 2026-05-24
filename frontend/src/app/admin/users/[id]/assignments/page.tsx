import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getUserAssignments, type UserDto } from '@/lib/api';
import { UserAssignmentsClient } from './UserAssignmentsClient';

async function getUser(id: string, accessToken: string): Promise<UserDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/users/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

type Props = { params: Promise<{ id: string }> };

export default async function UserAssignmentsPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN') && !roles.includes('IC_DIVISION_HEAD') && !roles.includes('COORDINATOR')) {
    redirect('/unauthorized');
  }

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  const user: UserDto | null = accessToken ? await getUser(id, accessToken) : null;
  if (!user) notFound();

  const assignments = accessToken ? await getUserAssignments(accessToken, id) : null;

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/users/${id}`} className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Back to user profile
        </Link>
      </div>
      <div className="page-header">
        <h1 className="page-title">Committee & correspondence group assignment</h1>
        <p className="page-subtitle">
          Assign {user.fullName} to committees and correspondence groups (SCR-USR-05).
        </p>
      </div>
      <UserAssignmentsClient userId={id} initialData={assignments} />
    </div>
  );
}
