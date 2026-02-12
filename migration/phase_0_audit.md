# Phase 0: Pre-Migration Audit Report

**Date**: 2026-02-11
**Status**: Complete
**Migration Target**: JavaScript → TypeScript
**Project**: Meowtrics (Vue 3 SPA)

---

## Executive Summary

Meowtrics is a mobile-first Vue 3 SPA with:
- **13 JavaScript modules** in `src/`
- **11 Vue SFCs** (all using `<script setup>`)
- **1 Node CLI script** in `scripts/`
- **16 unit test files** + **9 e2e/visual/a11y test files**
- **No TypeScript infrastructure** currently

The codebase is well-structured with clear separation between data layer, UI components, and routing. Migration complexity is **MODERATE** due to:
- Runtime CSV parsing with implicit object shapes
- Heavy ECharts integration with complex option builders
- Pinia stores with inferred types
- Theme system with dynamic token application

---

## File Inventory

### 1. Core JavaScript Modules (src/)

#### Data Layer (6 files) — **HIGH PRIORITY**
1. `src/data/csv.js` — CSV fetching and parsing
2. `src/data/manifest.js` — Manifest loading and dataset lookup
3. `src/data/dates.js` — Date utilities
4. `src/data/lunchLog.js` — Lunch log normalization and aggregation
5. `src/data/weightLog.js` — Weight log normalization and aggregation
6. `src/data/eventLog.js` — Event log normalization

#### Stores (2 files) — **MEDIUM PRIORITY**
7. `src/stores/themeStore.js` — Pinia store for theme management
8. `src/stores/deviceContext.js` — Pinia store for viewport detection

#### Composables (1 file) — **MEDIUM PRIORITY**
9. `src/composables/useChartTheme.js` — Chart theming composable

#### Themes (2 files) — **LOW PRIORITY**
10. `src/themes/index.js` — Theme registry
11. `src/themes/cummings.js` — Cummings theme definition

#### Infrastructure (2 files) — **CRITICAL**
12. `src/router/index.js` — Vue Router configuration
13. `src/main.js` — Application entry point

### 2. Vue Single File Components (11 files)

#### Core Components (6 files)
1. `src/components/EChart.vue` — Generic ECharts wrapper
2. `src/components/LunchLogDashboard.vue` — 4 charts (bar, pie, heatmap)
3. `src/components/WeightLogDashboard.vue` — 2 charts (line, bar)
4. `src/components/EventLogDashboard.vue` — Event log visualization
5. `src/components/ThemeSwitch.vue` — Theme switcher UI
6. `src/components/FilterBar.vue` — Date filter controls

#### UI Components (3 files)
7. `src/components/DropdownButton.vue` — Dropdown button component
8. `src/components/DropdownDateRange.vue` — Date range picker

#### Views (2 files)
9. `src/views/HomeView.vue` — Landing page with dataset cards
10. `src/views/DatasetView.vue` — Dataset viewer with dashboard
11. `src/App.vue` — Root application component

### 3. Node Scripts (1 file)

1. `scripts/analyze-least-represented.js` — Pre-deploy analysis script
   - Reads lunch log CSV
   - Generates pairing recommendations
   - Writes `public/data/analysis.json`
   - **Critical**: Must maintain deterministic behavior for CI

### 4. Test Files (25 files)

#### Unit Tests (16 files)
- `tests/unit/data/` — 5 data layer tests (csv, lunchLog, weightLog, eventLog, dates)
- `tests/unit/components/` — 6 component tests
- `tests/unit/composables/` — 1 composable test
- `tests/unit/scripts/` — 1 script test
- `tests/unit/docs/` — 3 documentation tests

#### E2E Tests (3 files)
- `tests/e2e/home.spec.js`
- `tests/e2e/dataset-navigation.spec.js`
- `tests/e2e/date-filter.spec.js`

#### Visual Regression Tests (3 files)
- `tests/visual/charts-desktop.spec.js`
- `tests/visual/charts-mobile.spec.js`
- `tests/visual/responsive-layout.spec.js`

#### Accessibility Tests (3 files)
- `tests/a11y/home.a11y.spec.js`
- `tests/a11y/lunch-dashboard.a11y.spec.js`
- `tests/a11y/weight-dashboard.a11y.spec.js`

### 5. Configuration Files

- `vite.config.js` — Vite bundler config (uses Node ESM, path aliases)
- `package.json` — Dependencies (no TS deps yet)

---

## Data Flow Analysis

### CSV → Normalized → Aggregated → Chart Options

```
1. CSV Files (public/data/*.csv)
   ↓
2. csv.js → parseCsv() returns Record<string, string>[]
   ↓
3. normalization (lunchLog.js, weightLog.js, eventLog.js)
   ↓
4. aggregation (aggregateLunchLog, buildHeadToHead, etc.)
   ↓
5. ECharts option builders (in dashboard components)
   ↓
6. EChart.vue renders via echarts.init()
```

