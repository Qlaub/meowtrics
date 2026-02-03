import { describe, it, expect } from 'vitest';
import { parseCsv } from '@/data/csv.js';

describe('parseCsv', () => {
  it('parses CSV text into array of row objects', () => {
    const csv = `timestamp,choice1,choice2,winner
2026-01-25T21:40:53-05:00,Food A,Food B,Food A
2026-01-26T12:00:00-05:00,Food C,Food D,Food D`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      timestamp: '2026-01-25T21:40:53-05:00',
      choice1: 'Food A',
      choice2: 'Food B',
      winner: 'Food A',
    });
    expect(result[1]).toEqual({
      timestamp: '2026-01-26T12:00:00-05:00',
      choice1: 'Food C',
      choice2: 'Food D',
      winner: 'Food D',
    });
  });

  it('returns empty array for empty or header-only CSV', () => {
    expect(parseCsv('')).toEqual([]);
    expect(parseCsv('timestamp,choice1,choice2,winner')).toEqual([]);
  });

  it('trims whitespace from headers and values', () => {
    const csv = `  name  ,  value
  Alice  ,  100  `;

    const result = parseCsv(csv);

    expect(result[0]).toEqual({ name: 'Alice', value: '100' });
  });

  it('handles missing values gracefully', () => {
    const csv = `a,b,c
1,2
3,4,5`;

    const result = parseCsv(csv);

    expect(result[0]).toEqual({ a: '1', b: '2', c: '' });
    expect(result[1]).toEqual({ a: '3', b: '4', c: '5' });
  });
});
