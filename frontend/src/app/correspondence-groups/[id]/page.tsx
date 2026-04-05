import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type CorrespondenceGroupDto } from '@/lib/api';
import { formatDisplayDate } from '@/lib/format';

async function getCorrespondenceGroup(cgId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/correspondence-groups/${cgId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

type Props = { params: Promise<{ id: string }> };

export default async function CorrespondenceGroupDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: cgId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;

  let cg: CorrespondenceGroupDto | null = null;
  if (accessToken) {
    try {
      cg = await getCorrespondenceGroup(cgId, accessToken);
    } catch {
      cg = null;
    }
  }
  if (!cg) notFound();

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canEdit = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-4">
          <Link href="/correspondence-groups" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to Correspondence Groups
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="page-title">{cg.name}</h1>
            <p className="mt-1 text-slate-600">
              <span className={cg.status === 'ACTIVE' ? 'badge badge-success' : 'badge badge-neutral'}>
                {cg.status}
              </span>
              {cg.parentBodyName && ` · ${cg.parentBodyName}`}
            </p>
          </div>
          {canEdit && (
            <Link href={`/correspondence-groups/${cgId}/edit`} className="btn-secondary">
              Edit
            </Link>
          )}
        </div>
        <dl className="mt-6 grid gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Parent body</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{cg.parentBodyName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">India lead</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{cg.indiaLeadName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Period</dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {formatDisplayDate(cg.startDate)} – {formatDisplayDate(cg.endDate)}
            </dd>
          </div>
          {cg.imsoReference && (
            <div>
              <dt className="text-slate-500">IMO reference</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{cg.imsoReference}</dd>
            </div>
          )}
          <div>
            <dt className="text-slate-500">Mandate / terms of reference</dt>
            <dd className="mt-0.5 font-medium text-slate-900 whitespace-pre-wrap">{cg.mandate ?? '—'}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href={`/correspondence-groups/${cgId}/members`} className="btn-secondary text-sm">
            Members
          </Link>
          <Link href={`/correspondence-groups/${cgId}/submissions`} className="btn-secondary text-sm">
            Submissions
          </Link>
        </div>
      </div>
    </div>
  );
}
