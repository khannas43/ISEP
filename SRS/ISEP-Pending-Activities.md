# ISEP — Pending Activities & Action Register
**Project:** IMO Strategic Engagement Platform (ISEP)
**Client:** Directorate General of Shipping (DGS), MoPSW, Government of India
**Prepared by:** MagicSword 🗡️
**Date:** 05 April 2026
**Version:** 1.3

> **Confidentiality:** Never use firm name — always "the firm". Never use real client names — always "the client" or "DGS".

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Done |
| 🚨 | Critical / blocks demo or milestone |
| 📋 | Needs DGS decision before action |

---

## v1.1 Change Log (04 Apr 2026)

| # | Change |
|---|---|
| 1 | B-03, B-04, C-02, B-01 marked ✅ Specified — CURSOR-PROJECT-CONTEXT.md patch v2.1 applied and confirmed by Cursor |
| 2 | S-01 through S-08 SRS updates marked ✅ Done |
| 3 | Section 6 added — next Cursor instructions (Steps 6.1–6.6) |
| 4 | `ISEP-i18n-AppRouter-Clarification.md` added — App Router i18n equivalent for Step 6.4 (not `next-i18next` / `_app.tsx`) |

## v1.2 Change Log (04 Apr 2026)

| # | Change |
|---|---|
| 1 | **Steps 6.1–6.6** — Completed in repo: Elasticsearch grep/report; OpenSearch in `infrastructure/docker/docker-compose.dev.yml` + compose validate; **V16** (`V16__audit_device_attributes_v2_1.sql`) + `DeviceTypeUtil.java`; **i18n** scaffold (`frontend/src/i18n/`, `frontend/public/locales/en/common.json`); **thin-client** ESLint + `.gitlab-ci.yml` lint gate; Step 6.6 completion report delivered |
| 2 | **Batch 3 Step 10 (TASK-S1-06)** — Tasks on **`core.tasks`** (not `workflow.tasks`): **V18** migration file; **meeting-service** APIs `POST/GET /api/v1/tasks` (+ `/my`, `/team`, `/team/export`, `/{id}`); Kong route `/api/v1/tasks`; **escalation** in meeting-service (daily 08:00 UTC + `POST /api/v1/system/jobs/escalate-tasks`); frontend **CreateTaskModal** on agenda item Tasks tab; **`/tasks/my`** board + **TaskCard**; sidebar overdue badge; i18n keys for tasks |
| 3 | **A-D-01–A-D-04** status advanced to ✅ **Done (build)** — live DB must still apply Flyway **V18**; acceptance tests in `ISEP-Cursor-Batch3.md` §10.7 remain manual; **workflow-service Celery** escalation not implemented (deferred) |
| 4 | **B-01, B-03, B-04** — Implementation done in codebase (was “specified / pending”) |

## v1.3 Change Log (05 Apr 2026)

| # | Change |
|---|---|
| 1 | **A-E-02 (TipTap / track changes)** — Marked **✅ Done (build)** per TASK-S2-01: `PaperEditor` / paper draft route, document editor, collaborative layers (see Batch 4–6 docs); remaining = manual UAT + production hardening (JWT on Y.js WS). |
| 2 | **A-E-03 (version compare)** — Marked **🔄 Partial** — `frontend` document compare (`/documents/[id]/compare`); full “accept/reject → clean copy” workflow still to align with demo script. |
| 3 | **A-E-01 (upload / paper prep)** — Marked **🔄 Partial** — meeting document upload + document library; **not** dedicated auto-tagged “paper preparation folder” productization. |
| 4 | **A-B-01 (calendar)** — Marked **🔄 Partial** — **`/calendar`** page; sidebar hover tooltips may still need UX pass. |
| 5 | **Module F (CG)** — **A-F-01** marked **✅ Done (build)** — correspondence groups CRUD, meeting linkage, member assignment paths in app; verify on target env. |
| 6 | **Module G (live meeting)** — **A-G-01** → **🔄 Partial** — live lobby, agenda item, interventions routes; threaded “discussion boards” still partial. **A-G-02/A-G-03** → **🔄 Partial** where comments/permissions exist on agenda. |
| 7 | **Dashboards (A-H)** — **A-H-02** → **🔄 Partial** — Executive Dashboard (`/dashboard/executive`): meetings by phase, papers by stage, task counts, insights + per-meeting drill-down. A-H-01/03/04/05 remain open or light partial. |
| 8 | **Audit (demo narrative)** — **POST** `/api/v1/reports/audit`, LOGIN (client) + VIEW audit (admin page), Hibernate **jsonb** mapping + **V15** `ip_address` VARCHAR; seed dummy audit rows removed. Surfaced under **Admin → Audit log**. |
| 9 | **UX / nav** — Single **Dashboard** menu → `/dashboard/executive`; sidebar collapse; programmatic sign-out; `DEMO-Development-Activities-Pages-1-2.md` status pass aligned to app. |
| 10 | **Test cases** — `Testing/Test Cases/*` updated for current routes, UUIDs, `/unauthorized`, `/api/v1/`. |

