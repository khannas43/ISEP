/**
 * ISEP Frontend API Client
 * -----------------------
 * Central module for all backend API calls. Use getApiUrl() and pass accessToken from
 * getServerSession() in server components, or from session in server actions.
 * Project rule: All list/detail data and dropdown options come from DB via these APIs; no mock data.
 */

/** Base URL of the backend (meeting-service or Kong). Use API_URL for server-side (e.g. http://nginx/isep in Docker so the container can reach the API). Use NEXT_PUBLIC_API_URL for client-side (public URL). Default: http://localhost:8000. */
export function getApiUrl(): string {
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
}

// ========== Reference data (project ground rule: all dropdowns from DB) ==========
export type ReferenceItem = { code: string; label: string; sortOrder?: number; sort_order?: number };
export type ReferenceCategory =
  | 'meeting_type'
  | 'meeting_status'
  | 'body_type'
  | 'filter_year'
  | 'agenda_category'
  | 'agenda_priority'
  | 'agenda_status'
  | 'meeting_role'
  | 'feedback_position';

export async function getReferenceData(
  accessToken: string,
  category: ReferenceCategory
): Promise<ReferenceItem[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/reference?category=${category}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.items ?? data.content ?? [];
  return (list as ReferenceItem[]).sort(
    (a, b) => (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0)
  );
}

