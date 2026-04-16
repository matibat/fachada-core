/**
 * profile.types — BDD type-acceptance tests
 *
 * These are compile-time assertions: if TypeScript accepts the object literals
 * without error, the type is correct. Runtime assertions confirm field access.
 *
 * Behavior covered:
 *   B1: PageSectionConfig accepts `background?: string` — field is optional
 *   B2: PageSectionConfig with background value exposes the value as a string
 */
import { describe, it, expect } from "vitest";
import type { PageSectionConfig } from "./index";

// ─── B1: background field is optional ────────────────────────────────────────

describe("B1: PageSectionConfig.background is an optional string field", () => {
  it("Given a PageSectionConfig without background, When TypeScript compiles, Then no type error occurs", () => {
    // Given / When — TypeScript accepts this literal; if the field were required
    // this file would not compile.
    const section: PageSectionConfig = {
      id: "hero",
      enabled: true,
      order: 1,
    };

    // Then — the field is absent (undefined) at runtime
    expect(section.background).toBeUndefined();
  });

  it("Given a PageSectionConfig with background: 'url(/img/hero.jpg)', When TypeScript compiles, Then the value is accepted as a string", () => {
    // Given / When
    const section: PageSectionConfig = {
      id: "hero",
      enabled: true,
      order: 1,
      background: "url(/img/hero.jpg)",
    };

    // Then
    expect(section.background).toBe("url(/img/hero.jpg)");
  });
});

// ─── B2: background value is accessible as string ────────────────────────────

describe("B2: PageSectionConfig.background value is accessible as a string", () => {
  it("Given a section with a CSS gradient background, When the value is read, Then it is a string matching the configured value", () => {
    // Given
    const bgValue =
      "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/img/hero.jpg) center/cover no-repeat";
    const section: PageSectionConfig = {
      id: "about",
      enabled: true,
      order: 2,
      background: bgValue,
    };

    // When
    const result: string | undefined = section.background;

    // Then
    expect(typeof result).toBe("string");
    expect(result).toBe(bgValue);
  });

  it("Given a section with a hex color background, When the value is read, Then it equals the hex string", () => {
    // Given
    const section: PageSectionConfig = {
      id: "contact",
      enabled: true,
      order: 5,
      background: "#1A1410",
    };

    // When / Then
    expect(section.background).toBe("#1A1410");
  });
});
