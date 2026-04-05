# SRS-03 — Functional Requirements
**Project:** IMO Strategic Engagement Platform (ISEP)
**Version:** 2.1
**Date:** 04 April 2026

> **Change log v2.1:** MoPSW configurable approval step added (C-01, pending DGS formal sign-off); Module G scope clarified — comment-capture as base, concurrent co-editing as Phase 2 (C-03, OI-008).

---

## FR-A — Committee, Sub-Committee, Working Group & Meeting Management

- Configuration and management of IMO Assembly, Council, Committees, Sub-Committees, Working Groups, and other international forums (including ILO, IMSO, and bilateral/multilateral engagements)
- Meeting creation and scheduling with metadata: dates, location, agenda, participants
- Dashboard view per meeting: agenda, uploaded documents, tasks, deadlines, participation status
- Chronological listing of past and upcoming meetings
- Calendar sidebar with hover-over summaries of upcoming meetings
- Role-based participant mapping and assignment

---

## FR-B — Agenda, Document & Version Management

- Agenda creation and assignment at meeting, committee, and group levels
- Secure upload, categorisation, and storage of agenda papers, working documents, submissions, and reference materials into dedicated paper preparation folders
- Document auto-tagging by committee, agenda item, source, and meeting on upload
- Version control with complete audit trail and timestamping of all uploads and revisions
- Secure in-system document viewing and controlled downloads
- Document locking upon finalisation by Delegation Leader to prevent further unauthorised edits

---

## FR-C — Collaboration, Feedback & Deliberation Management

- Structured user-wise and group-wise feedback submission for agenda items and documents
- Commenting, interventions, and deliberation notes with role-based visibility
- Structured templates for interventions, comments, and national position papers
- Consolidation of inputs at multiple levels enabling informed decision-making
- Defined review workflow: Member → Group Leader → Delegation Leader → IC Division
- Historical archive of feedback per meeting and agenda item for institutional memory

---

## FR-D — Task Allocation & Workflow Automation

- Task creation by leaders or coordinators linked to a specific agenda item and document
- Assignment to one or multiple members with due dates
- Member view of pending, ongoing, and completed tasks via personal dashboard
- Real-time task dashboards for both individual members and leaders
- Leader dashboard summarising all pending and completed tasks; exportable to XML and Excel
- Automatic reminders for approaching or overdue deadlines
- Escalation workflow for unresolved tasks
- Task prioritisation, due dates, and status tracking
- Automated workflow routing, reminders, and escalation mechanisms

---

## FR-E — Paper Preparation & Multi-Level Approval Workflows

### E.1 Collaborative Drafting

- Collaborative drafting environment with track-changes mode and version comparison
- Inline edits with strict version control and automatic timestamping without altering the source document
- TipTap (or equivalent open-source rich text editor) as the collaborative editor component
- Structured templates for interventions and national positions pre-loaded into editor

### E.2 Multi-Stage Approval Workflow

The paper approval chain is as follows:

```
DRAFT → Group Leader → Delegation Leader → IC Division → CS/NA/CSS → DG → [MoPSW — configurable] → FINALIZED
```

> **Note (C-01 — pending DGS formal sign-off):** The MoPSW approval step is implemented as a **configurable optional stage** at the paper/committee level. The SYSTEM_ADMIN may activate or deactivate this step per paper category or committee. This resolves the RFP ambiguity ("DG → MoPSW where applicable"). Two routes are supported:
> - Route A (default): DG → FINALIZED
> - Route B (configurable): DG → MoPSW → FINALIZED
>
> This will be locked to a single default configuration once DGS provides formal written sign-off on the scope of "where applicable." See OI-001 in SRS-09.

### E.3 Version Comparison & Clean Copy

- Version comparison tool enabling approvers to accept or reject individual track changes
- Generation of a "clean copy" after all changes are accepted/rejected
- Locking and finalisation of approved documents to prevent unauthorised edits

---

## FR-F — Correspondence Group Management

- Nomination and management of Correspondence Group members
- Upload and review of correspondence group tasks, inputs, and progress updates
- Group-level consolidation and reporting mechanisms
- Group roles: Convener, Coordinator, Members
- Ability to create correspondence groups with dedicated task tracking

---

## FR-G — Meeting-Time Collaboration & Discussion Interface

> **Scope note (C-03 — OI-008):** The Module G base implementation delivers comment-capture mode. Full concurrent co-editing of the same document during a live meeting is scoped to Phase 2, subject to formal DGS confirmation. See OI-008 in SRS-09.

### G.1 Base Implementation (Phase 1 delivery)

- Controlled discussion interface during live meetings: structured, timestamped comment and intervention submissions per agenda item
- Real-time feed of comments and interventions visible to all participants (via Server-Sent Events or polling)
- Role-based visibility and commenting permissions during meetings
- Discussion boards for agenda-wise deliberations and last-minute changes
- Commenting, tagging, and @mention functionality for collaboration

### G.2 Phase 2 (subject to DGS confirmation of OI-008)

- Full concurrent co-editing interface with CRDT/OT-based conflict resolution
- Real-time cursor presence and attribution during live document editing

---

## FR-H — Dashboards, Reports & Analytics

- Role-based dashboards: Admin, Delegation Leader, Coordinator, Member
- Committee-wise, meeting-wise, and agenda-wise dashboards
- Tracking of tasks, submissions, pending approvals, and outcomes
- Analytical insights on participation, performance, and timelines
- Member performance metrics: meetings attended, agenda involvement, interventions made
- Auto-generation of Summary Report and Minutes of Meeting (MoM) with attendee list and action items after meeting close
- Preparation status reports per committee and per meeting
- Tracking of national stand/intervention across agenda items
- Visualisation tools: charts and progress indicators for leadership monitoring
- Downloadable and configurable reports in XML, Excel, and PDF formats

---

## FR-I — Calendar, Alerts & Notifications

- Integrated calendar displaying upcoming meetings, deadlines, and milestones
- Calendar sidebar with hover-over summaries of upcoming meetings
- Automated alerts and notifications for: agenda updates, task assignments, approvals, and meetings
- Notification delivery via both in-portal alerts and email
- Self-service for admins to add consultants/support staff

---

## FR-J — User Management & Role-Based Access Control

- Centralised administrative console for user and role management
- Assignment of users to committees, working groups, and roles
- Role-based access enforcement across all modules and data
- Comprehensive access logs and audit trails for all user actions
- Support for six roles: SYSTEM_ADMIN, IC_DIVISION_HEAD, DELEGATION_LEADER, COORDINATOR, MEMBER, VIEWER
- VIEWER role is read-only by design — no drafting or editing access. This is documented by design intent and must be clearly communicated to DGS before UAT.

---

## FR-K — Compliance & Quality Requirements

- Application shall strictly adhere to the approved FRS/SRS and all applicable Government of India usability, accessibility, security, and performance standards
- Any deviations shall require prior written approval from DGS
- Solution shall be extensible, maintainable, and future-ready
- Detailed Functional Requirements are maintained in alignment with Annexure 2 of the RFP

---

## FR-L — International Engagements (Others+)

- Repository for bilateral and regional working group activities
- Upload of Terms of Reference, agreements, MoUs, minutes, and action items
- Tracking of outcomes, resolutions, and progress against commitments
- Summary reports for download and sharing with stakeholders
- Expandable to cover ILO, IMSO, JWG, and other bilateral/multilateral forums

> **Note:** This module is not required for demo. It is a full RFP module in scope for Go-Live.
