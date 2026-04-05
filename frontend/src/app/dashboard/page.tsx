/**
 * Dashboard route — redirects to the Executive Dashboard (single dashboard experience).
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');
  redirect('/dashboard/executive');
}