---

## Section 1 — Category A: Functional Feature Gaps

### Tier 1 — Demo-Critical (Phases 1–3 live)

#### Module D — Task Allocation & Workflow Automation

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-D-01 | Build task creation from agenda context | Leaders/coordinators create tasks linked to a specific agenda item + document. **Delivered:** `POST /api/v1/tasks`, `CreateTaskModal` on agenda item page, multi-assignee + optional document link; data in **`core.tasks`** + `core.task_assignees`. **Apply Flyway V18 on target DB.** | 3–5 days | Phase 1 | ✅ 🚨 |
| A-D-02 | Build member personal task dashboard | Member view: pending / ongoing / completed tasks. **Delivered:** `/tasks/my` (Pending / In progress / Completed), `GET /api/v1/tasks/my`, `TaskCard`, overdue alert + nav badge. | 2–3 days | Phase 2 | ✅ 🚨 |
| A-D-03 | Build task escalation workflow | Automatic escalation for unresolved / overdue tasks. **Delivered in meeting-service:** scheduler + `POST /api/v1/system/jobs/escalate-tasks` (SYSTEM_ADMIN). **Not:** Python/Celery in workflow-service per Batch 3 sketch. | Medium | Phase 1–2 | ✅ |
| A-D-04 | Build leader task dashboard with export | Leader view: all pending/completed tasks across team. XML/Excel export. **Delivered:** `GET /api/v1/tasks/team`, `GET /api/v1/tasks/team/export` (xlsx/xml). | Medium | Phase 3 | ✅ |

#### Module E — Paper Preparation & Multi-Level Approval

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-E-01 | Build document upload into paper preparation folder | Upload PDF/Word/HTML into dedicated folder, auto-tagged by committee, agenda item, meeting. **Built:** meeting **Documents** tab + upload, document library. **Gap:** auto-tagging + branded “folder” UX. | 3–5 days | Phase 1 | 🔄 🚨 |
| A-E-02 | Build collaborative track-changes editor (TipTap) | Inline edits, track changes mode, version control, automatic timestamping without altering source. **Delivered:** `PaperEditor` / TipTap on **`/papers/[id]/draft`**, document editor route; Y.js layers per Batch 5–6. **Remaining:** two-browser UAT, prod WS auth. | 3–4 weeks | Phases 2,3,4,5 | ✅ |
| A-E-03 | Build version comparison / clean copy tool | Approvers accept/reject individual changes; generates clean copy. **Delivered:** **`/documents/[id]/compare`**. **Gap:** granular accept/reject → clean copy tied to approval UX. | 1–2 weeks | Phase 3 | 🔄 🚨 |
| A-E-04 | Build structured templates for interventions and positions | Templates for intervention statements, deliberation comments, national position papers. | Medium | Phase 2–3 | ⬜ |

