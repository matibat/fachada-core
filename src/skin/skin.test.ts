/**
 * Skin domain BDD test suite
 *
 * Verifies that:
 *  - DEFAULT_SKINS loads the expected theme set from generated TypeScript
 *  - Each skin has the required structural properties
 *  - CSS_VAR_MAP covers every key in ThemeTokens
 *  - THEME_DEFINITIONS correctly delegates to DEFAULT_SKINS
 *  - Custom themes (app-level) conform to the same ThemeDefinition contract
 */
import { describe, it, expect } from "vitest";
import { DEFAULT_SKINS } from "./defaults";
import {
  THEME_DEFINITIONS,
  CSS_VAR_MAP,
  type ThemeDefinition,
  type ThemeTokens,
} from "../utils/theme.config";

// ─── Required token keys ──────────────────────────────────────────────────────
// These are the keys every skin MUST define in both light and dark modes.
const REQUIRED_TOKEN_KEYS: (keyof ThemeTokens)[] = [
  "bgPrimary",
  "bgSecondary",
  "textPrimary",
  "textSecondary",
  "accent",
  "accentHover",
  "border",
  "shadow",
  "borderRadius",
  "transition",
  "glow",
  "gradient",
  "spacingSection",
  "spacingCard",
  "spacingElement",
  "fontBody",
  "fontHeading",
  "fontMono",
  "headingWeight",
  "bodyLineHeight",
  "contentMaxWidth",
  "headingLetterSpacing",
  "buttonTextColor",
  "buttonTextShadow",
  "scanlineOpacity",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function assertTokensComplete(tokens: ThemeTokens, label: string) {
  for (const key of REQUIRED_TOKEN_KEYS) {
    expect(
      tokens[key],
      `${label}: token "${key}" must be defined`,
    ).toBeDefined();
    expect(
      typeof tokens[key],
      `${label}: token "${key}" must be a string`,
    ).toBe("string");
  }
}

function assertThemeComplete(def: ThemeDefinition, id: string) {
  expect(def.name, `${id}: must have a name`).toBeTruthy();
  expect(def.description, `${id}: must have a description`).toBeTruthy();
  expect(def.light, `${id}: must have a light token set`).toBeDefined();
  expect(def.dark, `${id}: must have a dark token set`).toBeDefined();
  assertTokensComplete(def.light, `${id}.light`);
  assertTokensComplete(def.dark, `${id}.dark`);
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe("Skin domain — DEFAULT_SKINS", () => {
  it("loads the four built-in skins from YAML-generated source", () => {
    // Given: the pre-build script generated DEFAULT_SKINS from YAML files
    // When: we import DEFAULT_SKINS
    // Then: all four built-in skins are present
    const ids = Object.keys(DEFAULT_SKINS);
    expect(ids).toContain("minimalist");
    expect(ids).toContain("modern-tech");
    expect(ids).toContain("professional");
    expect(ids).toContain("vaporwave");
  });

  it("each built-in skin has a complete light and dark token set", () => {
    // Given: DEFAULT_SKINS contains built-in theme definitions
    // When: we inspect each skin's token sets
    // Then: all required tokens are present and are strings
    for (const [id, def] of Object.entries(DEFAULT_SKINS)) {
      assertThemeComplete(def, id);
    }
  });

  it("minimalist skin uses serif heading font and no border-radius", () => {
    // Given: the minimalist skin promotes editorial aesthetics
    // When: we read its light-mode tokens
    // Then: heading font is serif and borderRadius is 0
    const { light } = DEFAULT_SKINS["minimalist"];
    expect(light.fontHeading).toContain("Playfair Display");
    expect(light.borderRadius).toBe("0");
    expect(light.glow).toBe("none");
    expect(light.gradient).toBe("none");
  });

  it("modern-tech skin uses gradient and rounded corners", () => {
    // Given: the modern-tech skin promotes a futuristic tech look
    // When: we read its dark-mode tokens
    // Then: gradient is defined, radius is non-zero, glow is set
    const { dark } = DEFAULT_SKINS["modern-tech"];
    expect(dark.gradient).toMatch(/linear-gradient/);
    expect(dark.borderRadius).not.toBe("0");
    expect(dark.glow).toMatch(/rgba/);
  });

  it("vaporwave skin has brighter accent colors and larger border-radius", () => {
    // Given: the vaporwave skin uses neon retro aesthetics
    // When: we read its dark-mode tokens
    // Then: accent is a neon magenta and radius is largest
    const { dark } = DEFAULT_SKINS["vaporwave"];
    expect(dark.accent).toBe("#FF00FF");
    expect(dark.borderRadius).toBe("1rem");
    expect(dark.scanlineOpacity).toBe("0.03");
  });

  it("professional skin is conservative — no glow, subtle border-radius", () => {
    // Given: the professional skin promotes a corporate, trustworthy look
    // When: we read its light-mode tokens
    // Then: glow is none and borderRadius is small
    const { light } = DEFAULT_SKINS["professional"];
    expect(light.glow).toBe("none");
    expect(light.borderRadius).toBe("0.375rem");
  });
});

describe("Skin domain — THEME_DEFINITIONS delegates to DEFAULT_SKINS", () => {
  it("THEME_DEFINITIONS is the same object as DEFAULT_SKINS", () => {
    // Given: theme.config.ts imports and re-exports DEFAULT_SKINS
    // When: we compare the two exports
    // Then: they are identical (same reference)
    expect(THEME_DEFINITIONS).toBe(DEFAULT_SKINS);
  });

  it("all DEFAULT_SKINS keys are accessible via THEME_DEFINITIONS", () => {
    // Given: THEME_DEFINITIONS wraps DEFAULT_SKINS
    // When: we iterate DEFAULT_SKINS keys
    // Then: every key resolves in THEME_DEFINITIONS
    for (const id of Object.keys(DEFAULT_SKINS)) {
      expect(
        THEME_DEFINITIONS[id],
        `THEME_DEFINITIONS["${id}"] should be defined`,
      ).toBeDefined();
    }
  });
});

describe("Skin domain — CSS_VAR_MAP coverage", () => {
  it("CSS_VAR_MAP has an entry for every key in ThemeTokens", () => {
    // Given: ThemeTokens defines all the visual design tokens
    // When: we inspect CSS_VAR_MAP for each required key
    // Then: every required key has a corresponding CSS custom property name
    for (const key of REQUIRED_TOKEN_KEYS) {
      expect(
        CSS_VAR_MAP[key],
        `CSS_VAR_MAP["${key}"] must be defined`,
      ).toBeDefined();
      expect(
        CSS_VAR_MAP[key],
        `CSS_VAR_MAP["${key}"] must start with --`,
      ).toMatch(/^--/);
    }
  });

  it("no two tokens map to the same CSS custom property", () => {
    // Given: CSS_VAR_MAP provides unique CSS variable names
    // When: we collect all mapped values
    // Then: there are no duplicates
    const values = Object.values(CSS_VAR_MAP);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

describe("Skin domain — custom app-level skin contract", () => {
  it("a custom skin defined inline (like unbati) must satisfy ThemeDefinition shape", () => {
    // Given: an app defines a custom skin in its appConfig.themes.custom
    // When: we construct a minimal custom skin inline
    // Then: it passes the same token completeness checks as built-in skins

    const customSkin: ThemeDefinition = {
      name: "UnBati",
      description: "Artistic studio theme with warm earthy tones",
      light: {
        bgPrimary: "#F9F7F3",
        bgSecondary: "#FFFFFF",
        textPrimary: "#0A0F1C",
        textSecondary: "#5A6370",
        accent: "#E2B38D",
        accentHover: "#D4A174",
        border: "#E8E3D8",
        shadow: "rgba(10, 15, 28, 0.06)",
        borderRadius: "0.375rem",
        transition: "0.3s ease",
        glow: "none",
        gradient: "linear-gradient(135deg, #E2B38D 0%, #A3BFFA 100%)",
        spacingSection: "7rem",
        spacingCard: "2rem",
        spacingElement: "1.5rem",
        fontBody: "'Inter', 'Satoshi', sans-serif",
        fontHeading: "'Playfair Display', serif",
        fontMono: "'JetBrains Mono', monospace",
        headingWeight: "400",
        bodyLineHeight: "1.8",
        contentMaxWidth: "900px",
        headingLetterSpacing: "-0.015em",
        buttonTextColor: "#0A0F1C",
        buttonTextShadow: "none",
        scanlineOpacity: "0",
      },
      dark: {
        bgPrimary: "#0A0F1C",
        bgSecondary: "#0F172A",
        textPrimary: "#E2E8F0",
        textSecondary: "#A8B2C1",
        accent: "#E2B38D",
        accentHover: "#F2C4A4",
        border: "#1A2642",
        shadow: "rgba(226, 179, 141, 0.08)",
        borderRadius: "0.375rem",
        transition: "0.3s ease",
        glow: "0 0 15px rgba(226, 179, 141, 0.15)",
        gradient: "linear-gradient(135deg, #E2B38D 0%, #A3BFFA 100%)",
        spacingSection: "7rem",
        spacingCard: "2rem",
        spacingElement: "1.5rem",
        fontBody: "'Inter', 'Satoshi', sans-serif",
        fontHeading: "'Playfair Display', serif",
        fontMono: "'JetBrains Mono', monospace",
        headingWeight: "400",
        bodyLineHeight: "1.8",
        contentMaxWidth: "900px",
        headingLetterSpacing: "-0.015em",
        buttonTextColor: "inherit",
        buttonTextShadow: "none",
        scanlineOpacity: "0",
      },
    };

    assertThemeComplete(customSkin, "unbati-custom");
  });
});
