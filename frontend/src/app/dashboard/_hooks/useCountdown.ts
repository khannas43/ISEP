import { useState, useEffect } from 'react';

export interface CountdownParts {
  /** Whole days remaining (unpadded; e.g. "5" or "289") */
  days: string;
  /** Hours within the current day, 00–23 */
  hours: string;
  /** Minutes within the current hour, 00–59 */
  minutes: string;
  /** True when start time is at or before now */
  isPastOrNow: boolean;
}

const MS_PER_SEC = 1000;
const SEC_PER_DAY = 86_400;
const SEC_PER_HOUR = 3600;
const SEC_PER_MIN = 60;

/**
 * Backend sends `LocalDate` as `YYYY-MM-DD`. `new Date('YYYY-MM-DD')` is UTC midnight and
 * shifts the countdown by the user's offset. Use start of that **calendar day in local time**.
 * Full ISO strings (with time or `Z`) are parsed with the native Date parser.
 */
export function parseMeetingStartInstant(value: string | null | undefined): Date | null {
  if (value == null || value === '') return null;
  const s = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (dateOnly) {
    const y = Number(dateOnly[1]);
    const m = Number(dateOnly[2]) - 1;
    const d = Number(dateOnly[3]);
    if (!Number.isFinite(y) || m < 0 || m > 11 || d < 1 || d > 31) return null;
    const local = new Date(y, m, d, 0, 0, 0, 0);
    if (Number.isNaN(local.getTime())) return null;
    return local;
  }
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function computeCountdown(targetIso: string | null): CountdownParts {
  if (!targetIso) {
    return { days: '--', hours: '--', minutes: '--', isPastOrNow: false };
  }

  const target = parseMeetingStartInstant(targetIso);
  if (!target) {
    return { days: '--', hours: '--', minutes: '--', isPastOrNow: false };
  }

  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) {
    return { days: '0', hours: '00', minutes: '00', isPastOrNow: true };
  }

  let totalSec = Math.floor(diffMs / MS_PER_SEC);
  const d = Math.floor(totalSec / SEC_PER_DAY);
  totalSec %= SEC_PER_DAY;
  const h = Math.floor(totalSec / SEC_PER_HOUR);
  totalSec %= SEC_PER_HOUR;
  const min = Math.floor(totalSec / SEC_PER_MIN);

  return {
    days: String(d),
    hours: String(h).padStart(2, '0'),
    minutes: String(min).padStart(2, '0'),
    isPastOrNow: false,
  };
}

/** Live countdown to meeting start; updates every second. */
export function useCountdown(targetIso: string | null): CountdownParts {
  const [cd, setCd] = useState<CountdownParts>(() => computeCountdown(targetIso));

  useEffect(() => {
    setCd(computeCountdown(targetIso));
    const id = setInterval(() => setCd(computeCountdown(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return cd;
}
