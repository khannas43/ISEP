/**
 * Central mock data for ISEP frontend demo.
 * Use when API is unavailable or for demonstrating full workflows.
 * Types align with @/lib/api (BodyDto, MeetingDto, AgendaItemDto, etc.).
 */

import type {
  BodyDto,
  MeetingDto,
  AgendaItemDto,
  DocumentDto,
  TaskDto,
  CorrespondenceGroupDto,
  UserDto,
  MeetingParticipantDto,
  MeetingStatusHistoryEntry,
} from '@/lib/api';

// ─── IDs (stable for demo) ─────────────────────────────────────────────────
export const MOCK_MEETING_ID = '5c97d67f-76f8-464b-9bf5-ae98f5752095';
export const MOCK_BODY_ID = 'b1';
export const MOCK_AGENDA_ITEM_ID = 'a1';
export const MOCK_DOCUMENT_ID = 'd1';
export const MOCK_TASK_ID = 't1';
export const MOCK_PAPER_ID = 'p1';
export const MOCK_CG_ID = 'cg1';
export const MOCK_USER_IDS = ['u1', 'u2', 'u3', 'u4', 'u5'] as const;

// ─── Bodies ─────────────────────────────────────────────────────────────────
export const mockBodies: BodyDto[] = [
  {
    bodyId: MOCK_BODY_ID,
    parentBodyId: null,
    parentBodyName: null,
    name: 'Maritime Safety Committee (MSC)',
    abbreviation: 'MSC',
    bodyType: 'COMMITTEE',
    description: 'IMO Maritime Safety Committee',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    bodyId: 'b2',
    parentBodyId: null,
    parentBodyName: null,
    name: 'Marine Environment Protection Committee (MEPC)',
    abbreviation: 'MEPC',
    bodyType: 'COMMITTEE',
    description: 'IMO Marine Environment Protection Committee',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ─── Meetings ──────────────────────────────────────────────────────────────
export const mockMeetings: MeetingDto[] = [
  {
    meetingId: MOCK_MEETING_ID,
    bodyId: MOCK_BODY_ID,
    bodyName: 'Maritime Safety Committee (MSC)',
    sessionNumber: '108',
    title: 'MSC 108 Session',
    startDate: '2025-05-12',
    endDate: '2025-05-16',
    location: 'IMO HQ, London',
    meetingType: 'IN_PERSON',
    status: 'ACTIVE',
    notes: 'Session covering safety standards and amendments.',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    meetingId: 'm2',
    bodyId: 'b2',
    bodyName: 'Marine Environment Protection Committee (MEPC)',
    sessionNumber: '82',
    title: 'MEPC 82 Session',
    startDate: '2025-09-22',
    endDate: '2025-09-26',
    location: 'IMO HQ, London',
    meetingType: 'HYBRID',
    status: 'PLANNED',
    notes: 'Focus on GHG strategy and fuel standards.',
    createdAt: '2025-02-01T10:00:00Z',
  },
];

// ─── Agenda items ──────────────────────────────────────────────────────────
export const mockAgendaItems: AgendaItemDto[] = [
  {
    agendaItemId: MOCK_AGENDA_ITEM_ID,
    meetingId: MOCK_MEETING_ID,
    itemNumber: '5',
    title: 'Implementation of the Strategic Plan',
    description: 'Review of progress on the implementation of the IMO Strategic Plan.',
    category: 'DISCUSSION',
    priority: 'HIGH',
    status: 'ACTIVE',
    deadlineForInputs: '2025-04-30',
    assignedCoordinatorId: 'u2',
    assignedCoordinatorName: 'Coordinator One',
    inputsReceivedCount: 3,
  },
  {
    agendaItemId: 'a2',
    meetingId: MOCK_MEETING_ID,
    itemNumber: '7',
    title: 'Goal-based standards',
    description: 'Matters related to goal-based new ship construction standards.',
    category: 'DECISION',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    deadlineForInputs: '2025-05-01',
    assignedCoordinatorId: 'u2',
    assignedCoordinatorName: 'Coordinator One',
    inputsReceivedCount: 2,
  },
];

// ─── Documents ─────────────────────────────────────────────────────────────
export const mockDocuments: DocumentDto[] = [
  {
    documentId: MOCK_DOCUMENT_ID,
    meetingId: MOCK_MEETING_ID,
    agendaItemId: MOCK_AGENDA_ITEM_ID,
    documentType: 'WORKING_DOCUMENT',
    title: 'MSC 108/5 - Strategic Plan implementation',
    source: 'IMO_SECRETARIAT',
    fileName: 'msc108-5.pdf',
    fileSizeBytes: 256000,
    mimeType: 'application/pdf',
    currentVersion: 2,
    status: 'FINAL',
    uploadedByName: 'Secretariat',
    uploadedAt: '2025-04-10T14:00:00Z',
  },
  {
    documentId: 'd2',
    meetingId: MOCK_MEETING_ID,
    agendaItemId: null,
    documentType: 'AGENDA_PAPER',
    title: 'Provisional agenda MSC 108',
    source: 'IMO_SECRETARIAT',
    fileName: 'msc108-agenda.pdf',
    fileSizeBytes: 120000,
    mimeType: 'application/pdf',
    currentVersion: 1,
    status: 'FINAL',
    uploadedByName: 'Secretariat',
    uploadedAt: '2025-03-01T09:00:00Z',
  },
];

// ─── Tasks ──────────────────────────────────────────────────────────────────
export const mockTasks: TaskDto[] = [
  {
    taskId: MOCK_TASK_ID,
    meetingId: MOCK_MEETING_ID,
    title: 'Prepare consolidated position on agenda item 5',
    description: 'Consolidate member inputs and draft India position paper.',
    assignedToId: 'u2',
    assignedToName: 'Coordinator One',
    priority: 'HIGH',
    dueDate: '2025-04-25',
    status: 'IN_PROGRESS',
  },
  {
    taskId: 't2',
    meetingId: MOCK_MEETING_ID,
    title: 'Submit feedback on agenda item 5',
    description: 'Submit structured feedback (position, comments, amendments).',
    assignedToId: 'u3',
    assignedToName: 'Member One',
    priority: 'HIGH',
    dueDate: '2025-04-20',
    status: 'COMPLETED',
  },
  {
    taskId: 't3',
    meetingId: null,
    title: 'Review CG submission draft',
    description: 'Review correspondence group submission before deadline.',
    assignedToId: 'u4',
    assignedToName: 'Member Two',
    priority: 'MEDIUM',
    dueDate: '2025-05-05',
    status: 'PENDING',
  },
];

// ─── Papers (approval workflow) ─────────────────────────────────────────────
export type MockPaper = {
  paperId: string;
  title: string;
  meetingId: string;
  meetingTitle: string;
  agendaItemId: string;
  agendaItemTitle: string;
  status: 'DRAFT' | 'IN_APPROVAL' | 'FINALIZED' | 'REJECTED';
  currentStage: string;
  submittedAt: string | null;
  lastUpdated: string;
  approvalStages: { stage: string; approver: string; action: 'PENDING' | 'APPROVED' | 'REJECTED'; at: string | null }[];
};

export const mockPapers: MockPaper[] = [
  {
    paperId: MOCK_PAPER_ID,
    title: 'India position on Strategic Plan implementation (Agenda item 5)',
    meetingId: MOCK_MEETING_ID,
    meetingTitle: 'MSC 108 Session',
    agendaItemId: MOCK_AGENDA_ITEM_ID,
    agendaItemTitle: 'Implementation of the Strategic Plan',
    status: 'IN_APPROVAL',
    currentStage: 'Delegation Leader',
    submittedAt: '2025-04-22T10:00:00Z',
    lastUpdated: '2025-04-23T14:00:00Z',
    approvalStages: [
      { stage: 'Member', approver: 'Member One', action: 'APPROVED', at: '2025-04-22T11:00:00Z' },
      { stage: 'Group Leader', approver: 'Coordinator One', action: 'APPROVED', at: '2025-04-22T15:00:00Z' },
      { stage: 'Delegation Leader', approver: 'Delegation Leader', action: 'PENDING', at: null },
      { stage: 'IC Division', approver: '—', action: 'PENDING', at: null },
      { stage: 'DG / MoPSW', approver: '—', action: 'PENDING', at: null },
    ],
  },
];

// ─── Feedback (member inputs per agenda item) ───────────────────────────────
export type MockFeedbackEntry = {
  userId: string;
  userName: string;
  position: 'SUPPORT' | 'OBJECT' | 'NEUTRAL' | 'ABSTAIN';
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt: string | null;
  comments: string;
  amendments: string;
};

export const mockFeedbackForAgendaItem: MockFeedbackEntry[] = [
  {
    userId: 'u3',
    userName: 'Member One',
    position: 'SUPPORT',
    status: 'SUBMITTED',
    submittedAt: '2025-04-18T12:00:00Z',
    comments: 'India should support the proposed timeline with minor clarifications on capacity-building.',
    amendments: 'Add reference to regional workshops in paragraph 3.',
  },
  {
    userId: 'u4',
    userName: 'Member Two',
    position: 'SUPPORT',
    status: 'SUBMITTED',
    submittedAt: '2025-04-19T09:00:00Z',
    comments: 'Align with Member One; suggest stronger language on technical cooperation.',
    amendments: '',
  },
  {
    userId: 'u5',
    userName: 'Member Three',
    position: 'NEUTRAL',
    status: 'DRAFT',
    submittedAt: null,
    comments: 'Draft comments not yet submitted.',
    amendments: '',
  },
];

// ─── Deliberation notes ─────────────────────────────────────────────────────
export type MockDeliberationNote = {
  noteId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export const mockDeliberationNotes: MockDeliberationNote[] = [
  {
    noteId: 'n1',
    authorId: 'u2',
    authorName: 'Coordinator One',
    content: 'Internal discussion: prefer supporting the secretariat timeline. DL to confirm.',
    createdAt: '2025-04-20T11:00:00Z',
  },
  {
    noteId: 'n2',
    authorId: 'u1',
    authorName: 'Delegation Leader',
    content: 'Confirmed. Proceed with consolidated position as Support with amendments as drafted.',
    createdAt: '2025-04-21T14:00:00Z',
  },
];

// ─── Comments (document / agenda item) ──────────────────────────────────────
export type MockComment = {
  commentId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
  parentId: string | null;
  visibility: 'INTERNAL' | 'DELEGATION';
};

export const mockComments: MockComment[] = [
  {
    commentId: 'c1',
    authorId: 'u3',
    authorName: 'Member One',
    content: 'Paragraph 2 needs alignment with our submission on capacity-building.',
    createdAt: '2025-04-17T10:00:00Z',
    editedAt: null,
    parentId: null,
    visibility: 'DELEGATION',
  },
  {
    commentId: 'c2',
    authorId: 'u2',
    authorName: 'Coordinator One',
    content: 'Agreed. I will incorporate in the consolidation.',
    createdAt: '2025-04-17T11:30:00Z',
    editedAt: null,
    parentId: 'c1',
    visibility: 'DELEGATION',
  },
];

// ─── Users ──────────────────────────────────────────────────────────────────
export const mockUsers: UserDto[] = [
  {
    userId: 'u1',
    keycloakId: 'kc1',
    email: 'dl@dgs.gov.in',
    fullName: 'Delegation Leader',
    designation: 'Director',
    organization: 'DGS',
    phone: null,
    systemRole: 'DELEGATION_LEADER',
    isActive: true,
    lastLoginAt: '2025-04-23T08:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-04-23T08:00:00Z',
  },
  {
    userId: 'u2',
    keycloakId: 'kc2',
    email: 'coord@dgs.gov.in',
    fullName: 'Coordinator One',
    designation: 'Deputy Director',
    organization: 'DGS',
    phone: null,
    systemRole: 'COORDINATOR',
    isActive: true,
    lastLoginAt: '2025-04-23T09:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-04-23T09:00:00Z',
  },
  {
    userId: 'u3',
    keycloakId: 'kc3',
    email: 'member1@dgs.gov.in',
    fullName: 'Member One',
    designation: 'Assistant Director',
    organization: 'DGS',
    phone: null,
    systemRole: 'MEMBER',
    isActive: true,
    lastLoginAt: '2025-04-22T16:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-04-22T16:00:00Z',
  },
  {
    userId: 'u4',
    keycloakId: 'kc4',
    email: 'member2@dgs.gov.in',
    fullName: 'Member Two',
    designation: 'Technical Officer',
    organization: 'DGS',
    phone: null,
    systemRole: 'MEMBER',
    isActive: true,
    lastLoginAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    userId: 'u5',
    keycloakId: 'kc5',
    email: 'viewer@dgs.gov.in',
    fullName: 'Viewer One',
    designation: 'Observer',
    organization: 'MMD',
    phone: null,
    systemRole: 'VIEWER',
    isActive: true,
    lastLoginAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ─── Meeting participants ──────────────────────────────────────────────────
export const mockParticipants: MeetingParticipantDto[] = [
  { participantId: 'p1', meetingId: MOCK_MEETING_ID, userId: 'u1', email: 'dl@dgs.gov.in', name: 'Delegation Leader', designation: 'Director', organization: 'DGS', meetingRole: 'DELEGATION_LEADER', assignedAt: '2025-01-10T00:00:00Z' },
  { participantId: 'p2', meetingId: MOCK_MEETING_ID, userId: 'u2', email: 'coord@dgs.gov.in', name: 'Coordinator One', designation: 'Deputy Director', organization: 'DGS', meetingRole: 'MEMBER', assignedAt: '2025-01-10T00:00:00Z' },
  { participantId: 'p3', meetingId: MOCK_MEETING_ID, userId: 'u3', email: 'member1@dgs.gov.in', name: 'Member One', designation: 'Assistant Director', organization: 'DGS', meetingRole: 'MEMBER', assignedAt: '2025-01-10T00:00:00Z' },
  { participantId: 'p4', meetingId: MOCK_MEETING_ID, userId: 'u4', email: 'member2@dgs.gov.in', name: 'Member Two', designation: 'Technical Officer', organization: 'DGS', meetingRole: 'MEMBER', assignedAt: '2025-01-12T00:00:00Z' },
  { participantId: 'p5', meetingId: MOCK_MEETING_ID, userId: 'u5', email: 'viewer@dgs.gov.in', name: 'Viewer One', designation: 'Observer', organization: 'MMD', meetingRole: 'OBSERVER', assignedAt: '2025-01-15T00:00:00Z' },
];

// ─── Meeting status history ────────────────────────────────────────────────
export const mockStatusHistory: MeetingStatusHistoryEntry[] = [
  { entryId: 'h1', meetingId: MOCK_MEETING_ID, fromStatus: 'PLANNED', toStatus: 'ACTIVE', changedBy: 'u2', changedByName: 'Coordinator One', changedAt: '2025-05-12T09:00:00Z', notes: 'Session started.' },
  { entryId: 'h2', meetingId: MOCK_MEETING_ID, fromStatus: 'DRAFT', toStatus: 'PLANNED', changedBy: 'u2', changedByName: 'Coordinator One', changedAt: '2025-03-01T10:00:00Z', notes: null },
];

// ─── Correspondence groups ─────────────────────────────────────────────────
export const mockCorrespondenceGroups: CorrespondenceGroupDto[] = [
  {
    cgId: 'cg1',
    parentBodyId: MOCK_BODY_ID,
    parentBodyName: 'Maritime Safety Committee (MSC)',
    name: 'CG on Goal-based standards',
    mandate: 'Correspondence group on GBS verification guidelines.',
    indiaLeadId: 'u2',
    indiaLeadName: 'Coordinator One',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    status: 'ACTIVE',
    imsoReference: 'MSC 107/5',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    cgId: 'cg2',
    parentBodyId: MOCK_BODY_ID,
    parentBodyName: 'Maritime Safety Committee (MSC)',
    name: 'CG on Maritime Autonomous Surface Ships (MASS)',
    mandate: 'Development of a goal-based instrument for MASS.',
    indiaLeadId: 'u1',
    indiaLeadName: 'Delegation Leader',
    startDate: '2024-09-01',
    endDate: '2025-12-31',
    status: 'ACTIVE',
    imsoReference: 'MSC 108/5',
    createdAt: '2024-08-20T09:00:00Z',
  },
  {
    cgId: 'cg3',
    parentBodyId: 'b2',
    parentBodyName: 'Marine Environment Protection Committee (MEPC)',
    name: 'CG on Carbon Intensity Indicator (CII) guidelines',
    mandate: 'Correspondence group on CII correction factors and guidelines.',
    indiaLeadId: 'u2',
    indiaLeadName: 'Coordinator One',
    startDate: '2025-02-01',
    endDate: '2025-07-31',
    status: 'ACTIVE',
    imsoReference: 'MEPC 81/5',
    createdAt: '2025-01-10T14:00:00Z',
  },
  {
    cgId: 'cg4',
    parentBodyId: 'b2',
    parentBodyName: 'Marine Environment Protection Committee (MEPC)',
    name: 'CG on Life Cycle Assessment of marine fuels',
    mandate: 'Draft guidelines on LCA methodology for marine fuels.',
    indiaLeadId: 'u3',
    indiaLeadName: 'Member One',
    startDate: '2024-11-01',
    endDate: '2025-06-30',
    status: 'ACTIVE',
    imsoReference: 'MEPC 80/5',
    createdAt: '2024-10-15T11:00:00Z',
  },
  {
    cgId: 'cg5',
    parentBodyId: MOCK_BODY_ID,
    parentBodyName: 'Maritime Safety Committee (MSC)',
    name: 'CG on Safety objectives for SOLAS chapter II-1',
    mandate: 'Review of safety objectives and functional requirements.',
    indiaLeadId: 'u1',
    indiaLeadName: 'Delegation Leader',
    startDate: '2024-07-01',
    endDate: '2025-03-31',
    status: 'CONCLUDED',
    imsoReference: 'MSC 107/5',
    createdAt: '2024-06-01T10:00:00Z',
  },
  {
    cgId: 'cg6',
    parentBodyId: 'b2',
    parentBodyName: 'Marine Environment Protection Committee (MEPC)',
    name: 'CG on Mid-term measures (e.g. GHG levy)',
    mandate: 'Development of mid-term measures to reduce GHG emissions.',
    indiaLeadId: 'u2',
    indiaLeadName: 'Coordinator One',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'ACTIVE',
    imsoReference: 'MEPC 81/5',
    createdAt: '2024-12-01T08:00:00Z',
  },
  {
    cgId: 'cg7',
    parentBodyId: MOCK_BODY_ID,
    parentBodyName: 'Maritime Safety Committee (MSC)',
    name: 'CG on Revised STCW training provisions',
    mandate: 'Correspondence group on STCW Manila amendments implementation.',
    indiaLeadId: 'u4',
    indiaLeadName: 'Member Two',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    status: 'CONCLUDED',
    imsoReference: 'MSC 106/5',
    createdAt: '2024-02-15T12:00:00Z',
  },
  {
    cgId: 'cg8',
    parentBodyId: MOCK_BODY_ID,
    parentBodyName: 'Maritime Safety Committee (MSC)',
    name: 'CG on Polar Code operational guidance',
    mandate: 'Development of guidance for operations in polar waters.',
    indiaLeadId: 'u3',
    indiaLeadName: 'Member One',
    startDate: '2025-03-01',
    endDate: '2025-09-30',
    status: 'ACTIVE',
    imsoReference: 'MSC 108/5',
    createdAt: '2025-02-20T09:30:00Z',
  },
  {
    cgId: 'cg9',
    parentBodyId: 'b2',
    parentBodyName: 'Marine Environment Protection Committee (MEPC)',
    name: 'CG on Ballast water record-keeping',
    mandate: 'Simplification of BWM record-keeping and reporting.',
    indiaLeadId: 'u1',
    indiaLeadName: 'Delegation Leader',
    startDate: '2024-06-01',
    endDate: '2025-02-28',
    status: 'ACTIVE',
    imsoReference: 'MEPC 80/5',
    createdAt: '2024-05-10T16:00:00Z',
  },
  {
    cgId: 'cg10',
    parentBodyId: MOCK_BODY_ID,
    parentBodyName: 'Maritime Safety Committee (MSC)',
    name: 'CG on Fire safety of ro-ro spaces',
    mandate: 'Review of fire safety provisions for ro-ro passenger ships.',
    indiaLeadId: 'u2',
    indiaLeadName: 'Coordinator One',
    startDate: '2024-01-15',
    endDate: '2024-11-30',
    status: 'CONCLUDED',
    imsoReference: 'MSC 106/5',
    createdAt: '2024-01-05T10:00:00Z',
  },
  {
    cgId: 'cg11',
    parentBodyId: 'b2',
    parentBodyName: 'Marine Environment Protection Committee (MEPC)',
    name: 'CG on Regional reception facilities plan',
    mandate: 'Guidance for development of regional reception facility plans.',
    indiaLeadId: 'u4',
    indiaLeadName: 'Member Two',
    startDate: '2025-04-01',
    endDate: '2025-10-31',
    status: 'ACTIVE',
    imsoReference: 'MEPC 82/5',
    createdAt: '2025-03-15T11:00:00Z',
  },
  {
    cgId: 'cg12',
    parentBodyId: MOCK_BODY_ID,
    parentBodyName: 'Maritime Safety Committee (MSC)',
    name: 'CG on E-navigation strategy implementation',
    mandate: 'Correspondence group on e-navigation testbeds and standards.',
    indiaLeadId: 'u3',
    indiaLeadName: 'Member One',
    startDate: '2024-10-01',
    endDate: '2025-05-31',
    status: 'ACTIVE',
    imsoReference: 'MSC 107/5',
    createdAt: '2024-09-20T08:00:00Z',
  },
  {
    cgId: 'cg13',
    parentBodyId: 'b2',
    parentBodyName: 'Marine Environment Protection Committee (MEPC)',
    name: 'CG on Fuel oil quality and safety',
    mandate: 'Review of guidelines on fuel oil quality and safety.',
    indiaLeadId: 'u2',
    indiaLeadName: 'Coordinator One',
    startDate: '2024-04-01',
    endDate: '2024-12-15',
    status: 'CONCLUDED',
    imsoReference: 'MEPC 79/5',
    createdAt: '2024-03-10T14:30:00Z',
  },
  {
    cgId: 'cg14',
    parentBodyId: MOCK_BODY_ID,
    parentBodyName: 'Maritime Safety Committee (MSC)',
    name: 'CG on Cyber security (resolution MSC.428(98))',
    mandate: 'Implementation of cyber risk management in safety management.',
    indiaLeadId: 'u1',
    indiaLeadName: 'Delegation Leader',
    startDate: '2025-01-01',
    endDate: '2025-08-31',
    status: 'ACTIVE',
    imsoReference: 'MSC 108/5',
    createdAt: '2024-12-18T09:00:00Z',
  },
  {
    cgId: 'cg15',
    parentBodyId: 'b2',
    parentBodyName: 'Marine Environment Protection Committee (MEPC)',
    name: 'CG on Onboard CO2 capture technology',
    mandate: 'Consideration of onboard carbon capture and storage options.',
    indiaLeadId: 'u3',
    indiaLeadName: 'Member One',
    startDate: '2025-02-15',
    endDate: '2025-11-30',
    status: 'ACTIVE',
    imsoReference: 'MEPC 81/5',
    createdAt: '2025-02-01T10:00:00Z',
  },
];

// ─── Notifications ─────────────────────────────────────────────────────────
export type MockNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export const mockNotifications: MockNotification[] = [
  { id: 'n1', type: 'TASK_ASSIGNED', title: 'Task assigned', message: 'You were assigned "Prepare consolidated position on agenda item 5".', link: '/tasks/t1', read: false, createdAt: '2025-04-23T08:00:00Z' },
  { id: 'n2', type: 'APPROVAL_REQUIRED', title: 'Approval required', message: 'Paper "India position on Strategic Plan implementation" is pending your approval.', link: '/papers/p1/approval', read: true, createdAt: '2025-04-22T15:30:00Z' },
  { id: 'n3', type: 'DEADLINE_REMINDER', title: 'Deadline reminder', message: 'Feedback for agenda item 5 is due 2025-04-30.', link: `/meetings/${MOCK_MEETING_ID}/agenda/${MOCK_AGENDA_ITEM_ID}/feedback/submit`, read: false, createdAt: '2025-04-20T09:00:00Z' },
];

// ─── Live meeting (interventions, outcomes) ──────────────────────────────────
export type MockIntervention = {
  interventionId: string;
  meetingId: string;
  agendaItemId: string;
  agendaItemTitle: string;
  text: string;
  deliveredBy: string;
  deliveredAt: string;
  type: 'SUPPORT' | 'OPPOSE' | 'PROPOSE_AMENDMENT' | 'INFORMATION';
};

export const mockInterventions: MockIntervention[] = [
  {
    interventionId: 'i1',
    meetingId: MOCK_MEETING_ID,
    agendaItemId: MOCK_AGENDA_ITEM_ID,
    agendaItemTitle: 'Implementation of the Strategic Plan',
    text: 'India supports the proposed timeline and wishes to highlight the importance of capacity-building for developing countries.',
    deliveredBy: 'Delegation Leader',
    deliveredAt: '2025-05-12T11:30:00Z',
    type: 'SUPPORT',
  },
];

export type MockOutcome = {
  outcomeId: string;
  meetingId: string;
  agendaItemId: string;
  agendaItemTitle: string;
  decision: string;
  resolutionRef: string | null;
  nextSteps: string | null;
  capturedAt: string;
};

export const mockOutcomes: MockOutcome[] = [
  {
    outcomeId: 'o1',
    meetingId: MOCK_MEETING_ID,
    agendaItemId: MOCK_AGENDA_ITEM_ID,
    agendaItemTitle: 'Implementation of the Strategic Plan',
    decision: 'Committee noted the progress and agreed to extend the correspondence group until MEPC 82.',
    resolutionRef: null,
    nextSteps: 'Secretariat to circulate revised draft by 1 June 2025.',
    capturedAt: '2025-05-16T14:00:00Z',
  },
];

// ─── Audit log (for system admin) ───────────────────────────────────────────
export type MockAuditEntry = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  details: string | null;
};

export const mockAuditLog: MockAuditEntry[] = [
  { id: 'aud1', userId: 'u2', userName: 'Coordinator One', action: 'UPDATE', entityType: 'MEETING', entityId: MOCK_MEETING_ID, timestamp: '2025-04-23T10:00:00Z', ipAddress: '10.0.0.1', details: 'Status: PLANNED → ACTIVE' },
  { id: 'aud2', userId: 'u3', userName: 'Member One', action: 'CREATE', entityType: 'FEEDBACK', entityId: 'fb1', timestamp: '2025-04-18T12:00:00Z', ipAddress: '10.0.0.2', details: 'Agenda item 5' },
];

// ─── Helpers: get by id ────────────────────────────────────────────────────
export function getMockMeeting(id: string): MeetingDto | undefined {
  return mockMeetings.find((m) => m.meetingId === id);
}

export function getMockAgendaItem(meetingId: string, itemId: string): AgendaItemDto | undefined {
  return mockAgendaItems.find((a) => a.meetingId === meetingId && a.agendaItemId === itemId);
}

export function getMockDocument(id: string): DocumentDto | undefined {
  return mockDocuments.find((d) => d.documentId === id);
}

export function getMockTask(id: string): TaskDto | undefined {
  return mockTasks.find((t) => t.taskId === id);
}

export function getMockPaper(id: string): MockPaper | undefined {
  return mockPapers.find((p) => p.paperId === id);
}

export function getMockUser(id: string): UserDto | undefined {
  return mockUsers.find((u) => u.userId === id);
}
