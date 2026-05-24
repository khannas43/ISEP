# ISEP — Demo Script
## IMO Strategic Engagement Platform
**Client:** Directorate General of Shipping, MoPSW, Government of India
**Audience:** DGS officials + MoPSW representatives
**Prepared by:** MagicSword 🗡️
**Date:** 05 April 2026

---

## Pre-Demo Setup (15 minutes before audience arrives)

```bash
cd "/Users/sameerkhanna/Documents/Projects/DG Shipping"

# 1. Confirm all services running
docker compose -f infrastructure/docker/docker-compose.dev.yml ps

# 2. Health check
curl -s http://localhost:8082/actuator/health | grep -o '"status":"[^"]*"'

# 3. Get fresh token
SECRET=$(./scripts/resolve-keycloak-client-secret.sh)
set +H
TOKEN=$(curl -s -X POST 'http://localhost:8180/realms/isep-realm/protocol/openid-connect/token' \
  -d 'grant_type=password' -d 'client_id=isep-web' -d "client_secret=$SECRET" \
  -d 'username=admin-sa' -d 'password=Admin@12345!' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "Token ready: ${TOKEN:0:20}..."

# 4. Pre-activate live session so Phase 5 works without a click
curl -s -X PUT -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8082/api/v1/meetings/00000000-0000-0000-0000-000000000001/live/activate"
echo "Live session activated"

# 5. Pre-generate MoM
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8082/api/v1/meetings/00000000-0000-0000-0000-000000000001/mom/generate" \
  | python3 -c "import sys,json; print('MoM ready:', json.load(sys.stdin)['status'])"
```

**Open these browser tabs in advance (do not show the screen until needed):**

| Tab | URL | Used in |
|---|---|---|
| 1 | `http://localhost:3000` | Phase 1 — login |
| 2 | `http://localhost:3000/dashboard/executive` | Phase 1 — dashboard |
| 3 | `http://localhost:3000/meetings/00000000-0000-0000-0000-000000000001` | Phase 1 — meeting |
| 4 | `http://localhost:3000/documents/00000000-0000-0000-0000-000000000201/editor/` | Phase 2 — editor |
| 5 | `http://localhost:3000/documents/00000000-0000-0000-0000-000000000201/compare/` | Phase 3 — diff |
| 6 | `http://localhost:3000/meetings/00000000-0000-0000-0000-000000000001/live` | Phase 5 — live |
| 7 | `http://localhost:3000/meetings/00000000-0000-0000-0000-000000000001/mom` | Phase 6 — MoM |
| 8 | `http://localhost:3000/reports/analytics` | Phase 6 — analytics |
| Incognito | `http://localhost:3000` | Phase 2 — co-user |

**Demo credentials:**
- Presenter: `admin-sa` / `Admin@12345!`
- Member persona: `co-user` / `Co@12345!`
- External agency: `moefcc-rep` / `Agency@12345!`

---

## Opening Statement (2 minutes)

> "India participates in over 40 IMO sessions every year — spanning the Maritime Safety Committee, Marine Environment Protection Committee, and six sub-committees. Each session involves dozens of agenda items, hundreds of documents, and coordination across multiple ministries.
>
> Today, this process runs on email chains, WhatsApp groups, and manually shared Word documents. There is no central system. Position papers get lost. Feedback arrives after deadlines. Approvals get delayed.
>
> ISEP — the IMO Strategic Engagement Platform — replaces all of this with a single, secure, government-grade digital platform. I will walk you through a complete scenario: India preparing its national position on proposed amendments to MARPOL Annex VI for the upcoming MSC 108 session in London, in April."

---

## Phase 1 — Committee Setup, Agenda Ingestion & Task Allocation
**Time: 5 minutes | Persona: System Admin**

### Step 1 — Login (Tab 1)

Switch to Tab 1. Show the login page.

**Say:**
> "Access is through DGS official credentials. The platform is role-based — six distinct roles from System Administrator to read-only Viewer. Each role sees only what is relevant to their function."

Log in: `admin-sa` / `Admin@12345!`

