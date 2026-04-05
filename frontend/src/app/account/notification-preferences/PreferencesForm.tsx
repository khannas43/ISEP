'use client';

import { useState } from 'react';

const TYPES = [
  { id: 'task_assigned', label: 'Task assigned' },
  { id: 'task_reminder', label: 'Task reminder' },
  { id: 'document_uploaded', label: 'Document uploaded' },
  { id: 'approval_required', label: 'Approval required' },
  { id: 'meeting_scheduled', label: 'Meeting scheduled' },
];

export function PreferencesForm() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit}>
      <ul className="mt-6 space-y-4">
        {TYPES.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <span className="font-medium text-slate-900">{t.label}</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input name={`${t.id}_portal`} type="checkbox" defaultChecked className="rounded" /> In-portal
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name={`${t.id}_email`} type="checkbox" defaultChecked className="rounded" /> Email
              </label>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
        {saved && <span className="text-sm text-emerald-600">Preferences saved.</span>}
      </div>
    </form>
  );
}
