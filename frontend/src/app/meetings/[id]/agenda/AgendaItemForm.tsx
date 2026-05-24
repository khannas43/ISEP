'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/i18n/client';
import { createAgendaItem, updateAgendaItem, type CreateAgendaItemPayload, type UpdateAgendaItemPayload } from '../../actions';
import { getApiUrl, type ReferenceItem, type UserDto } from '@/lib/api';

const MAX_ATTACHMENT_BYTES = 100 * 1024 * 1024;

async function uploadAgendaItemDocument(
  meetingId: string,
  agendaItemId: string,
  file: File,
  accessToken: string
): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${getApiUrl().replace(/\/$/, '')}/api/v1/meetings/${meetingId}/agenda/${agendaItemId}/documents/upload`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const errBody = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    const msg = errBody.message ?? errBody.error ?? `Upload failed (${response.status})`;
    throw new Error(msg);
  }
}

type Props = {
  meetingId: string;
  mode: 'create' | 'edit';
  agendaItemId?: string;
  initial?: {
    itemNumber: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    deadlineForInputs: string;
    assignedCoordinatorId: string;
  };
  categoryOptions: ReferenceItem[];
  priorityOptions: ReferenceItem[];
  statusOptions: ReferenceItem[];
  coordinatorOptions?: UserDto[];
};

export function AgendaItemForm({
  meetingId,
  mode,
  agendaItemId,
  initial,
  categoryOptions,
  priorityOptions,
  statusOptions,
  coordinatorOptions = [],
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [itemNumber, setItemNumber] = useState(initial?.itemNumber ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [priority, setPriority] = useState(initial?.priority ?? 'MEDIUM');
  const [status, setStatus] = useState(initial?.status ?? 'DRAFT');
  const [deadlineForInputs, setDeadlineForInputs] = useState(initial?.deadlineForInputs ?? '');
  const [assignedCoordinatorId, setAssignedCoordinatorId] = useState(initial?.assignedCoordinatorId ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function appendAttachments(files: File[]) {
    const ok: File[] = [];
    const tooBig: File[] = [];
    for (const f of files) {
      if (f.size > MAX_ATTACHMENT_BYTES) tooBig.push(f);
      else ok.push(f);
    }
    if (tooBig.length > 0) {
      setError(
        t('document.upload.fileTooLarge', { max: '100MB' }) +
          (tooBig.length > 1 ? ` (${tooBig.length} files)` : `: ${tooBig[0].name}`)
      );
    } else {
      setError(null);
    }
    if (ok.length > 0) setAttachments((prev) => [...prev, ...ok]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    if (mode === 'create') {
      const payload: CreateAgendaItemPayload = {
        itemNumber: itemNumber.trim() || null,
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        priority: priority || null,
        status: status || null,
        deadlineForInputs: deadlineForInputs.trim() || null,
        assignedCoordinatorId: assignedCoordinatorId || null,
      };
      const result = await createAgendaItem(meetingId, payload);
      if (result.error) {
        setLoading(false);
        setError(result.error);
        return;
      }
      const newAgendaItemId = result.agendaItemId;
      if (!newAgendaItemId) {
        setLoading(false);
        setError('Agenda item was created but no ID was returned; add attachments from the agenda item page.');
        router.push(`/meetings/${meetingId}/?tab=agenda`);
        router.refresh();
        return;
      }

      if (attachments.length === 0) {
        setLoading(false);
        router.push(`/meetings/${meetingId}/?tab=agenda`);
        router.refresh();
        return;
      }

      const accessToken = (session as { accessToken?: string } | null)?.accessToken;
      if (!accessToken) {
        setLoading(false);
        setError('Your session has no access token. Agenda item was saved; add attachments from the agenda item page.');
        router.push(`/meetings/${meetingId}/agenda/${newAgendaItemId}/`);
        router.refresh();
        return;
      }

      try {
        for (let i = 0; i < attachments.length; i++) {
          setUploadProgress({ current: i + 1, total: attachments.length });
          await uploadAgendaItemDocument(meetingId, newAgendaItemId, attachments[i], accessToken);
        }
      } catch (err) {
        setLoading(false);
        setUploadProgress(null);
        const msg = err instanceof Error ? err.message : t('common.error');
        setError(
          `Agenda item was created, but an attachment failed to upload: ${msg}. You can upload remaining files from the agenda item.`
        );
        router.push(`/meetings/${meetingId}/agenda/${newAgendaItemId}/`);
        router.refresh();
        return;
      }

      setLoading(false);
      setUploadProgress(null);
      router.push(`/meetings/${meetingId}/?tab=agenda`);
      router.refresh();
      return;
    }
    if (mode === 'edit' && agendaItemId) {
      const payload: UpdateAgendaItemPayload = {
        itemNumber: itemNumber.trim() || null,
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        priority: priority || null,
        status: status || null,
        deadlineForInputs: deadlineForInputs.trim() || null,
        assignedCoordinatorId: assignedCoordinatorId || null,
      };
      const result = await updateAgendaItem(meetingId, agendaItemId, payload);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/meetings/${meetingId}?tab=agenda`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-base text-red-700">
          {error}
        </div>
      )}
      <div>
        <label className="block text-base font-medium text-slate-700">Item number</label>
        <input
          type="text"
          value={itemNumber}
          onChange={(e) => setItemNumber(e.target.value)}
          placeholder="e.g. 1.2"
          className="input-base mt-1 max-w-xs"
          maxLength={50}
        />
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Title <span className="text-red-600">*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Agenda item title"
          className="input-base mt-1 w-full"
          required
          maxLength={1000}
        />
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="input-base mt-1 w-full min-h-[100px]"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-base font-medium text-slate-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-base mt-1 w-full"
          >
            <option value="">—</option>
            {categoryOptions.map((o) => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-base font-medium text-slate-700">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input-base mt-1 w-full"
          >
            {priorityOptions.map((o) => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-base font-medium text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-base mt-1 w-full"
          >
            {statusOptions.map((o) => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-base font-medium text-slate-700">Deadline for inputs</label>
          <input
            type="datetime-local"
            value={deadlineForInputs}
            onChange={(e) => setDeadlineForInputs(e.target.value)}
            className="input-base mt-1 w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Assigned coordinator</label>
        <select
          value={assignedCoordinatorId}
          onChange={(e) => setAssignedCoordinatorId(e.target.value)}
          className="input-base mt-1 w-full max-w-md"
        >
          <option value="">—</option>
          {coordinatorOptions.map((u) => (
            <option key={u.userId} value={u.userId}>{u.fullName} {u.email ? `(${u.email})` : ''}</option>
          ))}
        </select>
        {coordinatorOptions.length === 0 && (
          <p className="mt-1 text-sm text-slate-500">
            No users in the list. Load users by running the database seeds (see RUN-APPLICATION.md), then ensure the backend (meeting-service) is running. Users come from <strong>core.users</strong>; the same list appears under <strong>Admin → User list</strong>.
          </p>
        )}
      </div>

      {mode === 'create' && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <label className="mb-2 block text-base font-semibold text-[var(--navy-800)]">
            {t('agendaItem.attachmentsOptional')}
          </label>
          <p className="mb-3 text-sm text-[var(--slate-500)]">{t('agendaItem.attachmentsHint')}</p>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              appendAttachments(Array.from(e.dataTransfer.files));
            }}
            className="cursor-pointer rounded-lg border-2 border-dashed px-8 py-8 text-center transition-all duration-200"
            style={{
              borderColor: dragging ? 'var(--navy-500)' : 'var(--slate-300)',
              background: dragging ? 'var(--navy-50)' : 'var(--slate-50)',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                appendAttachments(files);
                e.target.value = '';
              }}
            />
            <p className="m-0 text-[0.95rem] text-[var(--slate-500)]">
              {t('agendaItem.dropFilesHere')}{' '}
              <span className="font-semibold text-[var(--navy-600)]">{t('agendaItem.browse')}</span>
            </p>
            <p className="mt-1.5 m-0 text-[0.8rem] text-slate-400">{t('agendaItem.maxFileSize')}</p>
          </div>

          {attachments.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {attachments.map((file, idx) => (
                <div
                  key={`${file.name}-${file.size}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl" aria-hidden>
                      📄
                    </span>
                    <div>
                      <p className="m-0 text-[0.9rem] font-medium text-slate-800">{file.name}</p>
                      <p className="m-0 text-[0.8rem] text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setAttachments((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="border-0 bg-transparent p-1 text-[1.1rem] text-[var(--danger)] hover:opacity-80"
                    aria-label={t('common.delete')}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        {uploadProgress && (
          <p className="w-full text-base text-slate-600" role="status">
            {t('agendaItem.uploadingAttachments', {
              current: uploadProgress.current,
              total: uploadProgress.total,
            })}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? uploadProgress
              ? t('agendaItem.uploadingAttachments', {
                  current: uploadProgress.current,
                  total: uploadProgress.total,
                })
              : 'Saving…'
            : mode === 'create'
              ? 'Create agenda item'
              : 'Save changes'}
        </button>
        <Link
          href={`/meetings/${meetingId}?tab=agenda`}
          className="btn-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
