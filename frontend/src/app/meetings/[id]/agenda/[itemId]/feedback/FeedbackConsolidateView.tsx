'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AgendaItemDto, FeedbackDto } from '@/lib/api';

type FeedbackDisplay = Pick<FeedbackDto, 'userId' | 'userName' | 'position' | 'comments' | 'suggestedAmendments' | 'status' | 'submittedAt'> & { amendments?: string };

type Props = {
  meetingId: string;
  itemId: string;
  agendaItem: AgendaItemDto;
  feedback: FeedbackDisplay[];
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

/**
 * Coordinator view: left = member list + status, centre = selected feedback, right = consolidation draft.
 * Demo: Finalize button shows success (no API).
 */
export function FeedbackConsolidateView({ meetingId, itemId, agendaItem, feedback }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(feedback[0]?.userId ?? null);
  const [consolidatedPosition, setConsolidatedPosition] = useState('SUPPORT');
  const [consolidatedText, setConsolidatedText] = useState('');
  const [finalized, setFinalized] = useState(false);
  const [saving, setSaving] = useState(false);

  const selected = feedback.find((f) => f.userId === selectedId);

  const handleFinalize = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setFinalized(true);
  };

  const supportCount = feedback.filter((f) => f.position === 'SUPPORT').length;
  const objectCount = feedback.filter((f) => f.position === 'OBJECT').length;
  const neutralCount = feedback.filter((f) => f.position === 'NEUTRAL').length;
  const abstainCount = feedback.filter((f) => f.position === 'ABSTAIN').length;

  if (finalized) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="font-medium text-emerald-800">Consolidation finalized (demo).</p>
          <p className="mt-1 text-sm text-emerald-700">Ready for Delegation Leader review.</p>
          <div className="mt-4 flex gap-3">
            <Link href={`/meetings/${meetingId}/agenda/${itemId}`} className="btn-primary text-sm">
              Back to Agenda Item
            </Link>
            <Link href={`/meetings/${meetingId}?tab=agenda`} className="btn-secondary text-sm">
              Agenda list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <h1 className="page-title">Consolidate feedback</h1>
        <p className="page-subtitle">
          Item {agendaItem.itemNumber}: {agendaItem.title}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: member list */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Members</h2>
            <ul className="mt-2 space-y-1">
              {feedback.map((f) => (
                <li key={f.userId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(f.userId)}
                    className={`w-full rounded px-2 py-1.5 text-left text-sm ${
                      selectedId === f.userId ? 'bg-blue-100 text-blue-900' : 'hover:bg-slate-100'
                    }`}
                  >
                    {f.userName}
                    <span className="ml-2 text-xs text-slate-500">({f.status})</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs font-medium text-slate-600">Position distribution</p>
              <p className="mt-1 text-sm text-slate-700">
                Support {supportCount}, Object {objectCount}, Neutral {neutralCount}, Abstain {abstainCount}
              </p>
            </div>
          </div>

          {/* Centre: selected member feedback */}
          <div className="rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Selected input</h2>
            {selected ? (
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="font-medium text-slate-600">Position:</span> {selected.position}</p>
                <p><span className="font-medium text-slate-600">Comments:</span> {selected.comments || '—'}</p>
                {(selected.suggestedAmendments ?? (selected as { amendments?: string }).amendments) && (
                  <p><span className="font-medium text-slate-600">Amendments:</span> {selected.suggestedAmendments ?? (selected as { amendments?: string }).amendments}</p>
                )}
                <p className="text-xs text-slate-500">Submitted {formatDate(selected.submittedAt)}</p>
              </div>
            ) : (
              <p className="mt-2 text-slate-500">Select a member from the list.</p>
            )}
          </div>

          {/* Right: consolidation workspace */}
          <div className="rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Consolidated position</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Position</label>
                <select
                  value={consolidatedPosition}
                  onChange={(e) => setConsolidatedPosition(e.target.value)}
                  className="input-base mt-1 w-full text-sm"
                >
                  <option value="SUPPORT">Support</option>
                  <option value="OBJECT">Object</option>
                  <option value="NEUTRAL">Neutral</option>
                  <option value="ABSTAIN">Abstain</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Consolidated text</label>
                <textarea
                  value={consolidatedText}
                  onChange={(e) => setConsolidatedText(e.target.value)}
                  rows={6}
                  className="input-base mt-1 w-full text-sm"
                  placeholder="Draft the consolidated group position..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={handleFinalize} disabled={saving} className="btn-primary">
            {saving ? 'Finalizing…' : 'Finalize consolidation'}
          </button>
          <Link href={`/meetings/${meetingId}/agenda/${itemId}`} className="btn-secondary">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
