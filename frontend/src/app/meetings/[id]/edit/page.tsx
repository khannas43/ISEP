import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getReferenceData, type BodyDto, type MeetingDto } from '@/lib/api';
import { EditMeetingForm } from './EditMeetingForm';

async function getMeeting(id: string, accessToken: string): Promise<MeetingDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getBodies(accessToken: string): Promise<BodyDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

type Props = { params: Promise<{ id: string }> };

export default async function EditMeetingPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canEdit = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR') || roles.includes('IC_DIVISION_HEAD');
  if (!canEdit) redirect('/unauthorized');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!accessToken) redirect('/login');

  let meeting: MeetingDto | null = null;
  let bodies: BodyDto[] = [];
  let meetingTypeOptions: { code: string; label: string }[] = [];
  try {
    const [apiMeeting, bodiesRes, refData] = await Promise.all([
      getMeeting(id, accessToken),
      getBodies(accessToken),
      getReferenceData(accessToken, 'meeting_type'),
    ]);
    meeting = apiMeeting ?? null;
    bodies = bodiesRes ?? [];
    meetingTypeOptions = refData ?? [];
  } catch {
    meeting = null;
  }

  if (!meeting) notFound();

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/meetings/${id}`}
          className="text-base font-medium text-slate-500 hover:text-slate-700"
        >
          ← Back to meeting
        </Link>
      </div>
      <div className="page-header">
        <h1 className="page-title">Edit meeting</h1>
        <p className="page-subtitle">
          Update title, dates, location, and other details for {meeting.title}.
        </p>
      </div>
      <div className="card">
        <div className="card-body">
          <EditMeetingForm
            meeting={meeting}
            bodies={bodies}
            meetingTypeOptions={meetingTypeOptions}
          />
        </div>
      </div>
    </>
  );
}
