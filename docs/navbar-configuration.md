# Navbar Configuration Guide

## Overview

The Fachada framework provides a configuration-driven navbar system that lets you customize navigation behavior and appearance per app without modifying component code. All properties are optional with sensible defaults, ensuring backward compatibility with existing apps.

The navbar configuration is defined in your `AppConfig` through the `NavbarConfig` interface, applied at build time, and rendered by the `Header.astro` component.

## Quick Start

Add a `navbar` property to your `app.config.ts`:

```typescript
import type { AppConfig } from "@fachada/core";

export const appConfig: AppConfig = {
  seo: {
    /* ... */
  },
  theme: {
    /* ... */
  },
  navbar: {
    variant: "horizontal", // Layout direction
    mobileBreakpoint: "md", // Mobile trigger point (px or breakpoint name)
    position: "sticky", // Positioning behavior
    hasMenu: true, // Show mobile menu?
    menuTriggerLabel: "Menu", // Accessible label for menu button
    customClass: "", // Additional CSS classes
    mobileMode: "hamburger", // Mobile fallback mode
  },
  page: {
    /* ... */
  },
};
```

---

## NavbarConfig Properties

### 1. `variant`

**Type:** `"horizontal" | "vertical" | "auto"`

**Purpose:** Controls the navbar layout direction and orientation.

**Valid Values:**

- `"horizontal"`: Nav items display in a row (flex-row). Standard horizontal navigation bar. **Default.**
- `"vertical"`: Nav items stack in a column (flex-column). Sidebar or stacked layout.
- `"auto"`: Desktop displays horizontal layout; below mobile breakpoint, switches to vertical. Responsive default.

**Default Value:** `"horizontal"`

**Examples:**

```typescript
// Horizontal navbar (standard)
navbar: {
  variant: "horizontal";
}

// Vertical sidebar
navbar: {
  variant: "vertical";
}

// Responsive: horizontal on desktop, vertical on mobile
navbar: {
  variant: "auto";
}
```

**CSS Classes Applied:** `.navbar-horizontal`, `.navbar-vertical`, `.navbar-auto`

---

### 2. `mobileBreakpoint`

**Type:** `"sm" | "md" | "lg" | "xl" | number`

**Purpose:** Defines the screen width breakpoint at which the navbar switches to mobile mode (hamburger menu, collapse, etc.).

**Valid Values:**

- `"sm"`: 640px (Tailwind breakpoint)
- `"md"`: 768px (Tailwind breakpoint). **Default.**
- `"lg"`: 1024px (Tailwind breakpoint)
- `"xl"`: 1280px (Tailwind breakpoint)
- `number`: Custom pixel value (e.g., `900` for 900px)

**Default Value:** `"md"`

**Examples:**

```typescript
// Mobile mode at Tailwind sm breakpoint (640px)
navbar: {
  mobileBreakpoint: "sm";
}

// Mobile mode at Tailwind md breakpoint (768px) — DEFAULT
navbar: {
  mobileBreakpoint: "md";
}

// Mobile mode at custom 900px width
navbar: {
  mobileBreakpoint: 900;
}
```

**Note:** Below this breakpoint, the mobile navigation behavior activates (e.g., hamburger menu replaces nav items). Above it, full desktop navigation is shown.

---

### 3. `position`

**Type:** `"sticky" | "fixed" | "static" | "relative"`

**Purpose:** Controls how the navbar is positioned and behaves during page scrolling.

**Valid Values:**

- `"sticky"`: Navbar sticks to the top of the viewport as you scroll down. Content scrolls beneath it. **Default.**
- `"fixed"`: Navbar remains fixed at the top of the viewport at all times. Content scrolls underneath.
- `"static"`: Navbar scrolls away with the page content (normal document flow).
- `"relative"`: Navbar uses relative positioning within its parent container.

**Default Value:** `"sticky"`

**CSS Implications:**

```
sticky → position: sticky; top: 0; z-index: 50;
fixed  → position: fixed; top: 0; width: 100%; z-index: 50;
static → position: static;
relative → position: relative;
```

**Examples:**

```typescript
// Sticky navbar (standard, scrolls away then sticks at top)
navbar: {
  position: "sticky";
}

// Fixed navbar (always visible)
navbar: {
  position: "fixed";
}

// Static navbar (scrolls away completely)
navbar: {
  position: "static";
}
```

**Design Patterns:**

