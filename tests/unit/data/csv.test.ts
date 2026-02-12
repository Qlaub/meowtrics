import { describe, it, expect } from 'vitest';
import { parseCsv } from '@/data/csv';

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

  it('ignores extra columns beyond headers', () => {
    const csv = `a,b
1,2,3,4`;

    const result = parseCsv(csv);

    expect(result[0]).toEqual({ a: '1', b: '2' });
  });

  it('parses single-column CSV', () => {
    const csv = `name
Alice
Bob`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'Alice' });
    expect(result[1]).toEqual({ name: 'Bob' });
  });

  it('preserves unicode and special characters', () => {
    const csv = `name,food
Señor,Pâté
Kitty,Tuna 🐟`;

    const result = parseCsv(csv);

    expect(result[0]).toEqual({ name: 'Señor', food: 'Pâté' });
    expect(result[1]).toEqual({ name: 'Kitty', food: 'Tuna 🐟' });
  });

  it('handles rows with only empty values', () => {
    const csv = `a,b,c
,,`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ a: '', b: '', c: '' });
  });
});
