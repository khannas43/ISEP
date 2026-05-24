'use client';

import Link from 'next/link';
import { useDashboard } from '../_hooks/useDashboard';
import { ActionsColumn } from './ActionsColumn';
import { AgendaColumn } from './AgendaColumn';
import { MeetingTimelineStrip } from './MeetingTimelineStrip';
import { MpiRing } from './MpiRing';
import { PipelineColumn } from './PipelineColumn';
import { ProjectionStrip } from './ProjectionStrip';

function DashboardErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
      role="alert"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-red-100 px-3 py-2 text-base font-medium text-red-900 hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-red-900/50 dark:text-red-100 dark:hover:bg-red-900"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyMeetingsState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center dark:border-gray-600 dark:bg-gray-900/50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="mb-4 h-14 w-14 text-gray-400"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
        />
      </svg>
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">No upcoming meetings</h2>
      <p className="mt-2 max-w-md text-base text-gray-600 dark:text-gray-400">
        No IMO sessions are currently scheduled in PLANNED or ACTIVE status.
      </p>
    </div>
  );
}

export function WarRoomDashboard() {
  const {
    meetings,
    selectedId,
    setSelectedId,
    detail,
    loadingList,
    loadingDetail,
    error,
    refetch,
    role,
  } = useDashboard();

  const showMain = meetings.length > 0;

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title">IMO Meetings</h1>
        <Link
          href="/dashboard/executive/"
          className="text-base font-medium text-[var(--navy-600)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Executive summary →
        </Link>
      </div>

      <MeetingTimelineStrip
        meetings={meetings}
        selectedId={selectedId}
        onSelect={setSelectedId}
        loading={loadingList}
      />

      {error && <DashboardErrorBanner message={error} onRetry={refetch} />}

      {!loadingList && !showMain && <EmptyMeetingsState />}

      {showMain && (
        <>
          <MpiRing mpi={detail?.mpi ?? null} loading={loadingDetail && !detail} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ActionsColumn tasks={detail?.myTasks ?? []} role={role} loading={loadingDetail} />
            <PipelineColumn items={detail?.pipeline ?? []} loading={loadingDetail} />
            <AgendaColumn meetingId={selectedId} items={detail?.agendaItems ?? []} loading={loadingDetail} />
          </div>

          <ProjectionStrip
            meetingCode={detail?.summary?.code ?? null}
            text={detail?.mpi?.projection ?? null}
            loading={loadingDetail && !detail}
          />
        </>
      )}
    </div>
  );
}
