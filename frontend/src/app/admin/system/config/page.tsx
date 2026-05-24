import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getSystemConfig } from '@/lib/api';
import { SystemConfigTabs } from './SystemConfigTabs';

const defaultConfig = {
  general: { platformName: 'ISEP', contactEmail: 'admin@example.org' },
  session: { inactivityTimeoutMinutes: 30, mfaRequired: true },
  notifications: { smtpHost: 'smtp.example.org', defaultDigest: 'daily' },
  storage: { minioQuotaGb: 100, retentionDays: 365 },
  workflow: { approvalDeadlineDefaultHours: 72, escalationGraceHours: 24 },
  security: { passwordMinLength: 12, allowedIpRanges: '' },
};

export default async function SystemConfigPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let config = defaultConfig;
  if (accessToken) {
    const fromApi = await getSystemConfig(accessToken);
    if (fromApi && typeof fromApi === 'object') {
      config = {
        general: { ...defaultConfig.general, ...fromApi.general },
        session: { ...defaultConfig.session, ...fromApi.session },
        notifications: { ...defaultConfig.notifications, ...fromApi.notifications },
        storage: { ...defaultConfig.storage, ...fromApi.storage },
        workflow: { ...defaultConfig.workflow, ...fromApi.workflow },
        security: { ...defaultConfig.security, ...fromApi.security },
      };
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/system" className="text-base font-medium text-slate-500 hover:text-slate-700">← System admin</Link>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System configuration</h1>
          <p className="page-subtitle">
            Platform-wide settings. All changes are logged to the audit trail.
          </p>
        </div>
      </div>
      <SystemConfigTabs config={config} />
    </div>
  );
}
