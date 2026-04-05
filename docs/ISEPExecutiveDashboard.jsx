import { useState, useEffect, useCallback } from "react";

// ============================================================
// API STUBS — Cursor: replace each function body with real
// fetch() calls to your Spring Boot / FastAPI endpoints.
// All endpoints are secured via Keycloak JWT (Bearer token).
// Kong CE Gateway base: http://localhost:8000
// ============================================================
const API = {
  // GET /api/dashboard/summary?meetingId={id}&role={role}
  getDashboardSummary: async (meetingId, role) => ({
    meeting: { title: "Sea Fire Fighting", body: "SSE", session: 4, location: "Colombo, Sri Lanka", startDate: "02 Feb 2027", endDate: "05 Feb 2027", daysToMeeting: 328, status: "UPCOMING" },
    preparedness: { score: 76, trend: +8, tasksComplete: 28, tasksTotal: 33, feedbackConsolidated: 2, feedbackTotal: 3, papersReady: 2, papersTotal: 3 },
    pendingActions: 4,
    criticalAlerts: 1,
  }),

  // GET /api/dashboard/agenda-readiness?meetingId={id}
  getAgendaReadiness: async (meetingId) => ([
    { id: "AI-004", title: "Fire Safety Systems — SOLAS Ch. II-2 Amendments", priority: "HIGH", submissionRequired: true, positionReady: true, paperStatus: "FINALIZED", tasksComplete: 6, tasksTotal: 6, daysLeft: null },
    { id: "AI-005", title: "Fire Fighting Equipment — Chemical Tankers", priority: "HIGH", submissionRequired: true, positionReady: true, paperStatus: "IC_DIVISION_REVIEW", tasksComplete: 5, tasksTotal: 6, daysLeft: 12 },
    { id: "AI-007", title: "Suppression System Testing Protocols", priority: "HIGH", submissionRequired: true, positionReady: false, paperStatus: "DRAFT", tasksComplete: 3, tasksTotal: 6, daysLeft: 8 },
    { id: "AI-003", title: "Review of IMO Fire Detection Guidelines", priority: "MEDIUM", submissionRequired: false, positionReady: true, paperStatus: null, tasksComplete: 4, tasksTotal: 4, daysLeft: null },
    { id: "AI-006", title: "Correspondence Group Report", priority: "MEDIUM", submissionRequired: false, positionReady: true, paperStatus: null, tasksComplete: 3, tasksTotal: 3, daysLeft: null },
    { id: "AI-001", title: "Opening of the Session", priority: "LOW", submissionRequired: false, positionReady: true, paperStatus: null, tasksComplete: 1, tasksTotal: 1, daysLeft: null },
    { id: "AI-002", title: "Adoption of the Agenda", priority: "LOW", submissionRequired: false, positionReady: true, paperStatus: null, tasksComplete: 1, tasksTotal: 1, daysLeft: null },
  ]),

  // GET /api/dashboard/paper-pipeline?meetingId={id}
  getPaperPipeline: async (meetingId) => ([
    { id: "WP-SFF-001", title: "India's Position on SOLAS Ch. II-2 Amendments", agendaItem: "Item 4", stage: 7, stageName: "FINALIZED", lastAction: "Approved by DG", lastActionDate: "18 Oct 2026", submittedBy: "DL, DGS HQ", urgent: false },
    { id: "WP-SFF-002", title: "Enhanced Standards for Chemical Tanker Fire Equipment", agendaItem: "Item 5", stage: 3, stageName: "IC Division Review", lastAction: "Forwarded by DL", lastActionDate: "22 Oct 2026", submittedBy: "DL, DGS HQ", urgent: true },
    { id: "WP-SFF-003", title: "Standardised Testing Protocols — Suppression Systems", agendaItem: "Item 7", stage: 1, stageName: "Draft", lastAction: "Created by Coordinator", lastActionDate: "24 Oct 2026", submittedBy: "Coord, DGS HQ", urgent: true },
  ]),

  // GET /api/dashboard/pending-actions?userId={id}&role={role}
  getPendingActions: async (userId, role) => ([
    { id: "PA-001", type: "APPROVAL_REQUIRED", title: "WP-SFF-002 awaiting your review", detail: "Enhanced Standards for Chemical Tanker Fire Equipment", priority: "HIGH", dueDate: "28 Oct 2026", screen: "/paper/review/WP-SFF-002" },
    { id: "PA-002", type: "POSITION_PENDING", title: "India's position not set — Item 7", detail: "Suppression System Testing Protocols (HIGH PRIORITY)", priority: "HIGH", dueDate: "30 Oct 2026", screen: "/collaboration/AI-007" },
    { id: "PA-003", type: "FEEDBACK_UNCONSOLIDATED", title: "3 new feedback submissions — Item 5", detail: "MMD Mumbai, MMD Chennai, MMD Kolkata awaiting consolidation", priority: "MEDIUM", dueDate: "01 Nov 2026", screen: "/collaboration/AI-005" },
    { id: "PA-004", type: "TASK_OVERDUE", title: "2 tasks overdue", detail: "Research suppression protocols · Draft Item 7 abstract", priority: "MEDIUM", dueDate: "Overdue", screen: "/tasks" },
  ]),

  // GET /api/dashboard/delegation-activity?meetingId={id}
  getDelegationActivity: async (meetingId) => ([
    { org: "DGS HQ", role: "Lead Delegation", tasksComplete: 8, tasksTotal: 10, feedbackSubmitted: 3, papersOwned: 3, status: "ON_TRACK" },
    { org: "MMD Mumbai", role: "Technical Support", tasksComplete: 7, tasksTotal: 8, feedbackSubmitted: 3, papersOwned: 0, status: "ON_TRACK" },
    { org: "MMD Chennai", role: "Technical Support", tasksComplete: 5, tasksTotal: 7, feedbackSubmitted: 2, papersOwned: 0, status: "AT_RISK" },
    { org: "MMD Kolkata", role: "Technical Support", tasksComplete: 4, tasksTotal: 5, feedbackSubmitted: 2, papersOwned: 0, status: "ON_TRACK" },
    { org: "MoPSW", role: "Observer", tasksComplete: 4, tasksTotal: 4, feedbackSubmitted: 0, papersOwned: 0, status: "COMPLETE" },
    { org: "BIS", role: "Standards Advisor", tasksComplete: 3, tasksTotal: 4, feedbackSubmitted: 1, papersOwned: 0, status: "AT_RISK" },
  ]),

  // GET /api/ai/preparedness-score/{meetingId}  (FastAPI)
  getAIInsights: async (meetingId) => ({
    generatedAt: "Today, 09:14 IST",
    keyRisk: "Item 7 (Suppression Protocols) has no formal paper. At current pace, submission deadline at risk.",
    recommendations: [
      "Prioritise WP-SFF-003 drafting — assign additional resource from MMD Mumbai",
      "Consolidate Item 5 feedback before 01 Nov to allow DL review window",
      "BIS advisor has 1 overdue task — follow up before technical session on 02 Feb",
    ],
    preparednessProjection: "If current pace maintained, expected score at meeting start: 91",
  }),
};

