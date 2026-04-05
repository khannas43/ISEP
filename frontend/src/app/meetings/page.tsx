/**
 * Meetings list page — paginated list with filters (body, status, search q).
 * Server component: fetches bodies (for filter dropdown) and meetings from API. Renders MeetingsListClient for sort/filter UI.
 */
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getReferenceData, type BodyDto, type MeetingDto, type MeetingsPage } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { formatDisplayDate } from '@/lib/format';

async function getBodies(accessToken: string): Promise<BodyDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

async function getMeetings(
  accessToken: string,
  params: { bodyId?: string; status?: string; page?: number; q?: string }
): Promise<MeetingsPage> {
  const searchParams = new URLSearchParams();
  if (params.q?.trim()) searchParams.set('q', params.q.trim());
  if (params.bodyId) searchParams.set('bodyId', params.bodyId);
  if (params.status) searchParams.set('status', params.status);
  if (params.page != null && params.page > 0) searchParams.set('page', String(params.page));
  searchParams.set('size', '20');
  const url = `${getApiUrl()}/api/v1/meetings?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('[Meetings] API error:', res.status, res.statusText, url);
    return { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 };
  }
  const data = await res.json();
  // Spring Page uses content, totalElements, totalPages, size, number
  const content = Array.isArray(data.content) ? data.content : [];
  return {
    content,
    totalElements: data.totalElements ?? content.length,
    totalPages: data.totalPages ?? 1,
    size: data.size ?? 20,
    number: data.number ?? 0,
  };
}

function meetingStatusBadge(s: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'badge badge-success',
    CONCLUDED: 'badge badge-neutral',
    ARCHIVED: 'badge badge-neutral',
    CANCELLED: 'badge badge-danger',
    PLANNED: 'badge badge-info',
  };
  return map[s] ?? 'badge badge-neutral';
}

type SortKey = 'title' | 'bodyName' | 'sessionNumber' | 'startDate' | 'location' | 'meetingType' | 'status';
type SortDir = 'asc' | 'desc';

function buildSortUrl(
  current: { bodyId?: string; status?: string; year?: string; meetingType?: string; page?: string; sortBy?: string; sortDir?: string; q?: string },
  sortBy: SortKey
): string {
  const dir: SortDir = current.sortBy === sortBy && current.sortDir === 'asc' ? 'desc' : 'asc';
  const params = new URLSearchParams();
  if (current.q) params.set('q', current.q);
  if (current.bodyId) params.set('bodyId', current.bodyId);
  if (current.status) params.set('status', current.status);
  if (current.year) params.set('year', current.year);
  if (current.meetingType) params.set('meetingType', current.meetingType);
  if (current.page) params.set('page', current.page);
  params.set('sortBy', sortBy);
  params.set('sortDir', dir);
  return `/meetings?${params.toString()}`;
}

function sortMeetings(meetings: MeetingDto[], sortBy: SortKey, sortDir: SortDir): MeetingDto[] {
  const arr = [...meetings];
  const mult = sortDir === 'asc' ? 1 : -1;
  arr.sort((a, b) => {
    let aVal: string | number | undefined, bVal: string | number | undefined;
    switch (sortBy) {
      case 'title':
        aVal = a.title ?? ''; bVal = b.title ?? ''; break;
      case 'bodyName':
        aVal = a.bodyName ?? ''; bVal = b.bodyName ?? ''; break;
      case 'sessionNumber':
        aVal = (a.sessionNumber ?? '').toLowerCase(); bVal = (b.sessionNumber ?? '').toLowerCase(); break;
      case 'startDate':
        aVal = new Date(a.startDate).getTime(); bVal = new Date(b.startDate).getTime(); break;
      case 'location':
        aVal = (a.location ?? '').toLowerCase(); bVal = (b.location ?? '').toLowerCase(); break;
      case 'meetingType':
        aVal = (a.meetingType ?? '').toLowerCase(); bVal = (b.meetingType ?? '').toLowerCase(); break;
      case 'status':
        aVal = (a.status ?? '').toLowerCase(); bVal = (b.status ?? '').toLowerCase(); break;
      default:
        return 0;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') return mult * aVal.localeCompare(bVal);
    if (typeof aVal === 'number' && typeof bVal === 'number') return mult * (aVal - bVal);
    return 0;
  });
  return arr;
}

type Props = { searchParams: Promise<{ bodyId?: string; status?: string; year?: string; meetingType?: string; page?: string; sortBy?: string; sortDir?: string; q?: string }> };

export default async function MeetingsListPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const accessToken = (session as { accessToken?: string }).accessToken;
  if (process.env.NODE_ENV === 'development' && !accessToken) {
    console.warn('[Meetings] No accessToken in session — API calls will be skipped. Sign out and sign in again.');
  }
  const params = await searchParams;
  const q = params.q ?? undefined;
  const bodyId = params.bodyId ?? undefined;
  const status = params.status ?? undefined;
  const page = params.page ? parseInt(params.page, 10) : 0;
  const year = params.year ? parseInt(params.year, 10) : undefined;
  const meetingType = params.meetingType ?? undefined;
  const sortBy = (params.sortBy as SortKey) ?? 'startDate';
  const sortDir = (params.sortDir === 'asc' || params.sortDir === 'desc' ? params.sortDir : 'desc') as SortDir;

  let bodies: BodyDto[] = [];
  let meetingsPage: MeetingsPage = { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 };
  let statusOptions: { value: string; label: string }[] = [{ value: '', label: 'All statuses' }];
  let meetingTypeOptions: { value: string; label: string }[] = [{ value: '', label: 'All types' }];
  let yearOptions: { value: string; label: string }[] = [{ value: '', label: 'All years' }];
  let apiUnavailable = false;

  if (accessToken) {
    try {
      const [bodiesRes, meetingsRes, statusRef, meetingTypeRef, yearRef] = await Promise.all([
        getBodies(accessToken),
        getMeetings(accessToken, { bodyId, status, page, q }),
        getReferenceData(accessToken, 'meeting_status'),
        getReferenceData(accessToken, 'meeting_type'),
        getReferenceData(accessToken, 'filter_year'),
      ]);
      bodies = bodiesRes ?? [];
      meetingsPage = meetingsRes;
      if (process.env.NODE_ENV === 'development') {
        console.log('[Meetings] API:', { bodiesCount: bodies.length, meetingsCount: meetingsPage.content.length, totalElements: meetingsPage.totalElements });
      }
      statusOptions = [{ value: '', label: 'All statuses' }, ...(statusRef ?? []).filter(Boolean).map((r) => ({ value: String(r?.code ?? ''), label: String(r?.label ?? '') }))];
      meetingTypeOptions = [{ value: '', label: 'All types' }, ...(meetingTypeRef ?? []).filter(Boolean).map((r) => ({ value: String(r?.code ?? ''), label: String(r?.label ?? '') }))];
      yearOptions = [
        { value: '', label: 'All years' },
        ...(yearRef ?? []).filter(Boolean).map((r) => ({ value: String(r?.code ?? ''), label: String(r?.label ?? '') })).sort((a, b) => parseInt(b.value || '0', 10) - parseInt(a.value || '0', 10)),
      ];
    } catch (e) {
      apiUnavailable = true;
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Meetings] Error:', e);
      }
    }
  }

  let meetings: MeetingDto[] = meetingsPage.content;
  if (year && !isNaN(year)) {
    meetings = meetings.filter((m) => new Date(m.startDate).getFullYear() === year);
  }
  if (meetingType && meetingType !== '') {
    meetings = meetings.filter((m) => m.meetingType === meetingType);
  }
  meetings = sortMeetings(meetings, sortBy, sortDir);

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canCreateMeeting = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');

  return (
    <>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">Browse and filter meetings by body, status, and type.</p>
        </div>
        {canCreateMeeting && (
          <Link href="/meetings/create" className="btn-primary">
            Create Meeting
          </Link>
        )}
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-700">Filters</h2>
        </div>
        <div className="card-body">
          <form method="get" action="/meetings" className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Search</span>
              <input
                type="search"
                name="q"
                defaultValue={q ?? ''}
                placeholder="Title or session number"
                className="input-base min-w-[200px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Body</span>
              <select name="bodyId" defaultValue={bodyId ?? ''} className="input-base min-w-[200px]">
                <option value="">All bodies</option>
                {bodies.map((b) => (
                  <option key={b.bodyId} value={b.bodyId}>
                    {b.name} {b.abbreviation ? `(${b.abbreviation})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Status</span>
              <select name="status" defaultValue={status ?? ''} className="input-base min-w-[140px]">
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Year</span>
              <select name="year" defaultValue={params.year ?? ''} className="input-base min-w-[100px]">
                {yearOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Type</span>
              <select name="meetingType" defaultValue={meetingType ?? ''} className="input-base min-w-[120px]">
                {meetingTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn-secondary">
              Apply filters
            </button>
          </form>
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th className="table-header px-5 py-3.5">
                <Link href={buildSortUrl(params, 'title')} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                  Meeting Id
                  {sortBy === 'title' && <span className="text-slate-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </Link>
              </th>
              <th className="table-header px-5 py-3.5">
                <Link href={buildSortUrl(params, 'bodyName')} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                  Meeting Title
                  {sortBy === 'bodyName' && <span className="text-slate-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </Link>
              </th>
              <th className="table-header px-5 py-3.5">
                <Link href={buildSortUrl(params, 'sessionNumber')} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                  Session
                  {sortBy === 'sessionNumber' && <span className="text-slate-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </Link>
              </th>
              <th className="table-header px-5 py-3.5">
                <Link href={buildSortUrl(params, 'startDate')} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                  Dates
                  {sortBy === 'startDate' && <span className="text-slate-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </Link>
              </th>
              <th className="table-header px-5 py-3.5">
                <Link href={buildSortUrl(params, 'location')} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                  Location
                  {sortBy === 'location' && <span className="text-slate-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </Link>
              </th>
              <th className="table-header px-5 py-3.5">
                <Link href={buildSortUrl(params, 'meetingType')} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                  Type
                  {sortBy === 'meetingType' && <span className="text-slate-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </Link>
              </th>
              <th className="table-header px-5 py-3.5">
                <Link href={buildSortUrl(params, 'status')} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900">
                  Status
                  {sortBy === 'status' && <span className="text-slate-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {meetings.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-cell py-12 text-center">
                  <p className="text-slate-500">No meetings found. Try adjusting your filters.</p>
                  {!accessToken && (
                    <p className="mt-2 text-sm text-amber-600">You may need to sign in again so the app can load data from the API.</p>
                  )}
                </td>
              </tr>
            ) : (
              meetings.map((m) => (
                <tr key={m.meetingId} className="transition-colors hover:bg-slate-50/80">
                  <td className="table-cell">
                    <Link href={`/meetings/${m.meetingId}`} className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                      {m.title}
                    </Link>
                  </td>
                  <td className="table-cell text-slate-600">{m.bodyName}</td>
                  <td className="table-cell text-slate-600">{m.sessionNumber ?? '—'}</td>
                  <td className="table-cell text-slate-600">
                    {formatDisplayDate(m.startDate)} – {formatDisplayDate(m.endDate)}
                  </td>
                  <td className="table-cell text-slate-600">{m.location ?? '—'}</td>
                  <td className="table-cell text-slate-600">{m.meetingType.replace(/_/g, ' ')}</td>
                  <td className="table-cell">
                    <span className={meetingStatusBadge(m.status)}>{m.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meetingsPage.totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          {page > 0 && (
            <Link
              href={`/meetings?${new URLSearchParams(
                Object.fromEntries(
                  Object.entries({
                    bodyId: bodyId ?? '',
                    status: status ?? '',
                    year: params.year ?? '',
                    meetingType: meetingType ?? '',
                    sortBy: params.sortBy ?? '',
                    sortDir: params.sortDir ?? '',
                    page: String(page - 1),
                  }).filter(([, v]) => v !== '')
                )
              ).toString()}`}
              className="font-medium text-blue-600 hover:underline"
            >
              ← Previous
            </Link>
          )}
          <span className="text-slate-600">
            Page {meetingsPage.number + 1} of {meetingsPage.totalPages} ({meetingsPage.totalElements} total)
          </span>
          {page < meetingsPage.totalPages - 1 && (
            <Link
              href={`/meetings?${new URLSearchParams(
                Object.fromEntries(
                  Object.entries({
                    bodyId: bodyId ?? '',
                    status: status ?? '',
                    year: params.year ?? '',
                    meetingType: meetingType ?? '',
                    sortBy: params.sortBy ?? '',
                    sortDir: params.sortDir ?? '',
                    page: String(page + 1),
                  }).filter(([, v]) => v !== '')
                )
              ).toString()}`}
              className="font-medium text-blue-600 hover:underline"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
