'use client';

import { Fragment, useState } from 'react';

export type AuditViewerEntry = {
  id: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  details: string;
};

type Props = { entries: AuditViewerEntry[]; readOnly?: boolean };

export function AuditLogViewer({ entries, readOnly = true }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 50;

  const filtered = entries.filter((e) => {
    if (userFilter && !e.userName.toLowerCase().includes(userFilter.toLowerCase())) return false;
    if (actionFilter && e.action !== actionFilter) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const pageEntries = filtered.slice(page * perPage, page * perPage + perPage);
  const actions = Array.from(new Set(entries.map((e) => e.action)));

  if (entries.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-base text-slate-600">
          No audit entries yet. Only real activity is recorded—for example, system config changes and other audited actions. Use the application to generate activity; entries will appear here automatically.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="audit-user-filter" className="block text-sm font-medium text-slate-500">User</label>
              <input id="audit-user-filter" type="text" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="Search by name/email" className="input-base mt-1 w-48" />
            </div>
            <div>
              <label htmlFor="audit-action-filter" className="block text-sm font-medium text-slate-500">Action type</label>
              <select id="audit-action-filter" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input-base mt-1 w-40">
                <option value="">All</option>
                {actions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="button" className="btn-secondary text-base">Export CSV</button>
              <button type="button" className="btn-secondary text-base">Export JSON</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr>
                <th className="table-header px-4 py-2 text-left">Time</th>
                <th className="table-header px-4 py-2 text-left">User</th>
                <th className="table-header px-4 py-2 text-left">Action</th>
                <th className="table-header px-4 py-2 text-left">Entity</th>
                <th className="table-header px-4 py-2 text-left">IP</th>
                <th className="table-header px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pageEntries.map((e) => (
                <Fragment key={e.id}>
                  <tr>
                    <td className="table-cell px-4 py-2">{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="table-cell px-4 py-2">{e.userName}</td>
                    <td className="table-cell px-4 py-2">{e.action}</td>
                    <td className="table-cell px-4 py-2">{e.entityType} {e.entityId}</td>
                    <td className="table-cell px-4 py-2">{e.ipAddress}</td>
                    <td className="table-cell px-4 py-2">
                      <button type="button" onClick={() => setExpandedId(expandedId === e.id ? null : e.id)} className="text-blue-600 hover:underline">
                        {expandedId === e.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === e.id && (
                    <tr>
                      <td colSpan={6} className="table-cell bg-slate-50 px-4 py-2 font-mono text-sm">
                        {e.details ?? 'No before/after state recorded.'}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-base text-slate-600">
          <span>Page {page + 1} of {totalPages} · {filtered.length} entries</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary text-base disabled:opacity-50">Previous</button>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary text-base disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
