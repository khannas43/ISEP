'use client';

import { useRouter } from 'next/navigation';
import type { MyTask } from '../_types/dashboard.types';

const maxTasks: Record<string, number> = {
  SYSTEM_ADMIN: 5,
  IC_DIVISION_HEAD: 5,
  DELEGATION_LEADER: 4,
  COORDINATOR: 3,
  MEMBER: 2,
  VIEWER: 2,
};

interface Props {
  tasks: MyTask[];
  role: string;
  loading: boolean;
}

export function ActionsColumn({ tasks, role, loading }: Props) {
  const router = useRouter();
  const cap = maxTasks[role] ?? 3;
  const visible = tasks.filter((t) => !t.completed).slice(0, cap);
  const completedShown = tasks.filter((t) => t.completed).slice(0, Math.max(0, cap - visible.length));
  const rows = [...visible, ...completedShown].slice(0, cap);
  const overdueCount = tasks.filter((t) => !t.completed && t.overdue).length;
  const pendingCount = tasks.filter((t) => !t.completed && !t.overdue).length;
  const allDone = tasks.length > 0 && tasks.every((t) => t.completed);

  let badge: { text: string; className: string };
  if (tasks.length === 0) {
    badge = {
      text: 'No tasks',
      className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    };
  } else if (overdueCount > 0) {
    badge = { text: `${overdueCount} overdue`, className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' };
  } else if (allDone) {
    badge = { text: 'On track', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' };
  } else {
    badge = {
      text: `${pendingCount} pending`,
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    };
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 h-5 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-2 h-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-base dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">My actions</h3>
        <span className={`rounded-full px-2.5 py-1 text-sm font-medium ${badge.className}`}>{badge.text}</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-4 text-base text-gray-500 dark:text-gray-400">No actions assigned to you for this meeting.</p>
      ) : (
        <ul aria-label="My pending actions" className="space-y-1">
          {rows.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => router.push(`/tasks/${t.id}/`)}
                className="flex w-full items-start gap-3 rounded-lg px-1 py-2.5 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-800"
              >
                <span
                  className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                    t.completed ? 'bg-gray-300 dark:bg-gray-600' : t.severity === 'RED' ? 'bg-red-500' : t.severity === 'AMBER' ? 'bg-amber-400' : 'bg-green-600'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">{t.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.agendaRef}</div>
                  {t.completed ? (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Done</span>
                  ) : (
                    <div className={`font-mono text-sm ${t.overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                      {t.overdue && t.dueDate ? '−' : ''}
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'No due date'}
                    </div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
