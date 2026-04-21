/**
 * Config Loader BDD Tests
 *
 * Behavior-driven tests for the config loader orchestration layer.
 * Tests cover:
 * - Happy path: YAML string/file → Site aggregate root
 * - Error cases: invalid YAML, missing required fields, duplicate IDs
 * - Immutability: all domain objects frozen after creation
 * - Round-trip consistency: YAML → Site → queries
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  loadSiteFromString,
  loadSiteFromFile,
  type ConfigLoaderError,
} from "../configLoader";
import { Site } from "../../domain/Site";

// ─── Test Fixtures ───────────────────────────────────────────────────────

/**
 * Helper: Generate complete token set for light/dark mode
 */
function createCompleteTokens() {
  return {
    bgPrimary: "#ffffff",
    bgSecondary: "#f5f5f5",
    textPrimary: "#000000",
    textSecondary: "#666666",
    accent: "#0066cc",
    accentHover: "#0052a3",
    accentSecondary: null,
    accentTertiary: null,
    border: "#cccccc",
    shadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    transition: "all 0.3s ease",
    glow: "0 0 10px rgba(0,102,204,0.3)",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    spacingSection: "2rem",
    spacingCard: "1.5rem",
    spacingElement: "0.5rem",
    fontBody: "'Inter', sans-serif",
    fontHeading: "'Playfair Display', serif",
    fontMono: "'Courier New', monospace",
    headingWeight: "700",
    bodyLineHeight: "1.6",
    contentMaxWidth: "1200px",
    headingLetterSpacing: "0.02em",
    buttonTextColor: "#ffffff",
    buttonTextShadow: "none",
    scanlineOpacity: "0.15",
  };
}

function createDarkTokens() {
  return {
    bgPrimary: "#1a1a1a",
    bgSecondary: "#2d2d2d",
    textPrimary: "#ffffff",
    textSecondary: "#cccccc",
    accent: "#3385ff",
    accentHover: "#5fa3ff",
    accentSecondary: null,
    accentTertiary: null,
    border: "#444444",
    shadow: "0 2px 8px rgba(0,0,0,0.3)",
    borderRadius: "4px",
    transition: "all 0.3s ease",
    glow: "0 0 10px rgba(51,133,255,0.3)",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    spacingSection: "2rem",
    spacingCard: "1.5rem",
    spacingElement: "0.5rem",
    fontBody: "'Inter', sans-serif",
    fontHeading: "'Playfair Display', serif",
    fontMono: "'Courier New', monospace",
    headingWeight: "700",
    bodyLineHeight: "1.6",
    contentMaxWidth: "1200px",
    headingLetterSpacing: "0.02em",
    buttonTextColor: "#ffffff",
    buttonTextShadow: "none",
    scanlineOpacity: "0.15",
  };
}

/**
 * Minimal valid YAML config for testing
 */
const MINIMAL_VALID_YAML = `
seo:
  title: "Test Site"

themes:
  default: "light"

pages:
  home:
    content:
      - type: hero
        props:
          title: "Welcome"

skins:
  light:
    name: "Light Skin"
    description: "Light theme"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

/**
 * YAML config with multiple pages and widgets
 */
const MULTI_PAGE_YAML = `
seo:
  title: "Multi Page Site"
  description: "A site with multiple pages"

themes:
  default: "light"

pages:
  home:
    title: "Home"
    description: "Homepage"
    content:
      - type: hero
        props:
          title: "Hero"
          subtitle: "Welcome"

  about:
    title: "About"
    description: "About page"
    content:
      - type: portfolio
        props:
          title: "My Work"

  contact:
    title: "Contact"
    description: "Contact page"
    content:
      - type: contact
        props:
          title: "Get In Touch"
          email: "test@example.com"

skins:
  light:
    name: "Light Skin"
    description: "Light theme"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"

  dark:
    name: "Dark Skin"
    description: "Dark theme"
    scope: site
    light:
      bgPrimary: "#f5f5f5"
      bgSecondary: "#e0e0e0"
      textPrimary: "#333333"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#000000"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

/**
 * YAML config with containers and nested widgets
 */
