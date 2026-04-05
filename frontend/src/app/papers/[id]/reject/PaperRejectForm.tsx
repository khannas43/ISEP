'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { rejectPaperAction } from './actions';

type Props = { paperId: string; paperTitle: string };

export function PaperRejectForm({ paperId }: Props) {
  const router = useRouter();
  const [comments, setComments] = useState('');
  const [returnToStage, setReturnToStage] = useState('Group Leader');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comments.trim().length < 50) return;
    setError(null);
    setSaving(true);
    const result = await rejectPaperAction(paperId, comments.trim());
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    router.refresh();
  };

  if (done) {
    return (
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="font-medium text-amber-800">Rejection recorded.</p>
        <p className="mt-1 text-sm text-amber-700">Submitter and stakeholders would be notified; document unlocked at selected stage.</p>
        <div className="mt-4 flex gap-3">
          <Link href={`/papers/${paperId}/approval`} className="btn-primary text-sm">Back to approval</Link>
          <Link href="/papers" className="btn-secondary text-sm">Papers list</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && (
        <div className="rounded bg-red-50 text-red-700 px-4 py-2 text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700">Rejection comments (min 50 characters) *</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          className="input-base mt-1 w-full"
          placeholder="Explain why the paper is being returned..."
          required
        />
        <p className="mt-1 text-xs text-slate-500">{comments.length} characters</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Return to stage</label>
        <select
          value={returnToStage}
          onChange={(e) => setReturnToStage(e.target.value)}
          className="input-base mt-1 max-w-xs"
        >
          <option value="Member">Member</option>
          <option value="Group Leader">Group Leader</option>
          <option value="Coordinator">Coordinator</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving || comments.trim().length < 50} className="btn-primary">
          {saving ? 'Submitting…' : 'Reject and return'}
        </button>
        <Link href={`/papers/${paperId}/approval`} className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
