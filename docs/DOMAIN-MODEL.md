# Fachada Core Domain Model Guide v2.0

Comprehensive explanation of domain-driven design concepts, class hierarchy, and architectural decisions in AppDefinition.

---

## 1. DDD Concepts in Fachada

### Aggregate Root: Site

**What is an Aggregate Root?**

In Domain-Driven Design, an Aggregate Root is the primary gateway for accessing related domain objects. No external object should hold a direct reference to internal aggregate members. Instead, access must flow through the root.

**Site as Aggregate Root**

`Site` is our aggregate root representing the entire website configuration:

```
┌─── AGGREGATE ROOT ───────────────────────────────┐
│ Site                                             │
│  ├─ Pages (Map<id, Page>)     [access only via]│
│  │  └─ See below: Page aggregate               │
│  ├─ Skins (Map<id, Skin>)     [access only via]│
│  │  └─ Value Objects                           │
│  ├─ WidgetRegistry            [shared reference]│
│  └─ Metadata (id, title)      [immutable]      │
└──────────────────────────────────────────────────┘
```

**Key Property**: You never access a Page directly from outside. Instead:

```typescript
// ✓ Correct: Access through aggregate root
const page = site.getPage("home");

// ✗ Wrong: Never hold direct Map reference
const pagesMap = site.pages; // Not allowed (frozen)
pagesMap.set("new-page", ...); // TypeError: Cannot modify frozen Map
```

### Value Objects

**What is a Value Object?**

Value Objects have no identity — they are known only by their attributes. Two Skins with identical tokens are considered equal. Value Objects are immutable and immutably represent business concepts.

**Value Objects in Fachada**

- **Widget** — No identity, only type + parameters
- **Skin** — No identity, only tokens + scope
- **Container** — No identity, only layout + children
- **WidgetRegistry** — No identity, only type → schema mappings

**Immutability Example**

```typescript
const widget1 = Widget.create({
  type: "hero",
  parameters: { title: "Welcome" },
  registry,
});

const widget2 = Widget.create({
  type: "hero",
  parameters: { title: "Welcome" },
  registry,
});

// widget1 === widget2? No (different instances)
// But they represent the SAME value (same type + parameters)
// Both are immutable:
widget1.parameters.title = "Changed"; // TypeError: Cannot assign
```

### Entities

**What is an Entity?**

An Entity has a unique identity and a lifecycle. Two Entities are equal if their IDs match, even if other attributes differ.

**Entities in Fachada**

- **Page** — Has unique ID (`id` property). Two pages are different if IDs differ.

```typescript
const page1 = Page.create({
  id: "home",
  path: "/",
  title: "Home",
  // ...
});

const page2 = Page.create({
  id: "home",
  path: "/index.html", // Different path
  title: "Welcome",
  // ...
});

// page1 and page2 have the SAME identity (id="home")
// But they are different objects (different instances)
// Both are immutable:
page1.path = "/new-path"; // TypeError: Cannot assign
```

---

## 2. Class Hierarchy & Composition

### Class Diagram

```
                    ┌─────────────────┐
                    │   Site (Root)   │ [Aggregate Root]
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌──────▼──────┐    ┌────▼────┐
    │  Pages    │     │  Skins      │    │ Widget  │
    │ Map<id,   │     │ Map<id,     │    │Registry │
    │  Page>    │     │  Skin>      │    └─────────┘
    └─────┬─────┘     └──────┬──────┘
          │                  │
    ┌─────▼──────────┐ ┌─────▼───────────┐
    │ Page (Entity)  │ │ Skin (Value Obj)│
    └─────┬──────────┘ └─────────────────┘
          │
    ┌─────▼────────────────────┐
    │ Content: PageContent[]   │
    │    (Widget | Container)  │
    └────┬──────────┬──────────┘
         │          │
    ┌────▼────┐ ┌───▼──────────────┐
    │ Widget  │ │ Container        │
    │(Value   │ ├────┬─────────────┤
    │ Obj)    │ │    │ Children[]  │
    └─────────┘ │    │(Widget |    │
                │    │Container)   │
                └────┴─────────────┘
                 [Recursive: Containers
                  can hold Containers]
```

