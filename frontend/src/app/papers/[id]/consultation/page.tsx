import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getPapers } from '@/lib/api';
import PaperConsultationClient from './PaperConsultationClient';

type Props = { params: Promise<{ id: string }> };

/**
 * Phase 4 — external agency consultation (live API).
 */
export default async function PaperConsultationPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  const roles = ((session as { roles?: string[] }).roles ?? []) as string[];

  let title = 'Paper';
  let cleanCopyDocumentId: string | null = null;
  if (accessToken) {
    try {
      const papers = await getPapers(accessToken);
      const p = papers.find((x) => x.paperId === id);
      if (p) {
        title = p.title;
        cleanCopyDocumentId = p.cleanCopyDocumentId ?? null;
      }
    } catch {
      // keep defaults; client may still show document-linked UI if user navigates with stale state
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

  const canSendConsultation = roles.includes('SYSTEM_ADMIN') || roles.includes('DELEGATION_LEADER');

  return (
    <PaperConsultationClient
      accessToken={accessToken}
      paperId={id}
      documentId={cleanCopyDocumentId}
      title={title}
      canSendConsultation={canSendConsultation}
    />
  );
}
