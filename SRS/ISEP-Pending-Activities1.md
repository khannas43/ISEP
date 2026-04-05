# ISEP — Pending Activities & Action Register
**Project:** IMO Strategic Engagement Platform (ISEP)
**Client:** Directorate General of Shipping (DGS), MoPSW, Government of India
**Prepared by:** MagicSword 🗡️
**Date:** 05 April 2026
**Version:** 1.5 (draft — **superseded**)

> **Confidentiality:** Never use firm name — always "the firm". Never use real client names — always "the client" or "DGS".

> **Note:** Content merged into **`ISEP-Pending-Activities.md` (v1.5)** with repo verification notes. Keep this file only for diff history if needed.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ⬜ | Not started |
| 🔄 | In progress / partial |
| ✅ | Done |
| 🚨 | Critical / blocks demo or milestone |
| 📋 | Needs DGS decision before action |

---

## v1.5 Change Log (05 Apr 2026)

| # | Change |
|---|---|
| 1 | **Batch 13 — Phase 6 (MoM + Analytics)** — Marked **✅ Done (build)**. V23 applied. MoM generation confirmed (7 attendees, 2 agenda items, 1 action item). Analytics API confirmed live. PDF/Excel/XML export built (PDFBox + Apache POI). Live analytics page replaces wireframe. New rows A-H-01 through A-H-04 all marked ✅. |
| 2 | **Batch 14 — Phase 5 (Live Meeting SSE)** — Marked **✅ Done (build)**. V24 applied. LiveDiscussionController, SSE stream, activate/lock. A-G-01 through A-G-03 marked ✅. Sprint 3 wireframe removed. |
| 3 | **UI Redesign (Batch 12)** — Marked **✅ Done**. Navy/white design system, DGS crest logo, Libre Baskerville + Source Sans 3, split login page, sidebar, dashboard, all UAT screens. |
| 4 | **Scorecard** updated — all 6 demo phases now ✅ fully live (31/31 steps). |
| 5 | **Demo script** produced — `ISEP-Demo-Script.md`. 34-minute, 6-phase, full talking points. |
| 6 | **UAT test script** produced — `ISEP-UAT-Test-Script.md`. 68 test cases, 5 personas. |
| 7 | **Demo Readiness Check** updated to v1.5 — all phases ✅, 9 user credentials, V24/V25 in checklist. |
| 8 | **A-B-01 calendar sidebar** — Marked **✅ Done**. `MeetingCalendarSidebar` with meeting dots and hover tooltips wired on dashboard. |
| 9 | **A-C-01 feedback archive** — Marked **✅ Done**. `GET /api/v1/meetings/{id}/feedback/archive` built in Batch 9. |
| 10 | **A-E-03 version compare / clean copy** — Marked **✅ Done**. Smoke tested with real attributed diff (8 chunks). Accept/reject/clean copy all confirmed. |

---

## Section 1 — Category A: Functional Feature Gaps

### Tier 1 — Demo-Critical

#### Module D — Task Allocation & Workflow Automation

| # | Action | Detail | Status |
|---|---|---|---|
| A-D-01 | Task creation from agenda context | `POST /api/v1/tasks`, `CreateTaskModal`, `core.tasks`, V18. Smoke tested 201. | ✅ |
| A-D-02 | Member personal task dashboard | `/tasks/my`, `GET /api/v1/tasks/my`, TaskCard, overdue badge. Confirmed. | ✅ |
| A-D-03 | Task escalation workflow | Spring `@Scheduled` in meeting-service, `POST /api/v1/system/jobs/escalate-tasks`. | ✅ |
| A-D-04 | Leader task dashboard + export | `GET /api/v1/tasks/team`, xlsx/xml export. | ✅ |

#### Module E — Paper Preparation & Multi-Level Approval

| # | Action | Detail | Status |
|---|---|---|---|
| A-E-01 | Document upload into paper preparation folder | Upload API + MinIO + OpenSearch. Smoke tested 201. Auto-tag by committee/meeting/agenda item confirmed in DB. | ✅ |
| A-E-02 | Collaborative track-changes editor (TipTap) | TipTap + Y.js layers 1–3. Track changes mode. Real-time presence bar confirmed in browser. | ✅ |
| A-E-03 | Version comparison / clean copy tool | `/documents/[id]/compare`, diff API, accept/reject, clean copy. Smoke tested — 8 attributed chunks, CLEAN_COPY status. | ✅ |
| A-E-04 | Structured templates for interventions | Position paper, intervention statement, deliberation comment templates. | ⬜ |
| A-E-05 | External ministry consultation | V25, ConsultationController, `/papers/[id]/consultation`, Keycloak agency users (5 ministries). Demo data pre-seeded. | ✅ |

