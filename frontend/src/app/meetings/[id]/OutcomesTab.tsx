'use client';

import Link from 'next/link';
type OutcomeRow = { outcomeId: string; agendaItemTitle: string; decision: string; resolutionRef: string | null; nextSteps: string | null; capturedAt: string };
type Props = { meetingId: string; outcomes: OutcomeRow[]; canEdit?: boolean };

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

/**
 * SCR-LIVE-04 — Meeting outcomes tab: decisions, resolutions, next steps per agenda item.
 * Demo uses mock data.
 */
export function OutcomesTab({ meetingId, outcomes, canEdit }: Props) {
  return (
    <div className="card">
      <div className="card-header flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Meeting outcomes</h2>
        {canEdit && (
          <Link href={`/meetings/${meetingId}/outcomes`} className="btn-secondary text-base">
            Capture / edit outcomes
          </Link>
        )}
      </div>
      <div className="card-body">
        <p className="mb-4 text-base text-slate-600">
          Formal outcomes of each agenda item — decisions adopted, resolutions, and next steps. Available once the meeting is concluded.
        </p>
        {outcomes.length === 0 ? (
          <p className="text-slate-500">No outcomes captured yet. Use &quot;Capture / edit outcomes&quot; after the meeting is concluded.</p>
        ) : (
          <ul className="space-y-6">
            {outcomes.map((o) => (
              <li key={o.outcomeId} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <h3 className="font-medium text-slate-900">{o.agendaItemTitle}</h3>
                <p className="mt-2 text-base text-slate-700">{o.decision}</p>
                {o.resolutionRef && (
                  <p className="mt-1 text-base text-slate-600">Resolution: {o.resolutionRef}</p>
                )}
                {o.nextSteps && (
                  <p className="mt-1 text-base text-slate-600">Next steps: {o.nextSteps}</p>
                )}
                <p className="mt-2 text-sm text-slate-500">Captured {formatDate(o.capturedAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