export type BodyDto = {
  bodyId: string;
  parentBodyId: string | null;
  parentBodyName: string | null;
  name: string;
  abbreviation: string | null;
  bodyType: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateBodyRequest = {
  parentBodyId?: string | null;
  name: string;
  abbreviation?: string | null;
  bodyType: string;
  description?: string | null;
  isActive?: boolean;
};

export type UpdateBodyRequest = {
  parentBodyId?: string | null;
  name?: string;
  abbreviation?: string | null;
  bodyType?: string;
  description?: string | null;
  isActive?: boolean;
};

// Body type codes (for validation/types only). Dropdown options must come from getReferenceData(..., 'body_type').

// ========== Bodies (International Bodies) ==========
// See BodyDto, CreateBodyRequest, UpdateBodyRequest above.

// ========== Meetings (meeting-service) ==========
export type MeetingDto = {
  meetingId: string;
  bodyId: string;
  bodyName: string;
  /** Same as bodyName when returned by API (committee label for calendar UI). */
  committeeShortName?: string;
  sessionNumber: string | null;
  title: string;
  startDate: string;
  endDate: string;
  location: string | null;
  meetingType: string;
  status: string;
  notes: string | null;
  createdAt: string;
  liveSessionActive?: boolean;
  liveSessionStartedAt?: string | null;
};

export type MeetingsPage = {
  content: MeetingDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

/** Fetch meetings list for Executive Dashboard / meeting picker. */
export async function getMeetingsPage(
  accessToken: string,
  params?: { size?: number; status?: string; bodyId?: string }
): Promise<MeetingsPage> {
  const search = new URLSearchParams();
  search.set('size', String(params?.size ?? 50));
  if (params?.status) search.set('status', params.status);
  if (params?.bodyId) search.set('bodyId', params.bodyId);
  const url = `${getApiUrl()}/api/v1/meetings?${search.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('[API] getMeetingsPage failed', res.status, url, body.slice(0, 200));
    return { content: [], totalElements: 0, totalPages: 0, size: 50, number: 0 };
  }
  const data = await res.json();
  const content = Array.isArray(data.content) ? data.content : [];
  if (content.length > 0) console.info('[API] getMeetingsPage ok, meetings:', content.length);
  return {
    content,
    totalElements: data.totalElements ?? content.length,
    totalPages: data.totalPages ?? 1,
    size: data.size ?? 50,
    number: data.number ?? 0,
  };
}

export type CreateMeetingRequest = {
  bodyId: string;
  sessionNumber?: string | null;
  title: string;
  startDate: string;
  endDate: string;
  location?: string | null;
  meetingType: string;
  notes?: string | null;
};

// Meeting type codes (for validation/types only). Dropdown options must come from getReferenceData(..., 'meeting_type').

// ========== Meeting participants (SCR-MTG-04) ==========
export const MEETING_ROLES = ['DELEGATION_LEADER', 'MEMBER', 'OBSERVER'] as const;
export type MeetingRole = (typeof MEETING_ROLES)[number];

export type MeetingParticipantDto = {
  participantId: string;
  meetingId: string;
  userId: string;
  email: string;
  name: string | null;
  designation: string | null;
  organization: string | null;
  meetingRole: MeetingRole;
  assignedAt: string;
};

export type AddParticipantRequest = {
  userId: string;
  meetingRole: MeetingRole;
};

// ========== Users (user-service) — SCR-USR-01 to SCR-USR-05 ==========
export const SYSTEM_ROLES = [
  'SYSTEM_ADMIN',
  'IC_DIVISION_HEAD',
  'DELEGATION_LEADER',
  'COORDINATOR',
  'MEMBER',
  'VIEWER',
] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export type UserDto = {
  userId: string;
  keycloakId: string;
  email: string;
  fullName: string;
  designation: string | null;
  organization: string | null;
  phone: string | null;
  systemRole: string;
  isActive: boolean;
  mfaEnabled?: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UsersPage = {
  content: UserDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type CreateUserRequest = {
  keycloakId: string;
  email: string;
  fullName: string;
  designation?: string | null;
  organization?: string | null;
  phone?: string | null;
  systemRole: string;
  isActive?: boolean;
};

export type UpdateUserRequest = {
  fullName?: string;
  designation?: string | null;
  organization?: string | null;
  phone?: string | null;
  email?: string;
  systemRole?: string;
  isActive?: boolean;
};

/** User committee and CG assignments (SCR-USR-05). */
export type BodyAssignmentItemDto = {
  bodyId: string;
  name: string;
  abbreviation: string | null;
  assigned: boolean;
};

export type CgAssignmentItemDto = {
  cgId: string;
  name: string;
  parentBodyId: string | null;
  parentBodyName: string | null;
  assigned: boolean;
};

export type UserAssignmentsDto = {
  userId: string;
  userName: string;
  bodies: BodyAssignmentItemDto[];
  correspondenceGroups: CgAssignmentItemDto[];
};

export type SetUserAssignmentsRequest = {
  bodyIds?: string[];
  cgIds?: string[];
};

export async function getUserAssignments(
  accessToken: string,
  userId: string
): Promise<UserAssignmentsDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/users/${userId}/assignments`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function setUserAssignments(
  accessToken: string,
  userId: string,
  body: SetUserAssignmentsRequest
): Promise<{ error?: string }> {
  const res = await fetch(`${getApiUrl()}/api/v1/users/${userId}/assignments`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bodyIds: body.bodyIds ?? [], cgIds: body.cgIds ?? [] }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || 'Failed to save assignments' };
  }
  return {};
}

// ========== Meeting status history (SCR-MTG-05) — audit trail of status changes ==========
export type MeetingStatusHistoryEntry = {
  entryId: string;
  meetingId: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  changedByName?: string | null;
  changedAt: string;
  notes?: string | null;
};

// ========== Agenda items (SCR-AGN-01) ==========
export const AGENDA_CATEGORIES = ['DISCUSSION', 'DECISION', 'INFORMATION', 'ANY_OTHER_BUSINESS'] as const;
export const AGENDA_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;
export const AGENDA_STATUSES = ['DRAFT', 'ACTIVE', 'CLOSED'] as const;

export type AgendaItemDto = {
  agendaItemId: string;
  meetingId: string;
  itemNumber: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  deadlineForInputs: string | null;
  assignedCoordinatorId: string | null;
  assignedCoordinatorName: string | null;
  inputsReceivedCount?: number;
  discussionLocked?: boolean;
};

export async function getAgendaItem(
  accessToken: string,
  meetingId: string,
  itemId: string
): Promise<AgendaItemDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items/${itemId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

// ========== Tasks (meeting-linked) ==========
export type TaskDto = {
  taskId: string;
  meetingId: string | null;
  agendaItemId?: string | null;
  documentId?: string | null;
  title: string;
  description: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  priority: string;
  dueDate: string | null;
  status: string;
};

/** GET /api/v1/tasks/* aggregate response (meeting-service). */
export type TaskV1Response = {
  taskId: string;
  title: string;
  description: string | null;
  meetingId: string | null;
  agendaItemId: string | null;
  documentId: string | null;
  assignedTo: string[];
  dueDate: string | null;
  priority: string;
  status: string;
  createdBy: string | null;
  createdAt: string | null;
  isOverdue: boolean | null;
  escalatedAt: string | null;
  meetingTitle?: string | null;
};

// ========== Correspondence groups ==========
export type CorrespondenceGroupDto = {
  cgId: string;
  parentBodyId: string | null;
  parentBodyName?: string | null;
  name: string;
  mandate: string | null;
  indiaLeadId?: string | null;
  indiaLeadName: string | null;
  startDate: string;
  endDate: string;
  status: string;
  imsoReference?: string | null;
  /** When the record was created (optional; backend may add later) */
  createdAt?: string | null;
};

/** CG with assigned-to-meeting flag (for meeting detail picker). */
export type CorrespondenceGroupWithAssignedDto = CorrespondenceGroupDto & { assigned: boolean };

// ========== Documents ==========
export type DocumentDto = {
  documentId: string;
  meetingId: string | null;
  agendaItemId: string | null;
  documentType: string;
  title: string;
  source: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  currentVersion: number;
  status: string;
  uploadedByName: string | null;
  uploadedAt: string;
};

/** SCR-COL-04: Document/agenda comment with visibility (internal vs delegation). */
export type DocumentCommentDto = {
  commentId: string;
  authorId?: string | null;
  authorName: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  parentId?: string | null;
  visibility: 'INTERNAL' | 'DELEGATION';
};

/** Roles that can see INTERNAL (DGS-internal) comments. DELEGATION comments are visible to all roles that can access the page. */
const ROLES_SEEING_INTERNAL = ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'COORDINATOR', 'DELEGATION_LEADER'];

export function filterCommentsByVisibility(
  comments: DocumentCommentDto[],
  userRoles: string[]
): DocumentCommentDto[] {
  const canSeeInternal = userRoles.some((r) => ROLES_SEEING_INTERNAL.includes(r));
  return comments.filter((c) => {
    if (c.visibility === 'DELEGATION') return true;
    if (c.visibility === 'INTERNAL') return canSeeInternal;
    return false;
  });
}

// AI Feature 1 — Position Advisor (SA + CO only)
export type PositionAdvisoryDto = {
  advisoryId: string;
  agendaItemId: string;
  generatedAt: string;
  paperSummary: string;
  historicalContext: string;
  suggestedPosition: 'SUPPORT' | 'OBJECT' | 'NEUTRAL' | 'CONDITIONAL_SUPPORT';
  suggestedPositionReasoning: string;
  keyPointsToRaise: string[];
  alignmentOpportunities: string[];
  riskFlags: string[];
  confidenceScore: number;
  isAiGenerated: true;
  modelVersion?: string;
};

// AI Feature 2 — Meeting Preparedness (SA + CO only)
export type MeetingPreparednessDto = {
  meetingId: string;
  meetingTitle: string;
  daysToMeeting: number;
  score: number;
  riskLevel: 'GREEN' | 'AMBER' | 'ORANGE' | 'RED';
  executiveSummary: string;
  criticalActions: Array<{
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    description: string;
    linkedEntityType?: string;
    linkedEntityId?: string;
    recommendedAction?: string;
  }>;
  projectedScoreAtMeetingDate?: number;
  keyStrengths: string[];
  narrative: string;
  lastComputedAt: string;
};

export const DOCUMENT_TYPES = [
  'AGENDA_PAPER', 'WORKING_DOCUMENT', 'SUBMISSION', 'REFERENCE',
  'INTERVENTION', 'MINUTES', 'COUNTRY_POSITION', 'OTHER',
] as const;
export const DOCUMENT_SOURCES = ['INDIA', 'IMO_SECRETARIAT', 'OTHER_MEMBER_STATE', 'OTHER'] as const;

// ========== Papers list (SCR-PAPER-01) — GET /papers ==========
export type PaperListItem = {
  paperId: string;
  title: string;
  status: string;
  meetingId: string | null;
  agendaItemId: string | null;
  lastUpdated: string | null;
  /** Linked clean-copy document for external consultation (Phase 4) */
  cleanCopyDocumentId?: string | null;
  /** Optional display labels when returned by API */
  meetingTitle?: string | null;
  agendaItemTitle?: string | null;
};

/** GET /api/v1/papers/{paperId} — single paper (incl. cleanCopyDocumentId). */
export async function getPaper(accessToken: string, paperId: string): Promise<PaperListItem | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/papers/${encodeURIComponent(paperId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load paper');
  return (await res.json()) as PaperListItem;
}

export async function getPapers(
  accessToken: string,
  opts?: { awaitingMyApproval?: boolean; onUnauthorized?: () => void }
): Promise<PaperListItem[]> {
  const params = new URLSearchParams();
  if (opts?.awaitingMyApproval) params.set('awaitingMyApproval', 'true');
  const q = params.toString();
  const res = await fetch(`${getApiUrl()}/api/v1/papers${q ? `?${q}` : ''}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (res.status === 401 || res.status === 403) {
    opts?.onUnauthorized?.();
    return [];
  }
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** GET /api/v1/tasks/my — optional status CSV e.g. PENDING,ESCALATED */
export async function getMyTasks(
  accessToken: string,
  opts?: { status?: string; onUnauthorized?: () => void }
): Promise<TaskV1Response[]> {
  const params = new URLSearchParams();
  if (opts?.status) params.set('status', opts.status);
  const q = params.toString();
  const res = await fetch(`${getApiUrl()}/api/v1/tasks/my${q ? `?${q}` : ''}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (res.status === 401 || res.status === 403) {
    opts?.onUnauthorized?.();
    return [];
  }
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** GET /api/v1/tasks/my?summary=true — dashboard task widget counts */
export type MyTasksSummaryDto = {
  overdue: number;
  inProgress: number;
  completed: number;
  totalAssigned: number;
  meetingCount: number;
};

export async function getMyTasksSummary(
  accessToken: string,
  opts?: { onUnauthorized?: () => void }
): Promise<MyTasksSummaryDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/tasks/my?summary=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (res.status === 401) {
    opts?.onUnauthorized?.();
    return null;
  }
  if (!res.ok) return null;
  const data = (await res.json()) as Record<string, unknown>;
  if (typeof data.overdue !== 'number') return null;
  return {
    overdue: data.overdue as number,
    inProgress: typeof data.inProgress === 'number' ? data.inProgress : 0,
    completed: typeof data.completed === 'number' ? data.completed : 0,
    totalAssigned: typeof data.totalAssigned === 'number' ? data.totalAssigned : 0,
    meetingCount: typeof data.meetingCount === 'number' ? data.meetingCount : 0,
  };
}

export async function getTeamTasks(
  accessToken: string,
  opts?: { onUnauthorized?: () => void }
): Promise<TaskV1Response[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/tasks/team`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (res.status === 401) {
    opts?.onUnauthorized?.();
    return [];
  }
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function submitPaperForApproval(accessToken: string, paperId: string): Promise<boolean> {
  const res = await fetch(`${getApiUrl()}/api/v1/papers/${encodeURIComponent(paperId)}/workflow/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.ok;
}

// ========== Papers (SCR-PAPER-02) — draft content for collaborative editing ==========
export type PaperDraftResponse = {
  content: unknown;
  version?: number;
  savedAt?: string;
  lastModifiedBy?: string | null;
};

// ========== External consultation (Phase 4) ==========
export type ConsultationAgencyDto = {
  id: string;
  agencyUserId: string;
  agencyName: string;
  status: string;
  feedbackHtml: string | null;
  feedbackSubmittedAt: string | null;
  currentUser: boolean;
};

export type ConsultationDto = {
  id: string;
  documentId: string;
  sentByUserId: string;
  sentAt: string | null;
  deadline: string | null;
  notes: string | null;
  status: string;
  agencies: ConsultationAgencyDto[];
};

export type ExternalAgencyCandidateDto = {
  userId: string;
  fullName: string;
  organization: string;
};

export async function getDocumentConsultations(
  accessToken: string,
  documentId: string
): Promise<ConsultationDto[]> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/documents/${encodeURIComponent(documentId)}/consultations`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Could not load consultations.');
  const data = await res.json();
  return Array.isArray(data) ? (data as ConsultationDto[]) : [];
}

export async function getExternalAgencyCandidates(
  accessToken: string
): Promise<ExternalAgencyCandidateDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/consultations/external-agency-candidates`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? (data as ExternalAgencyCandidateDto[]) : [];
}

export async function sendDocumentConsultation(
  accessToken: string,
  documentId: string,
  body: { agencyUserIds: string[]; deadline?: string | null; notes?: string | null }
): Promise<ConsultationDto | null> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/documents/${encodeURIComponent(documentId)}/consultations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agencyUserIds: body.agencyUserIds,
        deadline: body.deadline ?? null,
        notes: body.notes ?? null,
      }),
    }
  );
  if (!res.ok) return null;
  return (await res.json()) as ConsultationDto;
}