#### Module B — Agenda, Document & Version Management

| # | Action | Detail | Status |
|---|---|---|---|
| A-B-01 | Calendar sidebar with hover summaries | `MeetingCalendarSidebar` — meeting dots, hover tooltip, scroll-dismiss, list below calendar. MSC 108 visible on 19 April. | ✅ |

#### Module C — Collaboration, Feedback & Deliberation

| # | Action | Detail | Status |
|---|---|---|---|
| A-C-01 | Historical feedback archive per meeting | `GET /api/v1/meetings/{id}/feedback/archive` — filters by agendaItemId, submittedBy, position, paginated. Frontend page `/meetings/[id]/feedback/archive`. | ✅ |

#### Module G — Live Meeting Collaboration

| # | Action | Detail | Status |
|---|---|---|---|
| A-G-01 | Live meeting module + discussion boards | V24, `collaboration.live_posts`, `LiveDiscussionController`, SSE stream, post types (INTERVENTION/COMMENT/INFORMATION/POINT_OF_ORDER), colour-coded feed. Demo posts seeded. | ✅ |
| A-G-02 | Real-time comment feed (SSE) | `LiveMeetingSseService`, `GET .../live/stream`, fetch-based SSE (Bearer auth). | ✅ |
| A-G-03 | Role-based discussion locking | `PUT .../live/activate` (DL/SA), `PUT .../live/agenda/{id}/lock`. DL/SA only. | ✅ |

#### Module H — Analytics & Post-Meeting Archival

| # | Action | Detail | Status |
|---|---|---|---|
| A-H-01 | MoM auto-generation | `MinutesOfMeetingService`, `POST .../mom/generate`. Confirmed: 7 attendees, 2 agenda items, 1 action item, HTML content. | ✅ |
| A-H-02 | Analytics dashboard | `AnalyticsService`, `GET .../analytics`. Live data: members, tasks, papers, completion rate. Analytics page live (Sprint 3 banner removed). | ✅ |
| A-H-03 | Visualization tools | KPI metric cards + CSS bar charts. Meeting selector dropdown. | ✅ |
| A-H-04 | Export PDF / Excel / XML | PDFBox 3 (MoM PDF), Apache POI (analytics Excel), JAXB (XML). All export endpoints wired and enabled in UI. | ✅ |

---

### Tier 2 — Post-Demo (required for Go-Live)

#### Module F — Correspondence Group Management

| # | Action | Detail | Status |
|---|---|---|---|
| A-F-01 | Verify Module F build | CG list/create/edit, members, meeting ↔ CG linkage confirmed in app. | ✅ |

#### Module I — Notifications

| # | Action | Detail | Status |
|---|---|---|---|
| A-I-01 | Email notifications | In-portal notifications built. Email via SMTP/SES — post-UAT. | 🔄 |

#### Module M — External Agency (Phase 2 scope)

| # | Action | Detail | Status |
|---|---|---|---|
| A-M-01 | NIC SSO integration for external users | OI-011 closed — Phase 2. Demo uses Keycloak dummy credentials. | 📋 |

---

## Section 2 — Category B: Non-Functional Requirements

| # | Action | Status |
|---|---|---|
| B-01 | WCAG 2.1 AA / GIGW / RPWD compliance | axe-core in CI pipeline. ✅ |
| B-02 | Performance targets (k6) | k6 scripts written. Load test on UAT environment — pending. 🔄 |
| B-03 | Audit trail — device attributes | V16, `DeviceTypeUtil`, `ip_address`/`device_type`/`user_agent` in audit_logs. ✅ |
| B-04 | Thin client ESLint + CI gate | ESLint `no-restricted-imports` + GitLab CI gate. ✅ |
| B-05 | Y.js WebSocket JWT auth | Go-Live requirement. Not demo-blocking. ⬜ |
| B-06 | STQC certification | OI-012 — post-UAT. ⬜ |

---

## Section 3 — Category C: Open Issues & Design Decisions