#### Module B — Agenda, Document & Version Management

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-B-01 | Build calendar sidebar with hover-over summaries | **Delivered:** **`/calendar`** page with meeting links. **Gap:** sidebar widget + hover summaries (matrix row 18) if still required verbatim. | Medium | Phase 1 | 🔄 |

#### Module C — Collaboration, Feedback & Deliberation

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-C-01 | Verify and complete historical archive of feedback per meeting | Build status unconfirmed with developer. Confirm and close. | Medium | Phase 2–3 | ⬜ |

---

### Tier 2 — Post-Demo (required for Go-Live, not demo-blocking)

#### Module F — Correspondence Group Management

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-F-01 | Verify Module F build status with developer | **Built:** CG list/create/edit, members, meeting ↔ CG linkage, submissions paths. **Action:** confirm on deployed DB + demo script only. | — | ✅ |

#### Module G — Meeting-Time Collaboration (show as wireframe at demo)

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-G-01 | Build live meeting module + discussion boards | **Delivered (base):** live lobby, live agenda item, interventions (`/meetings/[id]/live/...`). **Gap:** full “discussion board” product + OI-008 scope. | 2–3 weeks | 🔄 📋 |
| A-G-02 | Build commenting, tagging, @mention | Agenda item comments / activity; **@mention** may be partial. | Medium | 🔄 |
| A-G-03 | Build role-based editing/commenting permissions during meetings | RBAC on meeting/agenda routes; live-session-specific rules — verify in UAT. | Bundled | 🔄 |

#### Module H — Dashboards, Reports & Analytics (show as wireframe at demo)

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-H-01 | Build MoM / Summary Report auto-generation | Auto-generate Minutes of Meeting with attendee list and action items. Outcomes/report pages partial. | 1 week | 🔄 |
| A-H-02 | Build analytics dashboard | **Partial:** Executive Dashboard — meetings (in progress / upcoming / archived), papers by stage, task counts, insights; per-meeting executive view. Deep participation metrics TBD. | 1–2 weeks | 🔄 |
| A-H-03 | Build visualization tools | Charts on dashboard / reports — light coverage; expand for leadership story. | 1 week | 🔄 |
| A-H-04 | Build export in PDF, XML, Excel | Downloadable configurable reports. | 1 week | ⬜ |
| A-H-05 | Build historical archive of feedback per meeting | Institutional memory — indexed archive by meeting/agenda. | Medium | 🔄 |

#### Module I — Calendar, Alerts & Notifications

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-I-01 | Confirm email notification delivery with developer | In-portal alerts appear built. Email delivery unconfirmed. RFP requires both channels. | — | ⬜ |

#### Module K / VIEWER Role

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-K-01 | Confirm VIEWER role is read-only by design; document in RBAC matrix | Must be explicitly documented so DGS doesn't flag it during demo. | — | ⬜ |

#### Module — International Engagements (Others+)

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-M20-01 | Scope and build Others+ module for Go-Live | Bilateral/regional WG repository. Not required for demo. | TBD | ⬜ |

---

## Section 2 — Category B: Non-Functional & Compliance Gaps

| # | Action | Detail | Owner | Status |
|---|---|---|---|---|
| B-01 | Add device attributes to `audit.audit_logs` | Migration SQL + `DeviceTypeUtil` + `AuditService.log()` — **Step 6.3 delivered** (`database/migrations/V16__audit_device_attributes_v2_1.sql` + `backend/meeting-service/.../DeviceTypeUtil.java`). **Apply migration on target DBs as needed.** | Developer | ✅ |
| B-02 | Add accessibility testing workstream to ISEP-Testing-Strategy.md | GIGW 3.0 + WCAG 2.1 Level AA + RPWD Act 2016 — keyboard nav, screen reader, contrast audit, alt-text. | MagicSword | ⬜ |
| B-03 | Scaffold i18n in frontend | **Step 6.4 delivered** — `frontend/src/i18n/`, `frontend/public/locales/en/common.json`, client `useTranslation` pattern. | Developer | ✅ |
| B-04 | Enforce thin client mandate via CI lint rule | **Step 6.5 delivered** — ESLint `no-restricted-imports` + `.gitlab-ci.yml` frontend lint gate. | Developer | ✅ |