- **Sticky (default):** Best for most portfolio sites — navbar visible where needed, doesn't waste vertical space.
- **Fixed:** Use for navigation-heavy apps; navbar always accessible but reserves viewport real estate.
- **Static:** Minimal footer-like navigation or when navbar should not be always-accessible.
- **Relative:** Advanced: use when navbar is positioned within a specific container layout.

---

### 4. `hasMenu`

**Type:** `boolean`

**Purpose:** Controls whether a mobile navigation menu (hamburger/drawer) is displayed on mobile screens.

**Valid Values:**

- `true`: Show mobile menu trigger (hamburger button) below the mobile breakpoint. **Default.**
- `false`: Hide navbar on mobile; no menu fallback. Desktop-only navbar.

**Default Value:** `true`

**Examples:**

```typescript
// Show mobile menu (standard)
navbar: {
  hasMenu: true;
}

// Hide navbar on mobile (desktop-only)
navbar: {
  hasMenu: false;
}
```

**Behavior:**

- When `true` and viewport < `mobileBreakpoint`: Hamburger menu button appears; clicking it toggles nav drawer.
- When `false` and viewport < `mobileBreakpoint`: Navbar is hidden entirely (user must manually navigate desktop nav or use other navigation methods).

**Use Cases:**

- `true`: Mobile-friendly multi-role portfolio or standard business site.
- `false`: Desktop-optimized experiences; mobile users access alternative navigation (footer links, app drawer, etc.).

---

### 5. `menuTriggerLabel`

**Type:** `string`

**Purpose:** Provides an accessible, screen-reader-friendly label for the mobile menu trigger (hamburger button).

**Valid Values:** Any string (1-3 words recommended for accessibility and UX)

**Default Value:** `"Menu"`

**Examples:**

```typescript
navbar: {
  menuTriggerLabel: "Menu";
} // Default
navbar: {
  menuTriggerLabel: "Navigation";
} // Explicit
navbar: {
  menuTriggerLabel: "Toggle Menu";
} // Action-oriented
navbar: {
  menuTriggerLabel: "Abrir Menú";
} // Other language
```

**Accessibility:** This label is applied as the `aria-label` attribute on the hamburger button, making it accessible to screen readers. Example HTML:

```html
<button aria-label="Menu" data-hamburger-trigger="true">☰</button>
```

**Best Practice:** Keep labels short (1-3 words) for clarity and mobile UX.

---

### 6. `customClass`

**Type:** `string`

**Purpose:** Allows per-app navbar styling by applying custom CSS class names to the navbar element without modifying the component.

**Valid Values:** Space-separated CSS class names (as a string)

**Default Value:** `undefined` (no custom classes)

**Examples:**

```typescript
// Add a custom theme class
navbar: {
  customClass: "dark-theme-navbar";
}

// Multiple classes
navbar: {
  customClass: "dark-theme-navbar custom-padding";
}

// With Tailwind classes (if using Tailwind in your app)
navbar: {
  customClass: "bg-blue-900 text-white";
}
```

**Where Classes Are Applied:**
The classes are applied to the `<header class="navbar">` element. Example HTML:

```html
<header class="navbar dark-theme-navbar custom-padding">
  <!-- navbar content -->
</header>
```

**Use Cases:**

- Override default navbar colors via custom CSS
- Add theme-specific styling without code changes
- Apply per-app branding (custom border, shadow, background)

**Example CSS:**

```css
/* In your app's stylesheet */
.dark-theme-navbar {
  background-color: #1a1a1a;
  border-color: #333;
}

.dark-theme-navbar .navbar-brand {
  color: #fff;
}
```

---

### 7. `mobileMode`

**Type:** `"hamburger" | "collapse" | "hide" | "inline"`

**Purpose:** Defines how navigation is displayed on mobile (when viewport < `mobileBreakpoint`).

**Valid Values:**

- `"hamburger"`: Show icon button that toggles nav drawer/modal on click. **Default.**
- `"collapse"`: Compress nav items into a dropdown selector (space-efficient).
- `"hide"`: Hide nav completely on mobile (no fallback).
- `"inline"`: Keep nav items inline and allow natural wrapping on mobile (responsive flow).

**Default Value:** `"hamburger"`

**Behavior (Below Mobile Breakpoint):**

```
hamburger → Show hamburger icon; clicking toggles full nav drawer
collapse  → Nav items become a dropdown selector (<select> or custom component)
hide      → Nav items hidden; no alternative provided
inline    → Nav items remain visible but wrap naturally at smaller widths
```

**Examples:**

