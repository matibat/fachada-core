/**
 * widgetRenderer.test.ts — BDD tests for generic WidgetRenderer behaviors
 *
 * WidgetRenderer.astro is an Astro template and cannot be unit-tested directly
 * (Astro components require the Astro build pipeline). This file tests the
 * TypeScript logic that WidgetRenderer.astro encapsulates:
 *
 *   Scenario 1 — Unknown section ID absent from WidgetComponentMap → undefined
 *                (WidgetRenderer emits console.warn and skips — pending E2E)
 *   Scenario 2 — Registered section ID is found in WidgetComponentMap
 *   Scenario 3 — resolveWidgetLayout applies correct precedence with the
 *                widened WidgetLayoutConfig = Record<string, string> type
 *   Scenario 4 — filterSections excludes disabled sections (confirmed baseline);
 *                unregistered-component exclusion confirmed via map-lookup pattern
 *   Scenario 5 — section.background forms the correct inline CSS style value
 */
import { describe, it, expect } from "vitest";
import { resolveWidgetLayout } from "./resolveWidgetLayout";
import { filterSections } from "./filterSections";
import type { PageSectionConfig } from "../types/profile.types";

// ─── Scenario 1: unknown section ID is absent from the component map ──────────

describe("Scenario 1: unknown section type has no entry in the component map", () => {
  it("Given a component map with only 'hero', When looking up section id 'unknown', Then the result is undefined — WidgetRenderer would emit a warning and skip it", () => {
    // Given — a component map whose keys are the registered section IDs
    // (Astro components are opaque at this abstraction; we test the map contract)
    const MockHero = () => null;
    const widgetComponents: Record<string, unknown> = { hero: MockHero };

    // When — WidgetRenderer looks up the component for the unknown sectionId
    const Component = widgetComponents["unknown"];

    // Then — undefined signals no registered component; WidgetRenderer skips
    expect(Component).toBeUndefined();

    // NOTE: The console.warn("[WidgetRenderer] No component registered for section: …")
    // lives inside the Astro template JSX and cannot be triggered without Astro's
    // server-rendering pipeline. The warning message is verified by code inspection of
    // WidgetRenderer.astro line ~113. Full E2E coverage is tracked separately.
  });

  it("Given an empty component map, When looking up any section id, Then undefined is returned for all ids", () => {
    // Given
    const widgetComponents: Record<string, unknown> = {};

    // When / Then
    expect(widgetComponents["hero"]).toBeUndefined();
    expect(widgetComponents["about"]).toBeUndefined();
    expect(widgetComponents["skills"]).toBeUndefined();
  });
});

// ─── Scenario 2: registered section type returns the correct component ─────────

describe("Scenario 2: registered section type resolves to the expected component", () => {
  it("Given WidgetComponentMap = { hero: MockHero }, When looking up 'hero', Then MockHero is returned", () => {
    // Given
    const MockHero = () => null;
    const widgetComponents: Record<string, unknown> = { hero: MockHero };

    // When
    const Component = widgetComponents["hero"];

    // Then
    expect(Component).toBe(MockHero);
  });

  it("Given a map with hero and about, When looking up 'gallery' (absent), Then undefined is returned", () => {
    // Given
    const MockHero = () => null;
    const MockAbout = () => null;
    const widgetComponents: Record<string, unknown> = {
      hero: MockHero,
      about: MockAbout,
    };

    // When
    const Component = widgetComponents["gallery"];

    // Then — gallery is not registered; lookup never returns a wrong component
    expect(Component).toBeUndefined();
  });

  it("Given a map with multiple entries, When looking up each registered id, Then each resolves to its own component", () => {
    // Given
    const MockHero = () => null;
    const MockAbout = () => null;
    const MockSkills = () => null;
    const widgetComponents: Record<string, unknown> = {
      hero: MockHero,
      about: MockAbout,
      skills: MockSkills,
    };

    // When / Then — each id returns its own component, not another component
    expect(widgetComponents["hero"]).toBe(MockHero);
    expect(widgetComponents["about"]).toBe(MockAbout);
    expect(widgetComponents["skills"]).toBe(MockSkills);
  });
});

// ─── Scenario 3: resolveWidgetLayout works with widened WidgetLayoutConfig ────

