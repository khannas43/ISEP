'use client';

import Link from 'next/link';
import type { DocumentDto, AgendaItemDto } from '@/lib/api';
import { formatDisplayDate } from '@/lib/format';

type Props = {
  meetingId: string;
  documents: DocumentDto[];
  agendaItems: AgendaItemDto[];
  canUpload: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTab({ meetingId, documents, agendaItems, canUpload }: Props) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
            <p className="mt-1 text-sm text-slate-500">Documents linked to this meeting.</p>
          </div>
          {canUpload && (
            <Link href={`/meetings/${meetingId}/documents/upload`} className="btn-primary">
              Upload document
            </Link>
          )}
        </div>
        {documents.length === 0 ? (
          <p className="mt-4 text-slate-500">No documents uploaded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr>
                  <th className="table-header px-4 py-2.5 text-left">Title</th>
                  <th className="table-header px-4 py-2.5 text-left">Type</th>
                  <th className="table-header px-4 py-2.5 text-left">Source</th>
                  <th className="table-header px-4 py-2.5 text-left">File</th>
                  <th className="table-header px-4 py-2.5 text-left">Uploaded</th>
                  <th className="table-header px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {documents.map((d) => (
                  <tr key={d.documentId} className="hover:bg-slate-50/50">
                    <td className="table-cell font-medium text-slate-900">
                      <Link href={`/documents/${d.documentId}`} className="text-blue-600 hover:underline">
                        {d.title}
                      </Link>
                    </td>
                    <td className="table-cell text-slate-600">{d.documentType?.replace(/_/g, ' ')}</td>
                    <td className="table-cell text-slate-600">{d.source?.replace(/_/g, ' ')}</td>
                    <td className="table-cell text-slate-600">
                      {d.fileName} ({formatBytes(d.fileSizeBytes ?? 0)})
                    </td>
                    <td className="table-cell text-slate-600">
                      {d.uploadedAt ? formatDisplayDate(d.uploadedAt) : '—'}
                      {d.uploadedByName && (
                        <span className="block text-xs text-slate-500">{d.uploadedByName}</span>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <Link href={`/documents/${d.documentId}`} className="text-sm font-medium text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
