import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { PreferencesForm } from './PreferencesForm';

export default async function NotificationPreferencesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <div>
      <div className="mb-6">
        <Link href="/notifications" className="text-base font-medium text-slate-500 hover:text-slate-700">← Notifications</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Notification preferences</h1>
          <p className="page-subtitle">Choose in-portal and/or email for each type. Critical system notifications cannot be disabled.</p>
          <PreferencesForm />
        </div>
      </div>
    </div>
  );
}
