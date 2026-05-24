import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getApiUrl, type AgendaItemDto } from '@/lib/api';
import { AddCommentForm } from '@/components/AddCommentForm';

async function getAgendaItem(meetingId: string, itemId: string, accessToken: string): Promise<AgendaItemDto | null> {
  const res = await fetch(`${getApiUrl()}/api/v1/meetings/${meetingId}/agenda-items/${itemId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * SCR-COL-04 — Comments & discussion (agenda item). Threaded comments; reply; visibility internal vs delegation.
 */
type Props = { params: Promise<{ id: string; itemId: string }> };

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default async function AgendaItemCommentsPage({ params }: Props) {
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

  const comments: { id: string; text: string; authorName: string; createdAt: string }[] = [];

  return (
    <div>
      <div className="mb-6">
        <Link href={`/meetings/${meetingId}/agenda/${itemId}?tab=activity`} className="text-base font-medium text-slate-500 hover:text-slate-700">
          ← Back to agenda item
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h1 className="page-title">Comments & discussion</h1>
          <p className="page-subtitle mt-1">
            Item {agendaItem.itemNumber}: {agendaItem.title} — threaded comments; visibility: internal vs delegation.
          </p>
          <ul className="mt-6 space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="border-l-2 border-slate-200 pl-4">
                <p className="text-base text-slate-800">{c.text}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {c.authorName} · {formatDate(c.createdAt)}
                </p>
              </li>
            ))}
          </ul>
          <AddCommentForm contextLabel="agenda item" />
        </div>
      </div>
    </div>
  );
}
