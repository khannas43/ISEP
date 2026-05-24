'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateMeetingStatus } from '../actions';

type Props = { meetingId: string; currentStatus: string; canChangeStatus: boolean };

export function MeetingStatusActions({ meetingId, currentStatus, canChangeStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canChangeStatus) return null;

  async function handleStatus(newStatus: string) {
    setError(null);
    setLoading(true);
    const result = await updateMeetingStatus(meetingId, newStatus);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentStatus === 'PLANNED' && (
        <button
          type="button"
          onClick={() => handleStatus('ACTIVE')}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-3.5 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          Mark Active
        </button>
      )}
      {(currentStatus === 'PLANNED' || currentStatus === 'ACTIVE') && (
        <button
          type="button"
          onClick={() => handleStatus('CONCLUDED')}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Mark Concluded
        </button>
      )}
      {error && <span className="text-base text-red-600">{error}</span>}
    </div>
  );
}
