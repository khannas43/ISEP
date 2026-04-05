import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';

type TaskRow = { taskId: string; title: string; dueDate: string | null; status: string; assignedToName?: string | null; meetingId?: string | null };

/**
 * SCR-TASK-04 — Team task dashboard. Data from API only.
 */
export default async function TeamTasksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let taskList: TaskRow[] = [];
  if (accessToken) {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/tasks?size=200`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.content ?? data ?? [];
        taskList = Array.isArray(content) ? content : [];
      }
    } catch {
      // Leave empty when API unavailable
    }
  }

  const byAssignee = new Map<string, { name: string; tasks: TaskRow[] }>();
  for (const t of taskList) {
    const name = t.assignedToName ?? 'Unassigned';
    if (!byAssignee.has(name)) byAssignee.set(name, { name, tasks: [] });
    byAssignee.get(name)!.tasks.push(t);
  }

  const today = new Date().toISOString().slice(0, 10);

  const getStatusGroup = (task: TaskRow) => {
    if (task.status === 'COMPLETED') return 'COMPLETED';
    if (task.status === 'IN_PROGRESS') return 'IN_PROGRESS';
    if (task.dueDate && task.dueDate < today) return 'Overdue';
    return 'Pending';
  };

  return (
    <div>
      <div className="page-header flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Team task dashboard</h1>
          <p className="page-subtitle">All tasks by assignee and status. Overdue highlighted.</p>
        </div>
        <Link href="/tasks" className="btn-secondary text-sm">Tasks by meeting</Link>
        <Link href="/tasks/my" className="btn-secondary text-sm">My tasks</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-200 text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-900">
                Assignee
              </th>
              <th className="border border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-900">
                Overdue
              </th>
              <th className="border border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-900">
                Pending
              </th>
              <th className="border border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-900">
                In progress
              </th>
              <th className="border border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-900">
                Completed
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from(byAssignee.entries()).map(([name, { tasks: assigneeTasks }]) => {
              const overdueCount = assigneeTasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'COMPLETED').length;
              const pending = assigneeTasks.filter((t) => getStatusGroup(t) === 'Pending');
              const inProgress = assigneeTasks.filter((t) => getStatusGroup(t) === 'IN_PROGRESS');
              const completed = assigneeTasks.filter((t) => getStatusGroup(t) === 'COMPLETED');
              return (
                <tr key={name} className="border-b border-slate-200">
                  <td className="border border-slate-200 px-4 py-2.5 font-medium text-slate-900">
                    {name}
                  </td>
                  <td className="border border-slate-200 px-4 py-2.5">
                    {overdueCount > 0 ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        {overdueCount}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="border border-slate-200 px-4 py-2.5">
                    <ul className="space-y-1">
                      {pending.slice(0, 3).map((t) => (
                        <li key={t.taskId}>
                          <Link href={t.meetingId ? `/meetings/${t.meetingId}/tasks/${t.taskId}` : `/tasks/${t.taskId}`} className="text-blue-600 hover:underline">
                            {t.title.slice(0, 40)}{t.title.length > 40 ? '…' : ''}
                          </Link>
                        </li>
                      ))}
                      {pending.length > 3 && <li className="text-slate-500">+{pending.length - 3} more</li>}
                    </ul>
                  </td>
                  <td className="border border-slate-200 px-4 py-2.5">
                    <ul className="space-y-1">
                      {inProgress.map((t) => (
                        <li key={t.taskId}>
                          <Link href={t.meetingId ? `/meetings/${t.meetingId}/tasks/${t.taskId}` : `/tasks/${t.taskId}`} className="text-blue-600 hover:underline">
                            {t.title.slice(0, 40)}{t.title.length > 40 ? '…' : ''}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-slate-200 px-4 py-2.5">
                    <span className="text-slate-600">{completed.length}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