```typescript
// Hamburger menu (standard mobile)
navbar: {
  mobileMode: "hamburger";
}

// Dropdown selector (compact mobile)
navbar: {
  mobileMode: "collapse";
}

// Hide nav on mobile (footer or other navigation used)
navbar: {
  mobileMode: "hide";
}

// Inline wrapping (nav adapts to mobile width)
navbar: {
  mobileMode: "inline";
}
```

**Design Patterns:**
| `mobileMode` | Best For | Pros | Cons |
|---|---|---|---|
| **hamburger** | Most sites | Familiar UX; full visibility | Takes tap; drawer overlay |
| **collapse** | Mobile-first apps | Compact; minimal layout shift | Less discoverable |
| **hide** | Desktop-primary | Minimal; clean | Mobile users lose navbar |
| **inline** | Simple nav | No extra buttons; responsive | May wrap awkwardly |

---

## Configuration Examples

### Example 1: Default Configuration (No Custom Config)

```typescript
// apps/my-app/app.config.ts
import type { AppConfig } from "@fachada/core";
import { siteConfig } from "./site.config";
import { profileConfig } from "./profile.config";

export const appConfig: AppConfig = {
  seo: siteConfig,
  theme: profileConfig.theme,
  // navbar is omitted → uses all defaults
  page: {
    /* ... */
  },
};
```

**Result:**

- Horizontal navbar
- Sticky positioning (stays at top when scrolling)
- Mobile breakpoint at 768px (md)
- Hamburger menu on mobile
- Default "Menu" label
- No custom styling

---

### Example 2: Mobile-Only Menu (Vertical Navbar)

```typescript
// apps/mobile-first/app.config.ts
export const appConfig: AppConfig = {
  seo: siteConfig,
  theme: profileConfig.theme,
  navbar: {
    variant: "vertical", // Stack nav vertically
    mobileBreakpoint: "sm", // Mobile at 640px
    position: "sticky", // Stick to top
    hasMenu: true, // Show toggle button
    menuTriggerLabel: "Navigation",
    mobileMode: "hamburger", // Hamburger on mobile
  },
  page: {
    /* ... */
  },
};
```

**Result:**

- Vertical (sidebar-style) layout
- Hamburger menu below 640px
- Mobile-first UX with drawer navigation

---

### Example 3: Fixed Navigation with Dark Theme

```typescript
// apps/ai-saas/app.config.ts
export const appConfig: AppConfig = {
  seo: siteConfig,
  theme: profileConfig.theme,
  navbar: {
    variant: "horizontal", // Standard horizontal
    mobileBreakpoint: "md", // Desktop breakpoint
    position: "fixed", // Always visible at top
    hasMenu: true, // Mobile menu enabled
    menuTriggerLabel: "Menu",
    customClass: "dark-navbar", // Custom theme class
    mobileMode: "collapse", // Dropdown on mobile (compact)
  },
  page: {
    /* ... */
  },
};
```

**Result:**

- Fixed navbar always visible (reserves vertical space)
- Dropdown selector on mobile (compact UX)
- Dark theme styling applied
- Professional SaaS layout

---

### Example 4: Sticky Header with Horizontal Desktop Navigation

```typescript
// apps/portfolio/app.config.ts
export const appConfig: AppConfig = {
  seo: siteConfig,
  theme: profileConfig.theme,
  navbar: {
    variant: "horizontal", // Row layout
    mobileBreakpoint: "lg", // Desktop at 1024px
    position: "sticky", // Scroll with content initially
    hasMenu: true, // Mobile menu
    menuTriggerLabel: "Open Menu",
    customClass: "glass-effect", // Glassmorphic style
    mobileMode: "hamburger", // Drawer on mobile
  },
  page: {
    /* ... */
  },
};
```

**Result:**

- Sticky navbar that scrolls away, then sticks
- Mobile mode only below 1024px (tablet-friendly)
- Full desktop navigation visible
- Glassmorphic styling

---

### Example 5: Theme-Aware Customization

```typescript
// apps/artist-portfolio/app.config.ts
export const appConfig: AppConfig = {
  seo: siteConfig,
  theme: {
    style: "vaporwave",
    defaultMode: "dark",
    enableStyleSwitcher: true,
    enableModeToggle: true,
  },
  navbar: {
    variant: "auto", // Responsive horizontal/vertical
    mobileBreakpoint: "md", // 768px breakpoint
    position: "sticky",
    hasMenu: true,
    menuTriggerLabel: "Menu",
    customClass: "retro-navbar", // Vaporwave-specific styling
    mobileMode: "hamburger",
  },
  page: {
    /* ... */
  },
};
```

