# ISEP - 20-Minute Demo Runbook

**Demo URL:** `http://148.230.66.191:3008/isep/`  
**Core scenario:** India prepares, coordinates, consults, and closes out its position for **Maritime Safety Committee - 108th Session**.  
**Demo meeting:** `00000000-0000-0000-0000-000000000001`  
**Demo paper:** `00000000-0000-0000-0000-000000000501`  
**Demo document:** `00000000-0000-0000-0000-000000000201`

## Demo Login Credentials

Use `admin-sa` for the main presenter flow. Use another role only if you want to demonstrate role-based access.

| Persona | Username | Password | Use in demo |
|---|---|---|---|
| System Admin | `admin-sa` | `Admin@12345!` | Main presenter account |
| IC Division Head | `ih-user` | `Ih@12345!` | Approval / oversight persona |
| Delegation Leader | `dl-user` | `Dl@12345!` | Delegation coordination persona |
| Coordinator | `co-user` | `Co@12345!` | Task and agenda coordination persona |
| Member / Expert | `me-user` | `Me@12345!` | Technical contributor persona |
| Viewer | `vw-user` | `Vw@12345!` | Read-only access persona |
| External agency | `moefcc-rep` | `Agency@12345!` | Consultation response persona |

## Recommended Browser Tabs

Open these before the meeting starts:

1. `http://148.230.66.191:3008/isep/login/`
2. `http://148.230.66.191:3008/isep/dashboard/`
3. `http://148.230.66.191:3008/isep/meetings/00000000-0000-0000-0000-000000000001/`
4. `http://148.230.66.191:3008/isep/papers/00000000-0000-0000-0000-000000000501/draft/`
5. `http://148.230.66.191:3008/isep/papers/00000000-0000-0000-0000-000000000501/consultation/`
6. `http://148.230.66.191:3008/isep/meetings/00000000-0000-0000-0000-000000000001/live/`
7. `http://148.230.66.191:3008/isep/meetings/00000000-0000-0000-0000-000000000001/mom/`

## 20-Minute Demo Flow

### 1. Opening and Login - 2 minutes

Log in as `admin-sa`.

Say:

> ISEP gives DGS one shared platform for IMO meeting preparation, cross-ministry consultation, live meeting collaboration, and post-meeting closure.

Show:

- DGS-branded login page.
- Role-based authenticated access.
- Sidebar modules: Dashboard, Meetings, Documents, Papers, Tasks, Reports.

### 2. War Room Dashboard - 3 minutes

Open `/dashboard/`.

Show:

- Upcoming meeting strip.
- **Maritime Safety Committee - 108th Session**.
- Meeting Preparedness / MPI score.
- Critical actions, paper pipeline, agenda readiness.

Say:

> Instead of chasing email threads, the dashboard tells DGS which meetings need attention, what is pending, and which agenda items are at risk.

Keep this short. Do not demonstrate every dashboard widget.

### 3. Meeting Collaboration Hub - 4 minutes

Open the MSC 108 meeting detail page.

Show only these tabs:

- **Overview:** meeting dates, body, status, action buttons.
- **Agenda Items:** agenda item 4.1 for MARPOL Annex VI.
- **Tasks:** task ownership and status.
- **Documents:** linked reference / position document.

Say:

> The meeting page becomes the operational workspace. Agenda, documents, tasks, participants, and history are connected to one meeting record.

Optional quick action:

- Open the Tasks tab and show assigned tasks.
- Avoid creating a new task unless asked.

### 4. Position Paper Drafting - 3 minutes

Open the paper draft:

`/papers/00000000-0000-0000-0000-000000000501/draft/`

Show:

- Draft paper workspace.
- Link back to the clean-copy document.
- Approval / consultation action entry points.

Say:

> The position paper is no longer a detached Word file. It is linked to the meeting, agenda item, document record, review workflow, and consultation process.

Do not spend time editing text unless specifically requested.

### 5. Inter-Ministerial Consultation - 4 minutes

Open:

`/papers/00000000-0000-0000-0000-000000000501/consultation/`

Show:

- Summary counts: responded, viewed, pending.
- Five agencies:
  - MoEFCC - feedback submitted.
  - MEA - feedback submitted.
  - MoD - viewed, no response yet.
  - Ministry of Steel - pending.
  - MoPNG - pending.
- Expand one submitted feedback panel.

Say:

> This is the key collaboration feature. DGS can see which ministry has responded, who has only opened the request, who is pending, and the actual structured feedback received.

If there is time, log in separately as `moefcc-rep` / `Agency@12345!` to show the external-agency persona. Otherwise, stay in admin view and expand the existing feedback.

### 6. Live Meeting Collaboration - 2 minutes

Open:

`/meetings/00000000-0000-0000-0000-000000000001/live/`

Show:

- Live discussion / intervention stream.
- Agenda-linked discussion.
- Official intervention or comment area if visible.

Say:

> During the IMO session, the same meeting record becomes a live collaboration room for the Indian delegation, reducing scattered WhatsApp and email coordination.

Do not create many posts; one quick comment is enough if needed.

### 7. Minutes of Meeting and Closure - 3 minutes

Open:

`/meetings/00000000-0000-0000-0000-000000000001/mom/`

Show:

- Generate MoM, if not already generated.
- Attendees, agenda items covered, action items, status.
- Export PDF button if available.

Say:

> After the meeting, ISEP converts the structured meeting data into formal minutes and action follow-up, closing the loop from preparation to execution to post-meeting tracking.

## Closing Message — 1 minute

Say:

> The value of ISEP is not just document storage. It connects meeting planning, agenda tracking, task ownership, position-paper drafting, external consultation, live meeting collaboration, and post-meeting minutes into one auditable workflow for DGS.

## If Time Runs Short

Prioritize these four screens:

1. Dashboard.
2. Meeting detail page.
3. Consultation page.
4. Minutes of Meeting page.

Skip:

- Admin screens.
- Reports.
- Bulk user management.
- Detailed document editing.
- Full approval workflow.

## Common Demo Recovery

- If a page shows old state, hard-refresh the browser.
- If My Tasks or Dashboard shows fallback data, refresh after a few seconds; backend may still be warming after container restart.
- If login is interrupted, go directly to `http://148.230.66.191:3008/isep/login/`.
- If MoM already exists, present it as pre-generated rather than regenerating.
