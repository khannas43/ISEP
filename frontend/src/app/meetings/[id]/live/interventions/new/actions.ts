'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { createIntervention } from '@/lib/api';

export async function createInterventionAction(
  meetingId: string,
  payload: { agendaItemId: string; interventionText: string; deliveredByName?: string; interventionType?: string }
): Promise<{ error?: string }> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/api/auth/signin');
  const result = await createIntervention(token, meetingId, {
    agendaItemId: payload.agendaItemId,
    interventionText: payload.interventionText,
    deliveredByName: payload.deliveredByName ?? undefined,
    interventionType: payload.interventionType ?? 'INFORMATION',
  });
  if (!result) return { error: 'Failed to save intervention' };
  return {};
}
