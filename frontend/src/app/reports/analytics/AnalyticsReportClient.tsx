'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiUrl } from '@/lib/api';

const DEMO_MEETING_ID = '00000000-0000-0000-0000-000000000001';

export type MeetingAnalytics = {
  meetingId: string;
  meetingTitle: string;
  totalMembers: number;
  participated: number;
  tasksTotal: number;
  tasksCompleted: number;
  tasksOverdue: number;
  taskCompletionRatePercent: number;
  papersDraft: number;
  papersApproved: number;
  papersFinalised: number;
  avgApprovalDays: number | null;
};

type MeetingOption = { meetingId: string; title: string };

type Props = {
  accessToken: string;
};

async function downloadAuthorized(url: string, accessToken: string, filename: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return false;
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  return true;
}

export function AnalyticsReportClient({ accessToken }: Props) {
  const [meetings, setMeetings] = useState<MeetingOption[]>([]);
  const [meetingId, setMeetingId] = useState(DEMO_MEETING_ID);
  const [analytics, setAnalytics] = useState<MeetingAnalytics | null>(null);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoadingMeetings(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingMeetings(true);
      try {
        const res = await fetch(`${getApiUrl()}/api/v1/meetings?upcoming=true&limit=80`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        });
        const data = res.ok ? await res.json() : null;
        const raw = Array.isArray(data?.data) ? data.data : [];
        const opts: MeetingOption[] = raw.map((m: { meetingId?: string; id?: string; title?: string }) => ({
          meetingId: String(m.meetingId ?? m.id ?? ''),
          title: String(m.title ?? 'Meeting'),
        }));
        if (!cancelled) {
          const ids = new Set(opts.map((o) => o.meetingId));
          if (!ids.has(DEMO_MEETING_ID)) {
            opts.unshift({ meetingId: DEMO_MEETING_ID, title: 'Demo meeting' });
          }
          setMeetings(opts.filter((o) => o.meetingId));
        }
      } catch {
        if (!cancelled) {
          setMeetings([{ meetingId: DEMO_MEETING_ID, title: 'Demo meeting' }]);
        }
      } finally {
        if (!cancelled) setLoadingMeetings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const loadAnalytics = useCallback(async () => {
    if (!accessToken || !meetingId) return;
    setLoadingAnalytics(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/analytics`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      if (res.status === 403) {
        setError('You do not have permission to view meeting analytics.');
        setAnalytics(null);
        return;
      }
      if (res.status === 404) {
        setError('Meeting not found.');
        setAnalytics(null);
        return;
      }
      if (!res.ok) {
        setError('Could not load analytics.');
        setAnalytics(null);
        return;
      }
      setAnalytics(await res.json());
    } catch {
      setError('Could not load analytics.');
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [accessToken, meetingId]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const papersTotal = useMemo(() => {
    if (!analytics) return 0;
    return analytics.papersDraft + analytics.papersApproved + analytics.papersFinalised;
  }, [analytics]);

  const participationPct =
    analytics && analytics.totalMembers > 0
      ? Math.round((analytics.participated / analytics.totalMembers) * 100)
      : analytics
        ? 100
        : 0;

  const barRows = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: 'Task completion', value: Math.min(100, Math.round(analytics.taskCompletionRatePercent)) },
      {
        label: 'Participation (assigned members)',
        value: Math.min(100, participationPct),
      },
      {
        label: 'Papers finalised (share of papers)',
        value: papersTotal > 0 ? Math.round((analytics.papersFinalised / papersTotal) * 100) : 0,
      },
    ];
  }, [analytics, participationPct, papersTotal]);

  const exportXlsx = () => {
    if (!accessToken) return;
    void downloadAuthorized(
      `${getApiUrl()}/api/v1/meetings/${meetingId}/analytics/export?format=xlsx`,
      accessToken,
      `analytics-${meetingId}.xlsx`
    );
  };

  const exportXml = () => {
    if (!accessToken) return;
    void downloadAuthorized(
      `${getApiUrl()}/api/v1/meetings/${meetingId}/analytics/export?format=xml`,
      accessToken,
      `analytics-${meetingId}.xml`
    );
  };

  const exportMomPdf = () => {
    if (!accessToken) return;
    void downloadAuthorized(
      `${getApiUrl()}/api/v1/meetings/${meetingId}/mom/export`,
      accessToken,
      `MoM-${meetingId}.pdf`
    );
  };

  if (!accessToken) {
    return <p className="text-slate-600">Sign in to view participation analytics.</p>;
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md flex-1">
          <label htmlFor="analytics-meeting" className="mb-1 block text-sm font-medium text-slate-700">
            Meeting
          </label>
          <select
            id="analytics-meeting"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            value={meetingId}
            disabled={loadingMeetings}
            onChange={(e) => setMeetingId(e.target.value)}
          >
            {meetings.map((m) => (
              <option key={m.meetingId} value={m.meetingId}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportXlsx}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={exportXml}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Export XML
          </button>
          <button
            type="button"
            onClick={exportMomPdf}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Export MoM PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      {loadingAnalytics && <p className="text-sm text-slate-500">Loading analytics…</p>}

      {analytics && !loadingAnalytics && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Members participated</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {analytics.participated}
                <span className="text-base font-normal text-slate-500">
                  {' '}
                  of {analytics.totalMembers} assigned
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Tasks completed</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {analytics.taskCompletionRatePercent}%
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {analytics.tasksCompleted} of {analytics.tasksTotal} tasks
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Papers finalised</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{analytics.papersFinalised}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {papersTotal > 0 ? `of ${papersTotal} papers tracked` : 'No papers for this meeting'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Avg approval cycle</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {analytics.avgApprovalDays != null ? `${analytics.avgApprovalDays} days` : '—'}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">When available from workflow data</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-base font-semibold text-slate-900">Selected meeting indicators</h2>
            <p className="mt-1 text-sm text-slate-600">{analytics.meetingTitle}</p>
            <div className="mt-4 space-y-3">
              {barRows.map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-sm text-slate-600">
                    <span>{b.label}</span>
                    <span>{b.value}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${b.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Tasks overdue</p>
              <p className="mt-1 text-xl font-semibold text-amber-700">{analytics.tasksOverdue}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Papers in draft</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{analytics.papersDraft}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Papers in approval</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{analytics.papersApproved}</p>
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-600">
            Open the{' '}
            <Link href={`/meetings/${meetingId}/mom`} className="font-medium text-blue-600 hover:underline">
              Minutes of Meeting
            </Link>{' '}
            page to generate or view the MoM for this meeting.
          </p>
        </>
      )}
    </>
  );
}
