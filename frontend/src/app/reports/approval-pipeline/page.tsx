import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApprovalPipelineReport } from '@/lib/api';

export default async function ApprovalPipelineReportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let rows: Array<{ paperId: string; title: string; currentStage: string; nextApprover: string; status: string }> = [];
  if (accessToken) {
    try {
      rows = await getApprovalPipelineReport(accessToken);
    } catch {
      // use mock below
    }
  }
  return (
    <div>
      <div className="mb-6">
        <Link href="/reports" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Reports</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Approval pipeline report</h1>
          <p className="page-subtitle">Papers in approval workflow by stage; ageing; next approver.</p>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr><th className="table-header px-4 py-2 text-left">Paper</th><th className="table-header px-4 py-2 text-left">Stage</th><th className="table-header px-4 py-2 text-left">Next approver</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((r) => (
                  <tr key={r.paperId}>
                    <td className="px-4 py-2"><Link href={`/papers/${r.paperId}/approval`} className="text-blue-600 hover:underline">{r.title.slice(0, 50)}{r.title.length > 50 ? '…' : ''}</Link></td>
                    <td className="px-4 py-2">{r.currentStage}</td>
                    <td className="px-4 py-2">{r.nextApprover}</td>
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
