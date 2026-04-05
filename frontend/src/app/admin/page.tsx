import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  const isAdmin = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
  if (!isAdmin) redirect('/unauthorized');

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin</h1>
          <p className="page-subtitle">User management, system configuration, and audit (Workstreams 15–16).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <ul className="space-y-3">
            <li>
              <Link href="/admin/users" className="font-medium text-blue-600 hover:underline">
                User list (SCR-USR-01)
              </Link>
            </li>
            <li>
              <Link href="/admin/system" className="font-medium text-blue-600 hover:underline">
                System administration (SCR-SYS-01–05)
              </Link>
              <span className="ml-2 text-sm text-slate-500">— health, config, workflows, backups</span>
            </li>
            <li>
              <Link href="/admin/audit" className="font-medium text-blue-600 hover:underline">
                Audit log (SCR-SYS-02)
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-6">
        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">← Dashboard</Link>
      </p>
    </>
  );
}
