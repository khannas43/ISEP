'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  addParticipant,
  removeParticipant,
  updateParticipantRole,
} from '../actions';
import type { MeetingParticipantDto, MeetingRole, ReferenceItem, UserDto } from '@/lib/api';

type Props = {
  meetingId: string;
  participants: MeetingParticipantDto[];
  canManage: boolean;
  meetingRoleOptions: ReferenceItem[];
  userListForPicker?: UserDto[];
};

export function ParticipantsTab({ meetingId, participants, canManage, meetingRoleOptions, userListForPicker = [] }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [addUserId, setAddUserId] = useState('');
  const [addRole, setAddRole] = useState<string>(meetingRoleOptions[0]?.code ?? 'MEMBER');
  const existingUserIds = new Set(participants.map((p) => p.userId));
  const availableUsers = userListForPicker.filter((u) => !existingUserIds.has(u.userId));
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const userId = addUserId.trim();
    if (!userId) return;
    setAddError(null);
    setAddLoading(true);
    const result = await addParticipant(meetingId, { userId, meetingRole: addRole as MeetingRole });
    setAddLoading(false);
    if (result.error) {
      setAddError(result.error);
      return;
    }
    setAddOpen(false);
    setAddUserId('');
    setAddRole(meetingRoleOptions[0]?.code ?? 'MEMBER');
    router.refresh();
  }

  async function handleRemove(participantId: string) {
    setRemovingId(participantId);
    const result = await removeParticipant(meetingId, participantId);
    setRemovingId(null);
    if (!result.error) router.refresh();
  }

  async function handleRoleChange(participantId: string, meetingRole: MeetingRole) {
    setUpdatingId(participantId);
    const result = await updateParticipantRole(meetingId, participantId, meetingRole);
    setUpdatingId(null);
    if (!result.error) router.refresh();
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Participants</h2>
          {canManage && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="btn-primary"
            >
              Add participant
            </button>
          )}
        </div>

        {addOpen && canManage && (
          <form
            onSubmit={handleAdd}
            className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
          <h3 className="text-sm font-medium text-slate-900">Add participant</h3>
          <p className="mt-1 text-xs text-slate-500">
            Select a user from the system user list. Only active users not already in this meeting are shown.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[200px]">
              <span className="block text-xs font-medium text-slate-700">User</span>
              <select
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                className="input-base mt-1"
                required
              >
                <option value="">Select user…</option>
                {availableUsers.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.fullName} {u.email ? `(${u.email})` : ''}
                  </option>
                ))}
              </select>
              {availableUsers.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">No additional users available to add.</p>
              )}
            </label>
            <label>
              <span className="block text-xs font-medium text-slate-700">Meeting role</span>
              <select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                className="input-base mt-1 min-w-[140px]"
              >
                {meetingRoleOptions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={addLoading} className="btn-primary">
                {addLoading ? 'Adding…' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => { setAddOpen(false); setAddError(null); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
          {addError && <p className="mt-2 text-sm text-red-600">{addError}</p>}
        </form>
      )}

        {participants.length === 0 ? (
          <p className="mt-4 text-slate-500">No participants assigned yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr>
                  <th className="table-header px-4 py-2.5 text-left">Name</th>
                  <th className="table-header px-4 py-2.5 text-left">Designation</th>
                  <th className="table-header px-4 py-2.5 text-left">Organization</th>
                  <th className="table-header px-4 py-2.5 text-left">Meeting role</th>
                  {canManage && <th className="table-header px-4 py-2.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {participants.map((p) => (
                  <tr key={p.participantId} className="hover:bg-slate-50/50">
                    <td className="table-cell">
                      <span className="font-medium text-slate-900">{p.name ?? p.email}</span>
                      {p.name && <span className="block text-xs text-slate-500">{p.email}</span>}
                    </td>
                    <td className="table-cell">{p.designation ?? '—'}</td>
                    <td className="table-cell">{p.organization ?? '—'}</td>
                    <td className="table-cell">
                      {canManage ? (
                        <select
                          value={p.meetingRole}
                          onChange={(e) => handleRoleChange(p.participantId, e.target.value as MeetingRole)}
                          disabled={updatingId === p.participantId}
                          className="input-base w-auto min-w-0 py-1.5 text-sm disabled:opacity-50"
                        >
                          {meetingRoleOptions.map((r) => (
                            <option key={r.code} value={r.code}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-700">
                          {meetingRoleOptions.find((r) => r.code === p.meetingRole)?.label ?? p.meetingRole}
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="table-cell text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(p.participantId)}
                          disabled={removingId === p.participantId}
                          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          {removingId === p.participantId ? 'Removing…' : 'Remove'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
