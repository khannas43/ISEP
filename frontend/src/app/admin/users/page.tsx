import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type UserDto, type UsersPage } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';

async function getUsers(
  accessToken: string,
  params: { search?: string; systemRole?: string; activeOnly?: boolean; page?: number }
): Promise<UsersPage> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.systemRole) searchParams.set('systemRole', params.systemRole);
  if (params.activeOnly != null) searchParams.set('activeOnly', String(params.activeOnly));
  if (params.page != null && params.page > 0) searchParams.set('page', String(params.page));
  searchParams.set('size', '20');
  const url = `${getApiUrl()}/api/v1/users?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('[Users] API error:', res.status, res.statusText, url);
    return { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 };
  }
  const data = await res.json();
  const content = Array.isArray(data.content) ? data.content : [];
  return {
    content,
    totalElements: data.totalElements ?? content.length,
    totalPages: data.totalPages ?? 1,
    size: data.size ?? 20,
    number: data.number ?? 0,
  };
}

const SYSTEM_ROLE_LABELS: Record<string, string> = {
  SYSTEM_ADMIN: 'System Admin',
  IC_DIVISION_HEAD: 'IC Division Head',
  DELEGATION_LEADER: 'Delegation Leader',
  COORDINATOR: 'Coordinator',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

type Props = {
  searchParams: Promise<{ search?: string; systemRole?: string; activeOnly?: string; page?: string }>;
};

export default async function UserListPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const isAdmin = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
  if (!isAdmin) redirect('/unauthorized');

  const params = await searchParams;
  const search = params.search ?? undefined;
  const systemRole = params.systemRole ?? undefined;
  let activeOnly: boolean | undefined = undefined;
  if (params.activeOnly === 'true') activeOnly = true;
  else if (params.activeOnly === 'false') activeOnly = false;
  const page = params.page ? parseInt(params.page, 10) : 0;

  const accessToken = (session as { accessToken?: string }).accessToken;
  let usersPage: UsersPage = { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 };
  let apiUnavailable = false;
  if (accessToken) {
    try {
      usersPage = await getUsers(accessToken, { search, systemRole, activeOnly, page });
    } catch {
      apiUnavailable = true;
    }
  }

  const users: UserDto[] = usersPage.content;
  const canCreate = roles.includes('SYSTEM_ADMIN');
  const activeOnlyDefault = activeOnly === undefined ? '' : (activeOnly ? 'true' : 'false');

  return (
    <>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header">
        <div>
          <h1 className="page-title">User list</h1>
          <p className="page-subtitle">Manage users, roles, and status (SCR-USR-01).</p>
        </div>
        {canCreate && (
          <Link href="/admin/users/new" className="btn-primary">
            Add user
          </Link>
        )}
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-700">Filters</h2>
        </div>
        <div className="card-body">
          <form method="get" className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Search</span>
              <input
                type="search"
                name="search"
                defaultValue={search ?? ''}
                placeholder="Name or email"
                className="input-base min-w-[200px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Role</span>
              <select name="systemRole" defaultValue={systemRole ?? ''} className="input-base min-w-[160px]">
                <option value="">All roles</option>
                {Object.entries(SYSTEM_ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">Status</span>
              <select name="activeOnly" defaultValue={activeOnlyDefault} className="input-base min-w-[120px]">
                <option value="">All</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
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
              <th className="table-header px-5 py-3.5">Name</th>
              <th className="table-header px-5 py-3.5">Email</th>
              <th className="table-header px-5 py-3.5">Designation</th>
              <th className="table-header px-5 py-3.5">Organization</th>
              <th className="table-header px-5 py-3.5">Role</th>
              <th className="table-header px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-cell py-12 text-center">
                  <p className="text-slate-500">No users found. Try adjusting your filters.</p>
                  {!accessToken && (
                    <p className="mt-2 text-sm text-amber-600">
                      You may need to sign in again so the app can load data from the API.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.userId} className="transition-colors hover:bg-slate-50/80">
                  <td className="table-cell">
                    <Link
                      href={`/admin/users/${u.userId}`}
                      className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {u.fullName}
                    </Link>
                  </td>
                  <td className="table-cell text-slate-600">{u.email}</td>
                  <td className="table-cell text-slate-600">{u.designation ?? '—'}</td>
                  <td className="table-cell text-slate-600">{u.organization ?? '—'}</td>
                  <td className="table-cell text-slate-600">
                    {SYSTEM_ROLE_LABELS[u.systemRole] ?? u.systemRole}
                  </td>
                  <td className="table-cell">
                    <span className={u.isActive ? 'badge badge-success' : 'badge badge-neutral'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {usersPage.totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          {page > 0 && (
            <Link
              href={`/admin/users?${new URLSearchParams(
                Object.fromEntries(
                  Object.entries({
                    search: search ?? '',
                    systemRole: systemRole ?? '',
                    activeOnly: activeOnly === undefined ? '' : String(activeOnly),
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
            Page {usersPage.number + 1} of {usersPage.totalPages} ({usersPage.totalElements} total)
          </span>
          {page < usersPage.totalPages - 1 && (
            <Link
              href={`/admin/users?${new URLSearchParams(
                Object.fromEntries(
                  Object.entries({
                    search: search ?? '',
                    systemRole: systemRole ?? '',
                    activeOnly: activeOnly === undefined ? '' : String(activeOnly),
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
