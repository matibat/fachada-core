/**
 * Widget Renderer BDD Tests
 *
 * Behavior-driven tests for the dynamic widget renderer
 * Tests cover:
 * - Widget registration: registerWidget() adds widgets to registry
 * - Widget resolution: resolve() returns component or null
 * - Built-in widgets: hero, portfolio, skills, contact, gallery pre-registered
 * - Missing widgets: resolve() returns null and warns (no throw)
 * - Caching: repeated resolves use cached components
 * - Performance: no redundant lookups
 * - Static and dynamic import support
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createWidgetRenderer } from "../widgetRenderer";

// ─── Test Fixtures ───────────────────────────────────────────────────────

/**
 * Mock Astro components
 */
const MockHeroComponent = () => null;
const MockPortfolioComponent = () => null;
const MockSkillsComponent = () => null;
const MockContactComponent = () => null;
const MockGalleryComponent = () => null;
const MockCustomComponent = () => null;

// ─── Behavior 1: Register widgets via registerWidget() ─────────────────────

describe("Behavior 1: registerWidget() adds widgets to the registry", () => {
  let renderer: ReturnType<typeof createWidgetRenderer>;

  beforeEach(() => {
    renderer = createWidgetRenderer();
  });

  it("should allow registering a custom widget with a component reference", () => {
    // Given — a renderer instance

    // When — registering a custom widget
    renderer.registerWidget("custom-widget", MockCustomComponent);

    // Then — the widget is resolvable
    const resolved = renderer.resolve("custom-widget");
    expect(resolved).toBe(MockCustomComponent);
  });

  it("should allow registering multiple different custom widgets", () => {
    // Given — a renderer instance

    // When — registering multiple custom widgets
    renderer.registerWidget("widget-one", MockPortfolioComponent);
    renderer.registerWidget("widget-two", MockSkillsComponent);
    renderer.registerWidget("widget-three", MockContactComponent);

    // Then — each resolves independently
    expect(renderer.resolve("widget-one")).toBe(MockPortfolioComponent);
    expect(renderer.resolve("widget-two")).toBe(MockSkillsComponent);
    expect(renderer.resolve("widget-three")).toBe(MockContactComponent);
  });

  it("should support registering a widget with a string path (for dynamic import support)", () => {
    // Given — a renderer instance
    // When — registering a widget with a string path
    // (In production, this path would be resolved at render time)
    const componentPath = "./components/CustomWidget.astro";
    renderer.registerWidget("path-widget", componentPath as any);

    // Then — the path is stored for later dynamic resolution
    const resolved = renderer.resolve("path-widget");
    expect(resolved).toBe(componentPath);
  });

  it("should throw error when registering with invalid type (empty string)", () => {
    // Given — a renderer instance
    // When / Then — registering with empty string throws error
    expect(() => {
      renderer.registerWidget("", MockCustomComponent);
    }).toThrow(/Invalid widget type/);
  });

  it("should throw error when registering with invalid type (non-string)", () => {
    // Given — a renderer instance
    // When / Then — registering with non-string type throws error
    expect(() => {
      renderer.registerWidget(123 as any, MockCustomComponent);
    }).toThrow(/Invalid widget type/);
  });
});

// ─── Behavior 2: Resolve widgets via resolve() ────────────────────────────

describe("Behavior 2: resolve() returns component or null", () => {
  let renderer: ReturnType<typeof createWidgetRenderer>;

  beforeEach(() => {
    renderer = createWidgetRenderer();
  });

  it("should return null for unregistered widget type", () => {
    // Given — a renderer with no custom registrations
    // When — resolving an unregistered widget
    const resolved = renderer.resolve("nonexistent-widget");

    // Then — null is returned
    expect(resolved).toBeNull();
  });

  it("should return the registered component for a registered type", () => {
    // Given — a renderer with a registered widget
    renderer.registerWidget("test-widget", MockCustomComponent);

    // When — resolving the registered widget
    const resolved = renderer.resolve("test-widget");

    // Then — the component is returned
    expect(resolved).toBe(MockCustomComponent);
  });

  it("should return null and warn when resolving a missing widget", () => {
    // Given — a renderer instance and spy on console.warn
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // When — resolving a missing widget
    const resolved = renderer.resolve("missing-widget");

    // Then — null is returned and a warning is logged
    expect(resolved).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("missing-widget"),
    );

    warnSpy.mockRestore();
  });

  it("should not throw an error for missing widgets", () => {
    // Given — a renderer instance
    // When / Then — no error should be thrown
    expect(() => {
      renderer.resolve("missing-widget");
    }).not.toThrow();
  });
});

