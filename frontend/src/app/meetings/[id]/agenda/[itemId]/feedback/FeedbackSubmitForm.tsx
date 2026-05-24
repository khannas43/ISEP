'use client';

import { useState } from 'react';
import Link from 'next/link';
import { saveFeedbackAction, submitFeedbackAction } from './actions';

type Props = {
  meetingId: string;
  itemId: string;
  agendaItemTitle: string;
  deadline?: string;
};

const POSITIONS = [
  { value: 'SUPPORT', label: 'Support' },
  { value: 'OBJECT', label: 'Object' },
  { value: 'NEUTRAL', label: 'Neutral' },
  { value: 'ABSTAIN', label: 'Abstain' },
] as const;

/**
 * Member feedback form. Saves/submits via backend API with mock fallback when API unavailable.
 */
export function FeedbackSubmitForm({ meetingId, itemId, agendaItemTitle, deadline }: Props) {
  const [position, setPosition] = useState<string>('SUPPORT');
  const [comments, setComments] = useState('');
  const [amendments, setAmendments] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitMode, setSubmitMode] = useState<'draft' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await saveFeedbackAction(itemId, { position, comments, suggestedAmendments: amendments });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setSubmitMode('draft');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const saveResult = await saveFeedbackAction(itemId, { position, comments, suggestedAmendments: amendments });
    if (saveResult.error || !saveResult.feedback) {
      setSaving(false);
      setError(saveResult.error ?? 'Failed to save');
      return;
    }
    const submitResult = await submitFeedbackAction(saveResult.feedback.feedbackId);
    setSaving(false);
    if (submitResult.error) {
      setError(submitResult.error);
      return;
    }
    setSaved(true);
    setSubmitMode('submit');
  };

  if (saved) {
    return (
      <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-medium text-emerald-800">
          {submitMode === 'submit' ? 'Feedback submitted successfully.' : 'Feedback saved as draft.'}
        </p>
        <p className="mt-1 text-base text-emerald-700">
          {submitMode === 'submit'
            ? 'It has been sent to the coordinator for consolidation.'
            : 'You can return later to submit, or the coordinator will see it in the list.'}
        </p>
        <div className="mt-4 flex gap-3">
          <Link href={`/meetings/${meetingId}/agenda/${itemId}?tab=feedback`} className="btn-primary text-base">
            View in Agenda Item
          </Link>
          <Link href={`/meetings/${meetingId}?tab=agenda`} className="btn-secondary text-base">
            Back to Agenda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-800">
          {error}
        </div>
      )}
      <div>
        <label className="block text-base font-medium text-slate-700">Position</label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="input-base mt-1 max-w-xs"
        >
          {POSITIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Comments (required)</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          className="input-base mt-1 w-full"
          placeholder="Your detailed comments on this agenda item..."
        />
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Suggested amendments</label>
        <textarea
          value={amendments}
          onChange={(e) => setAmendments(e.target.value)}
          rows={2}
          className="input-base mt-1 w-full"
          placeholder="Optional: suggested text changes or amendments"
        />
      </div>
      {deadline && (
        <p className="text-base text-slate-500">Deadline: {deadline}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Submitting…' : 'Submit feedback'}
        </button>
        <button type="button" onClick={handleSaveDraft} disabled={saving} className="btn-secondary">
          Save as draft
        </button>
        <Link href={`/meetings/${meetingId}/agenda/${itemId}`} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
