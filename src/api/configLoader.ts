/**
 * Config Loader - Orchestrates YAML parsing and domain object construction
 *
 * Entry point for app initialization:
 * - Loads YAML (file or string)
 * - Validates against schema
 * - Builds domain objects bottom-up: Widgets → Containers → Pages → Skins → Site
 * - Returns immutable Site aggregate root ready for Astro integration
 */

import * as fs from "fs";
import * as path from "path";
import {
  parseApplicationYaml,
  type ApplicationConfig,
  type PageConfig,
  type WidgetConfig,
  type ContainerConfig,
  type ContentItem,
  ConfigValidationError,
} from "../config/parser";
import { Widget, type WidgetCreateConfig } from "../domain/Widget";
import {
  Container,
  type ContainerCreateConfig,
  type ContainerChild,
} from "../domain/Container";
import { Page, type PageCreateConfig, type PageContent } from "../domain/Page";
import { Skin, type SkinCreateConfig } from "../domain/Skin";
import { WidgetRegistry } from "../domain/WidgetRegistry";
import { Site, type SiteCreateConfig } from "../domain/Site";

// ─── Error Handling ──────────────────────────────────────────────────────

/**
 * Config loader error - extends ConfigValidationError with additional context
 */
export class ConfigLoaderError extends ConfigValidationError {
  constructor(
    filePath: string,
    lineNumber: number | null,
    message: string,
    public context?: string,
  ) {
    super(filePath, lineNumber, message);
    this.name = "ConfigLoaderError";
  }
}

// ─── Type Guards ─────────────────────────────────────────────────────────

/**
 * Check if content item is a widget (not a container)
 */
function isWidgetConfig(item: ContentItem): item is WidgetConfig {
  return (item as any).type !== "container";
}

/**
 * Check if content item is a container
 */
function isContainerConfig(item: ContentItem): item is ContainerConfig {
  return (item as any).type === "container";
}

// ─── Domain Object Builders ──────────────────────────────────────────────

/**
 * Build a Widget domain object from WidgetConfig
 * Validates widget type exists in registry
 */
function buildWidget(
  config: WidgetConfig,
  widgetRegistry: WidgetRegistry,
  filePath: string,
): Widget {
  try {
    // Validate widget type exists in registry
    if (!widgetRegistry.has(config.type)) {
      throw new Error(
        `Widget type "${config.type}" is not registered. Available types: ${widgetRegistry.getRegisteredTypes().join(", ")}`,
      );
    }

    const widget = Widget.create({
      type: config.type,
      parameters: config.props || {},
      registry: widgetRegistry,
    });

    return widget;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to build widget";
    throw new ConfigLoaderError(
      filePath,
      null,
      message,
      `widget type: ${config.type}`,
    );
  }
}

/**
 * Build a Container domain object from ContainerConfig (recursive)
 * Builds children first (bottom-up)
 */
function buildContainer(
  config: ContainerConfig,
  widgetRegistry: WidgetRegistry,
  filePath: string,
): Container {
  try {
    // Build children first (bottom-up)
    const children: ContainerChild[] = [];

    if (config.children && config.children.length > 0) {
      for (const childConfig of config.children) {
        const child = buildPageContent(childConfig, widgetRegistry, filePath);
        children.push(child);
      }
    }

    // Create container
    const container = Container.create({
      layout: config.layout || "default",
      children,
      props: config.props,
      skin: config.skin,
    });

    return container;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to build container";
    throw new ConfigLoaderError(
      filePath,
      null,
      message,
      `container layout: ${config.layout || "default"}`,
    );
  }
}

/**
 * Build a page content item (Widget or Container)
 * Routes to appropriate builder based on type
 */
function buildPageContent(
  item: ContentItem,
  widgetRegistry: WidgetRegistry,
  filePath: string,
): PageContent {
  if (isWidgetConfig(item)) {
    return buildWidget(item, widgetRegistry, filePath);
  } else if (isContainerConfig(item)) {
    return buildContainer(item, widgetRegistry, filePath);
  } else {
    throw new ConfigLoaderError(
      filePath,
      null,
      "Invalid content item: must be widget or container",
    );
  }
}

