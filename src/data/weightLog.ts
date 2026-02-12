import { toDateKey } from './dates'
import type { CsvRow, NormalizedWeightLogEntry, DailyWeightAverage, WeeklyWeightChange } from '@/types'

export function normalizeWeightLog(rows: CsvRow[]): NormalizedWeightLogEntry[] {
  return rows.map((r) => {
    const timestamp = r.timestamp ?? ''
    const timestampDate = new Date(timestamp)
    const weightStr = r['weight-lbs'] ?? '0'
    return {
      timestamp: timestampDate,
      dateKey: toDateKey(timestampDate),
      weightLbs: parseFloat(weightStr),
    }
  })
}

export function dailyAverages(rows: NormalizedWeightLogEntry[]): DailyWeightAverage[] {
  const byDate: Record<string, { date: Date; dateKey: string; values: number[] }> = {}
  for (const r of rows) {
    const key = r.dateKey
    if (!byDate[key]) byDate[key] = { date: new Date(r.timestamp), dateKey: key, values: [] }
    const entry = byDate[key]
    if (entry) entry.values.push(r.weightLbs)
  }

  return Object.values(byDate)
    .map((g) => ({
      date: g.date,
      dateKey: g.dateKey,
      avgWeightLbs: +(g.values.reduce((a, b) => a + b, 0) / g.values.length).toFixed(2),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function weeklyChanges(dailyAvgs: DailyWeightAverage[]): WeeklyWeightChange[] {
  if (dailyAvgs.length === 0) return []

  const weeks: Record<string, { weekStart: Date; dateKey: string; values: number[] }> = {}
  for (const d of dailyAvgs) {
    const sunday = new Date(d.date)
    sunday.setDate(sunday.getDate() - sunday.getDay())
    const key = toDateKey(sunday)
    if (!weeks[key]) weeks[key] = { weekStart: sunday, dateKey: key, values: [] }
    const weekEntry = weeks[key]
    if (weekEntry) weekEntry.values.push(d.avgWeightLbs)
  }

  const sorted = Object.values(weeks).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
  const result: WeeklyWeightChange[] = []
  for (let i = 1; i < sorted.length; i++) {
    const prevWeek = sorted[i - 1]
    const currWeek = sorted[i]
    if (prevWeek && currWeek) {
      const prevAvg = prevWeek.values.reduce((a, b) => a + b, 0) / prevWeek.values.length
      const currAvg = currWeek.values.reduce((a, b) => a + b, 0) / currWeek.values.length
      result.push({
        dateKey: currWeek.dateKey,
        weekStart: currWeek.weekStart,
        change: +(currAvg - prevAvg).toFixed(2),
      })
    }
  }
  return result
}

export interface WeightTrend {
  currentAvg: number
  previousAvg: number
  change: number
  direction: 'up' | 'down' | 'equal'
}

export function calculateWeightTrend(normalizedRows: NormalizedWeightLogEntry[]): WeightTrend | null {
  const dailyAvgs = dailyAverages(normalizedRows)
  if (dailyAvgs.length <= 1) return null

  let currentWeek: DailyWeightAverage[], previousWeek: DailyWeightAverage[]
  if (dailyAvgs.length >= 14) {
    currentWeek = dailyAvgs.slice(-7)
    previousWeek = dailyAvgs.slice(-14, -7)
  } else {
    const take = Math.min(7, dailyAvgs.length)
    currentWeek = dailyAvgs.slice(-take)
    previousWeek = dailyAvgs.slice(0, take)
  }

  const avg = (arr: DailyWeightAverage[]) => arr.reduce((sum, d) => sum + d.avgWeightLbs, 0) / arr.length
  const currentAvg = +avg(currentWeek).toFixed(2)
  const previousAvg = +avg(previousWeek).toFixed(2)
  const change = +(currentAvg - previousAvg).toFixed(2)
  const direction = change < 0 ? 'down' : change > 0 ? 'up' : 'equal'

  return { currentAvg, previousAvg, change, direction }
}
