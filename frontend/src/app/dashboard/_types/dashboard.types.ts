export type MpiStatus = 'GREEN' | 'AMBER' | 'RED';

export interface MeetingSummary {
  id: string;
  code: string;
  name: string;
  session: string;
  location: string;
  startDate: string;
  mpiScore: number;
  mpiStatus: MpiStatus;
  totalAgendaItems: number;
  totalTasks: number;
  openTasks: number;
}

export interface MpiAction {
  severity: 'RED' | 'AMBER' | 'GREEN';
  text: string;
}

export interface MpiDetail {
  meetingId: string;
  score: number;
  status: MpiStatus;
  criticalActions: MpiAction[];
  projection: string;
}

export interface MyTask {
  id: string;
  title: string;
  agendaRef: string;
  dueDate: string;
  overdue: boolean;
  severity: 'RED' | 'AMBER' | 'GREEN';
  completed?: boolean;
}

export interface PipelineItem {
  id: string;
  title: string;
  currentStage: string;
  progressPct: number;
  status: MpiStatus;
}

export interface AgendaItem {
  id: string;
  code: string;
  title: string;
  status: string;
  statusSeverity: MpiStatus | 'BLUE';
}

export interface MeetingDetail {
  summary: MeetingSummary;
  mpi: MpiDetail;
  myTasks: MyTask[];
  pipeline: PipelineItem[];
  agendaItems: AgendaItem[];
}
