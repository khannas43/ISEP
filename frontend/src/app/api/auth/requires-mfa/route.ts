import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/auth/requires-mfa — Returns whether the current user (SA or IH) must complete MFA.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ requiresMfa: false });
  }
  const roles = (session as { roles?: string[] }).roles ?? [];
  const requiresMfa = roles.includes('SYSTEM_ADMIN') || roles.includes('IC_DIVISION_HEAD');
  return NextResponse.json({ requiresMfa });
}
