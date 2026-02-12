import { describe, it, expect } from 'vitest';
import {
  normalizeWeightLog,
  dailyAverages,
  weeklyChanges,
  calculateWeightTrend,
} from '@/data/weightLog';

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

describe('calculateWeightTrend', () => {
  // Helper to create normalized rows (one per day)
  function makeRows(weights) {
    return weights.map((w, i) => ({
      timestamp: new Date(`2026-01-${String(i + 1).padStart(2, '0')}T12:00:00`),
      dateKey: `01/${String(i + 1).padStart(2, '0')}/2026`,
      weightLbs: w,
    }));
  }

  it('returns null for empty input', () => {
    expect(calculateWeightTrend([])).toBeNull();
  });

  it('returns null for single data point', () => {
    const rows = makeRows([15.0]);
    expect(calculateWeightTrend(rows)).toBeNull();
  });

  it('calculates upward trend with >= 14 daily data points', () => {
    // 7 days at 14.0 then 7 days at 16.0
    const rows = makeRows([
      14.0, 14.0, 14.0, 14.0, 14.0, 14.0, 14.0, 16.0, 16.0, 16.0, 16.0, 16.0, 16.0, 16.0,
    ]);

    const result = calculateWeightTrend(rows);

    expect(result.direction).toBe('up');
    expect(result.change).toBe(2.0);
    expect(result.currentAvg).toBe(16.0);
    expect(result.previousAvg).toBe(14.0);
  });

  it('calculates downward trend with >= 14 daily data points', () => {
    // 7 days at 16.0 then 7 days at 14.0
    const rows = makeRows([
      16.0, 16.0, 16.0, 16.0, 16.0, 16.0, 16.0, 14.0, 14.0, 14.0, 14.0, 14.0, 14.0, 14.0,
    ]);

    const result = calculateWeightTrend(rows);

    expect(result.direction).toBe('down');
    expect(result.change).toBe(-2.0);
  });

  it('returns equal direction when averages match', () => {
    const rows = makeRows([
      15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0,
    ]);

    const result = calculateWeightTrend(rows);

    expect(result.direction).toBe('equal');
    expect(result.change).toBe(0);
  });

  it('small dataset (<14 points): uses first 7 and last 7 with overlap', () => {
    // 10 points: first 7 avg = (10+11+12+13+14+15+16)/7 = 13.0
    // last 7 avg = (14+15+16+17+18+19+20)/7 = 17.0 (overlap at indices 3-6)
    // Wait, that's 11 points. Let me use exactly 10.
    const rows10 = makeRows([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    // first 7: [10,11,12,13,14,15,16] avg = 13.0
    // last 7:  [13,14,15,16,17,18,19] avg = 16.0

    const result = calculateWeightTrend(rows10);

    expect(result.direction).toBe('up');
    expect(result.change).toBe(3);
    expect(result.previousAvg).toBe(13);
    expect(result.currentAvg).toBe(16);
  });

  it('small dataset with exactly 7 points results in equal (identical sets)', () => {
    const rows = makeRows([15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0]);

    const result = calculateWeightTrend(rows);

    expect(result.direction).toBe('equal');
    expect(result.change).toBe(0);
  });

  it('rounds change to 2 decimal places', () => {
    // Create a scenario where raw math produces more than 2 decimals
    const rows = makeRows([
      10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.1, 10.2, 10.2, 10.2, 10.2, 10.2, 10.2, 10.2,
    ]);
    // previous 7: [10,10,10,10,10,10,10.1] avg = 10.014285... -> 10.01
    // current 7: [10.2,10.2,10.2,10.2,10.2,10.2,10.2] avg = 10.2
    // change = 10.2 - 10.01 = 0.19

    const result = calculateWeightTrend(rows);

    expect(String(result.change).split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
  });

  it('exactly 14 data points uses normal path with no overlap', () => {
    // First 7 at 12.0, last 7 at 14.0
    const rows = makeRows([
      12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 14.0, 14.0, 14.0, 14.0, 14.0, 14.0, 14.0,
    ]);

    const result = calculateWeightTrend(rows);

    expect(result.direction).toBe('up');
    expect(result.change).toBe(2.0);
    expect(result.previousAvg).toBe(12.0);
    expect(result.currentAvg).toBe(14.0);
  });

  it('handles 2 data points (minimum for a trend, full overlap)', () => {
    const rows = makeRows([14.0, 16.0]);

    const result = calculateWeightTrend(rows);

    // With 2 points, both current and previous are the same set (full overlap)
    expect(result).not.toBeNull();
    expect(result.direction).toBe('equal');
    expect(result.change).toBe(0);
  });
});
