# API Design Principles

This document explains the design philosophy behind Fachada's public API and why we made key choices like TypeScript-only configuration and declarative interfaces.

## 1. TypeScript-First, No JSON/YAML Fallback

**Principle:** Configuration should be code, not markup.

**Why?**

- **Type Safety:** Catch configuration errors at build time, not runtime. `site.title` is required; missing it is a compile error.
- **IDE Support:** Full autocomplete, rename refactoring, and inline documentation in vs-code.
- **Composability:** Reuse configs, extend them, fork them without string interpolation or layer merging.
- **Version Stability:** Breaking changes are typed and caught during `tsc` check, not discovered in production.

**What This Means:**

```typescript
// ✅ TypeScript: Type-safe, IDE-aware, composable
const { appConfig } = defineApp({
  identity: { site: { title: "My Site" } },
});

// ❌ Not supported: JSON/YAML config files
// config.json, config.yaml, environment variables for site structure
```

**Exception:** Environment variables ARE supported for secrets (API keys, deployment URLs), but not for app structure:

```typescript
// ✅ OK: env for secrets
const apiKey = process.env.ANALYTICS_KEY;

// ❌ Not OK: env for app structure
// const sections = JSON.parse(process.env.SECTIONS); // 🚫
```

---

## 2. Single Source of Truth: `defineApp()`

**Principle:** One function, one input type, one output.

**Why?**

- **No Magic:** What `defineApp()` returns is what you see; no hidden transformations or build-time plugins swallowing config.
- **Dependency Clarity:** Your `app.config.ts` imports real types and calls real validation; you own the dependencies.
- **Tooling Friendly:** Static analysis (linters, security scanners, bundler-plugins) can understand the entire flow.

**Design:**

```typescript
// Input: Declarative AppDefinition
interface AppDefinition {
  identity: { site: SiteIdentity };
  presentation?: PresentationConfig;
  composition?: CompositionSchema;
  theming?: ThemingConfig;
  gallery?: GallerySchema;
}

// Output: Normalized, validated AppConfig
interface AppConfig {
  seo: SEOMetadata;
  appIdentity: AppIdentity;
  pageStructure: PageStructure;
  themeTokens: TokenSet;
  // ... other normalized fields
}

// Function: Pure, synchronous, no side effects
const { appConfig, profileConfig } = defineApp(definition);
```

**Benefits:**

- `appConfig` is serializable (can be logged, copied, tested)
- No async I/O during config normalization
- Type errors occur during compilation, not at runtime

---

## 3. Interface Stability > Flexibility

**Principle:** We optimize for correctness over feature-completeness.

**Why?**

- **Long-Term Viability:** A portfolio needs to last 5–10 years. Fachada's types should too.
- **Minimal Breaking Changes:** If the defined types support your use case, you're stable forever. If not, we add new types but never remove old ones (within a major version).
- **Developer Trust:** You can bet on Fachada's API not changing weekly.

**Policy:**

- ✅ Additive changes: New optional fields in interfaces (non-breaking)
- ✅ New types: `SectionBlueprint`, `WidgetNode` added; old ones untouched
- ✅ Bug fixes: Validation narrowing (e.g., reject invalid URLs stricter)
- ❌ Removals: Field deletions only in major version bumps (v1.x → v2.0)
- ❌ Renames: Properties renamed only in major version bumps with deprecation warning

**Example:**

```typescript
// v1.0 → v1.5 (additive, safe):
interface AppDefinition {
  identity: { site: SiteIdentity };
  + gallery?: GallerySchema;  // New optional field
}

// v1.0 → v2.0 (breaking, documented):
interface AppDefinition {
  identity: { site: SiteIdentity }; // kept
  // - presentation: PresentationConfig;  // removed in v2
  display: DisplayConfig;  // renamed from presentation
}
```

---

## 4. Composition Over Configuration Options

**Principle:** Extend functionality by composing types, not by adding config flags.

**Why?**

- **Config Predictability:** `interface AppDefinition` is the complete contract. No "hidden flags" in framework code.
- **Reusability:** Custom `SectionBlueprint` or `WidgetNode` types can be imported and reused across projects.
- **Testability:** Each composed type is testable in isolation.

**Pattern:**

```typescript
// ❌ Bad: Flag-based extensibility
const { appConfig } = defineApp({
  identity: { site: { title: "My Site" } },
  enableCustomWidgets: true,  // what does this do?
  widgetRegistry: { ... },    // where do I pass this?
});

// ✅ Good: Type-based composition
const customWidgets: WidgetRegistry = {
  "my-card": { render: ..., schema: ... },
};

const { appConfig } = defineApp({
  identity: { site: { title: "My Site" } },
  composition: {
    widgetRegistry: customWidgets,  // types drive behavior
  },
});
```

---

## 5. Validation is Type-Driven

**Principle:** Most validation happens at compile time (TypeScript); runtime validation is thin.

**Why?**

