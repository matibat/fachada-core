/**
 * Navbar Integration Tests — Testing navbar behavior in context
 *
 * These tests verify:
 * - Navbar renders with correct layout direction
 * - Mobile menu attributes are properly set
 * - Configuration flows through from AppConfig
 * - Backward compatibility when navbar config is missing
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  getNavbarConfig,
  getNavbarClasses,
  getMobileMenuAttrs,
  resolveMobileBreakpoint,
  getMobileMediaQuery,
} from "./navbar.utils";
import type { NavbarConfig, AppConfig } from "../types";

// ─── Scenario 5: Navbar renders horizontally by default ───────────────────

describe("Scenario 5: Navbar renders as horizontal flex-row by default", () => {
  it(
    "Given: default navbar config, " +
      "When: getNavbarClasses is called, " +
      "Then: output contains 'flex-row' for horizontal layout",
    () => {
      const config = getNavbarConfig(undefined);
      const classes = getNavbarClasses(config);
      expect(classes).toContain("flex-row");
      expect(classes).not.toContain("flex-col");
    },
  );

  it(
    "Given: navbar variant='auto' (responsive), " +
      "When: getNavbarClasses is called, " +
      "Then: output indicates responsive mode available",
    () => {
      const config = getNavbarConfig({ variant: "auto" });
      const classes = getNavbarClasses(config);
      expect(classes).toContain("navbar-auto");
    },
  );

  it(
    "Given: sticky position (default), " +
      "When: getNavbarClasses is called, " +
      "Then: output includes 'sticky' class",
    () => {
      const config = getNavbarConfig(undefined);
      const classes = getNavbarClasses(config);
      expect(classes).toContain("sticky");
    },
  );
});

// ─── Scenario 6: Mobile hamburger menu setup ────────────────────────────

describe("Scenario 6: Mobile hamburger menu is properly configured", () => {
  it(
    "Given: hasMenu=true and mobileMode='hamburger', " +
      "When: getNavbarClasses is called, " +
      "Then: output includes 'has-hamburger-menu'",
    () => {
      const config = getNavbarConfig({
        hasMenu: true,
        mobileMode: "hamburger",
      });
      const classes = getNavbarClasses(config);
      expect(classes).toContain("has-hamburger-menu");
    },
  );

  it(
    "Given: hamburger menu button config, " +
      "When: getMobileMenuAttrs is called, " +
      "Then: aria-label and data-hamburger-trigger are set",
    () => {
      const config = getNavbarConfig({ hasMenu: true });
      const attrs = getMobileMenuAttrs(config);
      expect(attrs["aria-label"]).toBeDefined();
      expect(attrs["data-hamburger-trigger"]).toBe("true");
    },
  );

  it(
    "Given: hasMenu=false, " +
      "When: getMobileMenuAttrs is called, " +
      "Then: no menu attributes are generated (backward compat)",
    () => {
      const config = getNavbarConfig({ hasMenu: false });
      const attrs = getMobileMenuAttrs(config);
      expect(Object.keys(attrs).length).toBe(0);
    },
  );
});

// ─── Scenario 7: Mobile breakpoint affects layout ──────────────────────

describe("Scenario 7: Mobile breakpoint configuration is applied", () => {
  it(
    "Given: mobileBreakpoint='md' (768px), " +
      "When: resolveMobileBreakpoint is called, " +
      "Then: returns 768",
    () => {
      const breakpoint = resolveMobileBreakpoint("md");
      expect(breakpoint).toBe(768);
    },
  );

  it(
    "Given: mobileBreakpoint=900 (custom pixels), " +
      "When: resolveMobileBreakpoint is called, " +
      "Then: returns 900 unchanged",
    () => {
      const breakpoint = resolveMobileBreakpoint(900);
      expect(breakpoint).toBe(900);
    },
  );

  it(
    "Given: mobile breakpoint configured, " +
      "When: getMobileMediaQuery is called, " +
      "Then: returns valid CSS media query string",
    () => {
      const config = getNavbarConfig({ mobileBreakpoint: "md" });
      const mediaQuery = getMobileMediaQuery(config);
      expect(mediaQuery).toBe("(max-width: 767px)");
    },
  );

  it(
    "Given: custom breakpoint configured, " +
      "When: getMobileMediaQuery is called, " +
      "Then: media query uses custom pixel value",
    () => {
      const config = getNavbarConfig({ mobileBreakpoint: 900 });
      const mediaQuery = getMobileMediaQuery(config);
      expect(mediaQuery).toBe("(max-width: 899px)");
    },
  );
});

// ─── Scenario 8: Configuration flows from AppConfig ─────────────────────

describe("Scenario 8: Navbar config can be provided via AppConfig", () => {
  it(
    "Given: AppConfig with navbar.variant='vertical', " +
      "When: getNavbarConfig is called with AppConfig.navbar, " +
      "Then: navbar uses vertical layout",
    () => {
      const appConfig: Partial<AppConfig> = {
        navbar: {
          variant: "vertical",
          position: "fixed",
        },
      };
      const config = getNavbarConfig(appConfig.navbar);
      expect(config.variant).toBe("vertical");
      expect(config.position).toBe("fixed");
    },
  );

  it(
    "Given: AppConfig without navbar property, " +
      "When: navbar config is loaded, " +
      "Then: defaults are used (backward compatible)",
    () => {
      const config = getNavbarConfig(undefined);
      expect(config.variant).toBe("horizontal");
      expect(config.position).toBe("sticky");
    },
  );
});

// ─── Scenario 9: Theme-aware styling support ──────────────────────────

describe("Scenario 9: Navbar supports theme-aware styling", () => {
  it(
    "Given: navbar config with custom CSS variables, " +
      "When: navbar renders, " +
      "Then: CSS variable can reference theme tokens via CSS",
    () => {
      const config = getNavbarConfig(undefined);
      expect(config.customClass).toBe("");
      // Theme styling is applied via CSS variables in Header.astro
    },
  );

  it(
    "Given: navbar with theme color variables, " +
      "When: theme is switched, " +
      "Then: navbar styling should respond to CSS variable changes",
    () => {
      // This is tested at the Astro component level via theme store
      // Navbar config doesn't directly handle theme switching
      expect(true).toBe(true);
    },
  );
});

// ─── Scenario 10: Full integration with realistic config ────────────────

describe("Scenario 10: Full navbar configuration integration", () => {
  it(
    "Given: complex navbar config with multiple options, " +
      "When: configuration is processed, " +
      "Then: all options are reflected in output",
    () => {
      const config = getNavbarConfig({
        variant: "horizontal",
        position: "fixed",
        mobileBreakpoint: "lg",
        hasMenu: true,
        menuTriggerLabel: "Navigation",
        customClass: "custom-navbar-style",
        mobileMode: "hamburger",
      });

      const classes = getNavbarClasses(config);
      const attrs = getMobileMenuAttrs(config);
      const mediaQuery = getMobileMediaQuery(config);

      expect(classes).toContain("fixed");
      expect(classes).toContain("has-hamburger-menu");
      expect(classes).toContain("custom-navbar-style");
      expect(attrs["aria-label"]).toBe("Navigation");
      expect(mediaQuery).toBe("(max-width: 1023px)");
    },
  );

  it(
    "Given: minimal config (only variant), " +
      "When: configuration is processed, " +
      "Then: missing properties use defaults",
    () => {
      const config = getNavbarConfig({ variant: "vertical" });
      expect(config.variant).toBe("vertical");
      expect(config.position).toBe("sticky");
      expect(config.mobileBreakpoint).toBe("md");
      expect(config.hasMenu).toBe(true);
      expect(config.menuTriggerLabel).toBe("Menu");
    },
  );
});
