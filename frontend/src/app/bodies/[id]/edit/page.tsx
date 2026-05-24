import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getReferenceData, type BodyDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { updateBody } from '../../actions';
import { BodyForm } from '../../BodyForm';

async function getBody(id: string, accessToken: string): Promise<BodyDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getBodies(accessToken: string): Promise<BodyDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies?includeInactive=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function EditBodyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/api/auth/signin');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let body: BodyDto | null = null;
  let bodies: BodyDto[] = [];
  let bodyTypeOptions: { code: string; label: string }[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      const [apiBody, apiBodies, refData] = await Promise.all([
        getBody(id, accessToken),
        getBodies(accessToken),
        getReferenceData(accessToken, 'body_type'),
      ]);
      body = apiBody ?? null;
      bodies = (apiBodies ?? []).filter((b) => b.bodyId !== id);
      bodyTypeOptions = refData ?? [];
    } catch {
      apiUnavailable = true;
    }
  }
  if (!body) notFound();

  return (
    <>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="mb-6">
        <Link href={`/bodies/${id}`} className="text-base font-medium text-slate-500 hover:text-slate-700">← Back to body</Link>
      </div>
      <div className="page-header">
        <h1 className="page-title">Edit International Body</h1>
        <p className="page-subtitle">Update body details.</p>
      </div>
      <div className="card">
        <div className="card-body">
          <BodyForm
            bodies={bodies.filter((b) => b.bodyId !== id)}
            bodyTypeOptions={bodyTypeOptions}
            initial={body}
            bodyId={id}
            updateAction={updateBody}
          />
        </div>
      </div>
    </>
  );
}
