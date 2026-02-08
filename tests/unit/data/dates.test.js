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

  it('handles year boundary (Jan 1)', () => {
    const date = new Date('2026-01-01T00:00:00');
    expect(toDateKey(date)).toBe('01/01/2026');
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

  it('includes a single row regardless of range', () => {
    const singleRow = [{ date: new Date('2026-01-15'), value: 1 }];
    const result = filterByRange(singleRow, 'date', '30');
    expect(result).toHaveLength(1);
  });

  it('returns empty when all data is outside the range', () => {
    const oldRows = [
      { date: new Date('2025-01-01'), value: 1 },
      { date: new Date('2025-01-02'), value: 2 },
      { date: new Date('2025-01-03'), value: 3 },
    ];
    // Latest is Jan 3 2025, cutoff is Dec 4 2024 for 30-day range
    // All rows are within 3 days of each other, so all should be included
    const result30 = filterByRange(oldRows, 'date', '30');
    expect(result30).toHaveLength(3);

    // But rows far from the latest should be excluded
    const spreadRows = [
      { date: new Date('2025-06-01'), value: 1 },
      { date: new Date('2025-12-01'), value: 2 },
    ];
    // Latest is Dec 1, cutoff for 30 days is Nov 1
    // Jun 1 is outside the 30-day window
    const result = filterByRange(spreadRows, 'date', '30');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(2);
  });

  it('defaults to 90 days for unrecognized range values', () => {
    // The ternary in filterByRange: days = range === '30' ? 30 : 90
    // Any unrecognized value falls through to 90
    const spreadRows = [
      { date: new Date('2025-09-01'), value: 1 },
      { date: new Date('2025-12-01'), value: 2 },
    ];
    // Latest is Dec 1, 90-day cutoff is Sep 2
    // Sep 1 is just outside the 90-day window
    const result = filterByRange(spreadRows, 'date', 'unknown');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(2);
  });
});
