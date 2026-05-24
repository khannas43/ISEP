'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AgendaItemDto, DashboardSummaryDto, MeetingDto, TaskV1Response } from '@/lib/api';
import {
  getApiUrl,
  getDashboardAIInsights,
  getDashboardPaperPipeline,
  getDashboardSummary,
  getMeetingsPage,
  getMyTasks,
} from '@/lib/api';
import type {
  AgendaItem,
  MeetingDetail,
  MeetingSummary,
  MpiAction,
  MpiDetail,
  MpiStatus,
  MyTask,
  PipelineItem,
} from '../_types/dashboard.types';

function scoreToMpiStatus(score: number): MpiStatus {
  if (score >= 70) return 'GREEN';
  if (score >= 40) return 'AMBER';
  return 'RED';
}

function mapMeetingDtoToSummary(m: MeetingDto, mpi?: { score: number; status: MpiStatus }): MeetingSummary {
  const shortBody = (m.bodyName ?? m.title ?? 'Meeting').trim();
  const code = [m.committeeShortName, m.sessionNumber].filter(Boolean).join(' ') || shortBody.slice(0, 24);
  return {
    id: m.meetingId,
    code: code || 'Meeting',
    name: m.bodyName ?? m.title,
    session: m.sessionNumber ? `${m.sessionNumber}th Session` : 'Session',
    location: m.location ?? 'TBC',
    startDate: m.startDate,
    mpiScore: mpi?.score ?? 50,
    mpiStatus: mpi?.status ?? 'AMBER',
    totalAgendaItems: 0,
    totalTasks: 0,
    openTasks: 0,
  };
}

function buildCriticalActions(summary: DashboardSummaryDto | null, meetingTasks: TaskV1Response[]): MpiAction[] {
  const out: MpiAction[] = [];
  if (summary && summary.criticalAlerts > 0) {
    out.push({
      severity: 'RED',
      text: `${summary.criticalAlerts} high-priority agenda item(s) may need papers or positions.`,
    });
  }
  if (summary && summary.preparedness.score < 50) {
    out.push({
      severity: 'RED',
      text: 'Meeting Preparedness Index is below target — prioritise tasks and papers.',
    });
  }
  const overdue = meetingTasks.filter(
    (t) => t.status !== 'DONE' && (t.isOverdue === true || (t.dueDate != null && new Date(t.dueDate) < new Date()))
  );
  if (overdue.length > 0) {
    out.push({ severity: 'AMBER', text: `${overdue.length} overdue task(s) linked to your work.` });
  }
  if (out.length === 0) {
    out.push({ severity: 'GREEN', text: 'No critical blockers flagged for this meeting.' });
  }
  return out.slice(0, 5);
}

function mapTask(t: TaskV1Response): MyTask {
  const completed = t.status === 'DONE';
  const overdue =
    !completed && (t.isOverdue === true || (t.dueDate != null && new Date(t.dueDate) < new Date()));
  let severity: 'RED' | 'AMBER' | 'GREEN' = 'GREEN';
  if (completed) severity = 'GREEN';
  else if (overdue || t.priority === 'HIGH') severity = 'RED';
  else if (t.priority === 'MEDIUM') severity = 'AMBER';
  return {
    id: t.taskId,
    title: t.title,
    agendaRef: t.meetingTitle ? `${t.meetingTitle}` : 'Task',
    dueDate: t.dueDate ?? '',
    overdue,
    severity,
    completed,
  };
}

function mapPipeline(p: {
  id: string;
  title: string;
  stageName: string;
  stage: number;
  urgent: boolean;
}): PipelineItem {
  const pct = Math.min(100, Math.round((p.stage / 8) * 100));
  let status: MpiStatus = 'AMBER';
  if (p.stage >= 8) status = 'GREEN';
  if (p.urgent) status = 'RED';
  return {
    id: p.id,
    title: p.title,
    currentStage: p.stageName,
    progressPct: pct,
    status,
  };
}

function mapAgenda(ai: AgendaItemDto): AgendaItem {
  let statusSeverity: MpiStatus | 'BLUE' = 'BLUE';
  if (ai.status === 'CLOSED') statusSeverity = 'GREEN';
  else if (ai.priority === 'HIGH') statusSeverity = 'RED';
  else if (ai.priority === 'MEDIUM') statusSeverity = 'AMBER';
  return {
    id: ai.agendaItemId,
    code: ai.itemNumber,
    title: ai.title,
    status: ai.status,
    statusSeverity,
  };
}

async function fetchUpcomingMeetings(accessToken: string): Promise<MeetingDto[]> {
  try {
    const [planned, active] = await Promise.all([
      getMeetingsPage(accessToken, { size: 50, status: 'PLANNED' }),
      getMeetingsPage(accessToken, { size: 50, status: 'ACTIVE' }),
    ]);
    const merged = [...(planned.content ?? []), ...(active.content ?? [])];
    const seen = new Set<string>();
    const unique = merged.filter((m) => {
      if (seen.has(m.meetingId)) return false;
      seen.add(m.meetingId);
      return true;
    });
    return unique.sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? '')).slice(0, 5);
  } catch {
    return [];
  }
}

