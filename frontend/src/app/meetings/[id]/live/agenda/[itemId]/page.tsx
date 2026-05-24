import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAgendaItem } from '@/lib/api';

type Props = { params: Promise<{ id: string; itemId: string }> };

/**
 * SCR-LIVE-02 — Live agenda item discussion board. Finalized position (read-only), live input panel, thread. DL can lock.
 */
export default async function LiveAgendaBoardPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: meetingId, itemId } = await params;
  const accessToken = (session as { accessToken?: string }).accessToken;
  let agendaItem: { agendaItemId: string; itemNumber?: string; title: string } | null = null;
  if (accessToken) {
    try {
      const apiItem = await getAgendaItem(accessToken, meetingId, itemId);
      if (apiItem) agendaItem = { agendaItemId: apiItem.agendaItemId, itemNumber: apiItem.itemNumber, title: apiItem.title ?? '' };
    } catch {
      // use mock below
    }
  }
  if (!agendaItem) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-slate-600">Agenda item not found.</p>
          <Link href={`/meetings/${meetingId}/live`} className="mt-4 inline-block text-base text-blue-600 hover:underline">← Live lobby</Link>
        </div>
      </div>
    );
  }

  const consolidatedPosition = 'India supports the proposed timeline with minor amendments on capacity-building.';
  const livePosts = [
    { id: '1', author: 'Member One', text: 'Confirm we highlight regional workshops in para 3.', at: '2025-05-12T11:15:00Z' },
    { id: '2', author: 'Delegation Leader', text: 'Noted. Proceed as consolidated.', at: '2025-05-12T11:20:00Z' },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link href={`/meetings/${meetingId}/live`} className="text-base font-medium text-slate-500 hover:text-slate-700">← Live lobby</Link>
      </div>
      <div className="card mb-6">
        <div className="card-body">
          <h1 className="page-title">Item {agendaItem.itemNumber}: {agendaItem.title}</h1>
          <h2 className="mt-4 text-base font-semibold text-slate-700">India&apos;s finalized position (reference)</h2>
          <p className="mt-2 rounded bg-slate-50 p-3 text-slate-800">{consolidatedPosition}</p>
        </div>
      </div>
      <div className="card mb-6">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Live inputs</h2>
          <button type="button" disabled className="btn-secondary text-base opacity-70">Lock discussion (DL only, demo)</button>
        </div>
        <div className="card-body">
          <p className="text-base text-slate-600 mb-4">Delegation members can post last-minute updates. DL locks when position is confirmed.</p>
          <ul className="space-y-3">
            {livePosts.map((p) => (
              <li key={p.id} className="border-l-2 border-slate-200 pl-4">
                <p className="text-slate-800">{p.text}</p>
                <p className="text-sm text-slate-500">{p.author} · {new Date(p.at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
