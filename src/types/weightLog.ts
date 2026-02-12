/**
 * Weight Log Types
 * Raw CSV → Normalized → Aggregated
 */

// Raw CSV row (all fields are strings from CSV parsing)
export interface RawWeightLogRow {
  timestamp: string
  'weight-lbs': string
}

// Normalized weight log entry (parsed and validated)
export interface NormalizedWeightLogEntry {
  timestamp: Date
  dateKey: string
  weightLbs: number
}

// Daily average weight
export interface DailyWeightAverage {
  date: Date
  dateKey: string
  avgWeightLbs: number
}

// Weekly weight change
export interface WeeklyWeightChange {
  dateKey: string
  weekStart: Date
  change: number
}
