# Fachada Core API Reference v1.x

Complete technical API documentation for framework consumers and contributors.

---

## 1. Core Exports

### From `@fachada/core`

```typescript
import {
  // Domain classes
  Widget,
  Container,
  Page,
  Skin,
  SkinRegistry,
  Site,

  // API functions
  loadSiteFromFile,
  loadSiteFromString,
  buildAstroContext,
  createWidgetRenderer,
  generateSkinCSS,
  generateCSSModule,

  // Types
  WidgetCreateConfig,
  ContainerCreateConfig,
  PageCreateConfig,
  SkinCreateConfig,
  SiteCreateConfig,

  // Astro context types
  AstroContextProps,
  AstroPageProps,
  AstroWidgetProps,
  AstroContainerProps,

  // Navbar + scroll transition
  NavbarConfig,
  HeroNavbarTransitionConfig,
} from "@fachada/core";
```

### HeroNavbarTransitionConfig

Configuration value object for the scroll-linked hero-to-navbar brand transition.
See [scroll-transition.md](./scroll-transition.md) for the full guide.

```typescript
interface HeroNavbarTransitionConfig {
  enabled: boolean; // must be true to activate
  startScroll?: number; // default: 0 (px from top)
  endScroll?: number; // default: 300 (px from top)
  easing?: string; // default: "ease" (any CSS easing function)
}
```

Added to `NavbarConfig.heroTransition`. Example `application.yaml`:

```yaml
navbar:
  heroTransition:
    enabled: true
    startScroll: 0
    endScroll: 250
    easing: "ease-in-out"
```

---

## 2. Domain Classes

### Widget

Represents a concrete widget component with immutable type identifier and schema-validated parameters.

**Signature**

```typescript
class Widget {
  static create(config: WidgetCreateConfig): Widget;

  get type(): string;
  get parameters(): Record<string, unknown>;
}
```

**Parameters**

```typescript
interface WidgetCreateConfig {
  type: string; // Registered widget type identifier
  parameters: Record<string, unknown>; // Widget-specific initialization props
  registry: WidgetRegistry; // Widget schema registry for validation
}
```

**Return Type**

- `Widget`: Immutable widget value object (frozen)

**Examples**

```typescript
const registry = new WidgetRegistry();
registry.register("hero", {
  properties: { title: { type: "string" } },
  required: ["title"],
});

const widget = Widget.create({
  type: "hero",
  parameters: { title: "Welcome to My Portfolio" },
  registry,
});

console.log(widget.type); // "hero"
console.log(widget.parameters); // { title: "Welcome to My Portfolio" }

// Parameters are frozen (immutable)
widget.parameters.title = "New Title"; // TypeError: Cannot assign to read only property
```

**Error Handling**

```typescript
try {
  const widget = Widget.create({
    type: "unknown",
    parameters: {},
    registry,
  });
} catch (err) {
  // Throws: "Widget type 'unknown' is not registered..."
  console.error(err.message);
}

try {
  const widget = Widget.create({
    type: "hero",
    parameters: {}, // Missing required "title"
    registry,
  });
} catch (err) {
  // Throws: 'Widget "hero" requires parameter "title"'
  console.error(err.message);
}
```

---

### Container

Represents a layout container holding nested Widgets and/or Containers. Supports unlimited nesting depth.

**Signature**

```typescript
class Container {
  static create(config: ContainerCreateConfig): Container;

  get layout(): string;
  get children(): readonly ContainerChild[];
  get props(): Record<string, unknown> | undefined;
  get skin(): string | Record<string, unknown> | undefined;
}
```

**Parameters**

```typescript
interface ContainerCreateConfig {
  layout: string; // Layout type (e.g., "grid", "flex")
  children: ContainerChild[]; // Array of Widgets or Containers
  props?: Record<string, unknown>; // Optional layout configuration props
  skin?: string | Record<string, unknown>; // Optional skin override
}

type ContainerChild = Widget | Container;
```

**Return Type**

- `Container`: Immutable container value object (frozen)

**Examples**

