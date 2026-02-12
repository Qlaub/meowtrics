/**
 * Lunch Log Types
 * Raw CSV → Normalized → Aggregated
 */

// Raw CSV row (all fields are strings from CSV parsing)
export interface RawLunchLogRow {
  timestamp: string
  choice1: string
  choice2: string
  winner: string
}

// Normalized lunch log entry (parsed and validated)
export interface NormalizedLunchLogEntry {
  timestamp: Date
  dateKey: string
  choice1: string
  choice2: string
  winner: string
}

// Aggregated can statistics
export interface CanStats {
  name: string
  offered: number
  selected: number
}

// Head-to-head matchup stats
export interface MatchupStats {
  wins: number
  total: number
}

// Head-to-head data structure
export interface HeadToHeadData {
  names: string[]
  matchups: Record<string, Record<string, MatchupStats>>
}
