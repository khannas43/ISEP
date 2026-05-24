import { getServerSession, authOptions } from '@/lib/auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getApiUrl, type TaskV1Response } from '@/lib/api';

type Props = { params: Promise<{ id: string }> };

/**
 * SCR-TASK-03 — Task detail (GET /api/v1/tasks/{id}).
 */
export default async function TaskDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let task: TaskV1Response | null = null;
  let meetingTitle: string | null = null;

  if (accessToken) {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/tasks/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      if (res.ok) task = await res.json();
      if (task?.meetingId) {
        try {
          const mr = await fetch(`${getApiUrl()}/api/v1/meetings/${task.meetingId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: 'no-store',
          });
          if (mr.ok) {
            const m = await mr.json();
            meetingTitle = m?.title ? String(m.title) : null;
          }
        } catch {
          meetingTitle = null;
        }
      }
    } catch {
      task = null;
    }
  }
  if (!task) notFound();

  const assignees = (task.assignedTo ?? []).join(', ') || '—';
  const dueDisplay = task.dueDate
    ? new Date(task.dueDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  return (
    <div>
      <div className="mb-6">
        <Link
          href={task.meetingId ? `/meetings/${task.meetingId}?tab=tasks` : '/tasks/my'}
          className="text-base font-medium text-slate-500 hover:text-slate-700"
        >
          ← Back to {task.meetingId ? 'Meeting tasks' : 'My tasks'}
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="page-title">{task.title}</h1>
            <span
              className={`rounded px-3 py-1 text-base font-medium ${
                task.status === 'COMPLETED'
                  ? 'bg-slate-100 text-slate-700'
                  : task.status === 'IN_PROGRESS'
                    ? 'bg-amber-100 text-amber-800'
                    : task.status === 'ESCALATED'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-blue-100 text-blue-800'
              }`}
            >
              {task.status}
            </span>
          </div>
          {task.description && <p className="mt-2 text-slate-700">{task.description}</p>}
          {task.isOverdue && (
            <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-base text-red-800" role="status">
              This task is overdue.
            </p>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-base sm:grid-cols-4">
            <div>
              <dt className="text-slate-500">Assignees</dt>
              <dd className="font-medium break-all text-slate-900">{assignees}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Due date</dt>
              <dd className="font-medium text-slate-900">{dueDisplay}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Priority</dt>
              <dd className="font-medium text-slate-900">{task.priority}</dd>
            </div>
            {task.meetingId && (
              <div>
                <dt className="text-slate-500">Meeting</dt>
                <dd>
                  <Link href={`/meetings/${task.meetingId}?tab=tasks`} className="font-medium text-blue-600 hover:underline">
                    {meetingTitle ?? 'View meeting'}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-6 flex gap-3">
            {task.meetingId && (
              <Link href={`/meetings/${task.meetingId}/tasks/${task.taskId}`} className="btn-secondary text-base">
                Open in meeting context
              </Link>
            )}
            <Link href="/tasks/my" className="btn-secondary text-base">
              My tasks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