```typescript
const widget1 = Widget.create({ type: "hero", parameters: {}, registry });
const widget2 = Widget.create({ type: "gallery", parameters: {}, registry });

// Create a grid layout with two widgets
const container = Container.create({
  layout: "grid",
  children: [widget1, widget2],
  props: { columns: 2, gap: "1rem" },
});

console.log(container.layout); // "grid"
console.log(container.children.length); // 2

// Nested containers (unlimited depth)
const nestedContainer = Container.create({
  layout: "flex",
  children: [container, widget1],
  props: { direction: "column" },
});
```

**Error Handling**

```typescript
try {
  Container.create({
    layout: "grid",
    children: [], // Empty children array
  });
} catch (err) {
  // Throws: "Container children array cannot be empty"
  console.error(err.message);
}

try {
  Container.create({
    layout: "grid",
    children: ["not a widget"], // Invalid child type
  });
} catch (err) {
  // Throws: "Container child at index 0 must be a Widget or Container instance..."
  console.error(err.message);
}
```

---

### Page

Represents a single page with metadata, content (Widgets/Containers), translations, and optional skin override.

**Signature**

```typescript
class Page {
  static create(config: PageCreateConfig): Page;

  get id(): string;
  get path(): string;
  get title(): string;
  get description(): string;
  get language(): string;
  get content(): readonly PageContent[];
  get translations(): PageTranslations | undefined;
  get skinOverride(): string | undefined;
  get tags(): readonly string[];
}
```

**Parameters**

```typescript
interface PageCreateConfig {
  id: string; // Unique page identifier
  path: string; // URL path (must start with "/")
  title: string; // Page title for SEO
  description: string; // Page meta description
  language: string; // Language code (e.g., "en", "es")
  content: (Widget | Container)[]; // Page content array
  translations?: PageTranslations; // Per-language translation keys
  skinOverride?: string; // Optional skin ID override
  tags?: string[]; // Optional categorization tags
}

type PageContent = Widget | Container;
type PageTranslations = Record<string, Record<string, string>>;
```

**Return Type**

- `Page`: Immutable aggregate object (frozen)

**Examples**

```typescript
const page = Page.create({
  id: "home",
  path: "/",
  title: "Home | My Portfolio",
  description: "Welcome to my portfolio",
  language: "en",
  content: [widget1, container],
  translations: {
    en: { greeting: "Welcome" },
    es: { greeting: "Bienvenido" },
  },
  skinOverride: "dark",
  tags: ["landing", "featured"],
});

console.log(page.title); // "Home | My Portfolio"
console.log(page.path); // "/"

// Translations are frozen
const key = page.translations?.en?.greeting;
// key is immutable
```

**Error Handling**

```typescript
try {
  Page.create({
    id: "about",
    path: "about", // Missing leading "/"
    title: "About",
    description: "About me",
    language: "en",
    content: [widget1],
  });
} catch (err) {
  // Throws: "Page path must start with forward slash (/)"
  console.error(err.message);
}

try {
  Page.create({
    id: "services",
    path: "/services",
    title: "Services",
    description: "My services",
    language: "en",
    content: [], // Empty content
  });
} catch (err) {
  // Throws: "Page content array cannot be empty"
  console.error(err.message);
}
```

---

### Skin

Represents a reusable design token set with light/dark variants. Supports CASCADE hierarchy (Site > Page > Widget).

**Signature**

```typescript
class Skin {
  static create(config: SkinCreateConfig): Skin;

  get id(): string;
  get name(): string;
  get description(): string;
  get scope(): SkinScope;
  get tokens(mode: "light" | "dark"): ThemeTokens;
  get extends(): string | undefined;
}

type SkinScope = "site" | "page" | "widget";
```

**Parameters**

