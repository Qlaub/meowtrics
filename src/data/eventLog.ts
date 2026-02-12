import { toDateKey } from './dates'
import type { CsvRow, NormalizedEventLogEntry } from '@/types'

export function normalizeEventLog(rows: CsvRow[]): NormalizedEventLogEntry[] {
  return rows.map((r) => {
    const timestamp = r.timestamp ?? ''
    const timestampDate = new Date(timestamp)
    return {
      timestamp: timestampDate,
      dateKey: toDateKey(timestampDate),
      cat: r.cat ?? '',
      eventType: r.event_type ?? '',
      description: r.description ?? '',
    }
  })
}
