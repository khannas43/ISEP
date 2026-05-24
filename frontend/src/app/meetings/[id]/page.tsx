import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getReferenceData, getMeetingInterventions, getMeetingOutcomes, type MeetingDto, type MeetingParticipantDto, type MeetingStatusHistoryEntry, type AgendaItemDto, type TaskDto, type CorrespondenceGroupWithAssignedDto, type BodyDto, type UserDto, type DocumentDto } from '@/lib/api';
import { formatDisplayDate } from '@/lib/format';
import { MeetingStatusActions } from './MeetingStatusActions';
import { MeetingTabs } from './MeetingTabs';
import { ParticipantsTab } from './ParticipantsTab';
import { HistoryTab } from './HistoryTab';
import { AgendaTab } from './AgendaTab';
import { TasksTab } from './TasksTab';
import { CorrespondenceTab } from './CorrespondenceTab';
import { DocumentsTab } from './DocumentsTab';
import { LiveTab } from './LiveTab';
import { OutcomesTab } from './OutcomesTab';
import { MeetingForm } from '../MeetingForm';
import { MeetingPreparednessBanner } from '@/components/ai/MeetingPreparednessBanner';

async function getMeeting(id: string, accessToken: string): Promise<MeetingDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getMeetingParticipants(meetingId: string, accessToken: string): Promise<MeetingParticipantDto[]> {
  const url = `${getApiUrl()}/api/v1/meetings/${meetingId}/participants`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (process.env.NODE_ENV === 'development') {
    console.log('[MeetingDetail] GET participants', res.status, url);
  }
  if (!res.ok) return [];
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.content ?? [];
  if (process.env.NODE_ENV === 'development') {
    console.log('[MeetingDetail] participants count', list.length);
  }
  return list;
}

async function getMeetingStatusHistory(meetingId: string, accessToken: string): Promise<MeetingStatusHistoryEntry[]> {
  const url = `${getApiUrl()}/api/v1/meetings/${meetingId}/status-history`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
  if (process.env.NODE_ENV === 'development') console.log('[MeetingDetail] GET status-history', res.status);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.content ?? [];
}

async function getMeetingAgendaItems(meetingId: string, accessToken: string): Promise<AgendaItemDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.content ?? [];
}

async function getMeetingTasks(meetingId: string, accessToken: string): Promise<TaskDto[]> {
  const url = `${getApiUrl()}/api/v1/meetings/${meetingId}/tasks`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
  if (process.env.NODE_ENV === 'development') console.log('[MeetingDetail] GET tasks', res.status);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.content ?? [];
}

async function getMeetingCorrespondenceGroups(meetingId: string, accessToken: string): Promise<CorrespondenceGroupWithAssignedDto[]> {
  const url = `${getApiUrl()}/api/v1/meetings/${meetingId}/correspondence-groups`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
  if (process.env.NODE_ENV === 'development') console.log('[MeetingDetail] GET correspondence-groups', res.status);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.content ?? [];
}

async function getBodies(accessToken: string): Promise<BodyDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/bodies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

async function getUsersForParticipantPicker(accessToken: string): Promise<UserDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/users?activeOnly=true&size=200`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  const content = data.content ?? [];
  return Array.isArray(content) ? content : [];
}

async function getMeetingDocuments(meetingId: string, accessToken: string): Promise<DocumentDto[]> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/documents`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.content ?? [];
}

const VALID_MEETING_TABS = new Set([
  'overview',
  'agenda',
  'documents',
  'participants',
  'tasks',
  'correspondence',
  'live',
  'outcomes',
  'history',
]);

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string | string[] }> };