```typescript
interface SkinCreateConfig {
  id: string; // Unique skin identifier (e.g., "dark-mode")
  name: string; // Human-readable name
  description: string; // Purpose/usage description
  scope: SkinScope; // CASCADE scope: "site" | "page" | "widget"
  light: Partial<ThemeTokens>; // Light mode CSS tokens (27 available)
  dark: Partial<ThemeTokens>; // Dark mode CSS tokens (27 available)
  extends?: string; // Optional parent skin ID for inheritance
}

// 27 CSS Token Keys:
interface ThemeTokens {
  bgPrimary: string; // Background primary color
  bgSecondary: string; // Background secondary color
  textPrimary: string; // Text primary color
  textSecondary: string; // Text secondary color
  accent: string; // Accent color (primary interactive)
  accentHover: string; // Accent hover state
  accentSecondary: string; // Accent secondary (optional)
  accentTertiary: string; // Accent tertiary (optional)
  border: string; // Border color
  shadow: string; // Shadow color
  borderRadius: string; // Border radius (CSS value)
  transition: string; // Transition timing (CSS value)
  glow: string; // Glow effect color
  gradient: string; // Gradient definition
  spacingSection: string; // Section spacing (CSS value)
  spacingCard: string; // Card spacing (CSS value)
  spacingElement: string; // Element spacing (CSS value)
  fontBody: string; // Body font family
  fontHeading: string; // Heading font family
  fontMono: string; // Monospace font family
  headingWeight: string; // Heading font weight
  bodyLineHeight: string; // Body line height
  contentMaxWidth: string; // Content max width
  headingLetterSpacing: string; // Heading letter spacing
  buttonTextColor: string; // Button text color
  buttonTextShadow: string; // Button text shadow
  scanlineOpacity: string; // Scanline opacity (retro effect)
}
```

**Return Type**

- `Skin`: Immutable value object (frozen)

**Examples**

```typescript
const darkSkin = Skin.create({
  id: "dark-mode",
  name: "Dark Mode",
  description: "Professional dark color scheme",
  scope: "site",
  light: {
    bgPrimary: "#FFFFFF",
    textPrimary: "#000000",
    accent: "#0066FF",
  },
  dark: {
    bgPrimary: "#1A1A1A",
    textPrimary: "#FFFFFF",
    accent: "#00AAFF",
  },
});

// Skin with inheritance
const customDarkSkin = Skin.create({
  id: "custom-dark",
  name: "Custom Dark",
  description: "Dark mode with custom accent",
  scope: "page",
  light: { accent: "#FF6600" },
  dark: { accent: "#FF9933" },
  extends: "dark-mode", // Inherits from dark-mode tokens
});

console.log(darkSkin.scope); // "site"
```

**Error Handling**

```typescript
try {
  Skin.create({
    id: "",
    name: "Empty ID",
    description: "Invalid",
    scope: "site",
    light: {},
    dark: {},
  });
} catch (err) {
  // Throws: "Skin id is required and must be a non-empty string"
  console.error(err.message);
}

try {
  Skin.create({
    id: "test",
    name: "Test",
    description: "Invalid scope",
    scope: "invalid", // Not: "site" | "page" | "widget"
    light: {},
    dark: {},
  });
} catch (err) {
  // Throws: 'Skin scope must be one of: site, page, widget...'
  console.error(err.message);
}
```

---

### Site (Aggregate Root)

The root aggregate representing a complete site configuration with pages, skins, and widget registry.

**Signature**

```typescript
class Site {
  static create(config: SiteCreateConfig): Site;

  get id(): string;
  get title(): string;
  get description(): string | undefined;
  get defaultSkinId(): string;
  get pages(): ReadonlyMap<string, Page>;
  get skins(): ReadonlyMap<string, Skin>;
  get widgetRegistry(): WidgetRegistry;

  getPage(id: string): Page | undefined;
  getSkin(id: string): Skin | undefined;
}
```

**Parameters**

```typescript
interface SiteCreateConfig {
  id: string; // Unique site identifier
  title: string; // Site title (SEO)
  description?: string; // Site description
  defaultSkinId: string; // Default skin ID (must exist)
  pageRegistry: Map<string, Page>; // Pages map
  skinRegistry: Map<string, Skin>; // Skins map
  widgetRegistry: WidgetRegistry; // Widget schema registry
}
```

**Return Type**

- `Site`: Immutable aggregate root (all nested maps frozen)

**Examples**

```typescript
const pages = new Map([
  ["home", homePage],
  ["about", aboutPage],
]);

const skins = new Map([
  ["light", lightSkin],
  ["dark", darkSkin],
]);

const site = Site.create({
  id: "portfolio",
  title: "My Portfolio",
  description: "Designer & Developer",
  defaultSkinId: "light",
  pageRegistry: pages,
  skinRegistry: skins,
  widgetRegistry: registry,
});

console.log(site.title); // "My Portfolio"
console.log(site.pages.size); // 2

// Get specific resources
const homePage = site.getPage("home");
const darkSkin = site.getSkin("dark");
```

