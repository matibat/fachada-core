import { describe, it, expect } from "vitest";
import { generateFoucCss } from "./generateFoucCss";

/**
 * BDD suite: generateFoucCss
 *
 * Behaviors covered:
 *   1. Returns empty string when no sections have variants.
 *   2. Generates a default-visibility rule for the FIRST variant only.
 *   3. Generates an activation (data-attribute) rule for EVERY variant.
 *   4. Sections whose variant array is empty are silently skipped.
 *   5. Multiple sections each produce their own independent rule sets.
 */

describe("generateFoucCss", () => {
  // ── Behavior 1 ───────────────────────────────────────────────────────────
  it("returns an empty string when the variant map is empty", () => {
    // Given: no sections with registered variants
    // When: generateFoucCss is called with an empty map
    // Then: the result is an empty string (no CSS emitted)
    expect(generateFoucCss(new Map())).toBe("");
  });

  // ── Behavior 2 & 3 ───────────────────────────────────────────────────────
  it("generates a default-visibility rule for the first variant and an activation rule for it", () => {
    // Given: a single section "hero" registered with one variant "centered"
    // When: generateFoucCss is called
    // Then: the output contains a default display:block rule for "centered"
    //        and an html-attribute activation rule for "centered"
    const result = generateFoucCss(new Map([["hero", ["centered"]]]));

    expect(result).toContain(
      '[data-layout-section="hero"][data-layout-variant="centered"] { display: block; }',
    );
    expect(result).toContain(
      'html[data-layout-hero="centered"] [data-layout-section="hero"][data-layout-variant="centered"] { display: block !important; }',
    );
  });

  it("generates a default-visibility rule for the FIRST variant only when multiple variants exist", () => {
    // Given: section "hero" with variants ["centered", "split"]
    // When: generateFoucCss is called
    // Then: only "centered" (first) gets a plain display:block rule
    //        both "centered" and "split" get activation rules
    const result = generateFoucCss(new Map([["hero", ["centered", "split"]]]));

    // First variant: default visibility rule present
    expect(result).toContain(
      '[data-layout-section="hero"][data-layout-variant="centered"] { display: block; }',
    );
    // Second variant: no default visibility rule
    expect(result).not.toContain(
      '[data-layout-section="hero"][data-layout-variant="split"] { display: block; }',
    );
    // Both variants: activation rules present
    expect(result).toContain(
      'html[data-layout-hero="centered"] [data-layout-section="hero"][data-layout-variant="centered"] { display: block !important; }',
    );
    expect(result).toContain(
      'html[data-layout-hero="split"] [data-layout-section="hero"][data-layout-variant="split"] { display: block !important; }',
    );
  });

  // ── Behavior 4 ───────────────────────────────────────────────────────────
  it("skips sections whose variant array is empty", () => {
    // Given: "hero" has variants but "about" has none
    // When: generateFoucCss is called
    // Then: the output contains hero rules but no "about" references
    const result = generateFoucCss(
      new Map([
        ["hero", ["centered"]],
        ["about", []],
      ]),
    );

    expect(result).toContain('"hero"');
    expect(result).not.toContain('"about"');
  });

  // ── Behavior 5 ───────────────────────────────────────────────────────────
  it("generates independent rule sets for multiple sections", () => {
    // Given: both "hero" and "skills" have variants
    // When: generateFoucCss is called
    // Then: both sections produce their own default + activation rules
    const result = generateFoucCss(
      new Map([
        ["hero", ["centered"]],
        ["skills", ["grid-3", "grid-2"]],
      ]),
    );

    // hero rules
    expect(result).toContain(
      '[data-layout-section="hero"][data-layout-variant="centered"] { display: block; }',
    );
    // skills default (first variant only)
    expect(result).toContain(
      '[data-layout-section="skills"][data-layout-variant="grid-3"] { display: block; }',
    );
    expect(result).not.toContain(
      '[data-layout-section="skills"][data-layout-variant="grid-2"] { display: block; }',
    );
    // skills activation for grid-2
    expect(result).toContain(
      'html[data-layout-skills="grid-2"] [data-layout-section="skills"][data-layout-variant="grid-2"] { display: block !important; }',
    );
  });
});