// ============================================================
// DESIGN TOKENS
// ============================================================
const T = {
  bg: "#F7F8FC",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F3FA",
  navy: "#0E2348",
  navyMid: "#1A3B6F",
  blue: "#1A56DB",
  blueLight: "#EBF0FD",
  teal: "#0B7A75",
  tealLight: "#E6F4F3",
  green: "#0E7A4E",
  greenLight: "#E6F4ED",
  amber: "#B45309",
  amberLight: "#FEF3C7",
  red: "#B91C1C",
  redLight: "#FEE2E2",
  muted: "#6B7A99",
  border: "#E2E8F4",
  text: "#1A2340",
  textSub: "#4A5578",
};

const ROLES = {
  DG: { label: "Director General", color: T.navy, bg: "#0E2348" },
  IC_DIVISION_HEAD: { label: "IC Division Head", color: T.blue, bg: T.blue },
  DELEGATION_LEADER: { label: "Delegation Leader", color: T.teal, bg: T.teal },
  COORDINATOR: { label: "Coordinator", color: "#6D28D9", bg: "#6D28D9" },
  MEMBER: { label: "Member", color: T.green, bg: T.green },
  VIEWER: { label: "Viewer (MoPSW)", color: T.muted, bg: T.muted },
};

// ============================================================
// SUB-COMPONENTS
// ============================================================
const Badge = ({ label, color, bg, small }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: small ? "2px 7px" : "3px 10px",
    borderRadius: 20, background: bg || `${color}18`,
    color: color, fontSize: small ? 10 : 11, fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.3px",
    border: `1px solid ${color}30`, whiteSpace: "nowrap",
  }}>{label}</span>
);

