'use client';

import type { KeyboardEvent } from 'react';
import type { MeetingSummary, MpiStatus } from '../_types/dashboard.types';

const statusColor: Record<MpiStatus, string> = {
  GREEN: '#639922',
  AMBER: '#EF9F27',
  RED: '#E24B4A',
};

interface Props {
  meetings: MeetingSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export function MeetingTimelineStrip({ meetings, selectedId, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-52 w-40 shrink-0 animate-pulse rounded-xl bg-gray-200 md:w-52 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Upcoming IMO meetings"
    >
      {meetings.map((m) => {
        const days = Math.ceil(
          (new Date(m.startDate).getTime() - Date.now()) / 86_400_000
        );
        const isPast = days <= 0;
        const daysLabel = isPast ? 'Past' : String(days);
        const daysUnit = isPast ? '' : 'd';
        const daysColorClass = isPast
          ? 'text-gray-400 dark:text-gray-600'
          : days < 14
            ? 'text-red-600'
            : days < 30
              ? 'text-amber-500'
              : 'text-green-700';
        const selected = m.id === selectedId;
        const barColor = statusColor[m.mpiStatus];
        const onKey = (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(m.id);
          }
        };
        return (
          <button
            key={m.id}
            type="button"
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            onClick={() => onSelect(m.id)}
            onKeyDown={onKey}
            className={`w-40 shrink-0 rounded-xl border bg-white p-4 text-left text-base transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:w-52 dark:bg-gray-900 ${
              selected
                ? 'border-gray-400 shadow-md ring-2 ring-blue-500/30 dark:border-gray-500'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            style={{
              borderTopWidth: 2,
              borderTopColor: selected ? (isPast ? '#9ca3af' : barColor) : 'transparent',
            }}
          >
            <p className={`font-mono text-3xl font-semibold ${daysColorClass}`}>
              {daysLabel}
              {daysUnit}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">to meeting</p>
            <p className="mt-2 line-clamp-2 text-base font-medium leading-snug text-gray-900 dark:text-gray-100">
              {m.code} · {m.name}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {new Date(m.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
              {m.location.split('·')[0]?.trim() ?? m.location}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-base font-semibold" style={{ color: barColor }}>
                {m.mpiScore}
              </span>
              <span
                className="rounded px-2 py-0.5 text-xs font-semibold uppercase text-white"
                style={{ backgroundColor: barColor }}
              >
                {m.mpiStatus}
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-full rounded-full" style={{ width: `${m.mpiScore}%`, backgroundColor: barColor }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
