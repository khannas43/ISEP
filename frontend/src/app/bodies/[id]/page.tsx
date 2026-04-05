import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type BodyDto } from '@/lib/api';
import { BodyDetailActions } from './BodyDetailActions';

async function getBody(id: string, accessToken: string): Promise<BodyDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function BodyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/api/auth/signin');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let body: BodyDto | null = null;
  if (accessToken) {
    try {
      body = await getBody(id, accessToken);
    } catch {
      body = null;
    }
  }
  if (!body) notFound();

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canEdit = roles.includes('SYSTEM_ADMIN');

  return (
    <>
      <div className="mb-6">
        <Link href="/bodies" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Back to Bodies</Link>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{body.name}</h1>
          <p className="page-subtitle">International body details</p>
        </div>
        {canEdit && (
          <BodyDetailActions bodyId={body.bodyId} isActive={body.isActive} />
        )}
      </div>

      <div className="card">
        <div className="card-body">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Abbreviation</dt>
              <dd className="mt-1 font-medium text-slate-900">{body.abbreviation ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Type</dt>
              <dd className="mt-1 font-medium text-slate-900">{body.bodyType.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Parent body</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {body.parentBodyName ? (
                  <Link href={`/bodies/${body.parentBodyId}`} className="text-blue-600 hover:underline">
                    {body.parentBodyName}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Status</dt>
              <dd className="mt-1">
                <span className={body.isActive ? 'badge badge-success' : 'badge badge-neutral'}>
                  {body.isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            {body.description && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Description</dt>
                <dd className="mt-1 text-slate-700">{body.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link href="/bodies" className="text-sm font-medium text-blue-600 hover:underline">← Bodies list</Link>
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">Dashboard</Link>
        <Link href={`/meetings?bodyId=${body.bodyId}`} className="text-sm font-medium text-blue-600 hover:underline">Meetings for this body</Link>
      </div>
    </>
  );
}
