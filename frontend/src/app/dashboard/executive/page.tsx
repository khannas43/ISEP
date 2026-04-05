/**
 * Executive Dashboard — summarized view (no meetingId) or per-meeting preparedness view (with meetingId).
 * Summary: meetings (In progress / Upcoming / Archived), papers by stage, task counts, insights.
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { getMeetingsPage, getPapers, getDashboardPendingActions, type MeetingDto } from '@/lib/api';
import { ISEPExecutiveDashboard } from '../ISEPExecutiveDashboard';
import { ExecutiveDashboardSummary } from './ExecutiveDashboardSummary';

type Props = { searchParams: Promise<{ meetingId?: string }> };

function groupMeetings(meetings: MeetingDto[]): { inProgress: MeetingDto[]; upcoming: MeetingDto[]; archived: MeetingDto[] } {
  const today = new Date().toISOString().slice(0, 10);
  const inProgress: MeetingDto[] = [];
  const upcoming: MeetingDto[] = [];
  const archived: MeetingDto[] = [];

  for (const m of meetings) {
    const start = m.startDate?.slice(0, 10) ?? '';
    const end = m.endDate?.slice(0, 10) ?? '';
    const isActive = m.status === 'ACTIVE';
    const inRange = start && end && start <= today && today <= end;
    const notEnded = end >= today;

    if (end < today) archived.push(m);
    else if ((isActive || inRange) && notEnded) inProgress.push(m);
    else upcoming.push(m);
  }

  inProgress.sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''));
  upcoming.sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''));
  archived.sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''));

  return { inProgress, upcoming, archived };
}

export default async function ExecutiveDashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  const params = await searchParams;
  const meetingId = params.meetingId?.trim();
  const accessToken = (session as { accessToken?: string }).accessToken;
  const roles = (session as { roles?: string[] }).roles ?? [];
  const role = roles.includes('SYSTEM_ADMIN')
    ? 'DG'
    : roles.includes('IC_DIVISION_HEAD')
      ? 'IC_DIVISION_HEAD'
      : roles.includes('DELEGATION_LEADER')
        ? 'DELEGATION_LEADER'
        : roles.includes('COORDINATOR')
          ? 'COORDINATOR'
          : roles.includes('MEMBER')
            ? 'MEMBER'
            : 'VIEWER';

  const primaryRealmRole = roles.includes('SYSTEM_ADMIN')
    ? 'SYSTEM_ADMIN'
    : roles.includes('IC_DIVISION_HEAD')
      ? 'IC_DIVISION_HEAD'
      : roles.includes('DELEGATION_LEADER')
        ? 'DELEGATION_LEADER'
        : roles.includes('COORDINATOR')
          ? 'COORDINATOR'
          : roles.includes('MEMBER')
            ? 'MEMBER'
            : 'VIEWER';

  if (!accessToken) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <p className="text-slate-600">Session expired or not authenticated. Please log in again.</p>
        <Link href="/dashboard/executive" className="mt-4 inline-block text-blue-600 font-medium">← Back to Dashboard</Link>
      </div>
    );
  }

  if (!meetingId) {
    let inProgress: MeetingDto[] = [];
    let upcoming: MeetingDto[] = [];
    let archived: MeetingDto[] = [];
    let papersByStage = { draft: 0, inReview: 0, finalized: 0 };
    let taskCounts = { overdue: 0, dueSoon: 0, myPending: 0 };
    const insights: string[] = [];

    try {
      const [page, papers, actions] = await Promise.all([
        getMeetingsPage(accessToken, { size: 200 }),
        getPapers(accessToken),
        getDashboardPendingActions(accessToken, role),
      ]);
      const meetings = page.content ?? [];
      const grouped = groupMeetings(meetings);
      inProgress = grouped.inProgress;
      upcoming = grouped.upcoming;
      archived = grouped.archived;

      for (const p of papers) {
        const s = (p.status ?? '').toUpperCase();
        if (s === 'DRAFT') papersByStage.draft++;
        else if (s === 'FINALIZED') papersByStage.finalized++;
        else papersByStage.inReview++;
      }

      const overdue = actions.filter((a) => a.type === 'TASK_OVERDUE' || (a.dueDate && a.dueDate.toLowerCase() === 'overdue')).length;
      taskCounts = {
        overdue,
        dueSoon: Math.max(0, actions.length - overdue),
        myPending: actions.length,
      };

      if (inProgress.length > 0) insights.push(`${inProgress.length} meeting${inProgress.length !== 1 ? 's' : ''} in progress.`);
      if (upcoming.length > 0) insights.push(`${upcoming.length} upcoming meeting${upcoming.length !== 1 ? 's' : ''}.`);
      if (papersByStage.inReview > 0) insights.push(`${papersByStage.inReview} paper${papersByStage.inReview !== 1 ? 's' : ''} in review / awaiting approval.`);
      if (taskCounts.overdue > 0) insights.push(`${taskCounts.overdue} overdue action${taskCounts.overdue !== 1 ? 's' : ''} — review tasks.`);
      if (insights.length === 0) insights.push('No meetings in progress. Add or open a meeting for detailed preparedness.');
    } catch (err) {
      console.error('[Dashboard] Failed to load summary (check API_URL and frontend→nginx→Kong).', err);
      insights.push('Unable to load summary. Check your connection and try again.');
    }

    const meetingsForDetail = [...inProgress, ...upcoming].slice(0, 20);

    const userId = (session.user as { id?: string }).id ?? '';
    const userDisplayName = session.user?.name ?? session.user?.email ?? 'User';
    const userRoleLabel = primaryRealmRole.replace(/_/g, ' ');

    return (
      <ExecutiveDashboardSummary
        inProgress={inProgress}
        upcoming={upcoming}
        archived={archived}
        papersByStage={papersByStage}
        taskCounts={taskCounts}
        insights={insights}
        meetingsForDetail={meetingsForDetail}
        accessToken={accessToken}
        primaryRealmRole={primaryRealmRole}
        currentUserId={userId}
        userDisplayName={userDisplayName}
        userRoleLabel={userRoleLabel}
      />
    );
  }

  return (
    <div className="m-0 p-0 w-full">
      <ISEPExecutiveDashboard meetingId={meetingId} accessToken={accessToken} initialRole={role} />
    </div>
  );
}
