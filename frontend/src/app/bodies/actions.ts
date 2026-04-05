'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type CreateBodyRequest, type UpdateBodyRequest } from '@/lib/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/api/auth/signin');
  return { Authorization: `Bearer ${token}` };
}

export async function createBody(formData: FormData): Promise<{ error?: string; id?: string }> {
  const headers = await getAuthHeaders();
  const body: CreateBodyRequest = {
    name: (formData.get('name') as string)?.trim() ?? '',
    abbreviation: (formData.get('abbreviation') as string)?.trim() || null,
    bodyType: (formData.get('bodyType') as string) ?? 'OTHER',
    description: (formData.get('description') as string)?.trim() || null,
    isActive: formData.get('isActive') === 'on',
  };
  const parentId = (formData.get('parentBodyId') as string)?.trim();
  if (parentId) body.parentBodyId = parentId;

  try {
    const res = await fetch(`${getApiUrl()}/api/v1/bodies`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { error: text || 'Failed to create body' };
    }
    const data = await res.json();
    return { id: data.bodyId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    return {
      error: message.includes('fetch') || message.includes('ECONNREFUSED') || message.includes('network')
        ? 'Backend API is unavailable. Start the backend server and try again.'
        : `Create failed: ${message}`,
    };
  }
}

export async function updateBody(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const body: UpdateBodyRequest = {
    name: (formData.get('name') as string)?.trim(),
    abbreviation: (formData.get('abbreviation') as string)?.trim() || null,
    bodyType: (formData.get('bodyType') as string) || undefined,
    description: (formData.get('description') as string)?.trim() || null,
    isActive: formData.get('isActive') === 'on',
  };
  const parentId = (formData.get('parentBodyId') as string)?.trim();
  if (parentId !== undefined) body.parentBodyId = parentId || null;

  try {
    const res = await fetch(`${getApiUrl()}/api/v1/bodies/${id}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { error: text || 'Failed to update body' };
    }
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    const isUnavailable =
      message.includes('fetch') || message.includes('ECONNREFUSED') || message.includes('network') || message.includes('Failed to fetch');
    const apiUrl = getApiUrl();
    return {
      error: isUnavailable
        ? `Backend API is unavailable. Start meeting-service so it is reachable at ${apiUrl} (e.g. run: cd backend/meeting-service && mvn spring-boot:run). Then click Update again.`
        : `Update failed: ${message}`,
    };
  }
}

export async function deactivateBody(id: string): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiUrl()}/api/v1/bodies/${id}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive: false }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to deactivate body' };
  }
  return {};
}
