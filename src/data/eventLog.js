import { toDateKey } from './dates.js'

export function normalizeEventLog(rows) {
  return rows.map((r) => ({
    timestamp: new Date(r.timestamp),
    dateKey: toDateKey(new Date(r.timestamp)),
    cat: r.cat,
    eventType: r.event_type,
    description: r.description,
  }))
}
