# ISEP — Pending Activities & Action Register
**Project:** IMO Strategic Engagement Platform (ISEP)
**Client:** Directorate General of Shipping (DGS), MoPSW, Government of India
**Prepared by:** MagicSword 🗡️
**Date:** 05 April 2026
**Version:** 1.5

> **Confidentiality:** Never use firm name — always "the firm". Never use real client names — always "the client" or "DGS".

> **Reconciliation:** v1.5 merges the **Claude-updated** register (`ISEP-Pending-Activities1.md`) into this canonical file. Where Claude marked items ✅, wording was checked against the repo; **demo script / UAT script** paths are tracked as **🔄** until those Markdown files exist under `SRS/`. **WCAG:** `axe-core` is a frontend dependency and accessibility is covered in testing docs; a **dedicated axe gate in GitLab CI** was not verified — B-02 stays **🔄**.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ⬜ | Not started |
| 🔄 | In progress / partial |
| ✅ | Done (build or verified in repo / UAT) |
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
| 2 | **Batch 3 Step 10 (TASK-S1-06)** — Tasks on **`core.tasks`**: **V18**; meeting-service task APIs; Kong route; escalation scheduler; frontend **CreateTaskModal**, **`/tasks/my`**, **TaskCard** |
| 3 | **A-D-01–A-D-04** — ✅ **Done (build)** — apply **V18** on target DB; workflow-service Celery escalation not implemented (deferred) |
| 4 | **B-01, B-03, B-04** — Implementation in codebase |

## v1.3 Change Log (05 Apr 2026)

| # | Change |
|---|---|
| 1 | **A-E-02 (TipTap)** — ✅ **Done (build)** |
| 2 | **A-E-03** — was 🔄 Partial (compare page); advanced in v1.5 |
| 3 | **A-E-01** — was 🔄 Partial; advanced in v1.5 per Claude register + repo |
| 4 | **A-B-01** — was 🔄 Partial; advanced in v1.5 (`MeetingCalendarSidebar` on executive dashboard) |
| 5 | **A-F-01 (CG)** — ✅ **Done (build)** |
| 6 | **Module G / H** — were partial/wireframe; advanced in v1.5 (Batches 13–14) |
| 7 | **Audit** — POST audit + Admin UI + V15/V16 narrative |
| 8 | **UX / nav** — Executive dashboard default, sidebar, sign-out |
| 9 | **Test cases** — `Testing/Test Cases/*` updates |

## v1.4 Change Log (05 Apr 2026)

| # | Change |
|---|---|
| 1 | **Batch 15 — Phase 4 (external consultation)** — ✅ **Done (build)**: **V25**, consultation APIs, **`/papers/[id]/consultation`**, **`scripts/create-keycloak-external-users.sh`**, **A-E-05** |
| 2 | **Demo prep D-02** — Phase 4 live; Phases 5–6 depend on live meeting + analytics builds (now ✅ in v1.5) |
| 3 | **Scorecard** — +A-E-05 |

## v1.5 Change Log (05 Apr 2026)

| # | Change |
|---|---|
| 1 | **Merged `ISEP-Pending-Activities1.md` (Claude)** into this canonical register. |
| 2 | **Batch 13 — Phase 6 (MoM + Analytics)** — ✅ **Done (build)**: V23; MoM generate/export; analytics API + live analytics UI; exports (PDF/Excel/XML) per completion docs. **A-H-01–A-H-04** → ✅. |
| 3 | **Batch 14 — Phase 5 (Live meeting / SSE)** — ✅ **Done (build)**: V24; live posts, SSE, activate/lock; **A-G-01–A-G-03** → ✅. |
| 4 | **UI redesign (Batch 12)** — ✅ Navy/white system, DGS crest, typography, split login — per Claude register (verify on target env). |
| 5 | **A-B-01** — ✅ `MeetingCalendarSidebar` on **`/dashboard/executive`** (`ExecutiveDashboardSummary.tsx`) + **`/calendar`**. |
| 6 | **A-C-01** — ✅ `GET /api/v1/meetings/{id}/feedback/archive` + **`/meetings/[id]/feedback/archive`**. |
| 7 | **A-E-03** — ✅ Compare + diff decisions + clean copy path (smoke/UAT per Claude register — re-verify on demo DB). |
| 8 | **A-E-01** — ✅ Upload + MinIO + OpenSearch indexing; **residual:** optional branded “paper preparation folder” UX. |
| 9 | **Demo script / UAT script** — Claude register lists `ISEP-Demo-Script.md` / `ISEP-UAT-Test-Script.md`; **🔄** until added to `SRS/`. |
| 10 | **Demo prep** — Expanded D-01–D-09; **V24/V25** “apply on demo DB” + Keycloak script + pre-activate live + pre-gen MoM. |
| 11 | **Category B** — Added **B-05** (Y.js JWT), **B-06** (k6 / performance), **B-07** (STQC); split accessibility vs device audit. |
| 12 | **Category C** — Open issues table aligned with Claude (OI-001, OI-006, OI-008, OI-011, OI-012, OI-015). |
| 13 | **Migrations reference** — Subsection under demo prep: V16–V25. |

