import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';
import { SystemHealthDashboard } from './SystemHealthDashboard';

/**
 * SCR-SYS-01 — System health dashboard. Service status from actuator/health when available; mock fallback.
 */
const defaultServices = [
  { id: 'frontend', name: 'Next.js Frontend', status: 'green' as const, lastHeartbeat: new Date().toISOString(), responseTimeMs: 12, errorRate: 0 },
  { id: 'api-gateway', name: 'API Gateway (Kong)', status: 'green' as const, lastHeartbeat: new Date().toISOString(), responseTimeMs: 8, errorRate: 0 },
  { id: 'meetings', name: 'Meetings Service', status: 'green' as const, lastHeartbeat: new Date().toISOString(), responseTimeMs: 45, errorRate: 0 },
  { id: 'documents', name: 'Documents Service', status: 'green' as const, lastHeartbeat: new Date().toISOString(), responseTimeMs: 32, errorRate: 0 },
  { id: 'workflow', name: 'Workflow Service', status: 'green' as const, lastHeartbeat: new Date().toISOString(), responseTimeMs: 28, errorRate: 0 },
  { id: 'postgres', name: 'PostgreSQL', status: 'green' as const, lastHeartbeat: new Date().toISOString(), responseTimeMs: 5, errorRate: 0 },
  { id: 'opensearch', name: 'OpenSearch', status: 'amber' as const, lastHeartbeat: new Date(Date.now() - 120000).toISOString(), responseTimeMs: 120, errorRate: 0.01 },
  { id: 'minio', name: 'MinIO', status: 'green' as const, lastHeartbeat: new Date().toISOString(), responseTimeMs: 18, errorRate: 0 },
  { id: 'redis', name: 'Redis', status: 'green' as const, lastHeartbeat: new Date().toISOString(), responseTimeMs: 2, errorRate: 0 },
  { id: 'keycloak', name: 'Keycloak', status: 'green' as const, lastHeartbeat: new Date().toISOString(), responseTimeMs: 55, errorRate: 0 },
];

async function getMeetingServiceStatus(): Promise<'green' | 'amber' | 'red'> {
  try {
    const base = getApiUrl();
    const res = await fetch(`${base.replace(/\/$/, '')}/actuator/health`, { cache: 'no-store' });
    return res.ok ? 'green' : 'red';
  } catch {
    return 'red';
  }
}

export default async function SystemHealthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  const meetingStatus = await getMeetingServiceStatus();
  const services = defaultServices.map((s) =>
    s.id === 'meetings' ? { ...s, status: meetingStatus, lastHeartbeat: new Date().toISOString() } : s
  );

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/system" className="text-base font-medium text-slate-500 hover:text-slate-700">← System admin</Link>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System health</h1>
          <p className="page-subtitle">
            Real-time status for platform components. Auto-refresh every 30s. Links to Grafana for detailed metrics.
          </p>
        </div>
      </div>
      <SystemHealthDashboard services={services} />
    </div>
  );
}
