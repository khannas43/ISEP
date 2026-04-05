# ISEP Technical Design Document — Part 3: Frontend & UX

**Document ID:** DGS-ISEP-TDD-03  
**Version:** 1.0  
**Last Updated:** 2026-02-28  
**Status:** Draft for review  

---

## 1. Introduction

This part describes the **frontend architecture** of ISEP: Next.js application structure, routing, authentication, RBAC, data flow, and key UI patterns. It is intended for frontend developers and testers.

**Prerequisite reading:** Part 1 (Overview & Architecture), Part 2 (Backend & APIs).

---

## 2. Technology Stack

| Layer | Technology |
|-------|-------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| UI components | Radix UI (accessible primitives) |
| Auth | next-auth (Keycloak integration) |
| State | React state, server components, server actions; no global store required for current scope |

---

## 3. Application Structure

### 3.1 Directory Layout (Key Paths)

```
frontend/src/
├── app/                    # App Router: routes and layouts
│   ├── page.tsx            # Home (redirect or welcome)
│   ├── layout.tsx          # Root layout
│   ├── login/              # Login, MFA, complete
│   ├── dashboard/          # Role-based dashboard
│   ├── meetings/           # Meetings list, detail, create, edit, agenda, tasks, live, outcomes
│   ├── bodies/             # International bodies list, detail, new, edit
│   ├── documents/          # Document list, detail, compare, new-version
│   ├── papers/             # Papers list, draft, approval, view, reject
│   ├── tasks/              # Tasks (my, team), task detail
│   ├── correspondence-groups/
│   ├── reports/            # Reports home, meeting-summary, approval-pipeline, audit, analytics, custom
│   ├── calendar/
│   ├── notifications/
│   ├── account/            # Profile, change-password, notification-preferences
│   ├── admin/              # Users, system (health, config, workflows, backups), audit, announcements
│   ├── agenda/             # Standalone agenda (if used)
│   ├── api/                # Next.js API routes (proxy to backend where needed)
│   ├── session-expired/
│   └── unauthorized/
├── components/             # Reusable UI (e.g. ai/PositionAdvisorPanel)
├── lib/
│   ├── api.ts              # getApiUrl, DTOs, fetch helpers (getReferenceData, getMeetings, etc.)
│   ├── auth.ts             # NextAuth config, Keycloak token exchange, role extraction
│   ├── format.ts           # Date/time formatting
│   └── routePermissions.ts # RBAC: path pattern → allowed roles; canAccessRoute, isPublicPath
├── middleware.ts           # Auth check, session timeout, MFA redirect, RBAC
└── ...
```

### 3.2 App Router Conventions

- **Server components (default):** Pages that fetch data on the server using `getServerSession()` and then `fetch` to backend with `Authorization: Bearer <accessToken>`. Used for list/detail pages that need initial data.
- **Client components:** Marked with `'use client'`; used for forms, tabs, interactive widgets (e.g. CorrespondenceTab, FeedbackSubmitForm, CompareVersionsClient). They call **server actions** or fetch from client with token from session.
- **API routes:** Under `app/api/`; used to proxy to backend (e.g. document download, version text) so that auth headers can be added server-side.
- **Server actions:** Async functions in `actions.ts` files (e.g. `meetings/actions.ts`, feedback actions) that run on the server, get session, and call backend with Bearer token. Used for mutations (create meeting, save feedback, set CGs).

---

## 4. Authentication and Session

### 4.1 Flow

1. **Login:** User enters credentials on `/login` (or is redirected from Keycloak). Frontend uses **Keycloak Direct Access Grant** (resource owner password) to exchange username/password for tokens via `keycloakTokenWithPassword()` in `lib/auth.ts`. Access token and id token are stored in the NextAuth session.
2. **Session:** next-auth stores session in JWT (or database adapter if configured). Session includes `accessToken`, `user`, and **roles** (derived from Keycloak token; filtered to app roles only).
3. **Protected routes:** `middleware.ts` runs on configured matcher paths. If no token and path is protected → redirect to `/` (or `/session-expired` if session cookie was present). If token present and path requires MFA for SA/IH → redirect to `/login/mfa`. If token present and user lacks role for path → redirect to `/unauthorized?from=...`.
4. **API calls:** Server components and server actions obtain `accessToken` from `getServerSession()`. Client components use `getSession()` or pass token via props/callbacks; server actions receive session on the server. All backend calls use `Authorization: Bearer <accessToken>`.