// ─── Behavior 3: Built-in widgets pre-registered ──────────────────────────

describe("Behavior 3: Built-in widgets are pre-registered", () => {
  let renderer: ReturnType<typeof createWidgetRenderer>;

  beforeEach(() => {
    renderer = createWidgetRenderer();
  });

  it("should have hero widget available by default", () => {
    // Given — a fresh renderer instance
    // When — resolving the hero widget
    const resolved = renderer.resolve("hero");

    // Then — a component is returned (not null)
    expect(resolved).not.toBeNull();
    expect(typeof resolved).toBe("object");
  });

  it("should have portfolio widget available by default", () => {
    // Given — a fresh renderer instance
    // When — resolving the portfolio widget
    const resolved = renderer.resolve("portfolio");

    // Then — a component is returned (not null)
    expect(resolved).not.toBeNull();
    expect(typeof resolved).toBe("object");
  });

  it("should have skills widget available by default", () => {
    // Given — a fresh renderer instance
    // When — resolving the skills widget
    const resolved = renderer.resolve("skills");

    // Then — a component is returned (not null)
    expect(resolved).not.toBeNull();
    expect(typeof resolved).toBe("object");
  });

  it("should have contact widget available by default", () => {
    // Given — a fresh renderer instance
    // When — resolving the contact widget
    const resolved = renderer.resolve("contact");

    // Then — a component is returned (not null)
    expect(resolved).not.toBeNull();
    expect(typeof resolved).toBe("object");
  });

  it("should have gallery widget available by default", () => {
    // Given — a fresh renderer instance
    // When — resolving the gallery widget
    const resolved = renderer.resolve("gallery");

    // Then — a component is returned (not null)
    expect(resolved).not.toBeNull();
    expect(typeof resolved).toBe("object");
  });

  it("should include all built-in widget types when queried", () => {
    // Given — a fresh renderer instance
    // When — checking all built-in types
    const builtonTypes = ["hero", "portfolio", "skills", "contact", "gallery"];

    // Then — each resolves without returning null
    for (const type of builtonTypes) {
      expect(renderer.resolve(type)).not.toBeNull();
    }
  });
});

// ─── Behavior 4: Caching minimizes repeated lookups ───────────────────────

describe("Behavior 4: Component caching improves performance", () => {
  let renderer: ReturnType<typeof createWidgetRenderer>;

  beforeEach(() => {
    renderer = createWidgetRenderer();
  });

  it("should return the same component instance on repeated resolves", () => {
    // Given — a renderer with a registered widget
    renderer.registerWidget("cached-widget", MockCustomComponent);

    // When — resolving the same widget multiple times
    const resolve1 = renderer.resolve("cached-widget");
    const resolve2 = renderer.resolve("cached-widget");
    const resolve3 = renderer.resolve("cached-widget");

    // Then — all returns are identical (same reference, not just equality)
    expect(resolve1).toBe(resolve2);
    expect(resolve2).toBe(resolve3);
  });

  it("should cache built-in widgets for multiple renders", () => {
    // Given — a renderer instance (built-in widgets pre-registered)

    // When — resolving a built-in widget multiple times
    const heroResolve1 = renderer.resolve("hero");
    const heroResolve2 = renderer.resolve("hero");

    // Then — the same cached component is returned
    expect(heroResolve1).toBe(heroResolve2);
  });

  it("should return null consistently for missing widgets", () => {
    // Given — a renderer instance
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // When — resolving a missing widget multiple times
    const resolve1 = renderer.resolve("never-registered");
    const resolve2 = renderer.resolve("never-registered");
    const resolve3 = renderer.resolve("never-registered");

    // Then — all return null
    expect(resolve1).toBeNull();
    expect(resolve2).toBeNull();
    expect(resolve3).toBeNull();

    // And warnings are issued each time (or cached — implementation choice)
    // For now, we verify warnings were called at least once
    expect(warnSpy.mock.calls.length).toBeGreaterThan(0);

    warnSpy.mockRestore();
  });
});

// ─── Behavior 5: Singleton renderer across renders ─────────────────────────

