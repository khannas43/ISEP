import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type MeetingDto } from '@/lib/api';
import { LiveMeetingSprint3Wireframe } from './LiveMeetingSprint3Wireframe';

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

async function getParticipants(meetingId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/participants`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.content ?? []);
}

type Props = { params: Promise<{ id: string }> };

export default async function LiveMeetingPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let meeting: MeetingDto | null = null;
  if (accessToken) {
    try {
      meeting = await getMeeting(id, accessToken);
    } catch {
      meeting = null;
    }
  }
  if (!meeting) notFound();

  let agendaItems: { agendaItemId: string; itemNumber?: string; title: string }[] = [];
  let participants: { participantId: string; name: string; meetingRole?: string }[] = [];
  if (accessToken) {
    try {
      const [agendaRes, partRes] = await Promise.all([getAgendaItems(id, accessToken), getParticipants(id, accessToken)]);
      agendaItems = agendaRes.map((a: { agendaItemId: string; itemNumber?: string; title: string }) => ({ agendaItemId: a.agendaItemId, itemNumber: a.itemNumber, title: a.title ?? '' }));
      participants = partRes.map((p: { participantId: string; name?: string; fullName?: string; meetingRole?: string }) => ({ participantId: p.participantId, name: p.name ?? p.fullName ?? '—', meetingRole: p.meetingRole }));
    } catch {
      // Leave empty when API unavailable
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/meetings/${id}?tab=live`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Meeting overview
        </Link>
      </div>
      <LiveMeetingSprint3Wireframe
        meetingId={id}
        meetingTitle={meeting.title}
        committeeName={meeting.bodyName}
        startDate={meeting.startDate}
        endDate={meeting.endDate}
        status={meeting.status}
        agendaItems={agendaItems}
        participants={participants}
      />
    </div>
  );
}
