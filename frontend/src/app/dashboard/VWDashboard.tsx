import Link from 'next/link';
import type { MeetingDto } from '@/lib/api';

type Props = {
  userName: string;
  activeMeetings: MeetingDto[];
  finalizedDocsCount: number;
  scheduleSummary: string;
};

/**
 * SCR-DASH-06 — Viewer Dashboard (read-only).
 */
export function VWDashboard({ userName, activeMeetings, finalizedDocsCount, scheduleSummary }: Props) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Viewer Dashboard</h1>
          <p className="page-subtitle">Welcome, {userName}. Read-only view of active meetings, finalized documents, and schedule.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Active meetings</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{activeMeetings.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Finalized documents</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{finalizedDocsCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Active meetings</h2>
            <Link href="/meetings" className="text-base font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="card-body">
            {activeMeetings.length === 0 ? (
              <p className="text-base text-slate-500">No active meetings.</p>
            ) : (
              <ul className="space-y-2">
                {activeMeetings.slice(0, 8).map((m) => (
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
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Schedule & outcomes</h2>
          </div>
          <div className="card-body">
            <p className="text-base text-slate-600">{scheduleSummary}</p>
            <p className="mt-4">
              <Link href="/calendar" className="text-base font-medium text-blue-600 hover:underline">View calendar →</Link>
            </p>
            <p className="mt-2">
              <Link href="/documents" className="text-base font-medium text-blue-600 hover:underline">Document library →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