const CONTAINER_YAML = `
seo:
  title: "Container Site"

themes:
  default: "light"

pages:
  home:
    content:
      - type: container
        layout: grid
        props:
          columns: 2
        children:
          - type: hero
            props:
              title: "Left Hero"
          - type: portfolio
            props:
              title: "Right Portfolio"
      - type: container
        layout: flex
        children:
          - type: skills
            props:
              title: "Skills"
          - type: contact
            props:
              title: "Contact"
              email: "test@example.com"

skins:
  light:
    name: "Light Skin"
    description: "Light theme"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

/**
 * YAML with missing required pages section
 */
const INVALID_MISSING_PAGES = `
seo:
  title: "No Pages"

themes:
  default: "light"
`;

/**
 * YAML with invalid widget type (not in registry)
 */
const INVALID_WIDGET_TYPE = `
seo:
  title: "Invalid Widget"

themes:
  default: "light"

pages:
  home:
    content:
      - type: unknownWidget
        props:
          title: "Unknown"

skins:
  light:
    name: "Light"
    description: "Light"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

/**
 * YAML with invalid default skin reference
 */
const INVALID_DEFAULT_SKIN = `
seo:
  title: "Invalid Default"

themes:
  default: "nonexistent"

pages:
  home:
    content:
      - type: hero
        props:
          title: "Hero"

skins:
  light:
    name: "Light"
    description: "Light"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

/**
 * YAML with deeply nested containers
 */
const DEEPLY_NESTED_YAML = `
seo:
  title: "Deep Nesting"

themes:
  default: "light"

pages:
  home:
    content:
      - type: container
        layout: grid
        children:
          - type: container
            layout: flex
            children:
              - type: container
                layout: stack
                children:
                  - type: hero
                    props:
                      title: "Deep"

skins:
  light:
    name: "Light"
    description: "Light"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

// ─── Helper Functions ────────────────────────────────────────────────────

/**
 * Write YAML to temp file and return path
 */
function writeTempYamlFile(content: string): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "configLoader-"));
  const filePath = path.join(tmpDir, "test-config.yaml");
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

/**
 * Clean up temp file
 */
