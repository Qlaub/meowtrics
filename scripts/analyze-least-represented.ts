import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface CsvRow {
  [key: string]: string
}

interface LunchLogRow {
  choice1: string
  choice2: string
  [key: string]: string
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const row: CsvRow = {}
    headers.forEach((h, i) => {
      row[h.trim()] = values[i]?.trim() ?? ''
    })
    return row
  })
}

export function countOffers(rows: LunchLogRow[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const r of rows) {
    for (const field of [r.choice1, r.choice2]) {
      counts.set(field, (counts.get(field) || 0) + 1)
    }
  }
  return counts
}

export function findLeastRepresented(
  offerCounts: Map<string, number>,
  maxPairings: number = 6
): string[] {
  if (offerCounts.size === 0) return []

  const tiers = new Map<number, string[]>()
  for (const [name, count] of offerCounts) {
    if (!tiers.has(count)) tiers.set(count, [])
    tiers.get(count)!.push(name)
  }

  const sortedCounts = [...tiers.keys()].sort((a, b) => a - b)
  const accumulated: string[] = []

  for (const count of sortedCounts) {
    accumulated.push(...tiers.get(count)!)
    const n = accumulated.length
    if ((n * (n - 1)) / 2 >= maxPairings) break
  }

  return accumulated.sort()
}

export function generatePairings(cans: string[], max: number = 6): [string, string][] {
  const sorted = [...cans].sort()
  const pairings: [string, string][] = []

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      pairings.push([sorted[i], sorted[j]])
      if (pairings.length >= max) return pairings
    }
  }

  return pairings
}

interface AnalysisResult {
  'least-represented-couplings': [string, string][]
}

export function analyze(csvText: string): AnalysisResult {
  const rows = parseCsv(csvText) as LunchLogRow[]
  if (rows.length === 0) return { 'least-represented-couplings': [] }

  const counts = countOffers(rows)
  const leastRepresented = findLeastRepresented(counts)
  const pairings = generatePairings(leastRepresented)

  return { 'least-represented-couplings': pairings }
}

function main(): void {
  const csvPath = 'public/data/cummings-lunch-log'
  const outputPath = 'public/data/analysis.json'

  const csvText = readFileSync(csvPath, 'utf-8')
  const result = analyze(csvText)
  writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n')

  console.log(`Wrote ${result['least-represented-couplings'].length} pairings to ${outputPath}`)
}

if (resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