### 4.2 Role Extraction

- **Source:** Keycloak access token (or id token) claims. Realm roles from `realm_access.roles` (or equivalent).
- **Filtering:** Only these six roles are treated as app roles: `SYSTEM_ADMIN`, `IC_DIVISION_HEAD`, `DELEGATION_LEADER`, `COORDINATOR`, `MEMBER`, `VIEWER`. Other claims (e.g. `default-roles-isep-realm`, `offline_access`) are filtered out in `lib/auth.ts`.
- **Usage:** `routePermissions.ts` uses role list to allow/deny route access; dashboard and nav may show/hide items by role.

### 4.3 Special Flows

- **Forced password change:** If token contains `required_actions` including `UPDATE_PASSWORD`, middleware redirects to `/account/change-password`.
- **MFA:** SA and IH must have `isep_mfa_verified` cookie set (e.g. after completing `/login/mfa`); otherwise middleware redirects to `/login/mfa`.
- **Session timeout:** Middleware sets/refreshes `isep_session_active` cookie (30 min). If user returns without valid token but with this cookie, redirect to `/session-expired?callbackUrl=...`.

---

## 5. RBAC (Route Protection)

### 5.1 Mechanism

- **Definition:** `lib/routePermissions.ts` exports `ROUTE_PERMISSIONS`: array of `{ pattern, roles }`. Pattern is string prefix or RegExp. `roles: null` = public; `roles: []` = any authenticated; otherwise array of allowed roles (any one grants access).
- **Enforcement:** `middleware.ts` calls `canAccessRoute(pathname, userRoles, devNoRoles)`. If false → redirect to `/unauthorized?from=<pathname>`.
- **Order:** First matching pattern wins; more specific paths must appear before broader ones (e.g. `/admin/system/health` before `/admin`).

### 5.2 Public Paths

- `/`, `/login`, `/login/complete`, `/login/mfa`, `/session-expired`, `/unauthorized` (and subpaths as defined). No authentication required.

### 5.3 Role–Route Summary (Examples)

| Area | Allowed roles (typical) |
|------|-------------------------|
| Admin system (health, config, workflows, backups) | SYSTEM_ADMIN |
| Admin users, new user, bulk-import | SYSTEM_ADMIN |
| Admin audit | SYSTEM_ADMIN, IC_DIVISION_HEAD |
| Bodies | All six roles (view); create/edit: SYSTEM_ADMIN |
| Meetings | All six; create/edit: SYSTEM_ADMIN, COORDINATOR; feedback submit: MEMBER; consolidate: SA, IH, DL, CO |
| Documents | All; upload/new-version/compare: all except VIEWER |
| Papers | SA, IH, DL, CO, ME (no VIEWER for papers) |
| Correspondence groups | All; new/edit/members: SA, COORDINATOR |
| Reports | Varies by report; audit: SYSTEM_ADMIN |
| Calendar, notifications, account | All authenticated |

Full matrix: see `routePermissions.ts` and SRS `ISEP-Screens-RBAC.md`.

---

## 6. Data Flow and State

### 6.1 Data Source Rule

- **All list/detail data and dropdown options** come from **PostgreSQL via backend APIs**. No static mock data for production flows. Empty API response → empty state in UI. Reference data (meeting type, status, body type, etc.) from `GET /api/v1/reference?category=...` (see Part 2 and Part 4).

### 6.2 Server-Side Data Fetching

- **Pages (server components):** Await `getServerSession(authOptions)`, then if `accessToken` present, call backend (e.g. `getAgendaItem()`, `getFeedbackList()`, `getReferenceData()`). Pass data as props to client components. Use `cache: 'no-store'` for fresh data where needed.
- **Redirect:** If session missing and page is protected, redirect to login. If resource not found (e.g. meeting id), `notFound()`.

### 6.3 Mutations (Server Actions)

- **Pattern:** Form or button in client component calls a server action (e.g. `createMeeting()`, `saveFeedbackDraft()`, `submitFeedbackAction()`, `setMeetingCorrespondenceGroups()`). Action runs on server, gets session, calls backend with Bearer token, returns `{ error?: string }` or `{ data }`. Client shows success/error and may `router.refresh()` to refetch server component data.

### 6.4 Client State

- Local component state (`useState`) for forms, tab selection, checkboxes (e.g. selected CGs). No application-wide client store in current design; server state is source of truth after refresh.