---

## Section 3 — Category C: Conflict Resolutions

| # | Conflict | Decision | Action Required | Owner | Status |
|---|---|---|---|---|---|
| C-01 | MoPSW approval scope | Configurable optional step. | Raise with DGS for sign-off. Close OI-001 after. | Sameer | ⬜ 📋 |
| C-02 | Elasticsearch → OpenSearch | **Step 6.2 delivered** — `infrastructure/docker/docker-compose.dev.yml` uses OpenSearch; compose config validated. Remaining references from grep scan: address if any still flagged. | Cursor: Step 6.2 | Developer | ✅ |
| C-03 | Module G real-time scope | Comment-capture base. Phase 2 pending DGS. | Raise with DGS as OI-008. | Sameer | ⬜ 📋 |
| C-04 | SSO deferred | **Done.** OI-011 closed. | None. | — | ✅ |
| C-05 | 20% CR baseline | Dropped. | None. | — | ✅ |
| C-06 | DPDP Act scope | Dropped. | None. | — | ✅ |

---

## Section 4 — SRS Document Updates

| # | Document | Change | Status |
|---|---|---|---|
| S-01 | SRS-03-Functional-Requirements.md | MoPSW configurable step + Module G base scope | ✅ |
| S-02 | SRS-04-Technical-Architecture.md | OpenSearch + i18n + thin client | ✅ |
| S-03 | SRS-05-Nonfunctional-Requirements.md | GIGW/WCAG/RPWD + SSO deferral + device attributes | ✅ |
| S-04 | SRS-06-Data-Model.md | Device attributes in audit_logs + OpenSearch indexes | ✅ |
| S-05 | SRS-07-Integration.md | OpenSearch integration config | ✅ |
| S-06 | SRS-08-Deployment.md | OpenSearch in Docker stack | ✅ |
| S-07 | SRS-09-Appendix.md | OI-006 closed, OI-011 closed, OI-015 added | ✅ |
| S-08 | CURSOR-PROJECT-CONTEXT.md | Patch v2.1 — Section 15 + five find-replaces | ✅ Confirmed by Cursor |
| S-09 | ISEP-Testing-Strategy.md | Accessibility testing workstream | ⬜ |

---

## Section 5 — Demo Preparation Actions

| # | Action | Detail | Status |
|---|---|---|---|
| D-01 | Complete demo Phases 1–3 live build | **Tasks ✅ | TipTap editor ✅ | Compare 🔄 | Upload/folder 🔄 |** Apply **V15/V16/V18** (and later) on demo DB; run golden-path rehearsal. | 🔄 🚨 |
| D-02 | Prepare wireframes for Phases 4–6 | React-format wireframe screens. Label as "Sprint 3 delivery." | ⬜ |
| D-03 | Prepare demo script document | Structured 6-phase walkthrough for DGS. | ⬜ |
| D-04 | Confirm VIEWER role read-only intent before demo | Ensure no blank screens for VIEWER persona. | ⬜ |
| D-05 | Verify Module F build status before demo | CG module built — **confirm** end-to-end on demo env + script. | 🔄 |

---

## Section 6 — Cursor Steps 6.1–6.6 (completed)

> **Status:** Implemented in repo (see **v1.2 Change Log**). Sameer confirmed Step 6 progression; TASK-S1-05 (document upload) was unblocked per Batch 2 flow after Step 6.6.

Historical step text (6.1–6.6) retained below for audit.

---

### Step 6.1 — Grep scan (report only, zero edits)

Run this from the repo root and report the file list:

```bash
grep -rl \
  "elasticsearch\|Elasticsearch\|elastic\.co\|kibana\|Kibana" \
  --include="*.yml" --include="*.yaml" --include="*.java" \
  --include="*.ts" --include="*.tsx" --include="*.py" \
  --include="*.xml" --include="*.properties" \
  --exclude-dir=".git" --exclude-dir="node_modules" \
  .
```

