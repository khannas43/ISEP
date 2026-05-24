'use client';

import type { MeetingSummary } from '../_types/dashboard.types';
import { parseMeetingStartInstant, useCountdown } from '../_hooks/useCountdown';

interface Props {
  meeting: MeetingSummary | null;
  loading: boolean;
}

function formatStartDate(iso: string): string {
  const d = parseMeetingStartInstant(iso);
  if (!d) return '';
  return d.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MeetingContextBar({ meeting, loading }: Props) {
  const cd = useCountdown(meeting?.startDate ?? null);

  if (loading && !meeting) {
    return <div className="h-28 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />;
  }

  if (!meeting) {
    return null;
  }

  const startLabel = formatStartDate(meeting.startDate);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 text-base dark:border-gray-700 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {meeting.code} · {meeting.location}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{meeting.name}</h2>
        <p className="mt-1 text-base font-medium text-gray-700 dark:text-gray-200">{meeting.session}</p>
        {startLabel ? (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Starts: {startLabel}</p>
        ) : null}
      </div>
      <div className="shrink-0 md:text-right">
        <time dateTime={meeting.startDate} className="block md:text-right">
          <span className="mb-3 block text-sm font-medium text-gray-500 dark:text-gray-400">
            Days : Hours : Minutes left
          </span>
          <div
            className="inline-grid grid-cols-[auto_auto_auto_auto_auto] items-end gap-x-2 gap-y-1 text-center font-mono text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100 md:text-3xl"
            aria-label={
              cd.isPastOrNow
                ? 'Meeting start time reached; no time remaining until start'
                : `${cd.days} days, ${cd.hours} hours, ${cd.minutes} minutes left until meeting starts`
            }
          >
            <span className="row-start-1">{cd.days}</span>
            <span className="row-start-1 pb-0.5 text-lg leading-none text-gray-400 dark:text-gray-500 md:text-xl" aria-hidden>
              :
            </span>
            <span className="row-start-1">{cd.hours}</span>
            <span className="row-start-1 pb-0.5 text-lg leading-none text-gray-400 dark:text-gray-500 md:text-xl" aria-hidden>
              :
            </span>
            <span className="row-start-1">{cd.minutes}</span>
            <span className="row-start-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Days
            </span>
            <span className="row-start-2" aria-hidden />
            <span className="row-start-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Hours
            </span>
            <span className="row-start-2" aria-hidden />
            <span className="row-start-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Minutes
            </span>
          </div>
        </time>
      </div>
    </div>
  );
}
