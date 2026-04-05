import { NextResponse } from 'next/server';

/**
 * GET /api/auth/keycloak-check
 * Verifies the Next.js server can reach Keycloak (for debugging OAuthSignin).
 */
export async function GET() {
  const issuer = process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8180/realms/isep-realm';
  const url = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: `Keycloak discovery returned ${res.status}`,
          url,
          body: text.slice(0, 500),
        },
        { status: 502 }
      );
    }
    const json = JSON.parse(text);
    return NextResponse.json({
      ok: true,
      message: 'Keycloak is reachable from the server',
      url,
      issuer: json.issuer,
      authEndpoint: json.authorization_endpoint,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to reach Keycloak',
        url,
        error: message,
        hint: 'Ensure KEYCLOAK_ISSUER in .env is http://localhost:8180/realms/isep-realm and Docker Keycloak is running on 8180.',
      },
      { status: 502 }
    );
  }
}
