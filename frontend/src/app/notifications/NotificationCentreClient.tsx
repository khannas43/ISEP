'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { markReadAction, markAllReadAction } from './actions';
import type { NotificationDto } from '@/lib/api';

function buildNotificationLink(n: NotificationDto): string | null {
  if (n.linkedEntityType === 'PAPER' && n.linkedEntityId) return `/papers/${n.linkedEntityId}/approval`;
  if (n.linkedEntityType === 'TASK' && n.linkedEntityId) return `/tasks/${n.linkedEntityId}`;
  if (n.linkedEntityType === 'AGENDA_ITEM' && n.linkedEntityId) {
    const [meetingId, itemId] = n.linkedEntityId.split(':');
    if (meetingId && itemId) return `/meetings/${meetingId}/agenda/${itemId}/feedback/submit`;
  }
  return null;
}

type Props = {
  notifications: NotificationDto[];
  unreadCount: number;
};

export function NotificationCentreClient({ notifications, unreadCount }: Props) {
  const router = useRouter();
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  async function handleMarkRead(notificationId: string) {
    setMarkingId(notificationId);
    await markReadAction(notificationId);
    setMarkingId(null);
    router.refresh();
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    await markAllReadAction();
    setMarkingAll(false);
    router.refresh();
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {unreadCount > 0 && (
            <p className="text-base text-slate-600">{unreadCount} unread</p>
          )}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="btn-secondary text-base"
            >
              {markingAll ? 'Updating…' : 'Mark all as read'}
            </button>
          )}
        </div>
        <ul className="space-y-3">
          {notifications.map((n) => {
            const link = buildNotificationLink(n);
            return (
              <li
                key={n.notificationId}
                className={`rounded-lg border p-4 ${
                  n.isRead ? 'border-slate-200 bg-slate-50/50' : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{n.title ?? n.notificationType}</p>
                    <p className="mt-1 text-base text-slate-600">{n.message ?? ''}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                    </p>
                    {link && (
                      <Link href={link} className="mt-2 inline-block text-base text-blue-600 hover:underline">
                        View →
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.notificationId)}
                        disabled={markingId === n.notificationId}
                        className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
                      >
                        {markingId === n.notificationId ? '…' : 'Mark read'}
                      </button>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 text-sm ${
                        n.isRead ? 'bg-slate-200 text-slate-600' : 'bg-blue-200 text-blue-800'
                      }`}
                    >
                      {n.isRead ? 'Read' : 'New'}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
