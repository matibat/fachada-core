# Scroll-Linked Shared Element Transition

A scroll-driven animation that transitions the brand element from the hero
section into the navbar as the user scrolls. The "Un Batista 🎩" title starts
large and centered in the hero, then fades into the navbar brand position as
the page scrolls — creating a seamless shared-element visual continuity.

---

## Overview

This feature is commonly called a **"shared element transition"** or a
**"scroll-linked shared element animation"**. In Fachada, it is implemented
as a configuration-driven behavior that:

1. Fades out the hero `<h1>` (source) as the user scrolls
2. Simultaneously fades in the navbar brand `<a>` (target)
3. Runs in continuous sync with scroll position (bidirectional)
4. Uses **CSS scroll-driven animations** as the primary path (zero JS per frame)
5. Falls back to a `requestAnimationFrame` listener on older browsers
6. Respects `prefers-reduced-motion`

---

## Configuration

Add a `navbar.heroTransition` block to your `application.yaml`:

```yaml
navbar:
  heroTransition:
    enabled: true
    startScroll: 0      # pixel offset where transition begins
    endScroll: 250      # pixel offset where transition completes
    easing: "ease-in-out"
```

All fields except `enabled` are optional and have sensible defaults.

| Field | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | — | Must be `true` to activate the transition |
| `startScroll` | `number` | `0` | Scroll position (px) where the animation begins |
| `endScroll` | `number` | `300` | Scroll position (px) where the animation completes |
| `easing` | `string` | `"ease"` | CSS easing function (keyword or `cubic-bezier(...)`) |

---

## TypeScript API

The `HeroNavbarTransitionConfig` type is exported from `@fachada/core`:

```typescript
import type { HeroNavbarTransitionConfig } from "@fachada/core";
```

```typescript
interface HeroNavbarTransitionConfig {
  enabled: boolean;
  startScroll?: number;
  endScroll?: number;
  easing?: string;
}
```

It is referenced as `NavbarConfig.heroTransition`:

```typescript
import type { NavbarConfig } from "@fachada/core";

const navbar: NavbarConfig = {
  heroTransition: {
    enabled: true,
    startScroll: 0,
    endScroll: 250,
    easing: "ease-in-out",
  },
};
```

---

## How It Works

### HTML Attributes

When `heroTransition.enabled` is `true`, Fachada automatically adds data
attributes to the relevant elements:

- `data-shared-hero-brand` — placed on the hero `<h1>` by `HeroCentered.astro`
  and `HeroSplit.astro`
- `data-shared-navbar-brand` — placed on the navbar brand `<a>` by `Header.astro`

The CSS targets these attributes, so no class names need to be managed manually.

### CSS Scroll-Driven Animations (Primary)

On browsers that support `animation-timeline: scroll()` (Chrome 115+,
Firefox 110+, Safari 18+), the animation is driven entirely by CSS:

- The `animation-range` is set from `--st-start` to `--st-end` (CSS custom
  properties published by `SharedElementTransition.astro` from your config)
- `animation-timeline: scroll(root block)` ties progress to the page scroll
  position
- `will-change: opacity, transform` enables GPU compositing for 60fps
- The `has-scroll-timeline` class is added to `<html>` so JS fallback rules
  are suppressed

### JS Fallback (rAF-based)

On browsers without scroll-driven animation support, a `scroll` event listener
fires at most once per animation frame via `requestAnimationFrame`. It toggles
`.shared-brand-visible` / `.shared-brand-hidden` CSS classes when scroll
progress crosses the 50% threshold. The CSS `transition` property on those
classes provides the smooth interpolation.

### Reduced Motion

The `@media (prefers-reduced-motion: reduce)` rule removes all animation and
sets both elements to their visible final states, ensuring the navbar brand is
always accessible.

---

## Files

| File | Role |
|---|---|
| `src/types/scroll-transition.types.ts` | `HeroNavbarTransitionConfig` value object |
| `src/types/navbar.types.ts` | `NavbarConfig.heroTransition` field |
| `src/scroll-transition/shared-element-transition.css` | CSS animation rules |
| `src/astro/components/SharedElementTransition.astro` | Orchestration component (CSS vars + fallback JS) |
| `src/astro/components/Header.astro` | Applies `data-shared-navbar-brand` |
| `src/astro/widgets/hero/HeroCentered.astro` | Applies `data-shared-hero-brand` |
| `src/astro/widgets/hero/HeroSplit.astro` | Applies `data-shared-hero-brand` |
| `src/astro/layouts/BaseLayout.astro` | Mounts `SharedElementTransition` when enabled |

---

## Compatibility

| Browser | Path |
|---|---|
| Chrome 115+ | CSS scroll-driven animations |
| Firefox 110+ | CSS scroll-driven animations |
| Safari 18+ | CSS scroll-driven animations |
| Older browsers | rAF-based JS fallback |
| `prefers-reduced-motion` | Static layout, both elements visible |
| JS disabled | Static layout (both default to visible) |

---

## Demo: unbati-app

`unbati-app` demonstrates the feature with the "Un Batista 🎩" brand:

```yaml
# unbati-app/application.yaml
navbar:
  heroTransition:
    enabled: true
    startScroll: 0
    endScroll: 250
    easing: "ease-in-out"
```

With this config, the large `<h1>Un Batista 🎩</h1>` in the centered hero fades
out with a slight scale-down as the user scrolls past the first 250px, while the
`navbar-brand` link simultaneously fades in — giving the impression that the
title has flowed up into the navbar.
