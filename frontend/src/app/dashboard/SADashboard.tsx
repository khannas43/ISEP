import Link from 'next/link';

type HealthEntry = { service: string; status: 'up' | 'down'; message?: string };

type Props = {
  userName: string;
  usersTotal: number;
  activeMeetingsCount: number;
  papersInApprovalCount?: number;
  health: HealthEntry[];
  recentAuditCount?: number;
};

/**
 * SCR-DASH-01 — System Administrator Dashboard
 * Platform health, total users, active meetings, quick-links to user management, system config, audit.
 */
export function SADashboard({ userName, usersTotal, activeMeetingsCount, papersInApprovalCount = 0, health, recentAuditCount = 0 }: Props) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Administrator Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {userName}. Platform overview and quick actions.
          </p>
        </div>
      </div>

      {/* Platform health */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-900">Platform health</h2>
        </div>
        <div className="card-body">
          <ul className="space-y-2">
            {health.map((h) => (
              <li key={h.service} className="flex items-center gap-3">
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    h.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  aria-hidden
                />
                <span className="font-medium text-slate-700">{h.service}</span>
                <span className="text-base text-slate-500">{h.status === 'up' ? 'Up' : 'Down'}</span>
                {h.message && <span className="text-sm text-slate-400">{h.message}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Registered users</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{usersTotal}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Active meetings</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{activeMeetingsCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Pending system alerts</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">0</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Papers in approval</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{papersInApprovalCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick links */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Quick links</h2>
          </div>
          <div className="card-body space-y-3">
            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">User management</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">Admin home</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/bodies"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">International Bodies</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/meetings"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">Meetings</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/meetings/create"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">Create Meeting</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/admin/system/config"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">System configuration</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/admin/audit"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">Audit log</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
            <Link
              href="/admin/system/health"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">System health</span>
              <span className="text-base text-blue-600">→</span>
            </Link>
          </div>
        </div>

        {/* Recent audit events + Announcement */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent audit events</h2>
              <Link href="/admin/audit" className="text-base font-medium text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="card-body">
              <p className="text-base text-slate-500">{recentAuditCount > 0 ? `${recentAuditCount} recent entries in audit log.` : 'Audit log available from System admin.'}</p>
              <p className="mt-2">
                <Link href="/admin/audit" className="text-base font-medium text-blue-600 hover:underline">Open audit log →</Link>
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">System announcement</h2>
              <Link href="/admin/announcements/new" className="text-base font-medium text-blue-600 hover:underline">New</Link>
            </div>
            <div className="card-body">
              <p className="text-base text-slate-500">Broadcast messages to all users. Compose from Admin → New announcement.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