### Composition Relationships

**Site composes Pages and Skins**

```typescript
// Site owns Pages through pageRegistry
// Site owns Skins through skinRegistry
// Access guaranteed immutable
site.pages.get("home")?.title; // Safe: frozen Map, frozen Page
site.skins.get("light")?.name; // Safe: frozen Map, frozen Skin
```

**Page composes Widgets and Containers**

```typescript
// Page owns content items (Widgets and Containers)
// Content is ordered and immutable
for (const item of page.content) {
  if (item instanceof Widget) {
    console.log(item.type);
  } else if (item instanceof Container) {
    console.log(item.layout);
    // Containers recursively hold more Widgets or Containers
    for (const child of item.children) {
      // Process child (Widget or Container)
    }
  }
}
```

**Container allows unlimited nesting**

```typescript
// Container can hold Widgets or other Containers
const leaf = Widget.create({ type: "hero", parameters: {}, registry });
const container1 = Container.create({
  layout: "grid",
  children: [leaf], // Widget
});
const container2 = Container.create({
  layout: "flex",
  children: [container1], // Container (nested)
});
const container3 = Container.create({
  layout: "column",
  children: [container2], // Container (deeply nested)
});
```

---

## 3. Immutability: Design & Implementation

### Why Immutability?

**Threading Safety**: No locks needed — domain objects can be safely shared across async operations without state mutation.

**Predictability**: Once created, objects can never change. Rendering logic doesn't fear side effects.

**Audit Trail**: Changes create new objects, enabling full state history and debugging.

### Immutability Patterns Used

#### 1. Object.freeze()

All domain objects are frozen after construction:

```typescript
// In Widget.create():
return new Widget(type, parameters);
// Constructor does:
Object.freeze(this); // new Widget is frozen

// Later:
widget.type = "new-type"; // TypeError: Cannot assign to read-only property
```

#### 2. ReadonlyMap for Collections

Maps inside Site are wrapped as ReadonlyMap and frozen:

```typescript
// In Site.create():
const frozenMap = new Map(pageRegistry);
(frozenMap as any).set = function () {
  throw new TypeError("Cannot modify a frozen Map");
};
Object.freeze(frozenMap);
site._pages = frozenMap; // ReadonlyMap (cannot be mutated)

// Later:
site.pages.set("new", page); // TypeError: Cannot modify a frozen Map
site.pages.get("home")?.title = "New"; // TypeError (Page is frozen too)
```

#### 3. Getter-only Properties

```typescript
class Widget {
  get type(): string {
    return this._type;
  } // No setter
  get parameters(): Record<string, unknown> {
    return this._parameters;
  }
}

// Later:
widget.type = "hero"; // TypeError: Cannot set property type
```

#### 4. Deep Freeze for Nested Objects

```typescript
// In Page.create():
this._translations = translations ? deepFreeze(translations) : undefined;

// deepFreeze recursively freezes nested objects:
function deepFreeze(obj: any): any {
  Object.freeze(obj);
  Object.values(obj).forEach((val) => {
    if (typeof val === "object" && val !== null) {
      deepFreeze(val);
    }
  });
  return obj;
}

// Result:
page.translations!.en.greeting = "New Greeting"; // TypeError (deeply frozen)
```

#### 5. Readonly Arrays

```typescript
// In Container.create():
this._children = Object.freeze([...children]); // Readonly array
// In Page.create():
this._content = Object.freeze([...content]); // Readonly array

// Later:
container.children.push(widget); // TypeError: Property push does not exist
page.content[0] = newWidget; // TypeError: Cannot assign to read-only
```

### Anti-patterns (Avoided)