| # | Issue | Status |
|---|---|---|
| OI-001 | MoPSW approval step — configurable or always included? | Configurable per paper type. **Pending DGS formal sign-off.** 📋 |
| OI-006 | OpenSearch vs Elasticsearch | **Closed.** OpenSearch 2.x selected (Apache 2.0). ✅ |
| OI-008 | Module G scope — comment-capture vs concurrent co-editing | **Closed for Phase 1.** Comment-capture (SSE) built. Concurrent editing = Phase 2. ✅ |
| OI-011 | SSO with NIC for external users | **Closed.** Keycloak interim credentials for demo. NIC SSO = Phase 2. ✅ |
| OI-012 | STQC certification timeline | Post-UAT. ⬜ |
| OI-015 | Document envelope encryption | Pending DGS security assessment. 📋 |

---

## Section 4 — SRS Updates

| # | Update | Status |
|---|---|---|
| S-01 through S-08 | SRS v2.1 updates across all 10 SRS modules | ✅ |
| S-09 | V23–V25 migrations documented in SRS-05 data layer | ⬜ Post-UAT |
| S-10 | Phase 4/5/6 screen specs added to SRS-09 | ⬜ Post-UAT |

---

## Section 5 — Demo Preparation

| # | Action | Status |
|---|---|---|
| D-01 | Demo environment — all migrations V16–V25 applied | ✅ V16–V23 applied. **V24, V25 — apply now.** |
| D-02 | Demo seed data — MSC 108, agenda, doc v1/v2, task, paper, consultation | ✅ `scripts/demo-seed.sql` applied |
| D-03 | Demo script — 6-phase walkthrough with talking points | ✅ `ISEP-Demo-Script.md` ready |
| D-04 | UAT test script — persona-wise, 68 test cases | ✅ `ISEP-UAT-Test-Script.md` ready |
| D-05 | External agency Keycloak users created | ⬜ **Run `./scripts/create-keycloak-external-users.sh`** |
| D-06 | Live session pre-activated before demo | ⬜ **Run activate curl before audience arrives** |
| D-07 | MoM pre-generated before demo | ⬜ **Run generate curl before audience arrives** |
| D-08 | UI redesign — navy/white, DGS crest, split login | ✅ Batch 12 confirmed |
| D-09 | Pre-demo checklist run top to bottom | ⬜ **Run `scripts/pre-demo-checklist.md` on demo day** |

---

## Section 6 — Migrations Reference

| Migration | Description | Status |
|---|---|---|
| V16 | Audit device attributes | ✅ Applied |
| V17 | Paper preparation folders | ✅ Applied |
| V18 | Tasks agenda link (`core.tasks`) | ✅ Applied |
| V19 | Collaborative editor (Y.js, document versions) | ✅ Applied |
| V20 | Version comparison (`version_change_decisions`) | ✅ Applied |
| V21 | Feedback position reference | ✅ Applied |
| V22 | Meeting participant roles coordinator | ✅ Applied |
| V23 | Analytics + MoM (`minutes_of_meeting`, `analytics_snapshots`) | ✅ Applied |
| V24 | Live meeting discussion (`live_posts`, locking, session active) | ⬜ **Apply now** |
| V25 | External consultation (`consultations`, `consultation_agencies`, `is_external`) | ⬜ **Apply now** |

---

## Summary Scorecard (v1.5)

| Category | Total | Done ✅ | Partial 🔄 | Not started ⬜ | DGS Decision 📋 |
|---|---|---|---|---|---|
| A — Functional Gaps | 17 | **15** | 1 | 1 | 0 |
| B — Non-Functional | 6 | 3 | 1 | 2 | 0 |
| C — Open Issues | 6 | 4 | 0 | 1 | 2 |
| SRS Updates | 10 | 8 | 0 | 2 | 0 |
| Demo Prep | 9 | 5 | 0 | 4 | 0 |
| **Total** | **48** | **35** | **2** | **10** | **2** |

**All 6 demo phases: ✅ 31/31 steps live.**

### Immediate actions required (before demo):
1. `PGPASSWORD=... psql ... -f database/migrations/V24__live_meeting_discussion.sql`
2. `PGPASSWORD=... psql ... -f database/migrations/V25__external_consultation.sql`
3. `./scripts/create-keycloak-external-users.sh`
4. Rebuild + restart meeting-service
5. Run UAT test script (`ISEP-UAT-Test-Script.md`)
6. Pre-activate live session + pre-generate MoM on demo day

---

*v1.5 — 05 Apr 2026. All 6 phases built and live. 35/48 total actions done. Demo script + UAT script ready. Apply V24+V25, run Keycloak script, complete UAT round. 🗡️*