### Step 2 — Dashboard (Tab 2)

**Point to:**
- DGS crest in sidebar — "The platform identity is anchored to the Directorate General of Shipping"
- Stat cards — "16 position papers currently in various stages of the drafting pipeline"
- Calendar sidebar — hover over 19 April dot

**Say:**
> "The calendar shows upcoming meetings. Hovering over a date shows the meeting details — MSC 108, IMO Headquarters, London. Two upcoming sessions are visible this month."

Click on the meeting in Quick Open section.

### Step 3 — Meeting Preparedness Intelligence (Tab 3)

**This is the most important moment in Phase 1. Pause here.**

Point to the AI panel: 62/100, AMBER RISK.

**Say:**
> "This is Meeting Preparedness Intelligence — one of ISEP's AI-powered features. The platform analyses every task, every feedback submission, every paper approval, and every participant confirmation — and computes a real-time readiness score.
>
> Today we are at 62 out of 100. Amber. Three critical actions must be resolved before the MSC 108 session in 14 days."

Read out the critical actions:
- "Agenda Item 4.3 — feedback still pending from 3 of 6 assigned members"
- "India's Position on GHG Strategy — stuck at IC Division approval for 8 days"
- "4 tasks overdue across 3 agenda items"

**Say:**
> "The system doesn't just report — it projects. At current pace, India will reach 78 out of 100 by meeting date. Resolving the two red items would take us to 91. The delegation can now focus exactly where it matters."

Point to the green checkmarks:
> "What's already done: 11 of 14 positions finalised, all delegation participants confirmed, all reference documents uploaded."

### Step 4 — Document Upload

Click Agenda Items tab → Item 4.1 → Documents tab.

**Say:**
> "When the IMO Secretariat circulates an agenda paper, the Coordinator uploads it here — tagged automatically to the committee, meeting, and agenda item. No manual filing. The document is immediately available to all assigned members."

### Step 5 — Task Creation

Click Tasks tab → show the existing task.

**Say:**
> "The Delegation Leader assigns tasks directly to members — linked to the specific agenda item, with due dates and priority. The moment a task is created, the assigned member receives an in-portal notification and an email. Everything is tracked."

**Transition:**
> "Let me now show you what the member sees on their end."

---

## Phase 2 — Collaborative Drafting & Track Changes
**Time: 5 minutes | Persona switch: co-user in incognito**

### Step 1 — Member Task Dashboard

Open incognito window (already logged in as co-user, or log in now).
Navigate to `/tasks/my`.

**Say:**
> "The member logs in and immediately sees their personal task board — pending, in progress, and completed. The task assigned in Phase 1 is here. No searching through emails."

### Step 2 — Open Document in Editor (Tab 4)

Switch back to main Chrome → Tab 4.

**Say:**
> "The member opens the India Position Paper on MARPOL Annex VI. This is ISEP's collaborative editing environment — built on the same real-time infrastructure used by professional document collaboration tools, adapted for government workflows."

Point out:
- Clean serif font, professional layout
- Toolbar: formatting + Track Changes toggle
- "Saved" status indicator at top right

### Step 3 — Real-Time Collaboration

On the incognito window (co-user), also navigate to the same editor URL.

Point to the presence bar: **"Also editing: Admin SA"**

**Say:**
> "The presence bar shows every user currently in the document — in real time. Each person has a unique colour. Their cursor is visible to all collaborators."

Type "strongly " before "supports" in the main Chrome window.

**Say:**
> "Watch the incognito window."

Show the text appearing within 2 seconds.

> "Changes synchronise instantly. No version conflicts. No attachments. No 'which version is the latest' confusion."

### Step 4 — Enable Track Changes

Click "Track Changes: OFF" → becomes "Track Changes: ON"

Make a small edit — change "with limited capacity" to "requiring additional support"

**Say:**
> "With Track Changes enabled, every insertion appears in green underline and every deletion in red strikethrough — attributed to the author with a precise timestamp. The original source document is never altered. Every editorial decision is preserved for the approver."

**Transition:**
> "Once the draft is ready, it enters the multi-level approval chain."

