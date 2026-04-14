# Navbar Migration Guide

## Overview

The Fachada navbar configuration system is **fully backward compatible**. Existing apps automatically work with sensible defaults. Migration is **opt-in** — you only need to update your config if you want to customize navbar behavior.

**Key Points:**

- ✅ No breaking changes
- ✅ Existing apps work unchanged
- ✅ Default configuration matches previous behavior
- ✅ TypeScript type safety for navbar properties
- ✅ Easy adoption path: add navbar config when ready

---

## What Changed?

### Before (Implicit Defaults)

Previously, the navbar had fixed default behavior:

```typescript
// apps/my-app/app.config.ts
export const appConfig: AppConfig = {
  seo: siteConfig,
  theme: profileConfig.theme,
  page: {
    /* ... */
  },
  // No navbar property → uses hardcoded defaults
};
```

**Hardcoded behavior:**

- Always horizontal layout
- Always sticky positioning
- Mobile breakpoint always at 768px (md)
- Mobile menu always enabled with "Menu" label
- No per-app customization possible

### After (Explicit Configuration)

Now, the navbar behavior is configurable, with the same defaults:

```typescript
export const appConfig: AppConfig = {
  seo: siteConfig,
  theme: profileConfig.theme,
  navbar: {
    // New! Explicit config with same defaults as before
    variant: "horizontal",
    position: "sticky",
    mobileBreakpoint: "md",
    hasMenu: true,
    menuTriggerLabel: "Menu",
    customClass: "",
    mobileMode: "hamburger",
  },
  page: {
    /* ... */
  },
};
```

---

## Migration Paths

### Path 1: No Changes Needed (Recommended for Most Apps)

If the current navbar behavior works for your app, **do nothing**. Your `AppConfig` continues to work exactly as before:

```typescript
// apps/my-app/app.config.ts — UNCHANGED
export const appConfig: AppConfig = {
  seo: siteConfig,
  theme: profileConfig.theme,
  page: {
    /* ... */
  },
  // Omit navbar property → defaults are applied automatically
};
```

**Result:** Your navbar works identically to before. No action required. ✅

---

### Path 2: Customize Navbar Behavior

When you want to customize navbar behavior (e.g., change mobile breakpoint or position), add the `navbar` property:

#### Step 1: Update `app.config.ts`

```typescript
import type { AppConfig } from "@fachada/core";

export const appConfig: AppConfig = {
  seo: siteConfig,
  theme: profileConfig.theme,
  navbar: {
    // Add your customizations here
    variant: "horizontal", // Keep or change
    mobileBreakpoint: "lg", // ← Custom: was "md", now "lg"
    position: "sticky", // Keep or change
    hasMenu: true, // Keep or change
    menuTriggerLabel: "Menu", // Keep or change
    customClass: "", // Keep or change
    mobileMode: "hamburger", // Keep or change
  },
  page: {
    /* ... */
  },
};
```

#### Step 2: (Optional) Add Custom Navbar Styling

If using `customClass`, create a CSS file for your app:

```css
/* apps/my-app/src/styles/navbar.css */
.my-custom-navbar {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.my-custom-navbar .navbar-brand {
  font-weight: bold;
  letter-spacing: 1px;
}
```

Import it in your layout:

```astro
// apps/my-app/src/layouts/BaseLayout.astro
import '../styles/navbar.css';
```

#### Step 3: Test

- Run `yarn dev` to verify navbar looks correct
- Test on mobile and desktop at your target breakpoints
- Verify accessibility with screen readers

---

### Path 3: Adopt Best Practices Incrementally

You don't need to add all navbar config properties at once. Start with one or two customizations:

#### Stage 1: Test Alternative Mobile Breakpoint

```typescript
navbar: {
  mobileBreakpoint: "lg",  // Change breakpoint only
  // Other properties use defaults
}
```

#### Stage 2: Add Custom Styling

```typescript
navbar: {
  mobileBreakpoint: "lg",
  customClass: "my-app-navbar",  // Add styling
}
```

#### Stage 3: Fine-Tune Other Properties

```typescript
navbar: {
  mobileBreakpoint: "lg",
  customClass: "my-app-navbar",
  position: "fixed",             // Try fixed positioning
  mobileMode: "collapse",        // Try dropdown on mobile
}
```

---

## Default Configuration

When `navbar` is omitted or properties are undefined, these defaults apply:

| Property           | Default Value  | Description                             |
| ------------------ | -------------- | --------------------------------------- |
| `variant`          | `"horizontal"` | Row layout (standard horizontal navbar) |
| `mobileBreakpoint` | `"md"`         | 768px — Tailwind medium breakpoint      |
| `position`         | `"sticky"`     | Sticks to top on scroll                 |
| `hasMenu`          | `true`         | Show mobile menu                        |
| `menuTriggerLabel` | `"Menu"`       | Hamburger button label                  |
| `customClass`      | `undefined`    | No custom classes                       |
| `mobileMode`       | `"hamburger"`  | Hamburger menu on mobile                |

These defaults maintain existing navbar behavior, ensuring backward compatibility.

---

## Complete Migration Checklist

Use this checklist when migrating your app's navbar configuration:

- [ ] **Assess Current Behavior**: Does your existing navbar work as expected?
  - [ ] Yes → Skip to "No Changes Needed" section (Path 1)
  - [ ] No, needs changes → Continue with Path 2 or 3

