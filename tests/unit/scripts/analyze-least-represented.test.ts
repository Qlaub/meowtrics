import { describe, it, expect } from 'vitest'
import {
  parseCsv,
  countOffers,
  findLeastRepresented,
  generatePairings,
  analyze,
} from '../../../scripts/analyze-least-represented.js'

describe('parseCsv', () => {
  it('parses valid lunch log CSV into row objects', () => {
    const csv = `timestamp,choice1,choice2,winner
2026-01-25T21:40:53-05:00,Food A,Food B,Food A
2026-01-26T12:00:00-05:00,Food C,Food D,Food D`

    const result = parseCsv(csv)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      timestamp: '2026-01-25T21:40:53-05:00',
      choice1: 'Food A',
      choice2: 'Food B',
      winner: 'Food A',
    })
    expect(result[1]).toEqual({
      timestamp: '2026-01-26T12:00:00-05:00',
      choice1: 'Food C',
      choice2: 'Food D',
      winner: 'Food D',
    })
  })

  it('returns empty array for empty or header-only input', () => {
    expect(parseCsv('')).toEqual([])
    expect(parseCsv('timestamp,choice1,choice2,winner')).toEqual([])
  })

  it('trims whitespace from headers and values', () => {
    const csv = `  choice1  ,  choice2  ,  winner
  Food A  ,  Food B  ,  Food A  `

    const result = parseCsv(csv)

    expect(result[0]).toEqual({
      choice1: 'Food A',
      choice2: 'Food B',
      winner: 'Food A',
    })
  })
})

describe('countOffers', () => {
  it('counts each can appearance in choice1 and choice2', () => {
    const rows = [
      { choice1: 'A', choice2: 'B', winner: 'A' },
      { choice1: 'A', choice2: 'C', winner: 'C' },
      { choice1: 'B', choice2: 'C', winner: 'B' },
    ]

    const counts = countOffers(rows)

    expect(counts.get('A')).toBe(2)
    expect(counts.get('B')).toBe(2)
    expect(counts.get('C')).toBe(2)
  })

  it('returns empty Map for empty input', () => {
    const counts = countOffers([])
    expect(counts.size).toBe(0)
  })

  it('counts a can appearing in both choice1 and choice2 in the same row', () => {
    const rows = [{ choice1: 'A', choice2: 'A', winner: 'A' }]

    const counts = countOffers(rows)

    expect(counts.get('A')).toBe(2)
  })

  it('counts correctly with uneven offer distributions', () => {
    const rows = [
      { choice1: 'A', choice2: 'B', winner: 'A' },
      { choice1: 'A', choice2: 'B', winner: 'B' },
      { choice1: 'A', choice2: 'C', winner: 'A' },
    ]

    const counts = countOffers(rows)

    expect(counts.get('A')).toBe(3)
    expect(counts.get('B')).toBe(2)
    expect(counts.get('C')).toBe(1)
  })
})

describe('findLeastRepresented', () => {
  it('returns cans from lowest tiers sufficient for requested pairings', () => {
    const counts = new Map([
      ['A', 1],
      ['B', 3],
      ['C', 3],
      ['D', 3],
      ['E', 7],
      ['F', 9],
    ])

    const result = findLeastRepresented(counts)

    // Tier 1 (count=1): [A] -> C(1,2)=0, not enough
    // Tier 1+2 (count<=3): [A,B,C,D] -> C(4,2)=6, sufficient
    expect(result).toHaveLength(4)
    expect(result).toContain('A')
    expect(result).toContain('B')
    expect(result).toContain('C')
    expect(result).toContain('D')
    expect(result).not.toContain('E')
    expect(result).not.toContain('F')
  })

  it('returns all cans when all have the same offer count', () => {
    const counts = new Map([
      ['A', 5],
      ['B', 5],
      ['C', 5],
    ])

    const result = findLeastRepresented(counts)

    // All tied at 5, only 3 cans -> C(3,2)=3, can't reach 6 but that's all we have
    expect(result).toEqual(['A', 'B', 'C'])
  })

  it('returns both cans when only 2 exist', () => {
    const counts = new Map([
      ['A', 1],
      ['B', 10],
    ])

    const result = findLeastRepresented(counts)

    expect(result).toEqual(['A', 'B'])
  })

  it('returns single can when only 1 exists', () => {
    const counts = new Map([['A', 5]])

    const result = findLeastRepresented(counts)

    expect(result).toEqual(['A'])
  })

  it('returns empty array for empty input', () => {
    const result = findLeastRepresented(new Map())
    expect(result).toEqual([])
  })

  it('returns cans sorted alphabetically', () => {
    const counts = new Map([
      ['Zebra', 1],
      ['Apple', 1],
      ['Mango', 1],
      ['Banana', 1],
    ])

    const result = findLeastRepresented(counts)

    expect(result).toEqual(['Apple', 'Banana', 'Mango', 'Zebra'])
  })
})

