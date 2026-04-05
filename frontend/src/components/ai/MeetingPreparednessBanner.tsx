'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { MeetingPreparednessDto } from '@/lib/api';

const RISK_COLORS: Record<string, string> = {
  GREEN: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  AMBER: 'bg-amber-100 text-amber-800 border-amber-300',
  ORANGE: 'bg-orange-100 text-orange-800 border-orange-300',
  RED: 'bg-red-100 text-red-800 border-red-300',
};

const SEVERITY_ICONS: Record<string, string> = {
  CRITICAL: '🔴',
  WARNING: '🟡',
  INFO: '🔵',
};

type Props = {
  meetingId: string;
  meetingTitle: string;
  startDate: string;
};

function daysUntil(startDate: string): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function MeetingPreparednessBanner({ meetingId, meetingTitle, startDate }: Props) {
  const [data, setData] = useState<MeetingPreparednessDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreparedness = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/meeting-preparedness?meetingId=${encodeURIComponent(meetingId)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? `HTTP ${res.status}`);
        setData(null);
        return;
      }
      const json = await res.json();
      setData(json as MeetingPreparednessDto);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load preparedness');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchPreparedness();
  }, [fetchPreparedness]);

  const days = daysUntil(startDate);
  const riskColor = data ? RISK_COLORS[data.riskLevel] ?? 'bg-slate-100 text-slate-800' : '';

  return (
    <div className="card border-slate-200 bg-slate-50/50 overflow-hidden mb-6">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>📊</span>
            <h2 className="text-base font-semibold text-slate-900">Meeting Preparedness Intelligence</h2>
            <span className="text-sm text-slate-600">
              {meetingTitle} · {days} day{days !== 1 ? 's' : ''} to meeting
            </span>
          </div>
          <button
            type="button"
            onClick={fetchPreparedness}
            disabled={loading}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
        {loading && !data && !error && (
          <p className="mt-4 text-sm text-slate-500">Computing preparedness…</p>
        )}
        {data && !error && (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="text-3xl font-bold text-slate-900">{data.score}/100</div>
              <div className="flex-1 min-w-0">
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(100, data.score)}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`rounded border px-2 py-0.5 text-xs font-medium ${riskColor}`}>
                    {data.riskLevel} RISK
                  </span>
                  <span className="text-xs text-slate-500">
                    Last computed: {new Date(data.lastComputedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>

            {data.executiveSummary && (
              <p className="mt-3 text-sm text-slate-700">{data.executiveSummary}</p>
            )}

            {data.criticalActions && data.criticalActions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Critical actions (must resolve before meeting)</h3>
                <ul className="space-y-2">
                  {data.criticalActions.map((action) => (
                    <li key={`${action.description}-${action.linkedEntityId ?? ''}-${action.severity}`} className="flex gap-2 text-sm">
                      <span aria-hidden>{SEVERITY_ICONS[action.severity] ?? '•'}</span>
                      <span className="text-slate-800">{action.description}</span>
                      {action.linkedEntityType === 'AGENDA_ITEM' && action.linkedEntityId && (
                        <Link
                          href={`/meetings/${meetingId}?tab=agenda`}
                          className="text-blue-600 hover:underline shrink-0"
                        >
                          View items
                        </Link>
                      )}
                      {action.linkedEntityType === 'PAPER' && (
                        <Link href={`/meetings/${meetingId}/papers`} className="text-blue-600 hover:underline shrink-0">
                          View papers
                        </Link>
                      )}
                      {action.recommendedAction && !action.linkedEntityId && (
                        <span className="text-slate-500 shrink-0">— {action.recommendedAction}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.keyStrengths && data.keyStrengths.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {data.keyStrengths.map((s) => (
                  <span key={s} className="text-xs text-emerald-700">✅ {s}</span>
                ))}
              </div>
            )}

            {data.projectedScoreAtMeetingDate !== undefined && (
              <p className="mt-3 text-sm text-slate-600">
                Projected readiness: {data.projectedScoreAtMeetingDate}/100 by meeting date.
                {data.narrative && ` ${data.narrative.slice(0, 120)}…`}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
              <span className="text-xs text-slate-500">⚠️ AI analysis. Verify details before action.</span>
              <Link href={`/meetings/${meetingId}?tab=overview`} className="text-sm font-medium text-blue-600 hover:underline">
                Full report
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
