import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type MeetingDto } from '@/lib/api';
import { LiveMeetingDiscussionClient } from './LiveMeetingDiscussionClient';

async function getMeeting(id: string, accessToken: string): Promise<MeetingDto | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/meetings/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getAgendaItems(meetingId: string, accessToken: string) {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.content ?? []);
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ id: string }> };

export default async function LiveMeetingPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let meeting: MeetingDto | null = null;
  if (accessToken) {
    meeting = await getMeeting(id, accessToken);
  }
  if (!meeting) notFound();

  let agendaItems: {
    agendaItemId: string;
    itemNumber?: string;
    title: string;
    discussionLocked?: boolean;
  }[] = [];
  if (accessToken) {
    const raw = await getAgendaItems(id, accessToken);
    agendaItems = raw.map(
      (a: {
        agendaItemId: string;
        itemNumber?: string | null;
        title?: string;
        discussionLocked?: boolean;
      }) => ({
        agendaItemId: a.agendaItemId,
        itemNumber: a.itemNumber ?? undefined,
        title: a.title ?? '',
        discussionLocked: a.discussionLocked,
      })
    );
  }

  return (
    <div className="w-full max-w-none">
      <div className="mb-4">
        <Link href={`/meetings/${id}?tab=live`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Meeting overview
        </Link>
      </div>
      <LiveMeetingDiscussionClient
        meetingId={id}
        meetingTitle={meeting.title}
        committeeName={meeting.bodyName}
        startDate={meeting.startDate}
        endDate={meeting.endDate}
        status={meeting.status}
        agendaItems={agendaItems}
        initialLiveSessionActive={Boolean(meeting.liveSessionActive)}
      />
    </div>
  );
}
