'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { createAgendaItem, updateAgendaItem, type CreateAgendaItemPayload, type UpdateAgendaItemPayload } from '../../actions';
import type { ReferenceItem } from '@/lib/api';
import type { UserDto } from '@/lib/api';

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
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/meetings/${meetingId}?tab=agenda`);
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
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700">Item number</label>
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
        <label className="block text-sm font-medium text-slate-700">Title <span className="text-red-600">*</span></label>
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
        <label className="block text-sm font-medium text-slate-700">Description</label>
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
          <label className="block text-sm font-medium text-slate-700">Category</label>
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
          <label className="block text-sm font-medium text-slate-700">Priority</label>
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
          <label className="block text-sm font-medium text-slate-700">Status</label>
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
          <label className="block text-sm font-medium text-slate-700">Deadline for inputs</label>
          <input
            type="datetime-local"
            value={deadlineForInputs}
            onChange={(e) => setDeadlineForInputs(e.target.value)}
            className="input-base mt-1 w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Assigned coordinator</label>
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
          <p className="mt-1 text-xs text-slate-500">
            No users in the list. Load users by running the database seeds (see RUN-APPLICATION.md), then ensure the backend (meeting-service) is running. Users come from <strong>core.users</strong>; the same list appears under <strong>Admin → User list</strong>.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : mode === 'create' ? 'Create agenda item' : 'Save changes'}
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