**Theme-Aware CSS:**

```css
/* In your app's navbar styles */
.retro-navbar {
  background: linear-gradient(135deg, #ff006e, #8338ec);
  backdrop-filter: blur(8px);
}

.retro-navbar .navbar-brand {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Dark mode context */
:global([data-color-mode="dark"]) .retro-navbar {
  background: linear-gradient(135deg, #00f5ff, #ff006e);
}
```

**Result:**

- Responsive layout (horizontal desktop, vertical mobile)
- Theme-aware styling that adapts to light/dark mode
- Vaporwave aesthetic with glassmorphic effects

---

## Theming the Navbar

The navbar respects the Fachada theme system automatically via CSS variables. All semantic colors (text, background, borders) are defined globally and applied to the navbar.

### CSS Variables Used

The navbar applies these theme CSS variables (see [Theme Configuration Guide](../THEME-CONFIGURATION.md) for full details):

```css
--bg-primary        /* Navbar background */
--text-primary      /* Navbar text */
--text-secondary    /* Nav item secondary text */
--accent            /* Active nav item color */
--border            /* Navbar bottom border */
```

### Example: Custom Theme Override

To customize navbar colors per-app without changing the theme globally:

```typescript
// apps/my-app/app.config.ts
navbar: {
  customClass: "custom-navbar-colors",
}
```

```css
/* src/styles/navbar.css (or in app stylesheet) */
:root {
  --navbar-bg: #f5f5f5;
  --navbar-text: #222;
}

.custom-navbar-colors {
  background-color: var(--navbar-bg);
  color: var(--navbar-text);
}

/* Dark mode override */
[data-color-mode="dark"] .custom-navbar-colors {
  --navbar-bg: #1a1a1a;
  --navbar-text: #fff;
}
```

---

## Usage in Components

The navbar configuration is consumed by the `Header.astro` component using utility functions:

```astro
---
import { getActiveAppConfig } from '@fachada/core';
import { getNavbarConfig, getNavbarClasses, getMobileMenuAttrs } from '@fachada/core';

const appConfig = getActiveAppConfig();
const navbarConfig = getNavbarConfig(appConfig.navbar);
const navbarClasses = getNavbarClasses(navbarConfig);
const menuAttrs = getMobileMenuAttrs(navbarConfig);
---

<header class="navbar" class:list={[navbarClasses]}>
  <!-- Navbar content -->
  {navbarConfig.hasMenu && (
    <button {...menuAttrs}>☰</button>
  )}
</header>
```

---

## Backward Compatibility

**No breaking changes.** Existing apps without a `navbar` property in `AppConfig` continue to work unchanged:

- Default configuration is applied automatically
- All navbar properties are optional
- Default values match the existing navbar behavior
- Existing CSS and HTML remain compatible

**Migration is opt-in:** Add a `navbar` property to `app.config.ts` only when you want to customize the default behavior.

---

## Best Practices

1. **Keep it simple:** Start with defaults. Customize only what you need.
2. **Test on mobile:** Always test your navbar configuration on actual mobile devices and different breakpoints.
3. **Accessibility:** Always provide a meaningful `menuTriggerLabel` for screen readers.
4. **Performance:** CSS classes are applied at build time; runtime performance is negligible.
5. **Consistency:** Use consistent `mobileBreakpoint` across your site for a unified UX.
6. **Dark mode:** Test custom colors in both light and dark modes using the theme system.
7. **Labels:** Keep `menuTriggerLabel` brief (1-3 words) for clarity and mobile display.

---

## TypeScript Support

Full TypeScript support is included:

```typescript
import type { NavbarConfig, AppConfig } from "@fachada/core";

// Type-safe navbar config
const navbar: NavbarConfig = {
  variant: "horizontal", // ✓ Valid
  mobileBreakpoint: "md", // ✓ Valid
  mobileMode: "hamburger", // ✓ Valid
  // mobileMode: "invalid",     // ✗ TypeScript error
};

// In AppConfig
const appConfig: AppConfig = {
  navbar, // ✓ Required type checking
  // ... other config
};
```

---

## Related Documentation

- [Theme Configuration Guide](../THEME-CONFIGURATION.md) — Learn how to customize colors and visual themes
- [App Configuration Reference](./app-config-reference.md) — Full AppConfig interface documentation
