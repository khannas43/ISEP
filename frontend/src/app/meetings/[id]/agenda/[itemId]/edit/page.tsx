import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getReferenceData, type AgendaItemDto, type UserDto } from '@/lib/api';
import { AgendaItemForm } from '../../AgendaItemForm';

async function getAgendaItem(meetingId: string, itemId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items/${itemId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

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

function formatDateTimeLocal(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  } catch {
    return '';
  }
}

type Props = { params: Promise<{ id: string; itemId: string }> };

export default async function EditAgendaItemPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canEdit = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');
  if (!canEdit) redirect('/unauthorized');

  const { id: meetingId, itemId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!accessToken) redirect('/login');

  let item: AgendaItemDto | null = null;
  let categoryOptions: { code: string; label: string }[] = [];
  let priorityOptions: { code: string; label: string }[] = [];
  let statusOptions: { code: string; label: string }[] = [];
  let coordinatorOptions: UserDto[] = [];
  try {
    item = await getAgendaItem(meetingId, itemId, accessToken);
    const [cat, prio, status, coord] = await Promise.all([
      getReferenceData(accessToken, 'agenda_category'),
      getReferenceData(accessToken, 'agenda_priority'),
      getReferenceData(accessToken, 'agenda_status'),
      getUsersForCoordinatorPicker(accessToken),
    ]);
    categoryOptions = cat ?? [];
    priorityOptions = prio ?? [];
    statusOptions = status ?? [];
    coordinatorOptions = coord ?? [];
  } catch {
    item = null;
  }
  if (!item) notFound();

  const initial = {
    itemNumber: item.itemNumber ?? '',
    title: item.title ?? '',
    description: item.description ?? '',
    category: item.category ?? '',
    priority: item.priority ?? 'MEDIUM',
    status: item.status ?? 'DRAFT',
    deadlineForInputs: formatDateTimeLocal(item.deadlineForInputs),
    assignedCoordinatorId: item.assignedCoordinatorId ?? '',
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-4">
          <Link href={`/meetings/${meetingId}?tab=agenda`} className="text-base font-medium text-blue-600 hover:underline">
            ← Back to Agenda Items
          </Link>
        </div>
        <h1 className="page-title">Edit Agenda Item</h1>
        <p className="page-subtitle mt-1">
          Update item number, title, category, priority, and deadline.
        </p>
        <div className="mt-6">
          <AgendaItemForm
            meetingId={meetingId}
            mode="edit"
            agendaItemId={itemId}
            initial={initial}
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
