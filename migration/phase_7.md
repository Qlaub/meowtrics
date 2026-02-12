# Phase 7: Convert Tests

## Objective
Convert all test files from JavaScript to TypeScript while ensuring type safety and maintaining 100% test pass rate.

## Instructions from Master Prompt

Convert test files to .ts gradually.

### Rules:
1. Use vi types explicitly if needed
2. Type fixtures
3. Avoid `as any` in tests unless unavoidable
4. Fix failing type assertions properly

### Test Suites to Convert:
- `tests/unit/` - Unit tests (Vitest)
- `tests/e2e/` - E2E tests (Playwright)
- `tests/visual/` - Visual regression tests (Playwright)
- `tests/a11y/` - Accessibility tests (Playwright)

### Conversion Order:
1. Unit tests first (highest priority)
   - `tests/unit/data/` - Data layer tests
   - `tests/unit/composables/` - Composable tests
   - `tests/unit/components/` - Component tests
   - `tests/unit/scripts/` - Script tests
2. E2E tests
3. Visual tests
4. Accessibility tests

### Type Safety Requirements:
- Explicitly type test fixtures in `tests/fixtures/`
- Type all mock data and test helpers
- Use proper Vitest types (`describe`, `it`, `expect`, `vi`, etc.)
- Use proper Playwright types for E2E/visual/a11y tests
- No implicit `any` in test code
- Avoid type assertions (`as`) unless necessary for mocking

## Validation Checklist

After converting each test group, run:

```bash
npm run test:unit      # All unit tests must pass (currently 225 tests)
npm run build          # Build must succeed
npm run test:e2e       # All E2E tests must pass (currently 123 tests)
npm run test:visual    # All visual tests must pass (currently 45 tests)
npm run test:a11y      # All accessibility tests must pass (currently 72 tests)
npm run lint           # Linting must pass with zero errors
```

## Success Criteria

✅ All test files converted from `.js` to `.ts` (or `.spec.ts`/`.test.ts`)
✅ All test fixtures properly typed
✅ No `any` types in test code (except where truly unavoidable)
✅ All 225 unit tests passing
✅ All 123 E2E tests passing
✅ All 45 visual tests passing
✅ All 72 accessibility tests passing
✅ Build succeeds without errors
✅ Linting passes with zero errors

## Rollback Guidance

If tests fail after conversion:
1. Identify the specific test file causing failure
2. Check type errors in the test code
3. Verify fixture types match actual data structures
4. Ensure mock types align with implementation types
5. DO NOT revert to `.js` - fix type errors properly
6. DO NOT use `as any` as a shortcut - infer correct types

If build fails:
1. Check for test-related type errors in build output
2. Verify test files are excluded from build in `tsconfig.json`
3. Fix any shared test utilities that may affect build

## STOP Directive

**STOP after completing this phase.**

After all tests are converted and all validation passes:
1. Report completion status with test counts
2. Wait for user to review results
3. Wait for user to clear context before proceeding to Phase 8

## Phase Execution Notes

Phase 7 focuses on test conversion. This is critical because:
- Tests validate that the TypeScript migration hasn't broken functionality
- Typed tests catch type regressions
- Fixtures must be properly typed to match real data structures
- Test type safety ensures refactoring confidence

Convert tests incrementally and validate frequently.
