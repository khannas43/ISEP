'use client';

/**
 * Executive Dashboard — summarized view when no meeting is selected (Batch 12 navy / white layout).
 */

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { formatDisplayDate } from '@/lib/format';
import type { MeetingDto } from '@/lib/api';
import { RoleGuard } from '@/components/rbac/RoleGuard';
import { MeetingCalendarSidebar } from '@/components/calendar/MeetingCalendarSidebar';
import { DashboardRoleTodoSections } from '@/components/dashboard/DashboardRoleTodoSections';

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
  userDisplayName?: string;
  userRoleLabel?: string;
};

function meetingIdOf(m: MeetingDto): string {
  const id = (m as { meetingId?: string }).meetingId;
  return typeof id === 'string' ? id : String(id);
}

function meetingLeftAccent(status: string | undefined): string {
  const s = (status ?? '').toUpperCase();
  if (s === 'ACTIVE') return 'var(--success)';
  if (s === 'CONCLUDED' || s === 'ARCHIVED') return 'var(--slate-300)';
  return 'var(--navy-400)';
}

function StatCard({
  count,
  label,
  href,
  linkLabel,
}: {
  count: number;
  label: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div
      className="min-w-[160px] flex-1 rounded-lg border border-[var(--slate-200)] bg-white px-6 py-5 shadow-sm"
      style={{ borderTop: '3px solid var(--navy-600)' }}
    >
      <div
        className="text-[32px] font-bold leading-none text-[var(--navy-700)]"
        style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
      >
        {count}
      </div>
      <div className="mt-1.5 text-xs font-medium uppercase tracking-wide text-[var(--slate-500)]">{label}</div>
      <Link href={href} className="mt-3 inline-block text-xs font-medium text-[var(--navy-500)] hover:underline">
        {linkLabel} →
      </Link>
    </div>
  );
}

