/**
 * Common utility types used across the application
 */

// Date key format: YYYY-MM-DD
export type DateKey = string

// Result type for operations that can fail
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E }

// CSV row is a generic record of string fields
export type CsvRow = Record<string, string>
