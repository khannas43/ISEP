'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { createOutcome } from '@/lib/api';

export async function createOutcomeAction(
  meetingId: string,
  payload: { agendaItemId: string; decision: string; resolutionRef?: string; nextSteps?: string }
): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/api/auth/signin');
  const result = await createOutcome(token, meetingId, payload);
  if (!result) return { error: 'Failed to save outcome' };
  return {};
}
