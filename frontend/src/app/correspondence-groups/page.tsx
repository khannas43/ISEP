import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type CorrespondenceGroupDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { formatDisplayDate } from '@/lib/format';
import { getAppBasePath } from '@/lib/appBasePath';

async function getCorrespondenceGroups(accessToken: string, bodyId?: string): Promise<CorrespondenceGroupDto[]> {
  const params = new URLSearchParams();
  if (bodyId) params.set('bodyId', bodyId);
  const res = await fetch(`${getApiUrl()}/api/v1/correspondence-groups?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

type SortKey = 'name' | 'parentBodyName' | 'indiaLeadName' | 'startDate' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

function buildSortUrl(current: { q?: string; sortBy?: string; sortDir?: string }, sortBy: SortKey, basePath: string): string {
  const dir: SortDir = current.sortBy === sortBy && current.sortDir === 'asc' ? 'desc' : 'asc';
  const params = new URLSearchParams();
  if (current.q) params.set('q', current.q);
  params.set('sortBy', sortBy);
  params.set('sortDir', dir);
  return `${basePath}/correspondence-groups?${params.toString()}`;
}

function sortGroups(groups: CorrespondenceGroupDto[], sortBy: SortKey, sortDir: SortDir): CorrespondenceGroupDto[] {
  const arr = [...groups];
  const mult = sortDir === 'asc' ? 1 : -1;
  arr.sort((a, b) => {
    let aVal: string | number | undefined;
    let bVal: string | number | undefined;
    switch (sortBy) {
      case 'name':
        aVal = (a.name ?? '').toLowerCase();
        bVal = (b.name ?? '').toLowerCase();
        break;
      case 'parentBodyName':
        aVal = (a.parentBodyName ?? '').toLowerCase();
        bVal = (b.parentBodyName ?? '').toLowerCase();
        break;
      case 'indiaLeadName':
        aVal = (a.indiaLeadName ?? '').toLowerCase();
        bVal = (b.indiaLeadName ?? '').toLowerCase();
        break;
      case 'startDate':
        aVal = new Date(a.startDate).getTime();
        bVal = new Date(b.startDate).getTime();
        break;
      case 'status':
        aVal = (a.status ?? '').toLowerCase();
        bVal = (b.status ?? '').toLowerCase();
        break;
      case 'createdAt':
        aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        break;
      default:
        return 0;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') return mult * aVal.localeCompare(bVal);
    if (typeof aVal === 'number' && typeof bVal === 'number') return mult * (aVal - bVal);
    return 0;
  });
  return arr;
}

type Props = { searchParams: Promise<{ q?: string; sortBy?: string; sortDir?: string }> };

function filterGroups(groups: CorrespondenceGroupDto[], q: string): CorrespondenceGroupDto[] {
  if (!q?.trim()) return groups;
  const lower = q.trim().toLowerCase();
  return groups.filter(
    (g) =>
      (g.name ?? '').toLowerCase().includes(lower) ||
      (g.parentBodyName ?? '').toLowerCase().includes(lower) ||
      (g.indiaLeadName ?? '').toLowerCase().includes(lower)
  );
}

export default async function CorrespondenceGroupsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const params = await searchParams;
  const q = params.q ?? '';
  const sortBy = (['name', 'parentBodyName', 'indiaLeadName', 'startDate', 'status', 'createdAt'].includes(params.sortBy ?? '') ? params.sortBy : 'startDate') as SortKey;
  const sortDir = (params.sortDir === 'asc' || params.sortDir === 'desc' ? params.sortDir : 'desc') as SortDir;
  const roles = (session as { roles?: string[] }).roles ?? [];
  const canCreate = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');
  const accessToken = (session as { accessToken?: string }).accessToken;
  const basePath = getAppBasePath();
  let allGroups: CorrespondenceGroupDto[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      allGroups = await getCorrespondenceGroups(accessToken);
    } catch {
      apiUnavailable = true;
    }
  }
  const filtered = filterGroups(allGroups, q);
  const groups = sortGroups(filtered, sortBy, sortDir);
  const sortState = { q, sortBy, sortDir };

  return (
    <div>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Correspondence Groups</h1>
          <p className="page-subtitle">
            Groups in which India participates. Filter by body from meeting detail.
          </p>
        </div>
        {canCreate && (
          <Link href="/correspondence-groups/new" className="btn-primary">
            Create correspondence group
          </Link>
        )}
      </div>
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-700">Search</h2>
        </div>
        <div className="card-body">
          <form method="get" action={`${basePath}/correspondence-groups`} className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-600">Name, parent body, or India lead</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search correspondence groups…"
                className="input-base min-w-[240px]"
              />
            </label>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        </div>
      </div>
      {groups.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p className="text-slate-500">{q ? 'No correspondence groups match your search.' : 'No correspondence groups yet.'}</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-base">
                <thead>
                  <tr>
                    <th className="table-header px-4 py-2.5 text-left">
                      <Link href={buildSortUrl(sortState, 'name', basePath)} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                        Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                      </Link>
                    </th>
                    <th className="table-header px-4 py-2.5 text-left">
                      <Link href={buildSortUrl(sortState, 'parentBodyName', basePath)} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                        Parent body {sortBy === 'parentBodyName' && (sortDir === 'asc' ? '↑' : '↓')}
                      </Link>
                    </th>
                    <th className="table-header px-4 py-2.5 text-left">
                      <Link href={buildSortUrl(sortState, 'indiaLeadName', basePath)} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                        India lead {sortBy === 'indiaLeadName' && (sortDir === 'asc' ? '↑' : '↓')}
                      </Link>
                    </th>
                    <th className="table-header px-4 py-2.5 text-left">
                      <Link href={buildSortUrl(sortState, 'startDate', basePath)} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                        Period {sortBy === 'startDate' && (sortDir === 'asc' ? '↑' : '↓')}
                      </Link>
                    </th>
                    <th className="table-header px-4 py-2.5 text-left">
                      <Link href={buildSortUrl(sortState, 'status', basePath)} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                        Status {sortBy === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                      </Link>
                    </th>
                    <th className="table-header px-4 py-2.5 text-left">
                      <Link href={buildSortUrl(sortState, 'createdAt', basePath)} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                        Creation Date {sortBy === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {groups.map((g) => (
                    <tr key={g.cgId} className="hover:bg-slate-50/50">
                      <td className="table-cell font-medium text-slate-900">
                        <Link href={`/correspondence-groups/${g.cgId}`} className="text-blue-600 hover:underline">
                          {g.name}
                        </Link>
                      </td>
                      <td className="table-cell text-slate-600">{g.parentBodyName ?? '—'}</td>
                      <td className="table-cell text-slate-600">{g.indiaLeadName ?? '—'}</td>
                      <td className="table-cell text-slate-600">
                        {formatDisplayDate(g.startDate)} – {formatDisplayDate(g.endDate)}
                      </td>
                      <td className="table-cell">
                        <span className={g.status === 'ACTIVE' ? 'badge badge-success' : 'badge badge-neutral'}>
                          {g.status}
                        </span>
                      </td>
                      <td className="table-cell text-slate-600">{g.createdAt ? formatDisplayDate(g.createdAt) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
