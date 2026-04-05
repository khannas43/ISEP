'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/api';

export async function markReadAction(notificationId: string): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/api/auth/signin');
  const result = await markNotificationRead(token, notificationId);
  if (!result) return { error: 'Failed to mark as read' };
  return {};
}

export async function markAllReadAction(): Promise<{ error?: string; marked?: number }> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/api/auth/signin');
  const marked = await markAllNotificationsRead(token);
  return { marked };
}
