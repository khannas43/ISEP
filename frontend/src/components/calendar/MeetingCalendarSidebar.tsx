'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTranslation } from '@/i18n/client';
import { getApiUrl, type MeetingDto } from '@/lib/api';

type TileTooltip = { meeting: MeetingDto; x: number; y: number };

function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayKey(iso: string): string {
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

export function MeetingCalendarSidebar() {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const router = useRouter();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const [meetings, setMeetings] = useState<MeetingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tooltip, setTooltip] = useState<TileTooltip | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      setMeetings([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const url = `${getApiUrl()}/api/v1/meetings?upcoming=true&limit=30`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        });
        if (!res.ok) {
          if (!cancelled) setMeetings([]);
          return;
        }
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        if (!cancelled) setMeetings(list);
      } catch {
        if (!cancelled) setMeetings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const meetingDates = useMemo(() => {
    const set = new Set<string>();
    for (const m of meetings) {
      const start = dayKey(m.startDate);
      const end = dayKey(m.endDate ?? m.startDate);
      let cur = new Date(`${start}T12:00:00`);
      const endD = new Date(`${end}T12:00:00`);
      while (cur <= endD) {
        set.add(toIsoLocal(cur));
        const next = new Date(cur);
        next.setDate(next.getDate() + 1);
        cur = next;
      }
    }
    return set;
  }, [meetings]);

  const getMeetingsForDate = useCallback(
    (date: Date): MeetingDto[] => {
      const iso = toIsoLocal(date);
      return meetings.filter((m) => {
        const s = dayKey(m.startDate);
        const e = dayKey(m.endDate ?? m.startDate);
        return iso >= s && iso <= e;
      });
    },
    [meetings]
  );

  const committeeLabel = (m: MeetingDto) => m.committeeShortName ?? m.bodyName;

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>, date: Date) => {
      const dayMeetings = getMeetingsForDate(date);
      if (dayMeetings.length === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        meeting: dayMeetings[0],
        x: rect.right + 8,
        y: rect.top,
      });
    },
    [getMeetingsForDate]
  );

  useEffect(() => {
    if (!tooltip) return;
    const hide = () => setTooltip(null);
    window.addEventListener('scroll', hide, { passive: true });
    return () => window.removeEventListener('scroll', hide);
  }, [tooltip]);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const iso = toIsoLocal(date);
    if (!meetingDates.has(iso)) return null;
    return (
      <div
        className="flex justify-center mt-0.5"
        onMouseEnter={(e) => handleMouseEnter(e, date)}
        onMouseLeave={() => setTooltip(null)}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
      </div>
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    const iso = toIsoLocal(date);
    return meetingDates.has(iso) ? 'has-meeting font-medium text-blue-700' : '';
  };

  const startIso = (m: MeetingDto) => dayKey(m.startDate);
  const endIso = (m: MeetingDto) => dayKey(m.endDate ?? m.startDate);

  return (
    <div className="relative w-64 shrink-0">
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {t('calendar.upcomingMeetings')}
      </p>

      {loading && <p className="text-xs text-slate-500">{t('common.loading')}</p>}
      {!loading && meetings.length === 0 && (
        <p className="text-xs text-slate-500">{t('calendar.noMeetings')}</p>
      )}

      {meetings.length > 0 && (
        <Calendar
          value={selectedDate}
          onChange={(v) => setSelectedDate(v as Date)}
          tileContent={tileContent}
          tileClassName={tileClassName}
          onClickDay={(date) => {
            const dayMeetings = getMeetingsForDate(date);
            if (dayMeetings.length > 0) {
              router.push(`/meetings/${dayMeetings[0].meetingId}`);
            }
          }}
          className="!w-full !border-0 !bg-transparent !shadow-none text-sm"
        />
      )}

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 max-w-48 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="truncate font-semibold text-slate-800">{tooltip.meeting.title}</p>
          <p className="mt-0.5 text-slate-500">{committeeLabel(tooltip.meeting)}</p>
          <p className="text-slate-500">
            {startIso(tooltip.meeting)}
            {endIso(tooltip.meeting) !== startIso(tooltip.meeting) && ` – ${endIso(tooltip.meeting)}`}
          </p>
          {tooltip.meeting.location && (
            <p className="truncate text-slate-400">{tooltip.meeting.location}</p>
          )}
        </div>
      )}

      {meetings.length > 0 && (
        <div className="mt-3 space-y-1">
          {meetings.slice(0, 5).map((m) => (
            <Link
              key={m.meetingId}
              href={`/meetings/${m.meetingId}`}
              className="group flex items-start gap-2 rounded px-1 py-1 hover:bg-slate-50"
            >
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
              <span className="line-clamp-2 text-xs leading-snug text-slate-700 group-hover:text-blue-700">
                {startIso(m)} · {committeeLabel(m)} · {m.title}
              </span>
            </Link>
          ))}
          {meetings.length > 5 && (
            <Link href="/calendar" className="block px-1 text-xs text-blue-600 hover:underline">
              {t('calendar.viewAll', { count: meetings.length })}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
