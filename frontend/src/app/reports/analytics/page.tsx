import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';
import { AnalyticsReportClient } from './AnalyticsReportClient';

export default async function AnalyticsReportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const accessToken = (session as { accessToken?: string }).accessToken ?? '';

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
              Live meeting KPIs from the API: participation, tasks, and papers. Select a meeting to refresh metrics and
              export.
            </p>
          </div>

          <AnalyticsReportClient accessToken={accessToken} />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-base font-semibold text-slate-900">Organisation snapshot</h2>
          <p className="mt-1 text-sm text-slate-600">
            Submissions per committee and task counts from the API when available. Date range and drill-down can extend
            this view in production.
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
              <p className="text-xs font-medium uppercase text-slate-500">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{taskStats.pending}</p>
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