- [ ] **Review NavbarConfig Properties**: Read [Navbar Configuration Guide](navbar-configuration.md) to understand each property

- [ ] **Identify Desired Changes**: Which properties need customization?
  - [ ] Layout (horizontal, vertical, auto)
  - [ ] Mobile breakpoint
  - [ ] Positioning (sticky, fixed, static)
  - [ ] Mobile menu visibility
  - [ ] Menu button label
  - [ ] Custom styling
  - [ ] Mobile display mode

- [ ] **Add navbar Property to app.config.ts**:

  ```typescript
  navbar: {
    // Your custom values
  }
  ```

- [ ] **Update CSS (if using customClass)**:

  ```css
  .my-custom-navbar {
    /* Your styles */
  }
  ```

- [ ] **Test on Multiple Devices**:
  - [ ] Desktop at breakpoint and above
  - [ ] Tablet at mobile breakpoint
  - [ ] Mobile below breakpoint
  - [ ] All color modes (light/dark)

- [ ] **Verify Accessibility**:
  - [ ] Menu button has accessible label
  - [ ] Keyboard navigation works
  - [ ] Screen reader announces navbar elements

- [ ] **Deploy**: Merge and deploy to production

---

## Breaking Changes

**None.** The navbar system has **zero breaking changes**:

1. **Apps without navbar config work unchanged** — default configuration is applied automatically
2. **TypeScript types are backward compatible** — `navbar?: NavbarConfig` is optional
3. **CSS class names are the same** — `.navbar`, `.navbar-horizontal`, etc. — existing styles remain valid
4. **HTML structure unchanged** — existing selectors and event listeners still work
5. **Default behavior matches previous implementation** — existing apps render identically

---

## FAQ

### Q: Do I have to update my app's navbar config?

**A:** No. Your existing `AppConfig` continues to work without changes. The navbar property is optional. Only update if you want to customize behavior.

### Q: Will my existing navbar styling break?

**A:** No. CSS class names and default styling are unchanged. If you've added custom CSS targeting `.navbar` or `.navbar-horizontal`, those still work.

### Q: Can I adopt the navbar config gradually?

**A:** Yes. Start with defaults, add one property when ready, and fine-tune incrementally. No need to commit to a full config upfront.

### Q: What if I only want to change the mobile menu label?

**A:** Just set that property:

```typescript
navbar: {
  menuTriggerLabel: "Navigation",
  // Other properties use defaults
}
```

No need to specify all properties.

### Q: How do I test navbar changes before deploying?

**A:** Use `yarn dev` for local development:

```bash
cd apps/my-app
yarn dev
```

Then test at different viewport widths (DevTools → Responsive Design Mode) and on real mobile devices.

### Q: Can I use the same navbar config across multiple apps?

**A:** Yes. Create a shared config object and import it:

```typescript
// shared/navbar.config.ts
export const sharedNavbarConfig = {
  mobileBreakpoint: "lg",
  position: "sticky",
};

// apps/app1/app.config.ts
import { sharedNavbarConfig } from "../../shared/navbar.config";
export const appConfig = {
  navbar: sharedNavbarConfig,
  // ... rest of config
};
```

### Q: How do I debug navbar configuration issues?

**A:** Check browser DevTools:

1. **Inspect element**: Right-click navbar → Inspect Element
2. **Check classes**: Verify expected CSS classes are present (e.g., `.navbar-horizontal`, `.sticky`)
3. **Check styles**: Confirm theme CSS variables are set (`--text-primary`, `--accent`, etc.)
4. **Console errors**: Check browser console for TypeScript or runtime errors
5. **Mobile breakpoint**: Use DevTools responsive mode to test breakpoint switching

---

## TypeScript Type Checking

The navbar property has full TypeScript support:

```typescript
import type { NavbarConfig, AppConfig } from "@fachada/core";

const navbar: NavbarConfig = {
  variant: "horizontal", // ✓ Valid
  mobileBreakpoint: "md", // ✓ Valid
  position: "sticky", // ✓ Valid
  hasMenu: true, // ✓ Valid string
  menuTriggerLabel: "Menu", // ✓ Valid
  customClass: "my-navbar", // ✓ Valid
  mobileMode: "hamburger", // ✓ Valid
  // variant: "invalid",        // ✗ TypeScript error
};

export const appConfig: AppConfig = {
  navbar, // ✓ Type-safe
  // ... other properties
};
```

TypeScript catches invalid property values at development time.

---

## Next Steps

1. **Review your current app config**: Do you need navbar customization?
2. **Read the full guide**: See [Navbar Configuration Guide](navbar-configuration.md) for property details and examples
3. **Add navbar config (optional)**: If needed, update your `app.config.ts` with custom values
4. **Test**: Run `yarn dev` and verify behavior on desktop and mobile
5. **Deploy**: No special steps — standard build and deployment workflow

---

## Support

For questions or issues:

1. Check [Navbar Configuration Guide](navbar-configuration.md) for property documentation
2. Review examples in the guides
3. Open an issue with details about your configuration and expected behavior

---

## Related Documentation

- [Navbar Configuration Guide](navbar-configuration.md) — Full property documentation with examples
- [Theme Configuration Guide](../../fachada-app/docs/THEME-CONFIGURATION.md) — Customize navbar colors and appearance
- [App Configuration Reference](./app-config-reference.md) — Full AppConfig interface
