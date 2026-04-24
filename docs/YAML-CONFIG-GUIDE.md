# YAML Configuration Removed (Breaking Change)

As of this migration, Fachada no longer supports YAML as an app configuration API.

## What changed

- Removed: `application.yaml`, `site.yaml`, `profile.yaml` app authoring flow
- Removed: YAML loading from `vite-plugin-fachada`
- Required: TypeScript app config at one of these paths:
  - `app/app.config.ts`
  - `apps/<name>/app.config.ts`

## New authoring model

Use a single declarative TypeScript root config:

```ts
import { defineApp, type AppDefinition } from "@fachada/core";

const definition: AppDefinition = {
  identity: {
    site: {
      /* SiteConfig */
    },
  },
  presentation: {
    /* theme/about/skills/sections */
  },
  assets: { ogImage: "/og-image.png" },
};

export const { appConfig, profileConfig } = defineApp(definition);
```

## Migration checklist

1. Create `app/app.config.ts` (or `apps/<name>/app.config.ts`).
2. Move YAML values into the `AppDefinition` object.
3. Export `appConfig` and `profileConfig` from `defineApp(...)`.
4. Delete legacy YAML files.
5. Run tests and verify parity.

## Why

This removes split sources of truth, improves IntelliSense/type safety, and keeps one declarative API for all apps.
