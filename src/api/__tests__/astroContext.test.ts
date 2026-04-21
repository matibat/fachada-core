/**
 * Astro Context Builder BDD Tests
 *
 * Behavior-driven tests for astroContext builder
 * Tests cover:
 * - Happy path: Site + Page → flattened AstroContextProps
 * - Page data flattening: all required fields present
 * - Content flattening: widgets and nested containers in render order
 * - Skin token cascade: Site default → Page override
 * - Translation resolution with language fallback
 * - Domain object immutability (no mutations)
 * - Deterministic and reproducible output
 */

import { describe, it, expect, beforeEach } from "vitest";
import { buildAstroContext } from "../astroContext";
import { Site, type SiteCreateConfig } from "../../domain/Site";
import { Page, type PageCreateConfig } from "../../domain/Page";
import { Widget } from "../../domain/Widget";
import { Container } from "../../domain/Container";
import { Skin } from "../../domain/Skin";
import { WidgetRegistry } from "../../domain/WidgetRegistry";

// ─── Test Fixtures ───────────────────────────────────────────────────────

/**
 * Complete theme token set using fixture from configLoader tests
 */
function createLightTokens() {
  return {
    bgPrimary: "#ffffff",
    bgSecondary: "#f5f5f5",
    textPrimary: "#000000",
    textSecondary: "#666666",
    accent: "#0066cc",
    accentHover: "#0052a3",
    accentSecondary: null as any,
    accentTertiary: null as any,
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
    accentSecondary: null as any,
    accentTertiary: null as any,
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

// ─── Test Data Setup ───────────────────────────────────────────────────────

describe("buildAstroContext", () => {
  let widgetRegistry: WidgetRegistry;
  let site: Site;
  let page: Page;

  beforeEach(() => {
    // Setup widget registry with built-in widgets
    widgetRegistry = new WidgetRegistry();

    // Create a simple widget for testing
    const widget = Widget.create({
      type: "hero",
      parameters: {
        title: "Welcome",
        subtitle: "To my site",
      },
      registry: widgetRegistry,
    });

    // Create a page with the widget
    page = Page.create({
      id: "home",
      path: "/",
      title: "Home",
      description: "Homepage",
      language: "en",
      content: [widget],
      translations: {
        en: {
          greeting: "Welcome",
          tagline: "My personal site",
        },
      },
    });

    // Create skins
    const defaultSkin = Skin.create({
      id: "default",
      name: "Default Skin",
      description: "Default light/dark theme",
      scope: "site",
      light: createLightTokens(),
      dark: createDarkTokens(),
    });

    // Create the site (no separate skinRegistry instance needed, just pass skins map)
    site = Site.create({
      id: "test-site",
      title: "Test Site",
      description: "A test site",
      defaultSkinId: "default",
      pageRegistry: new Map([["home", page]]),
      skinRegistry: new Map([["default", defaultSkin]]),
      widgetRegistry,
    });
  });

  /** BEHAVIOR 1: buildAstroContext accepts Site, pageId, language */
  describe("Behavior 1: Function signature and basic call", () => {
    it("accepts Site, pageId, and optional language parameter", () => {
      // Given: a valid Site and page ID
      // When: calling buildAstroContext with site, pageId, and language
      // Then: returns AstroContextProps without error
      const result = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("skinTokens");
      expect(result).toHaveProperty("translations");
      expect(result).toHaveProperty("metadata");
    });

    it("works with optional language parameter (uses default)", () => {
      // Given: a Site without explicitly specifying language
      // When: calling buildAstroContext with site and pageId only
      // Then: returns AstroContextProps with default language
      const result = buildAstroContext({
        site,
        pageId: "home",
      });

      expect(result).toBeDefined();
      expect(result.page.language).toBe("en");
    });

    it("throws error when page not found", () => {
      // Given: a pageId that does not exist in site
      // When: calling buildAstroContext
      // Then: throws an Error
      expect(() => {
        buildAstroContext({
          site,
          pageId: "nonexistent",
          language: "en",
        });
      }).toThrow();
    });
  });

  /** BEHAVIOR 2: Page data flattened to flat props */
  describe("Behavior 2: Page data flattening", () => {
    it("flattens page data: id, title, path, language present", () => {
      // Given: a Site with a page
      // When: building astro context
      // Then: page props contains all required fields
      const result = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      expect(result.page).toEqual({
        id: "home",
        title: "Home",
        description: "Homepage",
        path: "/",
        language: "en",
        tags: [],
      });
    });

    it("flattens page tags to readonly array", () => {
      // Given: a page with tags
      const pageWithTags = Page.create({
        id: "tagged",
        path: "/tagged",
        title: "Tagged Page",
        description: "Page with tags",
        language: "en",
        content: [
          Widget.create({
            type: "hero",
            parameters: { title: "Test" },
            registry: widgetRegistry,
          }),
        ],
        tags: ["featured", "blog"],
      });

      const site2 = Site.create({
        id: "site2",
        title: "Site 2",
        defaultSkinId: "default",
        pageRegistry: new Map([["tagged", pageWithTags]]),
        skinRegistry: new Map([["default", site.getSkin("default")!]]),
        widgetRegistry,
      });

      // When: building context
      const result = buildAstroContext({
        site: site2,
        pageId: "tagged",
        language: "en",
      });

      // Then: tags are in the flattened page
      expect(result.page.tags).toEqual(["featured", "blog"]);
    });

    it("includes all page fields in metadata", () => {
      // Given: a page with full metadata
      // When: building context
      const result = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: metadata mirrors page props
      expect(result.metadata).toEqual({
        title: "Home",
        description: "Homepage",
        path: "/",
        language: "en",
        tags: [],
      });
    });
  });

  /** BEHAVIOR 3: Content array flattened (widgets + containers) */
  describe("Behavior 3: Content flattening", () => {
    it("flattens widget content to AstroWidgetProps", () => {
      // Given: a page with a widget
      // When: building context
      const result = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: content array contains flattened widget
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: "hero",
        parameters: {
          title: "Welcome",
          subtitle: "To my site",
        },
      });
    });

    it("flattens container structure preserving nesting", () => {
      // Given: a page with nested containers
      const widget1 = Widget.create({
        type: "hero",
        parameters: { title: "Hero" },
        registry: widgetRegistry,
      });

      const widget2 = Widget.create({
        type: "portfolio",
        parameters: { title: "Portfolio" },
        registry: widgetRegistry,
      });

      const container = Container.create({
        layout: "grid",
        children: [widget1, widget2],
        props: { columns: 2 },
      });

      const pageWithContainer = Page.create({
        id: "page-with-container",
        path: "/with-container",
        title: "Container Page",
        description: "Page with containers",
        language: "en",
        content: [container],
      });

      const site2 = Site.create({
        id: "site2",
        title: "Site 2",
        defaultSkinId: "default",
        pageRegistry: new Map([["page-with-container", pageWithContainer]]),
        skinRegistry: new Map([["default", site.getSkin("default")!]]),
        widgetRegistry,
      });

      // When: building context
      const result = buildAstroContext({
        site: site2,
        pageId: "page-with-container",
        language: "en",
      });

      // Then: content preserves container structure with nested children
      expect(result.content).toHaveLength(1);
      const containerContent = result.content[0];
      expect(containerContent).toHaveProperty("layout", "grid");
      expect(containerContent).toHaveProperty("children");
      expect((containerContent as any).children).toHaveLength(2);
    });

    it("preserves render order of mixed widgets and containers", () => {
      // Given: a page with mixed widgets and containers
      const widget1 = Widget.create({
        type: "hero",
        parameters: { title: "Hero" },
        registry: widgetRegistry,
      });

      const widget2 = Widget.create({
        type: "portfolio",
        parameters: { title: "Portfolio" },
        registry: widgetRegistry,
      });

      const container = Container.create({
        layout: "flex",
        children: [
          Widget.create({
            type: "skills",
            parameters: { title: "Skills" },
            registry: widgetRegistry,
          }),
        ],
      });

      const widget3 = Widget.create({
        type: "contact",
        parameters: { title: "Contact" },
        registry: widgetRegistry,
      });

      const mixedPage = Page.create({
        id: "mixed",
        path: "/mixed",
        title: "Mixed Page",
        description: "Mixed content",
        language: "en",
        content: [widget1, container, widget2, widget3],
      });

      const site2 = Site.create({
        id: "site2",
        title: "Site 2",
        defaultSkinId: "default",
        pageRegistry: new Map([["mixed", mixedPage]]),
        skinRegistry: new Map([["default", site.getSkin("default")!]]),
        widgetRegistry,
      });

      // When: building context
      const result = buildAstroContext({
        site: site2,
        pageId: "mixed",
        language: "en",
      });

      // Then: content preserves render order
      expect(result.content).toHaveLength(4);
      expect((result.content[0] as any).type).toBe("hero");
      expect((result.content[1] as any).layout).toBe("flex");
      expect((result.content[2] as any).type).toBe("portfolio");
      expect((result.content[3] as any).type).toBe("contact");
    });
  });

  /** BEHAVIOR 4: Skin tokens resolved with CASCADE hierarchy */
  describe("Behavior 4: Skin token resolution with CASCADE", () => {
    it("resolves default site skin tokens", () => {
      // Given: a site with default skin
      // When: building context
      const result = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: skinTokens contains both light and dark modes
      expect(result.skinTokens).toHaveProperty("light");
      expect(result.skinTokens).toHaveProperty("dark");
      expect(result.skinTokens.light.bgPrimary).toBe("#ffffff");
      expect(result.skinTokens.dark.bgPrimary).toBe("#1a1a1a");
    });

    it("overrides site skin with page skin override", () => {
      // Given: a page with skinOverride, and a page-level skin in registry
      const pageSkin = Skin.create({
        id: "page-override",
        name: "Page Override Skin",
        description: "Override for page",
        scope: "page",
        light: {
          ...createLightTokens(),
          bgPrimary: "#eeeeee", // Override
        },
        dark: createDarkTokens(),
      });

      const overridePage = Page.create({
        id: "override",
        path: "/override",
        title: "Override Page",
        description: "Page with override",
        language: "en",
        content: [
          Widget.create({
            type: "hero",
            parameters: { title: "Hero" },
            registry: widgetRegistry,
          }),
        ],
        skinOverride: "page-override",
      });

      const defaultSkin = site.getSkin("default")!;

      const site2 = Site.create({
        id: "site2",
        title: "Site 2",
        defaultSkinId: "default",
        pageRegistry: new Map([["override", overridePage]]),
        skinRegistry: new Map([
          ["default", defaultSkin],
          ["page-override", pageSkin],
        ]),
        widgetRegistry,
      });

      // When: building context
      const result = buildAstroContext({
        site: site2,
        pageId: "override",
        language: "en",
      });

      // Then: skinTokens reflect page override (light mode)
      expect(result.skinTokens.light.bgPrimary).toBe("#eeeeee");
      // Dark mode unchanged
      expect(result.skinTokens.dark.bgPrimary).toBe("#1a1a1a");
    });

    it("cascade follows: Site default > Page override", () => {
      // Given: site has default skin, page has no override
      // When: building context
      const result = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: uses site default skin tokens
      const defaultSkin = site.getSkin("default")!;
      const defaultTokens = defaultSkin.getTokens("light");
      expect(result.skinTokens.light.bgPrimary).toBe(defaultTokens.bgPrimary);
    });
  });

  /** BEHAVIOR 5: Translations resolved with language fallback */
  describe("Behavior 5: Translation resolution with language fallback", () => {
    it("resolves translations for specified language", () => {
      // Given: a page with English translations
      // When: building context with language: "en"
      const result = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: translations include language-specific strings
      expect(result.translations.en).toEqual({
        greeting: "Welcome",
        tagline: "My personal site",
      });
    });

    it("includes all available language translations in context", () => {
      // Given: a page with multiple language translations
      const multiLangPage = Page.create({
        id: "multilang",
        path: "/multilang",
        title: "Multi Language",
        description: "Multi language page",
        language: "en",
        content: [
          Widget.create({
            type: "hero",
            parameters: { title: "Hero" },
            registry: widgetRegistry,
          }),
        ],
        translations: {
          en: { greeting: "Hello", goodbye: "Goodbye" },
          es: { greeting: "Hola", goodbye: "Adiós" },
          fr: { greeting: "Bonjour", goodbye: "Au revoir" },
        },
      });

      const site2 = Site.create({
        id: "site2",
        title: "Site 2",
        defaultSkinId: "default",
        pageRegistry: new Map([["multilang", multiLangPage]]),
        skinRegistry: new Map([["default", site.getSkin("default")!]]),
        widgetRegistry,
      });

      // When: building context
      const result = buildAstroContext({
        site: site2,
        pageId: "multilang",
        language: "en",
      });

      // Then: all languages are in translations
      expect(result.translations).toHaveProperty("en");
      expect(result.translations).toHaveProperty("es");
      expect(result.translations).toHaveProperty("fr");
      expect(result.translations.es.greeting).toBe("Hola");
      expect(result.translations.fr.goodbye).toBe("Au revoir");
    });

    it("returns empty translations object when no translations defined", () => {
      // Given: a page without translations
      const noTranslationsPage = Page.create({
        id: "notrans",
        path: "/notrans",
        title: "No Translations",
        description: "No translations page",
        language: "en",
        content: [
          Widget.create({
            type: "hero",
            parameters: { title: "Hero" },
            registry: widgetRegistry,
          }),
        ],
      });

      const site2 = Site.create({
        id: "site2",
        title: "Site 2",
        defaultSkinId: "default",
        pageRegistry: new Map([["notrans", noTranslationsPage]]),
        skinRegistry: new Map([["default", site.getSkin("default")!]]),
        widgetRegistry,
      });

      // When: building context
      const result = buildAstroContext({
        site: site2,
        pageId: "notrans",
        language: "en",
      });

      // Then: translations is empty object
      expect(result.translations).toEqual({});
    });
  });

  /** BEHAVIOR 6: Domain objects not mutated */
  describe("Behavior 6: Immutability - domain objects not mutated", () => {
    it("does not mutate Site aggregate", () => {
      // Given: original Site object
      const originalSite = site;
      const originalPages = site.listPages();

      // When: building context
      buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: Site remains unchanged
      expect(site.listPages()).toEqual(originalPages);
      expect(site.id).toBe("test-site");
    });

    it("does not mutate Page content", () => {
      // Given: original page
      const originalPage = site.getPage("home")!;
      const originalContent = Array.from(originalPage.content);

      // When: building context
      buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: Page content unchanged
      expect(Array.from(originalPage.content)).toEqual(originalContent);
    });

    it("does not mutate Skin tokens", () => {
      // Given: original skin
      const originalSkin = site.getSkin("default")!;
      const originalLightTokens = originalSkin.getTokens("light");

      // When: building context
      buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: Skin tokens unchanged
      expect(originalSkin.getTokens("light")).toEqual(originalLightTokens);
    });
  });

  /** BEHAVIOR 7: All types fully specified (no any types) */
  describe("Behavior 7: Full type specification", () => {
    it("returns properly typed AstroContextProps", () => {
      // Given: a valid context request
      // When: building context
      const result = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: result is properly typed with all required properties
      // Using type assertions to verify structure
      const page: typeof result.page = result.page;
      const content: typeof result.content = result.content;
      const skinTokens: typeof result.skinTokens = result.skinTokens;
      const translations: typeof result.translations = result.translations;
      const metadata: typeof result.metadata = result.metadata;

      expect(page.id).toBeDefined();
      expect(Array.isArray(content)).toBe(true);
      expect(skinTokens.light).toBeDefined();
      expect(skinTokens.dark).toBeDefined();
      expect(typeof translations).toBe("object");
      expect(metadata.path).toBeDefined();
    });
  });

  /** BEHAVIOR 8: Deterministic and reproducible output */
  describe("Behavior 8: Deterministic output", () => {
    it("produces consistent output for same inputs", () => {
      // Given: same site and page configuration
      // When: building context twice
      const result1 = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      const result2 = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: results are identical
      expect(result1).toEqual(result2);
    });
  });

  /** INTEGRATION TEST: Round-trip consistency */
  describe("Integration: Round-trip consistency (Domain → Context → Values)", () => {
    it("Round-trip: Page domain → context → values match original queries", () => {
      // Given: a site and page
      const originalPage = site.getPage("home")!;

      // When: building context
      const context = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: context values match original domain queries
      expect(context.page.id).toBe(originalPage.id);
      expect(context.page.title).toBe(originalPage.title);
      expect(context.page.path).toBe(originalPage.path);
      expect(context.page.language).toBe(originalPage.language);
      expect(context.page.description).toBe(originalPage.description);
    });

    it("Round-trip: Skin tokens → context → same tokens", () => {
      // Given: a default skin
      const originalSkin = site.getSkin("default")!;
      const originalLight = originalSkin.getTokens("light");
      const originalDark = originalSkin.getTokens("dark");

      // When: building context
      const context = buildAstroContext({
        site,
        pageId: "home",
        language: "en",
      });

      // Then: context tokens match original skin tokens
      expect(context.skinTokens.light).toEqual(originalLight);
      expect(context.skinTokens.dark).toEqual(originalDark);
    });
  });
});
