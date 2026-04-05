import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

/**
 * Change password via Keycloak Admin API.
 * Verifies current password with token endpoint, then resets password using admin client.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const currentPassword = body.currentPassword;
    const newPassword = body.newPassword;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !newPassword.trim()) {
      return NextResponse.json({ error: 'Current password and new password are required.' }, { status: 400 });
    }

    const issuer = process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8180/realms/isep-realm';
    const clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'isep-web';
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? '';
    const tokenUrl = `${issuer}/protocol/openid-connect/token`;

    // Verify current password by attempting to get tokens (username from session – Keycloak login uses email or preferred_username)
    const username = session.user.email;
    const verifyRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username,
        password: currentPassword,
        scope: 'openid',
      }).toString(),
    });
    if (!verifyRes.ok) {
      const err = await verifyRes.json().catch(() => ({}));
      const msg = err?.error_description ?? err?.error ?? 'Current password is incorrect.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const keycloakUserId = (session.user as { id?: string }).id;
    if (!keycloakUserId) {
      return NextResponse.json({ error: 'User id not found in session.' }, { status: 400 });
    }

    const adminUser = process.env.KEYCLOAK_ADMIN_USERNAME;
    const adminPass = process.env.KEYCLOAK_ADMIN_PASSWORD;
    if (!adminUser?.trim() || !adminPass?.trim()) {
      return NextResponse.json({
        error: 'Password change is not configured. Set KEYCLOAK_ADMIN_USERNAME and KEYCLOAK_ADMIN_PASSWORD in .env (Keycloak admin credentials).',
      }, { status: 503 });
    }

    const baseUrl = (process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8180/realms/isep-realm').replace(/\/realms\/.*$/, '') || 'http://localhost:8180';
    const adminTokenUrl = `${baseUrl}/realms/master/protocol/openid-connect/token`;
    const adminTokenRes = await fetch(adminTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: adminUser,
        password: adminPass,
      }).toString(),
    });
    if (!adminTokenRes.ok) {
      console.error('Keycloak admin token failed:', await adminTokenRes.text());
      return NextResponse.json({ error: 'Unable to perform password change. Admin configuration may be invalid.' }, { status: 503 });
    }
    const adminTokenData = await adminTokenRes.json();
    const accessToken = adminTokenData.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unable to perform password change.' }, { status: 503 });
    }

    const realm = issuer.split('/realms/')[1]?.split('/')[0] ?? 'isep-realm';
    const resetUrl = `${baseUrl}/admin/realms/${realm}/users/${keycloakUserId}/reset-password`;
    const resetRes = await fetch(resetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        type: 'password',
        temporary: false,
        value: newPassword,
      }),
    });
    if (!resetRes.ok) {
      const errText = await resetRes.text();
      console.error('Keycloak reset-password failed:', resetRes.status, errText);
      return NextResponse.json({ error: 'Failed to set new password. It may not meet Keycloak policy.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Change password error:', e);
    return NextResponse.json({ error: 'An error occurred while changing password.' }, { status: 500 });
  }
}
