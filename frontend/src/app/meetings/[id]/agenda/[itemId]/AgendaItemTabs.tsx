'use client';

/**
 * Agenda item tabs: Documents, Feedback, Tasks, Papers, Deliberations, Activity.
 * Uses searchParams ?tab= for active tab. Feedback list comes from API (FeedbackDto[]); documents/tasks from props.
 */
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { AgendaItemDto, DocumentDto, FeedbackDto, TaskDto } from '@/lib/api';
import { RoleGuard } from '@/components/rbac/RoleGuard';
import { CreateTaskButton, type AgendaTaskParticipant } from '@/components/tasks/CreateTaskModal';
import { PaperUploadDropzone } from '@/components/papers/PaperUploadDropzone';
import { useTranslation } from '@/i18n/client';
/** Minimal shapes for agenda item tabs (API or mock). */
type AgendaPaper = { paperId: string; title: string; status: string; currentStage?: string };
type AgendaDeliberation = { id: string; note: string; capturedAt: string; authorName?: string };
type AgendaComment = { id: string; text: string; authorName: string; createdAt: string };

const TABS = [
  { id: 'documents', label: 'Documents' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'papers', label: 'Paper drafts' },
  { id: 'deliberations', label: 'Deliberations' },
  { id: 'activity', label: 'Activity' },
] as const;

