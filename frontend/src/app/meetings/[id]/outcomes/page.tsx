import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, getMeetingOutcomes, type MeetingDto } from '@/lib/api';
import { OutcomeForm } from './OutcomeForm';

async function getMeeting(id: string, accessToken: string): Promise<MeetingDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getAgendaItems(meetingId: string, accessToken: string) {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.content ?? []);
}

type Props = { params: Promise<{ id: string }> };

/**
 * SCR-LIVE-04 — Meeting outcomes capture. Post-meeting: decisions, resolutions, next steps per agenda item.
 */
export default async function MeetingOutcomesPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let meeting: MeetingDto | null = null;
  if (accessToken) {
    try {
      meeting = await getMeeting(id, accessToken);
    } catch {
      meeting = null;
    }
  }
  if (!meeting) notFound();

  let outcomes: { outcomeId: string; agendaItemTitle: string | null; decision: string; resolutionRef: string | null; nextSteps: string | null; capturedAt: string }[] = [];
  let agendaItems: { agendaItemId: string; itemNumber?: string; title: string }[] = [];
  if (accessToken) {
    try {
      const [outcomesRes, list] = await Promise.all([getMeetingOutcomes(accessToken, id), getAgendaItems(id, accessToken)]);
      outcomes = outcomesRes.map((o: { outcomeId: string; agendaItemTitle?: string | null; decision: string; resolutionRef?: string | null; nextSteps?: string | null; capturedAt: string }) => ({ outcomeId: o.outcomeId, agendaItemTitle: o.agendaItemTitle ?? null, decision: o.decision, resolutionRef: o.resolutionRef ?? null, nextSteps: o.nextSteps ?? null, capturedAt: o.capturedAt }));
      agendaItems = list.map((a: { agendaItemId: string; itemNumber?: string; title?: string }) => ({ agendaItemId: a.agendaItemId, itemNumber: a.itemNumber, title: a.title ?? '' }));
    } catch {
      // Leave empty when API unavailable
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/meetings/${id}?tab=outcomes`} className="text-sm font-medium text-slate-500 hover:text-slate-700">← Meeting overview</Link>
      </div>
      <div className="card mb-6">
        <div className="card-body">
          <h1 className="page-title">Meeting outcomes</h1>
          <p className="page-subtitle">{meeting.title}</p>
          <p className="mt-2 text-sm text-slate-600">Record decisions, resolutions, and next steps per agenda item. Available once meeting is concluded.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h2 className="text-base font-semibold text-slate-900">Captured outcomes</h2>
          {outcomes.length === 0 ? (
            <p className="mt-2 text-slate-500">No outcomes captured yet. Add below.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {outcomes.map((o) => (
                <li key={o.outcomeId} className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-medium text-slate-900">{o.agendaItemTitle ?? '—'}</h3>
                  <p className="mt-2 text-sm text-slate-700">{o.decision}</p>
                  {o.nextSteps && <p className="mt-1 text-sm text-slate-600">Next steps: {o.nextSteps}</p>}
                  <p className="mt-2 text-xs text-slate-500">Captured {new Date(o.capturedAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
          <OutcomeForm meetingId={id} agendaItems={agendaItems} />
        </div>
      </div>
    </div>
  );
}