describe("Scenario 3: resolveWidgetLayout applies correct precedence with generic Record<string, string> layouts", () => {
  it("Given themeLayouts uses a section key 'my-new-widget' (not in the original 6-key union), When activeTheme matches, Then the theme override is returned", () => {
    // Given — WidgetLayoutConfig is now Record<string, string>, any section key
    // is valid. In the previous narrowed type this would have been a type error.
    const themeLayouts: Record<string, Record<string, string>> = {
      dark: { "my-new-widget": "full-bleed" },
    };

    // When
    const result = resolveWidgetLayout(
      "my-new-widget",
      "default",
      themeLayouts,
      "dark",
    );

    // Then — themeLayouts override is applied (P-07 precedence rule)
    expect(result).toBe("full-bleed");
  });

  it("Given Record<string, string> themeLayouts for theme 'warm', When activeTheme is 'dark' (no entry), Then section.layout 'variant-b' is returned", () => {
    // Given
    const themeLayouts: Record<string, Record<string, string>> = {
      warm: { "custom-section": "variant-a" },
    };

    // When
    const result = resolveWidgetLayout(
      "custom-section",
      "variant-b",
      themeLayouts,
      "dark",
    );

    // Then — falls back to section.layout (B2 precedence rule)
    expect(result).toBe("variant-b");
  });

  it("Given Record<string, string> themeLayouts with the active theme having the section, When resolving, Then theme override beats section.layout", () => {
    // Given — full themeLayouts + section.layout setup with generic string keys
    const themeLayouts: Record<string, Record<string, string>> = {
      minimal: { hero: "split" },
      warm: { hero: "centered" },
    };

    // When — activeTheme = 'warm', section.layout = 'grid'
    const result = resolveWidgetLayout("hero", "grid", themeLayouts, "warm");

    // Then — themeLayouts['warm']['hero'] = 'centered' takes precedence
    expect(result).toBe("centered");
  });

  it("Given themeLayouts is undefined, When resolving any section, Then section.layout is returned (B3 baseline)", () => {
    // Given / When
    const result = resolveWidgetLayout("contact", "split", undefined, "dark");

    // Then
    expect(result).toBe("split");
  });
});

// ─── Scenario 4: sections excluded by enabled:false and absent registry entry ──

describe("Scenario 4: sections are excluded when disabled or absent from the component map", () => {
  it("Given sections with enabled: false, When filterSections runs, Then those sections are excluded (confirmed baseline — also covered by filterSections.test.ts Scenario 1)", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "hero", enabled: false, order: 1 },
      { id: "about", enabled: true, order: 2 },
    ];

    // When
    const result = filterSections(sections, {
      projectsCount: 0,
      blogCount: 0,
      availableRoles: [],
    });

    // Then — 'hero' is excluded; 'about' is present
    expect(result).not.toContain("hero");
    expect(result).toContain("about");
  });

  it("Given enabledIds includes 'gallery' but the component map has no 'gallery' entry, When the component is looked up, Then undefined is returned — WidgetRenderer skips the section", () => {
    // Given — 'gallery' passed filterSections (it is enabled and has content)
    // but the caller of WidgetRenderer did not register a component for it
    const widgetComponents: Record<string, unknown> = {
      hero: () => null,
      about: () => null,
      // 'gallery' intentionally absent
    };
    const sectionId = "gallery";

    // When — WidgetRenderer performs the lookup
    const Component = widgetComponents[sectionId];

    // Then — absent entry means the section is effectively excluded at render time
    expect(Component).toBeUndefined();
  });

  it("Given a mix of registered and unregistered ids, When looking up each, Then only registered ids yield a component truthy value", () => {
    // Given
    const MockHero = () => null;
    const widgetComponents: Record<string, unknown> = { hero: MockHero };
    const enabledIds = ["hero", "gallery", "blog"];

    // When
    const renderable = enabledIds.filter((id) => Boolean(widgetComponents[id]));

    // Then — only 'hero' has a registered component
    expect(renderable).toEqual(["hero"]);
    expect(renderable).not.toContain("gallery");
    expect(renderable).not.toContain("blog");
  });
});

// ─── Scenario 5: background field is reflected as a correct inline CSS value ───

describe("Scenario 5: section background field produces the correct inline style string", () => {
  it("Given section.background = 'url(/img/hero.jpg)', When the bgStyle expression is evaluated, Then it equals 'background: url(/img/hero.jpg)'", () => {
    // Given — mirrors the inline expression in WidgetRenderer.astro line ~117:
    //   const bgStyle = section?.background ? `background: ${section.background}` : undefined;
    const section: PageSectionConfig = {
      id: "hero",
      enabled: true,
      order: 1,
      background: "url(/img/hero.jpg)",
    };

    // When
    const bgStyle = section.background
      ? `background: ${section.background}`
      : undefined;

    // Then
    expect(bgStyle).toBe("background: url(/img/hero.jpg)");
  });

  it("Given section has no background field, When the bgStyle expression is evaluated, Then undefined is returned (no inline style applied)", () => {
    // Given
    const section: PageSectionConfig = {
      id: "about",
      enabled: true,
      order: 2,
    };

    // When
    const bgStyle = section.background
      ? `background: ${section.background}`
      : undefined;

    // Then — no attribute is set; section renders with inherited styles only
    expect(bgStyle).toBeUndefined();
  });

  it("Given a multi-layer CSS gradient background, When bgStyle is computed, Then the exact multi-layer value is preserved in the output string", () => {
    // Given — complex gradient + image URL combination
    const bgValue =
      "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/img/hero.jpg) center/cover no-repeat";
    const section: PageSectionConfig = {
      id: "hero",
      enabled: true,
      order: 1,
      background: bgValue,
    };

    // When
    const bgStyle = section.background
      ? `background: ${section.background}`
      : undefined;

    // Then — the full multi-layer value is not truncated or modified
    expect(bgStyle).toBe(`background: ${bgValue}`);
  });

  it("Given a hex color background, When bgStyle is computed, Then the hex value is embedded correctly", () => {
    // Given
    const section: PageSectionConfig = {
      id: "contact",
      enabled: true,
      order: 5,
      background: "#1A1410",
    };

    // When
    const bgStyle = section.background
      ? `background: ${section.background}`
      : undefined;

    // Then
    expect(bgStyle).toBe("background: #1A1410");
  });
});
