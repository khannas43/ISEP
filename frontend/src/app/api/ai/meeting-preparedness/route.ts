import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import type { MeetingPreparednessDto } from '@/lib/api';

/**
 * GET /api/ai/meeting-preparedness?meetingId=...
 * AI Feature 2 — Meeting Preparedness Intelligence. SA + CO only.
 * Returns mock preparedness until backend computation + Claude integration.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN') && !roles.includes('COORDINATOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const meetingId = searchParams.get('meetingId');
  if (!meetingId) {
    return NextResponse.json({ error: 'meetingId required' }, { status: 400 });
  }

  // Mock response; replace with backend call when ready
  const mock: MeetingPreparednessDto = {
    meetingId,
    meetingTitle: 'MSC 108',
    daysToMeeting: 15,
    score: 62,
    riskLevel: 'AMBER',
    executiveSummary:
      'Meeting preparedness is at 62/100 (Amber). Three critical actions require resolution before the meeting: agenda item 4.3 has pending feedback from 3 members, one paper is stuck at IC Division approval, and 4 tasks are overdue.',
    criticalActions: [
      {
        severity: 'CRITICAL',
        description: 'Agenda Item 4.3 — No feedback received from 3 of 6 assigned members. Deadline passed 2 days ago.',
        linkedEntityType: 'AGENDA_ITEM',
        linkedEntityId: 'item-4-3',
        recommendedAction: 'View Item',
      },
      {
        severity: 'CRITICAL',
        description: "Paper: \"India's Position on GHG Strategy\" stuck at IC Division approval for 8 days. Deadline: 3 days.",
        linkedEntityType: 'PAPER',
        linkedEntityId: 'paper-ghg',
        recommendedAction: 'View Paper',
      },
      {
        severity: 'WARNING',
        description: 'Agenda Items 7.1, 7.2, 7.3 — Feedback consolidated but not yet reviewed by Delegation Leader.',
        recommendedAction: 'View Items',
      },
      {
        severity: 'WARNING',
        description: '4 tasks overdue across 3 agenda items.',
        recommendedAction: 'View Tasks',
      },
    ],
    projectedScoreAtMeetingDate: 78,
    keyStrengths: [
      '11 of 14 agenda items: positions finalized.',
      'All delegation participants confirmed.',
      'All reference documents uploaded.',
    ],
    narrative:
      'At current pace the delegation can reach 78/100 by meeting date with 3 items at risk. Resolving the two critical actions above would bring the score to approximately 90/100. The main gaps are pending member feedback on agenda item 4.3 and the GHG strategy paper awaiting IC Division approval.',
    lastComputedAt: new Date().toISOString(),
  };

  return NextResponse.json(mock);
}
