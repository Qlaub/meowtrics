# Phase 8 — Strictness Hardening

## Objective
Enable additional TypeScript strictness flags and fix all resulting type errors properly without silencing them.

## Instructions from Master Prompt

Enable additional strictness:
* `"noUncheckedIndexedAccess": true`
* `"exactOptionalPropertyTypes": true`

Fix resulting issues properly — do not silence errors.

## Execution Steps

1. **Update tsconfig.json**
   - Add `"noUncheckedIndexedAccess": true` to compilerOptions
   - Add `"exactOptionalPropertyTypes": true` to compilerOptions

2. **Run Type Check**
   - Execute `npx vue-tsc --noEmit` to identify all type errors

3. **Fix Type Errors Systematically**
   - Address each error properly
   - Add proper null/undefined checks where needed
   - Never use `!` non-null assertion as a shortcut
   - Never add `@ts-ignore` or `as any`
   - Properly handle potentially undefined array/object accesses

4. **Common Patterns for `noUncheckedIndexedAccess`**
   - Array access: `arr[0]` becomes `string | undefined`, handle explicitly
   - Object access: `obj[key]` becomes `T | undefined`, add guards
   - Use optional chaining: `arr[0]?.prop`
   - Use nullish coalescing: `arr[0] ?? defaultValue`

5. **Common Patterns for `exactOptionalPropertyTypes`**
   - Cannot assign `undefined` to optional properties explicitly
   - Use omission instead of setting to `undefined`
   - Adjust type definitions if needed

## Validation Checklist

- [ ] tsconfig.json updated with both strictness flags
- [ ] `npx vue-tsc --noEmit` runs with zero errors
- [ ] `npm run build` succeeds
- [ ] `npm run test:unit` passes (all tests)
- [ ] `npm run lint` passes with zero errors
- [ ] No `@ts-ignore` comments added
- [ ] No `as any` assertions added
- [ ] No `!` non-null assertions used as shortcuts

## Success Criteria

1. Build succeeds with new strictness flags enabled
2. All tests pass
3. Type check passes with zero errors
4. No type safety compromises made
5. Code properly handles potentially undefined values

## Rollback Guidance

If the build fails and cannot be fixed:
1. Document the specific error
2. DO NOT revert strictness flags immediately
3. Analyze root cause
4. Attempt proper fix
5. Only revert flags as absolute last resort with documented reason

## STOP Directive

After completing this phase and validating success:
- Update migration_state.json (currentPhase = 8, append 8 to completedPhases)
- Report completion status
- STOP and wait for user to clear context before Phase 9
