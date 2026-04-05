/**
 * ISEP Date/Time Formatting Utilities
 * -----------------------------------
 * Consistent display format for dates and date-times across the app (e.g. meeting dates, deadlines).
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Format ISO date string (YYYY-MM-DD) as DD-MMM-YYYY e.g. 23-Jan-2024. Returns "—" if null/undefined/invalid. */
export function formatDisplayDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—';
  const d = new Date(isoDate + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/** Format ISO date-time string as DD-MMM-YYYY, HH:MM (e.g. 04-Mar-2026, 10:53). Returns "—" if null/undefined/invalid. */
export function formatDateTime(isoDateTime: string | null | undefined): string {
  if (!isoDateTime) return '—';
  const d = new Date(isoDateTime);
  if (Number.isNaN(d.getTime())) return isoDateTime;
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const h = d.getHours();
  const m = d.getMinutes();
  return `${day}-${month}-${year}, ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