function MeetingCard({ meeting }: { meeting: MeetingDto }) {
  const id = meetingIdOf(meeting);
  const loc = meeting.location?.trim();
  const when = `${formatDisplayDate(meeting.startDate)}${loc ? ` · ${loc}` : ''}`;
  return (
    <div
      className="rounded-lg border border-[var(--slate-200)] bg-white shadow-sm"
      style={{ borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: meetingLeftAccent(meeting.status) }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--navy-100)] px-2.5 py-0.5 text-xs font-semibold text-[var(--navy-800)]">
              {meeting.bodyName ?? 'Committee'}
            </span>
            {meeting.status && (
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--slate-500)]">{meeting.status}</span>
            )}
          </div>
          <Link href={`/meetings/${id}`} className="block font-semibold text-[var(--navy-800)] hover:text-[var(--navy-600)]">
            {meeting.title}
          </Link>
          <p className="mt-1 text-sm text-[var(--slate-500)]">{when}</p>
        </div>
        <Link
          href={`/dashboard/executive?meetingId=${encodeURIComponent(id)}`}
          className="shrink-0 text-sm font-medium text-[var(--navy-500)] hover:underline"
        >
          Executive view →
        </Link>
      </div>
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
  userDisplayName = 'User',
  userRoleLabel = '',
}: Props) {
  const dateLine = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const [meetingsTab, setMeetingsTab] = useState<'inProgress' | 'upcoming' | 'archived'>('inProgress');
  const tabMeetings =
    meetingsTab === 'inProgress' ? inProgress : meetingsTab === 'upcoming' ? upcoming : archived;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--slate-50)] lg:flex-row">
      <div className="min-w-0 flex-1">
        <header
          className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--slate-200)] bg-white px-6 py-4 sm:px-8"
        >
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <Image
              src="/dgs-logo-dark.png"
              alt=""
              width={40}
              height={40}
              className="mt-0.5 hidden shrink-0 rounded-full object-cover sm:block"
            />
            <div className="min-w-0">
              <h1
                className="text-[22px] font-bold text-[var(--navy-800)]"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Dashboard
              </h1>
              <p className="mt-0.5 text-sm text-[var(--slate-500)]">
                IMO Strategic Engagement Platform · {dateLine}
              </p>
            </div>
          </div>
          <div
            className="rounded-full border border-[var(--navy-200)] bg-[var(--navy-50)] px-3.5 py-1.5 text-xs font-semibold text-[var(--navy-700)]"
          >
            {userDisplayName}
            {userRoleLabel ? ` · ${userRoleLabel}` : ''}
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-8">
          {insights.length > 0 && (
            <div className="mb-6 rounded-lg border border-[var(--slate-200)] bg-white px-5 py-4 shadow-sm">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--navy-700)]">Summary</h2>
              <ul className="space-y-1.5 text-sm text-[var(--slate-700)]">
                {insights.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[var(--navy-500)]">•</span>
                    <span>{line}</span>
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

          <div className="mb-8 flex flex-wrap gap-4">
            <StatCard count={papersByStage.draft} label="Draft papers" href="/papers" linkLabel="View papers" />
            <StatCard count={papersByStage.inReview} label="In review" href="/papers" linkLabel="View papers" />
            <StatCard count={papersByStage.finalized} label="Finalized" href="/papers" linkLabel="View papers" />
          </div>

          <div className="mb-8 flex flex-wrap gap-4">
            <StatCard count={taskCounts.overdue} label="Overdue actions" href="/tasks/my" linkLabel="My tasks" />
            <StatCard count={taskCounts.dueSoon} label="Due soon" href="/tasks/my" linkLabel="My tasks" />
            <StatCard count={taskCounts.myPending} label="My pending" href="/tasks/my" linkLabel="My tasks" />
          </div>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-[var(--navy-800)]">Meetings</h2>
            <div className="mb-4 flex flex-wrap gap-2 border-b border-[var(--slate-200)] pb-2">
              {(
                [
                  { id: 'inProgress' as const, label: 'In progress', count: inProgress.length },
                  { id: 'upcoming' as const, label: 'Upcoming', count: upcoming.length },
                  { id: 'archived' as const, label: 'Archived', count: archived.length },
                ]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMeetingsTab(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    meetingsTab === tab.id
                      ? 'bg-[var(--navy-600)] text-white'
                      : 'bg-white text-[var(--slate-600)] ring-1 ring-[var(--slate-200)] hover:bg-[var(--slate-50)]'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {tabMeetings.length === 0 ? (
                <p className="rounded-lg border border-[var(--slate-200)] bg-white px-4 py-6 text-sm text-[var(--slate-500)]">
                  No meetings in this category.
                </p>
              ) : (
                tabMeetings.map((m) => <MeetingCard key={meetingIdOf(m)} meeting={m} />)
              )}
            </div>
          </section>

          {meetingsForDetail.length > 0 && (
            <section className="rounded-lg border border-[var(--slate-200)] bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-lg font-semibold text-[var(--navy-800)]">Quick open — detailed view</h2>
              <p className="mb-4 text-sm text-[var(--slate-500)]">
                Open the full Executive Dashboard (readiness, pipeline, delegation) for a meeting.
              </p>
              <ul className="space-y-2">
                {meetingsForDetail.slice(0, 15).map((m) => {
                  const id = meetingIdOf(m);
                  return (
                    <li key={id}>
                      <Link
                        href={`/dashboard/executive?meetingId=${encodeURIComponent(id)}`}
                        className="block rounded-md px-3 py-2 font-medium text-[var(--navy-800)] hover:bg-[var(--slate-50)]"
                      >
                        {m.title}
                        <span className="ml-2 text-sm font-normal text-[var(--slate-500)]">
                          {m.bodyName} · {formatDisplayDate(m.startDate)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {meetingsForDetail.length > 15 && (
                <p className="mt-3 text-sm text-[var(--slate-500)]">
                  … and {meetingsForDetail.length - 15} more. Use the Meetings list to find others.
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR']}>
        <aside className="hidden shrink-0 border-l border-[var(--slate-200)] bg-white px-4 py-8 lg:block lg:w-72">
          <MeetingCalendarSidebar />
        </aside>
      </RoleGuard>
    </div>
  );
}
