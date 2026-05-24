/**
 * Agenda item detail page — single agenda item with tabs: Documents, Feedback, Tasks, Papers, Deliberations, Activity.
 * Fetches agenda item, documents (for this meeting filtered by item), tasks, and feedback list from API. Feedback tab shows submitted feedback.
 */
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import {
  getApiUrl,
  getFeedbackList,
  type AgendaItemDto,
  type DocumentDto,
  type TaskDto,
} from '@/lib/api';
import type { AgendaTaskParticipant } from '@/components/tasks/CreateTaskModal';
import { AgendaItemTabs } from './AgendaItemTabs';
import { PositionAdvisorPanel } from '@/components/ai/PositionAdvisorPanel';

async function getAgendaItem(meetingId: string, itemId: string, accessToken: string): Promise<AgendaItemDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items/${itemId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

type Props = { params: Promise<{ id: string; itemId: string }>; searchParams: Promise<{ tab?: string }> };

export default async function AgendaItemDetailPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: meetingId, itemId } = await params;
  await searchParams;

  const accessToken = (session as { accessToken?: string }).accessToken;
  let agendaItem: AgendaItemDto | null = null;
  if (accessToken) {
    try {
      agendaItem = await getAgendaItem(meetingId, itemId, accessToken);
    } catch {
      agendaItem = null;
    }
  }
  if (!agendaItem) notFound();

  const roles = (session as { roles?: string[] }).roles ?? [];
  const canUseAiAdvisor = roles.includes('SYSTEM_ADMIN') || roles.includes('COORDINATOR');

  let documents: DocumentDto[] = [];
  let tasks: TaskDto[] = [];
  let participants: AgendaTaskParticipant[] = [];
  let feedback: Awaited<ReturnType<typeof getFeedbackList>> = [];
  if (accessToken) {
    try {
      const [docRes, taskRes, partRes, feedbackList] = await Promise.all([
        fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/documents`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        }),
        fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/tasks`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        }),
        fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/participants`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        }),
        getFeedbackList(accessToken, itemId),
      ]);
      if (docRes.ok) {
        const docData = await docRes.json();
        const list = docData.content ?? docData ?? [];
        documents = (list as DocumentDto[]).filter((d) => d.agendaItemId === itemId || !d.agendaItemId);
      }
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        tasks = (taskData.content ?? taskData ?? []) as TaskDto[];
      }
      if (partRes.ok) {
        const raw = await partRes.json();
        const list = Array.isArray(raw) ? raw : [];
        participants = list.map(
          (p: { userId: string; name?: string | null; email?: string | null; meetingRole: string }) => ({
            userId: p.userId,
            fullName: p.name?.trim() || p.email || p.userId,
            role: p.meetingRole,
          })
        );
      }
      feedback = Array.isArray(feedbackList) ? feedbackList : [];
    } catch {
      // Leave empty when API unavailable
    }
  }
  const deliberations: { id: string; note: string; capturedAt: string }[] = [];
  const comments: { id: string; text: string; authorName: string; createdAt: string }[] = [];
  const papers: { paperId: string; title: string; status: string }[] = [];

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/meetings/${meetingId}?tab=agenda`}
          className="text-base font-medium text-slate-500 hover:text-slate-700"
        >
          ← Back to Agenda Items
        </Link>
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="card-body">
          <h1 className="page-title">
            Item {agendaItem.itemNumber}: {agendaItem.title}
          </h1>
          <p className="page-subtitle mt-1">{agendaItem.description ?? 'No description'}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-700">
              {agendaItem.category}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-700">
              {agendaItem.priority}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-700">
              {agendaItem.status}
            </span>
            {agendaItem.deadlineForInputs && (
              <span className="text-base text-slate-600">Deadline for inputs: {agendaItem.deadlineForInputs}</span>
            )}
          </div>
        </div>
      </div>

      <AgendaItemTabs
        meetingId={meetingId}
        itemId={itemId}
        agendaItem={agendaItem}
        documents={documents}
        participants={participants}
        feedback={feedback}
        tasks={tasks}
        papers={papers}
        deliberations={deliberations}
        comments={comments}
      />

      {canUseAiAdvisor && (
        <PositionAdvisorPanel agendaItemId={itemId} meetingId={meetingId} />
      )}
    </div>
  );
}
