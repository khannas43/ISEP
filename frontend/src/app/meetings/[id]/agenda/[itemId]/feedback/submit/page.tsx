import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type AgendaItemDto } from '@/lib/api';
import { FeedbackSubmitForm } from '../FeedbackSubmitForm';

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
 * SCR-COL-01 — Feedback submission (Member). Position, comments, amendments, attachments.
 * Demo: mock agenda item when API 404.
 */
export default async function FeedbackSubmitPage({ params }: Props) {
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
          <Link href={`/meetings/${meetingId}?tab=agenda`} className="mt-4 inline-block text-base text-blue-600 hover:underline">
            ← Back to Agenda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/meetings/${meetingId}/agenda/${itemId}`}
          className="text-base font-medium text-slate-500 hover:text-slate-700"
        >
          ← Back to Agenda Item
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Submit feedback</h1>
          <p className="page-subtitle">
            Item {agendaItem.itemNumber}: {agendaItem.title}
          </p>
          {agendaItem.deadlineForInputs && (
            <p className="mt-2 text-base text-amber-700">
              Deadline for inputs: <strong>{agendaItem.deadlineForInputs}</strong>
            </p>
          )}
          <FeedbackSubmitForm
            meetingId={meetingId}
            itemId={itemId}
            agendaItemTitle={agendaItem.title}
            deadline={agendaItem.deadlineForInputs ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