Do not edit any file. Report the list.

---

### Step 6.2 — OpenSearch in docker-compose.dev.yml

**File:** `infrastructure/docker/docker-compose.dev.yml`

1. Remove the `elasticsearch` service block entirely
2. Add the `opensearch` and `opensearch-dashboards` service blocks from `CURSOR-PROJECT-CONTEXT.md` Section 15 Rule 1
3. Update all `depends_on: elasticsearch` → `depends_on: opensearch` across all services in this file
4. In the `volumes:` section replace `elasticsearch_data:` with `opensearch_data:`
5. Validate: `docker compose -f infrastructure/docker/docker-compose.dev.yml config`

Report: confirm config validates with no errors. List any other files from step 6.1 that also need Elasticsearch removed — flag them but do not edit yet.

---

### Step 6.3 — Audit log migration file

Locate the Flyway or Liquibase migrations directory. It will be under one of:
- `services/document-service/src/main/resources/db/migration/`
- `services/*/src/main/resources/db/migration/`
- A shared migrations directory

Create `V2_1__audit_device_attributes.sql` in that directory:

```sql
-- v2.1 — Device attributes added to audit trail per RFP Section 3.16H
ALTER TABLE audit.audit_logs
  ADD COLUMN IF NOT EXISTS ip_address   VARCHAR(45),
  ADD COLUMN IF NOT EXISTS device_type  VARCHAR(50)
    CHECK (device_type IN ('DESKTOP', 'TABLET', 'MOBILE', 'UNKNOWN')),
  ADD COLUMN IF NOT EXISTS user_agent   TEXT;

COMMENT ON COLUMN audit.audit_logs.ip_address  IS 'Client IP — IPv4 or IPv6. Required per RFP 3.16H.';
COMMENT ON COLUMN audit.audit_logs.device_type IS 'DESKTOP|TABLET|MOBILE|UNKNOWN. Derived from user agent.';
COMMENT ON COLUMN audit.audit_logs.user_agent  IS 'Full browser/device user agent string.';
```

Also create `DeviceTypeUtil.java` in the appropriate shared Spring Boot utilities package:

```java
package in.gov.dgs.isep.shared.util;

public final class DeviceTypeUtil {
    private DeviceTypeUtil() {}

    public static String detect(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return "UNKNOWN";
        String ua = userAgent.toLowerCase();
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")
            || ua.contains("blackberry") || ua.contains("windows phone")) return "MOBILE";
        if (ua.contains("tablet") || ua.contains("ipad")) return "TABLET";
        return "DESKTOP";
    }
}
```

Report: full path of migration file and `DeviceTypeUtil.java`.

---

### Step 6.4 — i18n scaffold

> **Before any sub-step:** Read **`SRS/ISEP-i18n-AppRouter-Clarification.md`** in full. This project uses **Next.js App Router** (`apps/web/app/`). Do **not** use `next-i18next`, `appWithTranslation`, or `_app.tsx` — the approved equivalent is `i18next` + `react-i18next` + `i18next-resources-to-backend` with separate server and client entry points per that document.

In `apps/web/`:

1. `npm install i18next react-i18next i18next-resources-to-backend` (see clarification §3 — not `next-i18next` for the scaffold)
2. Create **`apps/web/i18n/index.ts`** — Server Components / RSC (async-capable `getFixedT` or equivalent per clarification §5)
3. Create **`apps/web/i18n/client.ts`** — `'use client'`; client-side `i18next` init + `useTranslation` per clarification §5
4. Create **`apps/web/public/locales/en/common.json`** — seed content from `CURSOR-PROJECT-CONTEXT.md` Section 15 Rule 2 (same keys as the Rule 2 example)
5. **Do not** add the Pages Router `i18n` block to `next.config.js` for locale routing; App Router uses **`[lng]`** URL segments (see clarification §6). Minimal default locale wiring is OK if `[lng]` is not introduced yet.
6. Add ESLint **warn** rule from Section 15 Rule 2 to `apps/web/.eslintrc.js` (unchanged — clarification §7)
7. Run `npm run lint` — report results

