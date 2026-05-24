import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getPapers } from '@/lib/api';

type Props = { params: Promise<{ id: string }> };

/**
 * SCR-PAPER-04 — Finalized paper view. Read-only; approval audit trail; Unlock for amendment (SA/IH).
 * Paper loaded from backend only.
 */
export default async function PaperViewPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let paper: { paperId: string; title: string; meetingTitle?: string; agendaItemTitle?: string; approvalStages: { stage: string; approver: string; action: string }[] } | null = null;
  if (accessToken) {
    try {
      const list = await getPapers(accessToken);
      const p = list.find((x) => x.paperId === id);
      if (p) paper = { paperId: p.paperId, title: p.title, meetingTitle: undefined, agendaItemTitle: undefined, approvalStages: [] };
    } catch {
      paper = null;
    }
  }
  if (!paper) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/papers" className="text-base font-medium text-slate-500 hover:text-slate-700">← Papers list</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="page-title">{paper.title}</h1>
            <span className="rounded bg-emerald-100 px-3 py-1 text-base font-medium text-emerald-800">FINALIZED</span>
          </div>
          <p className="mt-1 text-slate-600">{paper.meetingTitle ?? '—'} · {paper.agendaItemTitle ?? '—'}</p>
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <p className="text-slate-700">[Final document content — read-only. Download button would generate presigned URL.]</p>
          </div>
          <h2 className="mt-8 text-base font-semibold text-slate-900">Approval audit trail</h2>
          <ul className="mt-2 space-y-2 text-base text-slate-600">
            {paper.approvalStages.map((s) => (
              <li key={`${s.stage}-${s.approver}-${s.action}`}>{s.stage}: {s.approver} — {s.action}</li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            <button type="button" disabled className="btn-secondary opacity-70 cursor-not-allowed">Download (demo)</button>
            <Link href="/papers" className="btn-secondary">Back to papers</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
