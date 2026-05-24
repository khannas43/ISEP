'use client';

import { useRouter } from 'next/navigation';
import type { MpiStatus, PipelineItem } from '../_types/dashboard.types';

const statusColor: Record<MpiStatus, string> = {
  GREEN: '#639922',
  AMBER: '#EF9F27',
  RED: '#E24B4A',
};

interface Props {
  items: PipelineItem[];
  loading: boolean;
}

export function PipelineColumn({ items, loading }: Props) {
  const router = useRouter();
  const inProgress = items.filter((i) => i.progressPct < 100).length;

  if (loading && items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 h-5 w-44 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-3 h-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-base dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Pipeline status</h3>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          {inProgress} in progress
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item) => {
          const bar = statusColor[item.status];
          const stageClass =
            item.status === 'RED' ? 'text-red-600 dark:text-red-400' : item.progressPct >= 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300';
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => router.push(`/papers/${item.id}/view/`)}
                className="w-full rounded-lg px-1 py-2.5 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-800"
              >
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                <div className={`text-sm ${stageClass}`}>{item.currentStage}</div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full" style={{ width: `${item.progressPct}%`, backgroundColor: bar }} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {items.length === 0 && !loading && (
        <p className="py-4 text-base text-gray-500 dark:text-gray-400">No papers in the pipeline for this meeting.</p>
      )}
    </div>
  );
}
