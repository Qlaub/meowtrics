import { toDateKey } from './dates'
import type {
  CsvRow,
  NormalizedLunchLogEntry,
  CanStats,
  HeadToHeadData,
  MatchupStats,
} from '@/types'

export function normalizeLunchLog(rows: CsvRow[]): NormalizedLunchLogEntry[] {
  return rows.map((r) => {
    const timestamp = r.timestamp ?? ''
    const timestampDate = new Date(timestamp)
    return {
      timestamp: timestampDate,
      dateKey: toDateKey(timestampDate),
      choice1: r.choice1 ?? '',
      choice2: r.choice2 ?? '',
      winner: r.winner ?? '',
    }
  })
}

export function aggregateLunchLog(rows: NormalizedLunchLogEntry[]): CanStats[] {
  const cans: Record<string, CanStats> = {}

  for (const r of rows) {
    for (const c of [r.choice1, r.choice2]) {
      if (!cans[c]) cans[c] = { name: c, offered: 0, selected: 0 }
      const canEntry = cans[c]
      if (canEntry) canEntry.offered++
    }
    const winnerEntry = cans[r.winner]
    if (winnerEntry) winnerEntry.selected++
  }

  return Object.values(cans).sort(
    (a, b) => b.offered - a.offered || b.selected - a.selected || a.name.localeCompare(b.name),
  )
}

export function buildHeadToHead(rows: NormalizedLunchLogEntry[]): HeadToHeadData {
  const names = new Set<string>()
  const matchups: Record<string, Record<string, MatchupStats>> = {} // matchups[a][b] = { wins: 0, total: 0 }

  for (const r of rows) {
    names.add(r.choice1)
    names.add(r.choice2)

    const pairs: Array<[string, string]> = [
      [r.choice1, r.choice2],
      [r.choice2, r.choice1],
    ]
    for (const pair of pairs) {
      const a = pair[0]
      const b = pair[1]
      if (!a || !b) continue

      if (!matchups[a]) matchups[a] = {}
      const aMatchups = matchups[a]
      if (aMatchups) {
        if (!aMatchups[b]) aMatchups[b] = { wins: 0, total: 0 }
        const stats = aMatchups[b]
        if (stats) {
          stats.total++
          if (r.winner === a) stats.wins++
        }
      }
    }
  }

  const sorted = [...names].sort()
  return { names: sorted, matchups }
}
