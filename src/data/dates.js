export function toDateKey(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const y = date.getFullYear()
  return `${m}/${d}/${y}`
}

export function filterByRange(rows, dateField, range) {
  if (range === 'all') return rows
  if (rows.length === 0) return rows

  const latest = rows.reduce(
    (max, r) => (r[dateField] > max ? r[dateField] : max),
    rows[0][dateField],
  )
  const days = range === '30' ? 30 : 90
  const cutoff = new Date(latest)
  cutoff.setDate(cutoff.getDate() - days)

  return rows.filter((r) => r[dateField] >= cutoff)
}
