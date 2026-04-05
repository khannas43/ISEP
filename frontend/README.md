# ISEP Frontend

Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI, next-auth with Keycloak. SRS-04 §3.

## Setup

```bash
cp .env.example .env
# Set NEXTAUTH_SECRET (e.g. openssl rand -base64 32), KEYCLOAK_CLIENT_SECRET from Keycloak
npm install
npm run dev
```

Runs at http://localhost:3000. Sign-in uses Keycloak (realm `isep-realm`, client `isep-web`). Ensure Keycloak is running and realm is imported.

## Routes

- `/` — Home (sign-in or welcome)
- `/dashboard` — Protected; role-specific dashboard (Phase 1)
- `/unauthorized` — Shown when role does not allow access

Middleware protects `/dashboard`, `/meetings`, `/admin`; admin paths require SYSTEM_ADMIN or IC_DIVISION_HEAD.
