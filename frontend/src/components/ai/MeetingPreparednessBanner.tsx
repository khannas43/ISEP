'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { MeetingPreparednessDto } from '@/lib/api';

const STORAGE_KEY = 'isep_mpi_collapsed';

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

function readCollapsed(): boolean {
  if (typeof window === 'undefined') return true;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'false' || v === '0') return false;
  return true;
}

export function MeetingPreparednessBanner({ meetingId, meetingTitle, startDate }: Props) {
  const [data, setData] = useState<MeetingPreparednessDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setCollapsed(readCollapsed());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false');
  }, [collapsed]);

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

  const summaryLine =
    data && !error
      ? `${data.score}/100 · ${data.riskLevel} RISK`
      : loading && !error
        ? 'Computing…'
        : error
          ? 'Unable to load score'
          : '—';

  const lastComputed =
    data?.lastComputedAt != null
      ? new Date(data.lastComputedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
      : null;

  return (
    <div className="card mb-6 border-slate-200 bg-slate-50/50 overflow-visible">
      {collapsed ? (
        <div
          className="flex h-12 max-h-[48px] min-h-0 items-center justify-between gap-2 overflow-hidden px-3 sm:px-4"
          role="region"
          aria-label="Meeting Preparedness Intelligence"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <span className="shrink-0 text-base" aria-hidden>
              📊
            </span>
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal">
              MPI
            </span>
            <span className="min-w-0 truncate text-sm font-semibold text-slate-900 tabular-nums sm:text-base">
              {summaryLine}
            </span>
            {lastComputed && (
              <span className="min-w-0 truncate text-xs text-slate-500 sm:text-sm">· {lastComputed}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            aria-expanded={false}
            aria-label="Expand Meeting Preparedness Intelligence"
          >
            <span className="text-lg leading-none">▼</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="shrink-0 text-lg" aria-hidden>
                📊
              </span>
              <span className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                Meeting Preparedness Intelligence
              </span>
              <span className="hidden truncate text-sm text-slate-500 sm:inline">
                {meetingTitle} · {days} day{days !== 1 ? 's' : ''} to meeting
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={fetchPreparedness}
                disabled={loading}
                className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                aria-expanded
                aria-label="Collapse Meeting Preparedness Intelligence"
              >
                <span className="text-lg leading-none">▲</span>
              </button>
            </div>
          </div>

          <div className="card-body overflow-visible">
            {error && <p className="mt-1 text-base text-red-600">{error}</p>}
            {loading && !data && !error && <p className="mt-4 text-base text-slate-500">Computing preparedness…</p>}
            {data && !error && (
              <>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <div className="text-3xl font-bold text-slate-900">{data.score}/100</div>
                  <div className="min-w-0 flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${Math.min(100, data.score)}%` }}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded border px-2 py-0.5 text-sm font-medium ${riskColor}`}>
                        {data.riskLevel} RISK
                      </span>
                      <span className="text-sm text-slate-500">
                        Last computed:{' '}
                        {new Date(data.lastComputedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                {data.executiveSummary && <p className="mt-3 text-base text-slate-700">{data.executiveSummary}</p>}

                {data.criticalActions && data.criticalActions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-base font-semibold text-slate-700">Critical actions (must resolve before meeting)</h3>
                    <ul className="space-y-2">
                      {data.criticalActions.map((action) => (
                        <li
                          key={`${action.description}-${action.linkedEntityId ?? ''}-${action.severity}`}
                          className="flex gap-2 text-base"
                        >
                          <span aria-hidden>{SEVERITY_ICONS[action.severity] ?? '•'}</span>
                          <span className="text-slate-800">{action.description}</span>
                          {action.linkedEntityType === 'AGENDA_ITEM' && action.linkedEntityId && (
                            <Link
                              href={`/meetings/${meetingId}/?tab=agenda`}
                              className="shrink-0 text-blue-600 hover:underline"
                            >
                              View items
                            </Link>
                          )}
                          {action.linkedEntityType === 'PAPER' && (
                            <Link
                              href={
                                action.linkedEntityId
                                  ? `/papers/${action.linkedEntityId}/approval/`
                                  : `/papers/?meetingId=${encodeURIComponent(meetingId)}`
                              }
                              className="shrink-0 text-blue-600 hover:underline"
                            >
                              View papers
                            </Link>
                          )}
                          {action.recommendedAction && !action.linkedEntityId && (
                            <span className="shrink-0 text-slate-500">— {action.recommendedAction}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.keyStrengths && data.keyStrengths.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.keyStrengths.map((s) => (
                      <span key={s} className="text-sm text-emerald-700">
                        ✅ {s}
                      </span>
                    ))}
                  </div>
                )}

                {data.projectedScoreAtMeetingDate !== undefined && (
                  <p className="mt-3 text-base text-slate-600">
                    Projected readiness: {data.projectedScoreAtMeetingDate}/100 by meeting date.
                    {data.narrative && ` ${data.narrative.slice(0, 120)}…`}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                  <span className="text-sm text-slate-500">⚠️ AI analysis. Verify details before action.</span>
                  <Link href={`/meetings/${meetingId}/?tab=overview`} className="text-base font-medium text-blue-600 hover:underline">
                    Full report
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
