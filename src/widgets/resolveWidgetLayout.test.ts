/**
 * resolveWidgetLayout — BDD unit tests
 *
 * Covers resolution precedence:
 *   B1: themeLayouts entry for active theme + sectionId takes precedence over section.layout
 *   B2: falls back to section.layout when themeLayouts has no entry for the active theme
 *   B3: falls back to section.layout when themeLayouts is undefined
 */
import { describe, it, expect } from "vitest";
import { resolveWidgetLayout } from "./resolveWidgetLayout";

// ─── B1: themeLayouts takes precedence ───────────────────────────────────────

describe("B1: themeLayouts entry takes precedence over section.layout", () => {
  it("Given themeLayouts defines 'split' for minimal/hero, When activeTheme='minimal', Then 'split' is returned (not section.layout 'centered')", () => {
    // Given
    const themeLayouts = { minimal: { hero: "split" as const } };

    // When
    const result = resolveWidgetLayout(
      "hero",
      "centered",
      themeLayouts,
      "minimal",
    );

    // Then
    expect(result).toBe("split");
  });

  it("Given themeLayouts defines 'list' for warm/skills, When activeTheme='warm' and section.layout='grid-3', Then 'list' is returned", () => {
    // Given
    const themeLayouts = { warm: { skills: "list" as const } };

    // When
    const result = resolveWidgetLayout(
      "skills",
      "grid-3",
      themeLayouts,
      "warm",
    );

    // Then
    expect(result).toBe("list");
  });

  it("Given themeLayouts defines 'plain' for dark/about, When activeTheme='dark' and section.layout='card', Then 'plain' is returned", () => {
    // Given
    const themeLayouts = { dark: { about: "plain" as const } };

    // When
    const result = resolveWidgetLayout("about", "card", themeLayouts, "dark");

    // Then
    expect(result).toBe("plain");
  });
});

// ─── B2: falls back to section.layout when no matching theme entry ────────────

describe("B2: falls back to section.layout when no entry exists for the active theme", () => {
  it("Given themeLayouts only has 'minimal', When activeTheme='vaporwave', Then section.layout 'centered' is returned", () => {
    // Given
    const themeLayouts = { minimal: { hero: "split" as const } };

    // When
    const result = resolveWidgetLayout(
      "hero",
      "centered",
      themeLayouts,
      "vaporwave",
    );

    // Then
    expect(result).toBe("centered");
  });

  it("Given themeLayouts only has 'minimal', When activeTheme=undefined, Then section.layout 'card' is returned", () => {
    // Given
    const themeLayouts = { minimal: { about: "plain" as const } };

    // When
    const result = resolveWidgetLayout(
      "about",
      "card",
      themeLayouts,
      undefined,
    );

    // Then
    expect(result).toBe("card");
  });
});

// ─── B3: falls back when themeLayouts is undefined ────────────────────────────

describe("B3: falls back when themeLayouts is undefined", () => {
  it("Given themeLayouts is undefined, When any activeTheme, Then section.layout is returned", () => {
    // Given / When
    const result = resolveWidgetLayout(
      "hero",
      "centered",
      undefined,
      "minimal",
    );

    // Then
    expect(result).toBe("centered");
  });

  it("Given themeLayouts is undefined and section.layout is also undefined, Then undefined is returned", () => {
    // Given / When
    const result = resolveWidgetLayout("hero", undefined, undefined, "minimal");

    // Then
    expect(result).toBeUndefined();
  });

  it("Given themeLayouts is undefined and section.layout is undefined and activeTheme is undefined, Then undefined is returned", () => {
    // Given / When
    const result = resolveWidgetLayout("hero", undefined, undefined, undefined);

    // Then
    expect(result).toBeUndefined();
  });
});
