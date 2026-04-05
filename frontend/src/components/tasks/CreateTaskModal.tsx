'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/i18n/client';
import { RoleGuard } from '@/components/rbac/RoleGuard';
import { getApiUrl } from '@/lib/api';

export type AgendaTaskParticipant = {
  userId: string;
  fullName: string;
  role: string;
};

type Props = {
  meetingId: string;
  agendaItemId: string;
  participants: AgendaTaskParticipant[];
  documents: { id: string; fileName: string }[];
  onClose: () => void;
};

export function CreateTaskModal({ meetingId, agendaItemId, participants, documents, onClose }: Props) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const accessToken = (session as { accessToken?: string } | null)?.accessToken;
    if (!accessToken) {
      setError(t('common.error'));
      setSubmitting(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const assignedRaw = form.getAll('assignedTo') as string[];
    const assignedTo = assignedRaw.filter(Boolean);
    const docVal = form.get('documentId');
    const documentId = docVal && String(docVal).trim() !== '' ? String(docVal) : null;

    const dueRaw = form.get('dueDate');
    const dueDate = dueRaw ? String(dueRaw) : '';

    const body = {
      meetingId,
      agendaItemId,
      documentId,
      title: String(form.get('title') ?? '').trim(),
      description: String(form.get('description') ?? '') || null,
      assignedTo,
      dueDate,
      priority: String(form.get('priority') ?? 'MEDIUM'),
    };

    if (!body.title || assignedTo.length === 0 || !dueDate) {
      setError(t('common.error'));
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${getApiUrl()}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let msg = t('common.error');
        try {
          const err = await res.json();
          if (err?.message) msg = String(err.message);
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      router.refresh();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const assignable = participants.filter((p) => ['MEMBER', 'COORDINATOR'].includes(p.role));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('task.create.title')}
        className="card max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body">
          <h2 className="text-lg font-semibold text-slate-900">{t('task.create.title')}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-slate-700">
                {t('task.create.titleLabel')}
              </label>
              <input
                id="task-title"
                name="title"
                required
                maxLength={500}
                className="input-base w-full"
              />
            </div>
            <div>
              <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-slate-700">
                {t('task.create.description')}
              </label>
              <textarea id="task-description" name="description" rows={3} className="input-base w-full" />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700">{t('task.create.assignTo')}</legend>
              {assignable.length === 0 ? (
                <p className="text-sm text-slate-500">{t('common.noData')}</p>
              ) : (
                assignable.map((p) => (
                  <label key={p.userId} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="assignedTo" value={p.userId} />
                    <span>
                      {p.fullName} ({p.role})
                    </span>
                  </label>
                ))
              )}
            </fieldset>
            <div>
              <label htmlFor="task-due" className="mb-1 block text-sm font-medium text-slate-700">
                {t('task.create.dueDate')}
              </label>
              <input
                id="task-due"
                name="dueDate"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="input-base w-full"
              />
            </div>
            <div>
              <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-slate-700">
                {t('task.create.priority')}
              </label>
              <select id="task-priority" name="priority" defaultValue="MEDIUM" className="input-base w-full">
                <option value="HIGH">{t('task.priority.HIGH')}</option>
                <option value="MEDIUM">{t('task.priority.MEDIUM')}</option>
                <option value="LOW">{t('task.priority.LOW')}</option>
              </select>
            </div>
            {documents.length > 0 && (
              <div>
                <label htmlFor="task-doc" className="mb-1 block text-sm font-medium text-slate-700">
                  {t('task.create.linkDocument')}
                </label>
                <select id="task-doc" name="documentId" className="input-base w-full">
                  <option value="">{t('task.create.noDocument')}</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fileName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} disabled={submitting} className="btn-secondary">
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={submitting || assignable.length === 0} className="btn-primary">
                {submitting ? t('common.saving') : t('task.create.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function CreateTaskButton(props: Omit<Props, 'onClose'>) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');
  return (
    <>
      <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'DELEGATION_LEADER', 'COORDINATOR']}>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary text-sm">
          {t('task.create.title')}
        </button>
      </RoleGuard>
      {open && <CreateTaskModal {...props} onClose={() => setOpen(false)} />}
    </>
  );
}
