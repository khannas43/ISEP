'use client';

/**
 * ISEP Executive Dashboard — impressive colorful UI with real API wiring (ISEP-DASH-CURSOR-01).
 * Uses getDashboardSummary, getAgendaReadiness, getPaperPipeline, getPendingActions, getDelegationActivity.
 * AI insights use stub when backend endpoint is not available.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getDashboardSummary,
  getDashboardAgendaReadiness,
  getDashboardPaperPipeline,
  getDashboardPendingActions,
  getDashboardDelegationActivity,
  getDashboardAIInsights,
  type DashboardSummaryDto,
  type DashboardAgendaReadinessDto,
  type DashboardPaperPipelineDto,
  type DashboardPendingActionDto,
  type DashboardDelegationActivityDto,
  type DashboardAIInsightsDto,
} from '@/lib/api';

// ——— Design tokens (vivid, impressive) ———
const T = {
  bg: '#F0F4FF',
  surface: '#FFFFFF',
  surfaceAlt: '#E8EEFA',
  navy: '#0E2348',
  navyMid: '#1A3B6F',
  blue: '#2563EB',
  blueLight: '#DBEAFE',
  teal: '#0D9488',
  tealLight: '#CCFBF1',
  green: '#059669',
  greenLight: '#D1FAE5',
  amber: '#D97706',
  amberLight: '#FEF3C7',
  red: '#DC2626',
  redLight: '#FEE2E2',
  purple: '#1a3a6b',
  purpleLight: '#dbeafe',
  muted: '#64748B',
  border: '#E2E8F0',
  text: '#0F172A',
  textSub: '#475569',
};

const ROLES: Record<string, { label: string; color: string; bg: string }> = {
  DG: { label: 'Director General', color: T.navy, bg: '#0E2348' },
  IC_DIVISION_HEAD: { label: 'IC Division Head', color: T.blue, bg: T.blue },
  DELEGATION_LEADER: { label: 'Delegation Leader', color: T.teal, bg: T.teal },
  COORDINATOR: { label: 'Coordinator', color: T.navyMid, bg: T.navyMid },
  MEMBER: { label: 'Member', color: T.green, bg: T.green },
  VIEWER: { label: 'Viewer (MoPSW)', color: T.muted, bg: T.muted },
};

const STAGE_NAMES = ['Draft', 'Grp Ldr', 'Del Ldr', 'IC Div', 'CS/NA', 'CSS', 'DG', 'Final'];

const DEFAULT_AI: DashboardAIInsightsDto = {
  generatedAt: 'Today (stub)',
  keyRisk: 'High-priority agenda items may require papers. Review paper pipeline and consolidate feedback.',
  recommendations: [
    'Prioritise draft papers for high-priority items.',
    'Consolidate feedback before submission deadlines.',
    'Review delegation task completion for at-risk orgs.',
  ],
  preparednessProjection: 'If current pace maintained, expected score at meeting start: 85',
};

type Props = {
  meetingId: string;
  accessToken: string;
  initialRole: string;
};

function Badge({ label, color, bg, small }: { label: string; color: string; bg?: string; small?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: small ? '2px 8px' : '4px 10px',
        borderRadius: 20,
        background: bg ?? `${color}22`,
        color,
        fontSize: small ? 10 : 11,
        fontWeight: 700,
        border: `1px solid ${color}40`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(score), 200);
    return () => clearTimeout(t);
  }, [score]);
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? T.green : score >= 55 ? T.amber : T.red;
  const label = score >= 80 ? 'STRONG' : score >= 55 ? 'AT RISK' : 'CRITICAL';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${(circ * anim) / 100} ${(circ * (100 - anim)) / 100}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.2,0.64,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.09, fontWeight: 700, color, letterSpacing: '0.5px', marginTop: 2 }}>{label}</span>
        <span style={{ fontSize: size * 0.07, color: T.muted, marginTop: 1 }}>/ 100</span>
      </div>
    </div>
  );
}

function StageBar({ stage }: { stage: number }) {
  const colors = [T.muted, T.purple, T.blue, T.teal, '#0891B2', '#059669', T.navy, T.green];
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {STAGE_NAMES.map((_, i) => (
        <div
          key={i}
          style={{
            height: 6,
            flex: 1,
            borderRadius: 3,
            background: i < stage ? colors[Math.min(i, colors.length - 1)] : T.border,
            transition: `background 0.3s ease ${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const c = priority === 'HIGH' ? T.red : priority === 'MEDIUM' ? T.amber : T.muted;
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: c,
        flexShrink: 0,
        boxShadow: priority === 'HIGH' ? `0 0 0 3px ${T.redLight}` : 'none',
      }}
    />
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    ON_TRACK: { label: 'On Track', color: T.green, bg: T.greenLight },
    AT_RISK: { label: 'At Risk', color: T.amber, bg: T.amberLight },
    COMPLETE: { label: 'Complete', color: T.blue, bg: T.blueLight },
    OVERDUE: { label: 'Overdue', color: T.red, bg: T.redLight },
  };
  const s = map[status] ?? map.ON_TRACK;
  return <Badge label={s.label} color={s.color} bg={s.bg} small />;
}

function ActionTypeIcon({ type }: { type: string }) {
  const map: Record<string, { icon: string; color: string }> = {
    APPROVAL_REQUIRED: { icon: '◉', color: T.red },
    POSITION_PENDING: { icon: '◈', color: T.amber },
    FEEDBACK_UNCONSOLIDATED: { icon: '◎', color: T.blue },
    TASK_OVERDUE: { icon: '⊘', color: T.amber },
  };
  const s = map[type] ?? { icon: '●', color: T.muted };
  return <span style={{ fontSize: 16, color: s.color }}>{s.icon}</span>;
}

function ProgressBar({ value, max, color = T.blue, height = 6 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: T.border, borderRadius: 99, height, overflow: 'hidden', flex: 1 }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.8s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      />
    </div>
  );
}

function Card({ children, style = {}, pad = 20 }: { children: React.ReactNode; style?: React.CSSProperties; pad?: number }) {
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: 16,
        border: `1px solid ${T.border}`,
        padding: pad,
        boxShadow: '0 4px 14px rgba(14,35,72,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: T.text, letterSpacing: '-0.2px' }}>{children}</div>
      {sub && <div style={{ fontSize: 15, fontWeight: 400, color: T.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function useCountUp(target: number, duration = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return v;
}

export function ISEPExecutiveDashboard({ meetingId, accessToken, initialRole }: Props) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState(initialRole || 'COORDINATOR');
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [agenda, setAgenda] = useState<DashboardAgendaReadinessDto[]>([]);
  const [papers, setPapers] = useState<DashboardPaperPipelineDto[]>([]);
  const [actions, setActions] = useState<DashboardPendingActionDto[]>([]);
  const [delegation, setDelegation] = useState<DashboardDelegationActivityDto[]>([]);
  const [aiInsights, setAiInsights] = useState<DashboardAIInsightsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(async () => {
    if (!meetingId || !accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [s, a, p, pa, d, ai] = await Promise.all([
        getDashboardSummary(accessToken, meetingId, activeRole),
        getDashboardAgendaReadiness(accessToken, meetingId),
        getDashboardPaperPipeline(accessToken, meetingId),
        getDashboardPendingActions(accessToken, activeRole),
        getDashboardDelegationActivity(accessToken, meetingId),
        getDashboardAIInsights(accessToken, meetingId),
      ]);
      setSummary(s ?? null);
      setAgenda(Array.isArray(a) ? a : []);
      setPapers(Array.isArray(p) ? p : []);
      setActions(Array.isArray(pa) ? pa : []);
      setDelegation(Array.isArray(d) ? d : []);
      setAiInsights(ai ?? DEFAULT_AI);
    } catch {
      setSummary(null);
      setAgenda([]);
      setPapers([]);
      setActions([]);
      setDelegation([]);
      setAiInsights(DEFAULT_AI);
    } finally {
      setLoading(false);
    }
  }, [meetingId, accessToken, activeRole]);

  useEffect(() => {
    load();
  }, [load]);

  const score = useCountUp(summary?.preparedness?.score ?? 0);
  const tasksC = useCountUp(summary?.preparedness?.tasksComplete ?? 0);
  const tasksT = summary?.preparedness?.tasksTotal ?? 0;
  const roleInfo = ROLES[activeRole] ?? ROLES.COORDINATOR;
  const highPriorityItems = agenda.filter((a) => a.priority === 'HIGH');
  const isPastMeeting = (summary?.meeting?.status === 'COMPLETED') || ((summary?.meeting?.daysToMeeting ?? 0) < 0);

  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.bg} 0%, ${T.surfaceAlt} 100%)` }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚓</div>
          <div className="text-slate-500 font-medium">Loading dashboard…</div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.bg }}>
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚓</div>
          <h2 className="text-lg font-semibold text-slate-800">Dashboard unavailable</h2>
          <p className="mt-2 text-base text-slate-600">Unable to load data for this meeting. Check the meeting ID and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-visible m-0 p-0" style={{ background: T.bg, color: T.text }}>
      <style>{`
        button { cursor: pointer; }
      `}</style>

      {/* Topbar — gradient (min-height only — fixed h-14 clipped multi-line meeting title) */}
      <header
        className="sticky top-0 z-50 flex scroll-mt-0 items-center justify-between overflow-visible px-6 py-2.5 sm:py-3"
        style={{
          background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
          boxShadow: '0 4px 20px rgba(14,35,72,0.25)',
          minHeight: '3.5rem',
          overflow: 'visible',
          scrollMarginTop: 0,
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="text-2xl">⚓</span>
          <div className="shrink-0">
            <div className="text-base font-bold text-white">ISEP</div>
            <div className="text-[14px] text-white/50 uppercase tracking-wider">IMO Strategic Engagement Platform</div>
          </div>
          <div className="hidden h-7 w-px shrink-0 bg-white/20 sm:ml-2 sm:block" />
          <div className="min-w-0 pt-[12px] text-white/70">
            <span className="block text-[18px] font-bold leading-tight text-white">{summary.meeting.title}</span>
            <span className="mt-0.5 block text-base">
              {summary.meeting.body} Session {summary.meeting.session} · {summary.meeting.startDate} –{' '}
              {summary.meeting.endDate} · {summary.meeting.location}
            </span>
          </div>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-3 overflow-visible">
          <div className="flex shrink-0 rounded-lg bg-white/10 p-1 gap-0.5">
            {Object.entries(ROLES).map(([key, r]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveRole(key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeRole === key ? r.bg : 'transparent',
                  color: activeRole === key ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {key === 'IC_DIVISION_HEAD' ? 'ICDH' : key === 'DELEGATION_LEADER' ? 'DL' : key}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2 overflow-visible rounded-full bg-white/10 px-3 py-1.5">
            <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
            <span
              className="whitespace-nowrap text-xs font-medium text-white/90"
              style={{ whiteSpace: 'nowrap' }}
            >
              {roleInfo.label}
            </span>
          </div>
          {summary.pendingActions > 0 && (
            <div className="relative">
              <span className="text-lg">🔔</span>
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0E2348]"
                style={{ background: T.red }}
              >
                {summary.pendingActions}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Status banner — vivid gradient */}
      <div
        className="scroll-mt-0 flex flex-wrap items-center justify-between gap-4 overflow-visible px-6 pb-4"
        style={{
          background: `linear-gradient(135deg, ${T.navy} 0%, #1e3a5f 50%, ${T.teal} 100%)`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          paddingTop: 16,
          overflow: 'visible',
          scrollMarginTop: 0,
        }}
      >
        <div className="flex flex-wrap gap-8 items-center">
          <div>
            <div
              className="mb-1 uppercase text-white/70"
              style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.5px' }}
            >
              Meeting Preparedness
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className="leading-none"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: summary.preparedness.score >= 80 ? '#4ADE80' : '#FCD34D',
                }}
              >
                {score}
              </span>
              <span className="text-base text-white/50">/ 100</span>
              <span className="text-base font-medium text-emerald-200 ml-1">↑ {summary.preparedness.trend} this week</span>
            </div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          {[
            { label: 'Tasks Complete', val: `${tasksC} / ${tasksT}`, color: '#4ADE80' },
            { label: 'Positions Consolidated', val: `${summary.preparedness.feedbackConsolidated} / ${summary.preparedness.feedbackTotal}`, color: '#60A5FA' },
            { label: 'Papers Ready', val: `${summary.preparedness.papersReady} / ${summary.preparedness.papersTotal}`, color: '#FCD34D' },
            { label: 'Days to Meeting', val: isPastMeeting ? 'Meeting over' : String(summary.meeting.daysToMeeting), color: isPastMeeting ? '#94A3B8' : '#F9A8D4' },
          ].map((s, i) => (
            <div key={i}>
              <div
                className="mb-0.5 uppercase text-white/65"
                style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.5px' }}
              >
                {s.label}
              </div>
              <div className="leading-tight" style={{ fontSize: 28, fontWeight: 700, color: s.color }}>
                {s.val}
              </div>
            </div>
          ))}
        </div>
        {summary.criticalAlerts > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/50">
            <span>⚠</span>
            <div>
              <div className="text-sm font-bold text-red-200">{summary.criticalAlerts} Critical Alert</div>
              <div className="text-[14px] text-white/70">Review high-priority items</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex gap-0">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'agenda', label: 'Agenda Readiness' },
          { key: 'papers', label: 'Paper Pipeline' },
          { key: 'delegation', label: 'Delegation Activity' },
          { key: 'actions', label: `My Actions${actions.length > 0 ? ` (${actions.length})` : ''}` },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === t.key ? `3px solid ${T.blue}` : '3px solid transparent',
              color: activeTab === t.key ? T.blue : T.muted,
              fontSize: 15,
              fontWeight: activeTab === t.key ? 700 : 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="w-full max-w-none px-6 py-5">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <SectionTitle>Overall Preparedness</SectionTitle>
                <ScoreRing score={summary.preparedness.score} size={130} />
                <div className="w-full flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-28 text-[15px] font-normal text-slate-600">No. of Tasks</span>
                    <ProgressBar value={summary.preparedness.tasksComplete} max={summary.preparedness.tasksTotal} color={T.green} height={6} />
                    <span className="text-sm font-bold w-10 text-right" style={{ color: T.green }}>{summary.preparedness.tasksComplete}/{summary.preparedness.tasksTotal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-28 text-[15px] font-normal text-slate-600">Papers prepared/discussed</span>
                    <ProgressBar value={summary.preparedness.papersReady} max={summary.preparedness.papersTotal} color={T.amber} height={6} />
                    <span className="text-sm font-bold w-10 text-right" style={{ color: T.amber }}>{summary.preparedness.papersReady}/{summary.preparedness.papersTotal}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionTitle sub="Items requiring formal submission">High Priority Agenda Items</SectionTitle>
                <div className="flex flex-col gap-2">
                  {highPriorityItems.length === 0 ? (
                    <p className="text-[15px] font-normal text-slate-600">No high-priority items</p>
                  ) : (
                    highPriorityItems.map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border"
                        style={{
                          background: item.paperStatus === 'FINALIZED' ? T.greenLight : item.paperStatus === 'DRAFT' || !item.paperStatus ? T.redLight : T.amberLight,
                          borderColor: item.paperStatus === 'FINALIZED' ? `${T.green}40` : `${T.amber}50`,
                        }}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-base font-bold text-slate-900 flex-1">{item.title}</span>
                          {!isPastMeeting && (
                            <div className="flex gap-1 flex-shrink-0">
                              {item.paperStatus === 'FINALIZED' && <Badge label="Paper Ready" color={T.green} bg={T.greenLight} small />}
                              {item.paperStatus === 'DRAFT' && <Badge label="Draft" color={T.amber} bg={T.amberLight} small />}
                              {!item.paperStatus && <Badge label="Not Started" color={T.red} bg={T.redLight} small />}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[15px] font-normal text-slate-700">
                          <span>
                            Tasks: <b className="font-semibold text-slate-900">{item.tasksComplete}/{item.tasksTotal}</b>
                          </span>
                          {!isPastMeeting && item.positionReady && <Badge label="Position Set" color={T.green} small />}
                          {!isPastMeeting && !item.positionReady && <Badge label="Pending" color={T.amber} small />}
                          {!isPastMeeting && item.daysLeft != null && item.daysLeft >= 0 && <span style={{ color: item.daysLeft < 10 ? T.red : T.amber, fontWeight: 600 }}>{item.daysLeft}d left</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card style={{ background: `linear-gradient(145deg, ${T.navy} 0%, ${T.navyMid} 100%)`, border: 'none' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-base">✦</div>
                  <div>
                    <div className="text-[17px] font-semibold text-white">AI Insight</div>
                    <div className="text-[14px] font-medium text-white/60">Generated {aiInsights?.generatedAt}</div>
                  </div>
                </div>
                {isPastMeeting ? (
                  <>
                    <div className="mb-2 text-[14px] font-bold uppercase tracking-wider text-white/60">
                      Meeting minutes & points discussed
                    </div>
                    <div className="flex flex-col gap-2 leading-snug text-white/90" style={{ fontSize: 15, fontWeight: 400 }}>
                      <p>Summary of discussions, decisions, and action items from this meeting. Minutes and outcomes can be viewed under the Meeting detail → Outcomes / Live tab.</p>
                      <p>Key points discussed and resolutions are captured in the agenda items and paper pipeline for this session.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/15 p-3">
                      <div className="mb-1 text-sm font-bold text-red-200">⚠ Key Risk</div>
                      <div className="leading-snug text-white/90" style={{ fontSize: 15, fontWeight: 400 }}>
                        {aiInsights?.keyRisk}
                      </div>
                    </div>
                    <div className="mb-2 text-[14px] font-bold uppercase tracking-wider text-white/60">Recommendations</div>
                    <div className="flex flex-col gap-2">
                      {(aiInsights?.recommendations ?? []).map((r, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/50">
                            {i + 1}
                          </span>
                          <span className="leading-snug text-white/90" style={{ fontSize: 15, fontWeight: 400 }}>
                            {r}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-500/15 p-2">
                      <span className="text-emerald-200" style={{ fontSize: 15, fontWeight: 400 }}>
                        📈 {aiInsights?.preparednessProjection?.split(': ')[1] ?? '—'}
                      </span>
                    </div>
                  </>
                )}
              </Card>
            </div>

            <Card>
              <SectionTitle sub="Actions requiring your attention">My Pending Actions</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actions.length === 0 ? (
                  <p className="col-span-2 text-[15px] font-normal text-slate-600">No pending actions</p>
                ) : (
                  actions.map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => a.screen && router.push(a.screen)}
                      className="text-left flex gap-3 p-3 rounded-xl border transition opacity hover:opacity-90"
                      style={{
                        background: a.priority === 'HIGH' ? T.redLight : T.amberLight,
                        borderColor: a.priority === 'HIGH' ? `${T.red}30` : `${T.amber}40`,
                      }}
                    >
                      <ActionTypeIcon type={a.type} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-base font-bold text-slate-900">{a.title}</div>
                        <div className="mt-0.5 line-clamp-2 text-[15px] font-normal text-slate-700">{a.detail}</div>
                        <div className="flex gap-2 items-center mt-2">
                          <Badge label={a.priority} color={a.priority === 'HIGH' ? T.red : T.amber} small />
                          <span className="text-[14px] text-slate-600">Due: {a.dueDate}</span>
                        </div>
                      </div>
                      <span className="text-slate-400 self-center">›</span>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'agenda' && (
          <Card>
            <SectionTitle sub="Readiness status of agenda items">Agenda Item Readiness</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-base border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    {['Priority', 'Agenda Item', "India's Position", 'Paper Status', 'Tasks', 'Submission'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agenda.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100" style={{ background: i % 2 === 0 ? T.bg : T.surface }}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <PriorityDot priority={item.priority} />
                          <span className="text-sm font-semibold" style={{ color: item.priority === 'HIGH' ? T.red : item.priority === 'MEDIUM' ? T.amber : T.muted }}>{item.priority}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{item.id}</div>
                      </td>
                      <td className="py-3 px-3">
                        {item.positionReady ? <Badge label="Consolidated" color={T.green} bg={T.greenLight} small /> : <Badge label="Pending" color={T.amber} bg={T.amberLight} small />}
                      </td>
                      <td className="py-3 px-3 min-w-[140px]">
                        {item.paperStatus ? (
                          <div>
                            <StageBar stage={item.paperStatus === 'FINALIZED' ? 8 : item.paperStatus === 'DRAFT' ? 1 : 4} />
                            <div className="mt-1 text-[14px] text-slate-600">{item.paperStatus.replace(/_/g, ' ')}</div>
                          </div>
                        ) : item.submissionRequired && !isPastMeeting ? (
                          <Badge label="Not Started" color={T.red} bg={T.redLight} small />
                        ) : (
                          <span className="text-sm text-slate-500">{item.submissionRequired && isPastMeeting ? '—' : 'Not required'}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: item.tasksComplete === item.tasksTotal ? T.green : T.text }}>{item.tasksComplete}/{item.tasksTotal}</span>
                          <ProgressBar value={item.tasksComplete} max={item.tasksTotal} color={item.tasksComplete === item.tasksTotal ? T.green : T.blue} height={4} />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {item.submissionRequired ? <span className="text-sm font-semibold text-red-600">Required</span> : <span className="text-sm text-slate-500">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'papers' && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'FINALIZED', count: papers.filter((p) => p.stage >= 7).length, color: T.green },
                { label: 'In Review', count: papers.filter((p) => p.stage > 1 && p.stage < 7).length, color: T.blue },
                { label: 'Draft', count: papers.filter((p) => p.stage <= 1).length, color: T.amber },
              ].map((s, i) => (
                <div key={i} className="flex gap-2 items-center px-4 py-2 rounded-lg border border-slate-200 bg-white">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-base font-bold" style={{ color: s.color }}>{s.count}</span>
                  <span className="text-base text-slate-500">{s.label}</span>
                </div>
              ))}
            </div>
            {papers.map((p, i) => (
              <Card key={i} style={{ border: p.urgent ? `2px solid ${T.red}50` : undefined }}>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono font-semibold text-slate-500">{p.id}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-sm text-slate-500">{p.agendaItem}</span>
                      {p.urgent && <Badge label="Action Needed" color={T.red} bg={T.redLight} small />}
                    </div>
                    <div className="font-bold text-slate-900">{p.title}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge
                      label={p.stageName}
                      color={p.stage >= 7 ? T.green : p.stage >= 4 ? T.blue : p.stage >= 2 ? T.purple : T.amber}
                      bg={p.stage >= 7 ? T.greenLight : p.stage >= 4 ? T.blueLight : T.purpleLight}
                    />
                    <div className="mt-1 text-[14px] text-slate-600">Stage {Math.min(p.stage, 7)} of 7</div>
                  </div>
                </div>
                <StageBar stage={p.stage} />
                <div className="flex justify-between mt-2 text-sm text-slate-500">
                  <span>Last action: <span className="text-slate-700 font-medium">{p.lastAction}</span> — {p.lastActionDate}</span>
                  <span>Submitted by: <span className="text-slate-700 font-medium">{p.submittedBy}</span></span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'delegation' && (
          <Card>
            <SectionTitle sub="Contribution and readiness across delegation">Delegation Activity</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-base border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    {['Organisation', 'Role', 'Tasks', 'Feedback', 'Papers', 'Status'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {delegation.map((d, i) => (
                    <tr key={i} className="border-b border-slate-100" style={{ background: i % 2 === 0 ? T.bg : T.surface }}>
                      <td className="py-3 px-3 font-bold text-slate-900">{d.org}</td>
                      <td className="py-3 px-3 text-slate-500">{d.role}</td>
                      <td className="py-3 px-3 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold w-10" style={{ color: d.tasksComplete === d.tasksTotal ? T.green : T.text }}>{d.tasksComplete}/{d.tasksTotal}</span>
                          <ProgressBar value={d.tasksComplete} max={d.tasksTotal} color={d.tasksComplete === d.tasksTotal ? T.green : T.blue} height={5} />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold" style={{ color: d.feedbackSubmitted > 0 ? T.blue : T.muted }}>{d.feedbackSubmitted}</td>
                      <td className="py-3 px-3 text-center font-bold" style={{ color: d.papersOwned > 0 ? T.navy : T.muted }}>{d.papersOwned > 0 ? d.papersOwned : '—'}</td>
                      <td className="py-3 px-3">
                        <StatusChip status={d.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'actions' && (
          <div className="flex flex-col gap-4">
            <p className="text-base text-slate-500">Showing actions for <strong className="text-slate-800">{roleInfo.label}</strong></p>
            {actions.length === 0 ? (
              <Card><p className="text-base text-slate-500">No pending actions</p></Card>
            ) : (
              actions.map((a, i) => (
                <Card key={i} style={{ border: a.priority === 'HIGH' ? `2px solid ${T.red}40` : undefined }}>
                  <div className="flex gap-4 items-start">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: a.priority === 'HIGH' ? T.redLight : T.amberLight }}
                    >
                      <ActionTypeIcon type={a.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <div className="font-bold text-slate-900">{a.title}</div>
                        <div className="flex gap-2">
                          <Badge label={a.priority} color={a.priority === 'HIGH' ? T.red : T.amber} small />
                          <span className="text-sm text-slate-500">Due: {a.dueDate}</span>
                        </div>
                      </div>
                      <p className="text-base text-slate-600 leading-snug mb-2">{a.detail}</p>
                      <button
                        type="button"
                        onClick={() => a.screen && router.push(a.screen)}
                        className="px-4 py-2 rounded-lg text-base font-semibold text-white border-0"
                        style={{ background: T.navy }}
                      >
                        Take Action →
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      <footer className="px-6 py-3 border-t border-slate-200 flex justify-between items-center flex-wrap gap-2 mt-6">
        <div className="text-sm text-slate-500">ISEP · Directorate General of Shipping · MoPSW · Government of India</div>
        <div className="text-sm text-slate-500">AI Insights advisory only</div>
      </footer>
    </div>
  );
}
