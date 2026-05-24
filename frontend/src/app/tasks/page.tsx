import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type TaskV1Response } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { formatDisplayDate } from '@/lib/format';
import { getAppBasePath } from '@/lib/appBasePath';

async function fetchTaskList(accessToken: string): Promise<{ tasks: TaskV1Response[]; apiUnavailable: boolean }> {
  const teamRes = await fetch(`${getApiUrl()}/api/v1/tasks/team`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (teamRes.ok) {
    const data = await teamRes.json();
    const rows = Array.isArray(data) ? data : data.content ?? [];
    return { tasks: Array.isArray(rows) ? rows : [], apiUnavailable: false };
  }
  if (teamRes.status !== 401 && teamRes.status !== 403) {
    return { tasks: [], apiUnavailable: true };
  }

  const myRes = await fetch(`${getApiUrl()}/api/v1/tasks/my`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!myRes.ok) {
    return { tasks: [], apiUnavailable: true };
  }
  const data = await myRes.json();
  return { tasks: Array.isArray(data) ? data : [], apiUnavailable: false };
}

function filterTasks(tasks: TaskV1Response[], q: string): TaskV1Response[] {
  if (!q.trim()) return tasks;
  const lower = q.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      (t.title ?? '').toLowerCase().includes(lower) ||
      (t.meetingTitle ?? '').toLowerCase().includes(lower) ||
      (t.status ?? '').toLowerCase().includes(lower) ||
      (t.priority ?? '').toLowerCase().includes(lower) ||
      (t.assignedToNames ?? []).some((name) => name.toLowerCase().includes(lower))
  );
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function TasksPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const params = await searchParams;
  const q = params.q ?? '';
  const accessToken = (session as { accessToken?: string }).accessToken;
  const basePath = getAppBasePath();
  let allTasks: TaskV1Response[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      const res = await fetchTaskList(accessToken);
      allTasks = res.tasks;
      apiUnavailable = res.apiUnavailable;
    } catch {
      apiUnavailable = true;
    }
  }
  const tasks = filterTasks(allTasks, q).sort((a, b) => {
    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  });

  return (
    <div>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <p className="page-subtitle">
          Tasks across meetings. Open a task or meeting to view details, create follow-ups, or update status.
        </p>
      </div>
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-700">Search</h2>
        </div>
        <div className="card-body">
          <form method="get" action={`${basePath}/tasks`} className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-600">Task, meeting, status, or assignee</span>
              <input type="search" name="q" defaultValue={q} placeholder="Search tasks…" className="input-base min-w-[240px]" />
            </label>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          {tasks.length === 0 ? (
            <p className="text-slate-500">{q ? 'No tasks match your search.' : 'No tasks found.'}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-base">
                <thead>
                  <tr>
                    <th className="table-header px-4 py-2.5 text-left">Task</th>
                    <th className="table-header px-4 py-2.5 text-left">Meeting</th>
                    <th className="table-header px-4 py-2.5 text-left">Assignee</th>
                    <th className="table-header px-4 py-2.5 text-left">Due date</th>
                    <th className="table-header px-4 py-2.5 text-left">Priority</th>
                    <th className="table-header px-4 py-2.5 text-left">Status</th>
                    <th className="table-header px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tasks.map((t) => (
                    <tr key={t.taskId} className="hover:bg-slate-50/50">
                      <td className="table-cell font-medium text-slate-900">{t.title}</td>
                      <td className="table-cell text-slate-600">{t.meetingTitle ?? (t.meetingId ? `Meeting ${t.meetingId.slice(0, 8)}` : '—')}</td>
                      <td className="table-cell text-slate-600">
                        {t.assignedToNames?.length
                          ? t.assignedToNames.join(', ')
                          : t.assignedTo?.length
                            ? t.assignedTo.map((id) => `User ${id.slice(0, 8)}`).join(', ')
                            : '—'}
                      </td>
                      <td className="table-cell text-slate-600">{t.dueDate ? formatDisplayDate(t.dueDate) : '—'}</td>
                      <td className="table-cell text-slate-600">{t.priority}</td>
                      <td className="table-cell text-slate-600">{t.status?.replace(/_/g, ' ')}</td>
                      <td className="table-cell text-right">
                        <Link href={t.meetingId ? `/meetings/${t.meetingId}/tasks/${t.taskId}` : `/tasks/${t.taskId}`} className="text-blue-600 hover:underline">
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link href="/meetings" className="text-base font-medium text-blue-600 hover:underline">
              ← All meetings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
