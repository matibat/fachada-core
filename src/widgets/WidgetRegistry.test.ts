/**
 * WidgetRegistry — BDD unit tests
 *
 * All component stubs use vi.fn() — no real React component imports.
 */
import { describe, it, expect, vi } from "vitest";
import { createWidgetRegistry } from "./WidgetRegistry";

// ─── Shared stubs ─────────────────────────────────────────────────────────────

const StubHero = vi.fn().mockReturnValue(null);
const StubAbout = vi.fn().mockReturnValue(null);
const StubContact = vi.fn().mockReturnValue(null);

// ─── Scenario 1: resolving a registered widget type ──────────────────────────

describe("Scenario 1: resolving a registered widget type", () => {
  it("Given a registry with StubHero registered, When I resolve 'hero', Then the component factory is returned", () => {
    // Given
    const registry = createWidgetRegistry({ hero: StubHero });

    // When
    const result = registry.resolve("hero");

    // Then
    expect(result).toBe(StubHero);
  });

  it("Given multiple widgets registered, When I resolve each by type, Then each returns its own stub", () => {
    // Given
    const registry = createWidgetRegistry({
      hero: StubHero,
      about: StubAbout,
      contact: StubContact,
    });

    // When / Then
    expect(registry.resolve("hero")).toBe(StubHero);
    expect(registry.resolve("about")).toBe(StubAbout);
    expect(registry.resolve("contact")).toBe(StubContact);
  });
});

// ─── Scenario 2: resolving an unregistered type ───────────────────────────────

describe("Scenario 2: resolving an unregistered widget type returns undefined", () => {
  it("Given a registry without 'skills', When I resolve 'skills', Then undefined is returned", () => {
    // Given
    const registry = createWidgetRegistry({ hero: StubHero });

    // When
    const result = registry.resolve("skills");

    // Then
    expect(result).toBeUndefined();
  });

  it("Given an empty registry, When I resolve any type, Then undefined is returned", () => {
    // Given
    const registry = createWidgetRegistry({});

    // When / Then
    expect(registry.resolve("hero")).toBeUndefined();
  });
});

// ─── Scenario 3: registry.has checks presence ────────────────────────────────

describe("Scenario 3: registry.has reports correct presence", () => {
  it("Given 'about' is registered, When has('about') is called, Then it returns true", () => {
    // Given
    const registry = createWidgetRegistry({ about: StubAbout });

    // When / Then
    expect(registry.has("about")).toBe(true);
  });

  it("Given 'contact' is not registered, When has('contact') is called, Then it returns false", () => {
    // Given
    const registry = createWidgetRegistry({ about: StubAbout });

    // When / Then
    expect(registry.has("contact")).toBe(false);
  });
});

// ─── Scenario 4: types list is immutable ─────────────────────────────────────

describe("Scenario 4: registry types list is immutable after creation", () => {
  it("Given a registry with one widget, When I attempt to push to the types array, Then the registry types list is unchanged", () => {
    // Given
    const registry = createWidgetRegistry({ hero: StubHero });

    // When
    (registry.types as string[]).push("injected");

    // Then
    expect(registry.types).toHaveLength(1);
    expect(registry.types).toContain("hero");
  });

  it("Given an empty registry, When I access types, Then it is an empty array", () => {
    // Given / When
    const registry = createWidgetRegistry({});

    // Then
    expect(registry.types).toHaveLength(0);
  });
});
