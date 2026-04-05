'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import {
  getApiUrl,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '@/lib/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/login');
  return { Authorization: `Bearer ${token}` };
}

export async function createUser(
  body: CreateUserRequest
): Promise<{ error?: string; id?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiUrl()}/api/v1/users`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to create user' };
  }
  const data = await res.json();
  return { id: data.userId };
}

export async function updateUser(
  userId: string,
  body: UpdateUserRequest
): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiUrl()}/api/v1/users/${userId}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to update user' };
  }
  return {};
}

export async function deactivateUser(userId: string): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiUrl()}/api/v1/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: { ...headers },
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to deactivate user' };
  }
  return {};
}

/** Save user committee and correspondence group assignments (SCR-USR-05). */
export async function setUserAssignments(
  userId: string,
  body: { bodyIds: string[]; cgIds: string[] }
): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiUrl()}/api/v1/users/${userId}/assignments`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bodyIds: body.bodyIds ?? [], cgIds: body.cgIds ?? [] }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to save assignments' };
  }
  return {};
}
