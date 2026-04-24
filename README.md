# @fachada/core

The core of the Fachada framework — utilities, integrations and a TS-first declarative config API for Fachada apps.

**New to Fachada?** → **[Getting Started Guide](./docs/GETTING-STARTED.md)** (5 minutes)

**Want to learn the design philosophy?** → **[API Design Principles](./docs/API-DESIGN-PRINCIPLES.md)**

**Looking for patterns?** → **[Common Patterns Cookbook](./docs/COMMON-PATTERNS-COOKBOOK.md)**

**Full documentation** → **[Docs Index](./docs/README.md)**

---

## Installation

```bash
yarn add @fachada/core
```

## Usage

### Main Export

```typescript
import * as fachada from "@fachada/core";
```

### Astro Integration

```typescript
import fachada from "@fachada/core/astro";
```

### Astro Templates

```astro
import LandingPage from '@fachada/core/astro/templates/LandingPage.astro';
```

### Vite Plugin

```typescript
import fachadePlugin from "@fachada/core/vite";
```

## Development

### Prerequisites

- Node.js 18+
- Yarn package manager

### Build

Build the project using yarn:

```bash
yarn build
```

This compiles TypeScript to JavaScript and copies Astro templates to the dist directory.

### Testing

Run tests:

```bash
yarn test
```

Watch mode for development:

```bash
yarn test:watch
```

Generate coverage report:

```bash
yarn test:coverage
```

### Prepare Hook

The package includes a `prepare` hook that automatically runs the build when the package is installed:

```bash
yarn run build
```

This ensures the dist directory is always up-to-date.

### Syncing to consumer apps during development

When `@fachada/core` is consumed via `"file:../fachada-core"` in a sibling app's `package.json`, Yarn copies the package at install time — it does **not** create a live symlink. After running `yarn build` in `fachada-core`, you must also copy the updated `dist/` files into the consumer app's `node_modules`:

```bash
# From fachada-core — sync dist to a sibling consumer app (e.g. unbati-app)
cp -r dist/astro/components  ../unbati-app/node_modules/@fachada/core/dist/astro/
cp -r dist/astro/layouts     ../unbati-app/node_modules/@fachada/core/dist/astro/
cp -r dist/astro/templates   ../unbati-app/node_modules/@fachada/core/dist/astro/
cp -r dist/scroll-transition ../unbati-app/node_modules/@fachada/core/dist/
```

Then restart the consumer app's dev server so Astro picks up the new files.

> **Tip:** To use a true symlink instead, change the dependency to `"portal:../fachada-core"` in the consumer's `package.json` and re-run `yarn install`. Portal links update in real time without this copy step.

## Documentation

### Framework Configuration

- **[Widget Registration Guide](./docs/widget-registration.md)** — Add new widgets using the generic `WidgetComponentMap` pattern. Static imports, zero core changes.
- **[Widget Layout Migration Guide](./docs/widget-layout-migration.md)** — Migrate from the v1 typed `WidgetLayoutConfig` to the v2 generic `Record<string, string>`. Covers removed named layout union types.
- **[Navbar Configuration Guide](./docs/navbar-configuration.md)** — Customize navbar layout, positioning, mobile behavior, and styling per-app. Complete property reference with 5 practical examples.
- **[Navbar Migration Guide](./docs/navbar-migration-guide.md)** — Adopt the navbar configuration system for TS declarative app configs.

### Configuration References

- **[TS Config Guide](./docs/YAML-CONFIG-GUIDE.md)** — Breaking-change guide for TS-only declarative config
- **[AppConfig Interface](./src/types/app.types.ts)** — Aggregate root for application runtime config
- **[defineApp API](./src/config/defineApp.ts)** — Declarative domain-first authoring API
- **[NavbarConfig Interface](./src/types/navbar.types.ts)** — Full navbar configuration type definitions with JSDoc

## Exports

| Export                                | Description                           |
| ------------------------------------- | ------------------------------------- |
| `.`                                   | Main entry point with core utilities  |
| `./astro`                             | Astro framework integration           |
| `./astro/templates/LandingPage.astro` | Pre-built Astro landing page template |
| `./vite`                              | Vite plugin for Fachada               |

## Project Structure

- `src/astro/` — Astro integration, components, and templates
- `src/navbar/` — Navbar utilities and CSS
- `src/vite/` — Vite plugin
- `src/cli/` — Command-line interface for creating Fachada apps
- `src/utils/` — Utility functions
- `src/components/` — Reusable components
- `src/context/` — React context utilities
- `src/types/` — TypeScript type definitions
- `docs/` — Configuration and migration guides
- `src/stores/` — State management stores
- `src/theme/` — Theme configuration and utilities
- `src/widgets/` — Widget components

## License

GPL-3.0-or-later