/**
 * Build Page domain objects from PageConfig
 * Constructs all page content (widgets/containers) bottom-up
 */
function buildPages(
  appConfig: ApplicationConfig,
  widgetRegistry: WidgetRegistry,
  filePath: string,
): Map<string, Page> {
  const pages = new Map<string, Page>();
  const pageIds = new Set<string>();

  for (const [pageId, pageConfig] of Object.entries(appConfig.pages)) {
    // Validate unique page IDs
    if (pageIds.has(pageId)) {
      throw new ConfigLoaderError(
        filePath,
        null,
        `Duplicate page ID: "${pageId}"`,
      );
    }
    pageIds.add(pageId);

    try {
      // Build page content (widgets and containers)
      const content: PageContent[] = [];

      if (pageConfig.content && pageConfig.content.length > 0) {
        for (const contentItem of pageConfig.content) {
          const builtItem = buildPageContent(
            contentItem,
            widgetRegistry,
            filePath,
          );
          content.push(builtItem);
        }
      }

      // Create page
      const page = Page.create({
        id: pageId,
        path: `/${pageId}`,
        title: pageConfig.title || pageId,
        description: pageConfig.description || "",
        language: "en",
        content,
        translations: pageConfig.translations,
        skinOverride: pageConfig.skin
          ? typeof pageConfig.skin === "string"
            ? pageConfig.skin
            : undefined
          : undefined,
        tags: pageConfig.tags,
      });

      pages.set(pageId, page);
    } catch (err) {
      if (err instanceof ConfigLoaderError) {
        throw err;
      }
      const message =
        err instanceof Error ? err.message : "Failed to build page";
      throw new ConfigLoaderError(filePath, null, message, `page: ${pageId}`);
    }
  }

  return pages;
}

/**
 * Build Skin domain objects from ApplicationConfig.skins
 * Returns a Map of Skin instances and the default skin ID
 */
