import Link from 'next/link';
import type { MeetingDto } from '@/lib/api';

type Props = {
  userName: string;
  upcomingMeetings: MeetingDto[];
  papersAwaitingApproval: { id: string; title: string; agingDays: number }[];
  participationSummary: { committeeName: string; meetingsCount: number }[];
  overdueEscalatedCount: number;
  pendingInterMinisterialCount: number;
};

/**
 * SCR-DASH-02 — IC Division Head Dashboard.
 * Landing page for IH role: papers awaiting approval (with aging), upcoming meetings,
 * participation summary across committees, overdue escalated, pending inter-ministerial approvals.
 */
export function IHDashboard({
  userName,
  upcomingMeetings,
  papersAwaitingApproval,
  participationSummary,
  overdueEscalatedCount,
  pendingInterMinisterialCount,
}: Props) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">IC Division Head Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {userName}. Papers, meetings, and approvals requiring your attention.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Papers awaiting your approval</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{papersAwaitingApproval.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Overdue escalated</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{overdueEscalatedCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Pending inter-ministerial</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{pendingInterMinisterialCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Upcoming meetings</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{upcomingMeetings.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Papers awaiting Division Head approval (with aging) */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Papers awaiting your approval</h2>
            <Link href="/reports" className="text-base font-medium text-blue-600 hover:underline" title="Reports / approval pipeline">
              View all
            </Link>
          </div>
          <div className="card-body">
            {papersAwaitingApproval.length === 0 ? (
              <p className="text-base text-slate-500">No papers currently awaiting your approval.</p>
            ) : (
              <ul className="space-y-2">
                {papersAwaitingApproval.map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <span className="font-medium text-slate-800">{p.title}</span>
                    <span className="text-sm text-slate-500">{p.agingDays}d</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-sm text-slate-400">Approval workflow (SCR-PAPER-03) — full list when approval service is connected.</p>
          </div>
        </div>

        {/* Upcoming meetings requiring attention */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Upcoming meetings</h2>
            <Link href="/meetings" className="text-base font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="card-body">
            {upcomingMeetings.length === 0 ? (
              <p className="text-base text-slate-500">No upcoming meetings in the next period.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingMeetings.slice(0, 5).map((m) => (
                  <li key={m.meetingId}>
                    <Link
                      href={`/meetings/${m.meetingId}`}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 transition-colors hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">{m.title}</span>
                      <span className="text-sm text-slate-500">{new Date(m.startDate).toLocaleDateString()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Participation summary across committees */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Participation summary</h2>
          </div>
          <div className="card-body">
            {participationSummary.length === 0 ? (
              <p className="text-base text-slate-500">No committee participation data yet.</p>
            ) : (
              <ul className="space-y-2">
                {participationSummary.map((s) => (
                  <li key={s.committeeName} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <span className="font-medium text-slate-800">{s.committeeName}</span>
                    <span className="text-base text-slate-500">{s.meetingsCount} meetings</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-sm text-slate-400">High-level view across all active committees (reporting service when connected).</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Quick links</h2>
          </div>
          <div className="card-body space-y-3">
            <Link
              href="/bodies"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">International Bodies / Committees</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/meetings"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">Meetings</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/documents"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">Document library</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">Admin</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
