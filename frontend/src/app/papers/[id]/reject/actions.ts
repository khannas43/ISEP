'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { rejectPaper } from '@/lib/api';

export async function rejectPaperAction(paperId: string, comments: string): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/api/auth/signin');
  const result = await rejectPaper(token, paperId, comments);
  if (!result) return { error: 'Failed to reject paper' };
  return {};
}
