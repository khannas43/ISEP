'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { createAnnouncement, publishAnnouncement } from '@/lib/api';

type Step = 'compose' | 'preview' | 'sent';

export function AnnouncementForm() {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>('compose');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [urgency, setUrgency] = useState('INFORMATIONAL');
  const [scope, setScope] = useState('ALL_USERS');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;
    setError(null);
    setStep('preview');
  }

  async function handleSend() {
    if (!accessToken) {
      setError('Not authenticated');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const created = await createAnnouncement(accessToken, {
        subject: subject.trim(),
        body: body.trim(),
        urgency,
        scope,
      });
      if (!created) {
        setError('Failed to create announcement');
        setSubmitting(false);
        return;
      }
      // Publish so it appears as pinned banner and is broadcast
      await publishAnnouncement(accessToken, created.announcementId);
      setStep('sent');
    } catch {
      setError('Failed to send announcement');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'sent') {
    return (
      <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6">
        <p className="font-medium text-emerald-800">Announcement published.</p>
        <p className="mt-1 text-base text-emerald-700">
          It has been broadcast to the selected scope and will appear as a pinned banner. In production, recipients would also receive an email.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => { setStep('compose'); setSubject(''); setBody(''); setError(null); }}
            className="btn-secondary text-base"
          >
            Create another
          </button>
          <Link href="/admin" className="btn-secondary text-base">Back to Admin</Link>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-semibold text-slate-700">Preview — confirm before sending</h2>
          <dl className="mt-3 space-y-2 text-base">
            <div>
              <dt className="text-slate-500">Subject</dt>
              <dd className="font-medium text-slate-900">{subject}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Urgency</dt>
              <dd className="font-medium text-slate-900">{urgency}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Scope</dt>
              <dd className="font-medium text-slate-900">{scope === 'ALL_USERS' ? 'All users' : scope}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Message</dt>
              <dd className="mt-1 whitespace-pre-wrap text-slate-900">{body || '—'}</dd>
            </div>
          </dl>
        </div>
        {error && <p className="text-base text-red-600" role="alert">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSend}
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Send announcement'}
          </button>
          <button type="button" onClick={() => setStep('compose')} className="btn-secondary">
            Back to edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handlePreview} className="mt-6 space-y-4">
      <div>
        <label htmlFor="subject" className="block text-base font-medium text-slate-700">Subject *</label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input-base mt-1 w-full max-w-md"
          placeholder="Announcement title"
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-base font-medium text-slate-700">Message body</label>
        <textarea
          id="body"
          name="body"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input-base mt-1 w-full"
          placeholder="Message content. Recipients will see this as a pinned banner and receive it by email in production."
        />
      </div>
      <div>
        <label htmlFor="urgency" className="block text-base font-medium text-slate-700">Urgency</label>
        <select
          id="urgency"
          name="urgency"
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="input-base mt-1 max-w-xs"
        >
          <option value="INFORMATIONAL">Informational</option>
          <option value="IMPORTANT">Important</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>
      <div>
        <label htmlFor="scope" className="block text-base font-medium text-slate-700">Recipient scope</label>
        <select
          id="scope"
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="input-base mt-1 max-w-xs"
        >
          <option value="ALL_USERS">All users</option>
          <option value="BY_ROLE">By role</option>
          <option value="BY_COMMITTEE">By committee</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary">Preview & send</button>
        <Link href="/admin" className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
