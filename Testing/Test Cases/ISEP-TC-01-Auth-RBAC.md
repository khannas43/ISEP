# ISEP Test Cases — TC-01: Authentication & RBAC
> **Document Ref:** ISEP-TC-01 | **Version:** 1.0 | **Layer:** L1 (Jest) + L2 (JUnit) + L5 (Playwright)  
> **Format:** Step-by-step numbered (UAT style) | **Depth:** Full detail  
> **Classification:** CONFIDENTIAL

---

## Category 1 — Keycloak Authentication Flows

### TC-01-AUTH-001: Successful Login — DELEGATION_LEADER Role
**Tool:** Playwright E2E  
**Priority:** Critical  
**Precondition:** Keycloak dev realm running; user `dl.test` seeded with role `DELEGATION_LEADER`

**Steps:**
1. Navigate to `http://localhost:3000`
2. Verify login page is shown (at `/`)
3. Enter username: `dl.test`
4. Enter password: `Password@123`
5. Click **Sign In**
6. Wait for redirect to Dashboard

**Expected Output:**
- URL is `/dashboard/executive` (or redirects there from `/dashboard`)
- User name and email shown in sidebar
- Navigation shows: **Dashboard**, Bodies, Meetings, Document library, Papers, Tasks, Correspondence Groups, Reports, Calendar; no **Admin** menu (Admin only for SYSTEM_ADMIN and IC_DIVISION_HEAD)

**Edge Cases:**
- If Keycloak is down → show error banner "Authentication service unavailable" (do not expose stack trace)
- If user account is disabled in Keycloak → show "Account disabled. Contact administrator."

---

### TC-01-AUTH-002: Successful Login — All 6 Roles (Parametrised)
**Tool:** Playwright E2E  
**Priority:** Critical  
**Precondition:** All 6 test users seeded in Keycloak

| Step | Action |
|---|---|
| 1 | Navigate to `/` (login page) |
| 2 | Enter credentials for role under test (see table below) |
| 3 | Click **Sign In** |
| 4 | Verify dashboard loads |
| 5 | Verify navigation items match role |
| 6 | Logout and repeat for next role |

**Test Data:**

| Role | Username | Expected Nav Items |
|---|---|---|
| `SYSTEM_ADMIN` | `admin.test` | Dashboard, Bodies, Meetings, Document library, Papers, Tasks, Correspondence Groups, Reports, Calendar, **Admin** (User list, New user, System admin, System config, Audit log, etc.), Account |
| `IC_DIVISION_HEAD` | `icdh.test` | Same as above including **Admin** (User list, Audit log, etc.) |
| `DELEGATION_LEADER` | `dl.test` | Dashboard, Bodies, Meetings, Document library, Papers, Tasks, Correspondence Groups, Reports, Calendar, Account (no Admin) |
| `COORDINATOR` | `coord.test` | Dashboard, Bodies, Meetings, Document library, Papers, Tasks, Correspondence Groups, Reports, Calendar, Account |
| `MEMBER` | `member1.test` | Dashboard, Bodies, Meetings, Document library, Papers, Tasks (My tasks), Correspondence Groups, Reports, Calendar, Account |
| `VIEWER` | `viewer.test` | Dashboard, Bodies, Meetings, Document library, Papers, Tasks, Correspondence Groups, Reports, Calendar, Account (read-only access) |

**Expected Output per role:** Dashboard renders without JS errors; nav items match above table exactly.

---

### TC-01-AUTH-003: Invalid Credentials
**Tool:** Playwright E2E  
**Priority:** High

**Steps:**
1. Navigate to `/` (login page)
2. Enter username: `dl.test`
3. Enter password: `WrongPassword`
4. Click **Sign In**

**Expected Output:**
- Remain on login page (`/`)
- Error message: "Invalid username or password"
- Password field cleared
- No JWT token stored in browser session

**Edge Cases:**
- After 5 failed attempts → account locked message shown
- Empty username → inline validation "Username is required"
- Empty password → inline validation "Password is required"

---

### TC-01-AUTH-004: Session Expiry & Token Refresh
**Tool:** Playwright E2E  
**Priority:** High  
**Precondition:** Keycloak access token TTL set to 60 seconds in test realm

**Steps:**
1. Login as `coord.test`
2. Verify dashboard loads
3. Wait 65 seconds (access token expires)
4. Navigate to `/meetings`
5. Observe automatic token refresh via Keycloak refresh token

**Expected Output:**
- Meetings page loads without re-login prompt (silent token refresh succeeded)
- No "Session expired" banner

**Edge Cases:**
- If refresh token also expired (>30 min idle) → redirect to login page (`/`) with message "Your session has expired. Please log in again."
- Active work in form → warn user before redirect: "Your session is about to expire. Save your work."

---

### TC-01-AUTH-005: Logout
**Tool:** Playwright E2E  
**Priority:** High

**Steps:**
1. Login as `member1.test`
2. In the **left sidebar**, scroll to bottom and click **Sign out**
3. Verify redirect to login page (`/`)
4. Press browser **Back** button

**Expected Output:**
- Step 3: URL is `/` (login page)
- Step 4: Back button does NOT return to dashboard — JWT cleared, redirect back to login page (`/`)
- Keycloak session terminated (verify via Keycloak admin console: active sessions = 0 for user)

---

## Category 2 — RBAC: Frontend RoleGuard

### TC-01-RBAC-001: MEMBER Cannot See Approve Button
**Tool:** Jest + React Testing Library  
**Priority:** Critical

**Steps:**
1. Render `<PaperApprovalActions role="MEMBER" paperId="P001" />`
2. Query for button with text "Approve"
3. Query for button with text "Submit to Group Leader"

