import { describe, it, expect } from 'vitest';
import { normalizeLunchLog, aggregateLunchLog, buildHeadToHead } from '@/data/lunchLog.js';

describe('normalizeLunchLog', () => {
  it('converts raw rows to normalized format with Date and dateKey', () => {
    const rows = [
      {
        timestamp: '2026-01-25T21:40:53-05:00',
        choice1: 'Food A',
        choice2: 'Food B',
        winner: 'Food A',
      },
    ];

    const result = normalizeLunchLog(rows);

    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBeInstanceOf(Date);
    expect(result[0].dateKey).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(result[0].choice1).toBe('Food A');
    expect(result[0].choice2).toBe('Food B');
    expect(result[0].winner).toBe('Food A');
  });

  it('preserves empty string fields without crashing', () => {
    const rows = [
      { timestamp: '2026-01-25T12:00:00', choice1: '', choice2: '', winner: '' },
    ];

    const result = normalizeLunchLog(rows);

    expect(result).toHaveLength(1);
    expect(result[0].choice1).toBe('');
    expect(result[0].choice2).toBe('');
    expect(result[0].winner).toBe('');
  });
});

describe('aggregateLunchLog', () => {
  const rows = [
    { choice1: 'Food A', choice2: 'Food B', winner: 'Food A' },
    { choice1: 'Food A', choice2: 'Food B', winner: 'Food B' },
    { choice1: 'Food A', choice2: 'Food C', winner: 'Food A' },
    { choice1: 'Food B', choice2: 'Food C', winner: 'Food C' },
  ];

  it('counts offered and selected for each can', () => {
    const result = aggregateLunchLog(rows);

    const foodA = result.find((c) => c.name === 'Food A');
    const foodB = result.find((c) => c.name === 'Food B');
    const foodC = result.find((c) => c.name === 'Food C');

    expect(foodA.offered).toBe(3);
    expect(foodA.selected).toBe(2);

    expect(foodB.offered).toBe(3);
    expect(foodB.selected).toBe(1);

    expect(foodC.offered).toBe(2);
    expect(foodC.selected).toBe(1);
  });

  it('sorts by offered desc, then selected desc, then name asc', () => {
    const result = aggregateLunchLog(rows);

    // Food A: 3 offered, 2 selected
    // Food B: 3 offered, 1 selected
    // Food C: 2 offered, 1 selected
    expect(result[0].name).toBe('Food A');
    expect(result[1].name).toBe('Food B');
    expect(result[2].name).toBe('Food C');
  });

  it('returns empty array for empty input', () => {
    expect(aggregateLunchLog([])).toEqual([]);
  });

  it('does not crash when winner does not match either choice', () => {
    const rows = [
      { choice1: 'Food A', choice2: 'Food B', winner: 'Food Z' },
    ];

    const result = aggregateLunchLog(rows);

    const foodA = result.find((c) => c.name === 'Food A');
    const foodB = result.find((c) => c.name === 'Food B');

    expect(foodA.offered).toBe(1);
    expect(foodA.selected).toBe(0);
    expect(foodB.offered).toBe(1);
    expect(foodB.selected).toBe(0);
    expect(result.find((c) => c.name === 'Food Z')).toBeUndefined();
  });

  it('accumulates counts correctly with duplicate entries', () => {
    const rows = [
      { choice1: 'Food A', choice2: 'Food B', winner: 'Food A' },
      { choice1: 'Food A', choice2: 'Food B', winner: 'Food A' },
      { choice1: 'Food A', choice2: 'Food B', winner: 'Food A' },
    ];

    const result = aggregateLunchLog(rows);

    const foodA = result.find((c) => c.name === 'Food A');
    expect(foodA.offered).toBe(3);
    expect(foodA.selected).toBe(3);

    const foodB = result.find((c) => c.name === 'Food B');
    expect(foodB.offered).toBe(3);
    expect(foodB.selected).toBe(0);
  });
});

describe('buildHeadToHead', () => {
  const rows = [
    { choice1: 'Food A', choice2: 'Food B', winner: 'Food A' },
    { choice1: 'Food A', choice2: 'Food B', winner: 'Food A' },
    { choice1: 'Food A', choice2: 'Food B', winner: 'Food B' },
  ];

  it('returns sorted list of food names', () => {
    const { names } = buildHeadToHead(rows);
    expect(names).toEqual(['Food A', 'Food B']);
  });

  it('tracks wins and total for each matchup direction', () => {
    const { matchups } = buildHeadToHead(rows);

    // Food A vs Food B: 2 wins out of 3
    expect(matchups['Food A']['Food B'].wins).toBe(2);
    expect(matchups['Food A']['Food B'].total).toBe(3);

    // Food B vs Food A: 1 win out of 3
    expect(matchups['Food B']['Food A'].wins).toBe(1);
    expect(matchups['Food B']['Food A'].total).toBe(3);
  });

  it('handles single matchup', () => {
    const singleRow = [{ choice1: 'X', choice2: 'Y', winner: 'X' }];
    const { names, matchups } = buildHeadToHead(singleRow);

    expect(names).toEqual(['X', 'Y']);
    expect(matchups['X']['Y']).toEqual({ wins: 1, total: 1 });
    expect(matchups['Y']['X']).toEqual({ wins: 0, total: 1 });
  });

  it('returns empty names and matchups for empty input', () => {
    const { names, matchups } = buildHeadToHead([]);

    expect(names).toEqual([]);
    expect(matchups).toEqual({});
  });

  it('tracks all pairs in three-way matchups', () => {
    const rows = [
      { choice1: 'A', choice2: 'B', winner: 'A' },
      { choice1: 'B', choice2: 'C', winner: 'C' },
      { choice1: 'A', choice2: 'C', winner: 'A' },
    ];

    const { names, matchups } = buildHeadToHead(rows);

    expect(names).toEqual(['A', 'B', 'C']);
    expect(matchups['A']['B']).toEqual({ wins: 1, total: 1 });
    expect(matchups['B']['C']).toEqual({ wins: 0, total: 1 });
    expect(matchups['C']['B']).toEqual({ wins: 1, total: 1 });
    expect(matchups['A']['C']).toEqual({ wins: 1, total: 1 });
    expect(matchups['C']['A']).toEqual({ wins: 0, total: 1 });
  });
});
