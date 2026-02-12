# Phase 2 Execution: Define Core Domain Types

**Status**: Ready for Execution
**Date**: 2026-02-11

---

## Objectives

1. Create `src/types/` directory structure
2. Define canonical TypeScript interfaces for all data models
3. Explicitly separate Raw CSV types, Normalized types, and Aggregated types
4. Establish type safety foundation for the data layer
5. **Do NOT modify existing logic yet** - only create type definitions

---

## Execution Steps

### Step 1: Create Type Directory Structure

```bash
mkdir -p src/types
```

- [ ] Create `src/types/` directory
- [ ] Plan type file organization

### Step 2: Create Manifest Types

Create `src/types/manifest.ts`:

```typescript
/**
 * Manifest Types
 * Describes dataset entries in public/data/manifest.json
 */

export type DatasetType = 'lunch_log' | 'weight_log' | 'event_log'

export interface DatasetManifestEntry {
  id: string
  title: string
  file: string
  type: DatasetType
  cat: string
  description?: string
}

export type DatasetManifest = DatasetManifestEntry[]
```

- [ ] Create `src/types/manifest.ts`
- [ ] Define `DatasetType` union
- [ ] Define `DatasetManifestEntry` interface
- [ ] Export `DatasetManifest` array type

### Step 3: Create Lunch Log Types

Create `src/types/lunchLog.ts`:

```typescript
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
```

- [ ] Create `src/types/lunchLog.ts`
- [ ] Define `RawLunchLogRow` (CSV strings)
- [ ] Define `NormalizedLunchLogEntry` (parsed domain model)
- [ ] Define `CanStats` (aggregated data)
- [ ] Define `MatchupStats` and `HeadToHeadData`

### Step 4: Create Weight Log Types

Create `src/types/weightLog.ts`:

```typescript
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
```

- [ ] Create `src/types/weightLog.ts`
- [ ] Define `RawWeightLogRow` (CSV strings)
- [ ] Define `NormalizedWeightLogEntry` (parsed domain model)
- [ ] Define `DailyWeightAverage` (aggregated data)
- [ ] Define `WeeklyWeightChange` (aggregated data)

### Step 5: Create Event Log Types

Create `src/types/eventLog.ts`:

```typescript
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
```

- [ ] Create `src/types/eventLog.ts`
- [ ] Define `RawEventLogRow` (CSV strings)
- [ ] Define `NormalizedEventLogEntry` (parsed domain model)

### Step 6: Create Shared Utility Types

Create `src/types/common.ts`:

```typescript
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
```

- [ ] Create `src/types/common.ts`
- [ ] Define `DateKey` type alias
- [ ] Define `Result<T, E>` discriminated union
- [ ] Define `CsvRow` type for generic CSV parsing

### Step 7: Create Type Index File

Create `src/types/index.ts` to export all types:

```typescript
/**
 * Centralized type exports
 */

export * from './common'
export * from './manifest'
export * from './lunchLog'
export * from './weightLog'
export * from './eventLog'
```

- [ ] Create `src/types/index.ts`
- [ ] Export all type modules

### Step 8: Create Analysis Output Types (for CI script)

Create `src/types/analysis.ts`:

```typescript
/**
 * Analysis Types
 * Output format for pre-deploy analysis script
 */

export interface CanCoupling {
  can1: string
  can2: string
  offered: number
}

export interface AnalysisOutput {
  'least-represented-couplings': CanCoupling[]
  generatedAt?: string
}
```

- [ ] Create `src/types/analysis.ts`
- [ ] Define `CanCoupling` interface
- [ ] Define `AnalysisOutput` interface

---

## Validation Steps

### After Completing Type Definitions:

- [ ] All type files created in `src/types/`
- [ ] Each file has clear documentation comments
- [ ] Raw types use `string` fields (CSV data)
- [ ] Normalized types use proper domain types (`Date`, `number`, etc.)
- [ ] Aggregated types clearly separate from raw/normalized
- [ ] No `any` types used
- [ ] Run `npm run build` → **MUST SUCCEED**
- [ ] No existing `.js` files have been modified
- [ ] TypeScript compiles without errors

### Type Safety Checklist:

- [ ] Manifest types match `public/data/manifest.json` structure
- [ ] Lunch log types cover: Raw → Normalized → Aggregated (CanStats, HeadToHead)
- [ ] Weight log types cover: Raw → Normalized → Aggregated (Daily, Weekly)
- [ ] Event log types cover: Raw → Normalized
- [ ] Common utility types defined (DateKey, Result, CsvRow)
- [ ] Analysis types match `public/data/analysis.json` structure

---

## Success Criteria

✅ Phase 2 complete when:
- `src/types/` directory exists with all type definition files
- All domain models have explicit TypeScript interfaces
- Clear separation between Raw, Normalized, and Aggregated types
- Type exports centralized in `src/types/index.ts`
- Build succeeds with new types in place
- NO existing JavaScript code modified yet
- Types are ready to be imported by data layer in Phase 3

---

## Rollback Guidance

If build fails after creating types:
1. Check TypeScript syntax in all type files
2. Verify no circular dependencies in type imports
3. Ensure `src/types/index.ts` exports are correct
4. Check that no existing code was accidentally modified
5. Do NOT proceed to Phase 3 until types compile cleanly

---

## STOP Directive

⛔ **STOP after completing type definitions and running validation.**

Do NOT proceed to Phase 3 (Convert Data Layer) until:
1. All type files have been created
2. All validation steps pass
3. Build succeeds
4. `migration_state.json` updated to `currentPhase: 2`
5. User clears context and restarts for Phase 3

---

## Notes

- These types will be consumed by Phase 3 (Data Layer conversion)
- Raw types reflect CSV data as-is (all strings)
- Normalized types reflect validated, parsed domain models
- Aggregated types reflect chart-ready computed data
- The `Result<T>` type will be used for operations that can fail gracefully
- This phase establishes the type safety foundation for the entire migration
