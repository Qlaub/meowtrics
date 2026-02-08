import { describe, it, expect } from 'vitest';
import { normalizeWeightLog, dailyAverages, weeklyChanges } from '@/data/weightLog.js';

describe('normalizeWeightLog', () => {
  it('converts raw rows to normalized format', () => {
    const rows = [{ timestamp: '2026-01-25T12:00:00-05:00', 'weight-lbs': '15.2' }];

    const result = normalizeWeightLog(rows);

    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBeInstanceOf(Date);
    expect(result[0].dateKey).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(result[0].weightLbs).toBe(15.2);
  });

  it('parses weight as float', () => {
    const rows = [{ timestamp: '2026-01-25T12:00:00', 'weight-lbs': '14.75' }];

    const result = normalizeWeightLog(rows);

    expect(result[0].weightLbs).toBe(14.75);
  });

  it('produces NaN for non-numeric weight strings', () => {
    const rows = [{ timestamp: '2026-01-25T12:00:00', 'weight-lbs': 'abc' }];

    const result = normalizeWeightLog(rows);

    expect(result[0].weightLbs).toBeNaN();
  });

  it('preserves negative weight values', () => {
    const rows = [{ timestamp: '2026-01-25T12:00:00', 'weight-lbs': '-5.0' }];

    const result = normalizeWeightLog(rows);

    expect(result[0].weightLbs).toBe(-5.0);
  });

  it('handles very large weight values', () => {
    const rows = [{ timestamp: '2026-01-25T12:00:00', 'weight-lbs': '99999.99' }];

    const result = normalizeWeightLog(rows);

    expect(result[0].weightLbs).toBe(99999.99);
  });
});

describe('dailyAverages', () => {
  it('averages multiple weights on the same day', () => {
    const rows = [
      { timestamp: new Date('2026-01-25T08:00:00'), dateKey: '01/25/2026', weightLbs: 15.0 },
      { timestamp: new Date('2026-01-25T20:00:00'), dateKey: '01/25/2026', weightLbs: 15.4 },
    ];

    const result = dailyAverages(rows);

    expect(result).toHaveLength(1);
    expect(result[0].avgWeightLbs).toBe(15.2);
  });

  it('sorts results by date ascending', () => {
    const rows = [
      { timestamp: new Date('2026-01-27T12:00:00'), dateKey: '01/27/2026', weightLbs: 15.0 },
      { timestamp: new Date('2026-01-25T12:00:00'), dateKey: '01/25/2026', weightLbs: 14.0 },
      { timestamp: new Date('2026-01-26T12:00:00'), dateKey: '01/26/2026', weightLbs: 14.5 },
    ];

    const result = dailyAverages(rows);

    expect(result[0].dateKey).toBe('01/25/2026');
    expect(result[1].dateKey).toBe('01/26/2026');
    expect(result[2].dateKey).toBe('01/27/2026');
  });

  it('returns empty array for empty input', () => {
    expect(dailyAverages([])).toEqual([]);
  });

  it('returns single entry for single data point', () => {
    const rows = [
      { timestamp: new Date('2026-01-25T12:00:00'), dateKey: '01/25/2026', weightLbs: 14.5 },
    ];

    const result = dailyAverages(rows);

    expect(result).toHaveLength(1);
    expect(result[0].avgWeightLbs).toBe(14.5);
    expect(result[0].dateKey).toBe('01/25/2026');
  });
});

describe('weeklyChanges', () => {
  it('returns empty array for empty input', () => {
    expect(weeklyChanges([])).toEqual([]);
  });

  it('calculates week-over-week change', () => {
    // Week 1 (starting Sunday Jan 19): avg 14.0
    // Week 2 (starting Sunday Jan 26): avg 15.0
    const dailyAvgs = [
      { date: new Date('2026-01-20'), dateKey: '01/20/2026', avgWeightLbs: 14.0 },
      { date: new Date('2026-01-21'), dateKey: '01/21/2026', avgWeightLbs: 14.0 },
      { date: new Date('2026-01-27'), dateKey: '01/27/2026', avgWeightLbs: 15.0 },
      { date: new Date('2026-01-28'), dateKey: '01/28/2026', avgWeightLbs: 15.0 },
    ];

    const result = weeklyChanges(dailyAvgs);

    expect(result).toHaveLength(1);
    expect(result[0].change).toBe(1.0);
  });

  it('returns empty when only one week of data', () => {
    const dailyAvgs = [
      { date: new Date('2026-01-20'), dateKey: '01/20/2026', avgWeightLbs: 14.0 },
      { date: new Date('2026-01-21'), dateKey: '01/21/2026', avgWeightLbs: 14.5 },
    ];

    const result = weeklyChanges(dailyAvgs);

    expect(result).toEqual([]);
  });

  it('calculates negative week-over-week change', () => {
    const dailyAvgs = [
      { date: new Date('2026-01-20'), dateKey: '01/20/2026', avgWeightLbs: 16.0 },
      { date: new Date('2026-01-27'), dateKey: '01/27/2026', avgWeightLbs: 14.5 },
    ];

    const result = weeklyChanges(dailyAvgs);

    expect(result).toHaveLength(1);
    expect(result[0].change).toBe(-1.5);
  });
});
