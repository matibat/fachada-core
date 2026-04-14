# Skin & Theme System

The Fachada skin system provides **token-driven theming** via CSS custom properties. All structural styles in `globals.css` use design tokens, so any skin — built-in or custom — automatically receives consistent layout and component styles.

## How It Works

1. **YAML definitions** in `src/skin/defaults/themes/` declare design tokens for each built-in skin
2. **Code generation** (`scripts/generate-themes.mjs`) converts YAML → `src/skin/defaults/index.ts` at build time
3. **BaseLayout.astro** applies the active skin's tokens as inline CSS custom properties (prevents FOUC)
4. **globals.css** uses those CSS vars for all structural rules — no `[data-theme="xxx"]` selectors

This means **any skin works out of the box**. Custom skins defined in `app.config.ts` are fully supported with no extra CSS needed.

## Built-in Skins

| Skin | Key | Description |
|------|-----|-------------|
| Minimalist | `minimalist` | Clean, typographic, light default |
| Modern Tech | `modern-tech` | Dark, high-contrast, monospace accents |
| Professional | `professional` | Balanced, business-appropriate |
| Vaporwave | `vaporwave` | Bold gradients, retro-futurist palette |

Each skin has both **light** and **dark** token sets.

## Design Tokens (28 CSS Custom Properties)

| Token | CSS Property | Purpose |
|-------|-------------|---------|
| `bgPrimary` | `--bg-primary` | Main background |
| `bgSecondary` | `--bg-secondary` | Card / section background |
| `textPrimary` | `--text-primary` | Body text |
| `textSecondary` | `--text-secondary` | Muted / secondary text |
| `accent` | `--accent` | Primary brand color |
| `accentHover` | `--accent-hover` | Accent on hover |
| `accentSecondary` | `--accent-secondary` | Secondary brand color (nullable) |
| `accentTertiary` | `--accent-tertiary` | Tertiary brand color (nullable) |
| `border` | `--border` | Border / divider color |
| `shadow` | `--shadow` | Box shadow value |
| `fontBody` | `--font-body` | Body font stack |
| `fontHeading` | `--font-heading` | Heading font stack |
| `fontMono` | `--font-mono` | Monospace font stack |
| `headingWeight` | `--heading-weight` | Heading font weight |
| `headingLetterSpacing` | `--heading-letter-spacing` | Heading letter spacing |
| `bodyLineHeight` | `--body-line-height` | Body line height |
| `borderRadius` | `--border-radius` | Component border radius |
| `transition` | `--transition` | CSS transition shorthand |
| `contentMaxWidth` | `--content-max-width` | `<main>` max width |
| `spacingSection` | `--spacing-section` | `<section>` vertical padding |
| `spacingCard` | `--spacing-card` | Card internal padding |
| `buttonTextColor` | `--button-text-color` | Text on filled buttons |

## Shared Component Classes

`globals.css` provides these reusable classes that work with any skin:

```css
.theme-card       /* Card container — bg-secondary, border, border-radius, padding */
.theme-btn-primary  /* Filled button — accent background */
.theme-btn-outline  /* Ghost button — transparent with border */
.theme-badge        /* Pill badge — bg-secondary with border */
```

## Configuring a Skin in Your App

In your app's `app.config.ts`:

```typescript
import type { AppConfig } from "@fachada/core";

export const appConfig: AppConfig = {
  themes: {
    default: "minimalist",   // one of the 4 built-in keys, or your custom key
    defaultMode: "light",    // "light" | "dark"
    // optional: define a custom skin
    custom: {
      myBrand: {
        light: {
          bgPrimary: "#ffffff",
          bgSecondary: "#f8f8f8",
          textPrimary: "#111111",
          textSecondary: "#555555",
          accent: "#e63946",
          accentHover: "#c62a35",
          accentSecondary: null,
          accentTertiary: null,
          border: "#e0e0e0",
          shadow: "0 2px 8px rgba(0,0,0,0.08)",
          fontBody: "Inter, system-ui, sans-serif",
          fontHeading: "Inter, system-ui, sans-serif",
          fontMono: "JetBrains Mono, monospace",
          headingWeight: "700",
          headingLetterSpacing: "-0.02em",
          bodyLineHeight: "1.7",
          borderRadius: "8px",
          transition: "0.2s ease",
          contentMaxWidth: "1100px",
          spacingSection: "6rem",
          spacingCard: "1.5rem",
          buttonTextColor: "#ffffff",
        },
        dark: {
          // ... dark mode tokens
        },
      },
    },
  },
};
```

Then set `default: "myBrand"` and the skin is fully applied — no CSS files to write.

## Adding a New Built-in Skin

1. Create `src/skin/defaults/themes/<your-skin-name>.yml` following the existing YAML schema
2. Run `node scripts/generate-themes.mjs` (or `yarn build` which runs it automatically)
3. The skin is now available in `DEFAULT_SKINS` and exported by `@fachada/core`
4. Reference it by key in any app's `app.config.ts`

## Local Development Setup

Both fachada-app and fachada-unbati use `link:../fachada-core` so changes to fachada-core propagate immediately after rebuilding core:

```bash
# After changing fachada-core:
cd fachada-core && yarn build

# Apps pick up the changes automatically (no reinstall needed)
cd fachada-app && yarn dev
```

## Testing

The skin system is covered by BDD tests in `src/skin/skin.test.ts`:

- Built-in skins load correctly from YAML-generated source
- Each skin has complete light and dark token sets (all 25 structural tokens)
- `CSS_VAR_MAP` maps every `ThemeTokens` key (no missing entries, no duplicates)
- Custom skins (e.g. unbati) satisfy the `ThemeDefinition` shape
