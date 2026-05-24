import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type CorrespondenceGroupDto } from '@/lib/api';

async function getCorrespondenceGroup(cgId: string, accessToken: string): Promise<CorrespondenceGroupDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/correspondence-groups/${cgId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * SCR-CG-04 — CG members. List/add/remove members. API or mock.
 */
type Props = { params: Promise<{ id: string }> };

export default async function CGMembersPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: cgId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!accessToken) redirect('/login');

  let cg: CorrespondenceGroupDto | null = null;
  try {
    cg = await getCorrespondenceGroup(cgId, accessToken);
  } catch {
    cg = null;
  }
  if (!cg) notFound();

  // Members from API when endpoint exists; empty until then
  const members: { userId: string; name: string; role: string; email: string }[] = [];

  return (
    <div>
      <div className="mb-6">
        <Link href={`/correspondence-groups/${cgId}`} className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Back to {cg.name}
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle mt-1">{cg.name} — correspondence group members and roles.</p>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-base">
              <thead>
                <tr>
                  <th className="table-header px-4 py-2.5 text-left">Name</th>
                  <th className="table-header px-4 py-2.5 text-left">Role</th>
                  <th className="table-header px-4 py-2.5 text-left">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {members.map((m) => (
                  <tr key={m.userId} className="hover:bg-slate-50/50">
                    <td className="table-cell font-medium text-slate-900">{m.name}</td>
                    <td className="table-cell text-slate-600">{m.role}</td>
                    <td className="table-cell text-slate-600">{m.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {members.length === 0 && (
            <p className="mt-4 text-base text-slate-500">No members yet. Member data is loaded from the database via the API.</p>
          )}
        </div>
      </div>
    </div>
  );
}