```typescript
// ✗ DON'T: Mutable parameters
export interface WidgetCreateConfig {
  parameters: Record<string, unknown>; // This object could be mutated externally
}

// ✓ DO: Freeze parameters after use
const widget = Widget.create({
  type: "hero",
  parameters: { title: "Welcome" },
  registry,
});
// parameters is frozen immediately in constructor
widget.parameters.title = "Changed"; // TypeError ✓

// ✗ DON'T: Return mutable collections
get pages(): Map<string, Page> { return this._pages; } // External caller could mutate

// ✓ DO: Return readonly collections
get pages(): ReadonlyMap<string, Page> { return this._pages; } // Type system enforces immutability
```

---

## 4. CASCADE Hierarchy: Skin Resolution

### The Problem

A widget needs to know its color scheme, but it shouldn't know whether it's using:

- The site-default skin (most common)
- A page-override skin
- A widget-specific skin override

### The Solution: CASCADE Hierarchy

Skins resolve through a cascade priority (highest → lowest):

```
┌─────────────────────────────────────────────┐
│1. Widget-level Override                      │
│   (Defined on individual widget)             │
└─────────────────────────────────────────────┘
                    ↓ (if not defined)
┌─────────────────────────────────────────────┐
│2. Page-level Override                        │
│   (Defined on page scope: skinOverride)      │
└─────────────────────────────────────────────┘
                    ↓ (if not defined)
┌─────────────────────────────────────────────┐
│3. Site Default (Fallback)                    │
│   (Always defined: defaultSkinId)            │
└─────────────────────────────────────────────┘
```

### Example

```typescript
// Define skins at different scopes
const lightSkin = Skin.create({
  scope: "site", // Site-level (default)
  id: "light",
  name: "Light",
  // ...
});

const pageDarkSkin = Skin.create({
  scope: "page", // Page-level override
  id: "page-dark",
  name: "Page Dark",
  // ...
});

const heroAccentSkin = Skin.create({
  scope: "widget", // Widget-level override
  id: "hero-accent",
  name: "Hero Accent",
  // ...
});

// Create page with skin override
const page = Page.create({
  skinOverride: "page-dark", // Overrides site default
  // ...
});

// Create widget with skin override
const widget = Widget.create({
  type: "hero",
  parameters: {},
  registry,
  skin: "hero-accent", // Overrides page override
});

// CASCADE Resolution:
// 1. Check widget.skin → "hero-accent" ✓ USE THIS
// 2. (If widget.skin undefined) Check page.skinOverride → "page-dark"
// 3. (If both undefined) Use site.defaultSkinId → "light"
```

### Implementation

The cascade is resolved during `buildAstroContext`:

```typescript
function resolveSkinTokens(site: Site, page: Page): AstroSkinTokensProps {
  // Cascade: Page > Site Default
  const effectiveSkinId = page.skinOverride ?? site.defaultSkinId;
  const skin = site.getSkin(effectiveSkinId);

  if (!skin) {
    throw new Error(`Skin "${effectiveSkinId}" not found`);
  }

  return {
    light: skin.getTokens("light"),
    dark: skin.getTokens("dark"),
  };
}

// Widgets can access their own overrides through rendered props:
// <WidgetRenderer type={widget.type} skin={widget.skin} />
```

---

## 5. Error Handling Strategy

### Error Types

#### 1. Construction Errors (Validation at Creation)

```typescript
// Widget
throw new Error(`Widget type "${type}" is not registered`);
throw new Error(`Widget "${type}" requires parameter "${param}"`);

// Container
throw new Error("Container layout must be provided");
throw new Error("Container children array cannot be empty");
throw new Error("Container child at index X must be Widget or Container");

// Page
throw new Error("Page path must start with forward slash (/)");
throw new Error("Page content array cannot be empty");

// Skin
throw new Error("Skin id is required");
throw new Error("Skin scope must be one of: site, page, widget");

// Site
throw new Error("Site id is required");
throw new Error("Site validation error: default skin not found");
```