const ScoreRing = ({ score, size = 120 }) => {
  const [anim, setAnim] = useState(0);
  useEffect(() => { setTimeout(() => setAnim(score), 300); }, [score]);
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? T.green : score >= 55 ? T.amber : T.red;
  const label = score >= 80 ? "STRONG" : score >= 55 ? "AT RISK" : "CRITICAL";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${circ * anim/100} ${circ * (1-anim/100)}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.6s cubic-bezier(0.34,1.2,0.64,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: size * 0.26, fontWeight: 800, color, fontFamily: "'Fraunces', serif", lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: size * 0.09, fontWeight: 700, color, letterSpacing: "1px", marginTop: 2 }}>{label}</div>
        <div style={{ fontSize: size * 0.075, color: T.muted, marginTop: 1 }}>/ 100</div>
      </div>
    </div>
  );
};

const StageBar = ({ stage, total = 7 }) => {
  const stages = ["Draft", "Grp Ldr", "Del Ldr", "IC Div", "CS/NA", "CSS", "DG", "Final"];
  const colors = [T.muted, "#8B5CF6", T.blue, T.teal, "#0891B2", "#059669", T.navy, T.green];
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {stages.map((s, i) => (
        <div key={i} title={s} style={{
          height: 6, flex: 1, borderRadius: 3,
          background: i < stage ? colors[Math.min(i, colors.length-1)] : T.border,
          transition: `background 0.3s ease ${i * 0.06}s`,
        }} />
      ))}
    </div>
  );
};

const PriorityDot = ({ priority }) => {
  const c = priority === "HIGH" ? T.red : priority === "MEDIUM" ? T.amber : T.muted;
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0, boxShadow: priority === "HIGH" ? `0 0 0 3px ${T.redLight}` : "none" }} />;
};

const StatusChip = ({ status }) => {
  const map = {
    ON_TRACK: { label: "On Track", color: T.green, bg: T.greenLight },
    AT_RISK: { label: "At Risk", color: T.amber, bg: T.amberLight },
    COMPLETE: { label: "Complete", color: T.blue, bg: T.blueLight },
    OVERDUE: { label: "Overdue", color: T.red, bg: T.redLight },
  };
  const s = map[status] || map.ON_TRACK;
  return <Badge label={s.label} color={s.color} bg={s.bg} small />;
};

const ActionTypeIcon = ({ type }) => {
  const map = {
    APPROVAL_REQUIRED: { icon: "◉", color: T.red },
    POSITION_PENDING: { icon: "◈", color: T.amber },
    FEEDBACK_UNCONSOLIDATED: { icon: "◎", color: T.blue },
    TASK_OVERDUE: { icon: "⊘", color: T.amber },
  };
  const s = map[type] || { icon: "●", color: T.muted };
  return <span style={{ fontSize: 16, color: s.color }}>{s.icon}</span>;
};

const ProgressBar = ({ value, max, color = T.blue, height = 6 }) => (
  <div style={{ background: T.border, borderRadius: 99, height, overflow: "hidden", flex: 1 }}>
    <div style={{ height: "100%", width: `${Math.min((value/max)*100,100)}%`, background: color, borderRadius: 99, transition: "width 1s cubic-bezier(0.34,1.2,0.64,1)" }} />
  </div>
);

