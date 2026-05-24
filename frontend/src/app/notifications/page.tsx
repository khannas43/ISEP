import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getNotifications, getUnreadNotificationCount, type NotificationDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { NotificationCentreClient } from './NotificationCentreClient';

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const accessToken = (session as { accessToken?: string }).accessToken;
  let notifications: NotificationDto[] = [];
  let unreadCount = 0;
  let apiUnavailable = false;
  if (accessToken) {
    try {
      const [list, count] = await Promise.all([
        getNotifications(accessToken),
        getUnreadNotificationCount(accessToken),
      ]);
      notifications = list.content;
      unreadCount = count;
    } catch {
      apiUnavailable = true;
    }
  }
  return (
    <div>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Notification centre</h1>
          <p className="page-subtitle">All your notifications. Mark as read or mark all read. Notifications older than 90 days archived.</p>
        </div>
        <Link href="/account/notification-preferences" className="btn-secondary text-base">Preferences</Link>
      </div>
      <NotificationCentreClient notifications={notifications} unreadCount={unreadCount} />
    </div>
  );
}
