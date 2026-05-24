import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getPapers, type PaperListItem } from '@/lib/api';
import { ApiUnavailableBanner } from '@/components/ApiUnavailableBanner';
import { PaperStatusBadge } from '@/components/papers/PaperStatusBadge';
import { getAppBasePath } from '@/lib/appBasePath';

type Props = { searchParams: Promise<{ status?: string; meetingId?: string }> };

/** Table row: PaperListItem plus optional display fields (allow null for API compatibility). */
type PaperRow = PaperListItem & { meetingTitle?: string | null; currentStage?: string | null };

/**
 * SCR-PAPER-01 — Papers list. GET /papers with mock fallback. Filter by meeting, status.
 */
export default async function PapersPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const params = await searchParams;
  const accessToken = (session as { accessToken?: string }).accessToken;
  const basePath = getAppBasePath();
  let papers: PaperRow[] = [];
  let apiUnavailable = false;
  if (accessToken) {
    try {
      papers = await getPapers(accessToken);
    } catch {
      apiUnavailable = true;
    }
  }
  if (params.status) {
    papers = papers.filter((p) => p.status.toLowerCase() === params.status!.toLowerCase());
  }
  if (params.meetingId) {
    papers = papers.filter((p) => p.meetingId === params.meetingId);
  }
  papers = papers.sort((a, b) => (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? ''));

  return (
    <div>
      {apiUnavailable && <ApiUnavailableBanner />}
      <div className="page-header">
        <h1 className="page-title">Papers</h1>
        <p className="page-subtitle">
          India&apos;s formal submissions, working documents, and intervention statements. Track approval workflow.
        </p>
      </div>
      <div className="card mb-6">
        <div className="card-body">
          <form method="get" action={`${basePath}/papers`} className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-base font-medium text-slate-600">Status</span>
              <select name="status" defaultValue={params.status ?? ''} className="input-base min-w-[160px]">
                <option value="">All</option>
                <option value="DRAFT">Draft</option>
                <option value="IN_APPROVAL">In approval</option>
                <option value="FINALIZED">Finalized</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </label>
            <button type="submit" className="btn-secondary">Filter</button>
          </form>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-base">
            <thead>
              <tr>
                <th className="table-header px-4 py-2.5 text-left">Title</th>
                <th className="table-header px-4 py-2.5 text-left">Meeting</th>
                <th className="table-header px-4 py-2.5 text-left">Status</th>
                <th className="table-header px-4 py-2.5 text-left">Current stage</th>
                <th className="table-header px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {papers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {params.status || params.meetingId ? 'No papers match the filter.' : 'No papers found.'}
                  </td>
                </tr>
              ) : (
                papers.map((p) => (
                  <tr key={p.paperId}>
                    <td className="table-cell px-4 py-2.5 font-medium text-slate-900">{p.title}</td>
                    <td className="table-cell px-4 py-2.5 text-slate-600">{(p as PaperRow).meetingTitle ?? p.meetingId ?? '—'}</td>
                    <td className="table-cell px-4 py-2.5">
                      <PaperStatusBadge status={p.status} />
                    </td>
                    <td className="table-cell px-4 py-2.5 text-slate-600">{(p as PaperRow).currentStage ?? '—'}</td>
                    <td className="table-cell px-4 py-2.5 text-right">
                      <Link href={`/papers/${p.paperId}/draft`} className="text-blue-600 hover:underline mr-3">Draft</Link>
                      <Link href={`/papers/${p.paperId}/approval`} className="text-blue-600 hover:underline mr-3">Approval</Link>
                      <Link href={`/papers/${p.paperId}/view`} className="text-blue-600 hover:underline mr-3">View</Link>
                      <Link href={`/papers/${p.paperId}/reject`} className="text-blue-600 hover:underline">Reject</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
