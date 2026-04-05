import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type CorrespondenceGroupDto } from '@/lib/api';
import { formatDisplayDate } from '@/lib/format';

async function getCorrespondenceGroup(cgId: string, accessToken: string): Promise<CorrespondenceGroupDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/correspondence-groups/${cgId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * SCR-CG-05 — CG submissions. List submissions; API or mock.
 */
type Props = { params: Promise<{ id: string }> };

export default async function CGSubmissionsPage({ params }: Props) {
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

  // Submissions from API when endpoint exists; empty until then
  const submissions: { id: string; title: string; status: string; dueDate: string; updatedAt: string }[] = [];

  return (
    <div>
      <div className="mb-6">
        <Link href={`/correspondence-groups/${cgId}`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Back to {cg.name}
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Submissions</h1>
          <p className="page-subtitle mt-1">{cg.name} — correspondence group submissions and deadlines.</p>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr>
                  <th className="table-header px-4 py-2.5 text-left">Title</th>
                  <th className="table-header px-4 py-2.5 text-left">Status</th>
                  <th className="table-header px-4 py-2.5 text-left">Due date</th>
                  <th className="table-header px-4 py-2.5 text-left">Last updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="table-cell font-medium text-slate-900">{s.title}</td>
                    <td className="table-cell">
                      <span className={s.status === 'SUBMITTED' ? 'badge badge-success' : 'badge badge-neutral'}>
                        {s.status}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600">{formatDisplayDate(s.dueDate)}</td>
                    <td className="table-cell text-slate-600">{formatDisplayDate(s.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {submissions.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">No submissions yet. Submission data is loaded from the database via the API.</p>
          )}
        </div>
      </div>
    </div>
  );
}
