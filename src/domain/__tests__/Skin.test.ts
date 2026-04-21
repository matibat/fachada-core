/**
 * BDD tests for Skin domain value object
 *
 * Test structure follows UX-driven behavior definition:
 * - Each behavior states ONE THING the system must do from the outside
 * - Tests map behaviors to acceptance criteria
 * - RED/GREEN/REFACTOR cycle documents evolution
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Skin, type SkinCreateConfig } from "../Skin";
import { SkinRegistry } from "../SkinRegistry";

describe("Skin domain value object", () => {
  let minimalistBuiltIn: Skin;

  beforeEach(() => {
    // Load built-in minimalist skin from registry
    minimalistBuiltIn = SkinRegistry.getBuiltInSkin("minimalist");
  });

  // ========================================================================
  // BEHAVIOR 1: Skin factory validates required properties
  // ========================================================================
  describe("Behavior 1: Skin factory validates required properties (id, name, description, scope)", () => {
    it("should create a skin with all required properties", () => {
      const skin = Skin.create({
        id: "custom-skin",
        name: "Custom Skin",
        description: "A custom design skin",
        scope: "site",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      expect(skin).toBeDefined();
      expect(skin.id).toBe("custom-skin");
      expect(skin.name).toBe("Custom Skin");
      expect(skin.description).toBe("A custom design skin");
      expect(skin.scope).toBe("site");
    });

    it("should reject skin creation when id is missing", () => {
      expect(() =>
        Skin.create({
          id: "",
          name: "Test",
          description: "Test",
          scope: "site",
          light: minimalistBuiltIn.getTokens("light"),
          dark: minimalistBuiltIn.getTokens("dark"),
        }),
      ).toThrow(/id|required|empty/i);
    });

    it("should reject skin creation when scope is invalid", () => {
      expect(() =>
        Skin.create({
          id: "test-skin",
          name: "Test",
          description: "Test",
          scope: "invalid" as any,
          light: minimalistBuiltIn.getTokens("light"),
          dark: minimalistBuiltIn.getTokens("dark"),
        }),
      ).toThrow(/scope|site|page|widget/i);
    });
  });

  // ========================================================================
  // BEHAVIOR 2: Skin factory validates all 28 tokens are present and correct
  // ========================================================================
  describe("Behavior 2: Skin factory validates all 28 tokens are present and correct", () => {
    it("should accept valid skin with all 28 required tokens", () => {
      const skin = Skin.create({
        id: "complete-skin",
        name: "Complete",
        description: "Complete skin",
        scope: "site",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      expect(skin).toBeDefined();
      const lightTokens = skin.getTokens("light");
      const darkTokens = skin.getTokens("dark");

      // Verify all token keys are present (27 standard tokens)
      const expectedKeys = [
        "bgPrimary",
        "bgSecondary",
        "textPrimary",
        "textSecondary",
        "accent",
        "accentHover",
        "accentSecondary",
        "accentTertiary",
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

      expectedKeys.forEach((key) => {
        expect(lightTokens).toHaveProperty(key);
        expect(darkTokens).toHaveProperty(key);
      });
    });

    it("should reject skin when required token is missing from light theme", () => {
      const incompleteLight = minimalistBuiltIn.getTokens("light");
      const { bgPrimary, ...missingPrimary } = incompleteLight as any;

      expect(() =>
        Skin.create({
          id: "incomplete-skin",
          name: "Incomplete",
          description: "Missing token",
          scope: "site",
          light: missingPrimary,
          dark: minimalistBuiltIn.getTokens("dark"),
        }),
      ).toThrow(/token|bgPrimary|required|missing/i);
    });

    it("should reject skin when light and dark token sets have different keys", () => {
      const lightTokens = minimalistBuiltIn.getTokens("light");
      const darkTokens = minimalistBuiltIn.getTokens("dark");
      const { accentTertiary, ...incompleteDark } = darkTokens as any;

      expect(() =>
        Skin.create({
          id: "mismatch-skin",
          name: "Mismatch",
          description: "Mismatched tokens",
          scope: "site",
          light: lightTokens,
          dark: incompleteDark,
        }),
      ).toThrow(/token|mismatched|light|dark/i);
    });

    it("should reject skin when invalid token name is present", () => {
      const lightTokens = {
        ...minimalistBuiltIn.getTokens("light"),
        invalidToken: "#000000",
      };

      expect(() =>
        Skin.create({
          id: "invalid-token-skin",
          name: "Invalid Token",
          description: "Invalid token",
          scope: "site",
          light: lightTokens as any,
          dark: minimalistBuiltIn.getTokens("dark"),
        }),
      ).toThrow(/token|invalid|unknown|not allowed/i);
    });
  });

  // ========================================================================
  // BEHAVIOR 3: Light and dark variants are independent token sets
  // ========================================================================
  describe("Behavior 3: Light and dark variants are independent token sets", () => {
    it("should return different token values for light vs dark modes", () => {
      const skin = Skin.create({
        id: "contrast-skin",
        name: "Contrast",
        description: "Different light and dark",
        scope: "site",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      const lightTokens = skin.getTokens("light");
      const darkTokens = skin.getTokens("dark");

      // Verify at least some tokens differ between light and dark
      const lightBg = lightTokens.bgPrimary;
      const darkBg = darkTokens.bgPrimary;
      const lightText = lightTokens.textPrimary;
      const darkText = darkTokens.textPrimary;

      // These should be visually different for contrast
      expect(darkBg).not.toBe(lightBg);
      expect(darkText).not.toBe(lightText);
    });

    it("should preserve exact token values when accessed", () => {
      const customLight = minimalistBuiltIn.getTokens("light");
      const customLight2 = { ...customLight, bgPrimary: "#CUSTOM123" };

      const skin = Skin.create({
        id: "custom-value-skin",
        name: "Custom Values",
        description: "Custom values",
        scope: "site",
        light: customLight2,
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      const retrieved = skin.getTokens("light");
      expect(retrieved.bgPrimary).toBe("#CUSTOM123");
    });
  });

  // ========================================================================
  // BEHAVIOR 4: Extends mechanism inherits from parent skin (optional)
  // ========================================================================
  describe("Behavior 4: Extends mechanism inherits from parent skin (optional)", () => {
    it("should create skin without extends", () => {
      const skin = Skin.create({
        id: "no-extend-skin",
        name: "No Extend",
        description: "No inheritance",
        scope: "site",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      expect(skin).toBeDefined();
      expect(skin.extends).toBeUndefined();
    });

    it("should create skin with extends referencing built-in skin", () => {
      const skin = Skin.create({
        id: "extended-skin",
        name: "Extended",
        description: "Extends minimalist",
        scope: "page",
        light: { bgPrimary: "#CUSTOM" },
        dark: { bgPrimary: "#CUSTOM_DARK" },
        extends: "minimalist",
      });

      expect(skin.extends).toBe("minimalist");
    });

    it("should reject extends when referenced skin does not exist", () => {
      expect(() =>
        Skin.create({
          id: "invalid-extend-skin",
          name: "Invalid Extend",
          description: "Bad reference",
          scope: "site",
          light: { bgPrimary: "#FFF" },
          dark: { bgPrimary: "#000" },
          extends: "nonexistent-skin",
        }),
      ).toThrow(/extends|reference|not found|does not exist/i);
    });
  });

  // ========================================================================
  // BEHAVIOR 5: Token merge merges parent + child (child wins on conflict)
  // ========================================================================
  describe("Behavior 5: Token merge merges parent + child tokens (child overrides parent)", () => {
    it("should merge tokens when extending, with child overriding parent", () => {
      const skin = Skin.create({
        id: "override-skin",
        name: "Override",
        description: "Overrides parent",
        scope: "widget",
        light: {
          bgPrimary: "#CHILD_OVERRIDE",
          bgSecondary: "#CHILD_BG2",
          textPrimary: "#CHILD_TEXT",
        },
        dark: {
          bgPrimary: "#DARK_CHILD",
          bgSecondary: "#DARK_BG2",
          textPrimary: "#DARK_TEXT",
        },
        extends: "minimalist",
      });

      const mergedLight = skin.getTokens("light");
      const mergedDark = skin.getTokens("dark");

      // Child values should override parent
      expect(mergedLight.bgPrimary).toBe("#CHILD_OVERRIDE");
      expect(mergedLight.textPrimary).toBe("#CHILD_TEXT");
      expect(mergedDark.bgPrimary).toBe("#DARK_CHILD");

      // Parent values should fill in missing child properties
      expect(mergedLight.fontBody).toBe(
        minimalistBuiltIn.getTokens("light").fontBody,
      );
      expect(mergedDark.fontMono).toBe(
        minimalistBuiltIn.getTokens("dark").fontMono,
      );
    });

    it("should have complete merged token set even with partial child overrides", () => {
      const skin = Skin.create({
        id: "partial-override-skin",
        name: "Partial Override",
        description: "Partial child overrides",
        scope: "widget",
        light: {
          bgPrimary: "#CUSTOM",
          accent: "#FF0000",
        },
        dark: {
          bgPrimary: "#DARK_CUSTOM",
          accent: "#00FF00",
        },
        extends: "minimalist",
      });

      const merged = skin.getTokens("light");

      // Should have all 27 tokens
      expect(Object.keys(merged).length).toBe(27);

      // Child overrides
      expect(merged.bgPrimary).toBe("#CUSTOM");
      expect(merged.accent).toBe("#FF0000");

      // Parent fills in missing
      expect(merged.contentMaxWidth).toBe("720px");
      expect(merged.fontBody).toBeDefined();
    });

    it("should ensure merged tokens do not exceed 28 tokens (no extra keys)", () => {
      const skin = Skin.create({
        id: "merge-no-extra-skin",
        name: "Merge No Extra",
        description: "No extra keys after merge",
        scope: "site",
        light: { bgPrimary: "#FFF" },
        dark: { bgPrimary: "#000" },
        extends: "minimalist",
      });

      const merged = skin.getTokens("light");
      expect(Object.keys(merged).length).toBe(27);
    });
  });

  // ========================================================================
  // BEHAVIOR 6: Scope is informational (site, page, widget)
  // ========================================================================
  describe("Behavior 6: Scope is informational (site, page, widget)", () => {
    it("should allow site scope", () => {
      const skin = Skin.create({
        id: "site-scope-skin",
        name: "Site Scope",
        description: "Site level",
        scope: "site",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      expect(skin.scope).toBe("site");
    });

    it("should allow page scope", () => {
      const skin = Skin.create({
        id: "page-scope-skin",
        name: "Page Scope",
        description: "Page level",
        scope: "page",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      expect(skin.scope).toBe("page");
    });

    it("should allow widget scope", () => {
      const skin = Skin.create({
        id: "widget-scope-skin",
        name: "Widget Scope",
        description: "Widget level",
        scope: "widget",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      expect(skin.scope).toBe("widget");
    });

    it("should reject invalid scope values", () => {
      expect(() =>
        Skin.create({
          id: "invalid-scope-skin",
          name: "Invalid",
          description: "Bad scope",
          scope: "container" as any,
          light: minimalistBuiltIn.getTokens("light"),
          dark: minimalistBuiltIn.getTokens("dark"),
        }),
      ).toThrow(/scope/i);
    });
  });

  // ========================================================================
  // BEHAVIOR 7: Built-in skins are loaded with correct identities
  // ========================================================================
  describe("Behavior 7: Built-in skins are loaded with correct identities", () => {
    it("should load minimalist built-in skin", () => {
      const skin = SkinRegistry.getBuiltInSkin("minimalist");
      expect(skin).toBeDefined();
      expect(skin.id).toBe("minimalist");
      expect(skin.name).toBe("Minimalist");
    });

    it("should load modern-tech built-in skin", () => {
      const skin = SkinRegistry.getBuiltInSkin("modern-tech");
      expect(skin).toBeDefined();
      expect(skin.id).toBe("modern-tech");
      expect(skin.name).toBe("Modern Tech");
    });

    it("should load professional built-in skin", () => {
      const skin = SkinRegistry.getBuiltInSkin("professional");
      expect(skin).toBeDefined();
      expect(skin.id).toBe("professional");
      expect(skin.name).toBe("Professional");
    });

    it("should load vaporwave built-in skin", () => {
      const skin = SkinRegistry.getBuiltInSkin("vaporwave");
      expect(skin).toBeDefined();
      expect(skin.id).toBe("vaporwave");
      expect(skin.name).toBe("Vaporwave");
    });

    it("should reject request for non-existent built-in skin", () => {
      expect(() => SkinRegistry.getBuiltInSkin("nonexistent")).toThrow(
        /not found|nonexistent/i,
      );
    });

    it("should list all available built-in skins", () => {
      const skins = SkinRegistry.listBuiltInSkins();
      expect(skins).toContain("minimalist");
      expect(skins).toContain("modern-tech");
      expect(skins).toContain("professional");
      expect(skins).toContain("vaporwave");
      expect(skins.length).toBe(4);
    });
  });

  // ========================================================================
  // BEHAVIOR 8: Skin instances are immutable (frozen)
  // ========================================================================
  describe("Behavior 8: Skin instances are immutable (frozen)", () => {
    it("should prevent modification of skin properties after creation", () => {
      const skin = Skin.create({
        id: "immutable-skin",
        name: "Immutable",
        description: "Cannot be changed",
        scope: "site",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      expect(() => {
        (skin as any).id = "modified";
      }).toThrow();

      expect(() => {
        (skin as any).name = "Modified";
      }).toThrow();
    });

    it("should prevent modification of token objects after retrieval", () => {
      const skin = Skin.create({
        id: "frozen-tokens-skin",
        name: "Frozen",
        description: "Tokens are frozen",
        scope: "site",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      const tokens = skin.getTokens("light");

      expect(() => {
        (tokens as any).bgPrimary = "#MODIFIED";
      }).toThrow();
    });
  });

  // ========================================================================
  // BEHAVIOR 9: getTokens method returns correct mode (light/dark)
  // ========================================================================
  describe("Behavior 9: getTokens(mode) returns correct token variant", () => {
    it("should return light tokens when requested", () => {
      const skin = Skin.create({
        id: "light-tokens-skin",
        name: "Light Tokens",
        description: "Light mode",
        scope: "site",
        light: {
          bgPrimary: "#FFFFFF",
          bgSecondary: "#F5F5F5",
          textPrimary: "#000000",
        },
        dark: minimalistBuiltIn.getTokens("dark"),
        extends: "minimalist",
      });

      const lightTokens = skin.getTokens("light");
      expect(lightTokens.bgPrimary).toBe("#FFFFFF");
      expect(lightTokens.textPrimary).toBe("#000000");
    });

    it("should return dark tokens when requested", () => {
      const skin = Skin.create({
        id: "dark-tokens-skin",
        name: "Dark Tokens",
        description: "Dark mode",
        scope: "site",
        light: minimalistBuiltIn.getTokens("light"),
        dark: {
          bgPrimary: "#000000",
          bgSecondary: "#1A1A1A",
          textPrimary: "#FFFFFF",
        },
        extends: "minimalist",
      });

      const darkTokens = skin.getTokens("dark");
      expect(darkTokens.bgPrimary).toBe("#000000");
      expect(darkTokens.textPrimary).toBe("#FFFFFF");
    });

    it("should reject invalid mode parameter", () => {
      const skin = Skin.create({
        id: "mode-test-skin",
        name: "Mode Test",
        description: "Test",
        scope: "site",
        light: minimalistBuiltIn.getTokens("light"),
        dark: minimalistBuiltIn.getTokens("dark"),
      });

      expect(() => skin.getTokens("auto" as any)).toThrow(/mode|light|dark/i);
    });
  });

  // ========================================================================
  // BEHAVIOR 10: Built-in skins have visual parity with v0.x theme system
  // ========================================================================
  describe("Behavior 10: Built-in skins match v0.x theme token values", () => {
    it("minimalist light tokens should have correct values", () => {
      const skin = SkinRegistry.getBuiltInSkin("minimalist");
      const light = skin.getTokens("light");

      expect(light.bgPrimary).toBe("#F9F8F5");
      expect(light.textPrimary).toBe("#141414");
      expect(light.accent).toBe("#141414");
      expect(light.borderRadius).toBe("0");
    });

    it("minimalist dark tokens should have correct values", () => {
      const skin = SkinRegistry.getBuiltInSkin("minimalist");
      const dark = skin.getTokens("dark");

      expect(dark.bgPrimary).toBe("#0E0E0C");
      expect(dark.textPrimary).toBe("#F0EFE8");
      expect(dark.accent).toBe("#F0EFE8");
    });

    it("modern-tech light tokens should have correct values", () => {
      const skin = SkinRegistry.getBuiltInSkin("modern-tech");
      const light = skin.getTokens("light");

      expect(light.bgPrimary).toBe("#F0F4F8");
      expect(light.accent).toBe("#0095C8");
      expect(light.accentSecondary).toBe("#6D3FD9");
      expect(light.borderRadius).toBe("0.75rem");
    });

    it("modern-tech dark tokens should have correct values", () => {
      const skin = SkinRegistry.getBuiltInSkin("modern-tech");
      const dark = skin.getTokens("dark");

      expect(dark.bgPrimary).toBe("#080C10");
      expect(dark.accent).toBe("#00D4FF");
      expect(dark.accentSecondary).toBe("#8B5CF6");
    });
  });
});
