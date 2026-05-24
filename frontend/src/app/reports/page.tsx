import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports &amp; Analytics</h1>
        <p className="page-subtitle">
          Overview and links to key data. Detailed report types will be added in a future release.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard" className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
          <div className="card-body flex-1">
            <h2 className="text-base font-medium text-slate-500">Dashboard</h2>
            <p className="mt-2 text-lg font-semibold text-slate-900">Summary &amp; activity</p>
            <p className="mt-1 text-base text-slate-600">User-specific overview and quick stats</p>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3">
            <span className="text-base font-medium text-blue-600">Open dashboard →</span>
          </div>
        </Link>
        <Link href="/meetings" className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
          <div className="card-body flex-1">
            <h2 className="text-base font-medium text-slate-500">Meetings</h2>
            <p className="mt-2 text-lg font-semibold text-slate-900">Meetings list</p>
            <p className="mt-1 text-base text-slate-600">Filter and browse all meetings</p>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3">
            <span className="text-base font-medium text-blue-600">View meetings →</span>
          </div>
        </Link>
        <Link href="/bodies" className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
          <div className="card-body flex-1">
            <h2 className="text-base font-medium text-slate-500">Bodies</h2>
            <p className="mt-2 text-lg font-semibold text-slate-900">International bodies</p>
            <p className="mt-1 text-base text-slate-600">Committees and hierarchy</p>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3">
            <span className="text-base font-medium text-blue-600">View bodies →</span>
          </div>
        </Link>
      </div>
      <div className="mt-8 card">
        <div className="card-body">
          <h2 className="text-base font-semibold text-slate-900">Report types</h2>
          <ul className="mt-3 space-y-2 text-base">
            <li><Link href="/reports/meeting-summary" className="text-blue-600 hover:underline">Meeting summary report</Link> — agenda, documents, positions, tasks, outcomes</li>
            <li><Link href="/reports/analytics" className="text-blue-600 hover:underline">Participation analytics</Link> — submissions, interventions, task completion</li>
            <li><Link href="/reports/approval-pipeline" className="text-blue-600 hover:underline">Approval pipeline</Link> — papers by stage, ageing</li>
            <li><Link href="/reports/audit" className="text-blue-600 hover:underline">Audit report</Link> — searchable audit log (SA/IH)</li>
            <li><Link href="/reports/custom" className="text-blue-600 hover:underline">Custom report builder</Link> — select entities, columns, filters</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
