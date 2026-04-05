'use client';

/**
 * Executive Dashboard — summarized view when no meeting is selected.
 * Shows: Meetings (In progress / Upcoming / Archived), Papers by stage, Task counts, Insights.
 */

import { useState } from 'react';
import Link from 'next/link';
import { formatDisplayDate } from '@/lib/format';
import type { MeetingDto } from '@/lib/api';
import { RoleGuard } from '@/components/rbac/RoleGuard';
import { MeetingCalendarSidebar } from '@/components/calendar/MeetingCalendarSidebar';
import { DashboardRoleTodoSections } from '@/components/dashboard/DashboardRoleTodoSections';

const T = {
  bg: '#F0F4FF',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  navy: '#0E2348',
  blue: '#2563EB',
  green: '#059669',
  amber: '#D97706',
  red: '#DC2626',
  muted: '#64748B',
  text: '#0F172A',
};

type PapersByStage = { draft: number; inReview: number; finalized: number };
type TaskCounts = { overdue: number; dueSoon: number; myPending: number };

type Props = {
  inProgress: MeetingDto[];
  upcoming: MeetingDto[];
  archived: MeetingDto[];
  papersByStage: PapersByStage;
  taskCounts: TaskCounts;
  insights: string[];
  meetingsForDetail: MeetingDto[];
  accessToken?: string;
  primaryRealmRole?: string;
  currentUserId?: string;
};

function meetingIdOf(m: MeetingDto): string {
  const id = (m as { meetingId?: string }).meetingId;
  return typeof id === 'string' ? id : String(id);
}

