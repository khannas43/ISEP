import Link from 'next/link';
import type { MeetingDto } from '@/lib/api';

type Props = {
  userName: string;
  managedMeetings: MeetingDto[];
  agendaItemsForConsolidation: number;
  overdueTasksCount: number;
  papersByStage: { title: string; stage: string }[];
  cgActivityCount: number;
};

/**
 * SCR-DASH-04 — Coordinator Dashboard.
 */
export function CODashboard({
  userName,
  managedMeetings,
  agendaItemsForConsolidation,
  overdueTasksCount,
  papersByStage,
  cgActivityCount,
}: Props) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Coordinator Dashboard</h1>
          <p className="page-subtitle">Welcome back, {userName}. Managed meetings, agenda consolidation, and tasks.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-slate-500">Managed meetings</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{managedMeetings.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-slate-500">Agenda items to consolidate</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{agendaItemsForConsolidation}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-slate-500">Overdue tasks</h3>
            <p className="mt-1 text-3xl font-semibold text-amber-600">{overdueTasksCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-slate-500">CG activity</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{cgActivityCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Managed meetings</h2>
            <Link href="/meetings" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="card-body">
            {managedMeetings.length === 0 ? (
              <p className="text-sm text-slate-500">No meetings assigned to you.</p>
            ) : (
              <ul className="space-y-2">
                {managedMeetings.slice(0, 5).map((m) => (
                  <li key={m.meetingId}>
                    <Link href={`/meetings/${m.meetingId}`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{m.title}</span>
                      <span className="text-xs text-slate-500">{m.startDate ? new Date(m.startDate).toLocaleDateString() : '—'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Papers by stage</h2>
            <Link href="/papers" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="card-body">
            {papersByStage.length === 0 ? (
              <p className="text-sm text-slate-500">No papers in workflow.</p>
            ) : (
              <ul className="space-y-2">
                {papersByStage.slice(0, 5).map((p) => (
                  <li key={`${p.title}-${p.stage}`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <span className="font-medium text-slate-800">{p.title}</span>
                    <span className="text-xs text-slate-500">{p.stage}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Quick links</h2>
          </div>
          <div className="card-body flex flex-wrap gap-3">
            <Link href="/meetings" className="btn-primary">Meetings</Link>
            <Link href="/meetings/create" className="btn-secondary">Create Meeting</Link>
            <Link href="/calendar" className="btn-secondary">Calendar</Link>
            <Link href="/correspondence-groups" className="btn-secondary">Correspondence groups</Link>
            <Link href="/tasks" className="btn-secondary">Tasks</Link>
          </div>
        </div>
      </div>
    </>
  );
}
