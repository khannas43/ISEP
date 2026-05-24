import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { WarRoomDashboard } from './_components/WarRoomDashboard';

export const metadata: Metadata = { title: 'IMO Meetings — ISEP' };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  return <WarRoomDashboard />;
}
