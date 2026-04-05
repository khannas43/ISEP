# ISEP Test Cases — Master Index
> **Project:** IMO Strategic Engagement Platform (ISEP) — Directorate General of Shipping, MoPSW  
> **Version:** 1.0 | **Classification:** CONFIDENTIAL  
> **Usage:** Pass individual files to Cursor based on the area under development

**Alignment (latest):** Login at `/`; post-login redirect to **Dashboard** at `/dashboard/executive` (single Dashboard entry in nav). **Navigation:** Dashboard, Bodies (Bodies list, Add Body), Meetings (Meetings list, Create Meeting), Document library, Papers, Tasks (Tasks by meeting, My tasks, Team dashboard), Correspondence Groups, Reports, Calendar, Admin (User list, New user, Bulk import, New announcement, System admin, System health, System config, Workflow config, Backups, Audit log), Account (My profile, Change password, Notification preferences, Notification centre). **Admin** visible only to SYSTEM_ADMIN and IC_DIVISION_HEAD. Unauthorized access redirects to `/unauthorized` (not `/403`). Meeting IDs are UUIDs; use seed meeting ID or "Sea Fire Fighting" meeting from list. Papers: `/papers`, `/papers/{id}/draft`, `/papers/{id}/approval`. **Sign out:** sidebar button "Sign out" (no avatar dropdown). System Administration screens SCR-SYS-01 to **05** (includes Backups).

---

## File Index

| File | Document Ref | Coverage | Test Cases | Tool Layers |
|---|---|---|---|---|
| `ISEP-TC-01-Auth-RBAC.md` | ISEP-TC-01 | Keycloak auth, RoleGuard, @PreAuthorize, PostgreSQL RLS | 18 | Jest, JUnit, Testcontainers, Playwright |
| `ISEP-TC-02-Paper-Approval.md` | ISEP-TC-02 | Full 7-stage approval chain, state machine, concurrent edits | 12 | JUnit, Testcontainers, Playwright |
| `ISEP-TC-03-AI-Features.md` | ISEP-TC-03 | Position Advisor, Preparedness Intelligence, Draft Assistant | 17 | Pytest + respx, Playwright |
| `ISEP-TC-04-All-Modules.md` | ISEP-TC-04 | All 15 modules, 70 screens | 38 | Jest, JUnit, Playwright |
| `ISEP-TC-05-API-Contracts.md` | ISEP-TC-05 | All ~70 API routes × 6 roles via Kong CE | 24 suites | Playwright API, JUnit |
| `ISEP-TC-06-UAT-SeaFireFighting.md` | ISEP-TC-06 | End-to-end UAT: full meeting lifecycle | 18 UAT scenarios | Playwright E2E |

**Total: 127 test cases / suites across 6 files**

---

## How to Use with Cursor

**Load only the file(s) relevant to what you're building — keeps context lean.**

### Approval chain work (paper drafting, 7-stage flow):
```
@ISEP-TESTING-CONTEXT.md + @ISEP-TC-02-Paper-Approval.md
```

### Full UAT (end-to-end meeting lifecycle, Sea Fire Fighting):
```
@ISEP-TC-06-UAT-SeaFireFighting.md
```
**TC-06 is dual-purpose:** (1) Playwright E2E script blueprint for the 18 scenarios; (2) formal UAT sign-off checklist for DGS — the 18-row approval table at the end is ready to print and sign.

### Other areas:
```
@ISEP-TESTING-CONTEXT.md + @ISEP-TC-01-Auth-RBAC.md   → Auth, RBAC, RLS
@ISEP-TESTING-CONTEXT.md + @ISEP-TC-03-AI-Features.md → AI endpoints
@ISEP-TC-04-All-Modules.md                            → All 15 modules
@ISEP-TC-05-API-Contracts.md                          → API contracts (Kong, 70 routes)
```

---

## Critical Invariants (Never Break)

1. **Participant isolation** — MEMBER sees only own delegation's data. Verified: TC-01-RLS-001, TC-05-API-013, TC-06-UAT-015
2. **AI outputs always DRAFT** — `status=DRAFT`, `auto_committed=false`. Verified: TC-03-AI-001/002/012/013
3. **Approval chain sequence** — No stage skipping. Verified: TC-02-CHAIN-002, TC-05-API-015
4. **RBAC 403 enforcement** — Wrong role = 403 on every route. Verified: TC-01-RBAC-004, TC-05 (all routes)
5. **SonarQube gate** — No merge if Quality Gate FAILED. Enforced in GitLab CI.

---

## Test Count by Layer

| Layer | Tool | Test Cases |
|---|---|---|
| L1 Frontend Unit | Jest + RTL | ~15 |
| L2 Backend Unit | JUnit 5 + Mockito | ~20 |
| L3 Backend Integration | Spring Boot Test + Testcontainers | ~12 |
| L4 AI Features | Pytest + respx | ~17 |
| L5 E2E + API | Playwright | ~63 |
| **Total** | | **~127** |

---

*Master Index: ISEP-TEST-CASES-INDEX | v1.0 | Confidential*
