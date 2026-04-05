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

export type CreateCorrespondenceGroupPayload = {
  parentBodyId: string;
  name: string;
  mandate?: string | null;
  indiaLeadId?: string | null;
  startDate: string;
  endDate: string;
  status?: string | null;
  imsoReference?: string | null;
};

export type UpdateCorrespondenceGroupPayload = {
  parentBodyId?: string | null;
  name?: string | null;
  mandate?: string | null;
  indiaLeadId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  imsoReference?: string | null;
};

export async function createCorrespondenceGroup(
  payload: CreateCorrespondenceGroupPayload
): Promise<{ error?: string; cgId?: string }> {
  const headers = await getAuthHeaders();
  const body = {
    parentBodyId: payload.parentBodyId,
    name: payload.name.trim(),
    mandate: payload.mandate || null,
    indiaLeadId: payload.indiaLeadId || null,
    startDate: payload.startDate,
    endDate: payload.endDate,
    status: payload.status || 'ACTIVE',
    imsoReference: payload.imsoReference || null,
  };
  const res = await fetch(`${getApiUrl()}/api/v1/correspondence-groups`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to create correspondence group' };
  }
  const data = await res.json();
  return { cgId: data.cgId };
}

export async function updateCorrespondenceGroup(
  cgId: string,
  payload: UpdateCorrespondenceGroupPayload
): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const body: Record<string, unknown> = {};
  if (payload.parentBodyId != null) body.parentBodyId = payload.parentBodyId;
  if (payload.name != null) body.name = payload.name.trim();
  if (payload.mandate != null) body.mandate = payload.mandate;
  if (payload.indiaLeadId != null) body.indiaLeadId = payload.indiaLeadId;
  if (payload.startDate != null) body.startDate = payload.startDate;
  if (payload.endDate != null) body.endDate = payload.endDate;
  if (payload.status != null) body.status = payload.status;
  if (payload.imsoReference != null) body.imsoReference = payload.imsoReference;
  const res = await fetch(`${getApiUrl()}/api/v1/correspondence-groups/${cgId}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to update correspondence group' };
  }
  return {};
}
