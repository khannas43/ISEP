import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAuditReport } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { AuditLogViewer } from './AuditLogViewer';

function mapToViewerEntry(d: { auditId: string; timestamp: string; userEmail?: string; actionType: string; entityType: string; entityId?: string; description?: string }) {
  return {
    id: String(d.auditId),
    userId: '',
    userName: d.userEmail ?? '—',
    action: d.actionType,
    entityType: d.entityType,
    entityId: d.entityId ?? '',
    timestamp: d.timestamp,
    ipAddress: '—',
    details: d.description ?? '',
  };
}

export default async function AdminAuditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const isSA = roles.includes('SYSTEM_ADMIN');
  const isIH = roles.includes('IC_DIVISION_HEAD');
  if (!isSA && !isIH) redirect('/unauthorized');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let entries: ReturnType<typeof mapToViewerEntry>[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      // Record "Viewed audit log" so the log has at least one entry and we verify POST works
      const { postAuditLog } = await import('@/lib/api');
      await postAuditLog(accessToken, {
        actionType: 'VIEW',
        entityType: 'AUDIT',
        description: 'Viewed audit log',
      }).catch(() => {});
      const { content } = await getAuditReport(accessToken, { size: 100 });
      entries = (content ?? []).map(mapToViewerEntry);
      console.info('[Audit] getAuditReport returned', (content ?? []).length, 'entries');
    } catch (err) {
      console.error('[Audit] getAuditReport or postAuditLog failed', err);
      apiUnavailable = true;
    }
  }

  return (
    <div>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="mb-6">
        <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Admin</Link>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit log</h1>
          <p className="page-subtitle">
            Searchable system audit log. Filters: user, action type, entity type, date range, IP. Export CSV/JSON. Read-only.
          </p>
        </div>
      </div>
      <AuditLogViewer entries={entries} readOnly={!isSA} />
    </div>
  );
}
