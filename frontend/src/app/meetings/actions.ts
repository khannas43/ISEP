'use server';

/**
 * Server actions for meetings: create/update meeting, agenda items, participants, tasks, correspondence groups.
 * All actions get session and call backend with Bearer token; return { error?: string } on failure.
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type CreateMeetingRequest, type AddParticipantRequest } from '@/lib/api';

export type CreateAgendaItemPayload = {
  itemNumber?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  deadlineForInputs?: string | null;
  assignedCoordinatorId?: string | null;
};

export type UpdateAgendaItemPayload = {
  itemNumber?: string | null;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  deadlineForInputs?: string | null;
  assignedCoordinatorId?: string | null;
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;
  if (!token) redirect('/login');
  return { Authorization: `Bearer ${token}` };
}

/** Parse API error response: prefer JSON message field, else status text, else fallback. */
async function apiErrorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  if (!text?.trim()) return res.status === 404 ? 'Meeting or resource not found.' : fallback;
  try {
    const json = JSON.parse(text) as { message?: string; error?: string };
    if (typeof json.message === 'string' && json.message.trim()) return json.message.trim();
    if (typeof json.error === 'string' && json.error.trim()) return json.error.trim();
  } catch {
    // not JSON
  }
  return text.length > 200 ? `${text.slice(0, 200)}…` : text;
}

export async function createMeeting(formData: FormData): Promise<{ error?: string; id?: string }> {
  const headers = await getAuthHeaders();
  const bodyId = (formData.get('bodyId') as string)?.trim();
  if (!bodyId) return { error: 'Body is required' };

  const body: CreateMeetingRequest = {
    bodyId,
    title: (formData.get('title') as string)?.trim() ?? '',
    startDate: (formData.get('startDate') as string)?.trim() ?? '',
    endDate: (formData.get('endDate') as string)?.trim() ?? '',
    meetingType: (formData.get('meetingType') as string) ?? 'IN_PERSON',
    sessionNumber: (formData.get('sessionNumber') as string)?.trim() || null,
    location: (formData.get('location') as string)?.trim() || null,
    notes: (formData.get('notes') as string)?.trim() || null,
  };

  const res = await fetch(`${getApiUrl()}/api/v1/meetings`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to create meeting' };
  }
  const data = await res.json();
  return { id: data.meetingId };
}

export type UpdateMeetingPayload = {
  bodyId?: string;
  title?: string;
  sessionNumber?: string | null;
  startDate?: string;
  endDate?: string;
  location?: string | null;
  meetingType?: string;
  notes?: string | null;
};

export async function updateMeeting(meetingId: string, payload: UpdateMeetingPayload): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const body: Record<string, unknown> = {};
  if (payload.bodyId != null) body.bodyId = payload.bodyId;
  if (payload.title != null) body.title = payload.title;
  if (payload.sessionNumber != null) body.sessionNumber = payload.sessionNumber;
  if (payload.startDate != null) body.startDate = payload.startDate;
  if (payload.endDate != null) body.endDate = payload.endDate;
  if (payload.location != null) body.location = payload.location;
  if (payload.meetingType != null) body.meetingType = payload.meetingType;
  if (payload.notes != null) body.notes = payload.notes;

  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = 'Failed to update meeting';
    try {
      const j = JSON.parse(text) as { message?: string; error?: string; detail?: string };
      message = j.message ?? j.detail ?? j.error ?? message;
    } catch {
      if (res.status === 404) message = 'Meeting not found. Rebuild meeting-service if you added the edit feature.';
      else if (res.status === 400) message = 'Invalid data: ' + (text.slice(0, 200) || 'Bad request');
      else if (text && text.length < 300) message = text;
    }
    if (res.status > 0) message = `(${res.status}) ${message}`;
    return { error: message };
  }
  return {};
}

export async function updateMeetingStatus(meetingId: string, status: string, cancellationReason?: string): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const url = new URL(`${getApiUrl()}/api/v1/meetings/${meetingId}/status`);
  url.searchParams.set('status', status);
  if (cancellationReason) url.searchParams.set('cancellationReason', cancellationReason);
  const res = await fetch(url.toString(), { method: 'PATCH', headers: { ...headers } });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to update status' };
  }
  return {};
}

export async function addParticipant(
  meetingId: string,
  body: AddParticipantRequest
): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/participants`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to add participant' };
  }
  return {};
}

export async function removeParticipant(meetingId: string, participantId: string): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${getApiUrl()}/api/v1/meetings/${meetingId}/participants/${participantId}`,
    { method: 'DELETE', headers: { ...headers } }
  );
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to remove participant' };
  }
  return {};
}

