import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import type { PositionAdvisoryDto } from '@/lib/api';

/**
 * GET /api/ai/position-advisory?agendaItemId=...
 * AI Feature 1 - Position Advisor. SA + CO only.
 * Returns mock advisory until backend/Anthropic integration.
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
  const agendaItemId = searchParams.get('agendaItemId');
  if (!agendaItemId) {
    return NextResponse.json({ error: 'agendaItemId required' }, { status: 400 });
  }

  const mock: PositionAdvisoryDto = {
    advisoryId: `adv-${agendaItemId}-${Date.now()}`,
    agendaItemId,
    generatedAt: new Date().toISOString(),
    paperSummary:
      'This paper proposes amendments to MARPOL Annex VI Regulation 14 to lower the global sulphur cap from 0.5% to 0.1% by 2030, applicable to all vessels. The submission requests a phased approach with differentiated timelines for developing nations.',
    historicalContext:
      'MSC 105 (2022): India objected to accelerated timelines citing fleet readiness concerns. MEPC 78 (2022): India supported a phased approach with differentiated timelines for developing nations. MEPC 80 (2023): India abstained - awaiting domestic fuel availability assessment.',
    suggestedPosition: 'CONDITIONAL_SUPPORT',
    suggestedPositionReasoning:
      "India's domestic refinery capacity for VLSFO production has improved since MEPC 80. However, the 2030 deadline remains aggressive for coastal fleet operators. A conditional support with a formal reservation on timeline is recommended, aligning with BRICS maritime bloc signals.",
    keyPointsToRaise: [
      'Request differentiated implementation for developing nations per MARPOL Article 1(3).',
      'Seek technical assistance provisions for Indian coastal fleet operators.',
      'Align with BRICS bloc position (Russia, China have both signalled conditional support).',
    ],
    alignmentOpportunities: ['BRICS maritime bloc', 'Developing nations coalition'],
    riskFlags: ['Timeline sensitivity for coastal fleet', 'Domestic fuel availability reporting'],
    confidenceScore: 0.78,
    isAiGenerated: true,
    modelVersion: 'mock-v1',
  };

  return NextResponse.json(mock);
}