---

## Section 1 — Category A: Functional Feature Gaps

### Tier 1 — Demo-Critical (Phases 1–6 — build target)

#### Module D — Task Allocation & Workflow Automation

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-D-01 | Task creation from agenda context | `POST /api/v1/tasks`, `CreateTaskModal`, **`core.tasks`**, V18. | 3–5 days | Phase 1 | ✅ |
| A-D-02 | Member personal task dashboard | `/tasks/my`, `GET /api/v1/tasks/my`, TaskCard, overdue badge. | 2–3 days | Phase 2 | ✅ |
| A-D-03 | Task escalation workflow | `@Scheduled` + `POST /api/v1/system/jobs/escalate-tasks`. | Medium | Phase 1–2 | ✅ |
| A-D-04 | Leader task dashboard + export | `GET /api/v1/tasks/team`, xlsx/xml export. | Medium | Phase 3 | ✅ |

#### Module E — Paper Preparation & Multi-Level Approval

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-E-01 | Document upload / paper prep | Upload + MinIO + OpenSearch; meeting Documents tab + library. Optional: branded folder UX. | 3–5 days | Phase 1 | ✅ |
| A-E-02 | Collaborative track-changes editor (TipTap) | TipTap + Y.js; `/papers/[id]/draft`, document editor. **Go-Live:** JWT on Y.js WS. | 3–4 weeks | Phases 2–5 | ✅ |
| A-E-03 | Version comparison / clean copy | `/documents/[id]/compare`, diff API, accept/reject, clean copy. | 1–2 weeks | Phase 3 | ✅ |
| A-E-04 | Structured templates for interventions | Position / intervention / deliberation templates. | Medium | Phase 2–3 | ⬜ |
| A-E-05 | External ministry consultation | V25, consultation APIs, `/papers/[id]/consultation`, Keycloak agency script. Apply **V25** + run script on realm. | Medium | Phase 4 | ✅ |

#### Module B — Agenda, Document & Version Management

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-B-01 | Calendar + sidebar summaries | `/calendar` + **`MeetingCalendarSidebar`** on executive dashboard (dots, tooltips). | Medium | Phase 1 | ✅ |

#### Module C — Collaboration, Feedback & Deliberation

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-C-01 | Historical feedback archive per meeting | `GET /api/v1/meetings/{id}/feedback/archive` + `/meetings/[id]/feedback/archive`. | Medium | Phase 2–3 | ✅ |

#### Module G — Live Meeting Collaboration (Phase 5)

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-G-01 | Live meeting module + discussion feed | V24, `collaboration.live_posts`, `LiveDiscussionController`, SSE, post types, colour-coded feed. | 2–3 weeks | Phase 5 | ✅ |
| A-G-02 | Real-time comment feed (SSE) | `GET .../live/stream`, fetch SSE + Bearer auth. | Medium | Phase 5 | ✅ |
| A-G-03 | Role-based discussion locking | `PUT .../live/activate`, `PUT .../live/agenda/{id}/lock` (DL/SA). | Bundled | Phase 5 | ✅ |

#### Module H — Analytics, MoM & Export (Phase 6)

| # | Action | Detail | Effort | Demo Phase | Status |
|---|---|---|---|---|---|
| A-H-01 | MoM auto-generation | `POST .../mom/generate`, MoM HTML + export paths. | 1 week | Phase 6 | ✅ |
| A-H-02 | Analytics dashboard | Analytics API + live analytics UI (executive / meeting analytics per build). | 1–2 weeks | Phase 6 | ✅ |
| A-H-03 | Visualization tools | KPI cards, charts / selectors per analytics build. | 1 week | Phase 6 | ✅ |
| A-H-04 | Export PDF / Excel / XML | MoM PDF, analytics Excel/XML per Batch 13 scope. | 1 week | Phase 6 | ✅ |

