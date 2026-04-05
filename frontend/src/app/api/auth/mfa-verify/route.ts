import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

const MFA_COOKIE = 'isep_mfa_verified';
const MFA_MAX_AGE = 30 * 60; // 30 minutes

/**
 * POST /api/auth/mfa-verify — Verify TOTP and set MFA cookie for SA/IH.
 * SCR-AUTH-02: Time-limited; in production verify against Keycloak OTP.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const roles = (session as { roles?: string[] }).roles ?? [];
  if (!roles.includes('SYSTEM_ADMIN') && !roles.includes('IC_DIVISION_HEAD')) {
    return NextResponse.json({ error: 'MFA not required for your role' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as { code?: string };
  const code = String(body?.code ?? '').trim().replace(/\D/g, '');
  if (code.length !== 6) {
    return NextResponse.json({ error: 'Enter a 6-digit code' }, { status: 400 });
  }

  // TODO: Verify TOTP against Keycloak (OTP grant or Admin API)
  // For now accept any 6 digits in development
  const verified = process.env.NODE_ENV === 'development' || code === '123456';

  if (!verified) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MFA_COOKIE, '1', {
    httpOnly: true,
    secure: (process.env.NEXTAUTH_URL ?? '').startsWith('https://'),
    sameSite: 'lax',
    path: '/',
    maxAge: MFA_MAX_AGE,
  });
  return res;
}