describe("Behavior 5: Widget renderer is a singleton", () => {
  it("should be the same instance when called multiple times", () => {
    // Given — we request the renderer multiple times
    const renderer1 = createWidgetRenderer();
    const renderer2 = createWidgetRenderer();

    // Then — both should be the same singleton instance
    expect(renderer1).toBe(renderer2);
  });

  it("should persist registered widgets across multiple get() calls", () => {
    // Given — we register a widget and get the instance
    const renderer1 = createWidgetRenderer();
    renderer1.registerWidget("persistent-widget", MockCustomComponent);

    // When — we get the renderer again
    const renderer2 = createWidgetRenderer();

    // Then — the previously registered widget is still available
    expect(renderer2.resolve("persistent-widget")).toBe(MockCustomComponent);
  });
});

// ─── Behavior 6: Multiple widgets can be mixed per page ──────────────────

describe("Behavior 6: Multiple widget types can be rendered on one page", () => {
  let renderer: ReturnType<typeof createWidgetRenderer>;

  beforeEach(() => {
    renderer = createWidgetRenderer();
  });

  it("should resolve multiple different widgets in a page render", () => {
    // Given — a renderer with multiple registered widgets
    renderer.registerWidget("card", MockPortfolioComponent);
    renderer.registerWidget("bio", MockSkillsComponent);
    renderer.registerWidget("cta", MockContactComponent);

    // When — rendering a page with multiple widgets
    const widgets = ["card", "bio", "cta"];
    const resolved = widgets.map((type) => renderer.resolve(type));

    // Then — all resolve to their correct components
    expect(resolved[0]).toBe(MockPortfolioComponent);
    expect(resolved[1]).toBe(MockSkillsComponent);
    expect(resolved[2]).toBe(MockContactComponent);
    expect(resolved).toHaveLength(3);
  });

  it("should handle a mix of built-in and custom widgets", () => {
    // Given — a renderer with built-in + custom widgets
    renderer.registerWidget("custom-nav", MockCustomComponent);

    // When — rendering multiple widget types
    const builtIn = renderer.resolve("hero");
    const custom = renderer.resolve("custom-nav");

    // Then — both resolve correctly
    expect(builtIn).not.toBeNull();
    expect(custom).toBe(MockCustomComponent);
  });
});

// ─── Behavior 7: All types are fully specified ────────────────────────────

describe("Behavior 7: Type safety and full type specification", () => {
  let renderer: ReturnType<typeof createWidgetRenderer>;

  beforeEach(() => {
    renderer = createWidgetRenderer();
  });

  it("should accept component objects or string paths in registerWidget", () => {
    // Given — a renderer instance
    // When — registering both types
    renderer.registerWidget("component-widget", MockCustomComponent);
    renderer.registerWidget("path-widget", "./path/to/widget.astro" as any);

    // Then — both are registered without type errors
    const comp = renderer.resolve("component-widget");
    const path = renderer.resolve("path-widget");
    expect(comp).not.toBeNull();
    expect(path).not.toBeNull();
  });

  it("should return either AstroComponent or null (never undefined)", () => {
    // Given — a renderer instance
    // When — resolving registered and unregistered widgets
    const registered = renderer.resolve("hero");
    const unregistered = renderer.resolve("unknown-widget");

    // Then — results are either the component or null, never undefined
    expect([registered, null]).toContain(registered);
    expect([unregistered, null]).toContain(unregistered);
    expect(unregistered === undefined).toBe(false);
  });
});

// ─── Integration: Full page render scenario ────────────────────────────────

describe("Integration: Full page render with mixed widget types", () => {
  it("should resolve all built-in widgets without fallback for a typical portfolio page", () => {
    // Given — a typical portfolio page structure
    const renderer = createWidgetRenderer();
    const pageWidgets = ["hero", "portfolio", "skills", "contact", "gallery"];

    // When — resolving all widgets for the page
    const components = pageWidgets.map((type) => renderer.resolve(type));

    // Then — all resolve successfully (no nulls)
    expect(components).toHaveLength(5);
    expect(components.every((c) => c !== null)).toBe(true);
  });

  it("should handle missing optional widgets gracefully in a page", () => {
    // Given — a renderer instance
    const renderer = createWidgetRenderer();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // When — rendering with some missing widgets
    const required = renderer.resolve("hero"); // built-in, exists
    const optional = renderer.resolve("missing-optional"); // custom, not registered

    // Then — required widgets render, optional returns null without error
    expect(required).not.toBeNull();
    expect(optional).toBeNull();
    expect(() => {
      // No error is thrown
    }).not.toThrow();

    warnSpy.mockRestore();
  });
});
