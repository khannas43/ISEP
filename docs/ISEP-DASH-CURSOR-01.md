# ISEP Executive Dashboard — Cursor Backend Wiring Guide
> **Component:** `ISEPExecutiveDashboard.jsx`  
> **Document Ref:** ISEP-DASH-CURSOR-01 | **Version:** 1.0  
> **Classification:** CONFIDENTIAL — Developer Use Only

---

## What Cursor Needs to Do

The dashboard component is complete with full UI, role-switching, and 5 tabs.  
All data currently comes from **API stub functions** at the top of the file.  
Cursor's job: replace each stub with a real `fetch()` call to the Spring Boot / FastAPI backend via Kong CE.

---

## API Stubs → Real Endpoints Mapping

### 1. `getDashboardSummary(meetingId, role)`
```
Replace with: GET /api/dashboard/summary
Query params:  ?meetingId={meetingId}&role={role}
Auth:          Bearer JWT (Keycloak)
Controller:    DashboardController.java → getSummary()
Response type: DashboardSummaryDTO
```
**Response shape expected by dashboard:**
```typescript
{
  meeting: {
    title: string, body: string, session: number,
    location: string, startDate: string, endDate: string,
    daysToMeeting: number, status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED"
  },
  preparedness: {
    score: number,           // 0–100
    trend: number,           // delta vs last week (positive = improving)
    tasksComplete: number,
    tasksTotal: number,
    feedbackConsolidated: number,
    feedbackTotal: number,
    papersReady: number,     // papers with status FINALIZED
    papersTotal: number      // papers requiring formal submission
  },
  pendingActions: number,    // count of actions for current user
  criticalAlerts: number     // count of HIGH risk unresolved items
}
```

---

### 2. `getAgendaReadiness(meetingId)`
```
Replace with: GET /api/dashboard/agenda-readiness
Query params:  ?meetingId={meetingId}
Auth:          Bearer JWT
Controller:    DashboardController.java → getAgendaReadiness()
Response type: List<AgendaReadinessDTO>
```
**Response shape:**
```typescript
Array<{
  id: string,                    // e.g. "AI-004"
  title: string,
  priority: "HIGH" | "MEDIUM" | "LOW",
  submissionRequired: boolean,
  positionReady: boolean,        // true if consolidated position exists and DL-approved
  paperStatus: string | null,    // "DRAFT" | "GROUP_LEADER_REVIEW" | ... | "FINALIZED" | null
  tasksComplete: number,
  tasksTotal: number,
  daysLeft: number | null        // days remaining to submission deadline; null if no deadline
}>
```

---

### 3. `getPaperPipeline(meetingId)`
```
Replace with: GET /api/dashboard/paper-pipeline
Query params:  ?meetingId={meetingId}
Auth:          Bearer JWT
Controller:    DashboardController.java → getPaperPipeline()
Response type: List<PaperPipelineDTO>
```
**Response shape:**
```typescript
Array<{
  id: string,                    // e.g. "WP-SFF-2027-001"
  title: string,
  agendaItem: string,            // e.g. "Item 4"
  stage: number,                 // 1=Draft, 2=GrpLdr, 3=DelLdr, 4=ICDiv, 5=CSNA, 6=CSS, 7=DG, 8=FINALIZED (use 8 for final)
  stageName: string,             // human-readable stage name
  lastAction: string,            // e.g. "Approved by DL"
  lastActionDate: string,        // formatted date string
  submittedBy: string,           // e.g. "DL, DGS HQ"
  urgent: boolean                // true if action is overdue or blocking
}>
```

---

### 4. `getPendingActions(userId, role)`
```
Replace with: GET /api/dashboard/pending-actions
Query params:  ?userId={userId}&role={role}
Auth:          Bearer JWT — backend MUST scope to current user only
Controller:    DashboardController.java → getPendingActions()
Response type: List<PendingActionDTO>
```
**Response shape:**
```typescript
Array<{
  id: string,
  type: "APPROVAL_REQUIRED" | "POSITION_PENDING" | "FEEDBACK_UNCONSOLIDATED" | "TASK_OVERDUE",
  title: string,
  detail: string,
  priority: "HIGH" | "MEDIUM" | "LOW",
  dueDate: string,
  screen: string                 // frontend route to navigate on click, e.g. "/paper/review/WP-SFF-001"
}>
```

---

