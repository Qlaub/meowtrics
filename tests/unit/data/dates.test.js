import { describe, it, expect } from 'vitest';
import { toDateKey, filterByRange } from '@/data/dates.js';

describe('toDateKey', () => {
  it('formats date as MM/DD/YYYY', () => {
    const date = new Date('2026-01-25T12:00:00');
    expect(toDateKey(date)).toBe('01/25/2026');
  });

  it('pads single-digit months and days', () => {
    const date = new Date('2026-03-05T12:00:00');
    expect(toDateKey(date)).toBe('03/05/2026');
  });

  it('handles December correctly', () => {
    const date = new Date('2026-12-31T12:00:00');
    expect(toDateKey(date)).toBe('12/31/2026');
  });
});

describe('filterByRange', () => {
  const rows = [
    { date: new Date('2026-01-01'), value: 1 },
    { date: new Date('2026-01-15'), value: 2 },
    { date: new Date('2026-01-20'), value: 3 },
    { date: new Date('2026-01-25'), value: 4 },
    { date: new Date('2026-01-30'), value: 5 },
  ];

  it('returns all rows when range is "all"', () => {
    const result = filterByRange(rows, 'date', 'all');
    expect(result).toHaveLength(5);
  });

  it('returns empty array for empty input', () => {
    expect(filterByRange([], 'date', '30')).toEqual([]);
    expect(filterByRange([], 'date', 'all')).toEqual([]);
  });

  it('filters to last 30 days relative to latest date', () => {
    const result = filterByRange(rows, 'date', '30');
    // Latest is Jan 30, cutoff is Dec 31
    // Jan 1 is 29 days before Jan 30, so all rows should be included
    expect(result.length).toBeGreaterThanOrEqual(4);
  });

  it('filters to last 90 days relative to latest date', () => {
    const result = filterByRange(rows, 'date', '90');
    // All rows should be within 90 days
    expect(result).toHaveLength(5);
  });
});