---

## Phase 3 — Multi-Level Internal Approval Workflow
**Time: 5 minutes | Persona: admin-sa (acting as approver)**

### Step 1 — Version Comparison (Tab 5)

Switch to Tab 5: compare page.

**Say:**
> "The version comparison tool shows exactly what changed between any two saved versions. Here we are comparing version 1 — the original draft — with version 2 — after the member's edits."

Point out:
- Green chunks: "strongly", "requiring additional support", "with clear interim milestones" — INSERTED
- Red strikethrough: "with limited capacity", "schedule." — DELETED
- Author name and timestamp on each change

> "Every change is attributed. The approver can see exactly who made each edit and when."

### Step 2 — Accept/Reject

Click ✓ Accept on "strongly" — it highlights navy.
Click ✗ Reject on a deletion — it dims with red border.

**Say:**
> "The approver accepts or rejects individual changes. Changes can also be accepted or rejected in bulk."

Click "Accept all."

**Say:**
> "Accepting all generates a Clean Copy — a new version with all accepted changes incorporated, all rejections reverted. This becomes the official working text for the next stage of approval."

### Step 3 — Approval Chain

Navigate to meeting → Papers tab → demo paper → Approval tab.

Point to the stepper: DRAFT → Group Leader → Delegation Leader → IC Division → CS/NA/CSS → DG → FINALIZED

**Say:**
> "ISEP enforces India's full 7-stage approval chain. Each stage is assigned to the correct role. The paper cannot advance without the designated approver's action. Every approval is logged — who approved, when, any comments."

> "For MoPSW, the final stage is configurable — it can be activated for specific paper categories as determined by DGS."

**Transition:**
> "Once internally approved, the clean copy goes to inter-ministerial consultation."

---

## Phase 4 — External Agency Consultation
**Time: 4 minutes | Persona: admin-sa + moefcc-rep**

### Step 1 — Consultation tracking page

Navigate to the paper → Consultation tab.

**Say:**
> "India's position on MARPOL Annex VI requires consultation with five ministries before finalisation — Environment, External Affairs, Defence, Steel, and Petroleum. In ISEP, this is managed through a dedicated consultation module."

Point to the agency list:
- MoEFCC — "Feedback received" (green)
- MEA — "Feedback received" (green)
- MoD — "Viewed" (blue)
- MoS — "Pending" (amber)
- MoPNG — "Pending" (amber)

**Say:**
> "The Delegation Leader can see at a glance which ministries have responded, which have viewed the document, and which haven't opened it yet. Three of five have responded. The deadline is in 5 days."

### Step 2 — External agency login

Switch to incognito → log out co-user → log in as `moefcc-rep` / `Agency@12345!`

**Say:**
> "Each ministry representative has a dedicated ISEP login — scoped only to the documents they are invited to review. They cannot see other meetings, other documents, or internal DGS deliberations."

Show the feedback already submitted:
> "MoEFCC has provided their feedback: 'MoEFCC supports India's position. Recommend adding reference to the National Action Plan on Climate Change in paragraph 2.' This feedback is now visible to the Delegation Leader for resolution."

**Transition:**
> "With inter-ministerial consultation complete and the final position locked, we move to the actual IMO session."

---

## Phase 5 — Live Meeting Collaboration
**Time: 4 minutes | Persona: admin-sa**

### Step 1 — Live meeting board (Tab 6)

Switch to Tab 6: live meeting page.

**Say:**
> "MSC 108 is now in session in London. The live meeting module gives the delegation a real-time collaboration interface during the actual committee proceedings."

Point to:
- Three seeded posts: INTERVENTION (navy), COMMENT (slate), INFORMATION (green)
- Post type selector: Comment, Intervention, Point of Order, Information
- "● LIVE" indicator (green, since we pre-activated)

**Say:**
> "As the IMO debate evolves on the floor, delegation members can post real-time interventions, comments, and procedural points — all visible instantly to the entire delegation. Colour coding separates formal interventions from working comments."

### Step 2 — Post in real time

