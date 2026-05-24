import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type DocumentDto } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { formatDisplayDate } from '@/lib/format';
import { getAppBasePath } from '@/lib/appBasePath';

async function getDocuments(accessToken: string, opts?: { meetingId?: string; q?: string }): Promise<{ content: DocumentDto[]; totalElements: number }> {
  const params = new URLSearchParams();
  if (opts?.q?.trim()) params.set('q', opts.q.trim());
  if (opts?.meetingId) params.set('meetingId', opts.meetingId);
  params.set('size', '50');
  const res = await fetch(`${getApiUrl()}/api/v1/documents?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return { content: [], totalElements: 0 };
  const data = await res.json();
  const content = data.content ?? [];
  return { content: Array.isArray(content) ? content : [], totalElements: data.totalElements ?? content.length };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function DocumentsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const params = await searchParams;
  const q = params.q ?? '';
  const accessToken = (session as { accessToken?: string }).accessToken;
  const basePath = getAppBasePath();
  let documents: DocumentDto[] = [];
  let totalElements = 0;
  let apiUnavailable = false;
  if (accessToken) {
    try {
      const res = await getDocuments(accessToken, { q: q || undefined });
      documents = res.content;
      totalElements = res.totalElements;
    } catch {
      apiUnavailable = true;
    }
  }
  return (
    <div>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header">
        <h1 className="page-title">Document Library</h1>
        <p className="page-subtitle">
          Platform-wide document repository. Filter by meeting from the meeting detail Documents tab.
        </p>
      </div>
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-700">Search</h2>
        </div>
        <div className="card-body">
          <form method="get" action={`${basePath}/documents`} className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-600">Title or file name</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search documents…"
                className="input-base min-w-[240px]"
              />
            </label>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        </div>
      </div>
      {documents.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p className="text-slate-500">{q ? 'No documents match your search.' : 'No documents yet. Upload documents from a meeting\u2019s Documents tab.'}</p>
            <Link href="/meetings" className="mt-4 inline-block text-base font-medium text-blue-600 hover:underline">
              Go to Meetings →
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <p className="text-base text-slate-600 mb-4">{totalElements} document(s)</p>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-base">
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
                      </td>
                      <td className="table-cell text-right">
                        <Link href={`/documents/${d.documentId}`} className="text-blue-600 hover:underline">View</Link>
                        {d.meetingId && (
                          <>
                            {' · '}
                            <Link href={`/meetings/${d.meetingId}?tab=documents`} className="text-blue-600 hover:underline">Meeting</Link>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