#### 2. Configuration Errors (Loading YAML)

```typescript
// ConfigLoaderError
class ConfigLoaderError extends ConfigValidationError {
  constructor(
    public filePath: string,
    public lineNumber: number | null,
    public message: string,
    public context?: string,
  ) {}
}

// Thrown when:
throw new ConfigLoaderError(
  "application.yaml",
  42,
  "Invalid widget type",
  "widget type: unknown",
);
```

#### 3. Runtime Errors (Astro Context Building)

```typescript
// Page lookup error
throw new Error(`Page "${pageId}" not found in site registry`);

// Skin resolution error
throw new Error(`Skin "${skinId}" not found in site registry`);

// Mode validation error
throw new Error(`Mode must be "light" or "dark". Received: "${mode}"`);
```

### Handling Strategy

**Pattern 1: Fail-Fast Validation**

```typescript
// Validate early during construction
static create(config: WidgetCreateConfig): Widget {
  // Immediate validation before any object creation
  if (!widgetRegistry.has(config.type)) {
    throw new Error(
      `Widget type "${config.type}" is not registered`
    );
  }

  // ... then construct
  return new Widget(config.type, config.parameters);
}
```

**Pattern 2: Propagate Context**

```typescript
// When catching errors, add context
try {
  const widget = Widget.create(config);
} catch (err) {
  throw new ConfigLoaderError(
    filePath,
    null,
    (err as Error).message,
    `widget type: ${config.type}`, // Context helps debugging
  );
}
```

**Pattern 3: Graceful Degradation (Widgets)**

```typescript
// Widget renderer doesn't throw — it returns null
const component = renderer.resolve("unknown");
if (component === null) {
  console.warn(`[WidgetRenderer] No component for type: "unknown"`);
  // Render fallback or skip
}
```

---

## 6. Design Decisions & Rationale

### Decision 1: Immutability for All Domain Objects

**Why**: Domain objects represent business rules that must not change unexpectedly during rendering. Immutability eliminates entire classes of bugs related to shared mutable state.

**Trade-off**: Updates require creating new objects (more memory initially). Mitigated by structural sharing of child objects.

---

### Decision 2: Value Objects (Widget, Container, Skin)

**Why**: Widgets and containers are fundamentally interchangeable if their properties match. Treating them as Value Objects (not Entities) simplifies equality and composition logic.

