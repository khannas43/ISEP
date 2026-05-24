'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import type { BodyDto, ReferenceItem } from '@/lib/api';
import { createMeeting } from './actions';

type Props = { bodies: BodyDto[]; meetingTypeOptions: ReferenceItem[] };

export function MeetingForm({ bodies, meetingTypeOptions }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createMeeting(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.id) {
      router.push(`/meetings/${result.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && (
        <div className="rounded bg-red-50 text-red-700 px-4 py-2 text-base">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="bodyId" className="block text-base font-medium text-slate-700 mb-1">
          Body *
        </label>
        <select
          id="bodyId"
          name="bodyId"
          required
          className="input-base"
        >
          <option value="">Select body</option>
          {bodies.map((b) => (
            <option key={b.bodyId} value={b.bodyId}>
              {b.name} {b.abbreviation ? `(${b.abbreviation})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="block text-base font-medium text-slate-700 mb-1">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="sessionNumber" className="block text-base font-medium text-slate-700 mb-1">
          Session number
        </label>
        <input
          id="sessionNumber"
          name="sessionNumber"
          type="text"
          className="input-base"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-base font-medium text-slate-700 mb-1">
            Start date *
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-base font-medium text-slate-700 mb-1">
            End date *
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            className="input-base"
          />
        </div>
      </div>
      <div>
        <label htmlFor="location" className="block text-base font-medium text-slate-700 mb-1">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className="input-base"
        />
      </div>
      <div>
        <label htmlFor="meetingType" className="block text-base font-medium text-slate-700 mb-1">
          Meeting type *
        </label>
        <select
          id="meetingType"
          name="meetingType"
          required
          defaultValue={meetingTypeOptions[0]?.code ?? 'IN_PERSON'}
          className="input-base"
        >
          {meetingTypeOptions.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="block text-base font-medium text-slate-700 mb-1">
          Notes / agenda overview
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="input-base"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          Create meeting
        </button>
        <Link
          href="/meetings"
          className="btn-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
