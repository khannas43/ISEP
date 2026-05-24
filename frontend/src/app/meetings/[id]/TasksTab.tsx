'use client';

import Link from 'next/link';
import type { TaskDto } from '@/lib/api';
import { formatDisplayDate } from '@/lib/format';

type Props = { meetingId: string; tasks: TaskDto[]; canCreate?: boolean };

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return formatDisplayDate(dateStr);
  } catch {
    return dateStr;
  }
}

function statusBadge(s: string): string {
  const map: Record<string, string> = {
    CREATED: 'badge badge-neutral',
    ASSIGNED: 'badge badge-info',
    IN_PROGRESS: 'badge badge-info',
    SUBMITTED: 'badge badge-success',
    REVIEWED: 'badge badge-success',
    CLOSED: 'badge badge-neutral',
  };
  return map[s] ?? 'badge badge-neutral';
}

export function TasksTab({ meetingId, tasks, canCreate }: Props) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
            <p className="mt-1 text-base text-slate-500">Tasks linked to this meeting.</p>
          </div>
          {canCreate && (
            <Link href={`/meetings/${meetingId}/tasks/new`} className="btn-primary">
              Create task
            </Link>
          )}
        </div>
        {tasks.length === 0 ? (
          <p className="mt-4 text-slate-500">No tasks linked to this meeting yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-base">
              <thead>
                <tr>
                  <th className="table-header px-4 py-2.5 text-left">Title</th>
                  <th className="table-header px-4 py-2.5 text-left">Description</th>
                  <th className="table-header px-4 py-2.5 text-left">Assigned to</th>
                  <th className="table-header px-4 py-2.5 text-left">Priority</th>
                  <th className="table-header px-4 py-2.5 text-left">Due date</th>
                  <th className="table-header px-4 py-2.5 text-left">Status</th>
                  <th className="table-header px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tasks.map((t) => (
                  <tr key={t.taskId} className="hover:bg-slate-50/50">
                    <td className="table-cell font-medium text-slate-900">
                      <Link href={`/meetings/${meetingId}/tasks/${t.taskId}`} className="text-blue-600 hover:underline">
                        {t.title}
                      </Link>
                    </td>
                    <td className="table-cell text-slate-600">{t.description ?? '—'}</td>
                    <td className="table-cell text-slate-600">{t.assignedToName ?? '—'}</td>
                    <td className="table-cell text-slate-600">{t.priority}</td>
                    <td className="table-cell text-slate-600">{formatDate(t.dueDate)}</td>
                    <td className="table-cell">
                      <span className={statusBadge(t.status)}>{t.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="table-cell text-right">
                      <Link href={`/meetings/${meetingId}/tasks/${t.taskId}`} className="text-base font-medium text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
