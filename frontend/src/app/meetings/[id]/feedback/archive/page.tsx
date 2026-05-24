import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type AgendaItemDto } from '@/lib/api';
import { FeedbackArchiveClient } from './FeedbackArchiveClient';

async function fetchMeetingTitle(id: string, accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/meetings/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const m = await res.json();
    return m.title ?? null;
  } catch {
    return null;
  }
}

async function fetchAgendaItems(meetingId: string, accessToken: string): Promise<AgendaItemDto[]> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ id: string }> };

export default async function FeedbackArchivePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!accessToken) redirect('/login');

  let title: string | null = null;
  let agendaItems: AgendaItemDto[] = [];
  try {
    [title, agendaItems] = await Promise.all([
      fetchMeetingTitle(id, accessToken),
      fetchAgendaItems(id, accessToken),
    ]);
  } catch {
    title = null;
    agendaItems = [];
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/meetings/${id}`} className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Meeting
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Feedback archive — {title ?? id}</h1>
          <p className="page-subtitle text-slate-600">
            Historical feedback and submissions for this meeting.
          </p>
          <div className="mt-6">
            <FeedbackArchiveClient meetingId={id} accessToken={accessToken} agendaItems={agendaItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
