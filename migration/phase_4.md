# PHASE 4 — Convert Vue SFCs

## Objective
Convert all Vue Single File Components to TypeScript by adding `lang="ts"` to `<script setup>` and properly typing all Vue Composition API features.

## Scope
- `src/components/EChart.vue` (generic echarts wrapper)
- `src/components/LunchLogDashboard.vue` (4 charts: double bar, selection rate, pie, heatmap)
- `src/components/WeightLogDashboard.vue` (2 charts: line, weekly change bar)
- `src/components/EventLogDashboard.vue` (timeline view)
- `src/views/HomeView.vue` (landing page with dataset cards)
- `src/views/DatasetView.vue` (dataset loader, date filter, dashboard renderer)

## Conversion Order
Convert in this order to minimize dependency issues:
1. **EChart.vue** (base component, no dependencies on other components)
2. **Dashboard components** (LunchLogDashboard, WeightLogDashboard, EventLogDashboard)
3. **Views** (HomeView, DatasetView)

## Rules
1. Add `lang="ts"` to every `<script setup>` block
2. Explicitly type:
   - `defineProps` with interface or inline type
   - `defineEmits` if used
   - `ref` with generic type parameter
   - `computed` with explicit return type if not obvious
   - `watch` source and callback parameters
3. For ECharts components:
   - Import `EChartsOption` from 'echarts'
   - Strongly type all chart option builders
   - Type tooltip formatters explicitly
   - Avoid implicit object literals
4. Do NOT change behavior or logic
5. Do NOT refactor unless necessary for typing
6. No `any` types allowed

## Pattern Examples

### Props
```typescript
const props = defineProps<{
  datasetId: string
  title?: string
}>()
```

### Refs
```typescript
const selectedDate = ref<string | null>(null)
const chartData = ref<NormalizedLunchLogEntry[]>([])
```

### Computed
```typescript
const filteredData = computed((): NormalizedLunchLogEntry[] => {
  return chartData.value.filter(/* ... */)
})
```

### ECharts Options
```typescript
import type { EChartsOption } from 'echarts'

const chartOption = computed((): EChartsOption => {
  return {
    // chart configuration
  }
})
```

## Validation Checklist
After converting each component group, run:
- [ ] `npm run build` — Must succeed with no type errors
- [ ] `npm run test:unit` — All tests must pass
- [ ] Manually verify in browser that charts render correctly

## Success Criteria
- All Vue SFCs have `lang="ts"` in `<script setup>`
- All props, refs, computed, and watch are explicitly typed
- No `any` types in component code
- All ECharts options properly typed with `EChartsOption`
- Build succeeds with zero TypeScript errors
- All 225+ unit tests pass
- Visual verification: app loads and displays charts correctly

## Rollback Guidance
If build fails or tests break:
1. Review type errors carefully — do not use `any` as shortcut
2. Check that imported types from `src/types/` match actual data shapes
3. Verify ECharts option types match echarts v5.x API
4. If stuck, revert the specific component and investigate type mismatches
5. Do NOT revert to JS — fix types properly

## STOP Directive
**STOP** after completing this phase and running all validation steps.
Report completion status and wait for user to clear context before proceeding to Phase 5.
