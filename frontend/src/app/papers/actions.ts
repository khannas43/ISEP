'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getPaperDraft, type PaperDraftResponse } from '@/lib/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/login');
  return { Authorization: `Bearer ${token}` };
}

/**
 * Fetch paper draft from backend for use in draft page (server component).
 * Returns null if backend is unavailable or paper has no draft yet; caller can fall back to mock.
 */
export async function getPaperDraftForPage(
  paperId: string
): Promise<PaperDraftResponse | null> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) return null;
  try {
    return await getPaperDraft(token, paperId);
  } catch {
    return null;
  }
}

/**
 * Save paper draft to backend. Called from client (PaperDraftView) on manual save and auto-save.
 * Returns { error } on failure; { version } on success when backend returns it.
 */
export async function savePaperDraft(
  paperId: string,
  contentJsonString: string,
  version?: number | null
): Promise<{ error?: string; version?: number }> {
  const headers = await getAuthHeaders();
  const body: { content: unknown; version?: number } = {
    content: JSON.parse(contentJsonString) as unknown,
  };
  if (version != null) body.version = version;

  const res = await fetch(`${getApiUrl()}/api/v1/papers/${paperId}/draft`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = 'Failed to save draft';
    try {
      const json = JSON.parse(text) as { message?: string; error?: string };
      if (json.message) message = json.message;
      else if (json.error) message = json.error;
    } catch {
      if (text) message = text.length > 200 ? `${text.slice(0, 200)}…` : text;
    }
    return { error: message };
  }

  try {
    const data = (await res.json()) as { version?: number };
    return { version: data.version };
  } catch {
    return {};
  }
}