function CollapsibleSection({
  id,
  title,
  count,
  children,
  defaultOpen,
}: {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-900 bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className={`inline-block w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
          {title}
        </span>
        <span className="text-sm font-normal text-slate-500">{count} meeting{count !== 1 ? 's' : ''}</span>
      </button>
      {open && <div className="border-t border-slate-100">{children}</div>}
    </section>
  );
}

function MeetingRow({ meeting }: { meeting: MeetingDto }) {
  const id = meetingIdOf(meeting);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3 px-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
      <div className="min-w-0 flex-1">
        <Link href={`/meetings/${id}`} className="font-medium text-slate-900 hover:text-blue-600 truncate block">
          {meeting.title}
        </Link>
        <p className="text-sm text-slate-500 mt-0.5">
          {meeting.bodyName} · {formatDisplayDate(meeting.startDate)} – {formatDisplayDate(meeting.endDate)}
        </p>
      </div>
      <Link
        href={`/dashboard/executive?meetingId=${encodeURIComponent(id)}`}
        className="text-sm font-medium text-blue-600 hover:underline flex-shrink-0"
      >
        Executive view →
      </Link>
    </div>
  );
}

export function ExecutiveDashboardSummary({
  inProgress,
  upcoming,
  archived,
  papersByStage,
  taskCounts,
  insights,
  meetingsForDetail,
  accessToken,
  primaryRealmRole,
  currentUserId,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: T.bg }}>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">Summarized view of meetings, papers, and actions. Select a meeting for the detailed preparedness view.</p>
        </div>

        {/* Insights block */}
        {insights.length > 0 && (
          <div
            className="rounded-xl border px-5 py-4 mb-6"
            style={{ background: 'linear-gradient(135deg, #0E2348 0%, #1A3B6F 100%)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <h2 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-3">Insights</h2>
            <ul className="space-y-2">
              {insights.map((line, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/85">
                  <span className="text-emerald-300">•</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {accessToken && primaryRealmRole && currentUserId && (
          <DashboardRoleTodoSections
            accessToken={accessToken}
            realmRole={primaryRealmRole}
            currentUserId={currentUserId}
          />
        )}

        {/* Meetings — 3 collapsible sections */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-slate-900">Meetings</h2>
          <CollapsibleSection id="in-progress" title="Meetings in progress" count={inProgress.length} defaultOpen={false}>
            {inProgress.length === 0 ? (
              <p className="py-4 px-5 text-sm text-slate-500">No meetings in progress.</p>
            ) : (
              inProgress.map((m) => <MeetingRow key={meetingIdOf(m)} meeting={m} />)
            )}
          </CollapsibleSection>
          <CollapsibleSection id="upcoming" title="Upcoming meetings" count={upcoming.length} defaultOpen={false}>
            {upcoming.length === 0 ? (
              <p className="py-4 px-5 text-sm text-slate-500">No upcoming meetings.</p>
            ) : (
              upcoming.map((m) => <MeetingRow key={meetingIdOf(m)} meeting={m} />)
            )}
          </CollapsibleSection>
          <CollapsibleSection id="archived" title="Archived meetings" count={archived.length} defaultOpen={false}>
            {archived.length === 0 ? (
              <p className="py-4 px-5 text-sm text-slate-500">No archived meetings.</p>
            ) : (
              archived.map((m) => <MeetingRow key={meetingIdOf(m)} meeting={m} />)
            )}
          </CollapsibleSection>
        </div>

        {/* Papers by stage */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Papers by stage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 bg-amber-50/50 p-4">
              <div className="text-2xl font-bold text-amber-700">{papersByStage.draft}</div>
              <div className="text-sm font-medium text-slate-700">Draft</div>
              <Link href="/papers" className="text-xs text-amber-700 hover:underline mt-1 inline-block">View papers →</Link>
            </div>
            <div className="rounded-lg border border-slate-200 bg-blue-50/50 p-4">
              <div className="text-2xl font-bold text-blue-700">{papersByStage.inReview}</div>
              <div className="text-sm font-medium text-slate-700">In review</div>
              <Link href="/papers" className="text-xs text-blue-700 hover:underline mt-1 inline-block">View papers →</Link>
            </div>
            <div className="rounded-lg border border-slate-200 bg-emerald-50/50 p-4">
              <div className="text-2xl font-bold text-emerald-700">{papersByStage.finalized}</div>
              <div className="text-sm font-medium text-slate-700">Finalized</div>
              <Link href="/papers" className="text-xs text-emerald-700 hover:underline mt-1 inline-block">View papers →</Link>
            </div>
          </div>
        </div>

        {/* Tasks / Actions counts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Tasks & actions</h2>
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="text-2xl font-bold text-red-600">{taskCounts.overdue}</span>
              <span className="ml-2 text-sm text-slate-600">Overdue</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-amber-600">{taskCounts.dueSoon}</span>
              <span className="ml-2 text-sm text-slate-600">Due soon</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">{taskCounts.myPending}</span>
              <span className="ml-2 text-sm text-slate-600">My pending</span>
            </div>
          </div>
          <Link href="/tasks/my" className="text-sm font-medium text-blue-600 hover:underline mt-3 inline-block">
            View my tasks →
          </Link>
        </div>

        {/* Select a meeting for detailed view */}
        {meetingsForDetail.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Select a meeting for detailed view</h2>
            <p className="text-sm text-slate-500 mb-4">Open the full Executive Dashboard (agenda readiness, paper pipeline, delegation) for a specific meeting.</p>
            <ul className="space-y-2">
              {meetingsForDetail.slice(0, 15).map((m) => {
                const id = meetingIdOf(m);
                return (
                  <li key={id}>
                    <Link
                      href={`/dashboard/executive?meetingId=${encodeURIComponent(id)}`}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-50 font-medium text-slate-900"
                    >
                      {m.title}
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        {m.bodyName} · {formatDisplayDate(m.startDate)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {meetingsForDetail.length > 15 && (
              <p className="text-sm text-slate-500 mt-2">… and {meetingsForDetail.length - 15} more. Use Meetings list to find others.</p>
            )}
          </div>
        )}

        </div>
      </div>
      <RoleGuard
        allowedRoles={['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR']}
      >
        <aside className="hidden shrink-0 border-l border-slate-200 bg-white/50 px-4 py-8 lg:block lg:w-72">
          <MeetingCalendarSidebar />
        </aside>
      </RoleGuard>
    </div>
  );
}
