/**
 * Unit tests for date/time formatting utilities (L1 — Jest + RTL).
 * Ref: ISEP-TESTING-CONTEXT.md Layer 1; Test Cases TC-04.
 */
import { formatDisplayDate, formatDateTime } from '@/lib/format';

describe('formatDisplayDate', () => {
  it('returns DD-MMM-YYYY for valid ISO date', () => {
    expect(formatDisplayDate('2024-01-23')).toBe('23-Jan-2024');
    expect(formatDisplayDate('2026-03-04')).toBe('4-Mar-2026');
  });

  it('returns "—" for null, undefined, or empty string', () => {
    expect(formatDisplayDate(null)).toBe('—');
    expect(formatDisplayDate(undefined)).toBe('—');
    expect(formatDisplayDate('')).toBe('—');
  });

  it('returns original string for invalid date', () => {
    expect(formatDisplayDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatDateTime', () => {
  it('returns formatted date and time for valid ISO date-time', () => {
    expect(formatDateTime('2026-03-04T10:53:00Z')).toMatch(/4-Mar-2026/);
    expect(formatDateTime('2026-03-04T10:53:00Z')).toMatch(/\d{2}:\d{2}/);
  });

  it('returns "—" for null, undefined, or empty string', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDateTime('')).toBe('—');
  });
});
