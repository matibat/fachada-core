/**
 * Parser BDD Tests — Test-Driven Development for application.yaml loader + JSON Schema validator
 *
 * Structure: Given/When/Then style for each behavior
 * Failing tests first (RED), then implement parser to make them pass (GREEN)
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { parseApplicationYaml } from "../parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_CONFIG_DIR = path.join(__dirname, "fixtures");

describe("Behavior 1: YAML file loads and validates against JSON Schema", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_CONFIG_DIR)) {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  it("Given a valid application.yaml with all required fields, When parsed, Then returns typed config object", () => {
    // Given
    const validYaml = `
seo:
  title: "Test App"
  description: "A test application"

themes:
  default: "minimalist"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, validYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config).toBeDefined();
    expect(config.seo).toBeDefined();
    expect(config.seo.title).toBe("Test App");
    expect(config.themes.default).toBe("minimalist");
    expect(config.pages).toBeDefined();
    expect(config.pages.landing).toBeDefined();
  });

  it("Given a valid YAML with nested widgets, When parsed, Then content array contains widget objects", () => {
    // Given
    const yamlWithWidgets = `
seo:
  title: "Widget Test"

themes:
  default: "minimalist"

pages:
  home:
    content:
      - type: HeroWidget
        props:
          title: "Welcome"
          subtitle: "Hello World"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, yamlWithWidgets);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.pages.home.content).toHaveLength(1);
    const widget = config.pages.home.content[0];
    expect(widget.type).toBe("HeroWidget");
    expect(widget.props?.title).toBe("Welcome");
  });

  it("Given a valid YAML with containers and nested children, When parsed, Then container children are recursively parsed", () => {
    // Given
    const yamlWithContainers = `
seo:
  title: "Container Test"

themes:
  default: "minimalist"

pages:
  home:
    content:
      - type: container
        layout: grid
        children:
          - type: HeroWidget
            props:
              title: "Inside Container"
          - type: container
            layout: flex
            children:
              - type: ButtonWidget
                props:
                  label: "Click Me"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, yamlWithContainers);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    const outerContainer = config.pages.home.content[0];
    expect(outerContainer.type).toBe("container");
    expect(outerContainer.children).toHaveLength(2);

    const innerWidget = outerContainer.children[0];
    expect(innerWidget.type).toBe("HeroWidget");

    const innerContainer = outerContainer.children[1];
    expect(innerContainer.type).toBe("container");
    expect(innerContainer.children).toHaveLength(1);
  });
});

describe("Behavior 2: Validation error includes file path and line number", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_CONFIG_DIR)) {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  it("Given a YAML with missing required 'seo' field, When parsed, Then error includes line number and field name", () => {
    // Given
    const invalidYaml = `
themes:
  default: "minimalist"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
    const error = (() => {
      try {
        parseApplicationYaml(configPath);
      } catch (e) {
        return e as Error;
      }
      return new Error("No error thrown");
    })();

    expect(error.message).toContain("application.yaml");
    expect(error.message).toContain("seo");
    expect(error.message).toMatch(/:\d+:/); // matches ":X:" format for line numbers
  });

  it("Given a YAML with missing required 'themes.default' field, When parsed, Then error includes line number", () => {
    // Given
    const invalidYaml = `
seo:
  title: "Test"

themes:
  globals: []

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
    const error = (() => {
      try {
        parseApplicationYaml(configPath);
      } catch (e) {
        return e as Error;
      }
      return new Error("No error thrown");
    })();

    expect(error.message).toContain("application.yaml");
    expect(error.message).toContain("default");
  });

  it("Given a YAML with type mismatch (pages not object), When parsed, Then error includes line number and type info", () => {
    // Given
    const invalidYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  - invalid_array_instead_of_object
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
    const error = (() => {
      try {
        parseApplicationYaml(configPath);
      } catch (e) {
        return e as Error;
      }
      return new Error("No error thrown");
    })();

    expect(error.message).toContain("application.yaml");
    expect(error.message).toMatch(/type|object|array/i);
  });

  it("Given a page with missing required 'content' field, When parsed, Then error includes page name and line", () => {
    // Given
    const invalidYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    title: "Landing Page"
    description: "A landing page"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
    const error = (() => {
      try {
        parseApplicationYaml(configPath);
      } catch (e) {
        return e as Error;
      }
      return new Error("No error thrown");
    })();

    expect(error.message).toContain("application.yaml");
    expect(error.message).toContain("content");
  });
});

describe("Behavior 3: Missing optional fields handled with defaults", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_CONFIG_DIR)) {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  it("Given a minimal valid YAML with only required fields, When parsed, Then optional fields are populated with defaults or undefined", () => {
    // Given
    const minimalYaml = `
seo:
  title: "Minimal App"

themes:
  default: "minimalist"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, minimalYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.seo.description).toBeUndefined();
    expect(config.pages.landing.description).toBeUndefined();
    expect(config.themes.globals).toBeUndefined();
  });

  it("Given a page without 'skin' field, When parsed, Then page is valid and skin is optional", () => {
    // Given
    const yamlNoSkin = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    title: "Home"
    content:
      - type: HeroWidget
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, yamlNoSkin);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.pages.landing).toBeDefined();
    expect(config.pages.landing.skin).toBeUndefined();
  });

  it("Given optional top-level sections (skins, assets, siteTree) not provided, When parsed, Then config is valid", () => {
    // Given
    const yamlMinimal = `
seo:
  title: "Minimal"

themes:
  default: "minimalist"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, yamlMinimal);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config).toBeDefined();
    expect(config.skins).toBeUndefined();
    expect(config.assets).toBeUndefined();
    expect(config.siteTree).toBeUndefined();
  });
});

describe("Behavior 4: Type mismatches, missing required fields, enum violations caught", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_CONFIG_DIR)) {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  it("Given a YAML where seo.title is a number instead of string, When parsed, Then validation fails with type error", () => {
    // Given
    const invalidYaml = `
seo:
  title: 123

themes:
  default: "minimalist"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
    const error = (() => {
      try {
        parseApplicationYaml(configPath);
      } catch (e) {
        return e as Error;
      }
      return new Error("No error thrown");
    })();

    expect(error.message).toContain("title");
    expect(error.message).toMatch(/type|string|number/i);
  });

  it("Given a YAML with widget type missing, When parsed, Then validation fails", () => {
    // Given
    const invalidYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content:
      - props:
          title: "Missing type"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
    const error = (() => {
      try {
        parseApplicationYaml(configPath);
      } catch (e) {
        return e as Error;
      }
      return new Error("No error thrown");
    })();

    expect(error.message).toContain("type");
  });

  it("Given a YAML where themes.default references non-existent theme, When parsed, Then should parse (name validation deferred)", () => {
    // Given: Schema only validates that default is a string; reference validation is app-level
    const yamlNoError = `
seo:
  title: "Test"

themes:
  default: "nonexistent-theme"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, yamlNoError);

    // When
    const config = parseApplicationYaml(configPath);

    // Then: Parser accepts it (reference validation is outside schema scope)
    expect(config.themes.default).toBe("nonexistent-theme");
  });

  it("Given a YAML with unknown top-level keys, When parsed, Then validation fails (additionalProperties: false)", () => {
    // Given
    const invalidYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content: []

unknown_key: "should fail"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
  });
});

describe("Behavior 5: Parser returns fully typed objects (no 'any')", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_CONFIG_DIR)) {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  it("Given a valid application.yaml, When parsed as const config = parseApplicationYaml(...), Then config type is strictly ApplicationConfig (test TypeScript inference)", () => {
    // Given
    const validYaml = `
seo:
  title: "Type Test"

themes:
  default: "minimalist"

pages:
  landing:
    content:
      - type: HeroWidget
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, validYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then: runtime check (TypeScript inference verified separately in type-checking pass)
    expect(config).toBeDefined();
    expect(typeof config === "object").toBe(true);
    expect(config.seo).toBeDefined();
    expect(typeof config.seo.title === "string").toBe(true);
  });
});

describe("Behavior 6: Schema is reusable and handles deeply nested structures", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_CONFIG_DIR)) {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  it("Given a YAML with 6-level deep nested containers, When parsed, Then all levels are preserved and accessible", () => {
    // Given: unlimited nesting support
    const deepYaml = `
seo:
  title: "Deep Test"

themes:
  default: "minimalist"

pages:
  deep:
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
                  - type: container
                    layout: grid
                    children:
                      - type: container
                        layout: flex
                        children:
                          - type: HeroWidget
                            props:
                              title: "Level 6"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, deepYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    let current: any = config.pages.deep.content[0];
    expect(current.type).toBe("container");

    for (let i = 0; i < 5; i++) {
      expect(current.children).toBeDefined();
      expect(current.children.length).toBeGreaterThan(0);
      current = current.children[0];
    }

    expect(current.type).toBe("HeroWidget");
    expect(current.props?.title).toBe("Level 6");
  });
});

describe("Edge Cases & Coverage", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_CONFIG_DIR)) {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  it("Given a YAML file with syntax error (malformed YAML), When parsed, Then error includes syntax details", () => {
    // Given: malformed YAML
    const malformedYaml = `
seo:
  title: "Test
  invalid syntax here
    bad indentation
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, malformedYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
    const error = (() => {
      try {
        parseApplicationYaml(configPath);
      } catch (e) {
        return e as Error;
      }
      return new Error("No error thrown");
    })();

    expect(error.message).toContain("application.yaml");
    expect(error.message).toMatch(/YAML|syntax/i);
  });

  it("Given a page with invalid 'skin' type (neither string nor object), When parsed, Then validation fails", () => {
    // Given: skin as array (invalid per schema)
    const invalidSkinYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content: []
    skin:
      - invalid_as_array
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidSkinYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
  });

  it("Given a container with empty children array, When parsed, Then is valid", () => {
    // Given
    const yamlEmptyChildren = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content:
      - type: container
        layout: grid
        children: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, yamlEmptyChildren);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    const container = config.pages.landing.content[0];
    expect(container.type).toBe("container");
    expect(container.children).toEqual([]);
  });

  it("Given a widget with props containing complex nested objects, When parsed, Then props are preserved as-is", () => {
    // Given
    const complexPropsYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content:
      - type: ComplexWidget
        props:
          nested:
            deep:
              value: "preserved"
          array:
            - item1
            - item2
          number: 42
          boolean: true
          nullValue: null
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, complexPropsYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    const widget = config.pages.landing.content[0];
    expect(widget.props?.nested?.deep?.value).toBe("preserved");
    expect(widget.props?.array).toEqual(["item1", "item2"]);
    expect(widget.props?.number).toBe(42);
    expect(widget.props?.boolean).toBe(true);
    expect(widget.props?.nullValue).toBeNull();
  });

  it("Given application.yaml with multiple skins defined, When parsed, Then skins object is populated", () => {
    // Given
    const withSkinsYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content: []

skins:
  dark-mode:
    primary: "#000000"
    secondary: "#ffffff"
  light-mode:
    primary: "#ffffff"
    secondary: "#000000"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, withSkinsYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.skins).toBeDefined();
    expect(config.skins?.["dark-mode"]).toEqual({
      primary: "#000000",
      secondary: "#ffffff",
    });
    expect(config.skins?.["light-mode"]).toEqual({
      primary: "#ffffff",
      secondary: "#000000",
    });
  });

  it("Given application.yaml with assets, When parsed, Then assets are available", () => {
    // Given
    const withAssetsYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content: []

assets:
  logo: "/images/logo.png"
  hero:
    dark: "/images/hero-dark.jpg"
    light: "/images/hero-light.jpg"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, withAssetsYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.assets).toBeDefined();
    expect(config.assets?.logo).toBe("/images/logo.png");
    expect(config.assets?.hero).toEqual({
      dark: "/images/hero-dark.jpg",
      light: "/images/hero-light.jpg",
    });
  });

  it("Given a page with translations, When parsed, Then translations are preserved", () => {
    // Given
    const withTranslationsYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    title: "Landing Page"
    content: []
    translations:
      en:
        title: "Landing Page"
        subtitle: "Welcome"
      es:
        title: "Página de inicio"
        subtitle: "Bienvenido"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, withTranslationsYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.pages.landing.translations).toBeDefined();
    expect(config.pages.landing.translations?.en?.title).toBe("Landing Page");
    expect(config.pages.landing.translations?.es?.title).toBe(
      "Página de inicio",
    );
  });

  it("Given a page with tags, When parsed, Then tags array is preserved", () => {
    // Given
    const withTagsYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content: []
    tags:
      - featured
      - homepage
      - important
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, withTagsYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.pages.landing.tags).toEqual([
      "featured",
      "homepage",
      "important",
    ]);
  });

  it("Given a page with all optional SEO fields (keywords, og_image, author), When parsed, Then all are preserved", () => {
    // Given
    const fullSEOYaml = `
seo:
  title: "Test"
  description: "Test description"
  author: "John Doe"
  author_url: "https://johndoe.com"
  keywords:
    - web
    - design
    - portfolio
  og_image: "https://example.com/image.jpg"

themes:
  default: "minimalist"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, fullSEOYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.seo.description).toBe("Test description");
    expect(config.seo.author).toBe("John Doe");
    expect(config.seo.author_url).toBe("https://johndoe.com");
    expect(config.seo.keywords).toEqual(["web", "design", "portfolio"]);
    expect(config.seo.og_image).toBe("https://example.com/image.jpg");
  });

  it("Given a themes config with custom theme definitions, When parsed, Then custom themes are available", () => {
    // Given
    const withCustomThemesYaml = `
seo:
  title: "Test"

themes:
  default: "custom-theme"
  globals:
    - minimalist
  custom:
    custom-theme:
      name: "My Custom Theme"
      description: "A custom theme for my app"
      light:
        primary: "#0066cc"
        secondary: "#ffcc00"
      dark:
        primary: "#3399ff"
        secondary: "#ffff99"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, withCustomThemesYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.themes.custom?.["custom-theme"]).toBeDefined();
    expect(config.themes.custom?.["custom-theme"]?.name).toBe(
      "My Custom Theme",
    );
    expect(config.themes.custom?.["custom-theme"]?.light?.primary).toBe(
      "#0066cc",
    );
    expect(config.themes.custom?.["custom-theme"]?.dark?.primary).toBe(
      "#3399ff",
    );
  });

  it("Given a siteTree configuration, When parsed, Then siteTree is accessible", () => {
    // Given
    const withSiteTreeYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content: []

siteTree:
  root: "landing"
  children:
    - id: "about"
    - id: "portfolio"
    - id: "contact"
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, withSiteTreeYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    expect(config.siteTree).toBeDefined();
    expect((config.siteTree as any)?.root).toBe("landing");
    expect((config.siteTree as any)?.children).toHaveLength(3);
  });

  it("Given themes.globals is a string instead of array, When parsed, Then validation fails", () => {
    // Given: globals should be array
    const invalidGlobalsYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"
  globals: "minimalist"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidGlobalsYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
    const error = (() => {
      try {
        parseApplicationYaml(configPath);
      } catch (e) {
        return e as Error;
      }
      return new Error("No error thrown");
    })();

    expect(error.message).toContain("application.yaml");
  });

  it("Given themes.custom has invalid custom theme (missing light property), When parsed, Then validation fails", () => {
    // Given
    const invalidCustomThemeYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"
  custom:
    my-theme:
      name: "Incomplete"
      dark:
        primary: "#000"

pages:
  landing:
    content: []
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, invalidCustomThemeYaml);

    // When & Then
    expect(() => parseApplicationYaml(configPath)).toThrow();
  });

  it("Given widget properties with all valid scalar types, When parsed, Then all are preserved correctly", () => {
    // Given
    const allScalarTypesYaml = `
seo:
  title: "Test"

themes:
  default: "minimalist"

pages:
  landing:
    content:
      - type: AllScalarWidget
        props:
          stringValue: "text"
          numberValue: 42
          floatValue: 3.14
          booleanTrue: true
          booleanFalse: false
          nullValue: null
`;
    const configPath = path.join(TEST_CONFIG_DIR, "application.yaml");
    fs.writeFileSync(configPath, allScalarTypesYaml);

    // When
    const config = parseApplicationYaml(configPath);

    // Then
    const widget = config.pages.landing.content[0];
    expect(widget.props?.stringValue).toBe("text");
    expect(widget.props?.numberValue).toBe(42);
    expect(widget.props?.floatValue).toBe(3.14);
    expect(widget.props?.booleanTrue).toBe(true);
    expect(widget.props?.booleanFalse).toBe(false);
    expect(widget.props?.nullValue).toBeNull();
  });
});
