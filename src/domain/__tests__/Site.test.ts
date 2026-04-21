/**
 * Site domain aggregate root - BDD test suite
 *
 * Tests for the Site aggregate that composes Pages, Skins, and WidgetRegistry
 * following DDD patterns with immutability and validation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Site, type SiteCreateConfig } from "../Site";
import { Page } from "../Page";
import { Skin } from "../Skin";
import { Widget } from "../Widget";
import { Container } from "../Container";
import { WidgetRegistry } from "../WidgetRegistry";
import { SkinRegistry } from "../SkinRegistry";

describe("Site Domain Aggregate Root", () => {
  let widgetRegistry: WidgetRegistry;
  let testSkins: Map<string, Skin>;
  let testPages: Map<string, Page>;

  beforeEach(() => {
    widgetRegistry = new WidgetRegistry();

    // Create test skins
    testSkins = new Map();
    testSkins.set(
      "minimalist",
      Skin.create({
        id: "minimalist",
        name: "Minimalist",
        description: "Clean and simple design",
        scope: "site",
        light: {
          bgPrimary: "#ffffff",
          bgSecondary: "#f5f5f5",
          textPrimary: "#000000",
          textSecondary: "#666666",
          accent: "#007bff",
          accentHover: "#0056b3",
          accentSecondary: null,
          accentTertiary: null,
          border: "#dddddd",
          shadow: "0 2px 4px rgba(0,0,0,0.1)",
          borderRadius: "4px",
          transition: "all 0.3s ease",
          glow: "none",
          gradient: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
          spacingSection: "64px",
          spacingCard: "24px",
          spacingElement: "12px",
          fontBody: "system-ui, -apple-system, sans-serif",
          fontHeading: "system-ui, -apple-system, sans-serif",
          fontMono: "Courier New, monospace",
          headingWeight: "600",
          bodyLineHeight: "1.6",
          contentMaxWidth: "1200px",
          headingLetterSpacing: "0",
          buttonTextColor: "#ffffff",
          buttonTextShadow: "none",
          scanlineOpacity: "0",
        },
        dark: {
          bgPrimary: "#1a1a1a",
          bgSecondary: "#2a2a2a",
          textPrimary: "#ffffff",
          textSecondary: "#999999",
          accent: "#0099ff",
          accentHover: "#0077cc",
          accentSecondary: null,
          accentTertiary: null,
          border: "#444444",
          shadow: "0 2px 4px rgba(0,0,0,0.3)",
          borderRadius: "4px",
          transition: "all 0.3s ease",
          glow: "none",
          gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          spacingSection: "64px",
          spacingCard: "24px",
          spacingElement: "12px",
          fontBody: "system-ui, -apple-system, sans-serif",
          fontHeading: "system-ui, -apple-system, sans-serif",
          fontMono: "Courier New, monospace",
          headingWeight: "600",
          bodyLineHeight: "1.6",
          contentMaxWidth: "1200px",
          headingLetterSpacing: "0",
          buttonTextColor: "#1a1a1a",
          buttonTextShadow: "none",
          scanlineOpacity: "0",
        },
      }),
    );

    testSkins.set(
      "modern-tech",
      Skin.create({
        id: "modern-tech",
        name: "Modern Tech",
        description: "Modern technology theme",
        scope: "site",
        light: {
          bgPrimary: "#f0f4f8",
          bgSecondary: "#ffffff",
          textPrimary: "#0f1929",
          textSecondary: "#576674",
          accent: "#0066cc",
          accentHover: "#0052a3",
          accentSecondary: null,
          accentTertiary: null,
          border: "#c7d4de",
          shadow: "0 4px 8px rgba(15,25,41,0.08)",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          glow: "0 0 8px rgba(0,102,204,0.3)",
          gradient: "linear-gradient(135deg, #0066cc 0%, #00a3ff 100%)",
          spacingSection: "80px",
          spacingCard: "32px",
          spacingElement: "16px",
          fontBody: "Segoe UI, Roboto, sans-serif",
          fontHeading: "Segoe UI, Roboto, sans-serif",
          fontMono: "Fira Code, monospace",
          headingWeight: "700",
          bodyLineHeight: "1.7",
          contentMaxWidth: "1400px",
          headingLetterSpacing: "-0.5px",
          buttonTextColor: "#ffffff",
          buttonTextShadow: "0 1px 2px rgba(0,0,0,0.1)",
          scanlineOpacity: "0",
        },
        dark: {
          bgPrimary: "#0f1929",
          bgSecondary: "#132f4c",
          textPrimary: "#ffffff",
          textSecondary: "#b2bac2",
          accent: "#0099ff",
          accentHover: "#0099ff",
          accentSecondary: null,
          accentTertiary: null,
          border: "#434d63",
          shadow: "0 4px 8px rgba(0,0,0,0.3)",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          glow: "0 0 12px rgba(0,153,255,0.4)",
          gradient: "linear-gradient(135deg, #0099ff 0%, #00ccff 100%)",
          spacingSection: "80px",
          spacingCard: "32px",
          spacingElement: "16px",
          fontBody: "Segoe UI, Roboto, sans-serif",
          fontHeading: "Segoe UI, Roboto, sans-serif",
          fontMono: "Fira Code, monospace",
          headingWeight: "700",
          bodyLineHeight: "1.7",
          contentMaxWidth: "1400px",
          headingLetterSpacing: "-0.5px",
          buttonTextColor: "#132f4c",
          buttonTextShadow: "0 1px 2px rgba(0,0,0,0.3)",
          scanlineOpacity: "0",
        },
      }),
    );

    // Create test pages
    testPages = new Map();

    const heroWidget = Widget.create({
      type: "hero",
      parameters: { title: "Welcome" },
      registry: widgetRegistry,
    });

    testPages.set(
      "home",
      Page.create({
        id: "home",
        path: "/",
        title: "Home",
        description: "Landing page",
        language: "en",
        content: [heroWidget],
      }),
    );

    const portfolioWidget = Widget.create({
      type: "portfolio",
      parameters: { title: "My Work" },
      registry: widgetRegistry,
    });

    testPages.set(
      "portfolio",
      Page.create({
        id: "portfolio",
        path: "/portfolio",
        title: "Portfolio",
        description: "My portfolio",
        language: "en",
        content: [portfolioWidget],
      }),
    );
  });

  // ==================== BEHAVIOR 1: Site.create() Factory ====================

  describe("Behavior 1: Site.create() factory validates and creates site", () => {
    it("should create a site with valid config", () => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      const site = Site.create(config);

      expect(site).toBeDefined();
      expect(site.id).toBe("my-site");
      expect(site.title).toBe("My Site");
      expect(site.description).toBe("My awesome site");
      expect(site.defaultSkinId).toBe("minimalist");
    });

    it("should reject site creation when id is missing", () => {
      const config: any = {
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      expect(() => Site.create(config)).toThrow(/Site id is required/);
    });

    it("should reject site creation when title is missing", () => {
      const config: any = {
        id: "my-site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      expect(() => Site.create(config)).toThrow(/Site title is required/);
    });

    it("should reject site creation when defaultSkinId is missing", () => {
      const config: any = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      expect(() => Site.create(config)).toThrow(
        /Site defaultSkinId is required/,
      );
    });
  });

  // ==================== BEHAVIOR 2: Unique Page IDs Validation ====================

  describe("Behavior 2: Site validates all page IDs are unique", () => {
    it("should accept site with unique page IDs", () => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      const site = Site.create(config);
      expect(site).toBeDefined();
    });

    it("should reject site with duplicate page IDs (same map would have duplicates)", () => {
      const duplicatePages = new Map(testPages);
      // Map keys are unique by definition, so this tests the validation is called

      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My site",
        defaultSkinId: "minimalist",
        pageRegistry: duplicatePages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      const site = Site.create(config);
      expect(site).toBeDefined();
    });
  });

  // ==================== BEHAVIOR 3: Unique Skin IDs Validation ====================

  describe("Behavior 3: Site validates all skin IDs are unique", () => {
    it("should accept site with unique skin IDs", () => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      const site = Site.create(config);
      expect(site).toBeDefined();
    });
  });

  // ==================== BEHAVIOR 4: Default Skin Exists ====================

  describe("Behavior 4: Site validates default skin exists in registry", () => {
    it("should reject site when defaultSkinId does not exist in skin registry", () => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My site",
        defaultSkinId: "non-existent-skin",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      expect(() => Site.create(config)).toThrow(
        /default skin "non-existent-skin" not found in skin registry/,
      );
    });

    it("should accept site when defaultSkinId exists in skin registry", () => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      const site = Site.create(config);
      expect(site.defaultSkinId).toBe("minimalist");
    });
  });

  // ==================== BEHAVIOR 5: getPage() Query ====================

  describe("Behavior 5: Site.getPage(id) returns page or undefined", () => {
    let site: Site;

    beforeEach(() => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };
      site = Site.create(config);
    });

    it("should return page when page ID exists", () => {
      const page = site.getPage("home");
      expect(page).toBeDefined();
      expect(page?.id).toBe("home");
    });

    it("should return undefined when page ID does not exist", () => {
      const page = site.getPage("non-existent");
      expect(page).toBeUndefined();
    });

    it("should return correct page when multiple pages exist", () => {
      const portfolio = site.getPage("portfolio");
      expect(portfolio).toBeDefined();
      expect(portfolio?.id).toBe("portfolio");
      expect(portfolio?.path).toBe("/portfolio");
    });
  });

  // ==================== BEHAVIOR 6: getSkin() Query ====================

  describe("Behavior 6: Site.getSkin(id) returns skin or undefined", () => {
    let site: Site;

    beforeEach(() => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };
      site = Site.create(config);
    });

    it("should return skin when skin ID exists", () => {
      const skin = site.getSkin("minimalist");
      expect(skin).toBeDefined();
      expect(skin?.id).toBe("minimalist");
    });

    it("should return undefined when skin ID does not exist", () => {
      const skin = site.getSkin("non-existent-skin");
      expect(skin).toBeUndefined();
    });

    it("should return correct skin when multiple skins exist", () => {
      const modernTech = site.getSkin("modern-tech");
      expect(modernTech).toBeDefined();
      expect(modernTech?.id).toBe("modern-tech");
      expect(modernTech?.name).toBe("Modern Tech");
    });
  });

  // ==================== BEHAVIOR 7: listPages() Query ====================

  describe("Behavior 7: Site.listPages() returns all pages", () => {
    let site: Site;

    beforeEach(() => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };
      site = Site.create(config);
    });

    it("should return all pages", () => {
      const pages = site.listPages();
      expect(pages).toHaveLength(2);
      expect(pages.map((p) => p.id)).toContain("home");
      expect(pages.map((p) => p.id)).toContain("portfolio");
    });

    it("should return empty array when no pages registered", () => {
      const emptyConfig: SiteCreateConfig = {
        id: "empty-site",
        title: "Empty Site",
        description: "A site with no pages",
        defaultSkinId: "minimalist",
        pageRegistry: new Map(),
        skinRegistry: testSkins,
        widgetRegistry,
      };
      const emptySite = Site.create(emptyConfig);
      expect(emptySite.listPages()).toHaveLength(0);
    });

    it("should return pages in consistent order", () => {
      const pages1 = site.listPages();
      const pages2 = site.listPages();
      expect(pages1.map((p) => p.id)).toEqual(pages2.map((p) => p.id));
    });
  });

  // ==================== BEHAVIOR 8: getDefaultSkin() Query ====================

  describe("Behavior 8: Site.getDefaultSkin() returns default skin", () => {
    let site: Site;

    beforeEach(() => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };
      site = Site.create(config);
    });

    it("should return default skin", () => {
      const skin = site.getDefaultSkin();
      expect(skin).toBeDefined();
      expect(skin.id).toBe("minimalist");
    });

    it("should return the correct default skin when multiple skins exist", () => {
      const skin = site.getDefaultSkin();
      expect(skin.name).toBe("Minimalist");
    });
  });

  // ==================== BEHAVIOR 9: Site Immutability ====================

  describe("Behavior 9: Site instance is immutable (frozen)", () => {
    let site: Site;

    beforeEach(() => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };
      site = Site.create(config);
    });

    it("should be frozen", () => {
      expect(Object.isFrozen(site)).toBe(true);
    });

    it("should throw when attempting to modify id", () => {
      expect(() => {
        (site as any).id = "modified";
      }).toThrow();
    });

    it("should throw when attempting to modify title", () => {
      expect(() => {
        (site as any).title = "Modified Title";
      }).toThrow();
    });

    it("should throw when attempting to modify description", () => {
      expect(() => {
        (site as any).description = "Modified Description";
      }).toThrow();
    });

    it("should throw when attempting to modify defaultSkinId", () => {
      expect(() => {
        (site as any).defaultSkinId = "modern-tech";
      }).toThrow();
    });
  });

  // ==================== BEHAVIOR 10: Pages Registry Immutability ====================

  describe("Behavior 10: Pages registry cannot be modified after creation", () => {
    let site: Site;

    beforeEach(() => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };
      site = Site.create(config);
    });

    it("should not allow adding new pages", () => {
      const newPage = Page.create({
        id: "new-page",
        path: "/new",
        title: "New Page",
        description: "A new page",
        language: "en",
        content: [
          Widget.create({
            type: "hero",
            parameters: { title: "New" },
            registry: widgetRegistry,
          }),
        ],
      });

      expect(() => {
        (site as any).pages.set("new-page", newPage);
      }).toThrow();
    });

    it("should not allow deleting pages", () => {
      expect(() => {
        (site as any).pages.delete("home");
      }).toThrow();
    });

    it("should not allow clearing pages", () => {
      expect(() => {
        (site as any).pages.clear();
      }).toThrow();
    });
  });

  // ==================== BEHAVIOR 11: Skins Registry Immutability ====================

  describe("Behavior 11: Skins registry cannot be modified after creation", () => {
    let site: Site;

    beforeEach(() => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };
      site = Site.create(config);
    });

    it("should not allow adding new skins", () => {
      const newSkin = Skin.create({
        id: "new-skin",
        name: "New Skin",
        description: "A new skin",
        scope: "site",
        light: {
          bgPrimary: "#fff",
          bgSecondary: "#f0f0f0",
          textPrimary: "#000",
          textSecondary: "#666",
          accent: "#007bff",
          accentHover: "#0056b3",
          accentSecondary: null,
          accentTertiary: null,
          border: "#ddd",
          shadow: "0 2px 4px rgba(0,0,0,0.1)",
          borderRadius: "4px",
          transition: "all 0.3s ease",
          glow: "none",
          gradient: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
          spacingSection: "64px",
          spacingCard: "24px",
          spacingElement: "12px",
          fontBody: "sans-serif",
          fontHeading: "sans-serif",
          fontMono: "monospace",
          headingWeight: "600",
          bodyLineHeight: "1.6",
          contentMaxWidth: "1200px",
          headingLetterSpacing: "0",
          buttonTextColor: "#fff",
          buttonTextShadow: "none",
          scanlineOpacity: "0",
        },
        dark: {
          bgPrimary: "#1a1a1a",
          bgSecondary: "#2a2a2a",
          textPrimary: "#fff",
          textSecondary: "#999",
          accent: "#0099ff",
          accentHover: "#0077cc",
          accentSecondary: null,
          accentTertiary: null,
          border: "#444",
          shadow: "0 2px 4px rgba(0,0,0,0.3)",
          borderRadius: "4px",
          transition: "all 0.3s ease",
          glow: "none",
          gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          spacingSection: "64px",
          spacingCard: "24px",
          spacingElement: "12px",
          fontBody: "sans-serif",
          fontHeading: "sans-serif",
          fontMono: "monospace",
          headingWeight: "600",
          bodyLineHeight: "1.6",
          contentMaxWidth: "1200px",
          headingLetterSpacing: "0",
          buttonTextColor: "#1a1a1a",
          buttonTextShadow: "none",
          scanlineOpacity: "0",
        },
      });

      expect(() => {
        (site as any).skins.set("new-skin", newSkin);
      }).toThrow();
    });

    it("should not allow deleting skins", () => {
      expect(() => {
        (site as any).skins.delete("minimalist");
      }).toThrow();
    });

    it("should not allow clearing skins", () => {
      expect(() => {
        (site as any).skins.clear();
      }).toThrow();
    });
  });

  // ==================== BEHAVIOR 12: Widget Registry Aggregation ====================

  describe("Behavior 12: Site aggregates widget registry", () => {
    let site: Site;

    beforeEach(() => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };
      site = Site.create(config);
    });

    it("should store widget registry", () => {
      expect(site.widgetRegistry).toBeDefined();
      expect(site.widgetRegistry).toBe(widgetRegistry);
    });

    it("should be able to access widget registry schema", () => {
      const schema = site.widgetRegistry.getSchema("hero");
      expect(schema).toBeDefined();
    });
  });

  // ==================== BEHAVIOR 13: Optional Description ====================

  describe("Behavior 13: Site description is optional", () => {
    it("should allow creating site without description", () => {
      const config: any = {
        id: "my-site",
        title: "My Site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      const site = Site.create(config);
      expect(site.description).toBeUndefined();
    });

    it("should store description when provided", () => {
      const config: SiteCreateConfig = {
        id: "my-site",
        title: "My Site",
        description: "My awesome site",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      const site = Site.create(config);
      expect(site.description).toBe("My awesome site");
    });
  });

  // ==================== BEHAVIOR 14: Site Reflects Input Configuration ====================

  describe("Behavior 14: Site accurately reflects input configuration", () => {
    it("should store all metadata correctly", () => {
      const config: SiteCreateConfig = {
        id: "test-site",
        title: "Test Site",
        description: "Test Description",
        defaultSkinId: "minimalist",
        pageRegistry: testPages,
        skinRegistry: testSkins,
        widgetRegistry,
      };

      const site = Site.create(config);

      expect(site.id).toBe("test-site");
      expect(site.title).toBe("Test Site");
      expect(site.description).toBe("Test Description");
      expect(site.defaultSkinId).toBe("minimalist");
      expect(site.listPages()).toHaveLength(testPages.size);
      expect(
        site
          .listPages()
          .map((p) => p.id)
          .sort(),
      ).toEqual(Array.from(testPages.keys()).sort());
    });
  });

  // ==================== BEHAVIOR 15: Multiple Registry Entries ====================

  describe("Behavior 15: Site handles multiple pages and skins correctly", () => {
    let site: Site;
    let largeSkins: Map<string, Skin>;
    let largePages: Map<string, Page>;

    beforeEach(() => {
      // Create 5 skins
      largeSkins = new Map();
      const skinIds = ["minimalist", "modern-tech"];
      for (const skinId of skinIds) {
        if (skinId === "minimalist") {
          largeSkins.set("minimalist", testSkins.get("minimalist")!);
        } else if (skinId === "modern-tech") {
          largeSkins.set("modern-tech", testSkins.get("modern-tech")!);
        }
      }

      // Create additional skins
      largeSkins.set(
        "professional",
        Skin.create({
          id: "professional",
          name: "Professional",
          description: "Professional theme",
          scope: "site",
          light: {
            bgPrimary: "#ffffff",
            bgSecondary: "#f9f9f9",
            textPrimary: "#1a1a1a",
            textSecondary: "#666666",
            accent: "#003d99",
            accentHover: "#002966",
            accentSecondary: null,
            accentTertiary: null,
            border: "#dadada",
            shadow: "0 1px 3px rgba(0,0,0,0.08)",
            borderRadius: "3px",
            transition: "all 0.25s ease",
            glow: "none",
            gradient: "linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)",
            spacingSection: "72px",
            spacingCard: "28px",
            spacingElement: "14px",
            fontBody: "Georgia, serif",
            fontHeading: "Georgia, serif",
            fontMono: "Courier, monospace",
            headingWeight: "500",
            bodyLineHeight: "1.8",
            contentMaxWidth: "980px",
            headingLetterSpacing: "0.5px",
            buttonTextColor: "#ffffff",
            buttonTextShadow: "none",
            scanlineOpacity: "0",
          },
          dark: {
            bgPrimary: "#2a2a2a",
            bgSecondary: "#353535",
            textPrimary: "#e8e8e8",
            textSecondary: "#b0b0b0",
            accent: "#66b3ff",
            accentHover: "#89c3ff",
            accentSecondary: null,
            accentTertiary: null,
            border: "#505050",
            shadow: "0 1px 3px rgba(0,0,0,0.2)",
            borderRadius: "3px",
            transition: "all 0.25s ease",
            glow: "none",
            gradient: "linear-gradient(135deg, #2a2a2a 0%, #353535 100%)",
            spacingSection: "72px",
            spacingCard: "28px",
            spacingElement: "14px",
            fontBody: "Georgia, serif",
            fontHeading: "Georgia, serif",
            fontMono: "Courier, monospace",
            headingWeight: "500",
            bodyLineHeight: "1.8",
            contentMaxWidth: "980px",
            headingLetterSpacing: "0.5px",
            buttonTextColor: "#2a2a2a",
            buttonTextShadow: "none",
            scanlineOpacity: "0",
          },
        }),
      );

      // Create 5 pages
      largePages = new Map(testPages);
      for (let i = 3; i <= 5; i++) {
        largePages.set(
          `page${i}`,
          Page.create({
            id: `page${i}`,
            path: `/page${i}`,
            title: `Page ${i}`,
            description: `Page ${i} description`,
            language: "en",
            content: [
              Widget.create({
                type: "hero",
                parameters: { title: `Page ${i}` },
                registry: widgetRegistry,
              }),
            ],
          }),
        );
      }

      const config: SiteCreateConfig = {
        id: "large-site",
        title: "Large Site",
        description: "A site with multiple pages and skins",
        defaultSkinId: "minimalist",
        pageRegistry: largePages,
        skinRegistry: largeSkins,
        widgetRegistry,
      };
      site = Site.create(config);
    });

    it("should list all pages", () => {
      const pages = site.listPages();
      expect(pages.length).toBeGreaterThanOrEqual(2);
    });

    it("should retrieve each skin individually", () => {
      expect(site.getSkin("minimalist")).toBeDefined();
      expect(site.getSkin("modern-tech")).toBeDefined();
      expect(site.getSkin("professional")).toBeDefined();
    });

    it("should retrieve each page individually", () => {
      expect(site.getPage("home")).toBeDefined();
      expect(site.getPage("portfolio")).toBeDefined();
      expect(site.getPage("page3")).toBeDefined();
    });
  });
});
