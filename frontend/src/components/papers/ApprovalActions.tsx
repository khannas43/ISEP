'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/i18n/client';
import { approvePaper, rejectPaper } from '@/lib/api';
import { RoleGuard } from '@/components/rbac/RoleGuard';

type Props = {
  paperId: string;
  hasPending: boolean;
};

export function ApprovalActions({ paperId, hasPending }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const [acting, setActing] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const handleApprove = async () => {
    if (!accessToken || !hasPending) return;
    setError(null);
    setActing(true);
    try {
      const result = await approvePaper(accessToken, paperId);
      if (result) router.refresh();
      else setError('Failed to approve. You may not be the current approver.');
    } catch {
      setError('Request failed.');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!accessToken || !hasPending || !rejectComment.trim()) return;
    setError(null);
    setActing(true);
    try {
      const result = await rejectPaper(accessToken, paperId, rejectComment.trim());
      if (result) {
        setShowRejectInput(false);
        setRejectComment('');
        router.refresh();
      } else {
        setError('Failed to reject.');
      }
    } catch {
      setError('Request failed.');
    } finally {
      setActing(false);
    }
  };

  if (!hasPending) {
    return (
      <span className="text-base text-slate-500">No pending stage — approval actions are hidden.</span>
    );
  }

  return (
    <RoleGuard
      allowedRoles={[
        'SYSTEM_ADMIN',
        'IC_DIVISION_HEAD',
        'DELEGATION_LEADER',
        'COORDINATOR',
      ]}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={acting || !accessToken}
            className="btn-primary"
          >
            {acting ? '…' : t('approval.approve')}
          </button>
          <button
            type="button"
            onClick={() => setShowRejectInput((v) => !v)}
            disabled={acting}
            className="btn-secondary border-red-200 text-red-800 hover:bg-red-50"
          >
            {t('approval.reject')}
          </button>
          {error && <span className="text-base text-red-600">{error}</span>}
        </div>
        {showRejectInput && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder={t('approval.rejectReason')}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="min-w-[200px] flex-1 rounded border border-slate-300 px-3 py-1.5 text-base"
            />
            <button
              type="button"
              onClick={handleReject}
              disabled={acting || !rejectComment.trim()}
              className="rounded bg-red-600 px-3 py-1.5 text-base text-white hover:bg-red-700 disabled:opacity-50"
            >
              {t('approval.confirmReject')}
            </button>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
