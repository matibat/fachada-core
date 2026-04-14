/**
 * ThemeResolver BDD test suite
 *
 * Tests the pure domain service `resolveTheme`.
 * No side effects, no React, no app-specific data.
 * Uses generic theme names ("minimalist", "modern-tech") from THEME_DEFINITIONS.
 */
import { describe, it, expect } from "vitest";
import { resolveTheme } from "./ThemeResolver";
import { THEME_DEFINITIONS } from "../utils/theme.config";
import type { ThemeConfig } from "../types/profile.types";
import type { ThemeOverride } from "../types/app.types";
import type { ThemeDefinition } from "../utils/theme.config";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const minimalistLightConfig: ThemeConfig = {
  style: "minimalist",
  defaultMode: "light",
  enableStyleSwitcher: false,
  enableModeToggle: false,
};

const minimalistDarkConfig: ThemeConfig = {
  style: "minimalist",
  defaultMode: "dark",
  enableStyleSwitcher: false,
  enableModeToggle: false,
};

const modernTechLightConfig: ThemeConfig = {
  style: "modern-tech",
  defaultMode: "light",
  enableStyleSwitcher: false,
  enableModeToggle: false,
};

const minimalistLightTokens = THEME_DEFINITIONS["minimalist"].light;
const minimalistDarkTokens = THEME_DEFINITIONS["minimalist"].dark;
const modernTechLightTokens = THEME_DEFINITIONS["modern-tech"].light;

// ─── Scenario 1: Base token resolution ────────────────────────────────────────

describe("Given a base theme config with no active variant", () => {
  it("When resolving minimalist/light with no variants, Then returns THEME_DEFINITIONS minimalist.light tokens", () => {
    const result = resolveTheme(minimalistLightConfig, {}, undefined);
    expect(result).toEqual(minimalistLightTokens);
  });

  it("When resolving minimalist/light with an empty variants map, Then bgPrimary and accent match base tokens", () => {
    const result = resolveTheme(minimalistLightConfig, {});
    expect(result.bgPrimary).toBe(minimalistLightTokens.bgPrimary);
    expect(result.accent).toBe(minimalistLightTokens.accent);
  });

  it("When resolving modern-tech/light, Then returns THEME_DEFINITIONS modern-tech.light tokens", () => {
    const result = resolveTheme(modernTechLightConfig, {});
    expect(result).toEqual(modernTechLightTokens);
  });

  it("When defaultMode is 'dark', Then returns dark base tokens", () => {
    const result = resolveTheme(minimalistDarkConfig, {});
    expect(result).toEqual(minimalistDarkTokens);
  });
});

// ─── Scenario 2: Variant token override ───────────────────────────────────────

describe("Given a base theme config and a named variant with token overrides", () => {
  it("When activeVariant='highlight' overrides only accent, Then accent is overridden and other tokens are unchanged", () => {
    const variants: Record<string, ThemeOverride> = {
      highlight: { tokens: { accent: "#ff6600" } },
    };

    const result = resolveTheme(minimalistLightConfig, variants, "highlight");

    expect(result.accent).toBe("#ff6600");
    expect(result.bgPrimary).toBe(minimalistLightTokens.bgPrimary);
    expect(result.textPrimary).toBe(minimalistLightTokens.textPrimary);
  });

  it("When activeVariant='brand' overrides bgPrimary and textPrimary, Then both tokens are applied and rest is unchanged", () => {
    const variants: Record<string, ThemeOverride> = {
      brand: {
        tokens: {
          bgPrimary: "#1a1a2e",
          textPrimary: "#eaeaea",
        },
      },
    };

    const result = resolveTheme(minimalistLightConfig, variants, "brand");

    expect(result.bgPrimary).toBe("#1a1a2e");
    expect(result.textPrimary).toBe("#eaeaea");
    expect(result.accent).toBe(minimalistLightTokens.accent);
    expect(result.fontBody).toBe(minimalistLightTokens.fontBody);
  });

  it("When variant replaces multiple tokens on modern-tech base, Then all override tokens take effect", () => {
    const variants: Record<string, ThemeOverride> = {
      custom: {
        tokens: {
          accent: "#00ff88",
          glow: "0 0 10px #00ff88",
          borderRadius: "1rem",
        },
      },
    };

    const result = resolveTheme(modernTechLightConfig, variants, "custom");

    expect(result.accent).toBe("#00ff88");
    expect(result.glow).toBe("0 0 10px #00ff88");
    expect(result.borderRadius).toBe("1rem");
    expect(result.bgPrimary).toBe(modernTechLightTokens.bgPrimary);
  });
});