export async function submitConsultationFeedback(
  accessToken: string,
  consultationId: string,
  feedbackHtml: string
): Promise<boolean> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/consultations/${encodeURIComponent(consultationId)}/feedback`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedbackHtml }),
    }
  );
  return res.ok;
}

export async function getPaperDraft(
  accessToken: string,
  paperId: string
): Promise<PaperDraftResponse | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/papers/${paperId}/draft`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data as PaperDraftResponse;
}

// ========== Document versions (SCR-DOC) — for compare / new version ==========
export type DocumentVersionDto = {
  versionId: string;
  documentId: string;
  versionNumber: number;
  uploadedByName: string | null;
  uploadedAt: string;
  changeSummary: string | null;
  fileSizeBytes: number;
};

export function getDocumentDownloadUrl(documentId: string): string {
  return `${getApiUrl()}/api/v1/documents/${documentId}/download`;
}

export async function getDocumentVersions(
  accessToken: string,
  documentId: string
): Promise<DocumentVersionDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/documents/${documentId}/versions`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// ========== Feedback (SCR-COL) — agenda item feedback, consolidation ==========
export type FeedbackDto = {
  feedbackId: string;
  agendaItemId: string;
  documentId: string | null;
  userId: string;
  userName: string | null;
  position: string | null;
  comments: string | null;
  suggestedAmendments: string | null;
  status: string;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getFeedbackList(
  accessToken: string,
  agendaItemId: string
): Promise<FeedbackDto[]> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/feedback?agendaItemId=${encodeURIComponent(agendaItemId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getMyFeedback(
  accessToken: string,
  agendaItemId: string
): Promise<FeedbackDto | null> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/feedback/my?agendaItemId=${encodeURIComponent(agendaItemId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok || res.status === 204) return null;
  const data = await res.json();
  return data as FeedbackDto;
}

export type SaveFeedbackRequest = {
  agendaItemId: string;
  documentId?: string | null;
  position?: string | null;
  comments?: string | null;
  suggestedAmendments?: string | null;
};

export async function saveFeedback(
  accessToken: string,
  body: SaveFeedbackRequest
): Promise<FeedbackDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/feedback`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data as FeedbackDto;
}