---

## 7. Key Screens and Patterns

### 7.1 Dashboard

- **Route:** `/dashboard`. Single page; content depends on role (SA, IH, DL, CO, ME, VW). Data from meetings API, reports API, users API, actuator health, etc. Role resolved from session; appropriate widgets and links shown.

### 7.2 Meetings

- **List:** `/meetings` — server component fetches meetings (paginated), optional filters. Links to `/meetings/[id]`.
- **Detail:** `/meetings/[id]` — tabs: Overview, Agenda, Participants, Documents, Correspondence Groups, Tasks, Live, Outcomes. Data fetched per tab or on load (agenda items, participants, documents, CGs with assigned flag, tasks). Correspondence tab: client component with checkboxes and Save calling `setMeetingCorrespondenceGroups`.
- **Agenda item:** `/meetings/[id]/agenda/[itemId]` — tabs: Documents, Feedback, Tasks, Papers, Deliberations, Activity. Feedback tab: server component fetches `getFeedbackList(accessToken, itemId)` and passes to AgendaItemTabs; submitted feedback is visible. Submit feedback: `/meetings/.../agenda/.../feedback/submit` — client form, server action save draft then submit.

### 7.3 Documents

- **Detail:** `/documents/[id]` — metadata, download link, link to compare versions.
- **Compare:** `/documents/[id]/compare` — server component loads document and versions; client component `CompareVersionsClient` fetches text for two versions and renders diff (e.g. jsdiff). Backend provides `/documents/{id}/versions/{v}/text` (text extraction from PDF/DOCX).

### 7.4 Papers

- **List:** `/papers`. **Draft:** `/papers/[id]/draft`. **Approval:** `/papers/[id]/approval` (approve/reject). **View:** `/papers/[id]/view`. Data from papers API and approval API.

### 7.5 Correspondence Groups

- **List:** `/correspondence-groups`. **Detail:** `/correspondence-groups/[id]`. **Edit:** `/correspondence-groups/[id]/edit`. **Meeting CGs:** Managed from meeting detail Correspondence tab (GET/PUT meeting correspondence-groups API).

### 7.6 Reports and Admin

- **Reports:** `/reports`, `/reports/meeting-summary`, `/reports/approval-pipeline`, `/reports/audit`, etc. Data from ReportController endpoints.
- **Admin:** `/admin` (overview), `/admin/users`, `/admin/audit`, `/admin/system/health`, etc. Audit from reports/audit API; health from backend actuator.

---

## 8. API and Proxy Usage

- **Direct backend:** Frontend typically calls backend using `NEXT_PUBLIC_API_URL` (e.g. http://localhost:8081 in dev). Used from server components and server actions with `Authorization: Bearer <accessToken>`.
- **Next.js API routes:** Used when client needs to call an endpoint that requires server-side auth (e.g. binary download, or to hide backend URL). Example: `/api/documents/[id]/versions/[versionNumber]/download` or `/text` — route gets session, then fetches from backend and returns response.

---

## 9. Error and Loading Handling

- **Not found:** `notFound()` for invalid ids or missing resources.
- **Unauthorized:** Middleware redirects to `/unauthorized`. Page may show "from" path and link to dashboard.
- **Server/API errors:** Server actions return `{ error: string }`; forms show error message. List pages may show empty or error state.
- **Loading:** Client components may show local loading state (e.g. "Saving…", "Submitting…") during mutations.

---

## 10. Accessibility and UX

- **Radix UI:** Used for accessible components (dialogs, dropdowns, etc.).
- **Semantic HTML and ARIA:** Where applicable (e.g. labels, roles). WCAG 2.1 AA audit is pending (see project plan).
- **Responsive:** Tailwind breakpoints; layout adapts to screen size.

---

## 11. Configuration

- **Environment:** `.env` (or `.env.local`). Key variables: `NEXTAUTH_SECRET`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `KEYCLOAK_ISSUER`, `NEXT_PUBLIC_API_URL`.
- **API URL:** Must point to meeting-service (e.g. http://localhost:8081) when not using Kong.

---

## 12. Document Index (Multi-Part TDD)

| Part | Title |
|------|--------|
| Part 1 | Overview & Architecture |
| Part 2 | Backend & APIs |
| Part 3 | Frontend & UX (this document) |
| Part 4 | Data & Integration |

---

*End of Part 3.*