**Error Handling**

```typescript
try {
  Site.create({
    id: "portfolio",
    title: "My Portfolio",
    defaultSkinId: "missing-skin", // Doesn't exist in skinRegistry
    pageRegistry: new Map([["home", homePage]]),
    skinRegistry: new Map([["light", lightSkin]]),
    widgetRegistry: registry,
  });
} catch (err) {
  // Throws: 'Site validation error: default skin "missing-skin" not found...'
  console.error(err.message);
}
```

---

## 3. API Functions

### loadSiteFromFile

Loads a YAML configuration file and constructs an immutable Site domain object. This is the primary entry point for site initialization.

**Signature**

```typescript
function loadSiteFromFile(filePath: string): Promise<Site>;
```

**Parameters**

- `filePath` (string): Absolute or relative path to `application.yaml`

**Return Type**

- `Promise<Site>`: Resolves to immutable Site aggregate root

**Error Handling**

```typescript
type ConfigLoaderError = {
  name: string; // "ConfigLoaderError"
  filePath: string; // File path
  lineNumber: number | null;
  message: string; // Descriptive error message
  context?: string; // Additional context (e.g., widget type)
};
```

**Examples**

```typescript
import { loadSiteFromFile } from "@fachada/core";

// Load and initialize site
const site = await loadSiteFromFile("./application.yaml");
console.log(site.title); // "My Portfolio"

// Get pages for rendering
const homePage = site.getPage("home");
if (homePage) {
  console.log(homePage.title);
}

// Error handling with specific context
try {
  const site = await loadSiteFromFile("./missing.yaml");
} catch (err) {
  if (err instanceof ConfigLoaderError) {
    console.error(`Error in ${err.filePath}:`);
    console.error(`  Line ${err.lineNumber}: ${err.message}`);
    if (err.context) console.error(`  Context: ${err.context}`);
  }
}
```

---

### loadSiteFromString

Loads a YAML string and constructs a Site. Useful for testing or dynamic configuration.

**Signature**

```typescript
function loadSiteFromString(yaml: string, sourceLabel?: string): Promise<Site>;
```

**Parameters**

- `yaml` (string): YAML content as string
- `sourceLabel` (string, optional): Label for error messages (defaults to "inline")

**Return Type**

- `Promise<Site>`: Resolves to immutable Site aggregate root

**Examples**

```typescript
const yaml = `
seo:
  title: "Test Portfolio"
themes:
  default: light
pages:
  home:
    path: /
    title: Home
    description: Home page
    language: en
    content: []
skins:
  light:
    id: light
    name: Light Mode
    scope: site
    light: { bgPrimary: "#FFF" }
    dark: { bgPrimary: "#000" }
`;

const site = await loadSiteFromString(yaml, "test-config");
console.log(site.title); // "Test Portfolio"
```

---

### buildAstroContext

Flattens immutable domain objects into template-friendly props for Astro components.

**Signature**

```typescript
function buildAstroContext(params: {
  site: Site;
  pageId: string;
  language?: string;
}): AstroContextProps;
```

**Parameters**

```typescript
interface BuildAstroContextParams {
  site: Site; // Loaded Site aggregate root
  pageId: string; // Page ID to render
  language?: string; // Override language (defaults to page language)
}
```

**Return Type**

```typescript
interface AstroContextProps {
  page: AstroPageProps;
  content: AstroPageContentProps[];
  skinTokens: AstroSkinTokensProps;
  translations: Record<string, AstroTranslationsProps>;
  metadata: AstroMetadataProps;
}

interface AstroPageProps {
  id: string;
  title: string;
  description: string;
  path: string;
  language: string;
  tags: readonly string[];
}

interface AstroPageContentProps = AstroWidgetProps | AstroContainerProps;

interface AstroWidgetProps {
  type: string;
  parameters: Record<string, unknown>;
}

interface AstroContainerProps {
  layout: string;
  children: AstroPageContentProps[];
  props?: Record<string, unknown>;
}

interface AstroSkinTokensProps {
  light: ThemeTokens;
  dark: ThemeTokens;
}

interface AstroMetadataProps {
  title: string;
  description: string;
  language: string;
  path: string;
  tags: readonly string[];
}
```

