# ISEP — Persona-Wise UAT Test Script
**Prepared by:** MagicSword 🗡️
**Date:** 05 April 2026
**Estimated time:** 45–60 minutes total
**Run this while demo script is being prepared.**

---

## Before Starting

```bash
# Confirm containers up
docker compose -f infrastructure/docker/docker-compose.dev.yml ps | grep -E "NAME|Up"

# Apply V24 (Phase 5) — if not done
PGPASSWORD=isep_dev_password psql -h localhost -p 5433 -U isep_app -d isep \
  -f database/migrations/V24__live_meeting_discussion.sql

# Apply V25 (Phase 4) — after Batch 15 completes
PGPASSWORD=isep_dev_password psql -h localhost -p 5433 -U isep_app -d isep \
  -f database/migrations/V25__external_consultation.sql

# Run Keycloak external user script — after Batch 15 completes
./scripts/create-keycloak-external-users.sh
```

**Fixed UUIDs:**
- Meeting: `00000000-0000-0000-0000-000000000001`
- Document: `00000000-0000-0000-0000-000000000201`

**Notation:** ✅ Pass | ❌ Fail (note what happened) | ⚠️ Partial

---

## Persona 1 — System Admin
**Login:** `admin-sa` / `Admin@12345!`
**Time: ~15 min**

### Authentication
| # | What to do | Expected | Result |
|---|---|---|---|
| P1-01 | Go to `localhost:3000` | Split login — navy left panel with DGS crest, white form right, "RESTRICTED" banner at bottom | |
| P1-02 | Login as `admin-sa` | Goes to dashboard, no MFA prompt | |
| P1-03 | Check sidebar | DGS logo (gold ring), ISEP/DGS·MoPSW, Admin SA + SYSTEM ADMIN pill at bottom | |

### Dashboard
| # | What to do | Expected | Result |
|---|---|---|---|
| P1-04 | View dashboard | Stat cards: 16 Draft Papers, task cards, calendar sidebar visible | |
| P1-05 | Hover over 19 April on calendar | Tooltip: "Maritime Safety Committee — 108th Session · IMO Headquarters, London" | |
| P1-06 | Click Upcoming (2) meeting tab | Shows MSC 108 card | |
| P1-07 | Click "Maritime Safety Committee — 108th Session" in Quick open | Navigates to meeting detail | |

### Meeting Detail
| # | What to do | Expected | Result |
|---|---|---|---|
| P1-08 | View meeting detail page | Meeting Preparedness Intelligence panel: 62/100, AMBER RISK, critical actions listed | |
| P1-09 | Read critical actions | At least 2 red items, 1 amber item, green checkmarks for confirmed items | |
| P1-10 | Click "Full report" link | Navigates to executive view or full preparedness report | |
| P1-11 | Check tab bar | Overview, Agenda Items, Documents, Participants, Tasks, Correspondence Groups, Live meeting, Outcomes, Timeline/History, Minutes of Meeting | |

### Document Upload
| # | What to do | Expected | Result |
|---|---|---|---|
| P1-12 | Click Agenda Items tab → item 4.1 | Agenda item detail loads | |
| P1-13 | Click Documents tab on agenda item | Upload dropzone visible | |
| P1-14 | Drag a PDF onto the dropzone | Upload succeeds, document appears in list with DRAFT status | |

### Document Editor
| # | What to do | Expected | Result |
|---|---|---|---|
| P1-15 | Navigate to `/documents/00000000-0000-0000-0000-000000000201/editor/` | Editor loads with India Position Paper content, toolbar visible | |
| P1-16 | Click "Track Changes: OFF" | Button changes to "Track Changes: ON" with navy fill | |
| P1-17 | Type a word | Insertion appears as green underlined text | |
| P1-18 | Wait 60 seconds or click Save | Status shows "Saving..." then "Saved" | |
| P1-19 | Click "Compare versions" link | Navigates to compare page | |

### Version Comparison
| # | What to do | Expected | Result |
|---|---|---|---|
| P1-20 | View compare page | Version selector shows v1 → v2, diff renders with green/red chunks | |
| P1-21 | Check chunk attribution | Each INSERTED/DELETED chunk shows author name and timestamp | |
| P1-22 | Click ✓ (Accept) on one chunk | Chunk highlights navy, decision saved | |
| P1-23 | Click ✗ (Reject) on one chunk | Chunk dims with red outline | |
| P1-24 | Click "Accept all" | All chunks accepted, redirects to editor showing new clean copy version | |

### Minutes of Meeting
| # | What to do | Expected | Result |
|---|---|---|---|
| P1-25 | Navigate to meeting → Minutes of Meeting tab | MoM page loads | |
| P1-26 | Click "Generate MoM" | MoM renders: attendee list (7), agenda items (2), action items (1) | |
| P1-27 | Click "Export PDF" | PDF downloads, opens with meeting content | |

### Analytics
| # | What to do | Expected | Result |
|---|---|---|---|
| P1-28 | Navigate to `/reports/analytics` | Analytics page loads with meeting selector | |
| P1-29 | Select MSC 108 from dropdown | KPI cards populate: 7 members, 2 tasks, 1 draft paper | |
| P1-30 | Click Export Excel | Excel file downloads | |

