'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { BodyDto, ReferenceItem } from '@/lib/api';
import { createBody } from './actions';

type BodyFormProps = {
  bodies: BodyDto[];
  bodyTypeOptions: ReferenceItem[];
  initial?: Partial<BodyDto>;
  bodyId?: string;
  updateAction?: (id: string, formData: FormData) => Promise<{ error?: string }>;
};

export function BodyForm({
  bodies,
  bodyTypeOptions,
  initial,
  bodyId,
  updateAction,
}: BodyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(bodyId && updateAction);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (isEdit && bodyId && updateAction) {
      const result = await updateAction(bodyId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/bodies/${bodyId}`);
      router.refresh();
      return;
    }
    const result = await createBody(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.id) {
      router.push(`/bodies/${result.id}`);
      router.refresh();
    }
  }

  const isBackendUnavailable = error?.includes('Backend API is unavailable') ?? false;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && (
        <div
          className={
            isBackendUnavailable
              ? 'rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'
              : 'rounded bg-red-50 text-red-700 px-4 py-2 text-sm'
          }
          role="alert"
        >
          <p className="font-medium">{isBackendUnavailable ? 'Cannot save — backend not running' : 'Error'}</p>
          <p className="mt-1">{error}</p>
          {isBackendUnavailable && (
            <p className="mt-2 text-amber-700">
              Your changes are still in the form. Start the backend (e.g. meeting-service), then click Update again.
            </p>
          )}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initial?.name}
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="abbreviation" className="block text-sm font-medium text-slate-700 mb-1">
          Abbreviation
        </label>
        <input
          id="abbreviation"
          name="abbreviation"
          type="text"
          defaultValue={initial?.abbreviation ?? ''}
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="bodyType" className="block text-sm font-medium text-slate-700 mb-1">
          Body type *
        </label>
        <select
          id="bodyType"
          name="bodyType"
          required
          defaultValue={initial?.bodyType ?? bodyTypeOptions[0]?.code ?? 'OTHER'}
          className="input-base"
        >
          {bodyTypeOptions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="parentBodyId" className="block text-sm font-medium text-slate-700 mb-1">
          Parent body
        </label>
        <select
          id="parentBodyId"
          name="parentBodyId"
          defaultValue={initial?.parentBodyId ?? ''}
          className="input-base"
        >
          <option value="">— None —</option>
          {bodies
            .filter((b) => !bodyId || b.bodyId !== bodyId)
            .map((b) => (
              <option key={b.bodyId} value={b.bodyId}>
                {b.name} {b.abbreviation ? `(${b.abbreviation})` : ''}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ''}
          className="input-base"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          defaultChecked={initial?.isActive ?? true}
          className="rounded border-slate-300"
        />
        <label htmlFor="isActive" className="text-sm text-slate-700">
          Active
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          {isEdit ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