**Examples**

```typescript
import { buildAstroContext } from "@fachada/core";

const site = await loadSiteFromFile("./application.yaml");

// Build context for rendering
const context = buildAstroContext({
  site,
  pageId: "home",
  language: "en",
});

// Use in Astro template
export const pageContext = context;

// Access flattened props
console.log(context.page.title); // Page title
console.log(context.content); // Flat widget/container array
console.log(context.skinTokens.light); // Light mode CSS tokens
console.log(context.translations); // Translation strings
console.log(context.metadata.tags); // Page tags for SEO
```

**Error Handling**

```typescript
try {
  const context = buildAstroContext({
    site,
    pageId: "nonexistent",
  });
} catch (err) {
  // Throws: "Page 'nonexistent' not found in site registry"
  console.error(err.message);
}
```

---

### createWidgetRenderer

Creates a singleton widget renderer for dynamic component resolution at render time.

**Signature**

```typescript
function createWidgetRenderer(): WidgetRenderer;

interface WidgetRenderer {
  registerWidget(type: string, component: AstroComponent | string): void;
  resolve(type: string): AstroComponent | null;
}
```

**Parameters**

- None (uses singleton pattern)

**Return Type**

- `WidgetRenderer`: Singleton renderer instance

**Built-in Widgets**

- `hero` — Hero section component
- `portfolio` — Portfolio showcase component
- `skills` — Skills display component
- `contact` — Contact form component
- `gallery` — Image gallery component

**Examples**

```typescript
import { createWidgetRenderer } from "@fachada/core";

// Get/create singleton renderer
const renderer = createWidgetRenderer();

// Resolve built-in widget
const heroComponent = renderer.resolve("hero");
console.log(heroComponent); // Component object or null

// Register custom widget
renderer.registerWidget("custom-widget", MyCustomComponent);

// Resolve custom widget
const customComponent = renderer.resolve("custom-widget");
if (customComponent) {
  // Render component
}

// Unregistered widget returns null with warning
const missing = renderer.resolve("does-not-exist");
// Logs: "[WidgetRenderer] No component registered for widget type: 'does-not-exist'"
console.log(missing); // null
```

---

### generateSkinCSS

Generates a complete `<style>` block with CSS custom properties for a skin.

**Signature**

```typescript
function generateSkinCSS(skin: Skin, mode: "light" | "dark"): string;
```

**Parameters**

- `skin` (Skin): The Skin domain object
- `mode` (string): Color mode: `"light"` or `"dark"`

**Return Type**

- `string`: HTML `<style>` block with CSS custom properties

**Examples**

```typescript
import { generateSkinCSS } from "@fachada/core";

const darkSkin = site.getSkin("dark");
const cssBlock = generateSkinCSS(darkSkin, "dark");

// Output:
// <style>:root { --accent: #00AAFF; --bg-primary: #1A1A1A; ... }</style>

// Use in Astro template
<Fragment set:html={cssBlock} />
```

**Error Handling**

```typescript
try {
  generateSkinCSS(skin, "invalid-mode");
} catch (err) {
  // Throws: 'Mode must be "light" or "dark". Received: "invalid-mode"'
  console.error(err.message);
}
```

---

### generateCSSModule

Generates both light and dark CSS modules for a skin in one call.

**Signature**

```typescript
function generateCSSModule(skin: Skin): { light: string; dark: string };
```

**Parameters**

- `skin` (Skin): The Skin domain object

**Return Type**

```typescript
{
  light: string; // <style> block for light mode
  dark: string; // <style> block for dark mode
}
```

**Examples**

```typescript
import { generateCSSModule } from "@fachada/core";

const skin = site.getSkin("dark");
const cssModule = generateCSSModule(skin);

// Inject both modes
<Fragment set:html={cssModule.light} />
<Fragment set:html={cssModule.dark} />
```

---

## 4. Configuration Types

