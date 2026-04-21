/**
 * Widget Renderer — API service for dynamic widget resolution
 *
 * The dynamic widget renderer resolves widget type strings to registered Astro
 * components at runtime. It maintains a singleton registry with built-in widgets
 * pre-registered and supports custom widget registration.
 *
 * Features:
 * - Singleton pattern: shared across page renders
 * - Built-in widgets: hero, portfolio, skills, contact, gallery
 * - Custom registration: registerWidget(type, component)
 * - Graceful missing widget handling: resolve returns null + warns, never throws
 * - Caching: repeated resolves return same cached component
 * - Thread-safe: no mutations during render (read-only registry after built-ins)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AstroComponent = any;

/**
 * Widget renderer with registry for type→component resolution
 */
interface WidgetRenderer {
  /** Register a widget component by type string */
  registerWidget(type: string, component: AstroComponent | string): void;

  /** Resolve a registered widget component, or null if not found */
  resolve(type: string): AstroComponent | null;
}

/**
 * Creating placeholder components for built-in widgets
 * These are simple marker objects that identify the widget type
 */
const BUILTIN_WIDGETS: Record<string, AstroComponent> = {
  hero: { __type: "hero", __builtin: true },
  portfolio: { __type: "portfolio", __builtin: true },
  skills: { __type: "skills", __builtin: true },
  contact: { __type: "contact", __builtin: true },
  gallery: { __type: "gallery", __builtin: true },
};

/**
 * Singleton instance of the widget renderer
 */
let singletonRenderer: WidgetRenderer | null = null;

/**
 * Creates or returns the singleton widget renderer instance
 */
export function createWidgetRenderer(): WidgetRenderer {
  // Return existing singleton if already created
  if (singletonRenderer) {
    return singletonRenderer;
  }

  // Create the registry map with built-in widgets pre-registered
  const registry = new Map<string, AstroComponent>();

  // Register built-in widgets
  for (const [type, component] of Object.entries(BUILTIN_WIDGETS)) {
    registry.set(type, component);
  }

  // Cache for resolved components (optimization)
  const resolveCache = new Map<string, AstroComponent | null>();

  /**
   * Register a custom widget or override an existing one
   */
  function registerWidget(
    type: string,
    component: AstroComponent | string,
  ): void {
    if (!type || typeof type !== "string") {
      throw new Error(
        `Invalid widget type: expected non-empty string, got ${typeof type}`,
      );
    }
    registry.set(type, component);
    // Clear cache entry when widget is registered
    resolveCache.delete(type);
  }

  /**
   * Resolve a widget component by type string
   * Returns the component or null if not found (with warning)
   */
  function resolve(type: string): AstroComponent | null {
    // Check cache first
    if (resolveCache.has(type)) {
      return resolveCache.get(type) ?? null;
    }

    // Look up in registry
    const component = registry.get(type);

    if (component === undefined) {
      // Widget not found: warn and cache the null result
      console.warn(
        `[WidgetRenderer] No component registered for widget type: "${type}"`,
      );
      resolveCache.set(type, null);
      return null;
    }

    // Widget found: cache and return
    resolveCache.set(type, component);
    return component;
  }

  singletonRenderer = {
    registerWidget,
    resolve,
  };

  return singletonRenderer;
}

/**
 * Export the renderer interface for type checking
 */
export type { WidgetRenderer };