### 5. `getDelegationActivity(meetingId)`
```
Replace with: GET /api/dashboard/delegation-activity
Query params:  ?meetingId={meetingId}
Auth:          Bearer JWT
RBAC:          Only DG, IC_DIVISION_HEAD, DELEGATION_LEADER can see full matrix
               COORDINATOR sees own org only
               MEMBER/VIEWER: 403
Controller:    DashboardController.java → getDelegationActivity()
Response type: List<DelegationActivityDTO>
```
**Response shape:**
```typescript
Array<{
  org: string,
  role: string,                  // e.g. "Lead Delegation", "Technical Support"
  tasksComplete: number,
  tasksTotal: number,
  feedbackSubmitted: number,
  papersOwned: number,
  status: "ON_TRACK" | "AT_RISK" | "COMPLETE" | "OVERDUE"
}>
```

---

### 6. `getAIInsights(meetingId)`
```
Replace with: GET /api/ai/preparedness-score/{meetingId}
              FastAPI endpoint — Python service
Auth:          Bearer JWT
RBAC:          COORDINATOR and above
Service:       ai-service/app/routers/preparedness.py
Notes:         This calls Claude Sonnet 4. Cache response for 30 min to avoid
               repeated API calls. Output is always advisory (status=DRAFT).
```
**Response shape:**
```typescript
{
  generatedAt: string,           // e.g. "Today, 09:14 IST"
  keyRisk: string,               // single most critical risk identified by Claude
  recommendations: string[],    // array of 2–4 actionable recommendations
  preparednessProjection: string // e.g. "If current pace maintained, expected score at meeting start: 91"
}
```

---

## Spring Boot — New Controller to Create

**File:** `backend/src/main/java/in/gov/dgs/isep/dashboard/DashboardController.java`

```java
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('DG','IC_DIVISION_HEAD','DELEGATION_LEADER','COORDINATOR','MEMBER','VIEWER')")
    public ResponseEntity<DashboardSummaryDTO> getSummary(
            @RequestParam String meetingId,
            @RequestParam String role,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(dashboardService.getSummary(meetingId, role, jwt.getSubject()));
    }

    @GetMapping("/agenda-readiness")
    @PreAuthorize("hasAnyRole('DG','IC_DIVISION_HEAD','DELEGATION_LEADER','COORDINATOR','MEMBER','VIEWER')")
    public ResponseEntity<List<AgendaReadinessDTO>> getAgendaReadiness(@RequestParam String meetingId) {
        return ResponseEntity.ok(dashboardService.getAgendaReadiness(meetingId));
    }

    @GetMapping("/paper-pipeline")
    @PreAuthorize("hasAnyRole('DG','IC_DIVISION_HEAD','DELEGATION_LEADER','COORDINATOR','VIEWER')")
    public ResponseEntity<List<PaperPipelineDTO>> getPaperPipeline(@RequestParam String meetingId) {
        return ResponseEntity.ok(dashboardService.getPaperPipeline(meetingId));
    }

    @GetMapping("/pending-actions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PendingActionDTO>> getPendingActions(
            @RequestParam String userId,
            @RequestParam String role,
            @AuthenticationPrincipal Jwt jwt) {
        // CRITICAL: always scope to jwt.getSubject(), ignore userId param for security
        return ResponseEntity.ok(dashboardService.getPendingActions(jwt.getSubject(), role));
    }

    @GetMapping("/delegation-activity")
    @PreAuthorize("hasAnyRole('DG','IC_DIVISION_HEAD','DELEGATION_LEADER','COORDINATOR')")
    public ResponseEntity<List<DelegationActivityDTO>> getDelegationActivity(
            @RequestParam String meetingId,
            @AuthenticationPrincipal Jwt jwt) {
        String role = jwt.getClaimAsString("realm_role");
        return ResponseEntity.ok(dashboardService.getDelegationActivity(meetingId, role, jwt.getSubject()));
    }
}
```

---

## Key SQL Queries Needed (for DashboardService.java)

### Preparedness Score Calculation
```sql
-- Tasks completion rate
SELECT 
  COUNT(*) FILTER (WHERE status = 'DONE') AS tasks_complete,
  COUNT(*) AS tasks_total
FROM tasks WHERE meeting_id = :meetingId;

-- Papers ready (FINALIZED)
SELECT 
  COUNT(*) FILTER (WHERE status = 'FINALIZED') AS papers_ready,
  COUNT(*) AS papers_total
FROM papers 
WHERE meeting_id = :meetingId AND submission_required = true;

-- Feedback consolidated (DL_APPROVED positions)
SELECT 
  COUNT(*) FILTER (WHERE status = 'DL_APPROVED') AS consolidated,
  COUNT(*) AS total
FROM consolidated_positions WHERE meeting_id = :meetingId;
```

