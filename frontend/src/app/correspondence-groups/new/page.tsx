import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type BodyDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { CGForm } from '../CGForm';

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

type Props = { params: Promise<Record<string, never>> };

export default async function NewCorrespondenceGroupPage({ params: _params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canCreate = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');
  if (!canCreate) redirect('/unauthorized');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let bodies: BodyDto[] = [];
  let users: { userId: string; fullName: string; email: string }[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      const [bodiesRes, usersRes] = await Promise.all([getBodies(accessToken), getUsers(accessToken)]);
      bodies = bodiesRes ?? [];
      users = usersRes ?? [];
    } catch {
      apiUnavailable = true;
    }
  }

  return (
    <>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="card">
        <div className="card-body">
        <div className="mb-4">
          <Link href="/correspondence-groups" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Correspondence Groups
          </Link>
        </div>
        <h1 className="page-title">Create Correspondence Group</h1>
        <p className="page-subtitle mt-1">
          Configure India&apos;s participation in a correspondence group.
        </p>
        <div className="mt-6">
          <CGForm mode="create" bodies={bodies} users={users} />
        </div>
      </div>
    </div>
    </>
  );
}
