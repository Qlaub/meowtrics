# Phase 5: Convert Router & Pinia

## Objective
Convert the Vue Router configuration from JavaScript to TypeScript, ensuring all routes are properly typed and no implicit `any` types exist in route usage. Handle Pinia stores if they exist.

## Exact Instructions from Master Prompt

### Router
1. Convert `src/router/index.js` → `src/router/index.ts`
2. Type routes using: `import type { RouteRecordRaw } from 'vue-router'`
3. Ensure:
   - Params typed
   - No implicit any in route usage

### Pinia (if stores exist)
- Define store return types explicitly
- Avoid implicit inference leakage

## Pre-Phase Checklist
- [ ] Verify Phase 4 is complete (all Vue SFCs converted)
- [ ] Verify build is passing: `npm run build`
- [ ] Verify tests are passing: `npm run test:unit`

## Execution Steps

### Step 1: Identify Files to Convert
- [ ] Locate `src/router/index.js`
- [ ] Check for any Pinia stores in `src/stores/` (if directory exists)

### Step 2: Convert Router
- [ ] Rename `src/router/index.js` → `src/router/index.ts`
- [ ] Import `RouteRecordRaw` type from vue-router
- [ ] Type the routes array explicitly as `RouteRecordRaw[]`
- [ ] Type route params if used in components
- [ ] Ensure no implicit `any` in route configuration
- [ ] Type any route meta fields if used

### Step 3: Convert Pinia Stores (if they exist)
- [ ] For each store file:
  - [ ] Rename `.js` → `.ts`
  - [ ] Define explicit return types for store functions
  - [ ] Type state, getters, and actions explicitly
  - [ ] Avoid relying on implicit inference

### Step 4: Fix Import Statements
- [ ] Update any imports in Vue components that reference router (should already be typed from Phase 4)
- [ ] Verify router typing is correctly consumed by TypeScript compiler

## Global Rules (Reminder)
1. Do NOT rewrite architecture
2. Do NOT change behavior
3. Do NOT refactor logic unless necessary for typing
4. Do NOT introduce `any` unless temporarily unavoidable
5. Prefer:
   - `unknown` over `any`
   - Explicit interfaces over inline object types
   - Narrowed union types

## Validation Checklist

After completing all conversion steps, run these commands in order:

1. **Type Check**
   ```bash
   npx vue-tsc --noEmit
   ```
   ✅ Must pass with zero errors

2. **Build**
   ```bash
   npm run build
   ```
   ✅ Must succeed with zero errors

3. **Unit Tests**
   ```bash
   npm run test:unit
   ```
   ✅ All tests must pass

4. **Manual Verification**
   - [ ] Navigate to home page (/)
   - [ ] Navigate to a dataset page (/datasets/:datasetId)
   - [ ] Verify routing works correctly
   - [ ] Check browser console for runtime errors

## Success Criteria

✅ Phase 5 is considered successful when ALL of the following are true:

1. `src/router/index.ts` exists (renamed from .js)
2. All routes are typed with `RouteRecordRaw`
3. No implicit `any` in router configuration
4. All Pinia stores (if any) are converted to TypeScript with explicit types
5. `npx vue-tsc --noEmit` passes with zero errors
6. `npm run build` completes successfully
7. `npm run test:unit` passes with 100% of tests passing
8. Application routing functions correctly when manually tested

## Rollback Guidance (If Build Fails)

If validation fails after conversion:

1. **Identify the failure point:**
   - Which command failed? (vue-tsc, build, test)
   - What is the error message?
   - Which file(s) are causing the error?

2. **Common issues and fixes:**
   - **Type errors in route definitions**: Ensure `component` fields use proper imports (not dynamic strings)
   - **Route param typing**: Check if params are being used with correct types in components
   - **Missing types**: Verify `vue-router` types are properly installed
   - **Import path issues**: Check that `@/` alias still works in .ts files

3. **Do NOT revert to JavaScript**
   - Fix types properly
   - Add explicit type annotations where inference fails
   - Use `unknown` instead of `any` if type is unclear

4. **If stuck:**
   - Report the specific error to the user
   - DO NOT update `migration_state.json`
   - STOP and wait for user intervention

## Post-Phase Actions

When ALL validation steps pass:

1. Update `migration/migration_state.json`:
   ```json
   {
     "currentPhase": 5,
     "completedPhases": [0, 1, 2, 3, 4, 5],
     "status": "in_progress",
     "lastUpdated": "2026-02-11",
     "notes": "Phase 5 complete: Router converted to TypeScript with properly typed routes, all validation passing"
   }
   ```

2. Report completion to user:
   - ✅ Phase 5 complete
   - Files converted
   - All validation passing

3. **STOP** and wait for user to clear context and request Phase 6

---

## STOP Directive

⛔ **DO NOT PROCEED TO PHASE 6 AUTOMATICALLY**

After completing this phase and updating migration_state.json, STOP execution and report status to the user. Wait for the user to clear context and explicitly request the next phase.
