import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getPapers } from '@/lib/api';
import { PaperRejectForm } from './PaperRejectForm';

type Props = { params: Promise<{ id: string }> };

/**
 * SCR-PAPER-05 — Paper rejection. Mandatory comments, return-to-stage selector. Paper from API only.
 */
export default async function PaperRejectPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let paper: { paperId: string; title: string } | null = null;
  if (accessToken) {
    try {
      const list = await getPapers(accessToken);
      const p = list.find((x) => x.paperId === id);
      if (p) paper = { paperId: p.paperId, title: p.title };
    } catch {
      paper = null;
    }
  }
  if (!paper) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href={`/papers/${id}/approval`} className="text-base font-medium text-slate-500 hover:text-slate-700">← Approval workflow</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Reject / return paper</h1>
          <p className="page-subtitle">{paper.title}</p>
          <p className="mt-2 text-base text-slate-600">Provide mandatory rejection comments (min 50 characters) and select the stage to return the paper to.</p>
          <PaperRejectForm paperId={id} paperTitle={paper.title} />
        </div>
      </div>
    </div>
  );
}
