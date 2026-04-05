'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = { contextLabel?: string; documentId?: string };

export function AddCommentForm({ contextLabel = 'document', documentId }: Props) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'INTERNAL' | 'DELEGATION'>('DELEGATION');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setSaved(false);
    setError(null);

    if (documentId) {
      try {
        const res = await fetch(`/api/documents/${documentId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim(), visibility }),
          credentials: 'same-origin',
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error ?? `Failed to post comment (${res.status})`);
          setSaving(false);
          return;
        }
        setContent('');
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to post comment');
      } finally {
        setSaving(false);
      }
    } else {
      await new Promise((r) => setTimeout(r, 400));
      setContent('');
      setSaved(true);
      setSaving(false);
      router.refresh();
    }
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <h2 className="text-base font-semibold text-slate-900">Add comment</h2>
      <p className="mt-1 text-sm text-slate-600">Edit within 30 min; no delete (soft-hide).</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="input-base w-full"
          placeholder={`Comment on this ${contextLabel}…`}
        />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Visibility:</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'INTERNAL' | 'DELEGATION')}
              className="input-base max-w-[160px]"
            >
              <option value="DELEGATION">Delegation</option>
              <option value="INTERNAL">Internal</option>
            </select>
          </label>
          <button type="submit" disabled={saving || !content.trim()} className="btn-primary text-sm">
            {saving ? 'Posting…' : 'Post comment'}
          </button>
          {saved && <span className="text-sm text-emerald-600">Comment added.</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}
