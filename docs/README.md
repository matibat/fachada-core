# @fachada/core Documentation

Complete guides for using and configuring the Fachada framework (TS declarative API).

## Configuration Guides

### [Widget Registration Guide](./widget-registration.md)

Generic widget system — bring your own imports, register in `widgetComponents`.

- **5-step guide** to add a new widget without touching WidgetRenderer
- **WidgetComponentMap** type with a usage example
- **Section background field** — apply any CSS background value via config
- **RoleExplorer exception** — React island handled outside the generic registry

**Read this if you want to:**

- Add a new widget to a Fachada app
- Understand the bring-your-own-imports pattern
- Set a per-section background image or color from config

### [Widget Layout Migration Guide](./widget-layout-migration.md)

Migrate from the v1 typed `WidgetLayoutConfig` interface to the v2 generic record.

- **Before/after** TypeScript snippets for `WidgetLayoutConfig`
- **Removed exports**: the 6 named layout union types
- **themeLayouts config**: no structural change required

**Read this if you:**

- Are upgrading from fachada-core v1 to v2
- See TypeScript errors after updating `WidgetLayoutConfig` imports

### [Skin & Theme System](./skin-system.md)

Token-driven theming that works for any skin — built-in or custom.

- **28 CSS custom properties** drive all layout and component styles
- **4 built-in skins**: minimalist, modern-tech, professional, vaporwave (light + dark each)
- **Zero extra CSS** for custom skins — define tokens in `app.config.ts` only
- **TypeScript-first skin configuration** for app-level customization
- **Component classes**: `.theme-card`, `.theme-btn-primary`, `.theme-btn-outline`, `.theme-badge`

**Read this if you want to:**

- Add or customize a skin
- Understand why all apps receive consistent structural styles
- Define a fully custom skin inline in your app config
- Add or customize skins in TS-driven app configuration

### [Navbar Configuration Guide](./navbar-configuration.md)

Learn how to customize navbar behavior and appearance per-app without modifying component code.

- **Seven configurable properties**: variant, mobileBreakpoint, position, hasMenu, menuTriggerLabel, customClass, mobileMode
- **Practical examples**: 5 complete configuration scenarios (default, mobile-only, fixed, sticky, theme-aware)
- **Theming integration**: Use the Fachada theme system to control navbar colors
- **Type-safe configuration**: Full TypeScript support with IntelliSense

**Read this if you want to:**

- Customize navbar layout or positioning per-app
- Support different mobile breakpoints
- Add custom navbar styling
- Understand navbar configuration options

### [Navbar Migration Guide](./navbar-migration-guide.md)

Adopt the navbar configuration system safely. No breaking changes; migration is opt-in.

- **Breaking-change migration notes**: TS-only config flow
- **Incremental migration checklist** for app teams

**Read this if you:**

- Have an existing Fachada app
- Want to customize your navbar
- Need migration guidance for TS-only config
- Are migrating from implicit to explicit configuration

## Type Definitions

Detailed type definitions are available in the source code:

- [AppConfig Interface](../src/types/app.types.ts) — Aggregate root configuration
- [NavbarConfig Interface](../src/types/navbar.types.ts) — Navbar-specific configuration with property docs
- [Profile Types](../src/types/profile.types.ts) — Presentation profile types
- [TS Config Migration](./YAML-CONFIG-GUIDE.md) — YAML removal and TS-only migration guide

## Quick Links

All **navbar configuration properties** with examples:

| Property           | Type                                              | Purpose              | Default        |
| ------------------ | ------------------------------------------------- | -------------------- | -------------- |
| `variant`          | `"horizontal" \| "vertical" \| "auto"`            | Layout direction     | `"horizontal"` |
| `mobileBreakpoint` | `"sm" \| "md" \| "lg" \| "xl" \| number`          | Mobile trigger point | `"md"`         |
| `position`         | `"sticky" \| "fixed" \| "static" \| "relative"`   | Positioning behavior | `"sticky"`     |
| `hasMenu`          | `boolean`                                         | Enable mobile menu   | `true`         |
| `menuTriggerLabel` | `string`                                          | Menu button label    | `"Menu"`       |
| `customClass`      | `string`                                          | Custom CSS classes   | `undefined`    |
| `mobileMode`       | `"hamburger" \| "collapse" \| "hide" \| "inline"` | Mobile display mode  | `"hamburger"`  |

## Getting Started

**Step 1:** Review your app's current navbar configuration

- Does it work as-is? → No changes needed
- Do you want to customize it? → Read the Configuration Guide

**Step 2:** (If customizing) Read the [Navbar Configuration Guide](./navbar-configuration.md)

- Understand each property with examples
- Choose your desired configuration
- Review the design patterns section

**Step 3:** Update your app's `app.config.ts`

```typescript
export const appConfig: AppConfig = {
  // ... other config
  navbar: {
    // Your custom configuration
  },
};
```

**Step 4:** Test and deploy

- Run `yarn dev` in your app
- Test on desktop and mobile
- Deploy with confidence (zero breaking changes)

## Reference

### Navbar Configuration Examples

| Use Case                       | Config                                          |
| ------------------------------ | ----------------------------------------------- |
| **Default (no customization)** | Omit `navbar` property → uses sensible defaults |
| **Mobile-only menu**           | `variant: "vertical"`, `mobileBreakpoint: "sm"` |
| **Fixed navigation**           | `position: "fixed"`, `mobileMode: "collapse"`   |
| **Sticky header**              | `position: "sticky"`, `variant: "horizontal"`   |
| **Theme-aware**                | Add `customClass: "my-theme-navbar"`            |

Full examples with rationale available in the [Configuration Guide](./navbar-configuration.md#configuration-examples).

### Theme System Integration

The navbar respects the Fachada theme system automatically:

- **CSS Variables**: `--bg-primary`, `--text-primary`, `--accent`, `--border`
- **Color Modes**: Light/dark mode switching implemented via `data-color-mode` attribute
- **Custom Styling**: Use `customClass` property to apply per-app navbar styling

See [Theme Configuration Guide](../../fachada-app/docs/THEME-CONFIGURATION.md) for full theme details.

## Utilities

Navbar utilities are exported from `@fachada/core`:

```typescript
import {
  getNavbarConfig, // Merge user config with defaults
  getNavbarClasses, // Generate CSS classes from config
  getMobileMenuAttrs, // Generate ARIA attributes for menu button
  getMobileMediaQuery, // Generate media query string for breakpoint
  resolveMobileBreakpoint, // Convert breakpoint name to pixels
} from "@fachada/core";
```

These utilities are used internally by components but are also available for custom implementations.

## FAQ

**Q: Do I have to update my app?**
A: No. All existing apps continue to work unchanged. Customization is opt-in.

**Q: How many apps are using the navbar system?**
A: All Fachada apps use the navbar system by default. With explicit configuration, you can now customize per-app behavior.

**Q: Can I customize just one property?**
A: Yes. Omitted properties use sensible defaults. You only need to specify properties you want to customize.

**Q: Is navbar configuration done per-app or globally?**
A: Per-app. Each app defines its own `navbar` configuration in `app.config.ts`.

**Q: How do I apply theme-aware navbar styling?**
A: Use the `customClass` property to add a class, then target it in CSS with theme CSS variables or `[data-color-mode]` selectors.

## Feedback & Issues

Found a problem or have suggestions? Check the main Fachada repository's issues.
