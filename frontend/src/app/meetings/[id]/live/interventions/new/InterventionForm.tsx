'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createInterventionAction } from './actions';

type Props = { meetingId: string; agendaItems: { agendaItemId: string; itemNumber: string; title: string }[] };

const TYPES = [
  { value: 'SUPPORT', label: 'Support' },
  { value: 'OPPOSE', label: 'Oppose' },
  { value: 'PROPOSE_AMENDMENT', label: 'Propose amendment' },
  { value: 'INFORMATION', label: 'Information' },
];

export function InterventionForm({ meetingId, agendaItems }: Props) {
  const router = useRouter();
  const [agendaItemId, setAgendaItemId] = useState(agendaItems[0]?.agendaItemId ?? '');
  const [text, setText] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('Delegation Leader');
  const [type, setType] = useState('SUPPORT');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaItemId || !text.trim()) return;
    setSaving(true);
    setError(null);
    const result = await createInterventionAction(meetingId, {
      agendaItemId,
      interventionText: text.trim(),
      deliveredByName: deliveredBy.trim() || undefined,
      interventionType: type,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  };

  if (saved) {
    return (
      <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-medium text-emerald-800">Intervention recorded.</p>
        <p className="mt-1 text-sm text-emerald-700">Stored as official record; included in meeting archive.</p>
        <div className="mt-4 flex gap-3">
          <Link href={`/meetings/${meetingId}/live`} className="btn-primary text-sm">Back to live lobby</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-slate-700">Agenda item</label>
        <select value={agendaItemId} onChange={(e) => setAgendaItemId(e.target.value)} className="input-base mt-1 max-w-md">
          {agendaItems.map((a) => (
            <option key={a.agendaItemId} value={a.agendaItemId}>Item {a.itemNumber}: {a.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Intervention text *</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="input-base mt-1 w-full" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Delivered by</label>
          <input type="text" value={deliveredBy} onChange={(e) => setDeliveredBy(e.target.value)} className="input-base mt-1 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-base mt-1 w-full">
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save intervention'}</button>
        <Link href={`/meetings/${meetingId}/live`} className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
