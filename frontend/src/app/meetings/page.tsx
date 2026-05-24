/**
 * Meetings list page — paginated list with filters (body, status, search q).
 * Server component: fetches bodies (for filter dropdown) and meetings from API. Renders MeetingsListClient for sort/filter UI.
 */
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getReferenceData, type BodyDto, type MeetingDto, type MeetingsPage } from '@/lib/api';
import { getAppBasePath } from '@/lib/appBasePath';
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
  searchParams.set('size', '100');
  const url = `${getApiUrl()}/api/v1/meetings?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('[Meetings] API error:', res.status, res.statusText, url);
    return { content: [], totalElements: 0, totalPages: 0, size: 100, number: 0 };
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
    ACTIVE: 'rounded-full bg-emerald-50 px-2 py-0.5 text-base font-semibold text-emerald-800',
    CONCLUDED: 'rounded-full bg-slate-100 px-2 py-0.5 text-base font-semibold text-slate-700',
    ARCHIVED: 'rounded-full bg-slate-100 px-2 py-0.5 text-base font-semibold text-slate-700',
    CANCELLED: 'rounded-full bg-red-50 px-2 py-0.5 text-base font-semibold text-red-800',
    PLANNED: 'rounded-full bg-[var(--navy-100)] px-2 py-0.5 text-base font-semibold text-[var(--navy-800)]',
  };
  const key = (s || '').toUpperCase();
  return map[key] ?? 'rounded-full bg-slate-100 px-2 py-0.5 text-base font-semibold text-slate-700';
}

function meetingListAccent(status: string | undefined): string {
  const s = (status ?? '').toUpperCase();
  if (s === 'ACTIVE') return 'var(--success)';
  if (s === 'CONCLUDED' || s === 'ARCHIVED') return 'var(--slate-300)';
  return 'var(--navy-400)';
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
  const basePath = getAppBasePath();

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
  let meetingsPage: MeetingsPage = { content: [], totalElements: 0, totalPages: 0, size: 100, number: 0 };
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
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--slate-200)] bg-white px-1 pb-6 sm:px-2">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <Image
            src={`${basePath}/dgs-logo-dark.png`}
            alt=""
            width={36}
            height={36}
            className="mt-1 hidden shrink-0 rounded-full object-cover sm:block"
            unoptimized
          />
          <div>
            <h1
              className="text-3xl font-bold tracking-tight text-[var(--navy-800)]"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Meetings
            </h1>
            <p className="mt-1 text-base text-[var(--slate-500)]">Browse and filter meetings by body, status, and type.</p>
          </div>
        </div>
        {canCreateMeeting && (
          <Link href="/meetings/create" className="btn-primary shrink-0">
            Create Meeting
          </Link>
        )}
      </header>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-700">Filters</h2>
        </div>
        <div className="card-body">
          <form method="get" action={`${basePath}/meetings`} className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-base font-medium text-slate-600">Search</span>
              <input
                type="search"
                name="q"
                defaultValue={q ?? ''}
                placeholder="Title or session number"
                className="input-base min-w-[200px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-base font-medium text-slate-600">Body</span>
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
              <span className="text-base font-medium text-slate-600">Status</span>
              <select name="status" defaultValue={status ?? ''} className="input-base min-w-[140px]">
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-base font-medium text-slate-600">Year</span>
              <select name="year" defaultValue={params.year ?? ''} className="input-base min-w-[100px]">
                {yearOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-base font-medium text-slate-600">Type</span>
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

      <div className="mb-4 flex flex-wrap gap-2 text-base font-medium text-[var(--slate-600)]">
        <span className="self-center text-[var(--slate-500)]">Sort:</span>
        <Link href={buildSortUrl(params, 'title')} className="rounded-md bg-white px-2 py-1 ring-1 ring-[var(--slate-200)] hover:bg-[var(--slate-50)]">
          Title {sortBy === 'title' && (sortDir === 'asc' ? '↑' : '↓')}
        </Link>
        <Link href={buildSortUrl(params, 'bodyName')} className="rounded-md bg-white px-2 py-1 ring-1 ring-[var(--slate-200)] hover:bg-[var(--slate-50)]">
          Body {sortBy === 'bodyName' && (sortDir === 'asc' ? '↑' : '↓')}
        </Link>
        <Link href={buildSortUrl(params, 'startDate')} className="rounded-md bg-white px-2 py-1 ring-1 ring-[var(--slate-200)] hover:bg-[var(--slate-50)]">
          Dates {sortBy === 'startDate' && (sortDir === 'asc' ? '↑' : '↓')}
        </Link>
        <Link href={buildSortUrl(params, 'status')} className="rounded-md bg-white px-2 py-1 ring-1 ring-[var(--slate-200)] hover:bg-[var(--slate-50)]">
          Status {sortBy === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
        </Link>
      </div>

      <div className="space-y-4">
        {meetings.length === 0 ? (
          <div className="rounded-xl border border-[var(--slate-200)] bg-white py-12 text-center shadow-sm">
            <p className="text-[var(--slate-500)]">No meetings found. Try adjusting your filters.</p>
            {!accessToken && (
              <p className="mt-2 text-base text-amber-600">You may need to sign in again so the app can load data from the API.</p>
            )}
          </div>
        ) : (
          meetings.map((m) => {
            const loc = m.location?.trim();
            const when = `${formatDisplayDate(m.startDate)}${loc ? ` · ${loc}` : ''}`;
            return (
              <div
                key={m.meetingId}
                className="rounded-lg border border-[var(--slate-200)] bg-white shadow-sm transition-shadow hover:shadow-md"
                style={{
                  borderLeftWidth: 4,
                  borderLeftStyle: 'solid',
                  borderLeftColor: meetingListAccent(m.status),
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--navy-100)] px-2.5 py-0.5 text-base font-semibold text-[var(--navy-800)]">
                        {m.bodyName}
                      </span>
                      <span className={meetingStatusBadge(m.status)}>{m.status}</span>
                    </div>
                    <Link
                      href={`/meetings/${m.meetingId}`}
                      className="text-3xl font-semibold text-[var(--navy-800)] hover:text-[var(--navy-600)]"
                    >
                      {m.title}
                    </Link>
                    <p className="mt-1 text-base text-[var(--slate-500)]">
                      {when} · {m.meetingType.replace(/_/g, ' ')}
                      {m.sessionNumber ? ` · Session ${m.sessionNumber}` : ''}
                    </p>
                  </div>
                  <Link
                    href={`/meetings/${m.meetingId}`}
                    className="shrink-0 text-base font-medium text-[var(--navy-500)] hover:underline"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {meetingsPage.totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-4 text-base">
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
