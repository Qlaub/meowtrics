/**
 * Event Log Types
 * Raw CSV → Normalized
 */

// Raw CSV row (all fields are strings from CSV parsing)
export interface RawEventLogRow {
  timestamp: string
  cat: string
  event_type: string
  description: string
}

// Normalized event log entry (parsed and validated)
export interface NormalizedEventLogEntry {
  timestamp: Date
  dateKey: string
  cat: string
  eventType: string
  description: string
}