### ApplicationConfig

Top-level application configuration (generated from YAML).

```typescript
interface ApplicationConfig {
  seo: {
    title: string;
    description?: string;
    keywords?: string[];
    author?: string;
    og_image?: string;
  };

  themes: {
    default: string; // Default theme key
    globals?: string[]; // Built-in themes to include
    custom?: Record<string, CustomThemeDefinition>;
  };

  pages: Record<string, PageConfig>;

  skins?: Record<string, SkinCreateConfig>;

  assets?: Record<string, string | Record<string, string>>;

  siteTree?: Record<string, unknown>;
}
```

### PageConfig

Page configuration (from YAML `pages` section).

```typescript
interface PageConfig {
  path: string; // URL path (must start with "/")
  title: string; // Page title (SEO)
  description: string; // Page description (SEO)
  language: string; // Language code (e.g., "en", "es")
  content: ContentItem[]; // Widgets and containers
  translations?: PageTranslations; // Per-language strings
  skinOverride?: string; // Optional skin ID override
  tags?: string[]; // Categorization tags
}

type ContentItem = WidgetConfig | ContainerConfig;
```

### WidgetConfig

Widget configuration (from YAML).

```typescript
interface WidgetConfig {
  type: string; // Registered widget type
  props?: Record<string, unknown>; // Widget-specific props
}
```

### ContainerConfig

Container configuration (from YAML).

```typescript
interface ContainerConfig {
  type: "container"; // Literal type to distinguish from widget
  layout: string; // Layout type (e.g., "grid", "flex")
  children: ContentItem[]; // Nested widgets/containers
  props?: Record<string, unknown>; // Layout configuration props
  skin?: string; // Optional skin override
}
```

### GalleryConfig

Top-level gallery configuration, set as `AppConfig.gallery`.
Colors, border-radius, shadow, and font come from the active skin via CSS
custom properties — no inline style overrides are needed.

```typescript
/** Easing/curve model for slide transitions. */
type GalleryTransition = "linear" | "exponential" | "none";

/**
 * Visual direction or effect applied to each slide change.
 * "fade"           — cross-fade (opacity only, default)
 * "ltr"            — next slide enters from the right
 * "rtl"            — next slide enters from the left
 * "top-to-bottom"  — next slide enters from the top
 * "bottom-to-top"  — next slide enters from the bottom
 * "zoom-in"        — active slide scales from 0.9 → 1
 * "zoom-out"       — active slide scales from 1.1 → 1
 */
type GalleryTransitionStyle =
  | "fade"
  | "ltr"
  | "rtl"
  | "top-to-bottom"
  | "bottom-to-top"
  | "zoom-in"
  | "zoom-out";

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryConfig {
  title?: string;
  description?: string;
  images: GalleryImage[];
  /**
   * Auto-scroll interval in ms. Enabled when set to a positive number.
   * Omit or set to 0 to disable auto-scroll.
   */
  autoScrollInterval?: number;
  /** Easing/curve type. Defaults to "linear". */
  transition?: GalleryTransition;
  /** Visual direction or effect. Defaults to "fade". */
  transitionStyle?: GalleryTransitionStyle;
  /**
   * Animation duration in ms. When omitted the carousel uses the skin's
   * `--transition` CSS custom property so the gallery inherits the site's
   * motion budget automatically.
   */
  transitionSpeed?: number;
}
```

**Helper functions** (importable from `@fachada/core`):

```typescript
import {
  resolveGalleryDefaults,
  GALLERY_TRANSITION_EASING,
  GALLERY_TRANSITION_STYLES,
} from "@fachada/core";

// Fill in defaults
const resolved = resolveGalleryDefaults(config);
// resolved.autoScrollEnabled — boolean
// resolved.transition        — GalleryTransition (never undefined)
// resolved.transitionStyle   — GalleryTransitionStyle (never undefined)

// CSS timing function for a transition value
GALLERY_TRANSITION_EASING["exponential"]; // → "ease-in-out"
GALLERY_TRANSITION_EASING["none"]; // → "step-start"

// CSS class name for a transition style value
GALLERY_TRANSITION_STYLES["ltr"]; // → "carousel--ltr"
```

---