export async function submitFeedback(
  accessToken: string,
  feedbackId: string
): Promise<FeedbackDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/feedback/${feedbackId}/submit`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data as FeedbackDto;
}

// ========== Notifications (ACT-B06) ==========
export type NotificationDto = {
  notificationId: string;
  notificationType: string;
  title: string | null;
  message: string | null;
  linkedEntityType: string | null;
  linkedEntityId: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsPage = {
  content: NotificationDto[];
  totalElements: number;
};

export async function getNotifications(
  accessToken: string,
  opts?: { unreadOnly?: boolean; size?: number }
): Promise<{ content: NotificationDto[]; totalElements: number }> {
  const params = new URLSearchParams();
  if (opts?.unreadOnly) params.set('unreadOnly', 'true');
  params.set('size', String(opts?.size ?? 50));
  const res = await fetch(`${getApiUrl()}/api/v1/notifications?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return { content: [], totalElements: 0 };
  const data = await res.json();
  const content = data.content ?? [];
  return { content: Array.isArray(content) ? content : [], totalElements: data.totalElements ?? content.length };
}

export async function getUnreadNotificationCount(
  accessToken: string,
  opts?: { onUnauthorized?: () => void }
): Promise<number> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (res.status === 401) {
      opts?.onUnauthorized?.();
      return 0;
    }
    if (!res.ok) return 0;
    const data = await res.json();
    const c = data.count;
    return typeof c === 'number' ? c : typeof c === 'string' ? parseInt(c, 10) || 0 : Number(c) || 0;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(
  accessToken: string,
  notificationId: string
): Promise<NotificationDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function markAllNotificationsRead(accessToken: string): Promise<number> {
  const res = await fetch(`${getApiUrl()}/api/v1/notifications/mark-all-read`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return typeof data.marked === 'number' ? data.marked : 0;
}

// ========== Paper approval (ACT-B07) ==========
export type PaperApprovalStageDto = {
  stageId: string;
  stageNumber: number;
  stageName: string;
  approverName: string | null;
  status: string;
  actedAt: string | null;
  comments: string | null;
};

export type PaperApprovalDto = {
  paperId: string;
  paperTitle: string;
  currentStage: string;
  stages: PaperApprovalStageDto[];
};

export async function getPaperApproval(
  accessToken: string,
  paperId: string
): Promise<PaperApprovalDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/papers/${paperId}/approval`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

/** GET /api/v1/papers/{id}/status — chain + metadata for approval UI polish. */
export type PaperStatusDto = {
  paperTitle: string | null;
  currentStage: string;
  mopswStepActive: boolean;
  submittedAt: string | null;
  lastActionBy: string | null;
  lastActionAt: string | null;
  stages: PaperApprovalStageDto[];
};

export async function getPaperStatus(
  accessToken: string,
  paperId: string
): Promise<PaperStatusDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/papers/${paperId}/status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

// ========== Feedback archive (SCR-COL Phase 2) ==========
export type FeedbackArchiveRow = {
  feedbackId: string;
  agendaItemId: string;
  agendaItemTitle: string | null;
  agendaItemNumber: string | null;
  submittedBy: { userId: string; fullName: string | null };
  position: string | null;
  comments: string | null;
  status: string;
  submittedAt: string | null;
  consolidation: {
    consolidatedPosition: string | null;
    consolidatedComments: string | null;
    status: string | null;
  } | null;
};

export type FeedbackArchivePage = {
  data: FeedbackArchiveRow[];
  pagination: { page: number; size: number; totalElements: number };
};

export async function getFeedbackArchive(
  accessToken: string,
  meetingId: string,
  params?: {
    agendaItemId?: string;
    submittedBy?: string;
    position?: string;
    page?: number;
    size?: number;
  }
): Promise<FeedbackArchivePage | null> {
  const q = new URLSearchParams();
  if (params?.agendaItemId) q.set('agendaItemId', params.agendaItemId);
  if (params?.submittedBy) q.set('submittedBy', params.submittedBy);
  if (params?.position) q.set('position', params.position);
  if (params?.page != null) q.set('page', String(params.page));
  if (params?.size != null) q.set('size', String(params.size));
  const qs = q.toString();
  const url = `${getApiUrl()}/api/v1/meetings/${meetingId}/feedback/archive${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function approvePaper(
  accessToken: string,
  paperId: string,
  comments?: string
): Promise<PaperApprovalDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/papers/${paperId}/approval/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comments != null ? { comments } : {}),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function rejectPaper(
  accessToken: string,
  paperId: string,
  comments?: string
): Promise<PaperApprovalDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/papers/${paperId}/approval/reject`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comments != null ? { comments } : {}),
  });
  if (!res.ok) return null;
  return res.json();
}

// ========== Reports (ACT-B08) ==========
export async function getMeetingSummaryReport(
  accessToken: string,
  meetingId: string
): Promise<{ meetingId: string; title: string; bodyName: string; startDate: string; endDate: string; status: string; agendaItemsCount: number } | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/reports/meeting-summary?meetingId=${encodeURIComponent(meetingId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getApprovalPipelineReport(
  accessToken: string
): Promise<Array<{ paperId: string; title: string; currentStage: string; nextApprover: string; status: string }>> {
  const res = await fetch(`${getApiUrl()}/api/v1/reports/approval-pipeline`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Audit log (SCR-SYS-02) — GET /reports/audit
export type AuditLogEntryDto = {
  auditId: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  actionType: string;
  entityType: string;
  entityId?: string;
  description?: string;
  traceId?: string;
};

export async function getAuditReport(
  accessToken: string,
  opts?: { page?: number; size?: number }
): Promise<{ content: AuditLogEntryDto[]; totalElements: number }> {
  const page = opts?.page ?? 0;
  const size = opts?.size ?? 50;
  const url = `${getApiUrl()}/api/v1/reports/audit?page=${page}&size=${size}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('[API] getAuditReport failed', res.status, url);
    return { content: [], totalElements: 0 };
  }
  const data = await res.json();
  const content = data.content ?? [];
  return {
    content: Array.isArray(content) ? content : [],
    totalElements: data.totalElements ?? content.length,
  };
}

