'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  bulkImportValidate,
  bulkImportConfirm,
  type BulkImportValidationResult,
  type BulkImportValidRow,
} from '@/lib/api';

type Props = { accessToken: string };

export function BulkImportClient({ accessToken }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkImportValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<number | null>(null);

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !accessToken) return;
    setError(null);
    setResult(null);
    setValidating(true);
    try {
      const res = await bulkImportValidate(accessToken, file);
      setResult(res ?? { valid: [], invalid: [] });
    } catch {
      setError('Validation failed');
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    if (!result || result.valid.length === 0 || !accessToken) return;
    setError(null);
    setImporting(true);
    try {
      const res = await bulkImportConfirm(accessToken, result.valid as BulkImportValidRow[]);
      if (res) {
        setCreated(res.created);
        router.refresh();
      } else {
        setError('Import failed');
      }
    } catch {
      setError('Import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body space-y-6">
        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label htmlFor="csv-file" className="block text-sm font-medium text-slate-700">CSV file</label>
            <input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setCreated(null); }}
              className="mt-1 block w-full max-w-md text-sm text-slate-600 file:mr-4 file:rounded file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
          <button type="submit" disabled={!file || validating} className="btn-primary disabled:opacity-50">
            {validating ? 'Validating…' : 'Validate CSV'}
          </button>
        </form>

        {error && <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{error}</p>}
        {created !== null && (
          <p className="rounded bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {created} user(s) created successfully.
          </p>
        )}

        {result && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">Validation result</h2>
            {result.valid.length > 0 && (
              <div>
                <p className="text-sm text-slate-600">{result.valid.length} valid row(s)</p>
                <div className="mt-2 max-h-48 overflow-auto rounded border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-3 py-2 text-left font-medium text-slate-700">Email</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-700">Full name</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-700">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.valid.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="px-3 py-2">{r.email}</td>
                          <td className="px-3 py-2">{r.fullName}</td>
                          <td className="px-3 py-2">{r.systemRole ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="mt-3 btn-primary disabled:opacity-50"
                >
                  {importing ? 'Importing…' : `Import ${result.valid.length} user(s)`}
                </button>
              </div>
            )}
            {result.invalid.length > 0 && (
              <div>
                <p className="text-sm text-amber-700">{result.invalid.length} invalid row(s)</p>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                  {result.invalid.map((r, i) => (
                    <li key={i}>Row {r.row}: {r.message}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.valid.length === 0 && result.invalid.length === 0 && (
              <p className="text-sm text-slate-500">No data rows in file. Add a header row (email, fullName, …) or data rows.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
