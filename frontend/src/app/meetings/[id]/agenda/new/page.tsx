import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getReferenceData, type UserDto } from '@/lib/api';
import { AgendaItemForm } from '../AgendaItemForm';

async function getUsersForCoordinatorPicker(accessToken: string): Promise<UserDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/users?activeOnly=true&size=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  const content = data.content ?? [];
  return Array.isArray(content) ? content : [];
}

type Props = { params: Promise<{ id: string }> };

export default async function NewAgendaItemPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canAdd = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');
  if (!canAdd) redirect('/unauthorized');

  const { id: meetingId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  const [categoryOptions, priorityOptions, statusOptions, coordinatorOptions] = accessToken
    ? await Promise.all([
        getReferenceData(accessToken, 'agenda_category'),
        getReferenceData(accessToken, 'agenda_priority'),
        getReferenceData(accessToken, 'agenda_status'),
        getUsersForCoordinatorPicker(accessToken),
      ])
    : [[], [], [], []];

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-4">
          <Link href={`/meetings/${meetingId}?tab=agenda`} className="text-base font-medium text-blue-600 hover:underline">
            ← Back to Agenda Items
          </Link>
        </div>
        <h1 className="page-title">Add Agenda Item</h1>
        <p className="page-subtitle mt-1">
          Add a new agenda item to this meeting. Item number, title, category, priority, and deadline for member inputs.
        </p>
        <div className="mt-6">
          <AgendaItemForm
            meetingId={meetingId}
            mode="create"
            categoryOptions={categoryOptions}
            priorityOptions={priorityOptions}
            statusOptions={statusOptions}
            coordinatorOptions={coordinatorOptions}
          />
        </div>
      </div>
    </div>
  );
}