### Live Meeting
| # | What to do | Expected | Result |
|---|---|---|---|
| P1-31 | Navigate to meeting → Live meeting tab | Live discussion page loads with seeded posts | |
| P1-32 | Check seeded posts visible | 3 posts showing: INTERVENTION (navy), COMMENT (slate), INFORMATION (green) | |
| P1-33 | Click "Activate Live Session" button | Button changes to "● Session Active" (green) | |
| P1-34 | Type a post and click Post | Post appears in feed immediately | |

---

## Persona 2 — Delegation Leader
**Login:** `dl-user` / `DL@12345!`
**Time: ~10 min**
**Open a new Chrome tab or use incognito after signing out admin-sa**

| # | What to do | Expected | Result |
|---|---|---|---|
| P2-01 | Login as `dl-user` | Dashboard loads — DL-specific view | |
| P2-02 | Check dashboard | Pending approvals section visible, meeting calendar showing | |
| P2-03 | Navigate to Papers | Papers list loads with status badges | |
| P2-04 | Click on a paper → Approval tab | Approval chain stepper visible: current stage highlighted in navy, completed stages in green | |
| P2-05 | Click "Approve" button | Paper advances to next stage, stepper updates | |
| P2-06 | Navigate to Tasks → Team | Leader dashboard shows tasks across meeting, grouped by agenda item | |
| P2-07 | Navigate to meeting → Agenda item 4.1 | "Create Task" button visible (DL can create tasks) | |
| P2-08 | Navigate to meeting → Live meeting | Discussion board loads, can see seeded posts | |
| P2-09 | Click "Lock Discussion" on agenda 4.1 | Lock confirmed — post input disabled for that item | |

---

## Persona 3 — Coordinator
**Login:** `co-user` / `Co@12345!`
**Time: ~10 min**

| # | What to do | Expected | Result |
|---|---|---|---|
| P3-01 | Login as `co-user` | Dashboard loads — Coordinator view | |
| P3-02 | Check Tasks → My Tasks | `/tasks/my` shows assigned tasks (Kanban: Pending/In Progress/Completed) | |
| P3-03 | Navigate to meeting → Agenda Items → 4.1 | Agenda item loads | |
| P3-04 | Click Tasks tab → Create Task | CreateTaskModal opens with meeting/agenda pre-populated | |
| P3-05 | Fill in task: Title "Review MARPOL position", assign to member, due date next week, priority HIGH | Task created successfully, appears in task list | |
| P3-06 | Navigate to document editor | Editor loads, can edit, track changes works | |
| P3-07 | Navigate to meeting → Live meeting | Can post comments (session must be active) | |
| P3-08 | Navigate to meeting → Feedback archive | Feedback archive page loads (may be empty or show existing feedback) | |

---

## Persona 4 — Member
**Login:** `member-user` / `Member@12345!`
**Time: ~5 min**

| # | What to do | Expected | Result |
|---|---|---|---|
| P4-01 | Login as `member-user` | Dashboard loads — Member view | |
| P4-02 | Navigate to `/tasks/my` | Task "Draft India position on MARPOL Annex VI amendments" visible in Pending column | |
| P4-03 | Task card shows | Meeting name, agenda item, due date 12 April, HIGH priority badge | |
| P4-04 | Navigate to document editor via task | Editor loads with India Position Paper content | |
| P4-05 | Enable Track Changes, make edit | Change visible as green insertion | |
| P4-06 | Check "Create Task" button | NOT visible (Member cannot create tasks — RoleGuard working) | |
| P4-07 | Check Admin menu item | Admin not visible in sidebar for Member role | |

---

## Persona 5 — External Agency (Phase 4)
**Login:** `moefcc-rep` / `Agency@12345!`
**Time: ~5 min**
**Only run after Batch 15 completes and V25 is applied**

| # | What to do | Expected | Result |
|---|---|---|---|
| P5-01 | Login as `moefcc-rep` | Dashboard loads — MEMBER role view | |
| P5-02 | Navigate to consultation page | `/papers/00000000-0000-0000-0000-000000000501/consultation` | |
| P5-03 | Check agency status | MoEFCC shows "Feedback received" (green), MEA shows "Feedback received", MoD "Viewed", MoS/MoPNG "Pending" | |
| P5-04 | View document | Can see India Position Paper | |
| P5-05 | Submit feedback (if UI allows) | Feedback submitted, status updates to FEEDBACK_SUBMITTED | |

---

## Real-Time Collaboration Test (Phase 2 verification)
**Requires two browser sessions simultaneously**
**Time: ~5 min**

| # | What to do | Expected | Result |
|---|---|---|---|
| RT-01 | Open editor as `admin-sa` in Chrome | Editor loads | |
| RT-02 | Open same editor as `co-user` in incognito | Presence bar shows "Also editing: Admin SA" | |
| RT-03 | Type in Chrome tab | Text appears in incognito tab within 2 seconds | |
| RT-04 | Type in incognito tab | Text appears in Chrome tab within 2 seconds | |
| RT-05 | Close incognito tab | Presence bar clears within 5 seconds | |

---

## Issues Log
*Record any failures here:*

| # | Persona | Screen | Issue | Severity |
|---|---|---|---|---|
| | | | | |

---

## Summary Scorecard

| Persona | Tests | Passed | Failed | Notes |
|---|---|---|---|---|
| System Admin | 34 | | | |
| Delegation Leader | 9 | | | |
| Coordinator | 8 | | | |
| Member | 7 | | | |
| External Agency | 5 | | | |
| Real-time | 5 | | | |
| **Total** | **68** | | | |

---

*Complete this test script and share the Issues Log. MagicSword will triage and issue fixes. 🗡️*
