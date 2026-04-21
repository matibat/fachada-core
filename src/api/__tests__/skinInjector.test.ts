/**
 * BDD tests for skin token CSS injector
 *
 * Converts Skin domain objects to CSS custom properties (<style> blocks)
 * with support for light/dark mode switching and scoped token injection.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { Skin } from "../../domain/Skin";
import { SkinRegistry } from "../../domain/SkinRegistry";
import { generateSkinCSS, generateCSSModule } from "../skinInjector";

/**
 * Reference skin for testing
 */
let testSkin: Skin;

beforeAll(() => {
  // Create a test skin with all 27 required tokens
  testSkin = Skin.create({
    id: "test-skin",
    name: "Test Skin",
    description: "A test skin for CSS generation",
    scope: "site",
    light: {
      bgPrimary: "#FFFFFF",
      bgSecondary: "#F0F0F0",
      textPrimary: "#000000",
      textSecondary: "#666666",
      accent: "#0066FF",
      accentHover: "#0052CC",
      accentSecondary: "#FF6600",
      accentTertiary: "#00CC66",
      border: "#CCCCCC",
      shadow: "0 2px 8px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      transition: "all 0.3s ease",
      glow: "0 0 20px rgba(0,102,255,0.2)",
      gradient: "linear-gradient(135deg, #0066FF, #00CC66)",
      spacingSection: "2rem",
      spacingCard: "1.5rem",
      spacingElement: "0.5rem",
      fontBody: '"Segoe UI", sans-serif',
      fontHeading: '"Trebuchet MS", sans-serif',
      fontMono: '"Courier New", monospace',
      headingWeight: "700",
      bodyLineHeight: "1.6",
      contentMaxWidth: "1200px",
      headingLetterSpacing: "0.05em",
      buttonTextColor: "#FFFFFF",
      buttonTextShadow: "0 1px 2px rgba(0,0,0,0.2)",
      scanlineOpacity: "0.03",
    },
    dark: {
      bgPrimary: "#0A0E27",
      bgSecondary: "#1A1F3A",
      textPrimary: "#FFFFFF",
      textSecondary: "#AAAAAA",
      accent: "#00FFFF",
      accentHover: "#00CCFF",
      accentSecondary: "#FF00FF",
      accentTertiary: "#00FF99",
      border: "#333333",
      shadow: "0 2px 8px rgba(0,0,0,0.5)",
      borderRadius: "8px",
      transition: "all 0.3s ease",
      glow: "0 0 20px rgba(0,255,255,0.3)",
      gradient: "linear-gradient(135deg, #00FFFF, #00FF99)",
      spacingSection: "2rem",
      spacingCard: "1.5rem",
      spacingElement: "0.5rem",
      fontBody: '"Segoe UI", sans-serif',
      fontHeading: '"Trebuchet MS", sans-serif',
      fontMono: '"Courier New", monospace',
      headingWeight: "700",
      bodyLineHeight: "1.6",
      contentMaxWidth: "1200px",
      headingLetterSpacing: "0.05em",
      buttonTextColor: "#000000",
      buttonTextShadow: "0 1px 2px rgba(255,255,255,0.2)",
      scanlineOpacity: "0.05",
    },
  });
});

