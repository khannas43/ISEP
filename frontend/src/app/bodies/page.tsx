import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type BodyDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';

async function getBodies(accessToken: string): Promise<BodyDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

type Props = { searchParams: Promise<{ q?: string }> };

function filterBodies(bodies: BodyDto[], q: string): BodyDto[] {
  if (!q?.trim()) return bodies;
  const lower = q.trim().toLowerCase();
  return bodies.filter(
    (b) =>
      (b.name ?? '').toLowerCase().includes(lower) ||
      (b.abbreviation ?? '').toLowerCase().includes(lower)
  );
}

export default async function BodiesListPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/api/auth/signin');

  const params = await searchParams;
  const q = params.q ?? '';
  const accessToken = (session as { accessToken?: string }).accessToken;
  let allBodies: BodyDto[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      allBodies = await getBodies(accessToken);
    } catch {
      apiUnavailable = true;
    }
  }
  const bodies = filterBodies(allBodies, q);

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canEdit = roles.includes('SYSTEM_ADMIN');

  return (
    <>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header">
        <div>
          <h1 className="page-title">International Bodies</h1>
          <p className="page-subtitle">Committees and bodies hierarchy. View and manage body details.</p>
        </div>
        {canEdit && (
          <Link href="/bodies/new" className="btn-primary">
            Add Body
          </Link>
        )}
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-700">Search</h2>
        </div>
        <div className="card-body">
          <form method="get" action="/bodies" className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Name or abbreviation</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search bodies…"
                className="input-base min-w-[220px]"
              />
            </label>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th className="table-header px-5 py-3.5">Name</th>
              <th className="table-header px-5 py-3.5">Abbreviation</th>
              <th className="table-header px-5 py-3.5">Type</th>
              <th className="table-header px-5 py-3.5">Parent</th>
              <th className="table-header px-5 py-3.5">Status</th>
              {canEdit && <th className="table-header px-5 py-3.5">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {bodies.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="table-cell py-12 text-center text-slate-500">
                  {q ? 'No bodies match your search.' : 'No bodies found.'}
                </td>
              </tr>
            ) : (
              bodies.map((b) => (
                <tr key={b.bodyId} className="transition-colors hover:bg-slate-50/80">
                  <td className="table-cell">
                    <Link href={`/bodies/${b.bodyId}`} className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                      {b.name}
                    </Link>
                  </td>
                  <td className="table-cell text-slate-600">{b.abbreviation ?? '—'}</td>
                  <td className="table-cell text-slate-600">{b.bodyType.replace(/_/g, ' ')}</td>
                  <td className="table-cell text-slate-600">{b.parentBodyName ?? '—'}</td>
                  <td className="table-cell">
                    <span className={b.isActive ? 'badge badge-success' : 'badge badge-neutral'}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="table-cell">
                      <Link href={`/bodies/${b.bodyId}/edit`} className="text-sm font-medium text-blue-600 hover:underline">
                        Edit
                      </Link>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
