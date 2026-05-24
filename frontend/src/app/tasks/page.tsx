import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type MeetingDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { formatDisplayDate } from '@/lib/format';

async function getMeetings(accessToken: string): Promise<MeetingDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings?size=50`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  const content = data.content ?? [];
  const list = Array.isArray(content) ? content : [];
  return (list as MeetingDto[]).sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));
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

export default async function TasksPage({ searchParams }: Props) {
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

  return (
    <div>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <p className="page-subtitle">
          Tasks are managed per meeting. Open a meeting to view, create, or update tasks.
        </p>
      </div>
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-700">Search</h2>
        </div>
        <div className="card-body">
          <form method="get" action="/tasks" className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-600">Meeting title or body</span>
              <input type="search" name="q" defaultValue={q} placeholder="Search meetings…" className="input-base min-w-[220px]" />
            </label>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          {meetings.length === 0 ? (
            <p className="text-slate-500">{q ? 'No meetings match your search.' : 'No meetings yet. Create a meeting from the Meetings list to add tasks.'}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-base">
                <thead>
                  <tr>
                    <th className="table-header px-4 py-2.5 text-left">Meeting</th>
                    <th className="table-header px-4 py-2.5 text-left">Body</th>
                    <th className="table-header px-4 py-2.5 text-left">Start date</th>
                    <th className="table-header px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {meetings.map((m) => (
                    <tr key={m.meetingId} className="hover:bg-slate-50/50">
                      <td className="table-cell font-medium text-slate-900">{m.title}</td>
                      <td className="table-cell text-slate-600">{m.bodyName ?? '—'}</td>
                      <td className="table-cell text-slate-600">{formatDisplayDate(m.startDate)}</td>
                      <td className="table-cell text-right">
                        <Link href={`/meetings/${m.meetingId}?tab=tasks`} className="text-blue-600 hover:underline">
                          Open tasks →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link href="/meetings" className="text-base font-medium text-blue-600 hover:underline">
              ← All meetings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