describe('generatePairings', () => {
  it('generates all C(n,2) pairings when n is small', () => {
    const result = generatePairings(['A', 'B', 'C', 'D'])

    // C(4,2) = 6
    expect(result).toHaveLength(6)
    expect(result).toContainEqual(['A', 'B'])
    expect(result).toContainEqual(['A', 'C'])
    expect(result).toContainEqual(['A', 'D'])
    expect(result).toContainEqual(['B', 'C'])
    expect(result).toContainEqual(['B', 'D'])
    expect(result).toContainEqual(['C', 'D'])
  })

  it('caps output at max pairings', () => {
    const result = generatePairings(['A', 'B', 'C', 'D', 'E'])

    // C(5,2) = 10, but max is 6
    expect(result).toHaveLength(6)
  })

  it('sorts each pairing alphabetically', () => {
    const result = generatePairings(['Z', 'A'])

    expect(result).toEqual([['A', 'Z']])
  })

  it('contains no duplicate pairings', () => {
    const result = generatePairings(['A', 'B', 'C', 'D', 'E'])

    const serialized = result.map((p) => p.join(','))
    const unique = new Set(serialized)
    expect(unique.size).toBe(serialized.length)
  })

  it('returns empty array for 0 or 1 cans', () => {
    expect(generatePairings([])).toEqual([])
    expect(generatePairings(['A'])).toEqual([])
  })

  it('returns 1 pairing for 2 cans', () => {
    const result = generatePairings(['X', 'Y'])

    expect(result).toEqual([['X', 'Y']])
  })
})

describe('analyze', () => {
  it('returns correct JSON structure from sample CSV', () => {
    const csv = `timestamp,choice1,choice2,winner
2026-01-25T00:00:00,A,B,A
2026-01-26T00:00:00,A,C,C
2026-01-27T00:00:00,B,C,B
2026-01-28T00:00:00,A,D,A
2026-01-29T00:00:00,B,D,D`

    // Offers: A=3, B=3, C=2, D=2
    // Least-represented tiers: tier 1 (count=2): [C,D] -> C(2,2)=1, not enough
    // tier 1+2 (count<=3): [A,B,C,D] -> C(4,2)=6, sufficient
    const result = analyze(csv)

    expect(result).toHaveProperty('least-represented-couplings')
    expect(result['least-represented-couplings']).toBeInstanceOf(Array)
    expect(result['least-represented-couplings'].length).toBeGreaterThan(0)
    expect(result['least-represented-couplings'].length).toBeLessThanOrEqual(6)

    // Each pairing should be an array of exactly 2 strings
    for (const pairing of result['least-represented-couplings']) {
      expect(pairing).toHaveLength(2)
      expect(typeof pairing[0]).toBe('string')
      expect(typeof pairing[1]).toBe('string')
    }
  })

  it('uses exact can names from input', () => {
    const csv = `timestamp,choice1,choice2,winner
2026-01-25T00:00:00,Pate - Chicken,Pate - Beef,Pate - Chicken
2026-01-26T00:00:00,Pate - Chicken,Gravy - Salmon,Gravy - Salmon`

    // Offers: Pate - Chicken=2, Pate - Beef=1, Gravy - Salmon=1
    const result = analyze(csv)
    const allNames = result['least-represented-couplings'].flat()

    for (const name of allNames) {
      expect(['Pate - Chicken', 'Pate - Beef', 'Gravy - Salmon']).toContain(name)
    }
  })

  it('returns empty couplings for empty CSV', () => {
    const result = analyze('')
    expect(result['least-represented-couplings']).toEqual([])
  })

  it('returns empty couplings for single-row CSV with one unique can pair', () => {
    const csv = `timestamp,choice1,choice2,winner
2026-01-25T00:00:00,A,B,A`

    const result = analyze(csv)

    // 2 cans -> 1 pairing
    expect(result['least-represented-couplings']).toEqual([['A', 'B']])
  })
})
