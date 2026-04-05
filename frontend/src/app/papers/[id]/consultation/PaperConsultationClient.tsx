'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type ConsultationAgencyDto,
  type ConsultationDto,
  type ExternalAgencyCandidateDto,
  getDocumentConsultations,
  getExternalAgencyCandidates,
  sendDocumentConsultation,
  submitConsultationFeedback,
} from '@/lib/api';

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  VIEWED: { bg: '#dbeafe', color: '#1e40af', label: 'Viewed' },
  FEEDBACK_SUBMITTED: { bg: '#dcfce7', color: '#166534', label: 'Feedback received' },
};

function statusBadge(status: string) {
  const s = STATUS_STYLE[status] ?? { bg: '#f1f5f9', color: '#475569', label: status };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

type Props = {
  accessToken: string;
  paperId: string;
  documentId: string | null;
  title: string;
  canSendConsultation: boolean;
};

export default function PaperConsultationClient({
  accessToken,
  paperId,
  documentId,
  title,
  canSendConsultation,
}: Props) {
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
  const [draftFeedback, setDraftFeedback] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!documentId || !accessToken) {
      setConsultations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getDocumentConsultations(accessToken, documentId);
      setConsultations(list);
    } catch {
      setError('Could not load consultations.');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, documentId]);

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

  const handleSubmitFeedback = async (consultationId: string) => {
    const html = draftFeedback[consultationId]?.trim();
    if (!html) return;
    const ok = await submitConsultationFeedback(accessToken, consultationId, `<p>${escapeForHtml(html)}</p>`);
    if (ok) {
      setDraftFeedback((d) => ({ ...d, [consultationId]: '' }));
      await load();
    } else {
      setError('Could not submit feedback.');
    }
  };

  const latest = consultations[0];
  const allFeedbackInLatest = useMemo(() => {
    if (!latest?.agencies?.length) return false;
    return latest.agencies.every((a) => a.status === 'FEEDBACK_SUBMITTED');
  }, [latest]);

  if (!documentId) {
    return (
      <div className="card">
        <div className="card-body space-y-3">
          <h1 className="page-title">External consultation</h1>
          <p className="text-slate-600">{title}</p>
          <p className="text-sm text-slate-500">
            This paper is not linked to a clean-copy document yet. Generate a clean copy from the document workflow, then
            refresh this page.
          </p>
          <Link href={`/papers/${paperId}/draft`} className="inline-block text-sm font-medium text-blue-600 hover:underline">
            ← Back to draft
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/papers/${paperId}/draft`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Back to draft
        </Link>
        <Link
          href={`/documents/${documentId}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Open linked document
        </Link>
      </div>

      <div className="card">
        <div className="card-body space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="page-title">External consultation</h1>
              <p className="mt-1 text-slate-600">{title}</p>
              <p className="mt-2 text-sm text-slate-500">Clean copy document (consultation target)</p>
            </div>
            {canSendConsultation ? (
              <button
                type="button"
                onClick={() => void openModal()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Send for consultation
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          ) : null}

          {allFeedbackInLatest ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <strong>All responses received</strong> — every agency listed on the latest consultation has submitted feedback.
            </div>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Loading consultations…</p>
          ) : consultations.length === 0 ? (
            <p className="text-sm text-slate-600">No consultations yet for this document.</p>
          ) : (
            consultations.map((c) => (
              <div key={c.id} className="space-y-3 rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <span>
                    Sent: {c.sentAt ? new Date(c.sentAt).toLocaleString() : '—'}
                  </span>
                  {c.deadline ? (
                    <span className="text-slate-500">Deadline: {c.deadline}</span>
                  ) : null}
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{c.status}</span>
                </div>
                {c.notes ? <p className="text-sm text-slate-700">{c.notes}</p> : null}

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="table-header px-4 py-2.5 text-left">Agency</th>
                        <th className="table-header px-4 py-2.5 text-left">Status</th>
                        <th className="table-header px-4 py-2.5 text-left">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {c.agencies.map((a) => {
                        const rowKey = `${c.id}-${a.id}`;
                        const expanded = expandedAgencyKey === rowKey;
                        return (
                          <ConsultationAgencyRow
                            key={rowKey}
                            agency={a}
                            expanded={expanded}
                            onToggle={() => setExpandedAgencyKey(expanded ? null : rowKey)}
                            draftFeedback={draftFeedback[c.id] ?? ''}
                            onDraftChange={(v) => setDraftFeedback((d) => ({ ...d, [c.id]: v }))}
                            onSubmitFeedback={() => void handleSubmitFeedback(c.id)}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Send for consultation</h2>
            <p className="mt-1 text-sm text-slate-600">Select ministries to notify. They will receive a portal notification.</p>
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {candidates.map((u) => (
                <li key={u.userId} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`cand-${u.userId}`}
                    checked={selectedIds.has(u.userId)}
                    onChange={() => toggleSelect(u.userId)}
                    className="mt-1"
                  />
                  <label htmlFor={`cand-${u.userId}`} className="text-sm">
                    <span className="font-medium text-slate-900">{u.organization || u.fullName}</span>
                    <span className="block text-slate-500">{u.fullName}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Response deadline
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Notes
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sending || selectedIds.size === 0}
                onClick={() => void handleSend()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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

function escapeForHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ConsultationAgencyRow({
  agency,
  expanded,
  onToggle,
  draftFeedback,
  onDraftChange,
  onSubmitFeedback,
}: {
  agency: ConsultationAgencyDto;
  expanded: boolean;
  onToggle: () => void;
  draftFeedback: string;
  onDraftChange: (v: string) => void;
  onSubmitFeedback: () => void;
}) {
  return (
    <>
      <tr>
        <td className="table-cell px-4 py-2.5 font-medium text-slate-900">{agency.agencyName}</td>
        <td className="table-cell px-4 py-2.5">{statusBadge(agency.status)}</td>
        <td className="table-cell px-4 py-2.5">
          <button type="button" onClick={onToggle} className="text-blue-600 hover:underline">
            {expanded ? 'Hide' : 'View'} feedback
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr className="bg-slate-50/80">
          <td colSpan={3} className="px-4 py-3 text-sm text-slate-700">
            {agency.feedbackHtml ? (
              <div
                className="prose prose-sm max-w-none text-slate-800"
                dangerouslySetInnerHTML={{ __html: agency.feedbackHtml }}
              />
            ) : (
              <p className="text-slate-500">No feedback submitted yet.</p>
            )}
            {agency.currentUser && agency.status !== 'FEEDBACK_SUBMITTED' ? (
              <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                <label className="block text-sm font-medium text-slate-700">Your feedback</label>
                <textarea
                  value={draftFeedback}
                  onChange={(e) => onDraftChange(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Plain text; line breaks preserved."
                />
                <button
                  type="button"
                  onClick={onSubmitFeedback}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Submit feedback
                </button>
              </div>
            ) : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}