## 5. CLI Reference

### create-fachada-app

Create a new Fachada application scaffold.

**Usage**

```bash
create-fachada-app <app-name> [options]
```

**Options**

- `--template <template>` — Scaffold template (e.g., `portfolio`, `blog`)
- `--config <path>` — Path to configuration file (default: `./application.yaml`)
- `--help` — Show help message

**Examples**

```bash
# Create new portfolio app
create-fachada-app my-portfolio

# Create with specific template
create-fachada-app my-portfolio --template portfolio

# Create with custom config path
create-fachada-app my-portfolio --config ./my-config.yaml
```

**Environment Variables**

- `FACHADA_CONFIG` — Default config file path (overridden by `--config` flag)

---

## 6. Troubleshooting

### Common API Usage Issues

**Issue: "Widget type 'X' is not registered"**

**Cause**: Widget type doesn't exist in the WidgetRegistry.

**Solution**: Ensure the widget is registered before creating the Widget domain object:

```typescript
registry.register("hero", schema);
```

**Issue: "Page content array cannot be empty"**

**Cause**: Page created with zero widgets/containers.

**Solution**: Add at least one content item:

```typescript
const page = Page.create({
  // ...
  content: [widget], // At least one item
});
```

**Issue: "Container children array cannot be empty"**

**Cause**: Container created with zero children.

**Solution**: Add at least one child:

```typescript
const container = Container.create({
  layout: "grid",
  children: [widget], // At least one item
});
```

**Issue: "Site validation error: default skin not found"**

**Cause**: `defaultSkinId` references a non-existent skin.

**Solution**: Ensure skin exists in skinRegistry before creating Site:

```typescript
const skins = new Map([["light", lightSkin]]);
const site = Site.create({
  // ...
  defaultSkinId: "light", // Must exist in skins map
  skinRegistry: skins,
});
```

**Issue: "Page 'X' not found in site registry"**

**Cause**: Attempting to render a non-existent page.

**Solution**: Verify page ID exists:

```typescript
const page = site.getPage("home");
if (page) {
  // Page exists, safe to render
}
```

**Issue: "No component registered for widget type: 'X'"**

**Cause**: Widget renderer doesn't have the component registered.

**Solution**: Register the widget component:

```typescript
const renderer = createWidgetRenderer();
renderer.registerWidget("custom", MyComponent);
```

**Issue: Immutability errors ("Cannot assign to read-only property")**

**Cause**: Attempting to mutate frozen domain objects.

**Solution**: Domain objects are immutable by design. Create new instances instead:

```typescript
// Wrong:
widget.parameters.title = "New Title";

// Right: Create a new widget with updated parameters
const updatedWidget = Widget.create({
  type: widget.type,
  parameters: { ...widget.parameters, title: "New Title" },
  registry,
});
```

---

## 7. Integration Examples

### Loading and Rendering a Page with Astro

```typescript
// pages/[slug].astro
import { loadSiteFromFile, buildAstroContext } from "@fachada/core";

const site = await loadSiteFromFile("./application.yaml");
const context = buildAstroContext({ site, pageId: Astro.params.slug });

const { page, content, skinTokens, metadata } = context;

// Use in template
export default function Page() {
  return (
    <article>
      <h1>{page.title}</h1>
      <p>{page.description}</p>
      {/* Render content items */}
    </article>
  );
}
```

### Custom Widget Registration

```typescript
import { createWidgetRenderer } from "@fachada/core";
import HeroComponent from "./components/HeroComponent.astro";

const renderer = createWidgetRenderer();
renderer.registerWidget("hero", HeroComponent);
renderer.registerWidget("custom-banner", CustomBannerComponent);

// Now widgets can be resolved
const hero = renderer.resolve("hero"); // CustomComponent
```

### Applying Skin Tokens

```typescript
import { generateCSSModule } from "@fachada/core";

const site = await loadSiteFromFile("./application.yaml");
const skin = site.getSkin(site.defaultSkinId);

if (skin) {
  const styles = generateCSSModule(skin);
  // Inject in <head>
}
```

---

## See Also

- [DOMAIN-MODEL.md](./DOMAIN-MODEL.md) — Detailed domain model explanation
