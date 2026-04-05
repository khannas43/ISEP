/**
 * ISEP Authentication (NextAuth + Keycloak)
 * ----------------------------------------
 * Configures NextAuth with Credentials provider. Login uses Keycloak Direct Access Grant
 * (resource owner password) to exchange username/password for access_token and id_token.
 * Session stores accessToken (for backend API calls) and roles (filtered from Keycloak realm roles).
 * Only APP_ROLES (SYSTEM_ADMIN, IC_DIVISION_HEAD, etc.) are used for RBAC; see routePermissions.ts.
 */
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export { getServerSession };

/** Keycloak Direct Access Grant: exchange username/password for tokens (no redirect). Used in dev; for production consider Authorization Code flow. */
async function keycloakTokenWithPassword(
  username: string,
  password: string
): Promise<{ access_token: string; id_token: string }> {
  const issuer = process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8180/realms/isep-realm';
  const clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'isep-web';
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? '';
  const tokenUrl = `${issuer}/protocol/openid-connect/token`;

  // Client secret is from Keycloak: Clients → isep-web → Credentials tab. Do NOT use the realm public_key.
  // If the realm was imported from realm-isep.json, the client secret may be CHANGE-ME-IMPORT-REPLACE-WITH-SECRET — that is valid.
  if (!clientSecret?.trim()) {
    throw new Error('KEYCLOAK_CLIENT_SECRET is not set in .env. Get it from Keycloak Admin → Clients → isep-web → Credentials tab (or use the value from realm-isep.json).');
  }

  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: clientId,
    client_secret: clientSecret,
    username,
    password,
    scope: 'openid', // required for Keycloak to return id_token
  });

  let res: Response;
  try {
    res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch (err) {
    const msg = 'Cannot reach Keycloak. Is it running at ' + issuer + '?';
    console.error('[auth] Keycloak token request failed:', msg, err);
    throw new Error(msg);
  }

  const data = (await res.json()) as {
    access_token?: string;
    id_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok) {
    const msg = data?.error_description ?? data?.error ?? `HTTP ${res.status}`;
    console.error('[auth] Keycloak token error:', res.status, data);
    if (res.status === 401 && (String(msg).toLowerCase().includes('invalid') || String(msg).toLowerCase().includes('credential'))) {
      throw new Error('Invalid username or password.');
    }
    throw new Error(String(msg));
  }

  if (!data.access_token) {
    throw new Error('Keycloak did not return an access token. Check client settings and Direct access grant.');
  }

  // id_token is returned when scope=openid; if missing, get user/roles from access_token or userinfo
  let id_token = data.id_token;
  if (!id_token) {
    // Keycloak access_token is a JWT and may contain realm_access; use it for roles
    const payload = decodeJwtPayload(data.access_token);
    if (payload) {
      id_token = makeFakeIdToken(payload, data.access_token);
    }
  }
  if (!id_token) {
    throw new Error(
      'Keycloak did not return an id_token. Ensure scope=openid is requested and client has OpenID Connect capability.'
    );
  }
  return { access_token: data.access_token, id_token };
}

/** Only these Keycloak realm roles are used for RBAC (must match routePermissions.ts). */
const APP_ROLES = ['SYSTEM_ADMIN', 'IC_DIVISION_HEAD', 'DELEGATION_LEADER', 'COORDINATOR', 'MEMBER', 'VIEWER'] as const;

/** Get realm roles from a JWT payload (access_token or id_token). */
function getRolesFromPayload(payload: Record<string, unknown>): string[] {
  const realm = payload.realm_access as { roles?: string[] } | undefined;
  return realm?.roles ?? [];
}