**Do not refactor existing hardcoded strings.** Scaffold only. New strings from this point must use `t()`.

Report: confirm all 7 sub-steps complete. Paste the lint output (even if clean).

---

### Step 6.5 — Thin client ESLint rule + CI gate

1. Add `no-restricted-imports` rule from `CURSOR-PROJECT-CONTEXT.md` Section 15 Rule 3 to `apps/web/.eslintrc.js`
2. In `.gitlab-ci.yml`, find the existing lint job (or create `lint-frontend`) — ensure `allow_failure: false` is set explicitly. Use content from Section 15 Rule 3.
3. Run `npm run lint` — confirm passes

Report: confirm both applied. Paste the relevant `.gitlab-ci.yml` block as confirmation.

---

### Step 6.6 — Completion report

Provide a single numbered list:

1. Files from grep scan still containing Elasticsearch (step 6.1)
2. docker-compose validates ✅ / ❌ (step 6.2)
3. Migration file path (step 6.3)
4. `DeviceTypeUtil.java` path (step 6.3)
5. i18n scaffold — `npm run lint` result (step 6.4)
6. Thin client ESLint + CI gate — `npm run lint` result (step 6.5)
7. Any blockers or questions

**Wait for Sameer to confirm before starting TASK-S1-05 (document upload feature).**

---

## Section 7 — Batch 3 Step 10 / Step 11 (tasks module)

| Item | Status |
|---|---|
| TASK-S1-06 (agenda-linked tasks, dashboards, export, escalation in meeting-service) | ✅ **Built in repo** — see v1.2 changelog; **V18** + Batch 3 §10.7 UAT on environment |
| TASK-S2-01 (TipTap collaborative editor) | ✅ **Built (Layers 1–2 + Layer 3 Y.js)** — `npm run lint` / `npm run build` clean; **manual two-browser UAT** + **Go-Live:** JWT on Y.js WS — see `ISEP-Cursor-Batch6-Step15-completion-report.md` |
| TASK-S2-02 (Version comparison / clean copy, A-E-03) | ✅ **Built** — V20 + diff/decisions/clean-copy APIs + `/documents/[id]/compare`; **apply V20 on DB** + **manual UAT** — see `ISEP-Cursor-Batch7-Step18-completion-report.md` |

---

## Summary Scorecard (v1.3)

| Category | Total Actions | Critical 🚨 | DGS Decision 📋 | Done ✅ | Partial 🔄 |
|---|---|---|---|---|---|
| A — Functional Gaps | 20 | 4 (folder/compare/tag) | 1 (G + OI-008) | **6** (A-D-01–04, A-E-02, A-F-01) | **9** |
| B — Non-Functional | 4 | 0 | 0 | **3** (B-01, B-03, B-04) | 0 |
| C — Conflicts | 6 | 0 | 2 | **4** | 0 |
| SRS Updates | 9 | 0 | 0 | 8 | 0 |
| Demo Prep | 5 | 1 | 0 | 0 | **2** (D-01, D-05 in progress) |
| **Total** | **44** | **5** | **3** | **~21** | **~11** |

*Notes: v1.3 reflects TipTap/paper draft **done**, document **compare partial**, calendar **partial**, CG **done**, live meeting **partial**, executive dashboard **partial**, audit pipeline **working**. Still 🚨: A-E-01/A-E-03 polish, email notifications (A-I-01), Phase 4 external agency, full exports (A-H-04). Apply **V15+** migrations on each environment.*

---

*v1.3 — 05 Apr 2026. Pending register aligned with current repo (Executive Dashboard, audit POST + UI, CG, TipTap, compare, calendar, live base). Next: demo rehearsal, env migrations, A-E-01/E-03/A-H-04 closure. 🗡️*
