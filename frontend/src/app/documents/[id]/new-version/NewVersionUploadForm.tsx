'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { uploadDocumentNewVersion } from '../../actions';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*';

type Props = {
  documentId: string;
  currentVersion: number;
  title: string;
};

export function NewVersionUploadForm({ documentId, currentVersion, title }: Props) {
  const router = useRouter();
  const [changeSummary, setChangeSummary] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successVersion, setSuccessVersion] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const summary = changeSummary.trim();
    if (!summary) {
      setError('Change summary is required.');
      return;
    }
    if (!file || file.size === 0) {
      setError('Please select a file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size must be ${MAX_FILE_SIZE_MB} MB or less.`);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set('documentId', documentId);
    formData.set('changeSummary', summary);
    formData.set('file', file);
    const result = await uploadDocumentNewVersion(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccessVersion(result.newVersion ?? currentVersion + 1);
    router.refresh();
  }

  if (successVersion != null) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="font-medium text-green-800">New version uploaded successfully.</p>
        <p className="mt-1 text-base text-green-700">Version {successVersion} is now the current version.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/documents/${documentId}`} className="btn-primary text-base">
            Back to document
          </Link>
          {successVersion > 1 && (
            <Link href={`/documents/${documentId}/compare`} className="btn-secondary text-base">
              Compare versions
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-base text-red-700">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="new-version-summary" className="block text-base font-medium text-slate-700">
          Change summary <span className="text-red-600">*</span>
        </label>
        <p className="mt-0.5 text-sm text-slate-500">Describe what changed in this version.</p>
        <textarea
          id="new-version-summary"
          value={changeSummary}
          onChange={(e) => setChangeSummary(e.target.value)}
          placeholder="e.g. Updated section 3.2, added annex B"
          className="input-base mt-1 w-full min-h-[100px]"
          required
          maxLength={2000}
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="new-version-file" className="block text-base font-medium text-slate-700">
          New file <span className="text-red-600">*</span>
        </label>
        <p className="mt-0.5 text-sm text-slate-500">
          Maximum file size: {MAX_FILE_SIZE_MB} MB. Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX.
        </p>
        <input
          id="new-version-file"
          type="file"
          accept={ACCEPT}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="input-base mt-1 w-full max-w-md"
          required
        />
        {file && (
          <p className="mt-1 text-sm text-slate-500">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Uploading…' : 'Upload new version'}
        </button>
        <Link href={`/documents/${documentId}`} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
