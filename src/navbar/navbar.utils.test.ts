/**
 * NavbarUtils — BDD unit tests for navbar configuration and rendering utilities
 *
 * Tests focus on:
 * - Loading navbar config with sensible defaults
 * - Merging user config with defaults
 * - Generating CSS classes based on config
 * - Mobile breakpoint resolution
 */

import { describe, it, expect } from "vitest";
import {
  getNavbarConfig,
  getNavbarClasses,
  resolveMobileBreakpoint,
  getMobileMenuAttrs,
} from "./navbar.utils";
import type { NavbarConfig } from "../types";

// ─── Scenario 1: Load navbar config with sensible defaults ──────────────────

describe("Scenario 1: getNavbarConfig provides sensible defaults", () => {
  it(
    "Given: no navbar config provided, " +
      "When: getNavbarConfig(undefined) is called, " +
      "Then: it returns horizontal layout, sticky position, md breakpoint",
    () => {
      const config = getNavbarConfig(undefined);
      expect(config.variant).toBe("horizontal");
      expect(config.position).toBe("sticky");
      expect(config.mobileBreakpoint).toBe("md");
      expect(config.hasMenu).toBe(true);
      expect(config.menuTriggerLabel).toBe("Menu");
    },
  );

  it(
    "Given: partial navbar config provided, " +
      "When: getNavbarConfig({variant: 'vertical'}) is called, " +
      "Then: it merges with defaults and returns complete config",
    () => {
      const config = getNavbarConfig({ variant: "vertical" });
      expect(config.variant).toBe("vertical");
      expect(config.position).toBe("sticky"); // default
      expect(config.mobileBreakpoint).toBe("md"); // default
    },
  );

  it(
    "Given: full navbar config provided, " +
      "When: getNavbarConfig(fullConfig) is called, " +
      "Then: it returns the provided config unchanged",
    () => {
      const input = {
        variant: "horizontal" as const,
        position: "fixed" as const,
        mobileBreakpoint: "lg" as const,
        hasMenu: false,
        menuTriggerLabel: "Nav",
        customClass: "my-navbar",
        mobileMode: "collapse" as const,
        appearance: {
          transparent: true,
          alpha: 0.01,
          removeBorder: true,
        },
      };
      const config = getNavbarConfig(input);
      expect(config).toEqual(input);
    },
  );
});

// ─── Scenario 2: Generate CSS classes from config ───────────────────────────

describe("Scenario 2: getNavbarClasses generates layout CSS classes", () => {
  it(
    "Given: navbar config with variant='horizontal', " +
      "When: getNavbarClasses(config) is called, " +
      "Then: it includes 'flex-row' and 'navbar-horizontal'",
    () => {
      const config = getNavbarConfig({ variant: "horizontal" });
      const classes = getNavbarClasses(config);
      expect(classes).toContain("flex-row");
      expect(classes).toContain("navbar-horizontal");
    },
  );

  it(
    "Given: navbar config with variant='vertical', " +
      "When: getNavbarClasses(config) is called, " +
      "Then: it includes 'flex-col' and 'navbar-vertical'",
    () => {
      const config = getNavbarConfig({ variant: "vertical" });
      const classes = getNavbarClasses(config);
      expect(classes).toContain("flex-col");
      expect(classes).toContain("navbar-vertical");
    },
  );

  it(
    "Given: navbar config with position='fixed', " +
      "When: getNavbarClasses(config) is called, " +
      "Then: it includes 'fixed' positioning class",
    () => {
      const config = getNavbarConfig({ position: "fixed" });
      const classes = getNavbarClasses(config);
      expect(classes).toContain("fixed");
    },
  );

  it(
    "Given: navbar config with customClass='my-class', " +
      "When: getNavbarClasses(config) is called, " +
      "Then: it includes the custom class",
    () => {
      const config = getNavbarConfig({ customClass: "my-class" });
      const classes = getNavbarClasses(config);
      expect(classes).toContain("my-class");
    },
  );

  it(
    "Given: navbar config with mobileMode='hamburger', " +
      "When: getNavbarClasses(config) is called, " +
      "Then: it includes 'has-hamburger-menu' class",
    () => {
      const config = getNavbarConfig({ mobileMode: "hamburger" });
      const classes = getNavbarClasses(config);
      expect(classes).toContain("has-hamburger-menu");
    },
  );
});

// ─── Scenario 3: Resolve mobile breakpoint to CSS value ────────────────────

describe("Scenario 3: resolveMobileBreakpoint resolves breakpoint names to pixel values", () => {
  it(
    "Given: mobileBreakpoint='sm', " +
      "When: resolveMobileBreakpoint('sm') is called, " +
      "Then: it returns 640 (Tailwind sm breakpoint)",
    () => {
      expect(resolveMobileBreakpoint("sm")).toBe(640);
    },
  );

  it(
    "Given: mobileBreakpoint='md', " +
      "When: resolveMobileBreakpoint('md') is called, " +
      "Then: it returns 768 (Tailwind md breakpoint)",
    () => {
      expect(resolveMobileBreakpoint("md")).toBe(768);
    },
  );

  it(
    "Given: mobileBreakpoint='lg', " +
      "When: resolveMobileBreakpoint('lg') is called, " +
      "Then: it returns 1024 (Tailwind lg breakpoint)",
    () => {
      expect(resolveMobileBreakpoint("lg")).toBe(1024);
    },
  );

  it(
    "Given: mobileBreakpoint='xl', " +
      "When: resolveMobileBreakpoint('xl') is called, " +
      "Then: it returns 1280 (Tailwind xl breakpoint)",
    () => {
      expect(resolveMobileBreakpoint("xl")).toBe(1280);
    },
  );

  it(
    "Given: mobileBreakpoint=900 (number), " +
      "When: resolveMobileBreakpoint(900) is called, " +
      "Then: it returns 900 unchanged",
    () => {
      expect(resolveMobileBreakpoint(900)).toBe(900);
    },
  );
});

// ─── Scenario 4: Generate mobile menu attributes ──────────────────────────

describe("Scenario 4: getMobileMenuAttrs generates ARIA attributes for accessibility", () => {
  it(
    "Given: navbar config with hasMenu=true and menuTriggerLabel='Menu', " +
      "When: getMobileMenuAttrs(config) is called, " +
      "Then: it returns aria-label and aria-expanded attributes",
    () => {
      const config = getNavbarConfig({
        hasMenu: true,
        menuTriggerLabel: "Menu",
      });
      const attrs = getMobileMenuAttrs(config);
      expect(attrs["aria-label"]).toBe("Menu");
      expect(attrs["aria-expanded"]).toBe("false");
      expect(attrs).toHaveProperty("data-hamburger-trigger");
    },
  );

  it(
    "Given: navbar config with hasMenu=false, " +
      "When: getMobileMenuAttrs(config) is called, " +
      "Then: it returns empty object (no menu)",
    () => {
      const config = getNavbarConfig({ hasMenu: false });
      const attrs = getMobileMenuAttrs(config);
      expect(attrs).toEqual({});
    },
  );

  it(
    "Given: navbar config with custom menuTriggerLabel='Navigation', " +
      "When: getMobileMenuAttrs(config) is called, " +
      "Then: aria-label is set to 'Navigation'",
    () => {
      const config = getNavbarConfig({
        hasMenu: true,
        menuTriggerLabel: "Navigation",
      });
      const attrs = getMobileMenuAttrs(config);
      expect(attrs["aria-label"]).toBe("Navigation");
    },
  );
});
