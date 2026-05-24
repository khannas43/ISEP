import Link from 'next/link';
import type { MeetingDto } from '@/lib/api';

type Props = {
  userName: string;
  upcomingMeetings: MeetingDto[];
  papersInPipeline: { id: string; title: string; stage: string }[];
  delegationTasksCount: number;
  feedbackConsolidationCount: number;
  liveMeetingLink: string | null;
};

/**
 * SCR-DASH-03 — Delegation Leader Dashboard.
 */
export function DLDashboard({
  userName,
  upcomingMeetings,
  papersInPipeline,
  delegationTasksCount,
  feedbackConsolidationCount,
  liveMeetingLink,
}: Props) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Delegation Leader Dashboard</h1>
          <p className="page-subtitle">Welcome back, {userName}. Upcoming meetings, papers in pipeline, and delegation tasks.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Upcoming meetings</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{upcomingMeetings.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Papers in pipeline</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{papersInPipeline.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Delegation tasks</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{delegationTasksCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Feedback to consolidate</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{feedbackConsolidationCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Upcoming meetings</h2>
            <Link href="/meetings" className="text-base font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="card-body">
            {upcomingMeetings.length === 0 ? (
              <p className="text-base text-slate-500">No upcoming meetings.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingMeetings.slice(0, 5).map((m) => (
                  <li key={m.meetingId}>
                    <Link href={`/meetings/${m.meetingId}`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{m.title}</span>
                      <span className="text-sm text-slate-500">{m.startDate ? new Date(m.startDate).toLocaleDateString() : '—'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Papers in pipeline</h2>
            <Link href="/papers" className="text-base font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="card-body">
            {papersInPipeline.length === 0 ? (
              <p className="text-base text-slate-500">No papers in approval pipeline.</p>
            ) : (
              <ul className="space-y-2">
                {papersInPipeline.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link href={`/papers/${p.id}/approval`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{p.title}</span>
                      <span className="text-sm text-slate-500">{p.stage}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {liveMeetingLink && (
          <div className="card lg:col-span-2">
            <div className="card-body">
              <h2 className="text-base font-semibold text-slate-900">Live meeting</h2>
              <a href={liveMeetingLink} className="mt-2 inline-block text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Join live meeting →
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