// ─── Scenario 3: Fallback when variant is absent or unknown ───────────────────

describe("Given a variants map that does not contain the requested activeVariant", () => {
  it("When activeVariant='nonexistent' is not in variants, Then returns base tokens unchanged", () => {
    const variants: Record<string, ThemeOverride> = {
      other: { tokens: { accent: "#ff0000" } },
    };

    const result = resolveTheme(minimalistLightConfig, variants, "nonexistent");

    expect(result).toEqual(minimalistLightTokens);
  });

  it("When activeVariant is undefined and variants has entries, Then returns base tokens", () => {
    const variants: Record<string, ThemeOverride> = {
      present: { tokens: { accent: "#abcdef" } },
    };

    const result = resolveTheme(minimalistLightConfig, variants, undefined);

    expect(result).toEqual(minimalistLightTokens);
  });

  it("When variant exists but has no tokens field, Then result equals base tokens", () => {
    const variants: Record<string, ThemeOverride> = {
      empty: {},
    };

    const result = resolveTheme(minimalistLightConfig, variants, "empty");

    expect(result).toEqual(minimalistLightTokens);
  });
});

// ─── Scenario 4: Unknown theme style fallback ─────────────────────────────────

describe("Given a base config with an unknown theme style", () => {
  it("When style is not found in THEME_DEFINITIONS, Then falls back to minimalist tokens", () => {
    const unknownConfig: ThemeConfig = {
      style: "nonexistent-theme",
      defaultMode: "light",
      enableStyleSwitcher: false,
      enableModeToggle: false,
    };

    const result = resolveTheme(unknownConfig, {});

    expect(result).toEqual(THEME_DEFINITIONS["minimalist"].light);
  });

  it("When a custom availableThemes pool is provided that contains the style, Then resolves from the custom pool", () => {
    const customThemePool: Record<string, ThemeDefinition> = {
      "custom-brand": {
        name: "Custom Brand",
        description: "A custom brand theme",
        light: {
          ...minimalistLightTokens,
          accent: "#custom-light",
        },
        dark: {
          ...minimalistDarkTokens,
          accent: "#custom-dark",
        },
      },
    };

    const customConfig: ThemeConfig = {
      style: "custom-brand",
      defaultMode: "light",
      enableStyleSwitcher: false,
      enableModeToggle: false,
    };

    const result = resolveTheme(customConfig, {}, undefined, customThemePool);

    expect(result.accent).toBe("#custom-light");
  });
});

// ─── Scenario 5: Purity — same inputs always yield same outputs ───────────────

describe("Given resolveTheme is a pure function", () => {
  it("When called twice with identical inputs, Then both results are deeply equal", () => {
    const variants: Record<string, ThemeOverride> = {
      v: { tokens: { accent: "#112233" } },
    };

    const result1 = resolveTheme(minimalistLightConfig, variants, "v");
    const result2 = resolveTheme(minimalistLightConfig, variants, "v");

    expect(result1).toEqual(result2);
  });

  it("When called twice with identical inputs, Then results are different object references (no shared state)", () => {
    const variants: Record<string, ThemeOverride> = {
      v: { tokens: { accent: "#112233" } },
    };

    const result1 = resolveTheme(minimalistLightConfig, variants, "v");
    const result2 = resolveTheme(minimalistLightConfig, variants, "v");

    expect(result1).not.toBe(result2);
  });

  it("When input config is mutated after call, Then first result is unaffected", () => {
    const mutableVariants: Record<string, ThemeOverride> = {
      v: { tokens: { accent: "#aabbcc" } },
    };

    const result = resolveTheme(minimalistLightConfig, mutableVariants, "v");
    const originalAccent = result.accent;

    // Mutate the source — result must be unaffected
    mutableVariants.v.tokens!.accent = "#ffffff";

    expect(result.accent).toBe(originalAccent);
  });
});
