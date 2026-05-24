'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { createCorrespondenceGroup, updateCorrespondenceGroup, type CreateCorrespondenceGroupPayload, type UpdateCorrespondenceGroupPayload } from './actions';
import type { BodyDto } from '@/lib/api';

type UserOption = { userId: string; fullName: string; email: string };

type Props = {
  mode: 'create' | 'edit';
  cgId?: string;
  initial?: {
    parentBodyId: string;
    name: string;
    mandate: string;
    indiaLeadId: string;
    startDate: string;
    endDate: string;
    status: string;
    imsoReference: string;
  };
  bodies: BodyDto[];
  users: UserOption[];
};

export function CGForm({ mode, cgId, initial, bodies, users }: Props) {
  const router = useRouter();
  const [parentBodyId, setParentBodyId] = useState(initial?.parentBodyId ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [mandate, setMandate] = useState(initial?.mandate ?? '');
  const [indiaLeadId, setIndiaLeadId] = useState(initial?.indiaLeadId ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'ACTIVE');
  const [imsoReference, setImsoReference] = useState(initial?.imsoReference ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!parentBodyId) {
      setError('Parent body is required.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start and end dates are required.');
      return;
    }
    setLoading(true);
    if (mode === 'create') {
      const payload: CreateCorrespondenceGroupPayload = {
        parentBodyId,
        name: name.trim(),
        mandate: mandate.trim() || null,
        indiaLeadId: indiaLeadId || null,
        startDate,
        endDate,
        status,
        imsoReference: imsoReference.trim() || null,
      };
      const result = await createCorrespondenceGroup(payload);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(result.cgId ? `/correspondence-groups/${result.cgId}` : '/correspondence-groups');
      router.refresh();
      return;
    }
    if (mode === 'edit' && cgId) {
      const payload: UpdateCorrespondenceGroupPayload = {
        parentBodyId,
        name: name.trim(),
        mandate: mandate.trim() || null,
        indiaLeadId: indiaLeadId || null,
        startDate,
        endDate,
        status,
        imsoReference: imsoReference.trim() || null,
      };
      const result = await updateCorrespondenceGroup(cgId, payload);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/correspondence-groups/${cgId}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-base text-red-700">{error}</div>
      )}
      <div>
        <label className="block text-base font-medium text-slate-700">Parent body <span className="text-red-600">*</span></label>
        <select
          value={parentBodyId}
          onChange={(e) => setParentBodyId(e.target.value)}
          className="input-base mt-1 w-full max-w-md"
          required
        >
          <option value="">Select body…</option>
          {bodies.filter((b) => b.isActive).map((b) => (
            <option key={b.bodyId} value={b.bodyId}>{b.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Name <span className="text-red-600">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-base mt-1 w-full max-w-md"
          required
          maxLength={500}
        />
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Mandate / terms of reference</label>
        <textarea
          value={mandate}
          onChange={(e) => setMandate(e.target.value)}
          className="input-base mt-1 w-full max-w-md min-h-[100px]"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">India lead</label>
        <select
          value={indiaLeadId}
          onChange={(e) => setIndiaLeadId(e.target.value)}
          className="input-base mt-1 w-full max-w-md"
        >
          <option value="">—</option>
          {users.map((u) => (
            <option key={u.userId} value={u.userId}>{u.fullName} {u.email ? `(${u.email})` : ''}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-base font-medium text-slate-700">Start date <span className="text-red-600">*</span></label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-base mt-1 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-base font-medium text-slate-700">End date <span className="text-red-600">*</span></label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-base mt-1 w-full"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-base font-medium text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-base mt-1 w-full max-w-xs"
          >
            <option value="ACTIVE">Active</option>
            <option value="CONCLUDED">Concluded</option>
          </select>
        </div>
        <div>
          <label className="block text-base font-medium text-slate-700">IMO reference</label>
          <input
            type="text"
            value={imsoReference}
            onChange={(e) => setImsoReference(e.target.value)}
            className="input-base mt-1 w-full max-w-md"
            maxLength={255}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
        </button>
        <Link href={cgId ? `/correspondence-groups/${cgId}` : '/correspondence-groups'} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
