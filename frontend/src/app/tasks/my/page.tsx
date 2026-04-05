import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type TaskV1Response } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { TaskCard, type TaskCardModel } from '@/components/tasks/TaskCard';
import { MyTasksHeader } from './MyTasksHeader';

function toCard(t: TaskV1Response, meetingLabels: Record<string, string>): TaskCardModel {
  const mid = t.meetingId;
  return {
    taskId: t.taskId,
    title: t.title,
    meetingId: mid,
    meetingLabel: mid ? meetingLabels[mid] ?? `Meeting ${mid.slice(0, 8)}…` : null,
    dueDate: t.dueDate,
    priority: t.priority,
    status: t.status,
    isOverdue: t.isOverdue,
    escalatedAt: t.escalatedAt,
  };
}

/**
 * SCR-TASK-01 — My Tasks (A-D-02). Board from GET /api/v1/tasks/my.
 */
export default async function MyTasksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let tasks: TaskV1Response[] = [];
  let apiUnavailable = false;
  const meetingLabels: Record<string, string> = {};

  if (accessToken) {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/tasks/my`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        tasks = Array.isArray(data) ? data : [];
        const meetingIds = Array.from(
          new Set(tasks.map((t) => t.meetingId).filter((id): id is string => Boolean(id)))
        );
        await Promise.all(
          meetingIds.map(async (mid) => {
            try {
              const mr = await fetch(`${getApiUrl()}/api/v1/meetings/${mid}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                cache: 'no-store',
              });
              if (mr.ok) {
                const m = await mr.json();
                if (m?.title) meetingLabels[mid] = String(m.title);
              }
            } catch {
              /* ignore */
            }
          })
        );
      } else {
        apiUnavailable = true;
      }
    } catch {
      apiUnavailable = true;
      tasks = [];
    }
  }

  const pending = tasks.filter((t) => t.status === 'PENDING' || t.status === 'OVERDUE' || t.status === 'ESCALATED');
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completed = tasks.filter((t) => t.status === 'COMPLETED');
  const overdueCount = tasks.filter((t) => t.isOverdue).length;

  const col = (items: TaskV1Response[]) => (
    <ul className="space-y-3">
      {items.length === 0 ? (
        <li className="text-sm text-slate-500">None</li>
      ) : (
        items.map((t) => (
          <li key={t.taskId}>
            <TaskCard task={toCard(t, meetingLabels)} />
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div>
      <MyTasksHeader overdueCount={overdueCount} />
      {apiUnavailable && <ApiUnavailableBanner />}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card card-body">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Pending</h2>
          {col(pending)}
        </section>
        <section className="card card-body">
          <h2 className="mb-4 text-base font-semibold text-slate-900">In progress</h2>
          {col(inProgress)}
        </section>
        <section className="card card-body">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Completed</h2>
          {col(completed)}
        </section>
      </div>
    </div>
  );
}
