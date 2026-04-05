const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-800',
  IN_APPROVAL: 'bg-[var(--navy-100)] text-[var(--navy-800)]',
  SUBMITTED_TO_GROUP_LEADER: 'bg-[var(--navy-100)] text-[var(--navy-800)]',
  SUBMITTED_TO_DELEGATION_LEADER: 'bg-[var(--navy-100)] text-[var(--navy-800)]',
  SUBMITTED_TO_IC_DIVISION: 'bg-[var(--navy-100)] text-[var(--navy-800)]',
  SUBMITTED_TO_CS_NA_CSS: 'bg-[var(--navy-100)] text-[var(--navy-800)]',
  SUBMITTED_TO_DG: 'bg-[var(--gold-100)] text-amber-900',
  SUBMITTED_TO_MOPSW: 'bg-[var(--gold-100)] text-amber-900',
  CLEAN_COPY: 'bg-emerald-50 text-emerald-800',
  FINALIZED: 'bg-emerald-100 text-emerald-900',
  LOCKED: 'bg-slate-200 text-slate-600',
  REJECTED: 'bg-red-100 text-red-800',
};

export function PaperStatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ');
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_COLOURS[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {label}
    </span>
  );
}
