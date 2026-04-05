# ISEP — UI/UX designer handoff

**Purpose:** Code locations and instructions for developing or refining layouts and visual design for the ISEP frontend.

**Live reference:** **http://148.230.66.191/isep** — use for screenshots and behaviour reference.

---

## 1. Tech stack

| Layer      | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language  | TypeScript |
| Styling   | **Tailwind CSS** |
| UI        | Radix-style primitives, custom components |
| Font      | Plus Jakarta (via CSS variable), with system fallback |

There is no separate design-token package; all design tokens and shared styles live in the repo under **`frontend/`**.

---

## 2. Where to change layout and visuals

### 2.1 Design tokens and global styles

| File | Purpose |
|------|--------|
| **`frontend/src/app/globals.css`** | CSS variables: `--color-primary`, `--color-surface`, `--sidebar-bg`, `--radius`, `--shadow`, etc. Component classes: `.page-container`, `.card`, `.btn-primary`, `.badge-*`, `.table-*`, ProseMirror editor styles. |
| **`frontend/tailwind.config.ts`** | Tailwind theme: `primary` palette (50–900), `fontFamily.sans` (Plus Jakarta), `boxShadow.soft`. |

Change colours, spacing, radii, and shadows here so they apply consistently. Use the existing variables and Tailwind theme in components instead of hardcoding values.

### 2.2 Shell and navigation

| File | Purpose |
|------|--------|
| **`frontend/src/app/layout.tsx`** | Root layout: font setup, import of `globals.css`, main structure. |
| **`frontend/src/components/AppShell.tsx`** | App shell: session/loading, when to show sidebar vs standalone (e.g. login, unauthorized). |
| **`frontend/src/components/Sidebar.tsx`** | Left sidebar: navigation structure, role-based visibility, sign out. |
| **`frontend/src/components/AppNav.tsx`** | Navigation component used by the sidebar. |

Layout and navigation changes (sidebar width, header, main content area) should be done in **AppShell** and **Sidebar**; link labels and structure are in **Sidebar** / **AppNav**.

### 2.3 Page structure and key screens

Routes and pages live under **`frontend/src/app/`**. Key areas for layout work:

| Area | Path | Notes |
|------|------|--------|
| **Dashboard** | `app/dashboard/executive/page.tsx`, `ISEPExecutiveDashboard.tsx`, `ExecutiveDashboardSummary.tsx` | Executive summary and cards. Role-specific: `IHDashboard.tsx`, `DLDashboard.tsx`, `CODashboard.tsx`, `MEDashboard.tsx`, `VWDashboard.tsx`. |
| **Meetings** | `app/meetings/page.tsx`, `app/meetings/[id]/page.tsx`, `MeetingTabs.tsx`, `EditMeetingForm.tsx`, `MeetingForm.tsx` | List, detail, tabs, create/edit forms. |
| **Bodies** | `app/bodies/page.tsx`, `app/bodies/[id]/page.tsx`, `BodyForm.tsx` | List, detail, form. |
| **Documents** | `app/documents/page.tsx`, `app/documents/[id]/page.tsx`, compare view | Library and document detail. |
| **Papers** | `app/papers/`, draft and approval pages | Paper list, draft, approval flow. |
| **Tasks** | `app/tasks/page.tsx`, `app/tasks/my/page.tsx`, `app/tasks/team/page.tsx` | Task list and team dashboard. |
| **Correspondence groups** | `app/correspondence-groups/page.tsx`, `CGForm.tsx` | List and form. |
| **Reports** | `app/reports/page.tsx`, `app/reports/meeting-summary/`, `app/reports/audit/`, etc. | Report listing and individual reports. |
| **Admin** | `app/admin/users/page.tsx`, `app/admin/system/`, `app/admin/audit/page.tsx` | User list, system health/config, audit log. |
| **Login / auth** | `app/login/page.tsx`, `components/LoginForm.tsx` | Login layout and form. |

Use existing **`.page-container`**, **`.page-header`**, **`.card`**, **`.table-*`** (see `globals.css`) so new layouts stay consistent.

---

## 3. Design system (globals.css)

**CSS variables (colours, spacing, shadows):**

- **Primary / accent:** `--color-primary`, `--color-primary-hover`, `--color-accent`
- **Surfaces:** `--color-surface`, `--color-surface-elevated`
- **Borders:** `--color-border`, `--color-border-subtle`
- **Text:** `--color-text`, `--color-text-muted`, `--color-text-faint`
- **Sidebar:** `--sidebar-bg`, `--sidebar-text`, `--sidebar-text-muted`, `--sidebar-hover`, `--sidebar-active`
- **Layout:** `--radius`, `--radius-sm`; `--shadow-sm`, `--shadow`, `--shadow-md`

**Utility classes:**

- **Layout:** `.page-container`, `.page-header`, `.page-title`, `.page-subtitle`
- **Cards:** `.card`, `.card-header`, `.card-body`
- **Buttons:** `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- **Forms:** `.input-base`
- **Tables:** `.table-container`, `.table-header`, `.table-cell`
- **Badges:** `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-neutral`, `.badge-info`

**Accessibility:** Focus styles are defined in `globals.css` for `*:focus-visible` (ring). Keep focus visible when changing button or link styles.

---

## 4. Conventions

1. **Use design tokens:** Prefer CSS variables and Tailwind theme (e.g. `primary`, `slate`) over new magic numbers so themes and future changes stay consistent.
2. **Sidebar:** Uses `--sidebar-*` variables; preserve contrast and hierarchy (active state, hover, muted text).
3. **Responsiveness:** Layouts use Tailwind breakpoints (`sm:`, `md:`, `lg:`). Keep new components responsive.
4. **Components:** Reusable UI lives in **`frontend/src/components/`** (e.g. `AppShell`, `Sidebar`, `LoginForm`, `ComingSoon`, `ApiUnavailableBanner`). Add new shared components here.
5. **Forms and tables:** Reuse `.input-base`, `.table-*`, and `.card` so forms and list/detail screens stay consistent.

---

## 5. Reference docs (in repo)

| Document | Path | Use |
|----------|------|-----|
| **Frontend & UX design** | `docs/design/ISEP-Technical-Design-Part3-Frontend-and-UX.md` | App structure, routing, auth, RBAC, data flow. |
| **Screens & RBAC** | `SRS/ISEP-Screens-RBAC.md` | Full screen list, descriptions, and role access (SA, IH, DL, CO, ME, VW). |

Use these to understand which screens exist, who can see them, and how they fit into the app flow.

---

## 6. File tree (high level)

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          ← Design tokens + utility classes
│   │   ├── layout.tsx           ← Root layout
│   │   ├── login/               ← Login, MFA
│   │   ├── dashboard/           ← Role-based dashboards
│   │   ├── meetings/            ← Meetings list, detail, create, edit, agenda, live
│   │   ├── bodies/              ← Bodies list, detail, forms
│   │   ├── documents/           ← Document library
│   │   ├── papers/              ← Papers list, draft, approval
│   │   ├── tasks/               ← Tasks (my, team)
│   │   ├── correspondence-groups/
│   │   ├── reports/             ← Reports home + report types
│   │   ├── calendar/
│   │   ├── notifications/
│   │   ├── account/             ← Profile, change password, preferences
│   │   ├── admin/               ← Users, system, audit, announcements
│   │   └── api/                 ← Next.js API routes (auth, proxy)
│   └── components/              ← Shared UI (AppShell, Sidebar, forms, etc.)
└── tailwind.config.ts            ← Theme (colors, font, shadow)
```

---

*Last updated: 2026-02. For ISEP (IMO Strategic Engagement Platform), DGS.*
