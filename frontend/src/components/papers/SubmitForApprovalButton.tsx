'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/i18n/client';
import { RoleGuard } from '@/components/rbac/RoleGuard';
import { submitPaperForApproval } from '@/lib/api';

interface Props {
  paperId: string;
  currentStatus: string;
  onSubmitted: () => void;
}

export function SubmitForApprovalButton({ paperId, currentStatus, onSubmitted }: Props) {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  if (currentStatus !== 'DRAFT') return null;

  const submit = async () => {
    if (!accessToken) return;
    setSubmitting(true);
    try {
      const ok = await submitPaperForApproval(accessToken, paperId);
      if (ok) onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER']}>
      <button
        type="button"
        onClick={() => void submit()}
        disabled={submitting || !accessToken}
        className="btn-primary text-sm"
      >
        {submitting ? t('common.saving') : t('paper.submitForApproval')}
      </button>
    </RoleGuard>
  );
}