/** Keep only app roles used for RBAC; ignore default-roles-isep-realm, offline_access, uma_authorization, etc. */
function filterAppRoles(roles: string[]): string[] {
  return roles.filter((r) => (APP_ROLES as readonly string[]).includes(r));
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function makeFakeIdToken(accessPayload: Record<string, unknown>, _accessToken: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const sub = accessPayload.sub ?? 'unknown';
  const preferred_username = accessPayload.preferred_username ?? accessPayload.username ?? sub;
  const realm_access = accessPayload.realm_access as { roles?: string[] } | undefined;
  const roles = realm_access?.roles ?? [];
  const payload = {
    sub,
    preferred_username,
    name: accessPayload.name ?? preferred_username,
    email: accessPayload.email ?? accessPayload.preferred_username,
    realm_access: { roles },
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${payloadB64}.`;
}

function decodeIdTokenRoles(idToken: string): string[] {
  try {
    const payload = JSON.parse(
      Buffer.from(idToken.split('.')[1], 'base64url').toString()
    ) as { realm_access?: { roles?: string[] }; sub?: string; preferred_username?: string; name?: string; email?: string };
    return payload.realm_access?.roles ?? [];
  } catch {
    return [];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Username and password',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[auth] authorize called, username:', credentials?.username?.trim?.() ?? '(none)');
        if (!credentials?.username || !credentials?.password) return null;

        const username = credentials.username.trim();
        const password = credentials.password;

        // Dev-only: when Keycloak secret is not set or is realm public key (wrong), accept demo/demo
        const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? '';
        const isPlaceholder =
          !clientSecret.trim() ||
          clientSecret.startsWith('MIIBIjAN'); // realm public_key is NOT the client secret — do not use it
        const isDevBypass = process.env.NODE_ENV === 'development' && isPlaceholder;
        if (isDevBypass && username === 'demo' && password === 'demo') {
          return {
            id: 'demo-user',
            email: 'demo@example.org',
            name: 'Demo User',
            accessToken: '',
            roles: ['COORDINATOR'],
            requiredActions: [],
          };
        }
        if (isDevBypass) {
          throw new Error(
            'Keycloak is not configured. Use username "demo" and password "demo" to sign in, or set KEYCLOAK_CLIENT_SECRET in .env (from Keycloak → Clients → isep-web → Credentials).'
          );
        }

        let tokens;
        try {
          tokens = await keycloakTokenWithPassword(username, password);
        } catch (err) {
          console.error('[auth] authorize failed:', err instanceof Error ? err.message : err);
          throw err;
        }

        // Keycloak often puts realm_access.roles in access_token, not id_token
        let roles = decodeIdTokenRoles(tokens.id_token);
        if (roles.length === 0) {
          const accessPayload = decodeJwtPayload(tokens.access_token);
          if (accessPayload) roles = getRolesFromPayload(accessPayload);
        }
        // Only use app roles for RBAC; ignore default-roles-isep-realm, offline_access, uma_authorization
        roles = filterAppRoles(roles);
        const payload = JSON.parse(
          Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString()
        ) as { sub?: string; preferred_username?: string; name?: string; email?: string };
        const issuer = process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8180/realms/isep-realm';
        let requiredActions: string[] = [];
        try {
          const userinfoRes = await fetch(`${issuer}/protocol/openid-connect/userinfo`, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });
          if (userinfoRes.ok) {
            const userinfo = (await userinfoRes.json()) as { required_actions?: string[] };
            requiredActions = userinfo.required_actions ?? [];
          }
        } catch {
          // ignore; required_actions optional for MFA/forced password flow
        }
        return {
          id: payload.sub ?? '',
          email: payload.email ?? payload.preferred_username ?? '',
          name: payload.name ?? payload.preferred_username ?? username,
          accessToken: tokens.access_token,
          roles,
          requiredActions,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes (SRS-05 NFR-S-003)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.roles = (user as { roles?: string[] }).roles ?? [];
        token.requiredActions = (user as { requiredActions?: string[] }).requiredActions ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (token.sub ?? token.id) as string;
        (session as { accessToken?: string; roles?: string[]; requiredActions?: string[] }).accessToken = token.accessToken as string;
        (session as { accessToken?: string; roles?: string[]; requiredActions?: string[] }).roles = token.roles as string[] ?? [];
        (session as { requiredActions?: string[] }).requiredActions = (token.requiredActions as string[]) ?? [];
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Use NEXTAUTH_URL so redirects stay under app base (e.g. /isep), never send user to root /auth
      const appBase = process.env.NEXTAUTH_URL ?? baseUrl;
      if (url.startsWith('/')) return `${appBase.replace(/\/$/, '')}${url}`;
      try {
        const u = new URL(url);
        const base = new URL(appBase);
        if (u.origin === base.origin && (u.pathname === base.pathname || u.pathname.startsWith(base.pathname + '/'))) return url;
      } catch {
        /* ignore */
      }
      return appBase.replace(/\/$/, '') || baseUrl;
    },
  },
  pages: {
    signIn: '/', // login form is on the root page
  },
  // @ts-expect-error trustHost exists at runtime for NextAuth; types may lag
  trustHost: true,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax', // required for OIDC redirect from Keycloak back to app
        path: '/',
        // Secure only over HTTPS; over HTTP (e.g. http://148.230.66.191) browser would reject the cookie and session would not persist
        secure: (process.env.NEXTAUTH_URL ?? '').startsWith('https://'),
      },
    },
  },
};
