'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { uploadMeetingDocument } from '../../actions';
import type { AgendaItemDto } from '@/lib/api';

type Props = {
  meetingId: string;
  agendaItems: AgendaItemDto[];
  documentTypeOptions: { code: string; label: string }[];
  sourceOptions: { code: string; label: string }[];
};

export function DocumentUploadForm({
  meetingId,
  agendaItems,
  documentTypeOptions,
  sourceOptions,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('OTHER');
  const [source, setSource] = useState('INDIA');
  const [agendaItemId, setAgendaItemId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!file || file.size === 0) {
      setError('Please select a file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be 20 MB or less.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set('meetingId', meetingId);
    formData.set('title', title.trim());
    formData.set('documentType', documentType);
    formData.set('source', source);
    if (agendaItemId) formData.set('agendaItemId', agendaItemId);
    formData.set('file', file);
    const result = await uploadMeetingDocument(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/meetings/${meetingId}?tab=documents`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700">Title <span className="text-red-600">*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          className="input-base mt-1 w-full max-w-md"
          required
          maxLength={1000}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Document type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="input-base mt-1 w-full"
          >
            {documentTypeOptions.map((o) => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="input-base mt-1 w-full"
          >
            {sourceOptions.map((o) => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      {agendaItems.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700">Agenda item (optional)</label>
          <select
            value={agendaItemId}
            onChange={(e) => setAgendaItemId(e.target.value)}
            className="input-base mt-1 w-full max-w-md"
          >
            <option value="">—</option>
            {agendaItems.map((a) => (
              <option key={a.agendaItemId} value={a.agendaItemId}>
                {a.itemNumber} {a.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700">File <span className="text-red-600">*</span></label>
        <p className="mt-0.5 text-xs text-slate-500">Maximum file size: 20 MB. Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX.</p>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="input-base mt-1 w-full max-w-md"
          required
        />
        {file && (
          <p className="mt-1 text-xs text-slate-500">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Uploading…' : 'Upload'}
        </button>
        <Link href={`/meetings/${meetingId}?tab=documents`} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
