import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type AgendaItemDto } from '@/lib/api';
import { DeliberationsClient } from './DeliberationsClient';

async function getAgendaItem(meetingId: string, itemId: string, accessToken: string): Promise<AgendaItemDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items/${itemId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * SCR-COL-03 — Deliberation notes. Rich text, timestamped, author. ME can add only; SA, DL, CO can edit.
 */
type Props = { params: Promise<{ id: string; itemId: string }> };

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default async function DeliberationsPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: meetingId, itemId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let agendaItem: AgendaItemDto | null = null;
  if (accessToken) {
    try {
      agendaItem = await getAgendaItem(meetingId, itemId, accessToken);
    } catch {
      agendaItem = null;
    }
  }
  if (!agendaItem) notFound();

  const deliberations: { id: string; note: string; capturedAt: string; authorName?: string }[] = [];
  const roles = (session as { roles?: string[] }).roles ?? [];
  const canAdd = roles.includes('SYSTEM_ADMIN') || roles.includes('DELEGATION_LEADER') || roles.includes('COORDINATOR') || roles.includes('MEMBER');

  return (
    <div>
      <div className="mb-6">
        <Link href={`/meetings/${meetingId}/agenda/${itemId}?tab=deliberations`} className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Back to agenda item
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Deliberation notes</h1>
          <p className="page-subtitle mt-1">
            Item {agendaItem.itemNumber}: {agendaItem.title} — internal notes (not shared with IMO).
          </p>
          <ul className="mt-6 space-y-4">
            {deliberations.map((n) => (
              <li key={n.id} className="rounded border border-slate-200 bg-slate-50/50 p-3">
                <p className="text-base text-slate-800">{n.note}</p>
                <p className="mt-2 text-sm text-slate-500">{n.authorName ?? '—'} · {formatDate(n.capturedAt)}</p>
              </li>
            ))}
          </ul>
          {canAdd && <DeliberationsClient meetingId={meetingId} itemId={itemId} />}
        </div>
      </div>
    </div>
  );
}
