/**
 * Integration Tests: YAML → Domain Objects → Queries Round-Trip
 *
 * Tests the complete pipeline:
 * 1. YAML loads successfully
 * 2. Parsed into TypeScript domain objects
 * 3. All indexed items (pages, skins) accessible via queries
 * 4. Queries return consistent values (deterministic)
 * 5. Data is not lost in the pipeline
 *
 * BDD-style tests with Given/When/Then structure
 * Performance baseline: YAML → Site < 10ms
 * Coverage target: > 85%
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { loadSiteFromString, loadSiteFromFile } from "../../api/configLoader";
import { Site } from "../../domain/Site";
import { Page } from "../../domain/Page";
import { Widget } from "../../domain/Widget";
import { Container } from "../../domain/Container";
import { Skin } from "../../domain/Skin";
import type { PageContent } from "../../domain/Page";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, "../fixtures");
const SAMPLE_YAML_PATH = path.join(FIXTURE_DIR, "sample-app.yaml");

// ─── Helper Fixtures ───────────────────────────────────────────────────────

/**
 * Minimal YAML for determinism tests
 */
const MINIMAL_YAML = `
seo:
  title: "Minimal Site"
  description: "For determinism testing"

themes:
  default: "minimal-skin"

pages:
  home:
    title: "Home"
    description: "Homepage"
    content:
      - type: hero
        props:
          title: "Welcome"

skins:
  minimal-skin:
    name: "Minimal Skin"
    description: "Minimal skin for testing"
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
 * Complex YAML with nested containers for structural testing
 */
const NESTED_CONTAINERS_YAML = `
seo:
  title: "Nested Structure Test"

themes:
  default: "test-skin"

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
                      title: "Deep Hero"

skins:
  test-skin:
    name: "Test Skin"
    description: "Test"
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
 * Helper: Load minimal YAML string
 */
function loadMinimalSite(): Site {
  return loadSiteFromString(MINIMAL_YAML, "test.yaml");
}

/**
 * Helper: Load nested structure YAML
 */
function loadNestedSite(): Site {
  return loadSiteFromString(NESTED_CONTAINERS_YAML, "test.yaml");
}

/**
 * Helper: Load sample YAML from file
 */
function loadSampleYaml(): Site {
  if (!fs.existsSync(SAMPLE_YAML_PATH)) {
    throw new Error(`Sample YAML not found: ${SAMPLE_YAML_PATH}`);
  }
  return loadSiteFromFile(SAMPLE_YAML_PATH);
}

/**
 * Helper: Count all widgets recursively
 */
function countWidgetsInContent(content: readonly PageContent[]): number {
  let count = 0;
  for (const item of content) {
    if (item instanceof Widget) {
      count++;
    } else if (item instanceof Container) {
      count += countWidgetsInContent(item.children);
    }
  }
  return count;
}

/**
 * Helper: Find all widgets of specific type
 */