### Key Patterns Requiring Types

#### 1. **CSV Parsing** (csv.js)
- Returns `Record<string, string>[]` (implicit)
- No validation — assumes headers and structure
- **Risk**: Runtime failures if CSV malformed

#### 2. **Manifest Loading** (manifest.js)
- Returns JSON array (implicit shape)
- Cached in module scope
- Expected shape:
  ```javascript
  {
    id: string,
    title: string,
    file: string,
    type: 'lunch_log' | 'weight_log' | 'event_log',
    cat: string
  }
  ```

#### 3. **Normalization Functions**
- `normalizeLunchLog(rows)` — Transforms CSV rows to domain objects
  ```javascript
  {
    timestamp: Date,
    dateKey: string,
    choice1: string,
    choice2: string,
    winner: string
  }
  ```
- Similar for `normalizeWeightLog` and `normalizeEventLog`
- **Critical**: These define the domain model

#### 4. **Aggregation Functions**
- `aggregateLunchLog(rows)` → `{ name, offered, selected }[]`
- `buildHeadToHead(rows)` → `{ names: string[], matchups: {...} }`
- **Risk**: Complex nested object structures with no explicit types

#### 5. **ECharts Option Builders**
- Dashboard components construct large option objects
- Contain:
  - Tooltip formatters (functions with `params` argument)
  - Series data transformations
  - Dynamic color calculations
  - Responsive sizing logic
- **Risk**: ECharts types are complex; option builders are 100+ lines

#### 6. **Pinia Stores**
- `themeStore` — State: `{ activeThemeId: string }`, Getters: `activeTheme`, `themes`
- `deviceContext` — State: `{ isMobileViewport: boolean }`, reactive to window resize
- **Pattern**: Options API syntax with `state()`, `getters`, `actions`

#### 7. **Dynamic Imports & Vite Globals**
- `import.meta.env.BASE_URL` used in fetch calls
- No explicit typing for Vite env

---

## Risk Assessment

### 🔴 HIGH RISK

1. **CSV Parsing** (csv.js)
   - No runtime validation
   - Implicit Record<string, string> return type
   - Used by all data loaders
   - **Mitigation**: Add explicit typing + runtime guards

2. **ECharts Option Builders** (dashboard components)
   - Complex nested objects (200+ lines in LunchLogDashboard)
   - Tooltip formatters use implicit `params` types
   - Color calculations with RGB parsing
   - **Mitigation**: Import `EChartsOption` type, type formatters explicitly

3. **Aggregation Logic** (lunchLog.js, weightLog.js)
   - Nested object mutations
   - Implicit object shapes in loops
   - No validation that required fields exist
   - **Mitigation**: Define explicit interfaces for aggregated data

### 🟡 MEDIUM RISK

4. **Pinia Stores** (themeStore.js, deviceContext.js)
   - Inferred state/getter types may leak `any`
   - LocalStorage access untyped
   - **Mitigation**: Explicit return types on getters/actions

5. **Vue Router** (router/index.js)
   - Route params untyped
   - useRoute() returns inferred types
   - **Mitigation**: Type routes with `RouteRecordRaw`, type params in components

6. **Node Script** (analyze-least-represented.js)
   - File I/O with no error types
   - JSON output shape not validated
   - **Mitigation**: Add Node types, explicit output interface

### 🟢 LOW RISK

7. **Date Utilities** (dates.js)
   - Simple pure functions
   - Clear input/output contracts
   - **Mitigation**: Straightforward typing

8. **Theme System** (themes/index.js, themes/cummings.js)
   - Static configuration objects
   - No complex logic
   - **Mitigation**: Define theme interface

---

## Expected Type Models (Phase 2 Deliverables)

### Core Domain Types (src/types/)

#### manifest.ts
```typescript
export interface DatasetManifestEntry {
  id: string
  title: string
  file: string
  type: 'lunch_log' | 'weight_log' | 'event_log'
  cat: string
}

export type DatasetManifest = DatasetManifestEntry[]
```

#### lunchLog.ts
```typescript
// Raw CSV row
export interface LunchLogRawRow {
  timestamp: string
  choice1: string
  choice2: string
  winner: string
}

// Normalized domain object
export interface LunchLogEntry {
  timestamp: Date
  dateKey: string
  choice1: string
  choice2: string
  winner: string
}

// Aggregated can stats
export interface CanStats {
  name: string
  offered: number
  selected: number
}

// Head-to-head matchup data
export interface HeadToHeadData {
  names: string[]
  matchups: Record<string, Record<string, { wins: number; total: number }>>
}
```

#### weightLog.ts
```typescript
export interface WeightLogRawRow {
  timestamp: string
  weight: string
}

export interface WeightLogEntry {
  timestamp: Date
  dateKey: string
  weight: number
}

export interface WeeklyWeightStats {
  weekStart: string
  avgWeight: number
  change: number | null
}
```