---

### Tier 2 — Post-Demo / Go-Live polish

#### Module F — Correspondence Group Management

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-F-01 | Correspondence groups | CG CRUD, members, meeting ↔ CG linkage. Confirm on demo env. | — | ✅ |

#### Module H (residual)

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-H-05 | Institutional historical archive (cross-meeting) | Indexed institutional memory beyond per-meeting archive — expand for Go-Live. | Medium | 🔄 |

#### Module I — Calendar, Alerts & Notifications

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-I-01 | Email notification delivery | In-portal notifications ✅. SMTP/SES email — post-UAT. | — | 🔄 |

#### Module K / VIEWER Role

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-K-01 | VIEWER read-only — document in RBAC matrix | Avoid blank screens for VIEWER persona in demo. | — | ⬜ |

#### External access (Phase 2)

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-M-01 | NIC SSO for external users | Demo: Keycloak agency users. NIC SSO = Phase 2 (OI-011). | — | 📋 |

#### Module — International Engagements (Others+)

| # | Action | Detail | Effort | Status |
|---|---|---|---|---|
| A-M20-01 | Others+ module (bilateral / regional WG) | Not required for demo. | TBD | ⬜ |

---

## Section 2 — Category B: Non-Functional & Compliance

| # | Action | Detail | Owner | Status |
|---|---|---|---|---|
| B-01 | Audit device attributes on `audit.audit_logs` | V16 + `DeviceTypeUtil` + `AuditService` — apply on DBs. | Developer | ✅ |
| B-02 | Accessibility (GIGW / WCAG 2.1 AA / RPWD) | Workstream in `ISEP-Testing-Strategy.md`; Playwright + axe planned in `Testing/ISEP-Testing-Plan.md`. **CI gate:** verify in `.gitlab-ci.yml`. | MagicSword / Dev | 🔄 |
| B-03 | i18n scaffold | `frontend/src/i18n/`, `frontend/public/locales/en/common.json`. | Developer | ✅ |
| B-04 | Thin client ESLint + CI gate | `no-restricted-imports` + GitLab lint job. | Developer | ✅ |
| B-05 | Y.js WebSocket JWT authentication | Go-Live hardening; not demo-blocking. | Developer | ⬜ |
| B-06 | Performance / load (k6) | Scripts / plan — run on UAT. | Developer | 🔄 |
| B-07 | STQC certification | OI-012 — post-UAT. | — | ⬜ |

---

## Section 3 — Category C: Open Issues & Design Decisions

| # | Issue | Decision / note | Owner | Status |
|---|---|---|---|---|
| C-01 / OI-001 | MoPSW approval step | Configurable per paper type — **DGS formal sign-off** pending. | Sameer | ⬜ 📋 |
| C-02 / OI-006 | OpenSearch vs Elasticsearch | **Closed** — OpenSearch in Docker stack. | Developer | ✅ |
| C-03 / OI-008 | Module G scope | Comment-capture (SSE) delivered; concurrent co-editing = Phase 2 if required. | Sameer | ✅ |
| C-04 / OI-011 | SSO for external users | **Closed for demo** — Keycloak interim; NIC SSO Phase 2. | — | ✅ |
| OI-012 | STQC certification timeline | Post-UAT. | — | ⬜ |
| OI-015 | Document envelope encryption | Pending DGS security assessment. | — | 📋 |
| C-05 | 20% CR baseline | Dropped. | — | ✅ |
| C-06 | DPDP Act scope | Dropped. | — | ✅ |

---

## Section 4 — SRS Document Updates

| # | Document | Change | Status |
|---|---|---|---|
| S-01 | SRS-03-Functional-Requirements.md | MoPSW + Module G/H scope | ✅ |
| S-02 | SRS-04-Technical-Architecture.md | OpenSearch + i18n + thin client | ✅ |
| S-03 | SRS-05-Nonfunctional-Requirements.md | GIGW/WCAG + device attributes | ✅ |
| S-04 | SRS-06-Data-Model.md | Audit + OpenSearch | ✅ |
| S-05 | SRS-07-Integration.md | OpenSearch | ✅ |
| S-06 | SRS-08-Deployment.md | Docker stack | ✅ |
| S-07 | SRS-09-Appendix.md | OIs | ✅ |
| S-08 | CURSOR-PROJECT-CONTEXT.md | Patch v2.1 | ✅ |
| S-09 | ISEP-Testing-Strategy.md | Accessibility workstream | ⬜ |
| S-10 | V23–V25 + Phase 4/5/6 in SRS data / appendix | Post-UAT documentation pass | 🔄 |

