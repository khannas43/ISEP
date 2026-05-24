'use client';

import type { MeetingStatusHistoryEntry } from '@/lib/api';

type Props = { entries: MeetingStatusHistoryEntry[] };

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function formatStatus(s: string): string {
  return s.replace(/_/g, ' ');
}

export function HistoryTab({ entries }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="text-lg font-semibold text-slate-900">Timeline / History</h2>
        <p className="mt-1 text-base text-slate-500">
          Chronological audit trail of meeting status changes. Read-only.
        </p>

        {sorted.length === 0 ? (
          <p className="mt-4 text-slate-500">No status changes recorded yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sorted.map((entry) => (
              <li
                key={entry.entryId}
                className="flex gap-4 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-base">
                    <span className="font-medium text-slate-900">
                      {entry.changedByName ?? entry.changedBy}
                    </span>
                    <span className="text-slate-500">changed status</span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-sm text-slate-700">
                      {formatStatus(entry.fromStatus)}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-sm text-slate-700">
                      {formatStatus(entry.toStatus)}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="mt-1 text-base text-slate-600">{entry.notes}</p>
                  )}
                </div>
                <time
                  className="shrink-0 text-sm text-slate-500"
                  dateTime={entry.changedAt}
                >
                  {formatDate(entry.changedAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
