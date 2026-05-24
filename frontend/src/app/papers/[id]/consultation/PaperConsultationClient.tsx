'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ErrorBanner } from '@/components/ErrorBanner';
import {
  type ConsultationDto,
  type ExternalAgencyCandidateDto,
  getDocumentConsultations,
  getExternalAgencyCandidates,
  getPaper,
  sendDocumentConsultation,
} from '@/lib/api';

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  VIEWED: { bg: '#dbeafe', color: '#1e40af', label: 'Viewed — no response yet' },
  FEEDBACK_SUBMITTED: { bg: '#dcfce7', color: '#166534', label: 'Feedback received' },
};

function statusBadge(status: string) {
  const s = STATUS_STYLE[status] ?? { bg: '#f1f5f9', color: '#475569', label: status };
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function AgencySkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-gray-900"
        >
          <div className="flex justify-between gap-3">
            <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-600" />
            <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-600" />
          </div>
          <div className="mt-2 h-4 w-40 rounded bg-slate-100 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

function parseLocalDateOnly(deadline: string): Date | null {
  const dayPart = deadline.split('T')[0];
  const parts = dayPart.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function deadlineSummary(deadline: string | null): ReactNode {
  if (!deadline) return null;
  const deadlineDay = parseLocalDateOnly(deadline);
  if (!deadlineDay) return <span>Deadline: {deadline}</span>;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((deadlineDay.getTime() - today.getTime()) / 86_400_000);
  const dateStr = deadlineDay.toLocaleDateString(undefined, { dateStyle: 'medium' });
  if (diffDays < 0) {
    return (
      <span>
        Deadline: {dateStr} · <span className="font-medium text-red-600">Deadline passed</span>
      </span>
    );
  }
  const unit = diffDays === 1 ? 'day' : 'days';
  return (
    <span>
      Deadline: {dateStr} · {diffDays} {unit} remaining
    </span>
  );
}

type Props = {
  accessToken: string;
  paperId: string;
  canSendConsultation: boolean;
};

export default function PaperConsultationClient({ accessToken, paperId, canSendConsultation }: Props) {
  const [title, setTitle] = useState('Paper');
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [paperLoaded, setPaperLoaded] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAgencyKey, setExpandedAgencyKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [candidates, setCandidates] = useState<ExternalAgencyCandidateDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPaperLoaded(false);
    try {
      const paper = await getPaper(accessToken, paperId);
      if (!paper) {
        setError('Paper not found.');
        setTitle('Paper');
        setDocumentId(null);
        setConsultations([]);
        return;
      }
      setTitle(paper.title);
      const docId = paper.cleanCopyDocumentId ?? null;
      setDocumentId(docId);
      setPaperLoaded(true);
      if (!docId) {
        setConsultations([]);
        return;
      }
      const list = await getDocumentConsultations(accessToken, docId);
      setConsultations(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, paperId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openModal = async () => {
    setModalOpen(true);
    setSelectedIds(new Set());
    const list = await getExternalAgencyCandidates(accessToken);
    setCandidates(list);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!documentId || selectedIds.size === 0) return;
    setSending(true);
    try {
      const dto = await sendDocumentConsultation(accessToken, documentId, {
        agencyUserIds: Array.from(selectedIds),
        deadline: deadline.trim() || null,
        notes: notes.trim() || null,
      });
      if (dto) {
        setModalOpen(false);
        setDeadline('');
        setNotes('');
        await load();
      } else {
        setError('Send failed. Check you are a Delegation Leader or System Admin.');
      }
    } finally {
      setSending(false);
    }
  };

  const latest = consultations[0];

  const { responded, viewed, pending, total, agencies } = useMemo(() => {
    const list = latest?.agencies ?? [];
    return {
      agencies: list,
      responded: list.filter((a) => a.status === 'FEEDBACK_SUBMITTED').length,
      viewed: list.filter((a) => a.status === 'VIEWED').length,
      pending: list.filter((a) => a.status === 'PENDING').length,
      total: list.length,
    };
  }, [latest]);

  if (paperLoaded && !documentId && !loading && !error) {
    return (
      <div className="card">
        <div className="card-body space-y-3">
          <h1 className="page-title">External consultation</h1>
          <p className="text-slate-600">{title}</p>
          <p className="text-base text-slate-500">
            This paper is not linked to a clean-copy document yet. Generate a clean copy from the document workflow, then
            refresh this page.
          </p>
          <Link href={`/papers/${paperId}/draft`} className="inline-block text-base font-medium text-blue-600 hover:underline">
            ← Back to draft
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/papers/${paperId}/draft`} className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Back to draft
        </Link>
        {documentId ? (
          <Link href={`/documents/${documentId}`} className="text-base font-medium text-blue-600 hover:underline">
            Open linked document
          </Link>
        ) : null}
      </div>

      <div className="card">
        <div className="card-body space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="page-title">External consultation</h1>
              <p className="mt-1 text-slate-600">{title}</p>
              <p className="mt-2 text-base text-slate-500">Clean copy document (consultation target)</p>
            </div>
            {canSendConsultation && documentId ? (
              <button
                type="button"
                onClick={() => void openModal()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Send for consultation
              </button>
            ) : null}
          </div>

          {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}

          {loading ? (
            <AgencySkeletonRows />
          ) : !latest ? (
            <p className="text-base text-slate-600">No consultations yet for this document.</p>
          ) : (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-base">
                  <span className={responded === total && total > 0 ? 'font-medium text-green-700' : 'font-medium text-amber-600'}>
                    {responded} of {total} responded
                  </span>
                  <span className="font-medium text-blue-600">{viewed} viewed</span>
                  <span className="font-medium text-gray-600 dark:text-gray-400">{pending} pending</span>
                </div>
                {latest.deadline ? (
                  <p className="mt-2 text-base text-slate-700 dark:text-slate-300">{deadlineSummary(latest.deadline)}</p>
                ) : null}
                {latest.notes ? <p className="mt-2 text-base text-slate-600">{latest.notes}</p> : null}
              </div>

              <div className="space-y-3">
                {agencies.map((a) => {
                  const rowKey = `${latest.id}-${a.id}`;
                  const expanded = expandedAgencyKey === rowKey;
                  const isSubmitted = a.status === 'FEEDBACK_SUBMITTED';
                  return (
                    <div key={rowKey} className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-gray-900">
                      <div className="flex items-start justify-between gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold text-slate-900 dark:text-slate-100">{a.agencyName}</p>
                          {isSubmitted && a.feedbackSubmittedAt ? (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                              Submitted on {new Date(a.feedbackSubmittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </p>
                          ) : null}
                          {a.status === 'VIEWED' ? (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Opened — awaiting response</p>
                          ) : null}
                          {a.status === 'PENDING' ? (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Not yet opened</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-2 self-start">
                          {statusBadge(a.status)}
                          {isSubmitted ? (
                            <button
                              type="button"
                              onClick={() => setExpandedAgencyKey(expanded ? null : rowKey)}
                              className="text-lg leading-none text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                              aria-expanded={expanded}
                              aria-label={expanded ? 'Collapse feedback' : 'Expand feedback'}
                            >
                              {expanded ? '▲' : '▼'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {isSubmitted && expanded ? (
                        <div
                          className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-b-lg border-t border-gray-200"
                          dangerouslySetInnerHTML={{ __html: a.feedbackHtml ?? '' }}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Send for consultation</h2>
            <p className="mt-1 text-base text-slate-600">Select ministries to notify. They will receive a portal notification.</p>
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
              {candidates.map((u) => (
                <li key={u.userId} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`cand-${u.userId}`}
                    checked={selectedIds.has(u.userId)}
                    onChange={() => toggleSelect(u.userId)}
                    className="mt-1"
                  />
                  <label htmlFor={`cand-${u.userId}`} className="text-base">
                    <span className="font-medium text-slate-900">{u.organization || u.fullName}</span>
                    <span className="block text-slate-500">{u.fullName}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-3">
              <label className="block text-base font-medium text-slate-700">
                Response deadline
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
                />
              </label>
              <label className="block text-base font-medium text-slate-700">
                Notes
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sending || selectedIds.size === 0}
                onClick={() => void handleSend()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
