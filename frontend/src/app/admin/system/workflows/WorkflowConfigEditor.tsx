'use client';

import Link from 'next/link';
import { useState } from 'react';

type Stage = {
  id: string;
  label: string;
  role: string;
  required: boolean;
  deadlineHours: number;
  escalationGraceHours: number;
};

type Props = { stages: Stage[] };

export function WorkflowConfigEditor({ stages: initialStages }: Props) {
  const [stages, setStages] = useState(initialStages);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleToggleOptional = (id: string, enabled: boolean) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, required: enabled } : s)));
  };

  const handleDeadlineChange = (id: string, hours: number) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, deadlineHours: hours } : s)));
  };

  const handleEscalationChange = (id: string, hours: number) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, escalationGraceHours: hours } : s)));
  };

  const handleSave = async () => {
    if (!confirm('Save workflow configuration? Changes will apply to new workflow instances only.')) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-900">Approval chain (step diagram)</h2>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-2">
            {stages.map((s, i) => (
              <span key={s.id} className="flex items-center gap-1">
                <span className="rounded bg-slate-100 px-3 py-1.5 text-base font-medium text-slate-800">
                  {s.label}
                </span>
                {i < stages.length - 1 && <span className="text-slate-400">→</span>}
              </span>
            ))}
          </div>
          <p className="mt-3 text-base text-slate-500">
            Member → Group Leader → Delegation Leader → IC Division → CS/NA/CSS → DG → MoPSW (optional).
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-900">Stages and deadlines</h2>
        </div>
        <div className="card-body overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr>
                <th className="table-header px-4 py-2 text-left">Stage</th>
                <th className="table-header px-4 py-2 text-left">Role</th>
                <th className="table-header px-4 py-2 text-left">Enabled</th>
                <th className="table-header px-4 py-2 text-left">Deadline (hours)</th>
                <th className="table-header px-4 py-2 text-left">Escalation grace (hours)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stages.map((s) => (
                <tr key={s.id}>
                  <td className="table-cell px-4 py-2 font-medium">{s.label}</td>
                  <td className="table-cell px-4 py-2 text-slate-600">{s.role}</td>
                  <td className="table-cell px-4 py-2">
                    {s.id === 'mopsw' ? (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={s.required}
                          onChange={(e) => handleToggleOptional(s.id, e.target.checked)}
                          className="rounded"
                        />
                        {' '}
                        Optional stage
                      </label>
                    ) : (
                      <span className="text-slate-500">Required</span>
                    )}
                  </td>
                  <td className="table-cell px-4 py-2">
                    <input
                      type="number"
                      min={24}
                      max={720}
                      value={s.deadlineHours}
                      onChange={(e) => handleDeadlineChange(s.id, parseInt(e.target.value, 10) || 72)}
                      className="input-base w-24"
                    />
                  </td>
                  <td className="table-cell px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      max={168}
                      value={s.escalationGraceHours}
                      onChange={(e) => handleEscalationChange(s.id, parseInt(e.target.value, 10) || 24)}
                      className="input-base w-24"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-800">
          Configuration saved (demo). In production this would persist to the workflow service and apply to new paper approval instances.
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save configuration'}
        </button>
        <Link href="/admin" className="btn-secondary">Cancel</Link>
      </div>
    </div>
  );
}
