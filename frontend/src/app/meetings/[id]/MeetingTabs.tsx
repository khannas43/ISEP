'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const ALL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'agenda', label: 'Agenda Items' },
  { id: 'documents', label: 'Documents' },
  { id: 'participants', label: 'Participants' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'correspondence', label: 'Correspondence Groups' },
  { id: 'live', label: 'Live meeting' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'history', label: 'Timeline / History' },
] as const;

type Props = {
  meetingId: string;
  showParticipantsTab?: boolean;
  showHistoryTab?: boolean;
  showLiveTab?: boolean;
  showOutcomesTab?: boolean;
};

export function MeetingTabs({
  meetingId: _meetingId,
  showParticipantsTab = true,
  showHistoryTab = true,
  showLiveTab = true,
  showOutcomesTab = true,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get('tab') || 'overview') as string;
  const tabs = ALL_TABS.filter(
    (t) =>
      (t.id !== 'participants' || showParticipantsTab) &&
      (t.id !== 'history' || showHistoryTab) &&
      (t.id !== 'live' || showLiveTab) &&
      (t.id !== 'outcomes' || showOutcomesTab)
  );

  const momHref = `/meetings/${_meetingId}/mom`;
  const isMomActive = pathname.endsWith('/mom');

  return (
    <nav className="flex flex-wrap gap-1 border-b border-slate-200 bg-white/80" aria-label="Meeting sections">
      {tabs.map((tab) => {
        const isActive = current === tab.id;
        const href = `${pathname}?tab=${tab.id}`;
        return (
          <Link
            key={tab.id}
            href={href}
            className={`border-b-2 px-4 py-3.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
      <Link
        href={momHref}
        className={`border-b-2 px-4 py-3.5 text-sm font-medium transition-colors ${
          isMomActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700'
        }`}
      >
        Minutes of Meeting
      </Link>
    </nav>
  );
}
