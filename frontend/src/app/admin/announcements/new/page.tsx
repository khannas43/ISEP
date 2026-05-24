import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AnnouncementForm } from './AnnouncementForm';

/**
 * SCR-CAL-04 — System announcement broadcast. SA only. Subject, body, urgency, scope.
 */
export default async function NewAnnouncementPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN')) redirect('/unauthorized');

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-base font-medium text-slate-500 hover:text-slate-700">← Admin</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">New announcement</h1>
          <p className="page-subtitle">Compose and broadcast a system-wide announcement. Preview before sending. Appears as pinned banner and email.</p>
          <AnnouncementForm />
        </div>
      </div>
    </div>
  );
}