export default async function MeetingDetailPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const sp = await searchParams;
  const rawTab = sp?.tab;
  const tabParam = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const tab =
    tabParam && VALID_MEETING_TABS.has(tabParam) ? tabParam : 'overview';

  // Resolve "new" or "create" so the create form always works even when [id] matches first
  if (id === 'new') redirect('/meetings/create');
  if (id === 'create') {
    const roles = (session as { roles?: string[] }).roles ?? [];
    const canCreate =
      roles.includes('SYSTEM_ADMIN') ||
      roles.includes('COORDINATOR') ||
      (roles.length === 0 && process.env.NODE_ENV === 'development');
    if (!canCreate) redirect('/unauthorized');
    const accessToken = (session as { accessToken?: string }).accessToken;
    let bodies: BodyDto[] = [];
    let meetingTypeOptions: { code: string; label: string }[] = [];
    if (accessToken) {
      try {
        const [bodiesRes, refData] = await Promise.all([
          getBodies(accessToken),
          getReferenceData(accessToken, 'meeting_type'),
        ]);
        bodies = bodiesRes ?? [];
        meetingTypeOptions = refData ?? [];
      } catch {
        // Leave empty when API unavailable
      }
    }
    return (
      <>
        <div className="mb-6">
          <Link href="/meetings" className="text-base font-medium text-slate-500 hover:text-slate-700">← Back to Meetings</Link>
        </div>
        <div className="page-header">
          <h1 className="page-title">Create Meeting</h1>
          <p className="page-subtitle">Create a new meeting under an international body.</p>
        </div>
        <div className="card">
          <div className="card-body">
            <MeetingForm bodies={bodies} meetingTypeOptions={meetingTypeOptions} />
          </div>
        </div>
      </>
    );
  }

  const accessToken = (session as { accessToken?: string }).accessToken;
  if (process.env.NODE_ENV === 'development') {
    console.log('[MeetingDetail] meetingId', id, 'hasAccessToken', !!accessToken, 'apiBase', getApiUrl());
  }
  let meeting: MeetingDto | null = null;
  if (accessToken) {
    try {
      meeting = await getMeeting(id, accessToken);
    } catch {
      meeting = null;
    }
  }
  if (!meeting) notFound();

  const roles = (session as { roles?: string[] }).roles ?? [];
  const isViewer = roles.includes('VIEWER');
  const isMember = roles.includes('MEMBER');
  if (tab === 'participants' && isViewer) redirect(`/meetings/${id}/?tab=overview`);
  if (tab === 'history' && (isViewer || isMember)) redirect(`/meetings/${id}/?tab=overview`);
  const canManageParticipants = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');

  let meetingRoleOptions: { code: string; label: string }[] = [];
  let participants: MeetingParticipantDto[] = [];
  let statusHistory: MeetingStatusHistoryEntry[] = [];
  let agendaItems: AgendaItemDto[] = [];
  let tasks: TaskDto[] = [];
  let correspondenceGroups: CorrespondenceGroupWithAssignedDto[] = [];
  let documents: DocumentDto[] = [];
  let interventions: { interventionId: string; meetingId: string; agendaItemId: string; agendaItemTitle: string; text: string; deliveredBy: string; deliveredAt: string; type: string }[] = [];
  let outcomesList: { outcomeId: string; meetingId: string; agendaItemId: string; agendaItemTitle: string; decision: string; resolutionRef: string | null; nextSteps: string | null; capturedAt: string }[] = [];
  let userListForPicker: UserDto[] = [];

  if (accessToken) {
    try {
      const [roleOpts, part, hist, agenda, t, cg, doc, apiInt, apiOut, users] = await Promise.all([
        getReferenceData(accessToken, 'meeting_role'),
        getMeetingParticipants(meeting.meetingId, accessToken),
        getMeetingStatusHistory(meeting.meetingId, accessToken),
        getMeetingAgendaItems(meeting.meetingId, accessToken),
        getMeetingTasks(meeting.meetingId, accessToken),
        getMeetingCorrespondenceGroups(meeting.meetingId, accessToken),
        getMeetingDocuments(meeting.meetingId, accessToken),
        getMeetingInterventions(accessToken, meeting.meetingId),
        getMeetingOutcomes(accessToken, meeting.meetingId),
        canManageParticipants ? getUsersForParticipantPicker(accessToken) : Promise.resolve([]),
      ]);
      meetingRoleOptions = roleOpts;
      participants = part;
      statusHistory = hist;
      agendaItems = agenda;
      tasks = t;
      correspondenceGroups = cg;
      documents = doc;
      interventions = apiInt.map((i) => ({
        interventionId: i.interventionId,
        meetingId: i.meetingId,
        agendaItemId: i.agendaItemId,
        agendaItemTitle: i.agendaItemTitle ?? '—',
        text: i.interventionText,
        deliveredBy: i.deliveredByName ?? '—',
        deliveredAt: i.deliveredAt,
        type: i.interventionType,
      }));
      outcomesList = apiOut.map((o) => ({
        outcomeId: o.outcomeId,
        meetingId: o.meetingId,
        agendaItemId: o.agendaItemId,
        agendaItemTitle: o.agendaItemTitle ?? '—',
        decision: o.decision,
        resolutionRef: o.resolutionRef ?? null,
        nextSteps: o.nextSteps ?? null,
        capturedAt: o.capturedAt,
      }));
      userListForPicker = users;
    } catch {
      // API unavailable; use mock data below
    }
  }

  const canUseAiPreparedness = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');
  const canAddAgendaItem = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');
  const canUploadDocument = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR') || roles.includes('DELEGATION_LEADER') || roles.includes('MEMBER');
  const canEditMeeting = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR') || roles.includes('IC_DIVISION_HEAD');
  const canViewHistory = !isViewer && !isMember;
  const canShowFeedbackArchive =
    roles.includes('SYSTEM_ADMIN') ||
    roles.includes('IC_DIVISION_HEAD') ||
    roles.includes('DELEGATION_LEADER') ||
    roles.includes('COORDINATOR');
  const canChangeStatus =
    roles.includes('SYSTEM_ADMIN') ||
    roles.includes('COORDINATOR') ||
    roles.includes('DELEGATION_LEADER') ||
    roles.includes('MEMBER');

  const statusBadgeClass =
    meeting.status === 'ACTIVE'
      ? 'badge badge-success'
      : meeting.status === 'CONCLUDED' || meeting.status === 'ARCHIVED'
        ? 'badge badge-neutral'
        : meeting.status === 'CANCELLED'
          ? 'badge badge-danger'
          : 'badge badge-info';

  const meetingStart = new Date(meeting.startDate);
  meetingStart.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysToMeeting = Math.ceil((meetingStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const showPreparednessBanner = canUseAiPreparedness && daysToMeeting >= 0 && daysToMeeting <= 30;

  return (
    <div>
      <div className="mb-6">
        <Link href="/meetings" className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Back to Meetings
        </Link>
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="card-body">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="page-title">{meeting.title}</h1>
              <p className="page-subtitle">
                {meeting.bodyName}
                {meeting.sessionNumber ? ` · Session ${meeting.sessionNumber}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={statusBadgeClass}>{meeting.status}</span>
              <Link
                href={`/dashboard/executive?meetingId=${encodeURIComponent(meeting.meetingId)}`}
                className="btn-secondary"
              >
                Executive view
              </Link>
              <Link href={`/meetings/${meeting.meetingId}/live`} className="btn-primary">
                Live session
              </Link>
              {canShowFeedbackArchive && (
                <Link
                  href={`/meetings/${meeting.meetingId}/feedback/archive`}
                  className="btn-secondary"
                >
                  Feedback archive
                </Link>
              )}
              {canEditMeeting && (
                <Link
                  href={`/meetings/${meeting.meetingId}/edit`}
                  className="btn-secondary"
                >
                  Edit meeting
                </Link>
              )}
              <MeetingStatusActions
                meetingId={meeting.meetingId}
                currentStatus={meeting.status}
                canChangeStatus={canChangeStatus}
              />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-base sm:grid-cols-4">
            <div>
              <dt className="text-slate-500">Dates</dt>
              <dd className="font-medium text-slate-900">{formatDisplayDate(meeting.startDate)} – {formatDisplayDate(meeting.endDate)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="font-medium text-slate-900">{meeting.location ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Type</dt>
              <dd className="font-medium text-slate-900">{meeting.meetingType.replace(/_/g, ' ')}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Suspense fallback={<div className="h-10 border-b border-slate-200" />}>
        <MeetingTabs
          meetingId={meeting.meetingId}
          showParticipantsTab={!isViewer}
          showHistoryTab={canViewHistory}
          showLiveTab
          showOutcomesTab
        />
      </Suspense>

      <div className="mt-6">
        {tab === 'overview' && (
          <>
            <div className="card mb-6 overflow-hidden">
              <div className="card-body py-3">
                <div className="flex flex-wrap gap-6 text-base">
                  <span className="text-slate-600">Participants: <strong className="text-slate-900">{participants.length}</strong></span>
                  <span className="text-slate-600">Agenda items: <strong className="text-slate-900">{agendaItems.length}</strong></span>
                  <span className="text-slate-600">Documents: <strong className="text-slate-900">{documents.length}</strong></span>
                  <span className="text-slate-600">Tasks: <strong className="text-slate-900">{tasks.length}</strong></span>
                  <span className="text-slate-600">Papers in approval: <strong className="text-slate-900">0</strong></span>
                </div>
              </div>
            </div>
            {showPreparednessBanner && (
              <MeetingPreparednessBanner
                meetingId={meeting.meetingId}
                meetingTitle={meeting.title}
                startDate={meeting.startDate}
              />
            )}
            <div className="card">
              <div className="card-body">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
                  {canEditMeeting && (
                    <Link
                      href={`/meetings/${meeting.meetingId}/edit`}
                      className="btn-secondary text-base"
                    >
                      Update overview
                    </Link>
                  )}
                </div>
                {meeting.notes ? (
                  <p className="mt-2 whitespace-pre-wrap text-slate-700">{meeting.notes}</p>
                ) : (
                  <p className="mt-2 text-slate-500">No notes or agenda overview for this meeting.</p>
                )}
              </div>
            </div>
          </>
        )}
        {tab === 'agenda' && (
          <AgendaTab
            meetingId={meeting.meetingId}
            agendaItems={agendaItems}
            canAdd={canAddAgendaItem}
          />
        )}
        {tab === 'documents' && (
          <DocumentsTab
            meetingId={meeting.meetingId}
            documents={documents}
            agendaItems={agendaItems}
            canUpload={canUploadDocument}
          />
        )}
        {tab === 'participants' && (
          <ParticipantsTab
            meetingId={meeting.meetingId}
            participants={participants}
            canManage={canManageParticipants}
            meetingRoleOptions={meetingRoleOptions}
            userListForPicker={userListForPicker}
          />
        )}
        {tab === 'tasks' && (
          <TasksTab
            meetingId={meeting.meetingId}
            tasks={tasks}
            canCreate={canManageParticipants}
          />
        )}
        {tab === 'correspondence' && (
          <CorrespondenceTab
            meetingId={meeting.meetingId}
            groups={correspondenceGroups}
            canEdit={canEditMeeting}
          />
        )}
        {tab === 'live' && (
          <LiveTab
            meetingId={meeting.meetingId}
            meetingTitle={meeting.title}
            agendaItems={agendaItems.map((a) => ({ agendaItemId: a.agendaItemId, itemNumber: a.itemNumber ?? '', title: a.title ?? '' }))}
            interventions={interventions}
          />
        )}
        {tab === 'outcomes' && (
          <OutcomesTab
            meetingId={meeting.meetingId}
            outcomes={outcomesList}
            canEdit={canChangeStatus || canEditMeeting}
          />
        )}
        {tab === 'history' && <HistoryTab entries={statusHistory} />}
        {!['overview', 'agenda', 'documents', 'participants', 'tasks', 'correspondence', 'live', 'outcomes', 'history'].includes(tab) && (
          <div className="card">
            <div className="card-body">
              <p className="text-slate-500">Select a tab above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
