import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getFeedbackList, type AgendaItemDto, type FeedbackDto } from '@/lib/api';
import { FeedbackConsolidateView } from '../FeedbackConsolidateView';

async function getAgendaItem(meetingId: string, itemId: string, accessToken: string): Promise<AgendaItemDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items/${itemId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

type Props = { params: Promise<{ id: string; itemId: string }> };

/**
 * SCR-COL-02 — Feedback consolidation (Coordinator). View all member inputs, draft consolidated position.
 * Demo: mock feedback data.
 */
export default async function FeedbackConsolidatePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: meetingId, itemId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let agendaItem: AgendaItemDto | null = null;
  if (accessToken) {
    try {
      agendaItem = await getAgendaItem(meetingId, itemId, accessToken);
    } catch {
      agendaItem = null;
    }
  }
  if (!agendaItem) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-slate-600">Agenda item not found.</p>
          <Link href={`/meetings/${meetingId}?tab=agenda`} className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            ← Back to Agenda
          </Link>
        </div>
      </div>
    );
  }

  let feedback: FeedbackDto[] = [];
  if (accessToken) {
    try {
      feedback = await getFeedbackList(accessToken, itemId);
    } catch {
      // Leave empty when API unavailable
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/meetings/${meetingId}/agenda/${itemId}?tab=feedback`}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          ← Back to Agenda Item (Feedback tab)
        </Link>
      </div>
      <FeedbackConsolidateView
        meetingId={meetingId}
        itemId={itemId}
        agendaItem={agendaItem}
        feedback={feedback}
      />
    </div>
  );
}