### Pending Actions for User
```sql
-- Papers awaiting approval by current user's role
SELECT p.id, p.title, p.current_stage, p.updated_at
FROM papers p
WHERE p.meeting_id = :meetingId
  AND p.current_stage = :expectedStageForRole
  AND p.assigned_reviewer_id = :userId;

-- Tasks overdue
SELECT t.id, t.title, t.due_date
FROM tasks t
WHERE t.assigned_to = :userId 
  AND t.status != 'DONE' 
  AND t.due_date < CURRENT_DATE;
```

---

## Frontend — Replace Stub Functions

In `ISEPExecutiveDashboard.jsx`, replace the `API` object at the top:

```javascript
// Get JWT token from Keycloak context
// Cursor: import useKeycloak from your auth provider
const getHeaders = () => ({
  "Authorization": `Bearer ${keycloak.token}`,
  "Content-Type": "application/json"
});

const KONG_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const API = {
  getDashboardSummary: async (meetingId, role) => {
    const res = await fetch(`${KONG_BASE}/api/dashboard/summary?meetingId=${meetingId}&role=${role}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Dashboard summary failed: ${res.status}`);
    return res.json();
  },

  getAgendaReadiness: async (meetingId) => {
    const res = await fetch(`${KONG_BASE}/api/dashboard/agenda-readiness?meetingId=${meetingId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Agenda readiness failed: ${res.status}`);
    return res.json();
  },

  getPaperPipeline: async (meetingId) => {
    const res = await fetch(`${KONG_BASE}/api/dashboard/paper-pipeline?meetingId=${meetingId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Paper pipeline failed: ${res.status}`);
    return res.json();
  },

  getPendingActions: async (userId, role) => {
    const res = await fetch(`${KONG_BASE}/api/dashboard/pending-actions?userId=${userId}&role=${role}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Pending actions failed: ${res.status}`);
    return res.json();
  },

  getDelegationActivity: async (meetingId) => {
    const res = await fetch(`${KONG_BASE}/api/dashboard/delegation-activity?meetingId=${meetingId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Delegation activity failed: ${res.status}`);
    return res.json();
  },

  getAIInsights: async (meetingId) => {
    const res = await fetch(`${KONG_BASE}/api/ai/preparedness-score/${meetingId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`AI insights failed: ${res.status}`);
    return res.json();
  },
};
```

---

## Role-Based Data Scoping Rules

| Role | getDashboardSummary | getAgendaReadiness | getPaperPipeline | getDelegationActivity | getPendingActions |
|---|---|---|---|---|---|
| DG | Full | Full | Full | Full org matrix | DG approvals only |
| IC_DIVISION_HEAD | Full | Full | Full | Full org matrix | IC review queue |
| DELEGATION_LEADER | Full | Full | Full | Own delegation | DL approvals + consolidation |
| COORDINATOR | Scoped | Full | Full | Own org only | Tasks + consolidation |
| MEMBER | Scoped (own tasks) | Read-only | FINALIZED only | Own org only | Own tasks only |
| VIEWER | Summary only | Read-only | FINALIZED only | 403 | None |

---

## Environment Variables Required

Add to `.env.local` (Next.js frontend):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=isep
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=isep-frontend
```

---

## Files to Create / Modify

| Action | File |
|---|---|
| CREATE | `backend/.../dashboard/DashboardController.java` |
| CREATE | `backend/.../dashboard/DashboardService.java` |
| CREATE | `backend/.../dashboard/dto/DashboardSummaryDTO.java` |
| CREATE | `backend/.../dashboard/dto/AgendaReadinessDTO.java` |
| CREATE | `backend/.../dashboard/dto/PaperPipelineDTO.java` |
| CREATE | `backend/.../dashboard/dto/PendingActionDTO.java` |
| CREATE | `backend/.../dashboard/dto/DelegationActivityDTO.java` |
| MODIFY | `frontend/app/dashboard/page.tsx` → render `<ISEPExecutiveDashboard />` |
| MODIFY | `frontend/app/dashboard/page.tsx` → pass `meetingId` from URL params |
| MODIFY | `ISEPExecutiveDashboard.jsx` → replace `API` stubs with real fetch |
| ADD | Kong CE route: `GET /api/dashboard/*` → Spring Boot service |

---

*ISEP-DASH-CURSOR-01 | Executive Dashboard Backend Wiring | v1.0 | Confidential*
