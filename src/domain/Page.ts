/**
 * Page domain aggregate
 *
 * Represents a single page with:
 * - Immutable metadata (id, path, title, description, language)
 * - Content array (Widget | Container union)
 * - Per-page translations (Record<language, strings>)
 * - Optional skin override
 * - Tag categorization
 */

import type { Widget } from "./Widget";
import type { Container } from "./Container";

/**
 * Type representing a page content item (Widget or Container)
 */
export type PageContent = Widget | Container;

/**
 * Translation map: language → key → value
 */
export type PageTranslations = Record<string, Record<string, string>>;

/**
 * Configuration for creating a Page
 */
export interface PageCreateConfig {
  id: string;
  path: string;
  title: string;
  description: string;
  language: string;
  content: PageContent[] | readonly PageContent[];
  translations?: PageTranslations;
  skinOverride?: string;
  tags?: string[];
}

/**
 * Page domain aggregate - represents a single page
 * Immutable after creation (frozen)
 * Contains content (Widgets and/or Containers), translations, and metadata
 */
export class Page {
  private readonly _id: string;
  private readonly _path: string;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _language: string;
  private readonly _content: readonly PageContent[];
  private readonly _translations?: PageTranslations;
  private readonly _skinOverride?: string;
  private readonly _tags: readonly string[];

  private constructor(
    id: string,
    path: string,
    title: string,
    description: string,
    language: string,
    content: readonly PageContent[],
    translations?: PageTranslations,
    skinOverride?: string,
    tags?: readonly string[],
  ) {
    this._id = id;
    this._path = path;
    this._title = title;
    this._description = description;
    this._language = language;
    this._content = Object.freeze([...content]);
    this._translations = translations ? deepFreeze(translations) : undefined;
    this._skinOverride = skinOverride;
    this._tags = Object.freeze([...(tags || [])]);
    Object.freeze(this);
  }

  /**
   * Factory method: Create a Page with validation
   */
  static create(config: PageCreateConfig): Page {
    const {
      id,
      path,
      title,
      description,
      language,
      content,
      translations,
      skinOverride,
      tags,
    } = config;

    // Validate content is provided and not empty
    if (
      !content ||
      !(Array.isArray(content) || Array.isArray(Array.from(content)))
    ) {
      throw new Error("Page content must be provided as an array");
    }

    const contentArray = Array.isArray(content) ? content : Array.from(content);

    if (contentArray.length === 0) {
      throw new Error("Page content array cannot be empty");
    }

    // Validate all content items are Widget or Container instances
    for (let i = 0; i < contentArray.length; i++) {
      const item = contentArray[i];
      if (!isPageContent(item)) {
        throw new Error(
          `Page content at index ${i} must be a Widget or Container instance, got ${typeof item}`,
        );
      }
    }

    // Validate path starts with "/"
    if (!path || typeof path !== "string" || !path.startsWith("/")) {
      throw new Error("Page path must start with forward slash (/)");
    }

    // Create and return immutable page
    return new Page(
      id,
      path,
      title,
      description,
      language,
      contentArray,
      translations,
      skinOverride,
      tags,
    );
  }

  /**
   * Get page ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get page path (routing)
   */
  get path(): string {
    return this._path;
  }

  /**
   * Get page title
   */
  get title(): string {
    return this._title;
  }

  /**
   * Get page description
   */
  get description(): string {
    return this._description;
  }

  /**
   * Get page language/locale code
   */
  get language(): string {
    return this._language;
  }

  /**
   * Get page content (frozen array of Widget | Container)
   */
  get content(): readonly PageContent[] {
    return this._content;
  }

  /**
   * Get page translations (Record<language, Record<key, value>>)
   */
  get translations(): PageTranslations | undefined {
    return this._translations;
  }

  /**
   * Get optional skin override for this page
   */
  get skinOverride(): string | undefined {
    return this._skinOverride;
  }

  /**
   * Get page tags (frozen array)
   */
  get tags(): readonly string[] {
    return this._tags;
  }

  /**
   * Query method: Get translation value for language and key
   * Returns undefined if language or key not found (graceful degradation)
   */
  getTranslation(language: string, key: string): string | undefined {
    if (!this._translations) {
      return undefined;
    }

    const languageStrings = this._translations[language];
    if (!languageStrings) {
      return undefined;
    }

    return languageStrings[key];
  }
}

/**
 * Type guard: Check if object is a Widget or Container instance
 * Uses duck typing to validate shape
 */
function isPageContent(item: unknown): item is PageContent {
  if (!item || typeof item !== "object") {
    return false;
  }

  const obj = item as Record<string, unknown>;

  // Widget: has type and parameters
  const isWidget = "type" in obj && "parameters" in obj;

  // Container: has layout and children
  const isContainer = "layout" in obj && "children" in obj;

  return isWidget || isContainer;
}

/**
 * Deep freeze object and all nested objects
 * Used to freeze translations structure
 */
function deepFreeze(
  obj: Record<string, Record<string, string>>,
): Record<string, Record<string, string>> {
  const frozen = Object.freeze({ ...obj });

  for (const key in frozen) {
    if (Object.hasOwnProperty.call(frozen, key)) {
      const value = (frozen as Record<string, Record<string, string>>)[key];
      if (value && typeof value === "object") {
        Object.freeze(value);
      }
    }
  }

  return frozen;
}
