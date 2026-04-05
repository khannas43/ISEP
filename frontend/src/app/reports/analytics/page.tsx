import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';

const mockMetrics = [
  { label: 'Members participated', value: '24', subtext: 'of 28 assigned' },
  { label: 'Tasks completed', value: '87%', subtext: '41 of 47 tasks' },
  { label: 'Papers finalised', value: '6', subtext: 'of 9 agenda items' },
  { label: 'Avg approval cycle', value: '4.2 days', subtext: 'target: 5 days' },
];

const mockBars = [
  { label: 'MSC 108', value: 92 },
  { label: 'MEPC 82', value: 78 },
  { label: 'HTW 11', value: 85 },
];

export default async function AnalyticsReportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let submissionsByBody: Array<{ bodyName: string; submissionsCount: number; meetingsCount: number }> = [];
  let taskStats = { total: 0, completed: 0, inProgress: 0, pending: 0 };
  if (accessToken) {
    try {
      const [bodiesRes, meetingsRes, tasksRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/v1/bodies`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }),
        fetch(`${getApiUrl()}/api/v1/meetings?size=500`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }),
        fetch(`${getApiUrl()}/api/v1/tasks?size=500`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }).catch(() => null),
      ]);
      const bodies = bodiesRes.ok ? await bodiesRes.json() : [];
      const meetings = meetingsRes.ok ? (await meetingsRes.json()).content ?? [] : [];
      const tasks = tasksRes?.ok ? (await tasksRes.json()).content ?? [] : [];
      submissionsByBody = (Array.isArray(bodies) ? bodies : []).map((b: { bodyId: string; name: string }) => ({
        bodyName: b.name,
        submissionsCount: 0,
        meetingsCount: (Array.isArray(meetings) ? meetings : []).filter((m: { bodyId?: string }) => m.bodyId === b.bodyId).length,
      }));
      const taskList = Array.isArray(tasks) ? tasks : [];
      taskStats = {
        total: taskList.length,
        completed: taskList.filter((t: { status?: string }) => t.status === 'COMPLETED').length,
        inProgress: taskList.filter((t: { status?: string }) => t.status === 'IN_PROGRESS').length,
        pending: taskList.filter((t: { status?: string }) => t.status === 'PENDING').length,
      };
    } catch {
      // Leave empty when API unavailable
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/reports" className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Reports
        </Link>
      </div>

      <div className="card mb-6">
        <div className="card-body space-y-6">
          <div>
            <h1 className="page-title">Participation analytics</h1>
            <p className="page-subtitle">
              Representative metrics for demo. Live analytics and exports arrive in Sprint 3.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mockMetrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase text-slate-500">{m.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{m.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{m.subtext}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">Participation by committee (mock)</h2>
            <div className="mt-3 space-y-3">
              {mockBars.map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-sm text-slate-600">
                    <span>{b.label}</span>
                    <span>{b.value}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${b.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['PDF', 'Excel', 'XML'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                disabled
                title="Export — Sprint 3 delivery"
                className="cursor-not-allowed rounded border border-slate-200 px-3 py-1.5 text-sm text-slate-400"
              >
                Export {fmt}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
            <strong>Sprint 3 feature:</strong> Live analytics powered by meeting data, auto-generated MoM, and configurable
            exports will be available in Sprint 3. Data shown is representative of final interface.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-base font-semibold text-slate-900">Live data snapshot</h2>
          <p className="mt-1 text-sm text-slate-600">
            Submissions per committee and task counts from the API when available. Date range and drill-down in production.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Tasks total</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{taskStats.total}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Tasks completed</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">{taskStats.completed}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">In progress</p>
              <p className="mt-1 text-2xl font-semibold text-amber-600">{taskStats.inProgress}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Feedback submitted</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">0</p>
            </div>
          </div>

          <h3 className="mt-8 text-base font-semibold text-slate-900">By body / committee</h3>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="table-header px-4 py-2.5 text-left">Body</th>
                  <th className="table-header px-4 py-2.5 text-left">Meetings</th>
                  <th className="table-header px-4 py-2.5 text-left">Submissions (demo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissionsByBody.map((r) => (
                  <tr key={r.bodyName}>
                    <td className="table-cell px-4 py-2.5 font-medium text-slate-900">{r.bodyName}</td>
                    <td className="table-cell px-4 py-2.5 text-slate-600">{r.meetingsCount}</td>
                    <td className="table-cell px-4 py-2.5 text-slate-600">{r.submissionsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-500">Empty table when the API is unavailable or returns no bodies.</p>
        </div>
      </div>
    </div>
  );
}
