import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function SystemAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  const links = [
    { href: '/admin/system/health', label: 'System health', desc: 'Service status, heartbeats, metrics (SCR-SYS-01)' },
    { href: '/admin/system/config', label: 'System configuration', desc: 'Platform settings, session, notifications, workflow defaults (SCR-SYS-03)' },
    { href: '/admin/system/workflows', label: 'Workflow configuration', desc: 'Approval chain stages, deadlines, escalation (SCR-SYS-04)' },
    { href: '/admin/system/backups', label: 'Backup & recovery', desc: 'Backup jobs status, run now, runbook (SCR-SYS-05)' },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Admin</Link>
      </div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System administration</h1>
          <p className="page-subtitle">Health, configuration, workflows, and backups.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map(({ href, label, desc }) => (
          <Link key={href} href={href} className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
            <div className="card-body">
              <h2 className="font-semibold text-slate-900">{label}</h2>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
