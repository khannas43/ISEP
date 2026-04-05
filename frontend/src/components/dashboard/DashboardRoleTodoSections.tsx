'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getMyTasks,
  getTeamTasks,
  getPapers,
  type TaskV1Response,
  type PaperListItem,
} from '@/lib/api';

type Props = {
  accessToken: string;
  /** Single primary realm role for dashboard sections */
  realmRole: string;
  currentUserId: string;
};

function priorityClass(p: string): string {
  const u = (p || '').toUpperCase();
  if (u === 'HIGH') return 'bg-red-100 text-red-800';
  if (u === 'MEDIUM') return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-700';
}

export function DashboardRoleTodoSections({ accessToken, realmRole, currentUserId }: Props) {
  const [myPending, setMyPending] = useState<TaskV1Response[]>([]);
  const [awaitingPapers, setAwaitingPapers] = useState<PaperListItem[]>([]);
  const [teamTasks, setTeamTasks] = useState<TaskV1Response[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        if (realmRole === 'MEMBER') {
          const rows = await getMyTasks(accessToken, { status: 'PENDING,ESCALATED' });
          if (!cancelled) setMyPending(rows.slice(0, 5));
        } else if (realmRole === 'DELEGATION_LEADER') {
          const [papers, team] = await Promise.all([
            getPapers(accessToken, { awaitingMyApproval: true }),
            getTeamTasks(accessToken),
          ]);
          if (!cancelled) {
            setAwaitingPapers(papers.slice(0, 8));
            setTeamTasks(team);
          }
        } else if (realmRole === 'COORDINATOR') {
          const team = await getTeamTasks(accessToken);
          if (!cancelled) setTeamTasks(team);
        }
      } catch {
        if (!cancelled) {
          setMyPending([]);
          setAwaitingPapers([]);
          setTeamTasks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [accessToken, realmRole]);

  if (realmRole !== 'MEMBER' && realmRole !== 'DELEGATION_LEADER' && realmRole !== 'COORDINATOR') {
    return null;
  }

  const teamHotCount = teamTasks.filter(
    (t) =>
      (t.status && ['ESCALATED', 'OVERDUE'].includes(t.status.toUpperCase())) || t.isOverdue === true
  ).length;

  const myAssignedPendingCount = teamTasks.filter(
    (t) =>
      t.createdBy === currentUserId &&
      t.status &&
      ['PENDING', 'IN_PROGRESS', 'ESCALATED'].includes(t.status.toUpperCase())
  ).length;

  return (
    <div className="space-y-6 mb-8">
      {realmRole === 'MEMBER' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-slate-900">My pending tasks</h2>
            <Link href="/tasks/my" className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Loading tasks…</p>
          ) : myPending.length === 0 ? (
            <p className="text-sm text-slate-500">No pending or escalated tasks.</p>
          ) : (
            <ul className="space-y-3">
              {myPending.map((t) => (
                <li key={t.taskId}>
                  <Link
                    href={`/tasks/${t.taskId}`}
                    className="block rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-slate-900">{t.title}</span>
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${priorityClass(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {t.meetingTitle || 'Meeting'}
                      {t.dueDate && ` · Due ${new Date(t.dueDate).toLocaleDateString()}`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {realmRole === 'DELEGATION_LEADER' && (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Pending approvals</h2>
              <Link href="/papers" className="text-sm font-medium text-blue-600 hover:underline">
                Papers
              </Link>
            </div>
            {loading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : awaitingPapers.length === 0 ? (
              <p className="text-sm text-slate-500">No papers awaiting your stage.</p>
            ) : (
              <ul className="space-y-2">
                {awaitingPapers.map((p) => (
                  <li key={p.paperId}>
                    <Link
                      href={`/papers/${p.paperId}/approval`}
                      className="block rounded-lg border border-slate-100 px-3 py-2 font-medium text-slate-800 hover:bg-slate-50"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Team tasks (escalated / overdue)</h2>
              <span
                className={`min-w-[2rem] rounded-full px-2 py-0.5 text-center text-sm font-bold ${
                  teamHotCount > 0 ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {teamHotCount}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Tasks in your meetings that are escalated or past due.{' '}
              <Link href="/tasks/team" className="font-medium text-blue-600 hover:underline">
                Open team tasks
              </Link>
            </p>
          </section>
        </>
      )}

      {realmRole === 'COORDINATOR' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Tasks assigned by me</h2>
          <p className="text-sm text-slate-600">
            <span className="text-2xl font-bold text-slate-900">{myAssignedPendingCount}</span>
            <span className="ml-2">open tasks you created (pending, in progress, or escalated).</span>
          </p>
          <Link href="/tasks/team" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
            Manage team tasks →
          </Link>
        </section>
      )}
    </div>
  );
}
