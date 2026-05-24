'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/client';

export type TaskCardModel = {
  taskId: string;
  title: string;
  meetingId: string | null;
  /** Display label e.g. meeting title or short id */
  meetingLabel?: string | null;
  agendaItemNumber?: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  isOverdue?: boolean | null;
  escalatedAt?: string | null;
};

type Props = { task: TaskCardModel };

function formatDue(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium' });
  } catch {
    return iso;
  }
}

export function TaskCard({ task }: Props) {
  const { t } = useTranslation('common');
  const overdue = Boolean(task.isOverdue);
  const escalated = Boolean(task.escalatedAt) || task.status === 'ESCALATED';
  const border =
    overdue ? 'border-l-4 border-l-red-500' : escalated ? 'border-l-4 border-l-amber-500' : 'border-l-[3px] border-l-transparent';

  return (
    <Link
      href={`/tasks/${task.taskId}`}
      className={`block rounded-lg border border-[var(--slate-200)] bg-white p-3 shadow-md transition hover:border-[var(--slate-300)] hover:shadow ${border}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-medium text-slate-900">{task.title}</h3>
        <span
          className={`rounded px-2 py-0.5 text-base font-medium ${
            task.priority === 'HIGH'
              ? 'bg-red-100 text-red-800'
              : task.priority === 'LOW'
                ? 'bg-slate-100 text-slate-700'
                : 'bg-amber-50 text-amber-800'
          }`}
        >
          {task.priority}
        </span>
      </div>
      {task.meetingLabel && (
        <p className="mt-1 text-base text-slate-600">{task.meetingLabel}</p>
      )}
      {task.agendaItemNumber && (
        <p className="text-base text-slate-500">
          {t('task.card.item')}: {task.agendaItemNumber}
        </p>
      )}
      <p className="mt-2 text-base text-slate-500">
        {t('task.card.due')}: {formatDue(task.dueDate)}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {overdue && (
          <span className="rounded bg-red-100 px-2 py-0.5 text-base font-medium text-red-800">
            {t('task.badge.overdue')}
          </span>
        )}
        {escalated && (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-base font-medium text-amber-900">
            {t('task.badge.escalated')}
          </span>
        )}
        <span className="rounded bg-slate-100 px-2 py-0.5 text-base text-slate-700">{task.status}</span>
      </div>
    </Link>
  );
}
