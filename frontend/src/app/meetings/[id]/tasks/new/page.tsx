import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type UserDto } from '@/lib/api';
import { CreateTaskForm } from '../CreateTaskForm';

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

type Props = { params: Promise<{ id: string }> };

export default async function NewTaskPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canCreate = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');
  if (!canCreate) redirect('/unauthorized');

  const { id: meetingId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  const userList = accessToken ? await getUsersForAssign(accessToken) : [];

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-4">
          <Link href={`/meetings/${meetingId}?tab=tasks`} className="text-base font-medium text-blue-600 hover:underline">
            ← Back to Tasks
          </Link>
        </div>
        <h1 className="page-title">Create Task</h1>
        <p className="page-subtitle mt-1">
          Create a task linked to this meeting. Assign to a user and set priority and due date.
        </p>
        <div className="mt-6">
          <CreateTaskForm
            meetingId={meetingId}
            userList={userList}
            priorityOptions={PRIORITY_OPTIONS}
            statusOptions={STATUS_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
