import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type MeetingDto } from '@/lib/api';
import { InterventionForm } from './InterventionForm';

async function getMeeting(id: string, accessToken: string): Promise<MeetingDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getAgendaItems(meetingId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.content ?? []);
}

type Props = { params: Promise<{ id: string }> };

export default async function NewInterventionPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: meetingId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let meeting: MeetingDto | null = null;
  if (accessToken) {
    try {
      meeting = await getMeeting(meetingId, accessToken);
    } catch {
      meeting = null;
    }
  }
  if (!meeting) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-slate-600">Meeting not found.</p>
          <Link href="/meetings" className="mt-4 inline-block text-base text-blue-600 hover:underline">← Meetings</Link>
        </div>
      </div>
    );
  }

  let agendaItems: { agendaItemId: string; itemNumber: string; title: string }[] = [];
  if (accessToken) {
    try {
      const list = await getAgendaItems(meetingId, accessToken);
      agendaItems = list.map((a: { agendaItemId: string; itemNumber?: string; title?: string }) => ({
      agendaItemId: a.agendaItemId,
      itemNumber: a.itemNumber ?? '',
      title: a.title ?? '',
    }));
    } catch {
      // Leave empty when API unavailable
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/meetings/${meetingId}/live`} className="text-base font-medium text-slate-500 hover:text-slate-700">← Live lobby</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Record intervention</h1>
          <p className="page-subtitle">{meeting.title}</p>
          <InterventionForm meetingId={meetingId} agendaItems={agendaItems} />
        </div>
      </div>
    </div>
  );
}
