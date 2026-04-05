'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { PositionAdvisoryDto } from '@/lib/api';

const POSITION_COLORS: Record<string, string> = {
  SUPPORT: 'bg-emerald-50 border-emerald-300 text-emerald-800',
  OBJECT: 'bg-red-50 border-red-300 text-red-800',
  NEUTRAL: 'bg-slate-100 border-slate-300 text-slate-800',
  CONDITIONAL_SUPPORT: 'bg-amber-50 border-amber-300 text-amber-800',
};

type Props = {
  agendaItemId: string;
  meetingId: string;
};

function AdvisorySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{title}</h3>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  );
}

export function PositionAdvisorPanel({ agendaItemId, meetingId }: Props) {
  const [advisory, setAdvisory] = useState<PositionAdvisoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const fetchAdvisory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/position-advisory?agendaItemId=${encodeURIComponent(agendaItemId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? `HTTP ${res.status}`);
        setAdvisory(null);
        return;
      }
      const data = await res.json();
      setAdvisory(data as PositionAdvisoryDto);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load advisory');
      setAdvisory(null);
    } finally {
      setLoading(false);
    }
  }, [agendaItemId]);

  useEffect(() => {
    fetchAdvisory();
  }, [fetchAdvisory]);

  if (dismissed) return null;

  const positionColor = advisory ? POSITION_COLORS[advisory.suggestedPosition] ?? 'bg-slate-50 border-slate-200 text-slate-800' : '';

  return (
    <div className="card border-amber-200/60 bg-amber-50/30 overflow-hidden mt-6">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>🤖</span>
            <h2 className="text-base font-semibold text-slate-900">AI Position Advisor</h2>
            <span className="rounded bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-600">
              AI-generated · Non-binding
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAdvisory}
              disabled={loading}
              className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
            >
              {loading ? 'Regenerating…' : 'Regenerate'}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-slate-500 hover:text-slate-700 p-1"
              aria-expanded={expanded}
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Based on uploaded agenda paper and India&apos;s history. Last generated:{' '}
          {advisory?.generatedAt ? new Date(advisory.generatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
        </p>

        {expanded && (
          <>
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
            {loading && !advisory && !error && (
              <p className="mt-4 text-sm text-slate-500">Loading advisory…</p>
            )}
            {advisory && !error && (
              <div className="mt-4 space-y-4">
                <AdvisorySection title="Paper summary">
                  <p>{advisory.paperSummary}</p>
                </AdvisorySection>
                <AdvisorySection title="India's historical position">
                  <p className="whitespace-pre-line">{advisory.historicalContext}</p>
                </AdvisorySection>
                <AdvisorySection title="Suggested position for this session">
                  <div className={`inline-block rounded border px-3 py-1.5 text-sm font-medium ${positionColor}`}>
                    {advisory.suggestedPosition.replace(/_/g, ' ')}
                  </div>
                  <p className="mt-2">{advisory.suggestedPositionReasoning}</p>
                </AdvisorySection>
                <AdvisorySection title="Key points to raise">
                  <ul className="list-disc list-inside space-y-1">
                    {advisory.keyPointsToRaise.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </AdvisorySection>
                {advisory.confidenceScore !== undefined && (
                  <p className="text-xs text-slate-500">Confidence: {Math.round(advisory.confidenceScore * 100)}%</p>
                )}
                <div className="rounded bg-amber-100/80 border border-amber-200 px-3 py-2 text-sm text-amber-900">
                  ⚠️ AI-generated advisory. Not an official position. Review, validate, and use as a starting point only.
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={`/meetings/${meetingId}/agenda/${agendaItemId}/feedback/consolidate`}
                    className="btn-primary text-sm"
                  >
                    Use as starting point →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="btn-secondary text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