**Expected Output:**
- `screen.queryByText('Approve')` → `null`
- `screen.queryByText('Submit to Group Leader')` → `null`
- `screen.getByText('View')` → present (read-only permitted)

---

### TC-01-RBAC-002: DELEGATION_LEADER Sees Full Approval Actions
**Tool:** Jest + React Testing Library  
**Priority:** Critical

**Steps:**
1. Render `<PaperApprovalActions role="DELEGATION_LEADER" paperId="P001" paperStatus="PENDING_DL_REVIEW" />`
2. Query all action buttons

**Expected Output:**
- `screen.getByText('Approve & Forward to IC Division')` → present
- `screen.getByText('Return for Revision')` → present
- `screen.getByText('View History')` → present

---

### TC-01-RBAC-003: VIEWER Has No Write Actions Anywhere
**Tool:** Playwright E2E (full app)  
**Priority:** Critical

**Steps:**
1. Login as `viewer.test`
2. Navigate to `/meetings`
3. Open any meeting (meeting detail with tabs: Overview, Participants, Agenda, Tasks, Documents, etc.)
4. Use **Agenda** tab within the meeting (no top-level `/agenda` — agenda is under meeting)
5. Use **Document library** (`/documents`) and meeting's Documents tab
6. Use meeting agenda item for feedback/collaboration (under Meetings → meeting → Agenda tab)

**Expected Output:**
- No `Create`, `Edit`, `Delete`, `Approve`, `Submit`, `Upload` buttons visible on any screen
- All content displayed in read-only mode
- Attempting direct URL `/meetings/create` → redirect to `/unauthorized`

---

### TC-01-RBAC-004: RoleGuard — Direct URL Access by Wrong Role
**Tool:** Playwright E2E  
**Priority:** Critical

**Test Matrix:**

| URL | Attempted Role | Expected Result |
|---|---|---|
| `/admin/users` | `MEMBER` | Redirect to `/unauthorized` |
| `/admin/users` | `VIEWER` | Redirect to `/unauthorized` |
| `/papers/{paperId}/approval` | `MEMBER` | Redirect to `/unauthorized` (use a real paper UUID from seed) |
| `/papers/{paperId}/approval` | `VIEWER` | Redirect to `/unauthorized` |
| `/meetings/create` | `VIEWER` | Redirect to `/unauthorized` |
| `/admin/audit` | `MEMBER` | Redirect to `/unauthorized` |

**Steps per row:**
1. Login as the role in column 2
2. Directly navigate to URL in column 1
3. Verify result in column 3

---

## Category 3 — RBAC: Backend Spring Security

### TC-01-BE-001: @PreAuthorize Blocks Wrong Role — Paper Approval
**Tool:** JUnit 5 + `@WithMockUser`  
**Priority:** Critical

**Steps:**
1. Load Spring Security test context
2. Set security context: `@WithMockUser(roles = "MEMBER")`
3. Call `paperApprovalService.approveAndForwardToDL(paperId)`

**Expected Output:**
- Throws `AccessDeniedException`
- No database write executed (verify mock repository `save()` never called)

---

### TC-01-BE-002: @PreAuthorize Allows Correct Role
**Tool:** JUnit 5  
**Priority:** Critical

**Steps:**
1. Set security context: `@WithMockUser(roles = "DELEGATION_LEADER")`
2. Mock `paperRepository.findById()` to return valid paper in `PENDING_DL_REVIEW` status
3. Call `paperApprovalService.approveAndForwardToDL(paperId)`

**Expected Output:**
- No exception thrown
- `paperRepository.save()` called once
- Paper status updated to `PENDING_IC_REVIEW`

---

## Category 4 — RBAC: PostgreSQL Row Level Security

### TC-01-RLS-001: MEMBER Sees Only Own Delegation Feedback
**Tool:** Testcontainers + Spring Boot Test  
**Priority:** Critical — Core Security Invariant

**Steps:**
1. Start PostgreSQL 16 Testcontainer with all Flyway migrations applied
2. Seed feedback rows for 3 delegations: `IND`, `GBR`, `USA`
3. Set database session variable: `SET app.current_delegation = 'IND'`
4. Set role: `SET ROLE member`
5. Execute: `SELECT * FROM feedback`

**Expected Output:**
- Result set contains ONLY rows where `delegation_code = 'IND'`
- `GBR` and `USA` rows are NOT returned
- Row count matches exactly the number seeded for `IND`

**Edge Cases:**
- Attempt `SET app.current_delegation = 'GBR'` while authenticated as IND member → RLS policy blocks, returns empty
- Direct `UPDATE feedback SET content = 'tampered'` by MEMBER → `ERROR: insufficient privilege`

---

### TC-01-RLS-002: COORDINATOR Sees All Feedback After Consolidation Phase
**Tool:** Testcontainers  
**Priority:** Critical

**Steps:**
1. Seed feedback for 3 delegations in meeting `M001`, agenda item `AI-004`
2. Set role: `SET ROLE coordinator`
3. Set session: `SET app.current_meeting = 'M001'`
4. Execute: `SELECT * FROM feedback WHERE agenda_item_id = 'AI-004'`

**Expected Output:**
- All feedback rows returned regardless of `delegation_code`
- COORDINATOR can read all for consolidation

---

### TC-01-RLS-003: VIEWER Has Read-Only Access — Cannot Insert
**Tool:** Testcontainers  
**Priority:** High

**Steps:**
1. Set role: `SET ROLE viewer`
2. Execute: `INSERT INTO tasks (title, assigned_to) VALUES ('Injected Task', 'admin')`

**Expected Output:**
- `ERROR: new row violates row-level security policy for table "tasks"`
- No row inserted

---

*Document: ISEP-TC-01 | Auth & RBAC | 18 test cases | v1.0*
