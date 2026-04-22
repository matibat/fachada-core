/**
 * scroll-transition.types — BDD type-acceptance tests
 *
 * Behavior covered:
 *   B1: HeroNavbarTransitionConfig.enabled is a required boolean
 *   B2: startScroll, endScroll, easing are optional number/string fields
 *   B3: targetAnchorSelector is optional string (defaults to "[data-shared-navbar-brand]")
 *   B4: targetAnchorMode is optional enum ('fixed' | 'scroll'), defaults to 'fixed'
 *   B5: Backward compatibility — existing configs without new fields work
 *   B6: New fields can be set and read correctly
 */
import { describe, it, expect } from "vitest";
import type { HeroNavbarTransitionConfig } from "./scroll-transition.types";

// ─── B1: enabled field is required ────────────────────────────────────────

describe("B1: HeroNavbarTransitionConfig.enabled is a required boolean field", () => {
  it("Given a config with enabled: true, When TypeScript compiles, Then the value is preserved", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
    };

    // Then
    expect(config.enabled).toBe(true);
  });

  it("Given a config with enabled: false, When TypeScript compiles, Then the value is preserved", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: false,
    };

    // Then
    expect(config.enabled).toBe(false);
  });
});

// ─── B2: startScroll, endScroll, easing are optional ────────────────────────

describe("B2: HeroNavbarTransitionConfig optional numeric and string fields", () => {
  it("Given a config without startScroll/endScroll/easing, When TypeScript compiles, Then no type error occurs", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
    };

    // Then
    expect(config.startScroll).toBeUndefined();
    expect(config.endScroll).toBeUndefined();
    expect(config.easing).toBeUndefined();
  });

  it("Given a config with all legacy fields, When TypeScript compiles, Then all values are accessible", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
      startScroll: 0,
      endScroll: 250,
      easing: "ease-in-out",
    };

    // Then
    expect(config.startScroll).toBe(0);
    expect(config.endScroll).toBe(250);
    expect(config.easing).toBe("ease-in-out");
  });
});

// ─── B3: targetAnchorSelector is optional string ────────────────────────────

describe("B3: HeroNavbarTransitionConfig.targetAnchorSelector is an optional string field", () => {
  it("Given a config without targetAnchorSelector, When TypeScript compiles, Then field is undefined", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
      endScroll: 250,
    };

    // Then
    expect(config.targetAnchorSelector).toBeUndefined();
  });

  it("Given a config with targetAnchorSelector: '.navbar-brand', When TypeScript compiles, Then value is preserved", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
      targetAnchorSelector: ".navbar-brand",
    };

    // Then
    expect(config.targetAnchorSelector).toBe(".navbar-brand");
  });

  it("Given a config with targetAnchorSelector: '[data-brand]', When TypeScript compiles, Then value is preserved", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
      targetAnchorSelector: "[data-brand]",
    };

    // Then
    expect(config.targetAnchorSelector).toBe("[data-brand]");
  });
});

// ─── B4: targetAnchorMode is optional enum ('fixed' | 'scroll') ──────────────

describe("B4: HeroNavbarTransitionConfig.targetAnchorMode is an optional enum field", () => {
  it("Given a config without targetAnchorMode, When TypeScript compiles, Then field is undefined", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
    };

    // Then
    expect(config.targetAnchorMode).toBeUndefined();
  });

  it("Given a config with targetAnchorMode: 'fixed', When TypeScript compiles, Then value is preserved", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
      targetAnchorMode: "fixed",
    };

    // Then
    expect(config.targetAnchorMode).toBe("fixed");
  });

  it("Given a config with targetAnchorMode: 'scroll', When TypeScript compiles, Then value is preserved", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
      targetAnchorMode: "scroll",
    };

    // Then
    expect(config.targetAnchorMode).toBe("scroll");
  });
});

// ─── B5: Backward compatibility — existing configs work ──────────────────────

describe("B5: Backward compatibility — existing configs without new fields work", () => {
  it("Given a pre-existing config (only enabled, startScroll, endScroll, easing), When used, Then it compiles and works", () => {
    // Given / When — legacy config structure
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
      startScroll: 0,
      endScroll: 250,
      easing: "ease-in-out",
    };

    // Then — new fields are absent but don't break the config
    expect(config.enabled).toBe(true);
    expect(config.targetAnchorSelector).toBeUndefined();
    expect(config.targetAnchorMode).toBeUndefined();
  });
});

// ─── B6: New fields can be set and read correctly ────────────────────────────

describe("B6: New fields targetAnchorSelector and targetAnchorMode can be set and read", () => {
  it("Given a full config with all fields including new ones, When all fields are read, Then all values are preserved", () => {
    // Given / When
    const config: HeroNavbarTransitionConfig = {
      enabled: true,
      startScroll: 0,
      endScroll: 250,
      easing: "ease-in-out",
      targetAnchorSelector: ".navbar-brand",
      targetAnchorMode: "fixed",
    };

    // Then
    expect(config.enabled).toBe(true);
    expect(config.startScroll).toBe(0);
    expect(config.endScroll).toBe(250);
    expect(config.easing).toBe("ease-in-out");
    expect(config.targetAnchorSelector).toBe(".navbar-brand");
    expect(config.targetAnchorMode).toBe("fixed");
  });
});
