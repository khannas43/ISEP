import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getReferenceData, type BodyDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { BodyForm } from '../BodyForm';

async function getBodies(accessToken: string): Promise<BodyDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies?includeInactive=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function NewBodyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/api/auth/signin');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let bodies: BodyDto[] = [];
  let bodyTypeOptions: { code: string; label: string }[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      const [apiBodies, refData] = await Promise.all([
        getBodies(accessToken),
        getReferenceData(accessToken, 'body_type'),
      ]);
      bodies = apiBodies ?? [];
      bodyTypeOptions = refData ?? [];
    } catch {
      apiUnavailable = true;
    }
  }

  return (
    <>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="mb-6">
        <Link href="/bodies" className="text-base font-medium text-slate-500 hover:text-slate-700">← Back to Bodies</Link>
      </div>
      <div className="page-header">
        <h1 className="page-title">Add International Body</h1>
        <p className="page-subtitle">Create a new committee or body in the hierarchy.</p>
      </div>
      <div className="card">
        <div className="card-body">
          <BodyForm bodies={bodies} bodyTypeOptions={bodyTypeOptions} />
        </div>
      </div>
    </>
  );
}