export function deriveDashboardRole(roles: string[]): string {
  const order = ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER', 'VIEWER'];
  for (const r of order) {
    if (roles.includes(r)) return r;
  }
  return 'MEMBER';
}

export function useDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  const role = useMemo(() => {
    const roles = (session as { roles?: string[] } | null)?.roles ?? [];
    return deriveDashboardRole(roles);
  }, [session]);

  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MeetingDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    if (!accessToken) return;
    setLoadingList(true);
    setError(null);
    try {
      const dtos = await fetchUpcomingMeetings(accessToken);
      if (dtos.length === 0) {
        setMeetings([]);
        setSelectedId(null);
        setDetail(null);
        return;
      }
      const summaries = await Promise.all(
        dtos.map(async (m) => {
          try {
            const dash = await getDashboardSummary(accessToken, m.meetingId, role);
            const score = dash?.preparedness?.score ?? 50;
            const mpiStatus = scoreToMpiStatus(score);
            return mapMeetingDtoToSummary(m, { score, status: mpiStatus });
          } catch {
            return mapMeetingDtoToSummary(m, { score: 50, status: 'AMBER' });
          }
        })
      );
      setMeetings(summaries);
      setSelectedId((prev) => (prev && summaries.some((s) => s.id === prev) ? prev : summaries[0].id));
    } catch {
      setError('Failed to load meetings');
      setMeetings([]);
      setSelectedId(null);
      setDetail(null);
    } finally {
      setLoadingList(false);
    }
  }, [accessToken, role]);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (!accessToken) {
      setLoadingList(false);
      setMeetings([]);
      return;
    }
    void loadList();
  }, [accessToken, sessionStatus, loadList]);

  const fetchDetail = useCallback(
    async (id: string) => {
      if (!accessToken || !id) return;
      setLoadingDetail(true);
      setError(null);
      try {
        const [dash, tasksAll, pipelineDtos, agendaRes, ai] = await Promise.all([
          getDashboardSummary(accessToken, id, role),
          getMyTasks(accessToken),
          getDashboardPaperPipeline(accessToken, id),
          fetch(`${getApiUrl()}/api/v1/meetings/${id}/agenda-items`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: 'no-store',
          }).then(async (r) => (r.ok ? r.json() : [])),
          getDashboardAIInsights(accessToken, id),
        ]);

        const agendaRaw: AgendaItemDto[] = Array.isArray(agendaRes) ? agendaRes : agendaRes?.content ?? [];
        const agendaItems = agendaRaw.slice(0, 5).map(mapAgenda);

        const meetingTasks = tasksAll.filter((t) => t.meetingId === id);
        const myTasks = meetingTasks.slice(0, 8).map(mapTask);

        const pipeline = pipelineDtos.slice(0, 5).map(mapPipeline);

        const fromList = meetings.find((m) => m.id === id);
        const score = dash?.preparedness?.score ?? fromList?.mpiScore ?? 50;
        const mpiStatus = scoreToMpiStatus(score);
        const tasksTotal = dash?.preparedness?.tasksTotal ?? 0;
        const tasksComplete = dash?.preparedness?.tasksComplete ?? 0;
        const openTasks = Math.max(0, tasksTotal - tasksComplete);

        const summary: MeetingSummary = {
          id,
          code: fromList?.code ?? dash?.meeting?.title ?? 'Meeting',
          name: fromList?.name ?? dash?.meeting?.body ?? '',
          session: fromList?.session ?? (dash?.meeting?.session != null ? `${dash.meeting.session}th Session` : 'Session'),
          location: fromList?.location ?? dash?.meeting?.location ?? 'TBC',
          startDate: fromList?.startDate ?? new Date().toISOString(),
          mpiScore: score,
          mpiStatus,
          totalAgendaItems: agendaRaw.length,
          totalTasks: tasksTotal,
          openTasks,
        };

        const mpi: MpiDetail = {
          meetingId: id,
          score,
          status: mpiStatus,
          criticalActions: buildCriticalActions(dash, meetingTasks),
          projection:
            ai?.preparednessProjection ??
            `At current trajectory, MPI is ${score}/100 (${score >= 70 ? 'on track' : 'needs focus'}).`,
        };

        setDetail({ summary, mpi, myTasks, pipeline, agendaItems });
      } catch {
        setError('Failed to load meeting detail');
        setDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    },
    [accessToken, meetings, role]
  );

  useEffect(() => {
    if (selectedId && meetings.length > 0) void fetchDetail(selectedId);
  }, [selectedId, meetings, fetchDetail]);

  const refetch = useCallback(() => {
    void loadList();
    if (selectedId) void fetchDetail(selectedId);
  }, [loadList, selectedId, fetchDetail]);

  return {
    meetings,
    selectedId,
    setSelectedId,
    detail,
    loadingList,
    loadingDetail,
    error,
    refetch,
    role,
  };
}