const Card = ({ children, style = {}, pad = 20 }) => (
  <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: pad, boxShadow: "0 1px 4px rgba(14,35,72,0.05)", ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.2px" }}>{children}</div>
    {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{sub}</div>}
  </div>
);

const useCountUp = (target, duration = 1400) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = null;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(e * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return v;
};

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function ISEPExecutiveDashboard() {
  const [activeRole, setActiveRole] = useState("DG");
  const [summary, setSummary] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [papers, setPapers] = useState([]);
  const [actions, setActions] = useState([]);
  const [delegation, setDelegation] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async () => {
    setLoading(true);
    // Cursor: pass real meetingId from router params / context
    const meetingId = "M-SFF-2027";
    const [s, a, p, pa, d, ai] = await Promise.all([
      API.getDashboardSummary(meetingId, activeRole),
      API.getAgendaReadiness(meetingId),
      API.getPaperPipeline(meetingId),
      API.getPendingActions("current-user", activeRole),
      API.getDelegationActivity(meetingId),
      API.getAIInsights(meetingId),
    ]);
    setSummary(s); setAgenda(a); setPapers(p);
    setActions(pa); setDelegation(d); setAiInsights(ai);
    setLoading(false);
  }, [activeRole]);

  useEffect(() => { load(); }, [load]);

  const score = useCountUp(summary?.preparedness?.score || 0);
  const tasksC = useCountUp(summary?.preparedness?.tasksComplete || 0);
  const tasksT = summary?.preparedness?.tasksTotal || 0;

  if (loading || !summary) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚓</div>
        <div style={{ fontSize: 13, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>Loading dashboard…</div>
      </div>
    </div>
  );

  const roleInfo = ROLES[activeRole];
  const highPriorityItems = agenda.filter(a => a.priority === "HIGH");
  const criticalPapers = papers.filter(p => p.urgent);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; }
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={{ background: T.navy, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 16px rgba(14,35,72,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 22 }}>⚓</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.3px" }}>ISEP</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "1.5px", textTransform: "uppercase" }}>IMO Strategic Engagement Platform</div>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)", marginLeft: 8 }} />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            <span style={{ color: "#fff", fontWeight: 600 }}>{summary.meeting.title}</span>
            &nbsp;·&nbsp;{summary.meeting.body} Session {summary.meeting.session}
            &nbsp;·&nbsp;{summary.meeting.startDate} – {summary.meeting.endDate}
            &nbsp;·&nbsp;{summary.meeting.location}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Role Switcher — Cursor: replace with real auth context */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: 3, gap: 2 }}>
            {Object.entries(ROLES).map(([key, r]) => (
              <button key={key} onClick={() => setActiveRole(key)} style={{
                padding: "4px 10px", borderRadius: 6, border: "none",
                background: activeRole === key ? r.bg : "transparent",
                color: activeRole === key ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.3px",
                transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
              }}>{key === "IC_DIVISION_HEAD" ? "ICDH" : key === "DELEGATION_LEADER" ? "DL" : key}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "rgba(255,255,255,0.08)", borderRadius: 20 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{roleInfo.label}</span>
          </div>
          {summary.pendingActions > 0 && (
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }}>🔔</div>
              <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: T.red, fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, border: "2px solid " + T.navy }}>{summary.pendingActions}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── MEETING STATUS BANNER ── */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>Meeting Preparedness</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: summary.preparedness.score >= 80 ? "#4ADE80" : "#FCD34D", fontFamily: "'Fraunces', serif", lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/ 100</span>
              <span style={{ fontSize: 12, color: "#4ADE80", marginLeft: 4 }}>↑ {summary.preparedness.trend} this week</span>
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
          {[
            { label: "Tasks Complete", val: `${tasksC} / ${tasksT}`, color: "#4ADE80" },
            { label: "Positions Consolidated", val: `${summary.preparedness.feedbackConsolidated} / ${summary.preparedness.feedbackTotal}`, color: "#60A5FA" },
            { label: "Papers Ready", val: `${summary.preparedness.papersReady} / ${summary.preparedness.papersTotal}`, color: "#FCD34D" },
            { label: "Days to Meeting", val: summary.meeting.daysToMeeting, color: "#F9A8D4" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'Fraunces', serif" }}>{s.val}</div>
            </div>
          ))}
        </div>
        {summary.criticalAlerts > 0 && (
          <div style={{ padding: "8px 16px", background: `${T.red}22`, border: `1px solid ${T.red}55`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚠</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5" }}>{summary.criticalAlerts} Critical Alert</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Item 7 paper not started</div>
            </div>
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 28px", display: "flex", gap: 0 }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "agenda", label: "Agenda Readiness" },
          { key: "papers", label: "Paper Pipeline" },
          { key: "delegation", label: "Delegation Activity" },
          { key: "actions", label: `My Actions ${actions.length > 0 ? `(${actions.length})` : ""}` },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "12px 18px", border: "none", background: "transparent",
            borderBottom: activeTab === t.key ? `2.5px solid ${T.blue}` : "2.5px solid transparent",
            color: activeTab === t.key ? T.blue : T.muted,
            fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500,
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            transition: "all 0.18s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "20px 28px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 1fr", gap: 16 }}>

              {/* Preparedness Ring */}
              <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <SectionTitle>Overall Preparedness</SectionTitle>
                <ScoreRing score={summary.preparedness.score} size={130} />
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  {[
                    { label: "Tasks", v: summary.preparedness.tasksComplete, t: summary.preparedness.tasksTotal, c: T.green },
                    { label: "Positions", v: summary.preparedness.feedbackConsolidated, t: summary.preparedness.feedbackTotal, c: T.blue },
                    { label: "Papers Ready", v: summary.preparedness.papersReady, t: summary.preparedness.papersTotal, c: T.amber },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 11, color: T.muted, width: 60 }}>{r.label}</div>
                      <ProgressBar value={r.v} max={r.t} color={r.c} height={5} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: r.c, width: 30, textAlign: "right" }}>{r.v}/{r.t}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* High Priority Agenda Items */}
              <Card>
                <SectionTitle sub="Items requiring formal submission to IMO">High Priority Agenda Items</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {highPriorityItems.map((item, i) => (
                    <div key={i} style={{ padding: "12px 14px", background: item.paperStatus === "FINALIZED" ? T.greenLight : item.paperStatus === "DRAFT" || !item.paperStatus ? T.redLight : T.amberLight, borderRadius: 10, border: `1px solid ${item.paperStatus === "FINALIZED" ? T.green + "40" : item.paperStatus === "DRAFT" || !item.paperStatus ? T.red + "30" : T.amber + "40"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, flex: 1, paddingRight: 8 }}>{item.title}</div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                          {item.paperStatus === "FINALIZED" && <Badge label="Paper Ready" color={T.green} bg={T.greenLight} small />}
                          {item.paperStatus === "IC_DIVISION_REVIEW" && <Badge label="In Review" color={T.blue} bg={T.blueLight} small />}
                          {item.paperStatus === "DRAFT" && <Badge label="Draft Only" color={T.amber} bg={T.amberLight} small />}
                          {!item.paperStatus && <Badge label="Not Started" color={T.red} bg={T.redLight} small />}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 11, color: T.muted }}>Tasks: <b style={{ color: T.text }}>{item.tasksComplete}/{item.tasksTotal}</b></div>
                        {item.positionReady ? <Badge label="Position Set" color={T.green} small /> : <Badge label="Position Pending" color={T.amber} small />}
                        {item.daysLeft && <div style={{ fontSize: 11, color: item.daysLeft < 10 ? T.red : T.amber, fontWeight: 600 }}>{item.daysLeft}d left</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* AI Insight */}
              <Card style={{ background: `linear-gradient(135deg, #0E2348 0%, #1A3B6F 100%)`, border: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>AI Preparedness Insight</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Generated {aiInsights?.generatedAt}</div>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: "rgba(250,80,80,0.12)", border: "1px solid rgba(250,80,80,0.25)", borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", marginBottom: 4 }}>⚠ Key Risk</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{aiInsights?.keyRisk}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Recommendations</div>
                  {aiInsights?.recommendations.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "rgba(255,255,255,0.4)", flexShrink: 0, marginTop: 1 }}>{i+1}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{r}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: "8px 12px", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "#4ADE80" }}>📈 Projected score at meeting start: <b>{aiInsights?.preparednessProjection?.split(": ")[1]}</b></div>
                </div>
              </Card>
            </div>

            {/* Pending Actions — always visible in overview */}
            <Card>
              <SectionTitle sub="Actions requiring your attention">My Pending Actions</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {actions.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: a.priority === "HIGH" ? T.redLight : T.amberLight, borderRadius: 10, border: `1px solid ${a.priority === "HIGH" ? T.red + "25" : T.amber + "30"}`, cursor: "pointer", transition: "opacity 0.15s" }}
                    onClick={() => { /* Cursor: navigate to a.screen */ }}>
                    <ActionTypeIcon type={a.type} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 3 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: T.textSub, marginBottom: 5, lineHeight: 1.4 }}>{a.detail}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Badge label={a.priority} color={a.priority === "HIGH" ? T.red : T.amber} small />
                        <span style={{ fontSize: 10, color: T.muted }}>Due: {a.dueDate}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 16, color: T.muted, alignSelf: "center" }}>›</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ══ AGENDA READINESS TAB ══ */}
        {activeTab === "agenda" && (
          <Card>
            <SectionTitle sub="Readiness status of all 7 agenda items for Sea Fire Fighting">Agenda Item Readiness</SectionTitle>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  {["Priority", "Agenda Item", "India's Position", "Paper Status", "Tasks", "Submission"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agenda.map((item, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.bg : T.surface, transition: "background 0.15s" }}>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <PriorityDot priority={item.priority} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: item.priority === "HIGH" ? T.red : item.priority === "MEDIUM" ? T.amber : T.muted }}>{item.priority}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{item.id}</div>
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      {item.positionReady
                        ? <Badge label="Consolidated" color={T.green} bg={T.greenLight} small />
                        : <Badge label="Pending" color={T.amber} bg={T.amberLight} small />}
                    </td>
                    <td style={{ padding: "12px 12px", minWidth: 160 }}>
                      {item.paperStatus ? (
                        <div>
                          <StageBar stage={item.paperStatus === "FINALIZED" ? 8 : item.paperStatus === "IC_DIVISION_REVIEW" ? 4 : item.paperStatus === "DRAFT" ? 1 : 0} />
                          <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{item.paperStatus.replace(/_/g," ")}</div>
                        </div>
                      ) : item.submissionRequired ? (
                        <Badge label="Not Started" color={T.red} bg={T.redLight} small />
                      ) : (
                        <span style={{ fontSize: 11, color: T.muted }}>Not required</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ display: "flex", align: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.tasksComplete === item.tasksTotal ? T.green : T.text }}>{item.tasksComplete}/{item.tasksTotal}</span>
                        <ProgressBar value={item.tasksComplete} max={item.tasksTotal} color={item.tasksComplete === item.tasksTotal ? T.green : T.blue} height={4} />
                      </div>
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      {item.submissionRequired
                        ? <div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontSize: 14 }}>📋</span><span style={{ fontSize: 11, fontWeight: 600, color: T.red }}>Required</span></div>
                        : <span style={{ fontSize: 11, color: T.muted }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ══ PAPER PIPELINE TAB ══ */}
        {activeTab === "papers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 2 }}>
              {[
                { label: "FINALIZED", count: papers.filter(p=>p.stage===7).length, color: T.green },
                { label: "In Review", count: papers.filter(p=>p.stage>1&&p.stage<7).length, color: T.blue },
                { label: "Draft", count: papers.filter(p=>p.stage<=1).length, color: T.amber },
              ].map((s, i) => (
                <div key={i} style={{ padding: "8px 16px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.count}</span>
                  <span style={{ fontSize: 12, color: T.muted }}>{s.label}</span>
                </div>
              ))}
            </div>
            {papers.map((p, i) => (
              <Card key={i} style={{ border: p.urgent ? `1.5px solid ${T.red}40` : `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: T.muted, fontWeight: 600 }}>{p.id}</span>
                      <span style={{ fontSize: 10, color: T.muted }}>·</span>
                      <span style={{ fontSize: 11, color: T.muted }}>{p.agendaItem}</span>
                      {p.urgent && <Badge label="Action Needed" color={T.red} bg={T.redLight} small />}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.title}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                    <Badge label={p.stageName} color={p.stage === 7 ? T.green : p.stage >= 4 ? T.blue : p.stage >= 2 ? "#8B5CF6" : T.amber} bg={p.stage === 7 ? T.greenLight : p.stage >= 4 ? T.blueLight : p.stage >= 2 ? "#EDE9FE" : T.amberLight} />
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>Stage {Math.min(p.stage,7)} of 7</div>
                  </div>
                </div>
                <StageBar stage={p.stage} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: T.muted }}>Last action: <span style={{ color: T.text, fontWeight: 500 }}>{p.lastAction}</span> — {p.lastActionDate}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>Submitted by: <span style={{ color: T.text, fontWeight: 500 }}>{p.submittedBy}</span></div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ══ DELEGATION ACTIVITY TAB ══ */}
        {activeTab === "delegation" && (
          <Card>
            <SectionTitle sub="Contribution and readiness status across India's delegation">Delegation Activity</SectionTitle>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  {["Organisation", "Role in Meeting", "Tasks", "Feedback Submitted", "Papers", "Status"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {delegation.map((d, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.bg : T.surface }}>
                    <td style={{ padding: "13px 12px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{d.org}</div>
                    </td>
                    <td style={{ padding: "13px 12px" }}>
                      <span style={{ fontSize: 11, color: T.muted }}>{d.role}</span>
                    </td>
                    <td style={{ padding: "13px 12px", minWidth: 140 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: d.tasksComplete === d.tasksTotal ? T.green : T.text, width: 32 }}>{d.tasksComplete}/{d.tasksTotal}</span>
                        <ProgressBar value={d.tasksComplete} max={d.tasksTotal} color={d.tasksComplete === d.tasksTotal ? T.green : T.blue} height={5} />
                      </div>
                    </td>
                    <td style={{ padding: "13px 12px", textAlign: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: d.feedbackSubmitted > 0 ? T.blue : T.muted }}>{d.feedbackSubmitted}</span>
                    </td>
                    <td style={{ padding: "13px 12px", textAlign: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: d.papersOwned > 0 ? T.navy : T.muted }}>{d.papersOwned > 0 ? d.papersOwned : "—"}</span>
                    </td>
                    <td style={{ padding: "13px 12px" }}>
                      <StatusChip status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ══ ACTIONS TAB ══ */}
        {activeTab === "actions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>
              Showing actions for <strong style={{ color: T.text }}>{roleInfo.label}</strong>. Cursor: filter by <code style={{ background: T.surfaceAlt, padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>userId</code> from auth context.
            </div>
            {actions.map((a, i) => (
              <Card key={i} style={{ border: a.priority === "HIGH" ? `1.5px solid ${T.red}35` : `1px solid ${T.border}`, cursor: "pointer" }}
                pad={16}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: a.priority === "HIGH" ? T.redLight : T.amberLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ActionTypeIcon type={a.type} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{a.title}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Badge label={a.priority} color={a.priority === "HIGH" ? T.red : T.amber} small />
                        <span style={{ fontSize: 11, color: T.muted }}>Due: {a.dueDate}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5, marginBottom: 10 }}>{a.detail}</div>
                    <button style={{ padding: "7px 16px", background: T.navy, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                      /* Cursor: onClick={() => router.push(a.screen)} */ }}>
                      Take Action →
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: "14px 28px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div style={{ fontSize: 11, color: T.muted }}>ISEP · Directorate General of Shipping · MoPSW · Government of India</div>
        <div style={{ fontSize: 11, color: T.muted }}>
          AI Insights powered by <strong style={{ color: T.text }}>Claude Sonnet 4</strong> · All AI outputs are advisory only
        </div>
      </div>
    </div>
  );
}
