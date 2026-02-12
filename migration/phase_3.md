# PHASE 3 — Convert Data Layer First (High Leverage)

## Objective
Convert all data layer files from `.js` to `.ts` with full type safety. This is the highest priority for type safety as the data layer handles CSV parsing, validation, and transformations.

## Files to Convert (in order)
1. `src/data/dateUtils.js` → `src/data/dateUtils.ts`
2. `src/data/csvParser.js` → `src/data/csvParser.ts`
3. `src/data/manifestLoader.js` → `src/data/manifestLoader.ts`
4. `src/data/lunchLogNormalize.js` → `src/data/lunchLogNormalize.ts`
5. `src/data/lunchLogAggregate.js` → `src/data/lunchLogAggregate.ts`
6. `src/data/weightLogNormalize.js` → `src/data/weightLogNormalize.ts`
7. `src/data/weightLogAggregate.js` → `src/data/weightLogAggregate.ts`

## Strict Rules
1. **Treat CSV rows as `Record<string, string>`** — all CSV data is strings initially
2. **Parse and validate explicitly** — convert strings to proper types (dates, numbers, etc.)
3. **Add runtime guards** where assumptions exist
4. **Never trust CSV data** — validate before using
5. **Use the type definitions from `src/types/`** that were created in Phase 2
6. **No `any` allowed in data layer**
7. **If parsing can fail, return:**
   ```typescript
   type Result<T> = { ok: true; data: T } | { ok: false; error: string }
   ```

## Conversion Steps

### 1. Date Utilities (`src/data/dateUtils.ts`)
- Add explicit return types to all functions
- Type all parameters
- Use TypeScript Date types appropriately
- Ensure date parsing functions handle invalid inputs

### 2. CSV Parser (`src/data/csvParser.ts`)
- Type CSV parsing to return `Record<string, string>[]`
- Add validation for malformed CSV
- Handle edge cases (empty lines, missing columns, etc.)

### 3. Manifest Loader (`src/data/manifestLoader.ts`)
- Use `DatasetManifestEntry[]` type from `src/types/`
- Add runtime validation that fetched manifest matches expected shape
- Return typed Result if fetch can fail

### 4. Lunch Log Normalize (`src/data/lunchLogNormalize.ts`)
- Accept `Record<string, string>` (raw CSV row)
- Parse to `RawLunchLogRow` type
- Validate and convert to `NormalizedLunchLogEntry`
- Add guards for missing/invalid fields
- Return Result type if validation can fail

### 5. Lunch Log Aggregate (`src/data/lunchLogAggregate.ts`)
- Accept `NormalizedLunchLogEntry[]`
- Return strongly typed aggregated data structures
- Type all intermediate calculations
- Ensure aggregation logic is type-safe

### 6. Weight Log Normalize (`src/data/weightLogNormalize.ts`)
- Accept `Record<string, string>` (raw CSV row)
- Parse to `RawWeightLogRow` type
- Validate and convert to `NormalizedWeightLogEntry`
- Add guards for missing/invalid fields
- Return Result type if validation can fail

### 7. Weight Log Aggregate (`src/data/weightLogAggregate.ts`)
- Accept `NormalizedWeightLogEntry[]`
- Return strongly typed aggregated data structures
- Type all intermediate calculations
- Ensure aggregation logic is type-safe

## Success Criteria
- [ ] All data layer files renamed from `.js` to `.ts`
- [ ] All functions have explicit type signatures
- [ ] No `any` types present (check with search)
- [ ] Raw CSV data properly typed as `Record<string, string>`
- [ ] Domain models use types from `src/types/`
- [ ] Runtime validation added where necessary
- [ ] Build succeeds: `npm run build`
- [ ] All unit tests pass: `npm run test:unit`

## Validation Commands
```bash
npm run build        # Must succeed with no errors
npm run test:unit    # All tests must pass
npm run lint         # Must pass
```

## Rollback Guidance
If validation fails:
1. Check TypeScript compiler errors carefully
2. Ensure types from `src/types/` are imported correctly
3. Verify no circular dependencies introduced
4. Check that runtime data matches expected types
5. DO NOT add `any` to bypass errors — fix types properly

If build breaks catastrophically:
1. Review git diff to identify breaking change
2. Fix type errors one file at a time
3. Use `unknown` instead of `any` if type is genuinely unclear
4. Add runtime type guards if needed

## STOP Directive
After completing this phase and validating:
- **STOP and report completion status**
- **Wait for user to acknowledge before proceeding to Phase 4**
- **Do NOT proceed to next phase automatically**

## Notes
- The data layer is the foundation — getting this right prevents cascading type errors
- CSV data is inherently untyped at runtime — validation is critical
- ECharts components depend on correctly typed aggregated data
- Test failures may indicate shape mismatches — fix the types, not the tests
