# Widget Registration Guide

WidgetRenderer is fully generic — no hardcoded widget imports. SectionsPage statically imports its widgets, builds a `WidgetComponentMap`, and passes it as a prop. WidgetRenderer looks up each enabled section by ID, renders the matching component, or emits a `console.warn` and skips it.

## Adding a New Widget (5 Steps)

**Step 1** — Create the component file:

```astro
<!-- src/astro/widgets/Portfolio.astro -->
---
interface Props { layout?: string; }
const { layout = "grid" } = Astro.props;
---
<section data-layout={layout}>...</section>
```

**Step 2** — Add a static import in `SectionsPage.astro`:

```astro
import Portfolio from "../widgets/Portfolio.astro";
```

**Step 3** — Add the key to `widgetComponents`:

```astro
const widgetComponents: WidgetComponentMap = {
  hero: Hero,
  portfolio: Portfolio,  // ← new entry
};
```

**Step 4** — Enable the section in `app.config.ts`:

```typescript
sections: [{ id: "portfolio", enabled: true, order: 5 }]
```

**Step 5** — Build. No changes to WidgetRenderer, `layout.types.ts`, or any CSS file.

## WidgetComponentMap Type

```typescript
import type { WidgetComponentMap } from "@fachada/core";
// Record<string, AstroComponentFactory>

const widgetComponents: WidgetComponentMap = { hero: Hero, about: About };
```

## Section Background Field

`PageSectionConfig.background` applies any CSS `background` value as an inline style on the section wrapper — no CSS file changes needed:

```typescript
sections: [
  {
    id: "hero",
    enabled: true,
    order: 1,
    background: "url(/images/hero.jpg) center/cover no-repeat",
  },
  {
    id: "about",
    enabled: true,
    order: 2,
    background: "#1A1410",
  },
]
```

When `background` is absent, no inline style is emitted.

## RoleExplorer Exception

`RoleExplorer` is a React island requiring `client:load`. This directive cannot be expressed as a component reference, so it is rendered outside `widgetComponents` as a named exception. Do not add `RoleExplorer` to the map.
