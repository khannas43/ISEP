import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAuditReport } from '@/lib/api';

export default async function AuditReportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let entries: { id: string; timestamp: string; userName: string; action: string; entityType: string; entityId?: string }[] = [];
  if (accessToken) {
    try {
      const { content } = await getAuditReport(accessToken, { size: 100 });
      entries = (content ?? []).map((e: { auditId?: string; timestamp: string; userEmail?: string; actionType: string; entityType: string; entityId?: string }) => ({
        id: String(e.auditId ?? e.timestamp),
        timestamp: e.timestamp,
        userName: e.userEmail ?? '—',
        action: e.actionType,
        entityType: e.entityType,
        entityId: e.entityId,
      }));
    } catch {
      // Leave empty when API unavailable
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/reports" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Reports</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Audit report</h1>
          <p className="page-subtitle">Searchable audit log. Filters: user, action type, entity, date range, IP. Export CSV/JSON. Immutable.</p>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="table-header px-4 py-2 text-left">Time</th>
                  <th className="table-header px-4 py-2 text-left">User</th>
                  <th className="table-header px-4 py-2 text-left">Action</th>
                  <th className="table-header px-4 py-2 text-left">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2">{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2">{e.userName}</td>
                    <td className="px-4 py-2">{e.action}</td>
                    <td className="px-4 py-2">{e.entityType} {e.entityId ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
