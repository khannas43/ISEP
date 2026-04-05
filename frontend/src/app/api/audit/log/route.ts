import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/audit/log — Log an audit event (e.g. unauthorized access).
 * SCR-AUTH-05: Logs the attempt to the audit trail.
 * In production this would write to audit.audit_logs or notification-service.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json().catch(() => ({})) as {
      event: string;
      path?: string;
      details?: string;
    };
    const { event, path, details } = body;
    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'event required' }, { status: 400 });
    }

    const userId = session?.user?.email ?? (session as { user?: { id?: string } })?.user?.id ?? 'anonymous';
    const roles = (session as { roles?: string[] })?.roles ?? [];
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      path: path ?? null,
      details: details ?? null,
      userId,
      roles: roles.join(','),
    };

    // TODO: send to audit backend (e.g. notification-service or audit.audit_logs)
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', JSON.stringify(entry));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}
