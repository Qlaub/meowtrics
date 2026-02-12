# PHASE 6 — Convert Node Scripts (scripts/)

**Status**: Ready to Execute
**Prerequisites**: Phase 5 complete (Router & Pinia converted)
**Objective**: Convert Node.js CLI scripts from JavaScript to TypeScript with full type safety

## Scope

Convert the following Node scripts:
- `scripts/analyze-least-represented.js` → `scripts/analyze-least-represented.ts`

## Instructions

### Step 1: Install TypeScript Node Types (if not already present)
```bash
npm install --save-dev @types/node
```

### Step 2: Convert `analyze-least-represented.js` to TypeScript

1. **Rename**: `scripts/analyze-least-represented.js` → `scripts/analyze-least-represented.ts`

2. **Add Type Imports**:
   - Import Node.js types (fs, path, etc.)
   - Use existing CSV types from `src/data/csv.ts`
   - Use existing lunch log types from `src/types/`

3. **Type CSV Data**:
   - Treat raw CSV rows as `Record<string, string>`
   - Use the existing `LunchLogRawRow` type from domain types
   - Explicitly type parsed data structures

4. **Type Aggregation Logic**:
   - Define explicit types for:
     - Can frequency maps
     - Pairing structures
     - Selection counts
     - Analysis output format

5. **Type File System Operations**:
   - Explicitly type file paths
   - Type JSON read/write operations
   - Type the analysis.json output structure

6. **Define Output Interface**:
   Create explicit interface for `analysis.json`:
   ```typescript
   interface AnalysisOutput {
     'least-represented-couplings': Array<{
       can1: string
       can2: string
     }>
     generatedAt?: string
     // any other fields
   }
   ```

7. **No `any` Allowed**:
   - Use `unknown` if type is truly dynamic
   - Prefer explicit interfaces
   - Add runtime guards if needed

### Step 3: Update Package Scripts (if needed)

Ensure the script can still be invoked via:
```bash
node scripts/analyze-least-represented.ts
```

Or update the GitHub Actions workflow if it needs to use `tsx` or similar:
```bash
npx tsx scripts/analyze-least-represented.ts
```

### Step 4: Verify CI Compatibility

Check `.github/workflows/deploy.yml`:
- Ensure the script invocation still works
- If needed, add `tsx` to dev dependencies and update the workflow command

## Validation Checklist

Run the following commands and ensure ALL pass:

- [ ] `npm run build` — Must succeed with zero TypeScript errors
- [ ] `npm run test:unit` — All unit tests must pass (including `tests/unit/scripts/` if they exist)
- [ ] `node scripts/analyze-least-represented.ts` (or `npx tsx scripts/analyze-least-represented.ts`) — Script executes successfully
- [ ] Verify `public/data/analysis.json` is generated correctly with expected structure
- [ ] `npm run lint` — No linting errors
- [ ] `npm run test:all` — Full test suite passes

## Success Criteria

- [ ] `analyze-least-represented.js` renamed to `.ts`
- [ ] All types explicitly defined (no implicit `any`)
- [ ] Script runs successfully via Node 20+
- [ ] Output JSON matches expected schema
- [ ] CI workflow compatibility preserved
- [ ] All tests passing
- [ ] Zero TypeScript compilation errors

## Rollback Guidance

If the build or tests fail:

1. **Do NOT revert to JavaScript**
2. **Do NOT use `any` as a shortcut**
3. **Diagnose the type error**:
   - Check if types are correctly imported
   - Verify CSV parsing matches expected structure
   - Ensure JSON output matches interface
4. **Fix types properly**:
   - Add explicit interfaces
   - Use type guards for runtime checks
   - Narrow union types where needed
5. **If CI fails**:
   - Check if `tsx` or `ts-node` is needed
   - Update workflow to handle `.ts` scripts
   - Ensure dependencies are installed in CI

## Notes

- This script is run during CI pre-deploy
- It reads CSV files and generates JSON output
- Type safety here prevents runtime errors in production
- The script must be deterministic and reliable
- Feature spec reference: `new-features/TICKET-001-FEATURE-Pre-Deploy-Least-Represented-Can-Analysis.md`

## STOP Directive

**STOP** after completing this phase and running all validation steps.
Do NOT proceed to Phase 7 until:
1. All validation checks pass
2. Migration state is updated
3. User confirms readiness to continue

---

**End of Phase 6 Instructions**
