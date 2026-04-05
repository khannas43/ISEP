import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ApprovalActions } from '@/components/papers/ApprovalActions';
import { ApprovalChainStatus } from '@/components/papers/ApprovalChainStatus';
import { getPaperApproval, getPaperStatus, type PaperApprovalDto, type PaperStatusDto } from '@/lib/api';

type Props = { params: Promise<{ id: string }> };

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

/**
 * SCR-PAPER-03 — Approval workflow view. Timeline of stages; Approve / Reject / Request clarification.
 * Loads from GET /papers/{id}/status when available, else /approval.
 */
export default async function PaperApprovalPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;

  let status: PaperStatusDto | null = null;
  if (accessToken) {
    try {
      status = await getPaperStatus(accessToken, id);
    } catch {
      status = null;
    }
  }

  let approval: PaperApprovalDto | null = null;
  if (status) {
    approval = {
      paperId: id,
      paperTitle: status.paperTitle ?? '—',
      currentStage: status.currentStage,
      stages: status.stages,
    };
  } else if (accessToken) {
    try {
      approval = await getPaperApproval(accessToken, id);
    } catch {
      approval = null;
    }
  }

  if (!approval) notFound();

  const hasPending = approval.stages.some((s) => s.status === 'PENDING');

  return (
    <div>
      <div className="mb-6">
        <Link href="/papers" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Papers list</Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Approval workflow</h1>
          <p className="page-subtitle">{approval.paperTitle}</p>
          {status && (
            <p className="mt-2 text-xs text-slate-500">
              {status.submittedAt && (
                <>
                  Submitted {formatDate(status.submittedAt)}
                  {' · '}
                </>
              )}
              {status.lastActionAt && (
                <>
                  Last action {formatDate(status.lastActionAt)}
                  {status.lastActionBy ? ` by ${status.lastActionBy}` : ''}
                </>
              )}
            </p>
          )}

          <div className="mt-6">
            <ApprovalChainStatus
              stages={approval.stages}
              currentStage={approval.currentStage}
              mopswStepActive={status?.mopswStepActive ?? false}
            />
          </div>

          <div className="mt-8 space-y-4">
            {approval.stages.map((stage, i) => (
              <div
                key={stage.stageId}
                className={`flex items-start gap-4 rounded-lg border p-4 ${
                  stage.status === 'PENDING' ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200'
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-700">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{stage.stageName}</p>
                  <p className="text-sm text-slate-600">Approver: {stage.approverName ?? '—'}</p>
                  <p className="text-xs text-slate-500">
                    {stage.status === 'APPROVED' && `Approved ${formatDate(stage.actedAt)}`}
                    {stage.status === 'REJECTED' && `Rejected ${formatDate(stage.actedAt)}`}
                    {stage.status === 'PENDING' && 'Pending'}
                  </p>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                  stage.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                  stage.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {stage.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <ApprovalActions paperId={id} hasPending={hasPending} />
            <div className="flex flex-wrap gap-3">
              <Link href={`/papers/${id}/reject`} className="btn-secondary">Reject / return</Link>
              <Link href={`/papers/${id}/view`} className="btn-secondary">View finalized</Link>
              <Link href="/papers" className="btn-secondary">Back to papers</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
