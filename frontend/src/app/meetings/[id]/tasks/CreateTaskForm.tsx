'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { createTask, type CreateTaskPayload } from '../../actions';
import type { UserDto } from '@/lib/api';

type Props = {
  meetingId: string;
  userList: UserDto[];
  priorityOptions: { code: string; label: string }[];
  statusOptions: { code: string; label: string }[];
};

export function CreateTaskForm({ meetingId, userList, priorityOptions, statusOptions }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('CREATED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!assignedToId) {
      setError('Please assign the task to a user.');
      return;
    }
    setLoading(true);
    const payload: CreateTaskPayload = {
      title: title.trim(),
      description: description.trim() || null,
      assignedToId,
      priority: priority || null,
      dueDate: dueDate.trim() || null,
      status: status || null,
    };
    const result = await createTask(meetingId, payload);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/meetings/${meetingId}?tab=tasks`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-base text-red-700">
          {error}
        </div>
      )}
      <div>
        <label className="block text-base font-medium text-slate-700">Title <span className="text-red-600">*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="input-base mt-1 w-full"
          required
          maxLength={500}
        />
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="input-base mt-1 w-full min-h-[80px]"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Assigned to <span className="text-red-600">*</span></label>
        <select
          value={assignedToId}
          onChange={(e) => setAssignedToId(e.target.value)}
          className="input-base mt-1 w-full max-w-md"
          required
        >
          <option value="">Select user…</option>
          {userList.map((u) => (
            <option key={u.userId} value={u.userId}>
              {u.fullName} {u.email ? `(${u.email})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div>
          <label className="block text-base font-medium text-slate-700">Due date</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input-base mt-1 w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-base font-medium text-slate-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-base mt-1 w-full max-w-xs"
        >
          {statusOptions.map((o) => (
            <option key={o.code} value={o.code}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating…' : 'Create task'}
        </button>
        <Link href={`/meetings/${meetingId}?tab=tasks`} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