/** Record an audit event (e.g. LOGIN). Requires authenticated user; backend fills user from JWT. */
export async function postAuditLog(
  accessToken: string,
  payload: { actionType: string; entityType?: string; entityId?: string; description?: string }
): Promise<boolean> {
  const res = await fetch(`${getApiUrl()}/api/v1/reports/audit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      actionType: payload.actionType,
      entityType: payload.entityType ?? 'APPLICATION',
      entityId: payload.entityId ?? undefined,
      description: payload.description ?? payload.actionType,
    }),
  });
  return res.ok;
}

// ========== Executive Dashboard (ISEP-DASH-CURSOR-01) ==========
export type DashboardSummaryDto = {
  meeting: {
    title: string;
    body: string;
    session: number;
    location: string;
    startDate: string;
    endDate: string;
    daysToMeeting: number;
    status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  };
  preparedness: {
    score: number;
    trend: number;
    tasksComplete: number;
    tasksTotal: number;
    feedbackConsolidated: number;
    feedbackTotal: number;
    papersReady: number;
    papersTotal: number;
  };
  pendingActions: number;
  criticalAlerts: number;
};

export type DashboardAgendaReadinessDto = {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  submissionRequired: boolean;
  positionReady: boolean;
  paperStatus: string | null;
  tasksComplete: number;
  tasksTotal: number;
  daysLeft: number | null;
};

export type DashboardPaperPipelineDto = {
  id: string;
  title: string;
  agendaItem: string;
  stage: number;
  stageName: string;
  lastAction: string;
  lastActionDate: string;
  submittedBy: string;
  urgent: boolean;
};

export type DashboardPendingActionDto = {
  id: string;
  type: 'APPROVAL_REQUIRED' | 'POSITION_PENDING' | 'FEEDBACK_UNCONSOLIDATED' | 'TASK_OVERDUE';
  title: string;
  detail: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  screen: string;
};

export type DashboardDelegationActivityDto = {
  org: string;
  role: string;
  tasksComplete: number;
  tasksTotal: number;
  feedbackSubmitted: number;
  papersOwned: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'COMPLETE' | 'OVERDUE';
};

export type DashboardAIInsightsDto = {
  generatedAt: string;
  keyRisk: string;
  recommendations: string[];
  preparednessProjection: string;
};

export async function getDashboardSummary(
  accessToken: string,
  meetingId: string,
  role: string
): Promise<DashboardSummaryDto | null> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/dashboard/summary?meetingId=${encodeURIComponent(meetingId)}&role=${encodeURIComponent(role)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getDashboardAgendaReadiness(
  accessToken: string,
  meetingId: string
): Promise<DashboardAgendaReadinessDto[]> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/dashboard/agenda-readiness?meetingId=${encodeURIComponent(meetingId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getDashboardPaperPipeline(
  accessToken: string,
  meetingId: string
): Promise<DashboardPaperPipelineDto[]> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/dashboard/paper-pipeline?meetingId=${encodeURIComponent(meetingId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getDashboardPendingActions(
  accessToken: string,
  role: string
): Promise<DashboardPendingActionDto[]> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/dashboard/pending-actions?role=${encodeURIComponent(role)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getDashboardDelegationActivity(
  accessToken: string,
  meetingId: string
): Promise<DashboardDelegationActivityDto[]> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/dashboard/delegation-activity?meetingId=${encodeURIComponent(meetingId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// AI insights: optional FastAPI endpoint; returns stub if 404/501
export async function getDashboardAIInsights(
  accessToken: string,
  meetingId: string
): Promise<DashboardAIInsightsDto | null> {
  const res = await fetch(
    `${getApiUrl()}/api/v1/dashboard/ai-insights?meetingId=${encodeURIComponent(meetingId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok) return null;
  return res.json();
}

// ========== System config (SCR-SYS-03) ==========
export type SystemConfigDto = {
  general: { platformName: string; contactEmail: string };
  session: { inactivityTimeoutMinutes: number; mfaRequired: boolean };
  notifications: { smtpHost: string; defaultDigest: string };
  storage: { minioQuotaGb: number; retentionDays: number };
  workflow: { approvalDeadlineDefaultHours: number; escalationGraceHours: number };
  security: { passwordMinLength: number; allowedIpRanges: string };
};

export async function getSystemConfig(accessToken: string): Promise<SystemConfigDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/system/config`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function saveSystemConfig(
  accessToken: string,
  config: Record<string, unknown>
): Promise<boolean> {
  const res = await fetch(`${getApiUrl()}/api/v1/system/config`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.ok;
}

// ========== Announcements (SCR-CAL-04) ==========
export type AnnouncementDto = {
  announcementId: string;
  subject: string;
  body: string;
  urgency: string;
  scope: string;
  scopeValue?: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string | null;
};

export async function createAnnouncement(
  accessToken: string,
  body: { subject: string; body?: string; urgency?: string; scope?: string; scopeValue?: string }
): Promise<AnnouncementDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/announcements`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function publishAnnouncement(accessToken: string, announcementId: string): Promise<AnnouncementDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/announcements/${announcementId}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// ========== Bulk user import (SCR-USR-04) ==========
export type BulkImportValidRow = {
  row: number;
  email: string;
  fullName: string;
  designation?: string;
  organization?: string;
  systemRole?: string | null;
};

export type BulkImportInvalidRow = { row: number; message: string };

export type BulkImportValidationResult = {
  valid: BulkImportValidRow[];
  invalid: BulkImportInvalidRow[];
};

export async function bulkImportValidate(
  accessToken: string,
  file: File
): Promise<BulkImportValidationResult | null> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${getApiUrl()}/api/v1/users/bulk-import/validate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) return null;
  return res.json();
}