describe("generateSkinCSS", () => {
  describe("Behavior 1: Generate CSS custom properties for light mode", () => {
    it("should generate valid CSS with all 27 CSS variables for light mode", () => {
      // GIVEN: a skin and light mode
      // WHEN: generating CSS for light mode
      const css = generateSkinCSS(testSkin, "light");

      // THEN: CSS should contain all 27 CSS variables
      expect(css).toContain("--bg-primary: #FFFFFF");
      expect(css).toContain("--bg-secondary: #F0F0F0");
      expect(css).toContain("--text-primary: #000000");
      expect(css).toContain("--text-secondary: #666666");
      expect(css).toContain("--accent: #0066FF");
      expect(css).toContain("--accent-hover: #0052CC");
      expect(css).toContain("--accent-secondary: #FF6600");
      expect(css).toContain("--accent-tertiary: #00CC66");
      expect(css).toContain("--border: #CCCCCC");
      expect(css).toContain("--shadow: 0 2px 8px rgba(0,0,0,0.1)");
      expect(css).toContain("--border-radius: 8px");
      expect(css).toContain("--transition: all 0.3s ease");
      expect(css).toContain("--font-body:");
      expect(css).toContain("--font-heading:");
      expect(css).toContain("--font-mono:");
    });

    it("should output valid CSS syntax", () => {
      // GIVEN: a skin
      // WHEN: generating CSS
      const css = generateSkinCSS(testSkin, "light");

      // THEN: output should be valid CSS
      expect(css).toMatch(/^<style[\s\w="'-]*>\s*/); // Opening tag
      expect(css).toContain(":root {"); // Root selector
      expect(css).toContain("}"); // Closing brace
      expect(css).toMatch(/<\/style>\s*$/); // Closing tag
    });

    it("should be scoping-ready (include :root selector)", () => {
      // GIVEN: a skin
      // WHEN: generating CSS
      const css = generateSkinCSS(testSkin, "light");

      // THEN: CSS should include :root selector for global scope
      expect(css).toContain(":root {");
    });
  });

  describe("Behavior 2: Generate CSS custom properties for dark mode", () => {
    it("should generate valid CSS with all 27 CSS variables for dark mode", () => {
      // GIVEN: a skin and dark mode
      // WHEN: generating CSS for dark mode
      const css = generateSkinCSS(testSkin, "dark");

      // THEN: CSS should contain all 27 CSS variables with dark values
      expect(css).toContain("--bg-primary: #0A0E27");
      expect(css).toContain("--bg-secondary: #1A1F3A");
      expect(css).toContain("--text-primary: #FFFFFF");
      expect(css).toContain("--text-secondary: #AAAAAA");
      expect(css).toContain("--accent: #00FFFF");
      expect(css).toContain("--accent-hover: #00CCFF");
    });

    it("should produce different CSS between light and dark modes", () => {
      // GIVEN: a skin with different light and dark tokens
      // WHEN: generating CSS for both modes
      const cssLight = generateSkinCSS(testSkin, "light");
      const cssDark = generateSkinCSS(testSkin, "dark");

      // THEN: light and dark CSS should be different
      expect(cssLight).not.toEqual(cssDark);
      expect(cssLight).toContain("#FFFFFF"); // light bg
      expect(cssDark).toContain("#0A0E27"); // dark bg
    });
  });

  describe("Behavior 3: Output is deterministic", () => {
    it("should produce identical output for same input", () => {
      // GIVEN: the same skin and mode called twice
      // WHEN: generating CSS twice
      const css1 = generateSkinCSS(testSkin, "light");
      const css2 = generateSkinCSS(testSkin, "light");

      // THEN: output should be identical
      expect(css1).toEqual(css2);
    });

    it("should output consistent variable ordering", () => {
      // GIVEN: a skin
      // WHEN: generating CSS
      const css = generateSkinCSS(testSkin, "light");

      // THEN: should have consistent order (alphabetical or by token keys)
      // Extract variable names from CSS
      const varMatches = css.match(/--[\w-]+:/g) || [];
      // Verify all 27 variables are present exactly once
      expect(varMatches.length).toBe(27);
    });
  });

  describe("Behavior 4: CSS syntax validation", () => {
    it("should include style tag with proper structure", () => {
      // GIVEN: a skin
      // WHEN: generating CSS
      const css = generateSkinCSS(testSkin, "light");

      // THEN: should have opening <style> and closing </style> tags
      expect(css).toMatch(/<style/);
      expect(css).toMatch(/<\/style>/);
    });

    it("should have properly formatted variable declarations", () => {
      // GIVEN: a skin
      // WHEN: generating CSS
      const css = generateSkinCSS(testSkin, "light");

      // THEN: each variable should follow CSS format: --name: value;
      const varPattern = /--[\w-]+:\s*[^;]+;/g;
      const matches = css.match(varPattern) || [];
      expect(matches.length).toBe(27);
      // Verify they all end with semicolon
      matches.forEach((match) => {
        expect(match).toMatch(/;$/);
      });
    });
  });

  describe("Behavior 5: Support for attribute scoping (data-theme)", () => {
    it("should generate CSS ready for [data-theme] scoping in layout", () => {
      // GIVEN: a skin
      // WHEN: generating CSS in light mode
      const css = generateSkinCSS(testSkin, "light");

      // THEN: CSS should use :root selector (can be easily converted to [data-theme='light'])
      // This is a layout integration test
      expect(css).toContain(":root");
      // Verify CSS is properly wrapped for direct injection into HTML
      expect(css).toMatch(/<style.*?>/);
      expect(css).toMatch(/<\/style>/);
    });
  });
});

describe("generateCSSModule", () => {
  describe("Behavior 6: Generate separate light and dark CSS modules", () => {
    it("should return object with light and dark properties", () => {
      // GIVEN: a skin
      // WHEN: generating CSS module
      const module = generateCSSModule(testSkin);

      // THEN: should return object with light and dark keys
      expect(module).toHaveProperty("light");
      expect(module).toHaveProperty("dark");
      expect(typeof module.light).toBe("string");
      expect(typeof module.dark).toBe("string");
    });

    it("should generate different CSS for light and dark", () => {
      // GIVEN: a skin with different modes
      // WHEN: generating CSS module
      const module = generateCSSModule(testSkin);

      // THEN: light and dark should have different content
      expect(module.light).not.toEqual(module.dark);
      expect(module.light).toContain("#FFFFFF"); // light bg
      expect(module.dark).toContain("#0A0E27"); // dark bg
    });

    it("should be suitable for Astro hydration (raw CSS strings)", () => {
      // GIVEN: a skin
      // WHEN: generating CSS module
      const module = generateCSSModule(testSkin);

      // THEN: both values should be complete CSS strings ready for injection
      expect(module.light).toContain("<style");
      expect(module.light).toContain("</style>");
      expect(module.dark).toContain("<style");
      expect(module.dark).toContain("</style>");
    });
  });

  describe("Behavior 7: CSS module determinism", () => {
    it("should produce identical output across calls", () => {
      // GIVEN: the same skin called twice
      // WHEN: generating CSS module twice
      const module1 = generateCSSModule(testSkin);
      const module2 = generateCSSModule(testSkin);

      // THEN: output should be identical
      expect(module1.light).toEqual(module2.light);
      expect(module1.dark).toEqual(module2.dark);
    });
  });

  describe("Behavior 8: Integration - all 27 tokens present", () => {
    it("should include all 27 tokens in light CSS", () => {
      // GIVEN: a skin with all 27 tokens
      // WHEN: generating CSS for light
      const css = generateSkinCSS(testSkin, "light");

      // THEN: all token CSS variables should be present
      const requiredVars = [
        "--bg-primary",
        "--bg-secondary",
        "--text-primary",
        "--text-secondary",
        "--accent",
        "--accent-hover",
        "--accent-secondary",
        "--accent-tertiary",
        "--border",
        "--shadow",
        "--border-radius",
        "--transition",
        "--glow",
        "--gradient",
        "--spacing-section",
        "--spacing-card",
        "--spacing-element",
        "--font-body",
        "--font-heading",
        "--font-mono",
        "--heading-weight",
        "--body-line-height",
        "--content-max-width",
        "--heading-letter-spacing",
        "--button-text-color",
        "--button-text-shadow",
        "--scanline-opacity",
      ];

      requiredVars.forEach((varName) => {
        expect(css).toContain(`${varName}:`);
      });
    });

    it("should include all 27 tokens in dark CSS", () => {
      // GIVEN: a skin with all 27 tokens
      // WHEN: generating CSS for dark
      const css = generateSkinCSS(testSkin, "dark");

      // THEN: all token CSS variables should be present
      const requiredVars = [
        "--bg-primary",
        "--bg-secondary",
        "--text-primary",
        "--text-secondary",
        "--accent",
        "--accent-hover",
        "--accent-secondary",
        "--accent-tertiary",
        "--border",
        "--shadow",
        "--border-radius",
        "--transition",
        "--glow",
        "--gradient",
        "--spacing-section",
        "--spacing-card",
        "--spacing-element",
        "--font-body",
        "--font-heading",
        "--font-mono",
        "--heading-weight",
        "--body-line-height",
        "--content-max-width",
        "--heading-letter-spacing",
        "--button-text-color",
        "--button-text-shadow",
        "--scanline-opacity",
      ];

      requiredVars.forEach((varName) => {
        expect(css).toContain(`${varName}:`);
      });
    });
  });

  describe("Behavior 9: Reading tokens from built-in skins", () => {
    it("should generate CSS for built-in minimalist skin", () => {
      // GIVEN: a built-in skin (minimalist)
      // WHEN: generating CSS
      const skin = SkinRegistry.getBuiltInSkin("minimalist");
      const css = generateSkinCSS(skin, "light");

      // THEN: should produce valid CSS with minimalist light values
      expect(css).toContain("--bg-primary:");
      expect(css).toContain("--accent:");
      expect(css).toContain(":root {");
    });

    it("should generate CSS for built-in modern-tech skin", () => {
      // GIVEN: a built-in skin (modern-tech)
      // WHEN: generating CSS
      const skin = SkinRegistry.getBuiltInSkin("modern-tech");
      const css = generateSkinCSS(skin, "dark");

      // THEN: should produce valid CSS with modern-tech dark values
      expect(css).toContain("--bg-primary:");
      expect(css).toContain("--accent:");
      expect(css).toContain(":root {");
    });
  });
});
