const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  IN_APPROVAL: 'bg-blue-100 text-blue-700',
  SUBMITTED_TO_GROUP_LEADER: 'bg-blue-100 text-blue-700',
  SUBMITTED_TO_DELEGATION_LEADER: 'bg-blue-100 text-blue-700',
  SUBMITTED_TO_IC_DIVISION: 'bg-purple-100 text-purple-700',
  SUBMITTED_TO_CS_NA_CSS: 'bg-purple-100 text-purple-700',
  SUBMITTED_TO_DG: 'bg-amber-100 text-amber-700',
  SUBMITTED_TO_MOPSW: 'bg-amber-100 text-amber-700',
  CLEAN_COPY: 'bg-green-100 text-green-700',
  FINALIZED: 'bg-green-200 text-green-800',
  LOCKED: 'bg-gray-200 text-gray-600',
  REJECTED: 'bg-red-100 text-red-800',
};

export function PaperStatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ');
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        STATUS_COLOURS[status] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {label}
    </span>
  );
}