type Props = {
  meetingId: string;
  itemId: string;
  agendaItem: AgendaItemDto;
  documents: DocumentDto[];
  participants: AgendaTaskParticipant[];
  feedback: FeedbackDto[];
  tasks: TaskDto[];
  papers: AgendaPaper[];
  deliberations: AgendaDeliberation[];
  comments: AgendaComment[];
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function AgendaItemTabs({
  meetingId,
  itemId,
  agendaItem,
  documents,
  participants,
  feedback,
  tasks,
  papers,
  deliberations,
  comments,
}: Props) {
  const itemTasks = tasks.filter((x) => !x.agendaItemId || x.agendaItemId === itemId);
  const docOptions = documents
    .filter((d) => d.agendaItemId === itemId || !d.agendaItemId)
    .map((d) => ({ id: d.documentId, fileName: d.fileName }));
  const { t } = useTranslation('common');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get('tab') || 'documents') as string;

  return (
    <>
      <nav className="flex gap-1 border-b border-slate-200 bg-white/80" aria-label="Agenda item sections">
        {TABS.map((tab) => {
          const isActive = current === tab.id;
          const href = `${pathname}?tab=${tab.id}`;
          return (
            <Link
              key={tab.id}
              href={href}
              className={`border-b-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">
        {current === 'documents' && (
          <div className="card">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
                <Link
                  href={`/meetings/${meetingId}/documents/upload`}
                  className="btn-secondary text-sm"
                >
                  Legacy upload page
                </Link>
              </div>
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER']}>
                <section className="mt-6" aria-label={t('document.upload.title')}>
                  <h3 className="mb-3 text-base font-medium text-slate-800">{t('document.upload.title')}</h3>
                  <PaperUploadDropzone meetingId={meetingId} agendaItemId={itemId} />
                </section>
              </RoleGuard>
              {documents.length === 0 ? (
                <p className="mt-2 text-slate-500">No documents linked to this agenda item yet.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {documents.map((d) => (
                    <li key={d.documentId}>
                      <Link href={`/documents/${d.documentId}`} className="text-blue-600 hover:underline">
                        {d.title}
                      </Link>
                      <span className="ml-2 text-sm text-slate-500">({d.documentType}, v{d.currentVersion})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {current === 'feedback' && (
          <div className="card">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Member feedback</h2>
                <div className="flex gap-2">
                  <Link
                    href={`/meetings/${meetingId}/agenda/${itemId}/feedback/submit`}
                    className="btn-secondary text-sm"
                  >
                    Submit feedback (Member)
                  </Link>
                  <Link
                    href={`/meetings/${meetingId}/agenda/${itemId}/feedback/consolidate`}
                    className="btn-primary text-sm"
                  >
                    Consolidate (Coordinator)
                  </Link>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Position distribution: Support {feedback.filter((f) => f.position === 'SUPPORT').length}, Object{' '}
                {feedback.filter((f) => f.position === 'OBJECT').length}, Neutral {feedback.filter((f) => f.position === 'NEUTRAL').length}, Abstain{' '}
                {feedback.filter((f) => f.position === 'ABSTAIN').length}
              </p>
              {feedback.length === 0 ? (
                <p className="mt-4 text-slate-500">No feedback submitted yet.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {feedback.map((f) => (
                    <li key={f.feedbackId} className="rounded border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{f.userName ?? '—'}</span>
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                          f.position === 'SUPPORT' ? 'bg-emerald-100 text-emerald-800' :
                          f.position === 'OBJECT' ? 'bg-red-100 text-red-800' :
                          f.position === 'NEUTRAL' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {f.position ?? 'NEUTRAL'}
                        </span>
                        <span className="text-xs text-slate-500">{f.status}</span>
                      </div>
                      {f.comments && <p className="mt-2 text-sm text-slate-700">{f.comments}</p>}
                      {f.suggestedAmendments && <p className="mt-1 text-sm text-slate-600">Amendments: {f.suggestedAmendments}</p>}
                      {f.submittedAt && <p className="mt-1 text-xs text-slate-500">Submitted {formatDate(f.submittedAt)}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {current === 'tasks' && (
          <div className="card">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
                <CreateTaskButton
                  meetingId={meetingId}
                  agendaItemId={itemId}
                  participants={participants}
                  documents={docOptions}
                />
              </div>
              {itemTasks.length === 0 ? (
                <p className="mt-2 text-slate-500">No tasks linked to this agenda item.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {itemTasks.map((taskRow) => (
                    <li key={taskRow.taskId}>
                      <Link
                        href={`/meetings/${meetingId}/tasks/${taskRow.taskId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {taskRow.title}
                      </Link>
                      <span className="ml-2 text-sm text-slate-500">
                        {taskRow.assignedToName ?? 'Unassigned'} · {taskRow.status} · Due {taskRow.dueDate ?? '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {current === 'papers' && (
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-semibold text-slate-900">Paper drafts</h2>
              <p className="mt-1 text-sm text-slate-600">India&apos;s formal papers (submissions, interventions) linked to this agenda item.</p>
              {papers.length === 0 ? (
                <p className="mt-4 text-slate-500">No papers yet. Create from consolidation or document workflow.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {papers.map((p) => (
                    <li key={p.paperId}>
                      <Link href={`/papers/${p.paperId}/draft`} className="font-medium text-blue-600 hover:underline">
                        {p.title}
                      </Link>
                      <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{p.status}</span>
                      <span className="ml-2 text-sm text-slate-500">Stage: {p.currentStage ?? '—'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {current === 'deliberations' && (
          <div className="card">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Deliberation notes</h2>
                <Link href={`/meetings/${meetingId}/agenda/${itemId}/deliberations`} className="text-sm font-medium text-blue-600 hover:underline">
                  Open full page →
                </Link>
              </div>
              <p className="mt-1 text-sm text-slate-600">Internal notes (not shared with IMO).</p>
              {deliberations.length === 0 ? (
                <p className="mt-4 text-slate-500">No deliberation notes yet.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {deliberations.map((n) => (
                    <li key={n.id} className="rounded border border-slate-200 bg-slate-50/50 p-3">
                      <p className="text-sm text-slate-800">{n.note}</p>
                      <p className="mt-2 text-xs text-slate-500">{n.authorName ?? '—'} · {formatDate(n.capturedAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {current === 'activity' && (
          <div className="card">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Activity / comments</h2>
                <Link href={`/meetings/${meetingId}/agenda/${itemId}/comments`} className="text-sm font-medium text-blue-600 hover:underline">
                  Open comments page →
                </Link>
              </div>
              {comments.length === 0 ? (
                <p className="mt-2 text-slate-500">No comments yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {comments.map((c) => (
                    <li key={c.id} className="border-l-2 border-slate-200 pl-4">
                      <p className="text-sm text-slate-800">{c.text}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {c.authorName} · {formatDate(c.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
