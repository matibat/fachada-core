# @fachada/core

The core of the Fachada framework — utilities, integrations and CLI to bootstrap Fachada apps.

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

## Documentation

### Framework Configuration

- **[Widget Registration Guide](./docs/widget-registration.md)** — Add new widgets using the generic `WidgetComponentMap` pattern. Static imports, zero core changes.
- **[Widget Layout Migration Guide](./docs/widget-layout-migration.md)** — Migrate from the v1 typed `WidgetLayoutConfig` to the v2 generic `Record<string, string>`. Covers removed named layout union types.
- **[Navbar Configuration Guide](./docs/navbar-configuration.md)** — Customize navbar layout, positioning, mobile behavior, and styling per-app. Complete property reference with 5 practical examples.
- **[Navbar Migration Guide](./docs/navbar-migration-guide.md)** — Adopt the navbar configuration system. Zero breaking changes; migration is opt-in. Backward compatibility guaranteed.

### Configuration References

- **[AppConfig Interface](./src/types/app.types.ts)** — Aggregate root for application configuration (types only)
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
