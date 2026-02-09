import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function parseCsv(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const row = {}
    headers.forEach((h, i) => {
      row[h.trim()] = values[i]?.trim() ?? ''
    })
    return row
  })
}

export function countOffers(rows) {
  const counts = new Map()
  for (const r of rows) {
    for (const field of [r.choice1, r.choice2]) {
      counts.set(field, (counts.get(field) || 0) + 1)
    }
  }
  return counts
}

export function findLeastRepresented(offerCounts, maxPairings = 6) {
  if (offerCounts.size === 0) return []

  const tiers = new Map()
  for (const [name, count] of offerCounts) {
    if (!tiers.has(count)) tiers.set(count, [])
    tiers.get(count).push(name)
  }

  const sortedCounts = [...tiers.keys()].sort((a, b) => a - b)
  const accumulated = []

  for (const count of sortedCounts) {
    accumulated.push(...tiers.get(count))
    const n = accumulated.length
    if ((n * (n - 1)) / 2 >= maxPairings) break
  }

  return accumulated.sort()
}

export function generatePairings(cans, max = 6) {
  const sorted = [...cans].sort()
  const pairings = []

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      pairings.push([sorted[i], sorted[j]])
      if (pairings.length >= max) return pairings
    }
  }

  return pairings
}

export function analyze(csvText) {
  const rows = parseCsv(csvText)
  if (rows.length === 0) return { 'least-represented-couplings': [] }

  const counts = countOffers(rows)
  const leastRepresented = findLeastRepresented(counts)
  const pairings = generatePairings(leastRepresented)

  return { 'least-represented-couplings': pairings }
}

function main() {
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
