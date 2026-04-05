import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getMeetingSummaryReport } from '@/lib/api';

type Props = { searchParams: Promise<{ meetingId?: string }> };

export default async function MeetingSummaryReportPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const params = await searchParams;
  const selectedMeetingId = params.meetingId;
  const accessToken = (session as { accessToken?: string }).accessToken;

  let meetings: Array<{ meetingId: string; title: string }> = [];
  if (accessToken) {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/meetings?size=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.content ?? [];
        meetings = (Array.isArray(content) ? content : []).map((m: { meetingId: string; title: string }) => ({ meetingId: m.meetingId, title: m.title }));
      }
    } catch {
      // fallback to mock
    }
  }
  let summary: Awaited<ReturnType<typeof getMeetingSummaryReport>> = null;
  if (accessToken && selectedMeetingId) {
    try {
      summary = await getMeetingSummaryReport(accessToken, selectedMeetingId);
    } catch {
      summary = null;
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/reports" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Reports</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Meeting summary report</h1>
          <p className="page-subtitle">Select a meeting to generate a report: agenda items, documents, positions, tasks, interventions, outcomes.</p>
          {summary && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-800">Summary</h2>
              <dl className="mt-2 grid gap-1 text-sm">
                <div><dt className="text-slate-500">Title</dt><dd className="font-medium">{summary.title}</dd></div>
                <div><dt className="text-slate-500">Body</dt><dd>{summary.bodyName ?? '—'}</dd></div>
                <div><dt className="text-slate-500">Dates</dt><dd>{summary.startDate} – {summary.endDate}</dd></div>
                <div><dt className="text-slate-500">Status</dt><dd>{summary.status}</dd></div>
                <div><dt className="text-slate-500">Agenda items</dt><dd>{summary.agendaItemsCount}</dd></div>
              </dl>
            </div>
          )}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Select a meeting to view summary (from API when backend is available):</p>
            <ul className="mt-2 space-y-1 text-sm">
              {meetings.map((m) => (
                <li key={m.meetingId}>
                  <Link href={`/reports/meeting-summary?meetingId=${encodeURIComponent(m.meetingId)}`} className="text-blue-600 hover:underline">
                    {m.title}
                  </Link>
                  {' · '}
                  <Link href={`/meetings/${m.meetingId}`} className="text-slate-500 hover:underline">Open meeting</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
