'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CorrespondenceGroupWithAssignedDto } from '@/lib/api';
import { formatDisplayDate } from '@/lib/format';
import { setMeetingCorrespondenceGroups } from '../actions';

type Props = {
  meetingId: string;
  groups: CorrespondenceGroupWithAssignedDto[];
  canEdit: boolean;
};

export function CorrespondenceTab({ meetingId, groups, canEdit }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(groups.filter((g) => g.assigned).map((g) => g.cgId)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedIds(new Set(groups.filter((g) => g.assigned).map((g) => g.cgId)));
  }, [groups]);

  const toggle = (cgId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cgId)) next.delete(cgId);
      else next.add(cgId);
      return next;
    });
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const result = await setMeetingCorrespondenceGroups(meetingId, Array.from(selectedIds));
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  const hasChanges =
    selectedIds.size !== groups.filter((g) => g.assigned).length ||
    groups.some((g) => g.assigned !== selectedIds.has(g.cgId));

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Correspondence Groups</h2>
            <p className="mt-1 text-base text-slate-500">
              {canEdit
                ? 'Check the groups you want to link to this meeting, then click Save. Only groups for this meeting\'s body are shown.'
                : 'Groups linked to this meeting.'}
            </p>
            {canEdit && groups.length > 0 && (
              <p className="mt-0.5 text-sm text-slate-500">
                How to link: tick the box next to each group you want linked, then click <strong>Save</strong>.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            )}
            <Link href="/correspondence-groups" className="text-base font-medium text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-base text-red-600" role="alert">
            {error}
          </p>
        )}
        {groups.length === 0 ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-base text-slate-700">
            <p className="font-medium text-amber-800">No correspondence groups available for this meeting&apos;s body.</p>
            <p className="mt-1 text-slate-600">
              Create correspondence groups under <Link href="/correspondence-groups" className="text-blue-600 hover:underline">Correspondence Groups</Link> for the same body (committee) as this meeting; they will then appear here so you can link them.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-base">
              <thead>
                <tr>
                  {canEdit && (
                    <th className="table-header w-10 px-2 py-2.5 text-center" scope="col">
                      <span className="sr-only">Assign</span>
                    </th>
                  )}
                  <th className="table-header px-4 py-2.5 text-left">Name</th>
                  <th className="table-header px-4 py-2.5 text-left">Mandate</th>
                  <th className="table-header px-4 py-2.5 text-left">India lead</th>
                  <th className="table-header px-4 py-2.5 text-left">Period</th>
                  <th className="table-header px-4 py-2.5 text-left">Status</th>
                  <th className="table-header px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {groups.map((g) => (
                  <tr key={g.cgId} className="hover:bg-slate-50/50">
                    {canEdit && (
                      <td className="table-cell px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(g.cgId)}
                          onChange={() => toggle(g.cgId)}
                          aria-label={`Link ${g.name} to this meeting`}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </td>
                    )}
                    <td className="table-cell font-medium text-slate-900">
                      <Link href={`/correspondence-groups/${g.cgId}`} className="text-blue-600 hover:underline">
                        {g.name}
                      </Link>
                    </td>
                    <td className="table-cell text-slate-600 max-w-xs truncate">{g.mandate ?? '—'}</td>
                    <td className="table-cell text-slate-600">{g.indiaLeadName ?? '—'}</td>
                    <td className="table-cell text-slate-600">
                      {formatDisplayDate(g.startDate)} – {formatDisplayDate(g.endDate)}
                    </td>
                    <td className="table-cell">
                      <span className={g.status === 'ACTIVE' ? 'badge badge-success' : 'badge badge-neutral'}>
                        {g.status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <Link href={`/correspondence-groups/${g.cgId}`} className="text-base font-medium text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
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
