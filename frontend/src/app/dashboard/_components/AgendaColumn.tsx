'use client';

import { useRouter } from 'next/navigation';
import type { AgendaItem } from '../_types/dashboard.types';

const badgeClass: Record<string, string> = {
  RED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  AMBER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  GREEN: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  BLUE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
};

interface Props {
  meetingId: string | null;
  items: AgendaItem[];
  loading: boolean;
}

export function AgendaColumn({ meetingId, items, loading }: Props) {
  const router = useRouter();

  if (loading && items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-2 h-14 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-base dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Agenda overview</h3>
      <ul className="space-y-1">
        {items.map((item) => {
          const bc = badgeClass[item.statusSeverity] ?? badgeClass.BLUE;
          return (
            <li key={item.id}>
              <button
                type="button"
                disabled={!meetingId}
                onClick={() => meetingId && router.push(`/meetings/${meetingId}/agenda/${item.id}/`)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2.5 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
              >
                <span className="min-w-0 flex-1 leading-snug">
                  <span className="font-mono text-sm text-gray-400">{item.code}</span>{' '}
                  <span className="text-base font-medium text-gray-900 dark:text-gray-100">{item.title}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${bc}`}>{item.status}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {items.length === 0 && !loading && (
        <p className="py-4 text-base text-gray-500 dark:text-gray-400">No agenda items for this meeting.</p>
      )}
    </div>
  );
}