---

## Section 5 — Demo Preparation

| # | Action | Detail | Status |
|---|---|---|---|
| D-01 | Demo DB migrations | Apply **V16 through V25** on demo Postgres (Flyway or manual parity). | 🔄 🚨 |
| D-02 | Demo seed | `scripts/demo-seed.sql` + consultation seeds in V25. | 🔄 |
| D-03 | Demo script (6-phase) | Target: **`SRS/ISEP-Demo-Script.md`** — add to repo when finalized. | 🔄 |
| D-04 | UAT test script | Target: **`SRS/ISEP-UAT-Test-Script.md`** — add to repo when finalized. | 🔄 |
| D-05 | External agency Keycloak users | Run **`./scripts/create-keycloak-external-users.sh`**. | ⬜ |
| D-06 | Live session pre-activated | Run activate API/curl before audience (see live meeting docs). | ⬜ |
| D-07 | MoM pre-generated | Run generate MoM before audience if script requires. | ⬜ |
| D-08 | UI redesign | Navy/white, DGS crest, split login — verify on demo build. | ✅ |
| D-09 | Pre-demo checklist | Run **`scripts/pre-demo-checklist.md`** top to bottom. | ⬜ |
| — | Rebuild meeting-service | After migration / backend changes. | 🔄 |

### Migrations reference (V16–V25)

| Migration | Description | Apply on demo DB |
|---|---|---|
| V16 | Audit device attributes | ✅ |
| V17 | Paper preparation / document columns | ✅ |
| V18 | Tasks (`core.tasks`) | ✅ |
| V19 | Collaborative editor / document versions | ✅ |
| V20 | Version comparison (`version_change_decisions`) | ✅ |
| V21 | Feedback position reference | ✅ |
| V22 | Meeting participant roles (COORDINATOR) | ✅ |
| V23 | Analytics + MoM tables | ✅ |
| V24 | Live meeting discussion (`live_posts`, locking) | 🔄 |
| V25 | External consultation | 🔄 |

---

## Section 6 — Cursor Steps 6.1–6.6 (historical / completed)

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

## Section 7 — Build register (tasks, editor, compare, consultation, live, MoM)

| Item | Status |
|---|---|
| TASK-S1-06 (tasks, V18) | ✅ Built — apply V18 + UAT |
| TASK-S2-01 (TipTap / Y.js) | ✅ Built — see Batch 6 completion docs |
| TASK-S2-02 (compare / clean copy, V20) | ✅ Built — apply V20 + UAT |
| Batch 13 Phase 6 (MoM, analytics, V23) | ✅ Built — apply V23 |
| Batch 14 Phase 5 (live SSE, V24) | ✅ Built — apply V24 |
| Batch 15 Phase 4 (consultation, V25) | ✅ Built — apply V25 + Keycloak script — `ISEP-Cursor-Batch15-Phase4-completion.md` |

---

## Summary Scorecard (v1.5)

| Category | Total | Done ✅ | Partial 🔄 | Not started ⬜ | DGS 📋 |
|---|---|---|---|---|---|
| A — Functional | 24 | **18** | **2** (A-H-05, A-I-01) | **3** (A-E-04, A-K-01, A-M20-01) | **1** (A-M-01) |
| B — Non-Functional | 7 | **3** | **2** | **2** | 0 |
| C — Open issues | 8 | **5** | 0 | **1** (OI-012) | **2** (C-01, OI-015) |
| SRS Updates | 10 | 8 | 1 (S-10) | 1 (S-09) | 0 |
| Demo Prep | 10 | 1 (D-08) | 3 (D-01, D-02, rebuild) | 5 | 0 |
| **Total** | **59** | **35** | **8** | **12** | **3** |

*Notes: v1.5 reflects **Claude register merge** + repo spot-check. **Six demo phases** are **built in codebase**; **demo readiness** still requires **V24/V25 on DB**, **Keycloak agency users**, **rehearsal**, and **demo/UAT markdown** artifacts when added. Critical 🚨: **D-01** migrations + golden-path rehearsal.*

---

*v1.5 — 05 Apr 2026. Canonical register = this file; Claude draft = `ISEP-Pending-Activities1.md` (superseded — see banner in that file). Next: apply V24/V25, Keycloak script, add demo + UAT scripts to `SRS/`, run checklist. 🗡️*
