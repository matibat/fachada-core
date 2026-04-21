/**
 * Site domain aggregate root
 *
 * Represents a complete site configuration with:
 * - Metadata (id, title, description)
 * - Pages registry (Map<id, Page>)
 * - Skins registry (Map<id, Skin>)
 * - Widget registry (shared)
 * - Default skin reference (must exist in skins registry)
 *
 * Site is immutable aggregate root (frozen after creation)
 * All nested registries are also immutable
 */

import type { Page } from "./Page";
import type { Skin } from "./Skin";
import type { WidgetRegistry } from "./WidgetRegistry";

/**
 * Configuration for creating a Site
 */
export interface SiteCreateConfig {
  id: string;
  title: string;
  description?: string;
  defaultSkinId: string;
  pageRegistry: Map<string, Page> | ReadonlyMap<string, Page>;
  skinRegistry: Map<string, Skin> | ReadonlyMap<string, Skin>;
  widgetRegistry: WidgetRegistry;
}

/**
 * Create a readonly wrapper around a Map that prevents all mutations
 */
function createFrozenMap<K, V>(map: Map<K, V>): ReadonlyMap<K, V> {
  const frozenMap = new Map(map);

  // Override mutating methods to throw errors
  (frozenMap as any).set = function () {
    throw new TypeError("Cannot modify a frozen Map");
  };
  (frozenMap as any).delete = function () {
    throw new TypeError("Cannot modify a frozen Map");
  };
  (frozenMap as any).clear = function () {
    throw new TypeError("Cannot modify a frozen Map");
  };

  // Freeze the map object itself
  Object.freeze(frozenMap);

  return frozenMap;
}

/**
 * Site domain aggregate root
 * Immutable after creation (frozen)
 * Composes Pages, Skins, and WidgetRegistry
 */
export class Site {
  private readonly _id: string;
  private readonly _title: string;
  private readonly _description?: string;
  private readonly _defaultSkinId: string;
  private readonly _pages: ReadonlyMap<string, Page>;
  private readonly _skins: ReadonlyMap<string, Skin>;
  private readonly _widgetRegistry: WidgetRegistry;

  private constructor(
    id: string,
    title: string,
    description: string | undefined,
    defaultSkinId: string,
    pages: ReadonlyMap<string, Page>,
    skins: ReadonlyMap<string, Skin>,
    widgetRegistry: WidgetRegistry,
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._defaultSkinId = defaultSkinId;
    this._pages = pages;
    this._skins = skins;
    this._widgetRegistry = widgetRegistry;
    Object.freeze(this);
  }

  /**
   * Factory method: Create a Site with validation
   *
   * Validates:
   * - id is provided
   * - title is provided
   * - defaultSkinId is provided
   * - defaultSkinId exists in skin registry
   * - all page IDs are unique (guaranteed by Map key constraint)
   * - all skin IDs are unique (guaranteed by Map key constraint)
   */
  static create(config: SiteCreateConfig): Site {
    const {
      id,
      title,
      description,
      defaultSkinId,
      pageRegistry,
      skinRegistry,
      widgetRegistry,
    } = config;

    // Validate required fields
    if (!id) {
      throw new Error("Site id is required");
    }

    if (!title) {
      throw new Error("Site title is required");
    }

    if (!defaultSkinId) {
      throw new Error("Site defaultSkinId is required");
    }

    // Validate defaultSkinId exists in registry
    if (!skinRegistry.has(defaultSkinId)) {
      throw new Error(
        `Site validation error: default skin "${defaultSkinId}" not found in skin registry. Available skins: ${Array.from(skinRegistry.keys()).join(", ")}`,
      );
    }

    // Create frozen maps that cannot be modified
    const pagesMap = createFrozenMap(new Map(pageRegistry));
    const skinsMap = createFrozenMap(new Map(skinRegistry));

    return new Site(
      id,
      title,
      description,
      defaultSkinId,
      pagesMap,
      skinsMap,
      widgetRegistry,
    );
  }

  // ==================== Properties ====================

  /**
   * Get site ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get site title
   */
  get title(): string {
    return this._title;
  }

  /**
   * Get site description (optional)
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * Get default skin ID
   */
  get defaultSkinId(): string {
    return this._defaultSkinId;
  }

  /**
   * Get pages registry
   * @internal
   */
  get pages(): ReadonlyMap<string, Page> {
    return this._pages;
  }

  /**
   * Get skins registry
   * @internal
   */
  get skins(): ReadonlyMap<string, Skin> {
    return this._skins;
  }

  /**
   * Get widget registry
   */
  get widgetRegistry(): WidgetRegistry {
    return this._widgetRegistry;
  }

  // ==================== Query Methods ====================

  /**
   * Get page by ID
   * @returns Page if found, undefined otherwise
   */
  getPage(id: string): Page | undefined {
    return this._pages.get(id);
  }

  /**
   * Get skin by ID
   * @returns Skin if found, undefined otherwise
   */
  getSkin(id: string): Skin | undefined {
    return this._skins.get(id);
  }

  /**
   * List all pages in site
   * @returns Array of all pages
   */
  listPages(): Page[] {
    return Array.from(this._pages.values());
  }

  /**
   * Get default skin
   * @returns Default Skin (guaranteed to exist by factory validation)
   * @throws Error if default skin not found (should never happen due to factory validation)
   */
  getDefaultSkin(): Skin {
    const skin = this._skins.get(this._defaultSkinId);
    if (!skin) {
      throw new Error(
        `Default skin "${this._defaultSkinId}" not found in registry. This should never happen.`,
      );
    }
    return skin;
  }
}
