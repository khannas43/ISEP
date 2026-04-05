'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateTask, type UpdateTaskPayload } from '../../actions';
import type { UserDto } from '@/lib/api';

type Props = {
  meetingId: string;
  taskId: string;
  initial: {
    title: string;
    description: string;
    assignedToId: string;
    priority: string;
    dueDate: string;
    status: string;
  };
  userList: UserDto[];
  priorityOptions: { code: string; label: string }[];
  statusOptions: { code: string; label: string }[];
};

export function TaskDetailClient({
  meetingId,
  taskId,
  initial,
  userList,
  priorityOptions,
  statusOptions,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [assignedToId, setAssignedToId] = useState(initial.assignedToId);
  const [priority, setPriority] = useState(initial.priority);
  const [dueDate, setDueDate] = useState(initial.dueDate);
  const [status, setStatus] = useState(initial.status);
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
    const payload: UpdateTaskPayload = {
      title: title.trim(),
      description: description.trim() || null,
      assignedToId: assignedToId || null,
      priority: priority || null,
      dueDate: dueDate.trim() || null,
      status: status || null,
    };
    const result = await updateTask(meetingId, taskId, payload);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-base mt-1 w-full max-w-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-base mt-1 w-full max-w-md min-h-[60px]"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Assigned to</label>
        <select
          value={assignedToId}
          onChange={(e) => setAssignedToId(e.target.value)}
          className="input-base mt-1 w-full max-w-md"
        >
          <option value="">—</option>
          {userList.map((u) => (
            <option key={u.userId} value={u.userId}>
              {u.fullName} {u.email ? `(${u.email})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input-base mt-1 min-w-[120px]"
          >
            {priorityOptions.map((o) => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Due date</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input-base mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-base mt-1 min-w-[140px]"
          >
            {statusOptions.map((o) => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