Type in the comment box: *"Chair has indicated support for the proposed text. DL to confirm India's position before next item."*

Click Post.

**Say:**
> "Posts appear immediately for all delegation members connected to the session. If the Delegation Leader needs to lock discussion on an agenda item once the position is finalised, they can do so with a single click."

Click "Lock Discussion."

> "Once locked, no further posts are accepted from members — only the Delegation Leader and IC Division Head can still contribute. The discussion record is preserved as part of the official meeting archive."

**Transition:**
> "After the session concludes, ISEP generates the complete post-meeting record automatically."

---

## Phase 6 — Post-Meeting Analytics & Archival
**Time: 4 minutes | Persona: admin-sa**

### Step 1 — Minutes of Meeting (Tab 7)

Switch to Tab 7: MoM page.

Point to the generated MoM — already rendered.

**Say:**
> "ISEP auto-generates the Minutes of Meeting from the platform data — pulling the attendee list, all agenda items discussed, and all pending action items. This replaces hours of manual compilation after each session."

Point to the metrics strip: 7 attendees, 2 agenda items, 1 action item.

Click "Export PDF."

> "The MoM can be exported as a PDF — formatted and ready for official circulation — directly from the platform."

### Step 2 — Analytics Dashboard (Tab 8)

Switch to Tab 8: analytics page.

Point to the KPI cards:
- 7 members participated
- 2 tasks in pipeline
- 1 draft paper

**Say:**
> "The analytics dashboard gives leadership a consolidated view of delegation performance — participation rates, task completion, paper approval timelines, and preparedness trends across meetings."

Click Export Excel.

> "All reports are exportable in XML, Excel, and PDF formats — compatible with Government of India reporting requirements."

---

## Closing Statement (2 minutes)

> "What you have seen today is India's complete IMO engagement workflow — digitalised end to end.
>
> From the moment an agenda is received: documents uploaded, tasks assigned, positions drafted collaboratively, approved through the full chain, consulted across ministries, and delivered live on the floor in London.
>
> Everything is tracked. Everything is attributed. Nothing is lost in an email thread.
>
> ISEP is built on open-source technology, hosted on Government of India cloud infrastructure, and designed to align with MeitY, GIGW, and WCAG standards.
>
> The platform is ready for UAT. We look forward to your feedback."

---

## Handling Likely Questions

**Q: What about data security?**
> "The platform enforces three layers of access control — database row-level security, API-level authorisation, and frontend role guards. All data is encrypted at rest and in transit. Every user action generates an immutable audit log. The platform is designed for STQC certification."

**Q: Can this work for ILO and IMSO as well?**
> "Yes. The platform is designed for all international maritime engagements. The committee structure already supports ILO, IMSO, and bilateral working groups through the Others+ module. This is in the Go-Live scope."

**Q: What happens to existing documents?**
> "Existing documents can be bulk-uploaded. The data migration plan is part of the implementation scope. Historical position papers and meeting records can be imported and made searchable."

**Q: How does the AI preparedness score work?**
> "The score is computed from real platform data — task completion rates, feedback submission status, paper approval progress, and participant confirmations. It uses a weighted algorithm designed with DGS's input. All AI outputs are clearly labelled as advisory and require human review before any action."

**Q: What is the timeline to Go-Live?**
> "The implementation plan covers 12 months from contract signing — including requirement workshops, development, testing, UAT, security audits, and training. Operations and maintenance for 3 years follows."

---

## Demo Flow Summary

| Phase | Duration | Key moment |
|---|---|---|
| Opening | 2 min | Set the problem |
| Phase 1 | 5 min | **Meeting Preparedness Intelligence — 62/100** |
| Phase 2 | 5 min | **Real-time Y.js co-editing + presence bar** |
| Phase 3 | 5 min | **Version diff + clean copy generation** |
| Phase 4 | 4 min | **5-ministry consultation dashboard** |
| Phase 5 | 4 min | **Live SSE discussion board** |
| Phase 6 | 4 min | **Auto-generated MoM + analytics export** |
| Closing + Q&A | 5 min | |
| **Total** | **34 min** | |

