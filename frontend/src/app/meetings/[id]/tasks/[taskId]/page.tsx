import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type UserDto } from '@/lib/api';
import { formatDisplayDate } from '@/lib/format';
import { TaskDetailClient } from '../TaskDetailClient';

async function getTask(meetingId: string, taskId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getUsersForAssign(accessToken: string): Promise<UserDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/users?activeOnly=true&size=200`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  const content = data.content ?? [];
  return Array.isArray(content) ? content : [];
}

const PRIORITY_OPTIONS = [
  { code: 'HIGH', label: 'High' },
  { code: 'MEDIUM', label: 'Medium' },
  { code: 'LOW', label: 'Low' },
];

const STATUS_OPTIONS = [
  { code: 'CREATED', label: 'Created' },
  { code: 'ASSIGNED', label: 'Assigned' },
  { code: 'IN_PROGRESS', label: 'In Progress' },
  { code: 'SUBMITTED', label: 'Submitted' },
  { code: 'REVIEWED', label: 'Reviewed' },
  { code: 'CLOSED', label: 'Closed' },
];

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

type Props = { params: Promise<{ id: string; taskId: string }> };

export default async function TaskDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: meetingId, taskId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!accessToken) redirect('/login');

  const [task, userList] = await Promise.all([
    getTask(meetingId, taskId, accessToken),
    getUsersForAssign(accessToken),
  ]);
  if (!task) notFound();

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canEdit = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-4">
          <Link href={`/meetings/${meetingId}?tab=tasks`} className="text-base font-medium text-blue-600 hover:underline">
            ← Back to Tasks
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="page-title">{task.title}</h1>
            <p className="mt-1 text-slate-600">
              <span className={statusBadge(task.status)}>{task.status?.replace(/_/g, ' ')}</span>
              {' · '}
              Priority: {task.priority}
              {task.dueDate && ` · Due ${formatDisplayDate(task.dueDate)}`}
            </p>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 text-base">
          <div>
            <dt className="text-slate-500">Description</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{task.description ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Assigned to</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{task.assignedToName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Due date</dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {task.dueDate ? formatDisplayDate(task.dueDate) : '—'}
            </dd>
          </div>
        </dl>
        {canEdit && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Edit task</h2>
            <TaskDetailClient
              meetingId={meetingId}
              taskId={taskId}
              initial={{
                title: task.title,
                description: task.description ?? '',
                assignedToId: task.assignedToId ?? '',
                priority: task.priority ?? 'MEDIUM',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
                status: task.status ?? 'CREATED',
              }}
              userList={userList}
              priorityOptions={PRIORITY_OPTIONS}
              statusOptions={STATUS_OPTIONS}
            />
          </div>
        )}
      </div>
    </div>
  );
}
