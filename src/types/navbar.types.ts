/**
 * NavbarConfig — Configuration for navbar behavior and appearance per-app.
 *
 * This interface enables configuration-driven navbar customization without code changes.
 * All properties are optional with sensible defaults to ensure backward compatibility —
 * apps without navbar configuration will continue to work unchanged.
 *
 * Design principles:
 * - Every property is optional (no breaking changes for existing apps)
 * - Defaults are documented inline for clarity
 * - Configuration is applied at build time via appConfig
 * - Supports both desktop and mobile-first layouts
 */
import type { HeroNavbarTransitionConfig } from "./scroll-transition.types";

/**
 * NavbarConfig — per-app navbar configuration options.
 *
 * @example
 * ```typescript
 * // In app.config.ts
 * export const appConfig: AppConfig = {
 *   navbar: {
 *     variant: "horizontal",
 *     mobileBreakpoint: "md",
 *     position: "sticky",
 *     hasMenu: true,
 *     menuTriggerLabel: "Menu",
 *     customClass: "my-navbar-style",
 *   },
 *   // ... other config
 * };
 * ```
 */
export interface NavbarConfig {
  /**
   * Navbar layout direction and orientation variant.
   *
   * @default "horizontal"
   * @values "horizontal" | "vertical" | "auto"
   *
   * - `horizontal`: Nav items display in a row (default flex-row layout)
   * - `vertical`: Nav items stack in a column (flex-column layout)
   * - `auto`: Desktop=horizontal, mobile=vertical (responsive default)
   */
  variant?: "horizontal" | "vertical" | "auto";

  /**
   * Screen breakpoint at which navbar switches to mobile mode.
   *
   * @default "md"
   * @values "sm" | "md" | "lg" | "xl" | number
   *
   * - `sm`: 640px (Tailwind breakpoint)
   * - `md`: 768px (Tailwind breakpoint)
   * - `lg`: 1024px (Tailwind breakpoint)
   * - `xl`: 1280px (Tailwind breakpoint)
   * - `number`: Custom pixel value (e.g., 900)
   *
   * Below this breakpoint, mobile navigation behavior takes effect (e.g., hamburger menu).
   */
  mobileBreakpoint?: "sm" | "md" | "lg" | "xl" | number;

  /**
   * Navbar positioning and viewport behavior.
   *
   * @default "sticky"
   * @values "sticky" | "fixed" | "static" | "relative"
   *
   * - `sticky`: Navbar sticks to top on scroll (standard scrolling navbar)
   * - `fixed`: Navbar remains fixed to top of viewport, content scrolls underneath
   * - `static`: Navbar scrolls away with content (normal document flow)
   * - `relative`: Navbar uses relative positioning within parent container
   */
  position?: "sticky" | "fixed" | "static" | "relative";

  /**
   * Whether to display a mobile navigation menu (hamburger/drawer).
   *
   * @default true
   * @values boolean
   *
   * - `true`: Show hamburger menu on mobile (below mobileBreakpoint)
   * - `false`: Hide navbar on mobile, no menu fallback
   *
   * When true, a menu trigger (hamburger button) will be rendered on mobile screens
   * that opens a navigation drawer or modal.
   */
  hasMenu?: boolean;

  /**
   * Accessible label text for the mobile menu trigger button.
   *
   * @default "Menu"
   * @values string
   *
   * Used as aria-label and accessible name for screen readers.
   * Example: "Navigation Menu", "Open Menu", "Toggle Navigation"
   *
   * Should be kept short (1-3 words) for accessibility and UX.
   */
  menuTriggerLabel?: string;

  /**
   * Custom CSS class names to apply to the navbar element.
   *
   * @default undefined (no custom classes)
   * @values string (space-separated class names)
   *
   * Allows per-app navbar styling without modifying the component.
   * Classes can override or extend default navbar styles.
   * Example: "my-custom-navbar dark-theme-navbar"
   *
   * These classes are applied to the `<header>` element directly.
   */
  customClass?: string;

  /**
   * Mobile navigation display mode when viewport is below mobileBreakpoint.
   *
   * @default "hamburger"
   * @values "hamburger" | "collapse" | "hide" | "inline"
   *
   * - `hamburger`: Show icon button that toggles nav drawer/modal on click
   * - `collapse`: Compress nav items into dropdown selector (space-efficient)
   * - `hide`: Hide nav completely on mobile (no fallback)
   * - `inline`: Keep nav items inline and wrap naturally (responsive)
   *
   * Only applies when hasMenu=true and viewport < mobileBreakpoint.
   */
  mobileMode?: "hamburger" | "collapse" | "hide" | "inline";

  /**
   * Scroll-linked hero-to-navbar brand transition configuration.
   *
   * When enabled, the hero brand element fades out as the user scrolls and the
   * navbar brand simultaneously fades in, creating a shared-element-like visual
   * continuity between the hero section and the navigation bar.
   *
   * Omit or set `enabled: false` to keep the default static layout.
   *
   * @default undefined (transition disabled)
   */
  heroTransition?: HeroNavbarTransitionConfig;

  /**
   * Anchor link items rendered in the navbar for single-page in-page navigation.
   *
   * @default undefined (no anchor links rendered)
   * @values Array of `{ label: string; href: string }` objects
   *
   * Each entry produces a navigation link pointing to an in-page anchor (`#section`).
   * Example: `[{ label: "Tatuajes", href: "#tatuajes" }, { label: "Contacto", href: "#contacto" }]`
   */
  anchorLinks?: { label: string; href: string }[];

  /**
   * Label for a back navigation link (e.g. "← Inicio").
   *
   * @default undefined (no back link rendered)
   * @values string
   *
   * When provided, a back navigation element is rendered in the navbar using this label.
   * Example: "← Inicio", "← Back", "← Home"
   */
  backLabel?: string;
}
