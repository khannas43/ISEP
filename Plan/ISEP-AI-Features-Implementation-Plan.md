# ISEP AI Features — Implementation Plan (Feature 1 & 2)

| Field | Details |
|-------|---------|
| Document | ISEP-AI-Features-Implementation-Plan |
| Version | 1.0 |
| Scope | AI Feature 1 (Position Advisor), AI Feature 2 (Meeting Preparedness Intelligence) |
| RBAC | **SYSTEM_ADMIN** and **COORDINATOR** only (admin-sa, co-user) |
| Source spec | SRS/ISEP-AI-Features.md §1–§2 |

---

## 1. Scope

- **AI Feature 1 — Position Advisor:** Advisory panel on Agenda Item Detail (SCR-AGN-03) that summarises the agenda paper, India’s historical position, suggested position, and key points. Visible and usable only by **SYSTEM_ADMIN** and **COORDINATOR**.
- **AI Feature 2 — Meeting Preparedness Intelligence:** Preparedness banner on Meeting Detail (SCR-MTG-03) and optionally on Coordinator Dashboard (SCR-DASH-04), showing score (0–100), risk level, critical actions, and projected readiness. Visible only by **SYSTEM_ADMIN** and **COORDINATOR**.

All other roles (IH, DL, ME, VW) do **not** see these AI panels.

---

## 2. RBAC

| Feature | Allowed roles |
|---------|----------------|
| Position Advisor (view, regenerate, use as starting point) | SYSTEM_ADMIN, COORDINATOR |
| Meeting Preparedness (view, refresh) | SYSTEM_ADMIN, COORDINATOR |

Enforcement: frontend shows panels only when `roles` includes one of the above; API routes validate the same roles.

---

## 3. Implementation Phases

### Phase 1 — AI Feature 1: Position Advisor

| Step | Task | Deliverable |
|------|------|-------------|
| 1.1 | Define types and API contract for position advisory | `PositionAdvisory` type; `GET /api/ai/position-advisory?agendaItemId=...` |
| 1.2 | Add Next.js API route (mock/simulated response) | `app/api/ai/position-advisory/route.ts` returns sample advisory; later replace with backend/Anthropic |
| 1.3 | Build Position Advisor panel component | Collapsible panel: summary, historical position, suggested position, key points, disclaimer, Regenerate, Use as Starting Point / Dismiss |
| 1.4 | Integrate panel into Agenda Item Detail page | Show panel only for SA/CO; below Documents/Feedback area or right column |
| 1.5 | Role guard | Panel and API both check `SYSTEM_ADMIN` or `COORDINATOR` |

### Phase 2 — AI Feature 2: Meeting Preparedness Intelligence

| Step | Task | Deliverable |
|------|------|-------------|
| 2.1 | Define types and API contract for preparedness | `MeetingPreparedness` type; `GET /api/ai/meeting-preparedness?meetingId=...` |
| 2.2 | Add Next.js API route (mock/simulated response) | `app/api/ai/meeting-preparedness/route.ts` returns sample score, risk level, critical actions |
| 2.3 | Build Meeting Preparedness banner component | Score, risk badge, critical actions list, projected readiness, Refresh, disclaimer |
| 2.4 | Integrate banner into Meeting Detail page | Show at top when meeting is within 30 days; only for SA/CO |
| 2.5 | Optional: show preparedness summary on Coordinator Dashboard | Per-meeting score/risk in CO dashboard meetings widget |
| 2.6 | Role guard | Banner and API both check `SYSTEM_ADMIN` or `COORDINATOR` |

---

## 4. Technical Notes

- **Backend AI:** Spec calls for Anthropic Claude via backend (ai-service or reporting-service). This plan uses **Next.js API routes with mock data** for the first implementation so the UI and RBAC are in place; backend integration can replace the mock later.
- **Caching:** Position advisory: cache per agenda item (and document version when available). Meeting preparedness: cache per meeting (e.g. 1–6 hours). Can be added in API routes or when backend is connected.
- **Use as Starting Point (Feature 1):** Button pre-populates consolidation workspace (SCR-COL-02). First implementation can navigate to consolidate page with a query param or store draft in client state; full “pre-fill” may need backend support.
- **Nudge Approver (Feature 2):** Spec mentions “Nudge Approver” in critical actions. Can be a follow-up; first implementation can show the action list without the nudge action or with a placeholder.

---

## 5. File Checklist

| Item | Path |
|------|------|
| Implementation plan | Plan/ISEP-AI-Features-Implementation-Plan.md (this file) |
| Position advisory API | frontend/src/app/api/ai/position-advisory/route.ts |
| Position Advisor panel | frontend/src/components/ai/PositionAdvisorPanel.tsx (or under meetings/agenda) |
| Agenda item page integration | frontend/src/app/meetings/[id]/agenda/[itemId]/page.tsx |
| Meeting preparedness API | frontend/src/app/api/ai/meeting-preparedness/route.ts |
| Preparedness banner | frontend/src/components/ai/MeetingPreparednessBanner.tsx |
| Meeting detail integration | frontend/src/app/meetings/[id]/page.tsx |
| API types | frontend/src/lib/api.ts (or types/ai.ts) |

---

## 6. Implementation Status

| Item | Status |
|------|--------|
| Position Advisor API (`/api/ai/position-advisory`) | Done (mock response) |
| Position Advisor panel on Agenda Item Detail | Done (SA + CO only) |
| Meeting Preparedness API (`/api/ai/meeting-preparedness`) | Done (mock response) |
| Meeting Preparedness banner on Meeting Detail | Done (SA + CO only; shown when meeting is within 30 days) |
| RBAC (SYSTEM_ADMIN, COORDINATOR only) | Enforced in API routes and UI |

Backend integration (Anthropic Claude, real scoring) can replace the mock API responses when ready.

---

*End of plan. Feature 1 and Feature 2 implemented.*
