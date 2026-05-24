'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOutcomeAction } from './actions';

type Props = {
  meetingId: string;
  agendaItems: { agendaItemId: string; itemNumber?: string; title: string }[];
};

export function OutcomeForm({ meetingId, agendaItems }: Props) {
  const router = useRouter();
  const [agendaItemId, setAgendaItemId] = useState(agendaItems[0]?.agendaItemId ?? '');
  const [decision, setDecision] = useState('');
  const [resolutionRef, setResolutionRef] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agendaItemId || !decision.trim()) return;
    setSaving(true);
    setError(null);
    const result = await createOutcomeAction(meetingId, {
      agendaItemId,
      decision: decision.trim(),
      resolutionRef: resolutionRef.trim() || undefined,
      nextSteps: nextSteps.trim() || undefined,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setDecision('');
    setResolutionRef('');
    setNextSteps('');
    router.refresh();
  }

  if (agendaItems.length === 0) return null;

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <h3 className="text-base font-semibold text-slate-900">Add outcome</h3>
      {saved && <p className="mt-2 text-base text-emerald-600">Outcome saved.</p>}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-base text-red-700">{error}</p>}
        <div>
          <label className="block text-base font-medium text-slate-700">Agenda item</label>
          <select
            value={agendaItemId}
            onChange={(e) => setAgendaItemId(e.target.value)}
            className="input-base mt-1 max-w-md"
          >
            {agendaItems.map((a) => (
              <option key={a.agendaItemId} value={a.agendaItemId}>
                Item {a.itemNumber}: {a.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-base font-medium text-slate-700">Decision *</label>
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            rows={3}
            className="input-base mt-1 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-base font-medium text-slate-700">Resolution ref</label>
          <input
            type="text"
            value={resolutionRef}
            onChange={(e) => setResolutionRef(e.target.value)}
            className="input-base mt-1 max-w-md"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-slate-700">Next steps</label>
          <textarea
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            rows={2}
            className="input-base mt-1 w-full"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save outcome'}
        </button>
      </form>
    </div>
  );
}