function cleanupTempFile(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
    const dir = path.dirname(filePath);
    fs.rmdirSync(dir);
  } catch (e) {
    // Ignore cleanup errors
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe("Config Loader", () => {
  describe("Behavior 1: Load YAML string and return fully composed Site", () => {
    it("Given a minimal valid YAML, When loaded, Then returns Site with page and skin", () => {
      // Given: valid YAML string
      const yaml = MINIMAL_VALID_YAML;

      // When: loaded from string
      const site = loadSiteFromString(yaml, "test-config.yaml");

      // Then: returns Site instance
      expect(site).toBeInstanceOf(Site);
      expect(site.id).toBeDefined();
      expect(site.title).toBeDefined();
      expect(site.defaultSkinId).toBe("light");

      // And: has one page
      const pages = site.listPages();
      expect(pages).toHaveLength(1);
      expect(pages[0].id).toBe("home");

      // And: has one skin
      expect(site.getSkin("light")).toBeDefined();
    });

    it("Given a YAML with multiple pages, When loaded, Then all pages are composed", () => {
      // Given: YAML with multiple pages
      const yaml = MULTI_PAGE_YAML;

      // When: loaded
      const site = loadSiteFromString(yaml, "test-config.yaml");

      // Then: all pages exist
      const pages = site.listPages();
      expect(pages).toHaveLength(3);

      expect(site.getPage("home")).toBeDefined();
      expect(site.getPage("about")).toBeDefined();
      expect(site.getPage("contact")).toBeDefined();

      // And: pages have correct content
      const homePage = site.getPage("home")!;
      expect(homePage.content).toHaveLength(1);
      expect(homePage.content[0].type).toBe("hero");
    });

    it("Given a YAML with containers, When loaded, Then containers and their children are composed", () => {
      // Given: YAML with containers
      const yaml = CONTAINER_YAML;

      // When: loaded
      const site = loadSiteFromString(yaml, "test-config.yaml");

      // Then: pages exist
      expect(site.getPage("home")).toBeDefined();

      // And: containers are in content
      const homepage = site.getPage("home")!;
      expect(homepage.content.length).toBeGreaterThan(0);

      // First item should be a container
      const firstContainer = homepage.content[0];
      expect(firstContainer.layout).toBe("grid");
      expect((firstContainer as any).children.length).toBeGreaterThan(0);
    });

    it("Given a YAML with multiple skins, When loaded, Then all skins are available", () => {
      // Given: YAML with multiple skins
      const yaml = MULTI_PAGE_YAML;

      // When: loaded
      const site = loadSiteFromString(yaml, "test-config.yaml");

      // Then: both skins exist
      expect(site.getSkin("light")).toBeDefined();
      expect(site.getSkin("dark")).toBeDefined();

      // And: default skin is correct
      expect(site.getDefaultSkin().id).toBe("light");
    });

    it("Given a YAML with deeply nested containers, When loaded, Then all nesting levels are preserved", () => {
      // Given: deeply nested containers
      const yaml = DEEPLY_NESTED_YAML;

      // When: loaded
      const site = loadSiteFromString(yaml, "test-config.yaml");

      // Then: page exists
      const page = site.getPage("home")!;
      expect(page).toBeDefined();

      // And: can traverse nested containers
      const level1 = page.content[0] as any;
      expect(level1.layout).toBe("grid");

      const level2 = level1.children[0] as any;
      expect(level2.layout).toBe("flex");

      const level3 = level2.children[0] as any;
      expect(level3.layout).toBe("stack");

      // And: leaf widget exists at deepest level
      const leafWidget = level3.children[0] as any;
      expect(leafWidget.type).toBe("hero");
    });
  });

  describe("Behavior 2: Load YAML from file path", () => {
    it("Given a valid YAML file path, When loaded, Then returns Site with all composed objects", () => {
      // Given: a valid YAML file
      const filePath = writeTempYamlFile(MINIMAL_VALID_YAML);

      try {
        // When: loaded from file path
        const site = loadSiteFromFile(filePath);

        // Then: returns Site instance
        expect(site).toBeInstanceOf(Site);
        expect(site.getPage("home")).toBeDefined();
        expect(site.getSkin("light")).toBeDefined();
      } finally {
        cleanupTempFile(filePath);
      }
    });

    it("Given a non-existent file path, When loaded, Then throws ConfigLoaderError with file context", () => {
      // Given: non-existent path
      const filePath = "/nonexistent/path/config.yaml";

      // When/Then: throws error
      expect(() => loadSiteFromFile(filePath)).toThrow();
    });
  });

  describe("Behavior 3: Validate and report contextual errors", () => {
    it("Given YAML with missing required 'pages' section, When loaded, Then throws ConfigLoaderError with message", () => {
      // Given: invalid YAML
      const yaml = INVALID_MISSING_PAGES;

      // When/Then: throws error
      expect(() => loadSiteFromString(yaml, "test-config.yaml")).toThrow();
    });

    it("Given YAML with invalid widget type, When loaded, Then throws ConfigLoaderError mentioning unknown type", () => {
      // Given: YAML with unknown widget
      const yaml = INVALID_WIDGET_TYPE;

      // When/Then: throws error mentioning widget type
      expect(() => loadSiteFromString(yaml, "test-config.yaml")).toThrow(
        /unknownWidget|not registered/i,
      );
    });

    it("Given YAML with invalid default skin reference, When loaded, Then throws ConfigLoaderError", () => {
      // Given: YAML with non-existent default skin
      const yaml = INVALID_DEFAULT_SKIN;

      // When/Then: throws error
      expect(() => loadSiteFromString(yaml, "test-config.yaml")).toThrow();
    });

    it("Given invalid YAML syntax, When loaded, Then throws ConfigLoaderError with line number", () => {
      // Given: syntactically invalid YAML
      const yaml = `
seo:
  title: "Test
  incomplete: true
`;

      // When/Then: throws error
      expect(() => loadSiteFromString(yaml, "test-config.yaml")).toThrow();
    });
  });

  describe("Behavior 4: Immutability - all domain objects frozen", () => {
    it("Given a loaded Site, When attempting to modify, Then throws TypeError", () => {
      // Given: loaded site
      const site = loadSiteFromString(MINIMAL_VALID_YAML, "test-config.yaml");

      // When/Then: cannot modify site properties
      expect(() => {
        (site as any).id = "modified";
      }).toThrow();
    });

    it("Given a Page from Site, When attempting to modify content, Then throws TypeError", () => {
      // Given: loaded site
      const site = loadSiteFromString(MINIMAL_VALID_YAML, "test-config.yaml");
      const page = site.getPage("home")!;

      // When/Then: cannot modify content array
      expect(() => {
        const content = page.content as any;
        content.push({});
      }).toThrow();
    });

    it("Given a Skin from Site, When attempting to modify tokens, Then throws TypeError", () => {
      // Given: loaded site
      const site = loadSiteFromString(MINIMAL_VALID_YAML, "test-config.yaml");
      const skin = site.getSkin("light")!;

      // When/Then: cannot modify skin
      expect(() => {
        (skin as any).id = "modified";
      }).toThrow();
    });

    it("Given Site's pages registry, When attempting to add page, Then throws TypeError", () => {
      // Given: loaded site
      const site = loadSiteFromString(MINIMAL_VALID_YAML, "test-config.yaml");

      // When/Then: cannot modify pages registry
      expect(() => {
        (site as any)._pages.set("new-page", {});
      }).toThrow();
    });

    it("Given Site's skins registry, When attempting to add skin, Then throws TypeError", () => {
      // Given: loaded site
      const site = loadSiteFromString(MINIMAL_VALID_YAML, "test-config.yaml");

      // When/Then: cannot modify skins registry
      expect(() => {
        (site as any)._skins.set("new-skin", {});
      }).toThrow();
    });
  });

  describe("Behavior 5: Round-trip consistency - YAML to Site queries", () => {
    it("Given YAML with specific page content, When loaded and queried, Then queries return consistent values", () => {
      // Given: YAML
      const yaml = MINIMAL_VALID_YAML;

      // When: loaded
      const site = loadSiteFromString(yaml, "test-config.yaml");
      const page = site.getPage("home")!;

      // Then: multiple queries return same values
      expect(page.id).toBe("home");
      expect(page.id).toBe(site.listPages()[0].id); // Consistent across calls
      expect(site.getPage("home")?.id).toBe("home"); // Multiple gets are consistent
    });

    it("Given YAML with multiple skins, When loaded and queried, Then all skins accessible", () => {
      // Given: YAML with skins
      const yaml = MULTI_PAGE_YAML;

      // When: loaded
      const site = loadSiteFromString(yaml, "test-config.yaml");

      // Then: both skins exist and are consistent
      const lightSkin1 = site.getSkin("light");
      const lightSkin2 = site.getSkin("light");
      expect(lightSkin1).toBe(lightSkin2); // Same object reference

      const darkSkin = site.getSkin("dark");
      expect(darkSkin).toBeDefined();
    });

    it("Given YAML with non-existent page, When queried, Then returns undefined", () => {
      // Given: loaded site
      const site = loadSiteFromString(MINIMAL_VALID_YAML, "test-config.yaml");

      // When/Then: query for missing page returns undefined
      expect(site.getPage("nonexistent")).toBeUndefined();
    });
  });

  describe("Behavior 6: Support both file and string content loading", () => {
    it("Given YAML file path, When loaded with loadSiteFromFile, Then returns Site", () => {
      // Given: file path
      const filePath = writeTempYamlFile(MINIMAL_VALID_YAML);

      try {
        // When: loaded from file
        const site = loadSiteFromFile(filePath);

        // Then: returns Site
        expect(site).toBeInstanceOf(Site);
      } finally {
        cleanupTempFile(filePath);
      }
    });

    it("Given YAML string, When loaded with loadSiteFromString, Then returns Site", () => {
      // Given: YAML string
      const yaml = MINIMAL_VALID_YAML;

      // When: loaded from string
      const site = loadSiteFromString(yaml, "test-config.yaml");

      // Then: returns Site
      expect(site).toBeInstanceOf(Site);
    });

    it("Given same YAML content from file and string, When both loaded, Then both produce equivalent Sites", () => {
      // Given: same content
      const yaml = MULTI_PAGE_YAML;
      const filePath = writeTempYamlFile(yaml);

      try {
        // When: loaded from both sources
        const siteFromString = loadSiteFromString(yaml, "test-config.yaml");
        const siteFromFile = loadSiteFromFile(filePath);

        // Then: both have same structure
        expect(siteFromString.listPages()).toHaveLength(
          siteFromFile.listPages().length,
        );
        expect(siteFromString.listPages().map((p) => p.id)).toEqual(
          siteFromFile.listPages().map((p) => p.id),
        );
      } finally {
        cleanupTempFile(filePath);
      }
    });
  });

  describe("Behavior 7: Build domain objects bottom-up correctly", () => {
    it("Given YAML with container and nested widgets, When loaded, Then widgets composed before containers", () => {
      // Given: YAML with containers
      const yaml = CONTAINER_YAML;

      // When: loaded
      const site = loadSiteFromString(yaml, "test-config.yaml");
      const page = site.getPage("home")!;

      // Then: first content is a container
      const container = page.content[0];
      expect(container.layout).toBeDefined();

      // And: container children are widgets
      const children = (container as any).children;
      expect(children.length).toBeGreaterThan(0);

      // First child should be a widget
      const firstChild = children[0];
      expect(firstChild.type).toBeDefined();
      expect(firstChild.parameters).toBeDefined();
    });

    it("Given YAML with page containing widgets, When loaded, Then widgets properly instantiated with parameters", () => {
      // Given: YAML
      const yaml = MINIMAL_VALID_YAML;

      // When: loaded
      const site = loadSiteFromString(yaml, "test-config.yaml");
      const page = site.getPage("home")!;

      // Then: widget has type and parameters
      const widget = page.content[0];
      expect(widget.type).toBe("hero");
      expect(widget.parameters).toHaveProperty("title");
      expect(widget.parameters.title).toBe("Welcome");
    });
  });

  describe("Behavior 8: Edge cases and error handling", () => {
    it("Given YAML with missing pages section, When loaded, Then throws descriptive error", () => {
      // Given: YAML without pages
      const yaml = INVALID_MISSING_PAGES;

      // When/Then: throws error
      expect(() => loadSiteFromString(yaml, "test-config.yaml")).toThrow();
    });

    it("Given YAML with duplicate page IDs, When loaded, Then throws error about duplicate", () => {
      // Given: YAML with duplicate pages (this would require custom YAML)
      const yaml = `
seo:
  title: "Test"
themes:
  default: "light"
pages:
  home:
    content:
      - type: hero
        props:
          title: "Home"
  home:
    content:
      - type: hero
        props:
          title: "Duplicate"
skins:
  light:
    name: "Light"
    description: "Light"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

      // When/Then: YAML parser will catch duplicate keys and throw
      expect(() => loadSiteFromString(yaml, "test-config.yaml")).toThrow();
    });

    it("Given YAML with widget missing required parameters, When loaded, Then throws validation error", () => {
      // Given: hero widget without required title
      const yaml = `
seo:
  title: "Test"
themes:
  default: "light"
pages:
  home:
    content:
      - type: hero
        props:
          subtitle: "Missing title"
skins:
  light:
    name: "Light"
    description: "Light"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

      // When/Then: throws validation error
      expect(() => loadSiteFromString(yaml, "test-config.yaml")).toThrow(
        /required|hero/i,
      );
    });

    it("Given YAML with container without layout, When loaded, Then uses default layout", () => {
      // Given: container without explicit layout
      const yaml = `
seo:
  title: "Test"
themes:
  default: "light"
pages:
  home:
    content:
      - type: container
        children:
          - type: hero
            props:
              title: "Test"
skins:
  light:
    name: "Light"
    description: "Light"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

      // When: loaded
      const site = loadSiteFromString(yaml, "test-config.yaml");
      const page = site.getPage("home")!;
      const container = page.content[0] as any;

      // Then: container has default layout
      expect(container.layout).toBe("default");
    });

    it("Given container with empty children (edge case in YAML), When loaded, Then page construction validates and throws", () => {
      // Given: container with empty children array (which should fail)
      const yaml = `
seo:
  title: "Test"
themes:
  default: "light"
pages:
  home:
    content:
      - type: container
        layout: grid
        children: []
skins:
  light:
    name: "Light"
    description: "Light"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000000"
      textSecondary: "#666666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#cccccc"
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(0,102,204,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#ffffff"
      textSecondary: "#cccccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444444"
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
      borderRadius: "4px"
      transition: "all 0.3s ease"
      glow: "0 0 10px rgba(51,133,255,0.3)"
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      spacingSection: "2rem"
      spacingCard: "1.5rem"
      spacingElement: "0.5rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Playfair Display', serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1200px"
      headingLetterSpacing: "0.02em"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

      // When/Then: throws error about empty children
      expect(() => loadSiteFromString(yaml, "test-config.yaml")).toThrow(
        /children.*cannot be empty|children.*array/i,
      );
    });

    it("Given application config with no skins defined, When loaded, Then throws error about missing default skin", () => {
      // Given: YAML without skins
      const yaml = `
seo:
  title: "No Skins"
themes:
  default: "light"
pages:
  home:
    content:
      - type: hero
        props:
          title: "Test"
`;

      // When/Then: throws error
      expect(() => loadSiteFromString(yaml, "test-config.yaml")).toThrow();
    });
  });
});
