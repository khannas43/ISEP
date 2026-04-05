import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type BodyDto, type CorrespondenceGroupDto } from '@/lib/api';
import { CGForm } from '../../CGForm';

async function getCorrespondenceGroup(cgId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/correspondence-groups/${cgId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getBodies(accessToken: string): Promise<BodyDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

async function getUsers(accessToken: string): Promise<{ userId: string; fullName: string; email: string }[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/users?activeOnly=true&size=200`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  const content = data.content ?? [];
  return (Array.isArray(content) ? content : []).map((u: { userId: string; fullName: string; email: string }) => ({
    userId: u.userId,
    fullName: u.fullName,
    email: u.email,
  }));
}

type Props = { params: Promise<{ id: string }> };

export default async function EditCorrespondenceGroupPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canEdit = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');
  if (!canEdit) redirect('/unauthorized');

  const { id: cgId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!accessToken) redirect('/login');

  let cg: CorrespondenceGroupDto | null = null;
  let bodies: BodyDto[] = [];
  let users: { userId: string; fullName: string; email: string }[] = [];
  try {
    const [cgRes, bodiesRes, usersRes] = await Promise.all([
      getCorrespondenceGroup(cgId, accessToken),
      getBodies(accessToken),
      getUsers(accessToken),
    ]);
    cg = cgRes ?? null;
    bodies = bodiesRes ?? [];
    users = usersRes ?? [];
  } catch {
    cg = null;
  }
  if (!cg) notFound();

  const initial = {
    parentBodyId: cg.parentBodyId ?? '',
    name: cg.name ?? '',
    mandate: cg.mandate ?? '',
    indiaLeadId: cg.indiaLeadId ?? '',
    startDate: cg.startDate ? cg.startDate.slice(0, 10) : '',
    endDate: cg.endDate ? cg.endDate.slice(0, 10) : '',
    status: cg.status ?? 'ACTIVE',
    imsoReference: cg.imsoReference ?? '',
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-4">
          <Link href={`/correspondence-groups/${cgId}`} className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Correspondence Group
          </Link>
        </div>
        <h1 className="page-title">Edit Correspondence Group</h1>
        <p className="page-subtitle mt-1">
          Update name, mandate, India lead, and dates.
        </p>
        <div className="mt-6">
          <CGForm mode="edit" cgId={cgId} initial={initial} bodies={bodies} users={users} />
        </div>
      </div>
    </div>
  );
}
