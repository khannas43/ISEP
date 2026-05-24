'use client';

import { useState } from 'react';

type Job = {
  id: string;
  name: string;
  lastRun: string;
  status: string;
  nextRun: string;
  sizeGb: number;
};

type Props = { jobs: Job[] };

export function BackupStatusTable({ jobs }: Props) {
  const [running, setRunning] = useState<string | null>(null);

  const handleRunNow = async (id: string) => {
    setRunning(id);
    await new Promise((r) => setTimeout(r, 1500));
    setRunning(null);
  };

  const hasFailed = jobs.some((j) => j.status === 'Failed');

  return (
    <div className="space-y-4">
      {hasFailed && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-base font-medium text-red-800">
          One or more backup jobs have failed. An alert has been sent to the system administrator.
        </div>
      )}
      <div className="card overflow-hidden">
        <table className="min-w-full text-base">
          <thead>
            <tr>
              <th className="table-header px-4 py-2 text-left">Job</th>
              <th className="table-header px-4 py-2 text-left">Last run</th>
              <th className="table-header px-4 py-2 text-left">Status</th>
              <th className="table-header px-4 py-2 text-left">Next run</th>
              <th className="table-header px-4 py-2 text-left">Size</th>
              <th className="table-header px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {jobs.map((j) => {
              let statusClass = 'text-slate-600';
              if (j.status === 'Failed') statusClass = 'text-red-600 font-medium';
              else if (j.status === 'Running') statusClass = 'text-blue-600';
              return (
              <tr key={j.id}>
                <td className="table-cell px-4 py-2 font-medium">{j.name}</td>
                <td className="table-cell px-4 py-2">{new Date(j.lastRun).toLocaleString()}</td>
                <td className="table-cell px-4 py-2">
                  <span className={statusClass}>
                    {j.status}
                  </span>
                </td>
                <td className="table-cell px-4 py-2">{j.nextRun === '—' ? '—' : new Date(j.nextRun).toLocaleString()}</td>
                <td className="table-cell px-4 py-2">{j.sizeGb > 0 ? `${j.sizeGb} GB` : '—'}</td>
                <td className="table-cell px-4 py-2">
                  <button
                    type="button"
                    onClick={() => handleRunNow(j.id)}
                    disabled={running === j.id}
                    className="text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {running === j.id ? 'Running…' : 'Run now'}
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