#### eventLog.ts
```typescript
export interface EventLogRawRow {
  timestamp: string
  event: string
  notes?: string
}

export interface EventLogEntry {
  timestamp: Date
  dateKey: string
  event: string
  notes?: string
}
```

#### csv.ts
```typescript
export type CsvRow = Record<string, string>

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
```

#### theme.ts
```typescript
export interface Theme {
  id: string
  name: string
  tokens: Record<string, string>
}
```

---

## Migration Order (Recommended)

### Phase 1: Infrastructure (NEXT)
- Install TypeScript, vue-tsc, @types/node
- Create tsconfig.json + tsconfig.node.json
- Verify build succeeds with no code changes

### Phase 2: Define Types (src/types/)
- Create all domain interfaces listed above
- **No logic changes yet**

### Phase 3: Data Layer (HIGH LEVERAGE)
Order:
1. `src/data/dates.js` → `.ts` (simple utilities)
2. `src/data/csv.js` → `.ts` (foundation for all parsing)
3. `src/data/manifest.js` → `.ts` (uses CSV)
4. `src/data/lunchLog.js` → `.ts` (uses dates, csv)
5. `src/data/weightLog.js` → `.ts`
6. `src/data/eventLog.js` → `.ts`

**Critical**: All unit tests must pass after each file

### Phase 4: Vue Components
1. `src/components/EChart.vue` (wrapper, low complexity)
2. `src/components/FilterBar.vue`
3. `src/components/DropdownButton.vue`
4. `src/components/DropdownDateRange.vue`
5. `src/components/LunchLogDashboard.vue` (complex ECharts options)
6. `src/components/WeightLogDashboard.vue`
7. `src/components/EventLogDashboard.vue`
8. `src/components/ThemeSwitch.vue`
9. `src/views/HomeView.vue`
10. `src/views/DatasetView.vue`
11. `src/App.vue`

### Phase 5: Router & Stores
1. `src/router/index.js` → `.ts`
2. `src/stores/deviceContext.js` → `.ts`
3. `src/stores/themeStore.js` → `.ts`

### Phase 6: Composables & Themes
1. `src/composables/useChartTheme.js` → `.ts`
2. `src/themes/index.js` → `.ts`
3. `src/themes/cummings.js` → `.ts`

### Phase 7: Entry Point
1. `src/main.js` → `.ts`

### Phase 8: Node Scripts
1. `scripts/analyze-least-represented.js` → `.ts`
2. Update tsconfig.node.json if needed

### Phase 9: Tests
1. Unit tests (data layer first)
2. Component tests
3. E2E tests (may need Playwright TS support)
4. Visual/a11y tests

### Phase 10: Hardening & Audit
1. Enable `noUncheckedIndexedAccess`
2. Enable `exactOptionalPropertyTypes`
3. Search for `any`, `@ts-ignore`, `as any`
4. Final validation

---

## Key Dependencies (Current)

### Production
- `vue@^3.5.27`
- `vue-router@^5.0.1`
- `pinia@^3.0.4`
- `echarts@^6.0.0`
- `bowser@^2.13.1`

### Dev
- `vite@^7.3.1`
- `@vitejs/plugin-vue@^6.0.3`
- `vitest@^4.0.18`
- `@playwright/test@^1.58.1`
- ESLint 9 + Oxlint + Prettier

### To Add (Phase 1)
- `typescript` (latest)
- `vue-tsc` (latest)
- `@types/node` (latest)

---

## Special Considerations

### 1. GitHub Pages Deployment
- Uses hash-based routing
- `base` path set in vite.config.js
- Must preserve deployment workflow

### 2. Pre-Deploy Analysis Script
- Runs in CI before build
- Must maintain deterministic output
- Critical for data integrity

### 3. No Backend
- All data from static CSV files
- No API contracts to type
- Focus on runtime data validation

### 4. Mobile-First Responsive
- Heavy use of `deviceContext.isMobileViewport`
- Dynamic sizing in charts
- Preserve responsive behavior

### 5. Theme System
- CSS custom properties applied at runtime
- LocalStorage persistence
- Multiple themes supported

---

## Success Metrics

After full migration:
- [ ] Zero `any` types (except where truly necessary)
- [ ] All tests pass (unit + e2e + visual + a11y)
- [ ] Clean `npm run build`
- [ ] No runtime regressions
- [ ] Type-safe CSV parsing with validation
- [ ] Type-safe ECharts options
- [ ] Type-safe Pinia stores
- [ ] Type-safe Vue Router params

---

## Conclusion

The migration is **feasible and low-risk** if done incrementally. The well-structured codebase with clear separation of concerns makes phased conversion straightforward.

**Highest Priority**: Data layer (Phase 3) — types here provide the foundation for everything else.

**Biggest Challenge**: ECharts option builders — complex nested objects requiring careful typing.

**Estimated Effort**: 15-20 phases (including validation checkpoints)

---

**Next Step**: Execute Phase 1 (TypeScript Infrastructure Setup)
