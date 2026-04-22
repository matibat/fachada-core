/**
 * site-tree.types — BDD type-acceptance tests for LandingPageData
 *
 * These are compile-time assertions: if TypeScript accepts the object literals
 * without error, the type is correct. Runtime assertions confirm field access.
 *
 * Behavior covered:
 *   B1: LandingPageData accepts ctas as an optional array of {label, href}
 *   B2: LandingPageData without ctas is still valid (field is optional)
 *   B3: Existing ctaLabel and ctaLink fields remain intact (backward compat)
 */
import { describe, it, expect } from "vitest";
import type { LandingPageData } from "./site-tree.types";

// ─── Helper: typed pass-through ───────────────────────────────────────────────

function acceptsLandingPageData(data: LandingPageData): LandingPageData {
  return data;
}

// ─── B1: ctas is accepted ─────────────────────────────────────────────────────

describe("B1: LandingPageData accepts ctas as an optional array field", () => {
  it("Given a LandingPageData with ctas, When TypeScript compiles, Then the value is preserved", () => {
    // Given
    const data = acceptsLandingPageData({
      ctas: [{ label: "Ver tatuajes", href: "#tatuajes" }],
    });

    // When
    const result = data.ctas;

    // Then
    expect(result).toHaveLength(1);
    expect(result?.[0].label).toBe("Ver tatuajes");
    expect(result?.[0].href).toBe("#tatuajes");
  });

  it("Given a LandingPageData with multiple ctas, When TypeScript compiles, Then all entries are accessible", () => {
    // Given
    const data = acceptsLandingPageData({
      hook: "Tatúate con nosotros",
      ctas: [
        { label: "Ver tatuajes", href: "#tatuajes" },
        { label: "Ver pinturas", href: "#pinturas" },
      ],
    });

    // When
    const result = data.ctas;

    // Then
    expect(result).toHaveLength(2);
    expect(result?.[0].label).toBe("Ver tatuajes");
    expect(result?.[1].href).toBe("#pinturas");
  });
});

// ─── B2: ctas is optional ────────────────────────────────────────────────────

describe("B2: LandingPageData without ctas is still valid (backward compatibility)", () => {
  it("Given a LandingPageData without ctas, When TypeScript compiles, Then no type error occurs and field is undefined", () => {
    // Given / When — TypeScript accepts this literal; if ctas were required
    // this file would not compile.
    const data = acceptsLandingPageData({
      hook: "Hello world",
      subheading: "A subtitle",
    });

    // Then — the field is absent (undefined) at runtime
    expect(data.ctas).toBeUndefined();
  });

  it("Given an empty LandingPageData, When TypeScript compiles, Then ctas is undefined", () => {
    // Given / When
    const data = acceptsLandingPageData({});

    // Then
    expect(data.ctas).toBeUndefined();
  });
});

// ─── B3: existing ctaLabel / ctaLink fields remain intact ────────────────────

describe("B3: Existing LandingPageData fields are unaffected by the ctas addition", () => {
  it("Given a LandingPageData with ctaLabel, When TypeScript compiles, Then ctaLabel is accessible", () => {
    // Given
    const data = acceptsLandingPageData({
      ctaLabel: "Get in touch",
    });

    // When / Then
    expect(data.ctaLabel).toBe("Get in touch");
  });

  it("Given a LandingPageData with both ctaLabel and ctas, When TypeScript compiles, Then both fields coexist", () => {
    // Given
    const data = acceptsLandingPageData({
      ctaLabel: "Get in touch",
      ctas: [{ label: "Ver tatuajes", href: "#tatuajes" }],
    });

    // When / Then
    expect(data.ctaLabel).toBe("Get in touch");
    expect(data.ctas?.[0].label).toBe("Ver tatuajes");
  });
});
