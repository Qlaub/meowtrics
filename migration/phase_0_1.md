# Phase 0 + 1 Execution: Pre-Migration Audit + TypeScript Infrastructure Setup

**Status**: Executing
**Date**: 2026-02-11

---

## Phase 0: Pre-Migration Audit (No Code Changes)

### Objectives
1. Scan the entire repository
2. Produce a migration plan listing all files to convert
3. Identify dynamic patterns, implicit object shapes, and CSV parsing logic
4. Output ordered migration plan and risk areas
5. **Do NOT modify code yet**

### Execution Steps

#### Step 1: Repository Scan
- [ ] List all .js files in src/
- [ ] List all Vue SFCs with `<script setup>`
- [ ] Identify router config file
- [ ] Identify data layer files (src/data/*)
- [ ] Identify Node CLI scripts (scripts/)
- [ ] Identify test files (tests/)

#### Step 2: Pattern Analysis
- [ ] Identify dynamic patterns (CSV parsing, manifest loading)
- [ ] Identify implicit object shapes
- [ ] Identify ECharts option builders
- [ ] Identify runtime data handling patterns

#### Step 3: Generate Audit Report
- [ ] Create ordered migration plan
- [ ] List risk areas
- [ ] Document expected shared type models
- [ ] Save output to `migration/phase_0_audit.md`

---

## Phase 1: TypeScript Infrastructure Setup

### Objectives
1. Install TypeScript dependencies
2. Create tsconfig.json with strict settings
3. Update vite.config if necessary
4. Ensure build works BEFORE converting files

### Execution Steps

#### Step 1: Install Dependencies
```bash
npm install --save-dev typescript vue-tsc @types/node
```
- [ ] Install typescript
- [ ] Install vue-tsc
- [ ] Install @types/node

#### Step 2: Create tsconfig.json
Create with the following configuration:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Strict Type-Checking Options */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,

    /* Module Resolution */
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Path Mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```
- [ ] Create tsconfig.json with strict settings
- [ ] Ensure moduleResolution: "Bundler"
- [ ] Configure path alias @/* → src/*

#### Step 3: Create tsconfig.node.json
Create for Node scripts:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.js", "scripts/**/*.js"]
}
```
- [ ] Create tsconfig.node.json for build tools

#### Step 4: Update vite.config.js
- [ ] Check if vite.config needs TypeScript support updates
- [ ] Ensure Vue plugin properly configured for TS

---

## Validation Steps

### After Phase 0:
- [ ] Audit report exists at `migration/phase_0_audit.md`
- [ ] Audit report contains complete file inventory
- [ ] Audit report identifies risk areas
- [ ] NO code has been modified

### After Phase 1:
- [ ] TypeScript dependencies installed
- [ ] tsconfig.json exists with strict settings
- [ ] tsconfig.node.json exists
- [ ] Run `npm run build` → **MUST SUCCEED**
- [ ] Run `npm run test:unit` → **MUST PASS**
- [ ] Vite dev server starts without errors
- [ ] NO .js files converted yet (only infra setup)

---

## Success Criteria

✅ Phase 0 complete when:
- Audit report generated
- All files inventoried
- Risk areas documented
- No code changes made

✅ Phase 1 complete when:
- All dependencies installed
- TypeScript configuration created
- Build succeeds
- All tests pass
- Infrastructure ready for file conversion

---

## Rollback Guidance

If build fails after Phase 1:
1. Check tsconfig.json for syntax errors
2. Verify all dependencies installed correctly
3. Check vite.config.js compatibility
4. Review Vue plugin configuration
5. Do NOT proceed to Phase 2 until build succeeds

---

## STOP Directive

⛔ **STOP after completing both phases and running validation.**

Do NOT proceed to Phase 2 (Define Core Domain Types) until:
1. This file has been executed
2. All validation steps pass
3. migration_state.json updated to currentPhase: 1
4. User clears context and restarts for Phase 2
