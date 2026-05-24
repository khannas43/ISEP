import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getReferenceData, type BodyDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { MeetingForm } from '../MeetingForm';

async function getBodies(accessToken: string): Promise<BodyDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function CreateMeetingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canCreate =
    roles.includes('SYSTEM_ADMIN') ||
    roles.includes('COORDINATOR') ||
    (roles.length === 0 && process.env.NODE_ENV === 'development');
  if (!canCreate) redirect('/unauthorized');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let bodies: BodyDto[] = [];
  let meetingTypeOptions: { code: string; label: string }[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      const [bodiesRes, refData] = await Promise.all([
        getBodies(accessToken),
        getReferenceData(accessToken, 'meeting_type'),
      ]);
      bodies = bodiesRes ?? [];
      meetingTypeOptions = refData ?? [];
    } catch {
      apiUnavailable = true;
    }
  }

  return (
    <>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="mb-6">
        <Link href="/meetings" className="text-base font-medium text-slate-500 hover:text-slate-700">← Back to Meetings</Link>
      </div>
      <div className="page-header">
        <h1 className="page-title">Create Meeting</h1>
        <p className="page-subtitle">Create a new meeting under an international body.</p>
      </div>
      <div className="card">
        <div className="card-body">
          <MeetingForm bodies={bodies} meetingTypeOptions={meetingTypeOptions} />
        </div>
      </div>
    </>
  );
}
