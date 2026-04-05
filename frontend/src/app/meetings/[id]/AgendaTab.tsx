'use client';

import Link from 'next/link';
import type { AgendaItemDto } from '@/lib/api';

function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });
  } catch {
    return dateStr;
  }
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'badge badge-neutral',
    ACTIVE: 'badge badge-info',
    CLOSED: 'badge badge-success',
  };
  return map[status] ?? 'badge badge-neutral';
}

type Props = {
  meetingId: string;
  agendaItems: AgendaItemDto[];
  canAdd: boolean;
};

export function AgendaTab({ meetingId, agendaItems, canAdd }: Props) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Agenda Items</h2>
          {canAdd && (
            <Link href={`/meetings/${meetingId}/agenda/new`} className="btn-primary">
              Add agenda item
            </Link>
          )}
        </div>

        {agendaItems.length === 0 ? (
          <p className="mt-4 text-slate-500">No agenda items yet. Add items to structure this meeting&apos;s agenda.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr>
                  <th className="table-header px-4 py-2.5 text-left">#</th>
                  <th className="table-header px-4 py-2.5 text-left">Title</th>
                  <th className="table-header px-4 py-2.5 text-left">Category</th>
                  <th className="table-header px-4 py-2.5 text-left">Priority</th>
                  <th className="table-header px-4 py-2.5 text-left">Status</th>
                  <th className="table-header px-4 py-2.5 text-left">Feedback deadline</th>
                  <th className="table-header px-4 py-2.5 text-left">Coordinator</th>
                  <th className="table-header px-4 py-2.5 text-right">Inputs</th>
                  {canAdd && <th className="table-header px-4 py-2.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {agendaItems.map((item) => (
                  <tr key={item.agendaItemId} className="transition-colors hover:bg-slate-50/50">
                    <td className="table-cell font-mono text-slate-600">{item.itemNumber}</td>
                    <td className="table-cell">
                      <Link
                        href={`/meetings/${meetingId}/agenda/${item.agendaItemId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="table-cell text-slate-600">{formatCategory(item.category)}</td>
                    <td className="table-cell text-slate-600">{item.priority}</td>
                    <td className="table-cell">
                      <span className={statusBadge(item.status)}>{item.status}</span>
                    </td>
                    <td className="table-cell text-slate-600">{formatDate(item.deadlineForInputs)}</td>
                    <td className="table-cell text-slate-600">
                      {item.assignedCoordinatorName ?? '—'}
                    </td>
                    <td className="table-cell text-right text-slate-600">
                      {item.inputsReceivedCount ?? 0}
                    </td>
                    {canAdd && (
                      <td className="table-cell text-right">
                        <Link
                          href={`/meetings/${meetingId}/agenda/${item.agendaItemId}/edit`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    )}
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