function buildSkins(
  appConfig: ApplicationConfig,
  filePath: string,
): { skins: Map<string, Skin>; defaultSkinId: string } {
  const skins = new Map<string, Skin>();
  const skinIds = new Set<string>();

  // Process skins if defined
  if (appConfig.skins) {
    for (const [skinId, skinConfig] of Object.entries(appConfig.skins)) {
      // Validate unique skin IDs
      if (skinIds.has(skinId)) {
        throw new ConfigLoaderError(
          filePath,
          null,
          `Duplicate skin ID: "${skinId}"`,
        );
      }
      skinIds.add(skinId);

      try {
        // Handle legacy format where skin is just token object
        if (
          !("name" in skinConfig) ||
          !("description" in skinConfig) ||
          !("scope" in skinConfig)
        ) {
          // Create default skin with token data
          const skin = Skin.create({
            id: skinId,
            name: skinId,
            description: `${skinId} skin`,
            scope: "site",
            light: skinConfig as Record<string, unknown>,
            dark: skinConfig as Record<string, unknown>,
          });
          skins.set(skinId, skin);
        } else {
          // Create skin with full config
          const skin = Skin.create({
            id: skinId,
            name: (skinConfig as any).name,
            description: (skinConfig as any).description,
            scope: (skinConfig as any).scope || "site",
            light: (skinConfig as any).light || {},
            dark: (skinConfig as any).dark || {},
            extends: (skinConfig as any).extends,
          });
          skins.set(skinId, skin);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to build skin";
        throw new ConfigLoaderError(filePath, null, message, `skin: ${skinId}`);
      }
    }
  }

  // Get default skin ID from themes config
  const defaultSkinId = appConfig.themes.default;

  // Validate default skin exists
  if (!skins.has(defaultSkinId)) {
    const availableSkins = Array.from(skinIds);
    throw new ConfigLoaderError(
      filePath,
      null,
      `Default skin "${defaultSkinId}" not found in skin registry. Available skins: ${availableSkins.join(", ")}`,
    );
  }

  return { skins, defaultSkinId };
}

/**
 * Load and parse YAML from file path
 * Returns ApplicationConfig with all validation
 */
function loadYamlFromFile(filePath: string): ApplicationConfig {
  try {
    return parseApplicationYaml(filePath);
  } catch (err) {
    if (err instanceof ConfigValidationError) {
      throw new ConfigLoaderError(err.filePath, err.lineNumber, err.message);
    }
    throw err;
  }
}

/**
 * Parse YAML from string content
 * Returns ApplicationConfig with validation
 */
function parseYamlString(content: string, filePath: string): ApplicationConfig {
  // Write to temp file for parsing (to get line numbers)
  // For now, we'll enhance the parser to accept string content
  // For now, use parseApplicationYaml with a pseudo-file approach

  // Note: The current parser only accepts file paths.
  // We need to modify or extend it. For now, we'll validate locally.
  try {
    const YAML = require("yaml");
    const parsed = YAML.parse(content);

    // Basic validation that it looks like ApplicationConfig
    if (!parsed.seo || !parsed.themes || !parsed.pages) {
      throw new Error("Missing required sections: seo, themes, pages");
    }

    return parsed as ApplicationConfig;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse YAML";
    throw new ConfigLoaderError(filePath, null, message);
  }
}

// ─── Main Entry Points ────────────────────────────────────────────────────

/**
 * Load Site from YAML file path
 *
 * @param filePath - absolute path to application.yaml
 * @returns Fully constructed Site aggregate root (immutable)
 * @throws ConfigLoaderError with file path, line number, and context
 */
export function loadSiteFromFile(filePath: string): Site {
  // 1. Load and parse YAML
  const appConfig = loadYamlFromFile(filePath);

  // 2. Create registries
  const widgetRegistry = new WidgetRegistry();
  const { skins: skinMap, defaultSkinId } = buildSkins(appConfig, filePath);

  // 3. Build pages (which builds widgets and containers bottom-up)
  const pageRegistry = buildPages(appConfig, widgetRegistry, filePath);

  // 4. Validate pages exist
  if (pageRegistry.size === 0) {
    throw new ConfigLoaderError(
      filePath,
      null,
      "No pages defined in configuration",
    );
  }

  // 5. Create Site aggregate
  const site = Site.create({
    id: "default",
    title: appConfig.seo.title,
    description: appConfig.seo.description,
    defaultSkinId,
    pageRegistry,
    skinRegistry: skinMap,
    widgetRegistry,
  });

  return site;
}

/**
 * Load Site from YAML string content
 *
 * @param yamlContent - YAML configuration as string
 * @param filePath - optional file path for error reporting (used in error messages)
 * @returns Fully constructed Site aggregate root (immutable)
 * @throws ConfigLoaderError with file path and context
 */
export function loadSiteFromString(
  yamlContent: string,
  filePath: string = "application.yaml",
): Site {
  // 1. Parse YAML from string
  const appConfig = parseYamlString(yamlContent, filePath);

  // 2. Create registries
  const widgetRegistry = new WidgetRegistry();
  const { skins: skinMap, defaultSkinId } = buildSkins(appConfig, filePath);

  // 3. Build pages (which builds widgets and containers bottom-up)
  const pageRegistry = buildPages(appConfig, widgetRegistry, filePath);

  // 4. Validate pages exist
  if (pageRegistry.size === 0) {
    throw new ConfigLoaderError(
      filePath,
      null,
      "No pages defined in configuration",
    );
  }

  // 5. Create Site aggregate
  const site = Site.create({
    id: "default",
    title: appConfig.seo.title,
    description: appConfig.seo.description,
    defaultSkinId,
    pageRegistry,
    skinRegistry: skinMap,
    widgetRegistry,
  });

  return site;
}

/**
 * Export types for external use
 */
