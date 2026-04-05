/**
 * Sample data for Meeting Management (SCR-MTG-01 to 05) when the backend
 * returns no data or is unavailable. 60 meetings between Jan 2024 and Dec 2025.
 * Enable with NEXT_PUBLIC_USE_MOCK_MEETINGS=true or use automatically in dev when API is empty.
 */

import type { BodyDto, MeetingDto } from './api';

/** Extended list of international bodies (IMO-style) for Bodies list when API is empty/unavailable */
export const MOCK_BODIES: BodyDto[] = [
  { bodyId: 'mock-body-1', parentBodyId: null, parentBodyName: null, name: 'Maritime Safety Committee', abbreviation: 'MSC', bodyType: 'COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-2', parentBodyId: null, parentBodyName: null, name: 'Marine Environment Protection Committee', abbreviation: 'MEPC', bodyType: 'COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-3', parentBodyId: 'mock-body-1', parentBodyName: 'Maritime Safety Committee', name: 'Sub-Committee on Human Element, Training and Watchkeeping', abbreviation: 'HTW', bodyType: 'SUB_COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-4', parentBodyId: 'mock-body-1', parentBodyName: 'Maritime Safety Committee', name: 'Sub-Committee on Navigation, Communications and Search and Rescue', abbreviation: 'NCSR', bodyType: 'SUB_COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-5', parentBodyId: null, parentBodyName: null, name: 'Legal Committee', abbreviation: 'LEG', bodyType: 'COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-6', parentBodyId: 'mock-body-2', parentBodyName: 'Marine Environment Protection Committee', name: 'Working Group on Greenhouse Gas Emissions', abbreviation: 'GHG', bodyType: 'WORKING_GROUP', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-7', parentBodyId: null, parentBodyName: null, name: 'Technical Cooperation Committee', abbreviation: 'TCC', bodyType: 'COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-8', parentBodyId: null, parentBodyName: null, name: 'Facilitation Committee', abbreviation: 'FAL', bodyType: 'COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-9', parentBodyId: 'mock-body-1', parentBodyName: 'Maritime Safety Committee', name: 'Sub-Committee on Ship Design and Construction', abbreviation: 'SDC', bodyType: 'SUB_COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-10', parentBodyId: 'mock-body-1', parentBodyName: 'Maritime Safety Committee', name: 'Sub-Committee on Implementation of IMO Instruments', abbreviation: 'III', bodyType: 'SUB_COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-11', parentBodyId: 'mock-body-1', parentBodyName: 'Maritime Safety Committee', name: 'Sub-Committee on Carriage of Cargoes and Containers', abbreviation: 'CCC', bodyType: 'SUB_COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-12', parentBodyId: 'mock-body-2', parentBodyName: 'Marine Environment Protection Committee', name: 'Sub-Committee on Pollution Prevention and Response', abbreviation: 'PPR', bodyType: 'SUB_COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-13', parentBodyId: 'mock-body-2', parentBodyName: 'Marine Environment Protection Committee', name: 'Sub-Committee on Ship Systems and Equipment', abbreviation: 'SSE', bodyType: 'SUB_COMMITTEE', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-14', parentBodyId: null, parentBodyName: null, name: 'Council', abbreviation: 'C', bodyType: 'COUNCIL', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
  { bodyId: 'mock-body-15', parentBodyId: null, parentBodyName: null, name: 'Assembly', abbreviation: 'A', bodyType: 'ASSEMBLY', description: null, isActive: true, createdAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' },
];

const BODY_IDS = MOCK_BODIES.map((b) => b.bodyId);
const BODY_NAMES: Record<string, string> = Object.fromEntries(MOCK_BODIES.map((b) => [b.bodyId, b.name]));

const STATUSES = ['PLANNED', 'PLANNED', 'ACTIVE', 'CONCLUDED', 'CONCLUDED', 'CONCLUDED', 'ARCHIVED', 'CANCELLED'] as const;
const MEETING_TYPES = ['IN_PERSON', 'IN_PERSON', 'VIRTUAL', 'HYBRID'] as const;
const LOCATIONS = [
  'IMO HQ, London, UK',
  'London, United Kingdom',
  'Virtual (MS Teams)',
  'Hybrid - IMO HQ + MS Teams',
  'Mumbai, India',
  'New Delhi, India',
  null,
];

const TITLE_PREFIXES: Record<string, string> = {
  'mock-body-1': 'Maritime Safety Committee',
  'mock-body-2': 'Marine Environment Protection Committee',
  'mock-body-3': 'Sub-Committee on Human Element, Training and Watchkeeping',
  'mock-body-4': 'Sub-Committee on Navigation, Communications and SAR',
  'mock-body-5': 'Legal Committee',
  'mock-body-6': 'Working Group on GHG Emissions',
  'mock-body-7': 'Technical Cooperation Committee',
  'mock-body-8': 'Facilitation Committee',
  'mock-body-9': 'Sub-Committee on Ship Design and Construction',
  'mock-body-10': 'Sub-Committee on Implementation of IMO Instruments',
  'mock-body-11': 'Sub-Committee on Carriage of Cargoes and Containers',
  'mock-body-12': 'Sub-Committee on Pollution Prevention and Response',
  'mock-body-13': 'Sub-Committee on Ship Systems and Equipment',
  'mock-body-14': 'Council',
  'mock-body-15': 'Assembly',
};

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateBetween(start: Date, end: Date): string {
  const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(t).toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function buildMockMeetings(): MeetingDto[] {
  const start = new Date('2024-01-01');
  const end = new Date('2025-12-31');
  const meetings: MeetingDto[] = [];
  const sessionByBody: Record<string, number> = {};
  BODY_IDS.forEach((bid) => { sessionByBody[bid] = 0; });

  for (let i = 1; i <= 60; i++) {
    const bodyId = BODY_IDS[(i - 1) % BODY_IDS.length];
    const bodyName = BODY_NAMES[bodyId];
    sessionByBody[bodyId] += 1;
    const sessionNum = String(sessionByBody[bodyId]);
    const prefix = TITLE_PREFIXES[bodyId];
    const startDate = dateBetween(start, end);
    const endDate = addDays(startDate, Math.floor(Math.random() * 5) + 1);
    const status = randomItem(STATUSES);
    const meetingType = randomItem(MEETING_TYPES);
    const location = meetingType === 'VIRTUAL' ? 'Virtual (MS Teams)' : randomItem(LOCATIONS);

    meetings.push({
      meetingId: `mock-meeting-${i}`,
      bodyId,
      bodyName,
      sessionNumber: sessionNum,
      title: `${prefix} — Session ${sessionNum}`,
      startDate,
      endDate,
      location,
      meetingType,
      status,
      notes: i % 4 === 0 ? 'Agenda and working documents will be circulated in due course.' : null,
      createdAt: '2023-06-01T10:00:00Z',
    });
  }

  // Sort by start date descending so recent meetings appear first
  meetings.sort((a, b) => b.startDate.localeCompare(a.startDate));
  return meetings;
}

let cached: MeetingDto[] | null = null;

export function getMockMeetings(): MeetingDto[] {
  if (!cached) cached = buildMockMeetings();
  return cached;
}

export function getMockMeetingById(id: string): MeetingDto | null {
  return getMockMeetings().find((m) => m.meetingId === id) ?? null;
}

export function getMockBodies(): BodyDto[] {
  return MOCK_BODIES;
}

export function getMockBodyById(id: string): BodyDto | null {
  return MOCK_BODIES.find((b) => b.bodyId === id) ?? null;
}

/** Use mock data when env is set or when in dev and API returned empty */
export function shouldUseMockMeetings(apiMeetingCount: number): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_MEETINGS === 'true') return true;
  if (process.env.NODE_ENV !== 'development') return false;
  return apiMeetingCount === 0;
}
