'use client';

import Link from 'next/link';
type InterventionRow = { interventionId: string; meetingId: string; agendaItemId: string; agendaItemTitle: string; text: string; deliveredBy: string; deliveredAt: string; type: string };
type Props = { meetingId: string; meetingTitle: string; agendaItems: { agendaItemId: string; itemNumber: string; title: string }[]; interventions: InterventionRow[] };

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

/**
 * SCR-LIVE-01 — Live meeting tab: lobby view with link to full live page, active agenda item, interventions.
 * Demo uses mock data.
 */
export function LiveTab({ meetingId, meetingTitle, agendaItems, interventions }: Props) {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Live meeting</h2>
          <Link href={`/meetings/${meetingId}/live`} className="btn-primary text-base">
            Open live meeting lobby →
          </Link>
        </div>
        <div className="card-body">
          <p className="text-slate-600">
            When the meeting status is <strong>Active</strong>, participants can use the live lobby to see the current agenda item, post last-minute position updates, and record intervention statements.
          </p>
          <p className="mt-2 text-base text-slate-500">
            This meeting: <strong>{meetingTitle}</strong>. Use the link above to open the full live interface.
          </p>
        </div>
      </div>

      {agendaItems.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-slate-900">Agenda items (live links)</h3>
          </div>
          <div className="card-body">
            <ul className="space-y-2">
              {agendaItems.map((a) => (
                <li key={a.agendaItemId}>
                  <Link
                    href={`/meetings/${meetingId}/live/agenda/${a.agendaItemId}`}
                    className="text-base font-medium text-blue-600 hover:underline"
                  >
                    Item {a.itemNumber}: {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">Intervention statements (recorded)</h3>
          <Link href={`/meetings/${meetingId}/live/interventions/new`} className="btn-secondary text-base">
            Record intervention
          </Link>
        </div>
        <div className="card-body">
          {interventions.length === 0 ? (
            <p className="text-slate-500">No interventions recorded yet for this meeting.</p>
          ) : (
            <ul className="space-y-4">
              {interventions.map((i) => (
                <li key={i.interventionId} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <p className="text-base text-slate-500">
                    {i.agendaItemTitle} · {formatTime(i.deliveredAt)} · {i.deliveredBy}
                  </p>
                  <p className="mt-1 text-slate-800">{i.text}</p>
                  <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-600">
                    {i.type.replace(/_/g, ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