**Trade-off**: Cannot track "the same widget object changed". Acceptable because Fachada is configuration-driven (objects don't mutate at runtime).

---

### Decision 3: Site as Single Aggregate Root

**Why**: Ensures transaction boundaries — you load/render an entire Site consistently. No partial loading or missing relationships.

**Trade-off**: Large sites have larger in-memory footprint. Accepted for typical portfolio/blog use cases (< 100 pages).

---

### Decision 4: CASCADE Hierarchy for Skins

**Why**: Skins should be reusable at multiple scope levels without duplication. Cascade provides sensible defaults while allowing fine-grained overrides.

**Example**: Define a "dark" skin site-wide, override for special pages, override specific widgets without redefining tokens.

---

### Decision 5: Bottom-Up Construction (Widgets → Container → Page → Site)

**Why**: Ensures validation happens at each level. A Widget is validated before being placed in a Container. A Container is validated before being placed in a Page.

**Benefit**: Errors are caught early with context (which widget? which container?).

---

### Decision 6: Schema-Based Widget Parameter Validation

**Why**: Widgets are registered with JSON schemas. Parameters are validated against schemas at Widget construction.

**Benefit**: Typos in widget parameters are caught at load time, not render time.

```typescript
// Registry defines schema
registry.register("hero", {
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
  },
  required: ["title"],
});

// Parameter validation
Widget.create({
  type: "hero",
  parameters: { subtitle: "..." }, // Missing required "title"
  registry,
});
// Throws: 'Widget "hero" requires parameter "title"'
```

---

### Decision 7: Frozen Maps for Site Collections

**Why**: Ensures pages/skins cannot be added/removed at runtime. Enforces that Site structure is immutable after load.

**Benefit**: Rendering code can rely on page set never changing mid-render.

```typescript
const site = Site.create({
  /* ... */
});
site.pages.set("new-page", page); // TypeError: Cannot modify frozen Map
```

---

## 7. Contributing: Adding New Domain Classes

### When to Create a New Domain Class

Add a new class when:

1. It represents a distinct business concept
2. It has its own lifecycle or identity
3. It should be reusable/composable

### Steps to Add a New Class

#### Example: Adding a "MetaTag" Value Object

**Step 1: Define the type interface**

```typescript
export interface MetaTagCreateConfig {
  name: string; // meta tag name attribute
  content: string; // meta tag content attribute
}
```

**Step 2: Create the domain class**

```typescript
/**
 * MetaTag domain value object
 * Represents an HTML meta tag (immutable)
 */
export class MetaTag {
  private readonly _name: string;
  private readonly _content: string;

  private constructor(name: string, content: string) {
    this._name = name;
    this._content = content;
    Object.freeze(this); // Freeze for immutability
  }

  /**
   * Factory method with validation
   */
  static create(config: MetaTagCreateConfig): MetaTag {
    const { name, content } = config;

    // Validate
    if (!name || typeof name !== "string") {
      throw new Error("MetaTag name must be a non-empty string");
    }
    if (!content || typeof content !== "string") {
      throw new Error("MetaTag content must be a non-empty string");
    }

    return new MetaTag(name, content);
  }

  // Getters only (no setters)
  get name(): string {
    return this._name;
  }

  get content(): string {
    return this._content;
  }
}
```

**Step 3: Export from index.ts**

```typescript
// src/domain/index.ts
export { MetaTag, type MetaTagCreateConfig } from "./MetaTag";
```

**Step 4: Add to main export (src/index.ts)**

```typescript
export { MetaTag, type MetaTagCreateConfig } from "./domain/MetaTag";
```

**Step 5: Add tests**

```typescript
// src/domain/__tests__/MetaTag.test.ts
describe("MetaTag", () => {
  it("creates immutable meta tag", () => {
    const tag = MetaTag.create({
      name: "description",
      content: "My site",
    });

    expect(tag.name).toBe("description");

    // Immutability
    expect(() => {
      tag.name = "new-name";
    }).toThrow();
  });

  it("throws on invalid input", () => {
    expect(() => {
      MetaTag.create({ name: "", content: "..." });
    }).toThrow("MetaTag name must be a non-empty string");
  });
});
```

**Step 6: Integrate into parent aggregate**

```typescript
// In Page domain:
export interface PageCreateConfig {
  // ... existing fields
  metaTags?: MetaTag[];
}

export class Page {
  private readonly _metaTags: readonly MetaTag[];

  static create(config: PageCreateConfig): Page {
    // Validation
    for (const tag of config.metaTags || []) {
      if (!(tag instanceof MetaTag)) {
        throw new Error("Page metaTags must contain MetaTag instances");
      }
    }

    // Create
    return new Page(
      // ...
      Object.freeze([...(config.metaTags || [])]), // Freeze array
    );
  }

  get metaTags(): readonly MetaTag[] {
    return this._metaTags;
  }
}
```

### Checklist for New Classes

- [ ] Type interface defined (WidgetCreateConfig-style)
- [ ] Class with readonly private fields
- [ ] `Object.freeze(this)` in constructor
- [ ] Static `create()` factory method with validation
- [ ] Getter-only properties (no setters)
- [ ] Comprehensive error messages
- [ ] Unit tests covering happy path + error cases
- [ ] Exported from domain/index.ts
- [ ] Exported from src/index.ts
- [ ] Documentation in API-REFERENCE.md

---

## See Also

- [API-REFERENCE.md](./API-REFERENCE.md) — Complete API documentation
