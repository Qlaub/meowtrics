import { toDateKey } from './dates.js'

export function normalizeWeightLog(rows) {
  return rows.map((r) => ({
    timestamp: new Date(r.timestamp),
    dateKey: toDateKey(new Date(r.timestamp)),
    weightLbs: parseFloat(r['weight-lbs']),
  }))
}

export function dailyAverages(rows) {
  const byDate = {}
  for (const r of rows) {
    const key = r.dateKey
    if (!byDate[key]) byDate[key] = { date: new Date(r.timestamp), dateKey: key, values: [] }
    byDate[key].values.push(r.weightLbs)
  }

  return Object.values(byDate)
    .map((g) => ({
      date: g.date,
      dateKey: g.dateKey,
      avgWeightLbs: +(g.values.reduce((a, b) => a + b, 0) / g.values.length).toFixed(2),
    }))
    .sort((a, b) => a.date - b.date)
}

export function weeklyChanges(dailyAvgs) {
  if (dailyAvgs.length === 0) return []

  const weeks = {}
  for (const d of dailyAvgs) {
    const sunday = new Date(d.date)
    sunday.setDate(sunday.getDate() - sunday.getDay())
    const key = toDateKey(sunday)
    if (!weeks[key]) weeks[key] = { weekStart: sunday, dateKey: key, values: [] }
    weeks[key].values.push(d.avgWeightLbs)
  }

  const sorted = Object.values(weeks).sort((a, b) => a.weekStart - b.weekStart)
  const result = []
  for (let i = 1; i < sorted.length; i++) {
    const prevAvg = sorted[i - 1].values.reduce((a, b) => a + b, 0) / sorted[i - 1].values.length
    const currAvg = sorted[i].values.reduce((a, b) => a + b, 0) / sorted[i].values.length
    result.push({
      dateKey: sorted[i].dateKey,
      weekStart: sorted[i].weekStart,
      change: +(currAvg - prevAvg).toFixed(2),
    })
  }
  return result
}

export function calculateWeightTrend(normalizedRows) {
  const dailyAvgs = dailyAverages(normalizedRows)
  if (dailyAvgs.length <= 1) return null

  let currentWeek, previousWeek
  if (dailyAvgs.length >= 14) {
    currentWeek = dailyAvgs.slice(-7)
    previousWeek = dailyAvgs.slice(-14, -7)
  } else {
    const take = Math.min(7, dailyAvgs.length)
    currentWeek = dailyAvgs.slice(-take)
    previousWeek = dailyAvgs.slice(0, take)
  }

  const avg = (arr) => arr.reduce((sum, d) => sum + d.avgWeightLbs, 0) / arr.length
  const currentAvg = +avg(currentWeek).toFixed(2)
  const previousAvg = +avg(previousWeek).toFixed(2)
  const change = +(currentAvg - previousAvg).toFixed(2)
  const direction = change < 0 ? 'down' : change > 0 ? 'up' : 'equal'

  return { currentAvg, previousAvg, change, direction }
}
