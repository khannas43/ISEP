import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getPapers } from '@/lib/api';

type Props = { params: Promise<{ id: string }> };

const MOCK_AGENCIES = [
  { name: 'MoEFCC', sent: '2026-03-12', status: 'received' as const },
  { name: 'MEA', sent: '2026-03-14', status: 'received' as const },
  { name: 'MoPSW', sent: '2026-03-18', status: 'pending' as const },
  { name: 'MoD', sent: '2026-03-18', status: 'pending' as const },
  { name: 'MoS', sent: '2026-03-20', status: 'received' as const },
];

function badge(status: 'received' | 'pending') {
  if (status === 'received') {
    return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Feedback received</span>;
  }
  return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">Pending</span>;
}

/**
 * Phase 4 wireframe — external agency consultation tracking (Sprint 3).
 */
export default async function PaperConsultationPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let title = 'Paper';
  let versionLabel = 'Clean copy v2 (mock)';
  if (accessToken) {
    try {
      const papers = await getPapers(accessToken);
      const p = papers.find((x) => x.paperId === id);
      if (p) title = p.title;
    } catch {
      // keep defaults
    }
  }
  if (!accessToken) {
    return (
      <div className="p-8 text-center text-slate-600">
        <p>Session expired or not authenticated. Please log in again.</p>
        <Link href="/papers" className="mt-4 inline-block font-medium text-blue-600">
          ← Papers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/papers/${id}/draft`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Back to draft
        </Link>
      </div>

      <div className="card">
        <div className="card-body space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="page-title">External consultation</h1>
              <p className="mt-1 text-slate-600">{title}</p>
              <p className="mt-2 text-sm text-slate-500">Current clean copy: {versionLabel}</p>
            </div>
            <button
              type="button"
              disabled
              title="External agency module — Sprint 3 delivery"
              className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
            >
              Send for consultation
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="table-header px-4 py-2.5 text-left">Agency</th>
                  <th className="table-header px-4 py-2.5 text-left">Sent</th>
                  <th className="table-header px-4 py-2.5 text-left">Status</th>
                  <th className="table-header px-4 py-2.5 text-left">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MOCK_AGENCIES.map((a) => (
                  <tr key={a.name}>
                    <td className="table-cell px-4 py-2.5 font-medium text-slate-900">{a.name}</td>
                    <td className="table-cell px-4 py-2.5 text-slate-600">{a.sent}</td>
                    <td className="table-cell px-4 py-2.5">{badge(a.status)}</td>
                    <td className="table-cell px-4 py-2.5">
                      <Link
                        href={`/papers/${id}/consultation/feedback`}
                        className="text-blue-600 hover:underline"
                      >
                        View feedback
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Sprint 3 feature:</strong> External agency consultation with live inter-ministerial access will be
            available in the next sprint. Current view shows the consultation tracking interface.
          </div>
        </div>
      </div>
    </div>
  );
}