export async function updateParticipantRole(
  meetingId: string,
  participantId: string,
  meetingRole: string
): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${getApiUrl()}/api/v1/meetings/${meetingId}/participants/${participantId}`,
    {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingRole }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to update role' };
  }
  return {};
}

export async function createAgendaItem(
  meetingId: string,
  payload: CreateAgendaItemPayload
): Promise<{ error?: string; agendaItemId?: string }> {
  const headers = await getAuthHeaders();
  const body: Record<string, unknown> = {
    title: payload.title.trim(),
  };
  if (payload.itemNumber != null && payload.itemNumber.trim() !== '') body.itemNumber = payload.itemNumber.trim();
  if (payload.description != null) body.description = payload.description || null;
  if (payload.category != null && payload.category.trim() !== '') body.category = payload.category.trim();
  if (payload.priority != null && payload.priority.trim() !== '') body.priority = payload.priority.trim();
  if (payload.status != null && payload.status.trim() !== '') body.status = payload.status.trim();
  if (payload.deadlineForInputs != null && payload.deadlineForInputs.trim() !== '') {
    const s = payload.deadlineForInputs.trim();
    body.deadlineForInputs = s.length <= 16 ? `${s}:00Z` : s;
  }
  if (payload.assignedCoordinatorId != null && payload.assignedCoordinatorId.trim() !== '') {
    body.assignedCoordinatorId = payload.assignedCoordinatorId.trim();
  }
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const message = await apiErrorMessage(res, 'Failed to create agenda item');
    return { error: message };
  }
  const data = (await res.json()) as { agendaItemId?: string };
  return { agendaItemId: data.agendaItemId };
}

export async function updateAgendaItem(
  meetingId: string,
  agendaItemId: string,
  payload: UpdateAgendaItemPayload
): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const body: Record<string, unknown> = {};
  if (payload.itemNumber != null) body.itemNumber = payload.itemNumber.trim() || null;
  if (payload.title != null) body.title = payload.title.trim() || null;
  if (payload.description != null) body.description = payload.description || null;
  if (payload.category != null) body.category = payload.category.trim() || null;
  if (payload.priority != null) body.priority = payload.priority.trim() || null;
  if (payload.status != null) body.status = payload.status.trim() || null;
  if (payload.deadlineForInputs != null) {
    const s = (payload.deadlineForInputs || '').trim();
    body.deadlineForInputs = s ? (s.length <= 16 ? `${s}:00Z` : s) : null;
  }
  if (payload.assignedCoordinatorId != null) body.assignedCoordinatorId = payload.assignedCoordinatorId.trim() || null;
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items/${agendaItemId}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const message = await apiErrorMessage(res, 'Failed to update agenda item');
    return { error: message };
  }
  return {};
}

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  assignedToId: string;
  priority?: string | null;
  dueDate?: string | null;
  status?: string | null;
};

export type UpdateTaskPayload = {
  title?: string | null;
  description?: string | null;
  assignedToId?: string | null;
  priority?: string | null;
  dueDate?: string | null;
  status?: string | null;
};

export async function createTask(
  meetingId: string,
  payload: CreateTaskPayload
): Promise<{ error?: string; taskId?: string }> {
  const headers = await getAuthHeaders();
  const body: Record<string, unknown> = {
    title: payload.title.trim(),
    assignedToId: payload.assignedToId,
  };
  if (payload.description != null) body.description = payload.description || null;
  if (payload.priority != null && payload.priority.trim() !== '') body.priority = payload.priority.trim();
  if (payload.dueDate != null && payload.dueDate.trim() !== '') {
    const s = payload.dueDate.trim();
    body.dueDate = s.length <= 16 ? `${s}:00Z` : s;
  }
  if (payload.status != null && payload.status.trim() !== '') body.status = payload.status.trim();
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/tasks`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to create task' };
  }
  const data = await res.json();
  return { taskId: data.taskId };
}

export async function updateTask(
  meetingId: string,
  taskId: string,
  payload: UpdateTaskPayload
): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const body: Record<string, unknown> = {};
  if (payload.title != null) body.title = payload.title.trim() || null;
  if (payload.description != null) body.description = payload.description || null;
  if (payload.assignedToId != null) body.assignedToId = payload.assignedToId.trim() || null;
  if (payload.priority != null) body.priority = payload.priority.trim() || null;
  if (payload.dueDate != null) {
    const s = (payload.dueDate || '').trim();
    body.dueDate = s ? (s.length <= 16 ? `${s}:00Z` : s) : null;
  }
  if (payload.status != null) body.status = payload.status.trim() || null;
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to update task' };
  }
  return {};
}

/**
 * Upload a meeting document. Accepts FormData so the File is not serialized (Server Actions cannot receive File objects).
 * FormData must contain: meetingId, title, file; optional: documentType, source, agendaItemId.
 */
export async function uploadMeetingDocument(
  formData: FormData
): Promise<{ error?: string; documentId?: string }> {
  const meetingId = (formData.get('meetingId') as string)?.trim();
  if (!meetingId) return { error: 'Meeting ID is required.' };
  const title = (formData.get('title') as string)?.trim();
  if (!title) return { error: 'Title is required.' };
  const file = formData.get('file');
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: 'Please select a file.' };
  }
  const headers = await getAuthHeaders();
  const body = new FormData();
  body.set('title', title);
  const documentType = formData.get('documentType');
  if (documentType && typeof documentType === 'string') body.set('documentType', documentType);
  const source = formData.get('source');
  if (source && typeof source === 'string') body.set('source', source);
  const agendaItemId = formData.get('agendaItemId');
  if (agendaItemId && typeof agendaItemId === 'string') body.set('agendaItemId', agendaItemId);
  body.set('file', file);
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/documents`, {
    method: 'POST',
    headers: { ...headers },
    body,
  });
  if (!res.ok) {
    const message = await apiErrorMessage(res, 'Failed to upload document');
    return { error: message };
  }
  const data = (await res.json()) as { documentId?: string };
  return { documentId: data.documentId };
}

/** Set which correspondence groups are linked to a meeting (only CGs for the meeting's body). */
export async function setMeetingCorrespondenceGroups(
  meetingId: string,
  cgIds: string[]
): Promise<{ error?: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/correspondence-groups`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(cgIds ?? []),
  });
  if (!res.ok) {
    const message = await apiErrorMessage(res, 'Failed to update correspondence groups');
    return { error: message };
  }
  return {};
}
