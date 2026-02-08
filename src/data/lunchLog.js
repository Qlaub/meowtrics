import { toDateKey } from './dates.js'

export function normalizeLunchLog(rows) {
  return rows.map((r) => ({
    timestamp: new Date(r.timestamp),
    dateKey: toDateKey(new Date(r.timestamp)),
    choice1: r.choice1,
    choice2: r.choice2,
    winner: r.winner,
  }))
}

export function aggregateLunchLog(rows) {
  const cans = {}

  for (const r of rows) {
    for (const c of [r.choice1, r.choice2]) {
      if (!cans[c]) cans[c] = { name: c, offered: 0, selected: 0 }
      cans[c].offered++
    }
    if (cans[r.winner]) cans[r.winner].selected++
  }

  return Object.values(cans).sort(
    (a, b) => b.offered - a.offered || b.selected - a.selected || a.name.localeCompare(b.name),
  )
}

export function buildHeadToHead(rows) {
  const names = new Set()
  const matchups = {} // matchups[a][b] = { wins: 0, total: 0 }

  for (const r of rows) {
    names.add(r.choice1)
    names.add(r.choice2)

    for (const [a, b] of [
      [r.choice1, r.choice2],
      [r.choice2, r.choice1],
    ]) {
      if (!matchups[a]) matchups[a] = {}
      if (!matchups[a][b]) matchups[a][b] = { wins: 0, total: 0 }
      matchups[a][b].total++
      if (r.winner === a) matchups[a][b].wins++
    }
  }

  const sorted = [...names].sort()
  return { names: sorted, matchups }
}