- **Fast Feedback Loop:** Type errors are caught instantly during `tsc` check; you don't need to run the app.
- **Better Developer Experience:** IDE squiggles appear before you save; no "build succeeded but runtime broke."
- **Smaller Runtime Footprint:** Less validation logic shipped to CDN; types are stripped by bundler.

**Validation Layers:**

| Layer                         | Responsibility                                                    | Example                                                                  |
| ----------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Compile-Time (TypeScript)** | Interface compliance, required fields                             | `site.title: string` is required; missing it = TS error                  |
| **Build-Time (defineApp)**    | Schema validation, cross-field logic                              | `presentation.theme.style` must be one of [minimalist, modern-tech, ...] |
| **Runtime (Astro)**           | None (in happy path); only if user mutates config post-validation | Unchanged in production                                                  |

**Example:**

```typescript
// Compile-time check (TS):
const config: AppDefinition = {
  identity: { site: {} }, // ❌ TS error: missing title, url, ogImage
};

// Build-time check (defineApp):
const { appConfig } = defineApp({
  identity: { site: { title: "OK", url: "invalid", ogImage: "/x.png" } },
  // ❌ defineApp() throws: url must be valid URL format
});
```

---

## 6. Astro Integration is First-Class

**Principle:** Fachada is designed for Astro; assumptions are baked in.

**Why?**

- **Static-First Philosophy:** Portfolios don't need runtime rendering; static HTML is faster and cheaper to host.
- **Build-Time Rendering:** All config validation & transformation happens at build time (during `astro build`).
- **No Client-Side Config Overhead:** `appConfig` is pre-computed; JS payload is smaller.

**Implication:**

- Fachada is NOT a headless CMS (no runtime API endpoints for config)
- Fachada is NOT dynamically themed (themes are compiled; switching is a rebuild)
- Fachada IS optimized for static deployment (Vercel, Netlify, GitHub Pages)

---

## 7. Backward Compatibility Within Major Versions

**Principle:** v1.x releases are backward-compatible with dependencies; v2.x may not be.

**Why?**

- **Predictable Upgrades:** You can upgrade from v1.0 → v1.5 safely; from v1.x → v2.0 is intentional.
- **Security Updates:** v1.3 may patch a security issue in `TypeScript` dependency; you can update without config rewrites.
- **Long-Term Support:** If v1.x is your target, you can lock it and stay there indefinitely.

**Guarantee:**

```
v1.0 → v1.5: Your app.config.ts works unchanged
v1.5 → v2.0: Breaking changes documented; migration guide provided
```

---

## 8. Minimal Dependencies, Explicit Imports

**Principle:** Fachada avoids "magic" package resolution; all dependencies are explicit.

**Why?**

- **Transparency:** You know what you're getting; no hidden transitive dependencies.
- **Treeshaking:** Bundlers can eliminate unused code if imports are explicit.
- **Predictability:** Dependency tree is shallow; auditing for security is fast.

**Pattern:**

```typescript
// ✅ Explicit import
import { defineApp, type AppDefinition } from "@fachada/core";

// ❌ Not supported: implicit plugin discovery
// import "@fachada/plugins/analytics"; // 🚫 avoid magic registration
```

---

## FAQ: Design Decisions

**Q: Why no YAML config?**
A: YAML loses type information at parse time. You lose IDE autocomplete and catch errors at runtime instead of compile time. TypeScript is better for this.

**Q: Why no environment-variable-driven config?**
A: Env vars are for secrets (API keys), not app structure. Structure in env vars is fragile; version conflicts happen silently. Use TypeScript for structure.

**Q: Why is everything required in AppDefinition?**
A: Required fields force you to make deliberate choices. Optional fields can always be added later; required fields ensure a valid starting state.

**Q: Can I fork Fachada components?**
A: Yes! Fachada is open source. You can fork the theme system, widget registry, or entire framework. Our types are your types; modify as needed.

**Q: What if I need dynamic content (user uploads, real-time updates)?**
A: Fachada is for static portfolios. For real-time features, Fachada should be combined with edge functions (Netlify, Vercel) that fetch dynamic content at build/request time. The core `AppDefinition` remains static.

---

## Design Philosophy Summary

| Principle         | Choice                        | Benefit                                       |
| ----------------- | ----------------------------- | --------------------------------------------- |
| **Configuration** | TypeScript-only               | Type-safe, IDE-aware, composable              |
| **Normalization** | Single `defineApp()` function | No magic; explicit single source of truth     |
| **Stability**     | Interface > flexibility       | Long-term viability, minimal breaking changes |
| **Extensibility** | Type composition              | Testable, reusable, predictable               |
| **Validation**    | Compile-time first            | Fast feedback, better DX                      |
| **Integration**   | Astro-first                   | Static, fast, cost-effective hosting          |
| **Compatibility** | Backward-compat within major  | Predictable upgrade path                      |
| **Dependencies**  | Explicit imports              | Transparent, treeshakeable, auditable         |

These principles ensure Fachada remains a stable, understandable, and future-proof framework for your portfolio. 🎯
