import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type MeetingDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { formatDisplayDate } from '@/lib/format';

async function getMeetings(accessToken: string): Promise<MeetingDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings?size=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  const content = data.content ?? [];
  const list = Array.isArray(content) ? content : [];
  return (list as MeetingDto[]).sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''));
}

function filterMeetingsByTitle(meetings: MeetingDto[], q: string): MeetingDto[] {
  if (!q?.trim()) return meetings;
  const lower = q.trim().toLowerCase();
  return meetings.filter(
    (m) =>
      (m.title ?? '').toLowerCase().includes(lower) ||
      (m.bodyName ?? '').toLowerCase().includes(lower)
  );
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function CalendarPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const params = await searchParams;
  const q = params.q ?? '';
  const accessToken = (session as { accessToken?: string }).accessToken;
  let allMeetings: MeetingDto[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      allMeetings = await getMeetings(accessToken);
    } catch {
      apiUnavailable = true;
    }
  }
  const meetings = filterMeetingsByTitle(allMeetings, q);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = meetings.filter((m) => (m.startDate ?? '') >= today);
  const past = meetings.filter((m) => (m.startDate ?? '') < today).slice(-20).reverse();

  return (
    <div>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <p className="page-subtitle">
          Meetings by date. Open a meeting for details, agenda, tasks, and documents.
        </p>
      </div>
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-700">Search</h2>
        </div>
        <div className="card-body">
          <form method="get" action="/calendar" className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Meeting title or body</span>
              <input type="search" name="q" defaultValue={q} placeholder="Search meetings…" className="input-base min-w-[220px]" />
            </label>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Upcoming meetings</h2>
          </div>
          <div className="card-body">
            {upcoming.length === 0 ? (
              <p className="text-slate-500">No upcoming meetings.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.slice(0, 15).map((m) => (
                  <li key={m.meetingId} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/30 px-3 py-2">
                    <div>
                      <Link href={`/meetings/${m.meetingId}`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                        {m.title}
                      </Link>
                      <p className="text-xs text-slate-500">{m.bodyName}</p>
                    </div>
                    <span className="shrink-0 text-sm text-slate-600">{formatDisplayDate(m.startDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Recent past meetings</h2>
          </div>
          <div className="card-body">
            {past.length === 0 ? (
              <p className="text-slate-500">No past meetings.</p>
            ) : (
              <ul className="space-y-2">
                {past.slice(0, 15).map((m) => (
                  <li key={m.meetingId} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/30 px-3 py-2">
                    <div>
                      <Link href={`/meetings/${m.meetingId}`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                        {m.title}
                      </Link>
                      <p className="text-xs text-slate-500">{m.bodyName}</p>
                    </div>
                    <span className="shrink-0 text-sm text-slate-500">{formatDisplayDate(m.startDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Link href="/meetings" className="text-sm font-medium text-blue-600 hover:underline">
          ← All meetings
        </Link>
      </div>
    </div>
  );
}
