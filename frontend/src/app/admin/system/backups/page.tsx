import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { BackupStatusTable } from './BackupStatusTable';

/**
 * SCR-SYS-05 — Backup & recovery status. Automated backup jobs, run now, runbook link.
 */
export default async function BackupsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  // Backup jobs from API when endpoint exists; empty until then
  const backupJobs: Array<{ id: string; name: string; lastRun: string; status: string; nextRun: string; sizeGb: number }> = [];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/system" className="text-base font-medium text-slate-500 hover:text-slate-700">← System admin</Link>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Backup & recovery</h1>
          <p className="page-subtitle">
            Status of automated backup jobs. Manual &quot;Run now&quot; for on-demand backups. Failed jobs are flagged and alert SA.
          </p>
        </div>
      </div>
      <BackupStatusTable jobs={backupJobs} />
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-base text-amber-800">
        <strong>Recovery runbook:</strong> In production, a link to the recovery runbook documentation would be shown here.
      </div>
    </div>
  );
}