export async function bulkImportConfirm(
  accessToken: string,
  rows: BulkImportValidRow[]
): Promise<{ created: number } | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/users/bulk-import/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) return null;
  return res.json();
}

// Live meeting (SCR-LIVE) — interventions and outcomes
export type InterventionDto = {
  interventionId: string;
  meetingId: string;
  agendaItemId: string;
  agendaItemTitle: string | null;
  interventionText: string;
  deliveredByName: string | null;
  deliveredAt: string;
  interventionType: string;
};

export type OutcomeDto = {
  outcomeId: string;
  meetingId: string;
  agendaItemId: string;
  agendaItemTitle: string | null;
  decision: string;
  resolutionRef: string | null;
  nextSteps: string | null;
  capturedAt: string;
};

export async function getMeetingInterventions(
  accessToken: string,
  meetingId: string
): Promise<InterventionDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/interventions`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createIntervention(
  accessToken: string,
  meetingId: string,
  body: { agendaItemId: string; interventionText: string; deliveredByName?: string; interventionType?: string }
): Promise<InterventionDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/interventions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getMeetingOutcomes(
  accessToken: string,
  meetingId: string
): Promise<OutcomeDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/outcomes`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createOutcome(
  accessToken: string,
  meetingId: string,
  body: { agendaItemId: string; decision: string; resolutionRef?: string; nextSteps?: string }
): Promise<OutcomeDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/outcomes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}
