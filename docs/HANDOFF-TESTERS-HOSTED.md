# ISEP — Tester handoff (hosted environment)

**Purpose:** Instructions and references for testing the ISEP application on the hosted public URL with different roles.

**App URL:** **http://148.230.66.191/isep**  
Use this exact URL (including `/isep`). Do **not** use `http://148.230.66.191/` alone — that serves a different application.

---

## 1. Quick start

1. Open **http://148.230.66.191/isep** in your browser.
2. Log in with one of the test accounts below.
3. Verify navigation and access match the role (see [Test users](#2-test-users) and [Role behaviour](#3-role-behaviour)).
4. Use the test-case documents in the repo for detailed scenarios.

---

## 2. Test users

These accounts are set up in Keycloak (isep-realm). Use them to test role-based behaviour.

| Username   | Password     | Role              | Typical use |
|------------|--------------|-------------------|-------------|
| admin-sa   | Admin@12345! | SYSTEM_ADMIN      | Full admin: user list, system config, audit, announcements, backups |
| ih-user    | Ih@12345!     | IC_DIVISION_HEAD  | Admin + audit read, paper approval, MFA |
| dl-user    | Dl@12345!     | DELEGATION_LEADER | Meetings, papers, live meeting flows |
| co-user    | Co@12345!     | COORDINATOR       | Create meetings, agenda, correspondence groups |
| me-user    | Me@12345!     | MEMBER            | Feedback, paper drafting, my tasks |
| vw-user    | Vw@12345!     | VIEWER            | Read-only: calendar, notifications, meetings, documents |

**MFA (admin-sa, ih-user):** After password, you may be prompted for a one-time code. If the test environment uses a fixed OTP, use **123456** (confirm with the dev team).

---

## 3. Role behaviour

- **SYSTEM_ADMIN (admin-sa):** Sees **Admin** in the sidebar (User list, New user, Bulk import, New announcement, System admin, System health, System config, Workflow config, Backups, Audit log). Full access to all screens.
- **IC_DIVISION_HEAD (ih-user):** Same as above including **Admin** (User list, Audit log, etc.). No “New user” / “Bulk import” / “System config” etc. if restricted to IH in your build.
- **DELEGATION_LEADER, COORDINATOR, MEMBER:** Dashboard, Bodies, Meetings, Document library, Papers, Tasks, Correspondence Groups, Reports, Calendar, Account. No **Admin** menu.
- **VIEWER (vw-user):** Same nav as above; read-only (no create/edit/delete). Access to restricted areas (e.g. some reports, admin) should redirect to **Unauthorized**.

After login, confirm the sidebar matches the role. Wrong-role access should redirect to the “Unauthorized” page (`/isep/unauthorized`).

---

## 4. Test-case documents (in repo)

Use these for structured testing. They live under **Testing/** in the project root.

| Document | Path | Coverage |
|----------|------|----------|
| **Testing overview** | `Testing/README.md` | Folder structure and which file to use for which area |
| **Test case index** | `Testing/Test Cases/ISEP-TEST-CASES-INDEX.md` | Master index of all 6 test-case files |
| **Auth & RBAC** | `Testing/Test Cases/ISEP-TC-01-Auth-RBAC.md` | Login, logout, all 6 roles, nav visibility, unauthorized access |
| **Paper approval** | `Testing/Test Cases/ISEP-TC-02-Paper-Approval.md` | 7-stage approval chain, state machine |
| **AI features** | `Testing/Test Cases/ISEP-TC-03-AI-Features.md` | Position Advisor, Preparedness, Draft Assistant |
| **All modules** | `Testing/Test Cases/ISEP-TC-04-All-Modules.md` | All 15 modules, ~70 screens |
| **API contracts** | `Testing/Test Cases/ISEP-TC-05-API-Contracts.md` | API routes and role access |
| **UAT (Sea Fire Fighting)** | `Testing/Test Cases/ISEP-TC-06-UAT-SeaFireFighting.md` | End-to-end UAT scenarios + **18-row sign-off checklist** |

For **full UAT sign-off**, use **ISEP-TC-06-UAT-SeaFireFighting.md** and the 18-row checklist at the end.

---

## 5. Keycloak and token issues

If you see **“Access denied”**, **“Your role: None”**, or the sidebar does not show the expected menu for a role:

- The access token may not include realm roles. This is a server/Keycloak configuration issue.
- Reference for the dev team: **`infrastructure/keycloak/README.md`** → section **“Token missing realm roles”** (Option A: fix in Keycloak UI; Option B: re-import realm).

Report the exact user, role, and screen/link that failed so the team can fix the Keycloak client scope and mappers.

---

## 6. What to report

- **URL and user:** e.g. `http://148.230.66.191/isep`, user `co-user`.
- **Steps:** What you clicked (login, then which menu and page).
- **Expected:** From the test case or this doc (e.g. “Admin menu should not be visible for co-user”).
- **Actual:** What you saw (screenshot or copy-paste of message).
- **Browser:** Name and version (e.g. Chrome 120).

---

## 7. Optional: running automated tests

If you are also running automated tests (Playwright, Jest) against the **hosted** URL instead of localhost, you will need:

- Base URL set to `http://148.230.66.191/isep` in the test config.
- The same test users and passwords as above.
- See **`Testing/RUN-TESTING.md`** and **`Testing/E2E-PREREQUISITES.md`** for local/Docker test run; adapt `NEXTAUTH_URL` and app URL to the hosted environment if your suite supports it.

---

*Last updated: 2026-02. For ISEP (IMO Strategic Engagement Platform), DGS.*
