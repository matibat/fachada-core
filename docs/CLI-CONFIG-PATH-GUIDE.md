# Task 15: CLI Config Path Support - Implementation Complete

## Summary

Successfully updated CLI tools in `src/cli/` to accept `--config-path` / `--config` flags pointing to application.yaml files with sensible defaults, environment variable support, and graceful error handling.

## What Was Built

### 1. **Config Path Resolver Module** (`src/cli/config-path-resolver.ts`)

- **Purpose**: Reusable utility for all CLI commands to resolve config file paths
- **Key Functions**:
  - `resolveConfigPath()` - Resolves path with priority-based resolution
  - `getConfigPathArg()` - Extracts flag from process.argv
  - `configExists()` - Safe file existence check (never throws)
- **Priority Order**:
  1.  Explicit `--config-path` or `--config` flag
  2.  `FACHADA_CONFIG` environment variable
  3.  Default: `./application.yaml` in current directory

### 2. **Updated CLI Entry Point** (`src/cli/create-app.ts`)

- **New Flags**: `--config-path` and `--config` (aliases)
- **Integration**:
  - Parses flags in argument parser
  - Optionally loads Site via `loadSiteFromFile()` when config provided
  - Integrates loaded Site into command output
  - Maintains full backward compatibility (config is optional)
- **Output**: Displays loaded site information when config is provided

### 3. **CLI Utilities Module** (`src/cli/index.ts`)

- Exports all config path resolver utilities for reuse by future CLI commands

### 4. **Comprehensive Test Suite** (`src/cli/config-path-resolver.test.ts`)

- 16 BDD-style tests covering all scenarios
- Tests for priority resolution, error handling, and edge cases
- 100% test pass rate

## Files Created/Modified

```
Created:
  - src/cli/config-path-resolver.ts (166 lines)
  - src/cli/config-path-resolver.test.ts (275 lines)
  - src/cli/index.ts (12 lines)

Modified:
  - src/cli/create-app.ts (added ~60 lines of config loading logic)

Compiled Output:
  - dist/cli/config-path-resolver.js
  - dist/cli/config-path-resolver.d.ts
  - dist/cli/create-app.js (updated)
  - dist/cli/create-app.d.ts
  - dist/cli/index.js
  - dist/cli/index.d.ts
```

## Feature Checklist

- ✅ CLI commands accept `--config-path` flag
- ✅ `--config` alias works (same functionality)
- ✅ Environment variable `FACHADA_CONFIG` supported
- ✅ Sensible default: `./application.yaml`
- ✅ Error handling: contextual messages with helpful hints
- ✅ Load Site via `loadSiteFromFile()`
- ✅ Site object passed to command logic (not YAML string)
- ✅ Backward compatible (no breaking changes)
- ✅ Full type safety (TypeScript)
- ✅ Zero external dependencies (uses only fs, path)

## Usage Examples

### Basic Usage (No Config)

```bash
npx create-fachada-app
npx create-fachada-app my-portfolio
```

### With Explicit Config Path

```bash
npx create-fachada-app --config-path ./my-app.yaml
npx create-fachada-app --config ./my-app.yaml
```

### With Environment Variable

```bash
export FACHADA_CONFIG=./application.yaml
npx create-fachada-app

# Or inline
FACHADA_CONFIG=./app.yaml npx create-fachada-app
```

### Combined With Other Options

```bash
npx create-fachada-app --ci --config-path ./config.yaml --name my-app
```

### Output When Config Is Loaded

```
🚀 Initializing Fachada app...

📋 Loading Site config from ./app.yaml (flag)...
✓ Loaded Site: "My Portfolio" with 5 pages

...

✅ Fachada app "my-portfolio" initialized successfully!

📌 Loaded Site: "My Portfolio"
   Pages: landing, about, projects, blog, contact
```

## Resolution Priority (Highest to Lowest)

1. **Explicit Flag**: `--config-path ./my-config.yaml` or `--config ./my-config.yaml`
2. **Environment Variable**: `export FACHADA_CONFIG=./app.yaml`
3. **File Search**: Looks for `./application.yaml` in current directory
4. **Graceful Degradation**: If no config found, command continues without config (backward compatible)

## Error Handling

Each error scenario provides context-aware guidance:

### Config File Not Found (Flag)

```
Error: Config file not found at: /absolute/path/to/config.yaml
Provided via --config-path flag.
```

### Config File Not Found (Env Var)

```
Error: Config file not found at: /absolute/path/to/app.yaml
Resolved from FACHADA_CONFIG environment variable: "./app.yaml".
```

### Config File Not Found (Default)

```
Error: Config file not found at: /absolute/path/to/application.yaml

No config path provided. To specify a config file:
  1. Use --config-path flag: --config-path ./path/to/config.yaml
  2. Set environment variable: export FACHADA_CONFIG=./path/to/config.yaml
  3. Place config file at default location: ./application.yaml
```

## Design Decisions

1. **Optional Config Loading**: Made config optional in `create-app` to maintain backward compatibility
2. **Source Tracking**: Resolver returns source (`flag`/`env`/`default`) for debugging and info messages
3. **Helpful Errors**: Each error includes actionable guidance and context
4. **Reusable Utilities**: Exported from `src/cli/index.ts` for use by future CLI commands
5. **Type Safety**: Full TypeScript support with proper types for resolver options and results
6. **No External Dependencies**: Uses only built-in Node.js modules (fs, path)

## Pattern for Future CLI Commands

Future CLI commands can follow this pattern:

```typescript
import { resolveConfigPath } from "@fachada/core/cli";
import { loadSiteFromFile } from "@fachada/core";

// In command handler:
if (options.configPath) {
  const resolved = resolveConfigPath({
    configPath: options.configPath,
    cwd: process.cwd(),
  });

  const site = loadSiteFromFile(resolved.absolutePath);
  // Use site object in command logic
}
```

## Test Coverage

- ✅ 16 tests for config path resolver
- ✅ Priority resolution scenarios
- ✅ File validation
- ✅ Environment variable handling
- ✅ Error messaging
- ✅ Edge cases and boundaries
- ✅ 100% test pass rate

## Backward Compatibility

This implementation maintains full backward compatibility:

- Existing CLI commands work without any changes
- Config loading is completely optional
- Default behavior unchanged
- No breaking changes to existing interfaces

## Build Status

- ✅ TypeScript compilation successful for CLI modules
- ✅ JavaScript output validated
- ✅ No CLI-related errors or warnings
- ✅ All tests passing
- ✅ Ready for production use

---

**Implementation Date**: April 16, 2026
**Test Status**: All 16 tests passing
**Build Status**: Successfully compiled
**Backward Compatibility**: Maintained ✓
