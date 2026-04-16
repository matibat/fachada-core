# Widget Layout Migration Guide

This guide covers breaking changes to `WidgetLayoutConfig` and the removal of the 6 named layout union types.

## WidgetLayoutConfig — Before / After

**Before** (v1 — typed interface with named keys):

```typescript
// OLD — these types are no longer exported from @fachada/core
export type HeroLayout = "standard" | "split" | "minimal" | "centered";
export type AboutLayout = "standard" | "card" | "plain";
// ... SkillsLayout, ProjectsLayout, ContactLayout, GalleryLayout also removed

export interface WidgetLayoutConfig {
  hero?: HeroLayout;
  about?: AboutLayout;
  skills?: SkillsLayout;
  projects?: ProjectsLayout;
  contact?: ContactLayout;
  gallery?: GalleryLayout;
}
```

**After** (v2 — generic record):

```typescript
// NEW — any string key, any string value
export type WidgetLayoutConfig = Record<string, string>;
```

## themeLayouts Config — No Change Required

The shape of `themeLayouts` in `app.config.ts` is unchanged. Existing config continues to work:

```typescript
themeLayouts: {
  unbati: {
    hero: "centered",
    skills: "grid-3",
    about: "card",
  },
},
```

**One action may be needed:** if your code reads from a `WidgetLayoutConfig` value using dot notation, switch to bracket notation:

```typescript
// Before — TypeScript error with widened type
const layout = themeLayouts?.minimal.hero;

// After — use bracket notation
const layout = themeLayouts?.["minimal"]?.["hero"];
```

## Removed Exports

The following named types are **no longer exported** from `@fachada/core`:

- `HeroLayout`
- `AboutLayout`
- `SkillsLayout`
- `ProjectsLayout`
- `ContactLayout`
- `GalleryLayout`

If you referenced these in your app's TypeScript, replace with `string`. Widget-specific layout variants may still be declared as local types inside each widget component.

## Related Guides

- [Widget Registration Guide](./widget-registration.md) — how to add a new widget
- [Skin & Theme System](./skin-system.md) — visual theming tokens
