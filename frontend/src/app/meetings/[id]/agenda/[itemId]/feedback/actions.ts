'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import {
  saveFeedback,
  submitFeedback,
  type SaveFeedbackRequest,
  type FeedbackDto,
} from '@/lib/api';

async function getAccessToken(): Promise<string> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/login');
  return token;
}

export async function saveFeedbackAction(
  agendaItemId: string,
  payload: { position?: string; comments?: string; suggestedAmendments?: string; documentId?: string | null }
): Promise<{ error?: string; feedback?: FeedbackDto }> {
  const accessToken = await getAccessToken();
  const body: SaveFeedbackRequest = {
    agendaItemId,
    position: payload.position ?? undefined,
    comments: payload.comments ?? undefined,
    suggestedAmendments: payload.suggestedAmendments ?? undefined,
    documentId: payload.documentId ?? undefined,
  };
  const feedback = await saveFeedback(accessToken, body);
  if (!feedback) return { error: 'Failed to save feedback' };
  return { feedback };
}

export async function submitFeedbackAction(feedbackId: string): Promise<{ error?: string; feedback?: FeedbackDto }> {
  const accessToken = await getAccessToken();
  const feedback = await submitFeedback(accessToken, feedbackId);
  if (!feedback) return { error: 'Failed to submit feedback' };
  return { feedback };
}
