/**
 * NavbarUtils — utilities for navbar configuration and CSS class generation
 *
 * Provides:
 * - Default navbar configuration with sensible defaults
 * - CSS class generation based on config
 * - Mobile breakpoint resolution
 * - ARIA attributes for accessibility
 */

import type { NavbarConfig } from "../types";

/**
 * Default navbar configuration.
 * All properties have sensible defaults for backward compatibility.
 */
const DEFAULTS: Required<
  Omit<NavbarConfig, "heroTransition" | "anchorLinks" | "backLabel">
> = {
  variant: "horizontal",
  mobileBreakpoint: "md",
  position: "sticky",
  hasMenu: true,
  menuTriggerLabel: "Menu",
  customClass: "",
  mobileMode: "hamburger",
};

/**
 * Tailwind breakpoint to pixel value mapping
 */
const BREAKPOINT_MAP: Record<
  Exclude<NavbarConfig["mobileBreakpoint"], number | undefined>,
  number
> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Get navbar configuration with defaults applied.
 *
 * Merges user-provided config with sensible defaults, ensuring
 * all properties have values. This enables backward compatibility
 * for apps that don't define navbar configuration.
 *
 * @param userConfig - User-provided navbar config (may be undefined or partial)
 * @returns Complete navbar config with defaults applied
 */
export function getNavbarConfig(
  userConfig?: NavbarConfig,
): Required<
  Omit<NavbarConfig, "heroTransition" | "anchorLinks" | "backLabel">
> &
  Pick<NavbarConfig, "heroTransition" | "anchorLinks" | "backLabel"> {
  return {
    ...DEFAULTS,
    ...userConfig,
  };
}

/**
 * Resolve mobile breakpoint to pixel value.
 *
 * Converts Tailwind breakpoint names to pixel values, or returns
 * numeric breakpoints unchanged.
 *
 * @param breakpoint - Breakpoint name or pixel value
 * @returns Pixel value for media query
 */
export function resolveMobileBreakpoint(
  breakpoint: NavbarConfig["mobileBreakpoint"],
): number {
  if (typeof breakpoint === "number") {
    return breakpoint;
  }
  if (!breakpoint) {
    return 768; // default to md if breakpoint is undefined
  }
  return BREAKPOINT_MAP[breakpoint] ?? 768; // default to md if unknown
}

/**
 * Generate CSS classes for navbar based on configuration.
 *
 * Produces Tailwind and custom classes that implement the layout,
 * positioning, and styling defined in the navbar config.
 *
 * @param config - Navbar configuration (must be complete with defaults)
 * @returns Space-separated string of CSS classes
 */
export function getNavbarClasses(config: Required<NavbarConfig>): string {
  const classes: string[] = [
    // Layout variant (semantic, defined in navbar.css)
    `navbar-${config.variant}`,

    // Flex direction utility class derived from variant
    config.variant === "horizontal"
      ? "flex-row"
      : config.variant === "vertical"
        ? "flex-col"
        : "",

    // Positioning (semantic, defined in navbar.css)
    `navbar-${config.position}`,

    // Mobile menu mode (semantic, can be styled in navbar.css)
    config.mobileMode === "hamburger" ? "has-hamburger-menu" : "",

    // Custom classes
    config.customClass,
  ];

  // Filter out empty strings and join
  return classes.filter(Boolean).join(" ");
}

/**
 * Generate ARIA attributes for mobile menu trigger button.
 *
 * Returns accessibility attributes (aria-label, aria-expanded, etc.)
 * for the hamburger menu button. Returns empty object if hasMenu=false.
 *
 * @param config - Navbar configuration (must be complete with defaults)
 * @returns Object with ARIA attributes
 */
export function getMobileMenuAttrs(
  config: Required<NavbarConfig>,
): Record<string, string | boolean> {
  if (!config.hasMenu) {
    return {};
  }

  return {
    "aria-label": config.menuTriggerLabel,
    "aria-expanded": "false",
    "data-hamburger-trigger": "true",
  };
}

/**
 * Generate CSS media query for mobile breakpoint.
 *
 * Creates a media query string that triggers at the configured
 * mobile breakpoint, useful for CSS-in-JS or style tag generation.
 *
 * @param config - Navbar configuration
 * @returns Media query string for mobile breakpoint
 */
export function getMobileMediaQuery(config: Required<NavbarConfig>): string {
  const pixels = resolveMobileBreakpoint(config.mobileBreakpoint);
  return `(max-width: ${pixels - 1}px)`;
}

/**
 * Generate inline style object for navbar based on config.
 *
 * Returns a style object that can be applied to the navbar element
 * or passed to Astro's style prop. Currently minimal as most styling
 * is CSS-based for performance.
 *
 * @param config - Navbar configuration
 * @returns Style object for navbar element
 */
export function getNavbarStyle(
  config: Required<NavbarConfig>,
): Record<string, string> {
  const breakpointPixels = resolveMobileBreakpoint(config.mobileBreakpoint);

  return {
    "--navbar-mobile-breakpoint": `${breakpointPixels}px`,
  };
}
