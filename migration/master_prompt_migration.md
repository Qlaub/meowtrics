🔧 MASTER MIGRATION PROMPT (JS → TS)
You are a senior TypeScript migration engineer working on a production Vue 3 SPA.
Your task is to migrate this repository from JavaScript to TypeScript safely, incrementally, and with zero feature regressions.
This is a frontend-only Vue 3 + Vite + ECharts + Pinia SPA that reads CSV files at runtime from /public/data.
You MUST follow the steps below exactly and stop after each phase to validate before proceeding.

GLOBAL RULES
1. Do NOT rewrite architecture.
2. Do NOT change behavior.
3. Do NOT refactor logic unless necessary for typing.
4. Do NOT introduce any unless temporarily unavoidable.
5. Prefer:
    * unknown over any
    * Explicit interfaces over inline object types
    * Narrowed union types
6. Preserve all tests and ensure they pass after each phase.
7. Use strict TypeScript configuration.
8. If unsure about a type, infer from usage, not assumption.
9. This is a CSV-driven runtime app — treat external data as untrusted input.

PHASE 0 — Pre-Migration Audit (No Code Changes Yet)
1. Scan the entire repository.
2. Produce a migration plan listing:
    * All .js files
    * All Vue SFCs using <script setup>
    * Router config file
    * Data layer files (src/data/*)
    * Node CLI scripts in scripts/
    * Test files
3. Identify:
    * Dynamic patterns
    * Implicit object shapes
    * CSV parsing logic
    * Manifest loading
    * ECharts option builders
4. Output:
    * Ordered migration plan
    * Risk areas
    * Expected shared type models
Do NOT modify code yet.

PHASE 1 — TypeScript Infrastructure Setup
Make minimal changes:
1. Install:
    * typescript
    * vue-tsc
    * @types/node
2. Create tsconfig.json with:
    * "strict": true
    * "noImplicitAny": true
    * "strictNullChecks": true
    * "moduleResolution": "Bundler"
    * "baseUrl": "."
    * "paths": { "@/*": ["src/*"] }
3. Update vite.config if necessary for TS support.
4. Ensure build works BEFORE converting files.
Run:
* npm run build
* npm run test:unit
Fix infra errors only.
STOP and confirm build success.

PHASE 2 — Define Core Domain Types (Before Converting Files)
Create src/types/ directory.
Define canonical interfaces for:
Manifest
export interface DatasetManifestEntry {
  id: string
  title: string
  file: string
  type: 'lunch_log' | 'weight_log' | 'event_log'
  cat: string
}
Lunch Log Row (Raw CSV)
Weight Log Row (Raw CSV)
Event Log Row (Raw CSV)
Normalized Models
Create separate:
* Raw*
* Normalized*
* Aggregated*
Explicitly separate:
* Raw CSV string fields
* Parsed/validated domain models
* Aggregated chart-ready models
This is CRITICAL.
Do not modify existing logic yet.
STOP after types are created.

PHASE 3 — Convert Data Layer First (High Leverage)
Convert in this order:
1. src/data/date utilities
2. CSV parser
3. manifest loader
4. normalization functions
5. aggregation utilities
Rename files from .js → .ts.
Rules:
* Treat CSV rows as Record<string, string>
* Parse and validate explicitly
* Add runtime guards where assumptions exist
* Never trust CSV data
If parsing can fail, return:
Result<T> = { ok: true; data: T } | { ok: false; error: string }
After conversion:
* All unit tests must pass
* No any allowed in data layer
STOP and validate.

PHASE 4 — Convert Vue SFCs
For each .vue:
1. Add lang="ts" to <script setup>
2. Fix typing errors incrementally
3. Explicitly type:
    * defineProps
    * defineEmits
    * ref
    * computed
    * watch
Example pattern:
const props = defineProps<{
  datasetId: string
}>()
For refs:
const selectedDate = ref<string | null>(null)

Special Rules for ECharts
* Import EChartsOption from echarts
* Strongly type chart option builders
* Avoid implicit object literals
* Type tooltip formatters explicitly

STOP after each major component group:
* EChart wrapper
* LunchLogDashboard
* WeightLogDashboard
* Views
Run:
* npm run build
* npm run test:unit

PHASE 5 — Convert Router & Pinia
Router
Convert src/router/index.js → .ts
Type routes using:
import type { RouteRecordRaw } from 'vue-router'
Ensure:
* Params typed
* No implicit any in route usage
Pinia (if stores exist)
* Define store return types explicitly
* Avoid implicit inference leakage
STOP and validate.

PHASE 6 — Convert Node Scripts (scripts/)
Convert:
* analyze-least-represented.js
Add:
* Node types
* Explicit CSV typing
* Explicit output typing for analysis.json
Ensure:
* Script runs via Node 20+
* CI compatibility preserved
Run:
* npm run test:all
STOP.

PHASE 7 — Convert Tests
Convert test files to .ts gradually.
Rules:
* Use vi types explicitly if needed
* Type fixtures
* Avoid as any in tests unless unavoidable
* Fix failing type assertions properly
All test suites must pass:
* unit
* e2e
* visual
* a11y

PHASE 8 — Strictness Hardening
Enable additional strictness:
* "noUncheckedIndexedAccess": true
* "exactOptionalPropertyTypes": true
Fix resulting issues properly — do not silence errors.

PHASE 9 — Final Audit
1. Search for:
    * any
    * @ts-ignore
    * as any
2. Remove unnecessary assertions.
3. Ensure:
    * No implicit anys
    * Clean build
    * All tests pass
Produce final report:
* What was typed
* What assumptions were formalized
* Any runtime guards added
* Remaining technical debt (if any)

Migration Order Summary
1. Infra
2. Types
3. Data layer
4. Vue components
5. Router
6. Scripts
7. Tests
8. Strict hardening
9. Audit
Never skip steps.

Important Context About This App
* CSV files are runtime data
* There is no backend
* GitHub Pages uses hash routing
* Data integrity must not silently fail
* Charts depend heavily on correctly shaped aggregation data
* Pre-deploy analysis script must remain deterministic
Type safety in the data layer is the highest priority.

If at any step the build breaks:
* Fix types
* Do not revert to JS
* Do not introduce any as a shortcut
