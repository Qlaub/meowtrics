import type { DateKey } from '@/types'

export function toDateKey(date: Date): DateKey {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const y = date.getFullYear()
  return `${m}/${d}/${y}`
}

export function filterByRange<T extends Record<string, unknown>>(
  rows: T[],
  dateField: keyof T,
  range: 'all' | '30' | '90',
): T[] {
  if (range === 'all') return rows
  if (rows.length === 0) return rows

  const firstRow = rows[0]
  if (!firstRow) return rows

  const latest = rows.reduce(
    (max, r) => (r[dateField] > max ? r[dateField] : max),
    firstRow[dateField],
  )
  const days = range === '30' ? 30 : 90
  const cutoff = new Date(latest as Date)
  cutoff.setDate(cutoff.getDate() - days)

  return rows.filter((r) => r[dateField] >= cutoff)
}
