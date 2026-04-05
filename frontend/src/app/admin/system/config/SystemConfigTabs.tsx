'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { saveSystemConfig } from '@/lib/api';

type Config = {
  general: { platformName: string; contactEmail: string };
  session: { inactivityTimeoutMinutes: number; mfaRequired: boolean };
  notifications: { smtpHost: string; defaultDigest: string };
  storage: { minioQuotaGb: number; retentionDays: number };
  workflow: { approvalDeadlineDefaultHours: number; escalationGraceHours: number };
  security: { passwordMinLength: number; allowedIpRanges: string };
};

type Props = { config: Config };

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'session', label: 'Session' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'storage', label: 'Storage' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'security', label: 'Security' },
] as const;

export function SystemConfigTabs({ config: initialConfig }: Props) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('general');
  const [config, setConfig] = useState(initialConfig);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const accessToken = (session as { accessToken?: string } | null)?.accessToken;
    if (!accessToken) {
      setError('Not authenticated');
      setSaving(false);
      return;
    }
    const payload = {
      general: config.general,
      session: config.session,
      notifications: config.notifications,
      storage: config.storage,
      workflow: config.workflow,
      security: config.security,
    };
    const ok = await saveSystemConfig(accessToken, payload as Record<string, unknown>);
    setSaving(false);
    if (ok) setSaved(true);
    else setError('Failed to save settings');
  };

  return (
    <div className="card">
      <div className="border-b border-slate-200 px-4">
        <nav className="flex gap-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`border-b-2 py-3 text-sm font-medium ${activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="card-body">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="config-platform-name" className="block text-sm font-medium text-slate-700">Platform name</label>
              <input id="config-platform-name" type="text" value={config.general.platformName} onChange={(e) => setConfig((c) => ({ ...c, general: { ...c.general, platformName: e.target.value } }))} className="input-base mt-1 w-full max-w-md" />
            </div>
            <div>
              <label htmlFor="config-contact-email" className="block text-sm font-medium text-slate-700">Contact email</label>
              <input id="config-contact-email" type="email" value={config.general.contactEmail} onChange={(e) => setConfig((c) => ({ ...c, general: { ...c.general, contactEmail: e.target.value } }))} className="input-base mt-1 w-full max-w-md" />
            </div>
          </div>
        )}
        {activeTab === 'session' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="config-inactivity-timeout" className="block text-sm font-medium text-slate-700">Inactivity timeout (minutes)</label>
              <input id="config-inactivity-timeout" type="number" value={config.session.inactivityTimeoutMinutes} onChange={(e) => setConfig((c) => ({ ...c, session: { ...c.session, inactivityTimeoutMinutes: parseInt(e.target.value, 10) || 30 } }))} className="input-base mt-1 w-32" />
            </div>
            <label htmlFor="config-mfa-required" className="flex items-center gap-2">
              <input id="config-mfa-required" type="checkbox" checked={config.session.mfaRequired} onChange={(e) => setConfig((c) => ({ ...c, session: { ...c.session, mfaRequired: e.target.checked } }))} className="rounded" />
              <span className="text-sm font-medium text-slate-700">MFA required</span>
            </label>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="config-smtp-host" className="block text-sm font-medium text-slate-700">SMTP host</label>
              <input id="config-smtp-host" type="text" value={config.notifications.smtpHost} onChange={(e) => setConfig((c) => ({ ...c, notifications: { ...c.notifications, smtpHost: e.target.value } }))} className="input-base mt-1 w-full max-w-md" />
            </div>
            <div>
              <label htmlFor="config-default-digest" className="block text-sm font-medium text-slate-700">Default digest</label>
              <select id="config-default-digest" value={config.notifications.defaultDigest} onChange={(e) => setConfig((c) => ({ ...c, notifications: { ...c.notifications, defaultDigest: e.target.value } }))} className="input-base mt-1 w-40">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="immediate">Immediate</option>
              </select>
            </div>
            <button type="button" className="btn-secondary">Test SMTP</button>
          </div>
        )}
        {activeTab === 'storage' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="config-minio-quota" className="block text-sm font-medium text-slate-700">MinIO quota (GB)</label>
              <input id="config-minio-quota" type="number" value={config.storage.minioQuotaGb} onChange={(e) => setConfig((c) => ({ ...c, storage: { ...c.storage, minioQuotaGb: parseInt(e.target.value, 10) || 100 } }))} className="input-base mt-1 w-32" />
            </div>
            <div>
              <label htmlFor="config-retention-days" className="block text-sm font-medium text-slate-700">Retention (days)</label>
              <input id="config-retention-days" type="number" value={config.storage.retentionDays} onChange={(e) => setConfig((c) => ({ ...c, storage: { ...c.storage, retentionDays: parseInt(e.target.value, 10) || 365 } }))} className="input-base mt-1 w-32" />
            </div>
          </div>
        )}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="config-approval-deadline" className="block text-sm font-medium text-slate-700">Default approval deadline (hours)</label>
              <input id="config-approval-deadline" type="number" value={config.workflow.approvalDeadlineDefaultHours} onChange={(e) => setConfig((c) => ({ ...c, workflow: { ...c.workflow, approvalDeadlineDefaultHours: parseInt(e.target.value, 10) || 72 } }))} className="input-base mt-1 w-32" />
            </div>
            <div>
              <label htmlFor="config-escalation-grace" className="block text-sm font-medium text-slate-700">Escalation grace period (hours)</label>
              <input id="config-escalation-grace" type="number" value={config.workflow.escalationGraceHours} onChange={(e) => setConfig((c) => ({ ...c, workflow: { ...c.workflow, escalationGraceHours: parseInt(e.target.value, 10) || 24 } }))} className="input-base mt-1 w-32" />
            </div>
          </div>
        )}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="config-password-min-length" className="block text-sm font-medium text-slate-700">Password min length</label>
              <input id="config-password-min-length" type="number" value={config.security.passwordMinLength} onChange={(e) => setConfig((c) => ({ ...c, security: { ...c.security, passwordMinLength: parseInt(e.target.value, 10) || 12 } }))} className="input-base mt-1 w-32" />
            </div>
            <div>
              <label htmlFor="config-allowed-ip-ranges" className="block text-sm font-medium text-slate-700">Allowed IP ranges (optional)</label>
              <input id="config-allowed-ip-ranges" type="text" value={config.security.allowedIpRanges} onChange={(e) => setConfig((c) => ({ ...c, security: { ...c.security, allowedIpRanges: e.target.value } }))} placeholder="e.g. 10.0.0.0/8" className="input-base mt-1 w-full max-w-md" />
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
        {saved && <p className="mt-4 text-sm text-emerald-600">Settings saved. Changes are logged to the audit trail.</p>}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <Link href="/admin/system" className="btn-secondary">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
