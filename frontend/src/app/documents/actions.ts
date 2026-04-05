'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/login');
  return { Authorization: `Bearer ${token}` };
}

async function apiErrorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  if (!text?.trim()) return res.status === 404 ? 'Document not found.' : fallback;
  try {
    const json = JSON.parse(text) as { message?: string; error?: string };
    if (typeof json.message === 'string' && json.message.trim()) return json.message.trim();
    if (typeof json.error === 'string' && json.error.trim()) return json.error.trim();
  } catch {
    // not JSON
  }
  return text.length > 200 ? `${text.slice(0, 200)}…` : text;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME_PREFIXES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument',
];

function isAllowedMimeType(mime: string | null): boolean {
  if (!mime) return false;
  return ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p));
}

/**
 * Upload a new version of a document. FormData must contain: documentId, changeSummary, file.
 */
export async function uploadDocumentNewVersion(
  formData: FormData
): Promise<{ error?: string; documentId?: string; newVersion?: number }> {
  const documentId = (formData.get('documentId') as string)?.trim();
  if (!documentId) return { error: 'Document ID is required.' };
  const changeSummary = (formData.get('changeSummary') as string)?.trim();
  if (!changeSummary) return { error: 'Change summary is required.' };
  const file = formData.get('file');
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: 'Please select a file.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: 'File size must be 20 MB or less.' };
  }
  if (!isAllowedMimeType(file.type)) {
    return { error: 'File type not allowed. Use PDF, DOC, DOCX, XLS, XLSX, PPT, or PPTX.' };
  }

  const headers = await getAuthHeaders();
  const body = new FormData();
  body.set('changeSummary', changeSummary);
  body.set('file', file);

  const res = await fetch(`${getApiUrl()}/api/v1/documents/${documentId}/versions`, {
    method: 'POST',
    headers: { ...headers },
    body,
  });

  if (!res.ok) {
    const message = await apiErrorMessage(res, 'Failed to upload new version.');
    return { error: message };
  }

  const data = (await res.json()) as { documentId?: string; currentVersion?: number };
  return { documentId: data.documentId, newVersion: data.currentVersion };
}
