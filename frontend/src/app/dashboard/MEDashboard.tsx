import Link from 'next/link';

type TaskSummary = { id: string; title: string; dueDate: string | null; status: string };
type AgendaItemSummary = { meetingId: string; itemId: string; title: string };
type DocSummary = { id: string; title: string };

type Props = {
  userName: string;
  myTasksOverdue: TaskSummary[];
  myTasksDueSoon: TaskSummary[];
  agendaItemsForFeedback: AgendaItemSummary[];
  coDraftPapers: { id: string; title: string }[];
  recentDocs: DocSummary[];
  deadlinesCount: number;
};

/**
 * SCR-DASH-05 — Member Dashboard.
 */
export function MEDashboard({
  userName,
  myTasksOverdue,
  myTasksDueSoon,
  agendaItemsForFeedback,
  coDraftPapers,
  recentDocs,
  deadlinesCount,
}: Props) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Member Dashboard</h1>
          <p className="page-subtitle">Welcome back, {userName}. Your tasks, feedback due, and deadlines.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Overdue tasks</h3>
            <p className="mt-1 text-3xl font-semibold text-red-600">{myTasksOverdue.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Due soon</h3>
            <p className="mt-1 text-3xl font-semibold text-amber-600">{myTasksDueSoon.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Agenda items for feedback</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{agendaItemsForFeedback.length}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-base font-medium text-slate-500">Upcoming deadlines</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{deadlinesCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">My tasks</h2>
            <Link href="/tasks" className="text-base font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="card-body">
            {myTasksOverdue.length > 0 && (
              <>
                <p className="text-sm font-medium text-slate-500 uppercase">Overdue</p>
                <ul className="mt-2 space-y-2">
                  {myTasksOverdue.slice(0, 3).map((t) => (
                    <li key={t.id}>
                      <Link href={`/tasks/${t.id}`} className="block rounded-lg border border-red-100 bg-red-50/50 px-3 py-2 font-medium text-slate-800 hover:bg-red-50">
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {myTasksDueSoon.length > 0 && (
              <>
                <p className="mt-4 text-sm font-medium text-slate-500 uppercase">Due soon</p>
                <ul className="mt-2 space-y-2">
                  {myTasksDueSoon.slice(0, 3).map((t) => (
                    <li key={t.id}>
                      <Link href={`/tasks/${t.id}`} className="block rounded-lg border border-slate-100 px-3 py-2 font-medium text-slate-800 hover:bg-slate-50">
                        {t.title} — {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {myTasksOverdue.length === 0 && myTasksDueSoon.length === 0 && (
              <p className="text-base text-slate-500">No tasks due. Check back later.</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Agenda items for my feedback</h2>
            <Link href="/meetings" className="text-base font-medium text-blue-600 hover:underline">Meetings</Link>
          </div>
          <div className="card-body">
            {agendaItemsForFeedback.length === 0 ? (
              <p className="text-base text-slate-500">No agenda items pending your feedback.</p>
            ) : (
              <ul className="space-y-2">
                {agendaItemsForFeedback.slice(0, 5).map((a) => (
                  <li key={`${a.meetingId}-${a.itemId}`}>
                    <Link href={`/meetings/${a.meetingId}/agenda/${a.itemId}/feedback/submit`} className="block rounded-lg border border-slate-100 px-3 py-2 font-medium text-slate-800 hover:bg-slate-50">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Co-draft papers</h2>
            <Link href="/papers" className="text-base font-medium text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="card-body">
            {coDraftPapers.length === 0 ? (
              <p className="text-base text-slate-500">No papers you are co-drafting.</p>
            ) : (
              <ul className="space-y-2">
                {coDraftPapers.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    <Link href={`/papers/${p.id}/draft`} className="block rounded-lg border border-slate-100 px-3 py-2 font-medium text-slate-800 hover:bg-slate-50">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent documents</h2>
            <Link href="/documents" className="text-base font-medium text-blue-600 hover:underline">Library</Link>
          </div>
          <div className="card-body">
            {recentDocs.length === 0 ? (
              <p className="text-base text-slate-500">No recent documents.</p>
            ) : (
              <ul className="space-y-2">
                {recentDocs.slice(0, 3).map((d) => (
                  <li key={d.id}>
                    <Link href={`/documents/${d.id}`} className="block rounded-lg border border-slate-100 px-3 py-2 text-slate-800 hover:bg-slate-50">
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
