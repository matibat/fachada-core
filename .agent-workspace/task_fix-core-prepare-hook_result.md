# Task: Fix Core Prepare Hook

## Result Summary

fachada-core/package.json updated; prepare hook changed from npm to yarn; JSON valid; no other npm references

## Verification Record

### Criterion 1: Hook updated

**Status**: PASS  
**Evidence**: `"prepare": "yarn run build"` present in package.json  
**Exact line**:

```json
        "prepare": "yarn run build",
```

### Criterion 2: JSON valid

**Status**: PASS  
**Evidence**: JSON parses without errors  
**Command output**: `✓ JSON valid`

### Criterion 3: No npm refs

**Status**: PASS  
**Evidence**: Zero remaining references to `npm run` in package.json  
**Grep result**: No matches found for "npm run"

### Criterion 4: Only prepare changed

**Status**: PASS  
**Evidence**: Git diff shows prepare hook updated from `npm run build` to `yarn run build`  
**Changed lines**: 1 line modified in scripts section only

### Criterion 5: Yarn-exclusive scripts

**Status**: PASS  
**Evidence**: All scripts verified as yarn or standard tools

```
All scripts:
  build: tsc -p tsconfig.build.json && mkdir -p dist/astro && cp -r src/astro/{components,layouts,pages,styles,templates} dist/astro/ 2>/dev/null; true
  prepare: yarn run build
  test: vitest run
  test:watch: vitest
  test:coverage: vitest run --coverage
```

All scripts use yarn for package management (prepare hook) or standard tools (tsc, vitest)

## File Details

- **File**: `/Users/mati/workspace/fachada-core/package.json`
- **Change**: Line 39 - `"prepare": "npm run build"` → `"prepare": "yarn run build"`
- **Timestamp**: 2026-04-14
- **Status**: Completed successfully
