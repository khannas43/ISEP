import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getPapers, type PaperListItem } from '@/lib/api';
import { getPaperDraftForPage } from '../../actions';
import { PaperDraftView } from './PaperDraftView';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ documentId?: string }> };

/**
 * SCR-PAPER-02 — Paper drafting environment. TipTap editor with track changes.
 * Paper and draft loaded from backend only.
 */
export default async function PaperDraftPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const sp = await searchParams;
  if (sp.documentId?.trim()) {
    redirect(`/documents/${encodeURIComponent(sp.documentId.trim())}/editor`);
  }
  const accessToken = (session as { accessToken?: string }).accessToken;
  let paper: PaperListItem | null = null;
  if (accessToken) {
    try {
      const papers = await getPapers(accessToken);
      paper = papers.find((p) => p.paperId === id) ?? null;
    } catch {
      paper = null;
    }
  }
  if (!paper) notFound();

  let draft: Awaited<ReturnType<typeof getPaperDraftForPage>> = null;
  try {
    draft = await getPaperDraftForPage(id);
  } catch {
    draft = null;
  }
  const initialContentJson =
    draft?.content != null ? JSON.stringify(draft.content) : null;
  const initialVersion = draft?.version ?? null;
  const draftSource = draft ? 'api' : 'empty';

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4">
        <Link href="/papers" className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Papers list
        </Link>
        <span className="text-base text-slate-500">
          TipTap editor: append{' '}
          <code className="rounded bg-slate-100 px-1">?documentId={'{uuid}'}</code> to open{' '}
          <Link href="/documents" className="text-blue-600 hover:underline">
            /documents/…/editor
          </Link>
        </span>
      </div>
      <div className="card">
        <div className="card-body">
          <PaperDraftView
            paperId={paper.paperId}
            paperTitle={paper.title}
            meetingTitle={paper.meetingTitle ?? ''}
            agendaItemTitle={paper.agendaItemTitle ?? ''}
            status={paper.status}
            initialContentJson={initialContentJson}
            initialVersion={initialVersion}
            draftSource={draftSource}
          />
        </div>
      </div>
    </div>
  );
}
