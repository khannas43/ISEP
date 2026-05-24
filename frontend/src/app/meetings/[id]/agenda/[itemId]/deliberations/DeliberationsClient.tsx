'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = { meetingId: string; itemId: string };

export function DeliberationsClient({ meetingId: _meetingId, itemId: _itemId }: Props) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setContent('');
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <h2 className="text-base font-semibold text-slate-900">Add note</h2>
      <p className="mt-1 text-base text-slate-600">ME can add notes; SA, DL, CO can add and edit others&apos; notes.</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="input-base w-full"
          placeholder="Internal deliberation note…"
        />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || !content.trim()} className="btn-primary text-base">
            {saving ? 'Saving…' : 'Add note'}
          </button>
          {saved && <span className="text-base text-emerald-600">Note added (demo).</span>}
        </div>
      </form>
    </div>
  );
}
