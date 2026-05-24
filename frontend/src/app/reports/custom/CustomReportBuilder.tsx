'use client';

import { useState } from 'react';

const ENTITIES = [
  { id: 'meetings', label: 'Meetings' },
  { id: 'documents', label: 'Documents' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'approvals', label: 'Approvals' },
];

const MOCK_ROWS: Record<string, Array<Record<string, string>>> = {
  meetings: [
    { title: 'MSC 108 Session', bodyName: 'MSC', startDate: '2025-05-12', status: 'ACTIVE' },
    { title: 'MEPC 82 Session', bodyName: 'MEPC', startDate: '2025-09-22', status: 'PLANNED' },
  ],
  documents: [
    { title: 'MSC 108/5 - Strategic Plan', documentType: 'WORKING_DOCUMENT', status: 'FINAL' },
    { title: 'Provisional agenda MSC 108', documentType: 'AGENDA_PAPER', status: 'FINAL' },
  ],
  tasks: [
    { title: 'Prepare consolidated position', assignedToName: 'Coordinator One', status: 'IN_PROGRESS' },
    { title: 'Submit feedback on agenda item 5', assignedToName: 'Member One', status: 'COMPLETED' },
  ],
  feedback: [
    { userName: 'Member One', position: 'SUPPORT', status: 'SUBMITTED' },
  ],
  approvals: [
    { paperTitle: 'India position on Strategic Plan', currentStage: 'Delegation Leader', status: 'IN_APPROVAL' },
  ],
};

export function CustomReportBuilder() {
  const [entity, setEntity] = useState('meetings');
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setGenerated(false);
    await new Promise((r) => setTimeout(r, 500));
    setGenerating(false);
    setGenerated(true);
  }

  const rows = MOCK_ROWS[entity] ?? [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-600">Entity</span>
          <select
            value={entity}
            onChange={(e) => { setEntity(e.target.value); setGenerated(false); }}
            className="input-base min-w-[180px]"
          >
            {ENTITIES.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? 'Generating…' : 'Generate preview'}
        </button>
      </div>

      {generated && (
        <div className="rounded-lg border border-slate-200">
          <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-base font-medium text-slate-700">
            Preview — {ENTITIES.find((e) => e.id === entity)?.label ?? entity}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-base">
              <thead>
                <tr className="bg-slate-50">
                  {columns.map((col) => (
                    <th key={col} className="table-header px-4 py-2.5 text-left capitalize">
                      {col.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row) => (
                  <tr key={columns.map((c) => row[c]).join('|')}>
                    {columns.map((col) => (
                      <td key={col} className="table-cell px-4 py-2.5 text-slate-700">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            Demo data. In production: download Excel / PDF / XML; saved templates; async generation with email delivery.
          </p>
        </div>
      )}
    </div>
  );
}
