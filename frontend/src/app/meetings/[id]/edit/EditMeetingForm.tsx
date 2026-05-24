'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import type { BodyDto, MeetingDto, ReferenceItem } from '@/lib/api';
import { updateMeeting, type UpdateMeetingPayload } from '../../actions';

type Props = {
  meeting: MeetingDto;
  bodies: BodyDto[];
  meetingTypeOptions: ReferenceItem[];
};

export function EditMeetingForm({ meeting, bodies, meetingTypeOptions }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const title = (form.querySelector('[name=title]') as HTMLInputElement)?.value?.trim();
    const startDate = (form.querySelector('[name=startDate]') as HTMLInputElement)?.value;
    const endDate = (form.querySelector('[name=endDate]') as HTMLInputElement)?.value;
    if (!title) {
      setError('Title is required.');
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setError('End date must be on or after start date.');
      return;
    }
    const payload: UpdateMeetingPayload = {
      bodyId: (form.querySelector('[name=bodyId]') as HTMLSelectElement)?.value || undefined,
      title,
      sessionNumber: (form.querySelector('[name=sessionNumber]') as HTMLInputElement)?.value?.trim() || null,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      location: (form.querySelector('[name=location]') as HTMLInputElement)?.value?.trim() || null,
      meetingType: (form.querySelector('[name=meetingType]') as HTMLSelectElement)?.value || undefined,
      notes: (form.querySelector('[name=notes]') as HTMLTextAreaElement)?.value?.trim() || null,
    };
    const result = await updateMeeting(meeting.meetingId, payload);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/meetings/${meeting.meetingId}`);
    router.refresh();
  }

  const startDateStr = meeting.startDate ? meeting.startDate.toString().slice(0, 10) : '';
  const endDateStr = meeting.endDate ? meeting.endDate.toString().slice(0, 10) : '';

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
          defaultValue={meeting.bodyId}
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
          defaultValue={meeting.title}
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
          defaultValue={meeting.sessionNumber ?? ''}
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
            defaultValue={startDateStr}
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
            defaultValue={endDateStr}
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
          defaultValue={meeting.location ?? ''}
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
          defaultValue={meeting.meetingType ?? 'IN_PERSON'}
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
          Notes / overview
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={meeting.notes ?? ''}
          className="input-base"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          Save changes
        </button>
        <Link
          href={`/meetings/${meeting.meetingId}`}
          className="btn-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
