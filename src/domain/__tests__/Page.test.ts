/**
 * BDD tests for Page domain aggregate
 *
 * Test structure follows UX-driven behavior definition:
 * - Each behavior states ONE THING the system must do from the outside
 * - Tests map behaviors to acceptance criteria
 * - RED/GREEN/REFACTOR cycle documents evolution
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Widget } from "../Widget";
import { Container } from "../Container";
import { WidgetRegistry } from "../WidgetRegistry";
import { Page, type PageCreateConfig } from "../Page";

describe("Page domain aggregate", () => {
  let registry: WidgetRegistry;
  let heroWidget: Widget;
  let containerWithWidget: Container;

  beforeEach(() => {
    // Set up test fixtures
    registry = new WidgetRegistry();
    heroWidget = Widget.create({
      type: "hero",
      parameters: { title: "Welcome" },
      registry,
    });
    containerWithWidget = Container.create({
      layout: "grid-3",
      children: [heroWidget],
    });
  });

  // ========================================================================
  // BEHAVIOR 1: Page factory validates content array not empty
  // ========================================================================
  describe("Behavior 1: Page factory validates content array not empty", () => {
    it("should create a page with valid content array", () => {
      const page = Page.create({
        id: "home",
        path: "/home",
        title: "Home Page",
        description: "Welcome to home",
        language: "en",
        content: [heroWidget],
      });

      expect(page).toBeDefined();
      expect(page.id).toBe("home");
      expect(page.path).toBe("/home");
    });

    it("should create a page with multiple content items", () => {
      const page = Page.create({
        id: "portfolio",
        path: "/portfolio",
        title: "Portfolio",
        description: "My work",
        language: "en",
        content: [heroWidget, containerWithWidget, heroWidget],
      });

      expect(page.content).toHaveLength(3);
    });

    it("should reject page creation when content array is empty", () => {
      expect(() =>
        Page.create({
          id: "empty",
          path: "/empty",
          title: "Empty Page",
          description: "No content",
          language: "en",
          content: [],
        }),
      ).toThrow(/content|empty/i);
    });

    it("should reject page creation when content is undefined", () => {
      expect(() =>
        Page.create({
          id: "no-content",
          path: "/no-content",
          title: "No Content",
          description: "Missing content",
          language: "en",
          content: undefined as any,
        }),
      ).toThrow(/content|required/i);
    });
  });

  // ========================================================================
  // BEHAVIOR 2: Page factory validates path starts with "/"
  // ========================================================================
  describe("Behavior 2: Page factory validates path starts with forward slash", () => {
    it("should accept paths starting with /", () => {
      const page = Page.create({
        id: "test",
        path: "/",
        title: "Root",
        description: "Root page",
        language: "en",
        content: [heroWidget],
      });

      expect(page.path).toBe("/");
    });

    it("should accept nested paths starting with /", () => {
      const page = Page.create({
        id: "test",
        path: "/about/team",
        title: "Team",
        description: "Our team",
        language: "en",
        content: [heroWidget],
      });

      expect(page.path).toBe("/about/team");
    });

    it("should reject paths not starting with /", () => {
      expect(() =>
        Page.create({
          id: "test",
          path: "home",
          title: "Home",
          description: "Home page",
          language: "en",
          content: [heroWidget],
        }),
      ).toThrow(/path|must start with|forward slash/i);
    });

    it("should reject empty paths", () => {
      expect(() =>
        Page.create({
          id: "test",
          path: "",
          title: "Empty Path",
          description: "No path",
          language: "en",
          content: [heroWidget],
        }),
      ).toThrow(/path|must start with|forward slash/i);
    });
  });

  // ========================================================================
  // BEHAVIOR 3: Page content is strongly typed as (Widget | Container)[]
  // ========================================================================
  describe("Behavior 3: Page content is strongly typed as Widget or Container array", () => {
    it("should contain only widgets in content array", () => {
      const widget1 = Widget.create({
        type: "hero",
        parameters: { title: "Hero" },
        registry,
      });
      const widget2 = Widget.create({
        type: "portfolio",
        parameters: { title: "Portfolio" },
        registry,
      });

      const page = Page.create({
        id: "widgets-only",
        path: "/widgets",
        title: "Widgets Page",
        description: "Only widgets",
        language: "en",
        content: [widget1, widget2],
      });

      expect(page.content).toHaveLength(2);
      expect(page.content[0]).toBe(widget1);
      expect(page.content[1]).toBe(widget2);
    });

    it("should contain only containers in content array", () => {
      const container1 = Container.create({
        layout: "grid-3",
        children: [heroWidget],
      });
      const container2 = Container.create({
        layout: "flex-row",
        children: [heroWidget],
      });

      const page = Page.create({
        id: "containers-only",
        path: "/containers",
        title: "Containers Page",
        description: "Only containers",
        language: "en",
        content: [container1, container2],
      });

      expect(page.content).toHaveLength(2);
      expect(page.content[0]).toBe(container1);
    });

    it("should allow mixed widgets and containers", () => {
      const container = Container.create({
        layout: "grid-3",
        children: [heroWidget],
      });

      const page = Page.create({
        id: "mixed",
        path: "/mixed",
        title: "Mixed Page",
        description: "Widgets and containers",
        language: "en",
        content: [heroWidget, container, heroWidget],
      });

      expect(page.content).toHaveLength(3);
    });
  });

  // ========================================================================
  // BEHAVIOR 4: Page translation lookup returns value or undefined
  // ========================================================================
  describe("Behavior 4: Page translation lookup returns value or undefined", () => {
    it("should return translation value when language and key exist", () => {
      const page = Page.create({
        id: "i18n",
        path: "/i18n",
        title: "i18n Page",
        description: "With translations",
        language: "en",
        content: [heroWidget],
        translations: {
          es: {
            greeting: "Hola",
            farewell: "Adiós",
          },
          fr: {
            greeting: "Bonjour",
          },
        },
      });

      expect(page.getTranslation("es", "greeting")).toBe("Hola");
      expect(page.getTranslation("fr", "greeting")).toBe("Bonjour");
    });

    it("should return undefined when language exists but key missing", () => {
      const page = Page.create({
        id: "i18n",
        path: "/i18n",
        title: "i18n Page",
        description: "With translations",
        language: "en",
        content: [heroWidget],
        translations: {
          es: {
            greeting: "Hola",
          },
        },
      });

      expect(page.getTranslation("es", "missing_key")).toBeUndefined();
    });

    it("should return undefined when language missing", () => {
      const page = Page.create({
        id: "i18n",
        path: "/i18n",
        title: "i18n Page",
        description: "With translations",
        language: "en",
        content: [heroWidget],
        translations: {
          es: {
            greeting: "Hola",
          },
        },
      });

      expect(page.getTranslation("de", "greeting")).toBeUndefined();
    });

    it("should return undefined when no translations defined", () => {
      const page = Page.create({
        id: "no-i18n",
        path: "/no-i18n",
        title: "No i18n",
        description: "No translations",
        language: "en",
        content: [heroWidget],
      });

      expect(page.getTranslation("es", "greeting")).toBeUndefined();
    });

    it("should handle complex translation values", () => {
      const page = Page.create({
        id: "complex",
        path: "/complex",
        title: "Complex",
        description: "Complex translations",
        language: "en",
        content: [heroWidget],
        translations: {
          es: {
            "hero.title": "Bienvenido a mi portafolio",
            "hero.subtitle":
              "Soy un desarrollador apasionado con 10+ años de experiencia",
            "contact.email": "hola@example.com",
          },
        },
      });

      expect(page.getTranslation("es", "hero.title")).toBe(
        "Bienvenido a mi portafolio",
      );
      expect(page.getTranslation("es", "contact.email")).toBe(
        "hola@example.com",
      );
    });
  });

  // ========================================================================
  // BEHAVIOR 5: Page instance is immutable (frozen)
  // ========================================================================
  describe("Behavior 5: Page instance is immutable (frozen)", () => {
    it("should prevent mutation of id property", () => {
      const page = Page.create({
        id: "immutable",
        path: "/immutable",
        title: "Immutable",
        description: "Cannot change",
        language: "en",
        content: [heroWidget],
      });

      expect(() => {
        (page as any).id = "changed";
      }).toThrow();
    });

    it("should prevent mutation of path property", () => {
      const page = Page.create({
        id: "immutable",
        path: "/immutable",
        title: "Immutable",
        description: "Cannot change",
        language: "en",
        content: [heroWidget],
      });

      expect(() => {
        (page as any).path = "/changed";
      }).toThrow();
    });

    it("should prevent mutation of content array", () => {
      const page = Page.create({
        id: "immutable",
        path: "/immutable",
        title: "Immutable",
        description: "Cannot change",
        language: "en",
        content: [heroWidget],
      });

      expect(() => {
        (page.content as any).push(containerWithWidget);
      }).toThrow();
    });

    it("should freeze tags array", () => {
      const page = Page.create({
        id: "tags",
        path: "/tags",
        title: "Tags Page",
        description: "With tags",
        language: "en",
        content: [heroWidget],
        tags: ["featured", "blog"],
      });

      expect(() => {
        (page.tags as any).push("new-tag");
      }).toThrow();
    });

    it("should be frozen (Object.isFrozen returns true)", () => {
      const page = Page.create({
        id: "frozen",
        path: "/frozen",
        title: "Frozen",
        description: "Completely frozen",
        language: "en",
        content: [heroWidget],
      });

      expect(Object.isFrozen(page)).toBe(true);
    });

    it("should prevent mutation of translations", () => {
      const page = Page.create({
        id: "i18n",
        path: "/i18n",
        title: "i18n",
        description: "With i18n",
        language: "en",
        content: [heroWidget],
        translations: {
          es: {
            greeting: "Hola",
          },
        },
      });

      expect(() => {
        (page as any).translations.es.greeting = "Adiós";
      }).toThrow();
    });
  });

  // ========================================================================
  // BEHAVIOR 6: Page supports optional metadata (tags, skin override)
  // ========================================================================
  describe("Behavior 6: Page supports optional metadata (tags, skin override)", () => {
    it("should accept optional tags array", () => {
      const page = Page.create({
        id: "tagged",
        path: "/tagged",
        title: "Tagged Page",
        description: "With tags",
        language: "en",
        content: [heroWidget],
        tags: ["featured", "homepage", "blog"],
      });

      expect(page.tags).toContain("featured");
      expect(page.tags).toHaveLength(3);
    });

    it("should accept optional skin override", () => {
      const page = Page.create({
        id: "skinned",
        path: "/skinned",
        title: "Skinned Page",
        description: "With custom skin",
        language: "en",
        content: [heroWidget],
        skinOverride: "vaporwave",
      });

      expect(page.skinOverride).toBe("vaporwave");
    });

    it("should allow page without tags", () => {
      const page = Page.create({
        id: "no-tags",
        path: "/no-tags",
        title: "No Tags",
        description: "No tags",
        language: "en",
        content: [heroWidget],
      });

      expect(page.tags).toEqual([]);
    });

    it("should allow page without skin override", () => {
      const page = Page.create({
        id: "no-skin",
        path: "/no-skin",
        title: "No Skin",
        description: "No skin override",
        language: "en",
        content: [heroWidget],
      });

      expect(page.skinOverride).toBeUndefined();
    });

    it("should return all metadata properties", () => {
      const page = Page.create({
        id: "full-page",
        path: "/full-page",
        title: "Full Page",
        description: "Complete metadata",
        language: "pt-BR",
        content: [heroWidget],
        tags: ["premium", "portfolio"],
        skinOverride: "professional",
        translations: {
          pt: {
            title: "Página Completa",
          },
        },
      });

      expect(page.id).toBe("full-page");
      expect(page.path).toBe("/full-page");
      expect(page.title).toBe("Full Page");
      expect(page.description).toBe("Complete metadata");
      expect(page.language).toBe("pt-BR");
      expect(page.tags).toContain("premium");
      expect(page.skinOverride).toBe("professional");
      expect(page.getTranslation("pt", "title")).toBe("Página Completa");
    });
  });

  // ========================================================================
  // BEHAVIOR 7: All types fully specified (no `any`)
  // ========================================================================
  describe("Behavior 7: All types fully specified (no any)", () => {
    it("should expose content as readonly PageContent array", () => {
      const page = Page.create({
        id: "typed",
        path: "/typed",
        title: "Typed Page",
        description: "Fully typed",
        language: "en",
        content: [heroWidget],
      });

      // TypeScript should be happy with this
      const content: readonly (Widget | Container)[] = page.content;
      expect(content).toBeDefined();
    });

    it("should expose tags as readonly string array", () => {
      const page = Page.create({
        id: "tagged",
        path: "/tagged",
        title: "Tagged",
        description: "With tags",
        language: "en",
        content: [heroWidget],
        tags: ["tag1", "tag2"],
      });

      const tags: readonly string[] = page.tags;
      expect(tags).toBeDefined();
    });

    it("should have metadata properties with correct types", () => {
      const page = Page.create({
        id: "metadata",
        path: "/metadata",
        title: "Metadata",
        description: "Type safe",
        language: "en",
        content: [heroWidget],
      });

      // Verify each property type
      expect(typeof page.id).toBe("string");
      expect(typeof page.path).toBe("string");
      expect(typeof page.title).toBe("string");
      expect(typeof page.description).toBe("string");
      expect(typeof page.language).toBe("string");
      expect(Array.isArray(page.content)).toBe(true);
      expect(Array.isArray(page.tags)).toBe(true);
    });
  });
});