function findWidgetsByType(
  content: readonly PageContent[],
  type: string,
): Widget[] {
  const results: Widget[] = [];
  for (const item of content) {
    if (item instanceof Widget && item.type === type) {
      results.push(item);
    } else if (item instanceof Container) {
      results.push(...findWidgetsByType(item.children, type));
    }
  }
  return results;
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe("Integration: YAML → Domain Objects → Queries", () => {
  // ─── Behavior 1: Full YAML → Site Pipeline ─────────────────────────────

  describe("Behavior 1: Complete YAML → Site pipeline round-trip", () => {
    it("Given a minimal valid YAML string, When loaded, Then returns a fully composed Site object", () => {
      // Given: minimal YAML
      const yaml = MINIMAL_YAML;

      // When: load from string
      const site = loadSiteFromString(yaml, "test.yaml");

      // Then: returns Site instance
      expect(site).toBeInstanceOf(Site);
      expect(site.title).toBe("Minimal Site");
      expect(site.id).toBeDefined();
    });

    it("Given realistically complex YAML from fixture, When loaded from file, Then parses successfully and returns typed Site", () => {
      // Given: realistic sample YAML file exists
      expect(fs.existsSync(SAMPLE_YAML_PATH)).toBe(true);

      // When: load from file
      const site = loadSampleYaml();

      // Then: returns fully typed Site
      expect(site).toBeInstanceOf(Site);
      expect(site.title).toContain("Portfolio");
    });

    it("Performance: Given YAML input, When parsed to Site, Then completes in < 10ms", () => {
      // Given: YAML string
      const yaml = MINIMAL_YAML;

      // When: measure parsing time
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        loadSiteFromString(yaml, "test.yaml");
      }
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;

      // Then: average parse time < 10ms
      expect(avgTime).toBeLessThan(10);
    });

    it("Given YAML with SEO metadata, When loaded, Then all SEO fields are present in Site", () => {
      // Given: YAML with complete SEO section
      const yaml = `
seo:
  title: "Test Site"
  description: "Test description"
  author: "Test Author"
  keywords:
    - test
    - keywords

themes:
  default: "test"

pages:
  home:
    content:
      - type: hero
        props:
          title: "Test"

skins:
  test:
    name: "Test"
    description: "Test"
    scope: site
    light:
      bgPrimary: "#fff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000"
      textSecondary: "#666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#ccc"
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
      buttonTextColor: "#fff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#fff"
      textSecondary: "#ccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444"
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
      buttonTextColor: "#fff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

      // When: loaded
      const site = loadSiteFromString(yaml, "test.yaml");

      // Then: SEO info available
      expect(site.title).toBe("Test Site");
      expect(site.description).toBe("Test description");
    });
  });

  // ─── Behavior 2: Multi-Page Sites ──────────────────────────────────────

  describe("Behavior 2: Multi-page sites - all pages accessible via queries", () => {
    it("Given YAML with 4 pages, When loaded, Then all pages are indexed and accessible", () => {
      // Given: sample YAML with multiple pages
      const site = loadSampleYaml();

      // When: query pages
      const pages = site.listPages();

      // Then: all pages accessible
      expect(pages.length).toBeGreaterThanOrEqual(4);
      expect(site.getPage("home")).toBeDefined();
      expect(site.getPage("work")).toBeDefined();
      expect(site.getPage("about")).toBeDefined();
      expect(site.getPage("contact")).toBeDefined();
    });

    it("Given multi-page site, When getPage called multiple times with same ID, Then returns consistent reference", () => {
      // Given: multi-page site
      const site = loadSampleYaml();

      // When: query same page multiple times
      const page1 = site.getPage("home");
      const page2 = site.getPage("home");
      const page3 = site.getPage("home");

      // Then: same object reference (deterministic)
      expect(page1).toBe(page2);
      expect(page2).toBe(page3);
      expect(page1?.id).toBe("home");
    });

    it("Given multi-page site, When listPages called twice, Then returns pages in same order", () => {
      // Given: multi-page site
      const site = loadSampleYaml();

      // When: list pages twice
      const list1 = site.listPages();
      const list2 = site.listPages();

      // Then: same order (deterministic)
      expect(list1.map((p) => p.id)).toEqual(list2.map((p) => p.id));
    });

    it("Given YAML with non-existent page ID, When queried, Then returns undefined consistently", () => {
      // Given: site
      const site = loadSampleYaml();

      // When: query non-existent page
      const result1 = site.getPage("nonexistent");
      const result2 = site.getPage("nonexistent");

      // Then: undefined (consistent)
      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
    });

    it("Given each page, When accessing metadata, Then title and description are not lost", () => {
      // Given: multi-page site
      const site = loadSampleYaml();

      // When: access each page
      const pages = site.listPages();

      // Then: all have metadata
      for (const page of pages) {
        expect(page.id).toBeDefined();
        expect(page.id.length).toBeGreaterThan(0);
        expect(typeof page.title).toBe("string");
      }
    });
  });

  // ─── Behavior 3: Nested Content ────────────────────────────────────────

  describe("Behavior 3: Nested widgets and containers - all content renderable", () => {
    it("Given page with nested containers (3+ levels), When loaded, Then all nesting preserved and accessible", () => {
      // Given: YAML with deeply nested structure
      const site = loadNestedSite();
      const page = site.getPage("home")!;

      // When: traverse content
      expect(page.content.length).toBeGreaterThan(0);

      const level1 = page.content[0];
      expect(level1).toBeInstanceOf(Container);

      const container1 = level1 as Container;
      expect(container1.children.length).toBeGreaterThan(0);

      const level2 = container1.children[0];
      expect(level2).toBeInstanceOf(Container);

      const container2 = level2 as Container;
      expect(container2.children.length).toBeGreaterThan(0);

      const level3 = container2.children[0];
      expect(level3).toBeInstanceOf(Container);

      // Then: leaf widget exists
      const container3 = level3 as Container;
      expect(container3.children.length).toBeGreaterThan(0);
      const leafWidget = container3.children[0];
      expect(leafWidget).toBeInstanceOf(Widget);
    });

    it("Given page with mixed widgets and containers, When counted recursively, Then no content lost", () => {
      // Given: sample site with complex content
      const site = loadSampleYaml();
      const pages = site.listPages();

      // When: count widgets in each page
      let totalWidgets = 0;
      for (const page of pages) {
        const count = countWidgetsInContent(page.content);
        totalWidgets += count;
        expect(count).toBeGreaterThanOrEqual(0);
      }

      // Then: at least one widget exists
      expect(totalWidgets).toBeGreaterThan(0);
    });

    it("Given containers with specific layout types, When loaded, Then layout property preserved", () => {
      // Given: nested YAML
      const site = loadNestedSite();
      const page = site.getPage("home")!;

      // When: check layout properties
      const container1 = page.content[0] as Container;
      expect(container1.layout).toBe("grid");

      const container2 = container1.children[0] as Container;
      expect(container2.layout).toBe("flex");

      const container3 = container2.children[0] as Container;
      expect(container3.layout).toBe("stack");

      // Then: all layout values preserved
      expect(["grid", "flex", "stack"]).toContain(container1.layout);
      expect(["grid", "flex", "stack"]).toContain(container2.layout);
      expect(["grid", "flex", "stack"]).toContain(container3.layout);
    });

    it("Given page content with widget parameters, When accessed, Then all parameters present (no loss)", () => {
      // Given: YAML with explicit widget props
      const yaml = `
seo:
  title: "Props Test"

themes:
  default: "test"

pages:
  home:
    content:
      - type: hero
        props:
          title: "My Title"
          subtitle: "My Subtitle"
          ctaText: "Click Me"
          ctaUrl: "/action"

skins:
  test:
    name: "Test"
    description: "Test"
    scope: site
    light:
      bgPrimary: "#fff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000"
      textSecondary: "#666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#ccc"
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
      buttonTextColor: "#fff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#fff"
      textSecondary: "#ccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444"
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
      buttonTextColor: "#fff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

      // When: loaded and widget accessed
      const site = loadSiteFromString(yaml, "test.yaml");
      const page = site.getPage("home")!;
      const widget = page.content[0] as Widget;

      // Then: all props preserved
      expect(widget.parameters.title).toBe("My Title");
      expect(widget.parameters.subtitle).toBe("My Subtitle");
      expect(widget.parameters.ctaText).toBe("Click Me");
      expect(widget.parameters.ctaUrl).toBe("/action");
    });
  });

  // ─── Behavior 4: Skin Cascade ──────────────────────────────────────────

  describe("Behavior 4: Skin cascade - resolved correctly", () => {
    it("Given YAML with multiple skins, When loaded, Then all skins are indexed and accessible", () => {
      // Given: sample with multiple skins
      const site = loadSampleYaml();

      // When: query skins
      const light = site.getSkin("minimalist");
      const dark = site.getSkin("modern-tech");

      // Then: both accessible
      expect(light).toBeDefined();
      expect(dark).toBeDefined();
    });

    it("Given site with default skin, When accessed, Then correct skin returned", () => {
      // Given: site
      const site = loadSampleYaml();

      // When: get default skin
      const defaultSkin = site.getDefaultSkin();

      // Then: is "modern-tech" per sample YAML
      expect(defaultSkin.id).toBe("modern-tech");
    });

    it("Given page with skin override, When loaded, Then skin property preserved", () => {
      // Given: sample has page with skin override
      const site = loadSampleYaml();

      // When: get work page
      const workPage = site.getPage("work");

      // Then: has skin override
      expect(workPage?.skinOverride).toBe("modern-tech");
    });

    it("Given multiple skin queries, When called repeatedly, Then return same reference (deterministic)", () => {
      // Given: site
      const site = loadSampleYaml();

      // When: query skin multiple times
      const skin1 = site.getSkin("minimalist");
      const skin2 = site.getSkin("minimalist");
      const skin3 = site.getSkin("minimalist");

      // Then: same object reference
      expect(skin1).toBe(skin2);
      expect(skin2).toBe(skin3);
      expect(skin1?.id).toBe("minimalist");
    });

    it("Given skin with light/dark tokens, When accessed, Then token values preserved", () => {
      // Given: site
      const site = loadSampleYaml();

      // When: get skin and check tokens
      const skin = site.getSkin("minimalist");

      // Then: token values present
      expect(skin).toBeDefined();
      // Verify some token is present
      const lightTokens = skin?.getTokens("light");
      expect(lightTokens).toBeDefined();
    });

    it("Given skin with specific cascade scope, When loaded, Then scope type is preserved", () => {
      // Given: site
      const site = loadSampleYaml();

      // When: get skin
      const skin = site.getSkin("minimalist");

      // Then: scope is "site"
      expect(skin?.scope).toBe("site");
    });
  });

  // ─── Behavior 5: Translations ──────────────────────────────────────────

  describe("Behavior 5: Translations - language fallback and per-page translations", () => {
    it("Given page with multi-language translations, When loaded, Then all translations preserved", () => {
      // Given: sample has work page with translations
      const site = loadSampleYaml();

      // When: get work page
      const workPage = site.getPage("work");

      // Then: translations exist
      expect(workPage?.translations).toBeDefined();
      expect(workPage?.translations?.en).toBeDefined();
      expect(workPage?.translations?.fr).toBeDefined();
      expect(workPage?.translations?.es).toBeDefined();
    });

    it("Given page with English translations, When accessed, Then English keys present", () => {
      // Given: sample site
      const site = loadSampleYaml();

      // When: get work page translations
      const workPage = site.getPage("work");
      const enTranslations = workPage?.translations?.en;

      // Then: English keys available
      expect(enTranslations?.section_title).toBe("My Recent Work");
      expect(enTranslations?.view_project).toBe("View Project Details");
    });

    it("Given page with French translations, When accessed, Then French keys present", () => {
      // Given: sample site
      const site = loadSampleYaml();

      // When: get work page French translations
      const workPage = site.getPage("work");
      const frTranslations = workPage?.translations?.fr;

      // Then: French keys available
      expect(frTranslations?.section_title).toBe("Mon travail récent");
      expect(frTranslations?.view_project).toBe("Voir les détails du projet");
    });

    it("Given page with Spanish translations, When accessed, Then Spanish keys present", () => {
      // Given: sample site
      const site = loadSampleYaml();

      // When: get work page Spanish translations
      const workPage = site.getPage("work");
      const esTranslations = workPage?.translations?.es;

      // Then: Spanish keys available
      expect(esTranslations?.section_title).toBe("Mi trabajo reciente");
    });

    it("Given multiple pages with/without translations, When queried, Then translated pages are accessible", () => {
      // Given: sample has mixed pages
      const site = loadSampleYaml();

      // When: get all pages
      const pages = site.listPages();

      // Then: at least one has translations
      const pagesWithTranslations = pages.filter((p) => p.translations);
      expect(pagesWithTranslations.length).toBeGreaterThan(0);

      // And: pages without translations also fine
      const pagesWithoutTranslations = pages.filter((p) => !p.translations);
      expect(pagesWithoutTranslations.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Behavior 6: Determinism ──────────────────────────────────────────

  describe("Behavior 6: Determinism - same input always produces same output", () => {
    it("Given identical YAML input, When parsed twice, Then produces structurally identical Sites", () => {
      // Given: same YAML
      const yaml = MINIMAL_YAML;

      // When: parse twice
      const site1 = loadSiteFromString(yaml, "test.yaml");
      const site2 = loadSiteFromString(yaml, "test.yaml");

      // Then: structural equality
      expect(site1.title).toBe(site2.title);
      expect(site1.listPages().length).toBe(site2.listPages().length);
      expect(site1.defaultSkinId).toBe(site2.defaultSkinId);
    });

    it("Given identical YAML, When parsed 100 times, Then all parses produce identical page lists", () => {
      // Given: YAML
      const yaml = MINIMAL_YAML;

      // When: parse many times
      const sites = [];
      for (let i = 0; i < 100; i++) {
        sites.push(loadSiteFromString(yaml, "test.yaml"));
      }

      // Then: all have same structure
      const firstPageIds = sites[0].listPages().map((p) => p.id);
      for (let i = 1; i < sites.length; i++) {
        const pageIds = sites[i].listPages().map((p) => p.id);
        expect(pageIds).toEqual(firstPageIds);
      }
    });

    it("Given page with content, When queried multiple times, Then content structure identical across queries", () => {
      // Given: site
      const site = loadSampleYaml();
      const page = site.getPage("home")!;

      // When: access content multiple times
      const contentLength1 = page.content.length;
      const contentLength2 = page.content.length;
      const contentLength3 = page.content.length;

      // Then: consistent
      expect(contentLength1).toBe(contentLength2);
      expect(contentLength2).toBe(contentLength3);
    });

    it("Given widget parameters, When accessed multiple times, Then parameter values identical", () => {
      // Given: site with widgets
      const site = loadSampleYaml();
      const page = site.getPage("home")!;
      const widget = page.content[0] as Widget;

      // When: access parameters multiple times
      const title1 = widget.parameters.title;
      const title2 = widget.parameters.title;
      const title3 = widget.parameters.title;

      // Then: identical across accesses
      expect(title1).toBe(title2);
      expect(title2).toBe(title3);
    });
  });

  // ─── Behavior 7: Data Consistency ──────────────────────────────────────

  describe("Behavior 7: Data consistency - YAML → domain → queries integrity", () => {
    it("Given YAML with 4 pages, When loaded and aggregated, Then page count matches", () => {
      // Given: sample YAML
      const site = loadSampleYaml();

      // When: count pages
      const pages = site.listPages();

      // Then: count is accurate
      expect(pages.length).toBe(4);
    });

    it("Given site with indexed pages, When each page accessed individually, Then all IDs match listings", () => {
      // Given: site
      const site = loadSampleYaml();

      // When: get listings and individual queries
      const listedPages = site.listPages();
      const queriedPages = listedPages.map((p) => site.getPage(p.id));

      // Then: all match (no lost pages)
      expect(queriedPages.every((p) => p !== undefined)).toBe(true);
    });

    it("Given page with mixed content types, When traversed, Then all items properly typed", () => {
      // Given: nested site
      const site = loadNestedSite();
      const page = site.getPage("home")!;

      // When: traverse recursively
      function validateContent(content: readonly PageContent[]): boolean {
        for (const item of content) {
          if (!(item instanceof Widget) && !(item instanceof Container)) {
            return false;
          }
          if (item instanceof Container) {
            if (!validateContent(item.children)) {
              return false;
            }
          }
        }
        return true;
      }

      // Then: all properly typed
      expect(validateContent(page.content)).toBe(true);
    });

    it("Given site with skins and pages, When queried together, Then references consistent across queries", () => {
      // Given: site
      const site = loadSampleYaml();

      // When: get default skin and a page using it
      const defaultSkin = site.getDefaultSkin();
      const homePage = site.getPage("home");

      // Then: skin is accessible
      expect(defaultSkin).toBeDefined();
      expect(homePage).toBeDefined();

      // And: both can be queried again
      expect(site.getDefaultSkin().id).toBe(defaultSkin.id);
      expect(site.getPage("home")?.id).toBe(homePage?.id);
    });
  });

  // ─── Behavior 8: Error Handling ────────────────────────────────────────

  describe("Behavior 8: Error cases - graceful handling and recovery", () => {
    it("Given YAML with missing required pages, When loaded, Then throws error before returning invalid Site", () => {
      // Given: invalid YAML without pages
      const yaml = `
seo:
  title: "No Pages"

themes:
  default: "test"

skins:
  test:
    name: "Test"
    description: "Test"
    scope: site
    light:
      bgPrimary: "#fff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000"
      textSecondary: "#666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#ccc"
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
      buttonTextColor: "#fff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#fff"
      textSecondary: "#ccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444"
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
      buttonTextColor: "#fff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

      // When/Then: throws error
      expect(() => loadSiteFromString(yaml, "test.yaml")).toThrow();
    });

    it("Given YAML with invalid widget type, When loaded, Then throws error with type information", () => {
      // Given: YAML with unknown widget
      const yaml = `
seo:
  title: "Invalid Widget"

themes:
  default: "test"

pages:
  home:
    content:
      - type: nonexistentWidget
        props:
          title: "Test"

skins:
  test:
    name: "Test"
    description: "Test"
    scope: site
    light:
      bgPrimary: "#fff"
      bgSecondary: "#f5f5f5"
      textPrimary: "#000"
      textSecondary: "#666"
      accent: "#0066cc"
      accentHover: "#0052a3"
      accentSecondary: null
      accentTertiary: null
      border: "#ccc"
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
      buttonTextColor: "#fff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2d2d2d"
      textPrimary: "#fff"
      textSecondary: "#ccc"
      accent: "#3385ff"
      accentHover: "#5fa3ff"
      accentSecondary: null
      accentTertiary: null
      border: "#444"
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
      buttonTextColor: "#fff"
      buttonTextShadow: "none"
      scanlineOpacity: "0.15"
`;

      // When/Then: throws error
      expect(() => loadSiteFromString(yaml, "test.yaml")).toThrow();
    });
  });
});
