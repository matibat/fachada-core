/**
 * Astro Context Builder
 *
 * Flattens immutable domain objects (Site, Page, Widget, Container)
 * into template-friendly props structure for Astro components.
 *
 * Handles:
 * - Page data flattening
 * - Content structure flattening (widgets + containers)
 * - Skin token resolution with cascade hierarchy (Site > Page override)
 * - Translation resolution
 * - Deterministic and immutable operations (no mutations)
 */

import type { Site } from "../domain/Site";
import type { Widget } from "../domain/Widget";
import type { Container } from "../domain/Container";
import type { PageContent } from "../domain/Page";
import type {
  AstroContextProps,
  AstroPageProps,
  AstroPageContentProps,
  AstroWidgetProps,
  AstroContainerProps,
  AstroSkinTokensProps,
  AstroTranslationsProps,
  AstroMetadataProps,
} from "./types";

/**
 * Build flattened Astro context from Site and Page
 *
 * @param params - Configuration with site, pageId, and optional language
 * @returns Flattened AstroContextProps ready for Astro template spreading
 * @throws Error if page not found or invalid parameters
 */
export function buildAstroContext(params: {
  site: Site;
  pageId: string;
  language?: string;
}): AstroContextProps {
  const { site, pageId, language } = params;

  // Get page from site (throws if not found)
  const page = site.getPage(pageId);
  if (!page) {
    throw new Error(`Page "${pageId}" not found in site registry`);
  }

  // Determine effective language (page language or parameter or "en" default)
  const effectiveLanguage = language || page.language || "en";

  // Build flattened page props
  const pageProps = buildPageProps(page, effectiveLanguage);

  // Build flattened content (widgets and containers)
  const content = flattenPageContent(page.content);

  // Build skin tokens (cascade: Site default > Page override)
  const skinTokens = resolveSkinTokens(site, page);

  // Build translations map
  const translations = buildTranslationsMap(page);

  // Build metadata
  const metadata: AstroMetadataProps = {
    title: page.title,
    description: page.description,
    path: page.path,
    language: effectiveLanguage,
    tags: page.tags,
  };

  return {
    page: pageProps,
    content,
    skinTokens,
    translations,
    metadata,
  };
}

/**
 * Build flattened page props
 */
function buildPageProps(page: any, language: string): AstroPageProps {
  return {
    id: page.id,
    title: page.title,
    description: page.description,
    path: page.path,
    language: language,
    tags: page.tags || [],
  };
}

/**
 * Check if an object is a Widget
 */
function isWidget(item: any): item is Widget {
  return (
    item &&
    typeof item === "object" &&
    "type" in item &&
    "parameters" in item &&
    typeof item.type === "string"
  );
}

/**
 * Check if an object is a Container
 */
function isContainer(item: any): item is Container {
  return (
    item &&
    typeof item === "object" &&
    "layout" in item &&
    "children" in item &&
    typeof item.layout === "string" &&
    Array.isArray(item.children)
  );
}

/**
 * Flatten page content (widgets and nested containers) into render order
 */
function flattenPageContent(
  content: readonly PageContent[],
): AstroPageContentProps[] {
  return content.map((item) => {
    if (isWidget(item)) {
      return flattenWidget(item);
    } else if (isContainer(item)) {
      return flattenContainer(item);
    } else {
      // Fallback for unknown types
      throw new Error(`Unknown page content type: ${typeof item}`);
    }
  });
}

/**
 * Flatten a Widget to AstroWidgetProps
 */
function flattenWidget(widget: Widget): AstroWidgetProps {
  return {
    type: widget.type,
    parameters: widget.parameters,
  };
}

/**
 * Flatten a Container to AstroContainerProps (recursive for nested children)
 */
function flattenContainer(container: Container): AstroContainerProps {
  const flattenedChildren = container.children.map((child) => {
    if (isWidget(child)) {
      return flattenWidget(child);
    } else if (isContainer(child)) {
      return flattenContainer(child);
    } else {
      throw new Error(`Unknown container child type: ${typeof child}`);
    }
  });

  const result: AstroContainerProps = {
    layout: container.layout,
    children: flattenedChildren,
  };

  // Include props if present
  if (container.props && Object.keys(container.props).length > 0) {
    result.props = container.props;
  }

  return result;
}

/**
 * Resolve skin tokens with cascade: Site default > Page override
 */
function resolveSkinTokens(site: Site, page: any): AstroSkinTokensProps {
  // Determine which skin to use
  const skinId = page.skinOverride || site.defaultSkinId;
  const skin = site.getSkin(skinId);

  if (!skin) {
    // Fallback to default site skin if resolved skin not found
    const defaultSkin = site.getDefaultSkin();
    return {
      light: defaultSkin.getTokens("light"),
      dark: defaultSkin.getTokens("dark"),
    };
  }

  return {
    light: skin.getTokens("light"),
    dark: skin.getTokens("dark"),
  };
}

/**
 * Build translations map from page translations
 * Returns all available languages in the page
 */
function buildTranslationsMap(
  page: any,
): Record<string, AstroTranslationsProps> {
  if (!page.translations || typeof page.translations !== "object") {
    return {};
  }

  const result: Record<string, AstroTranslationsProps> = {};

  // Iterate over all language keys in translations
  for (const language in page.translations) {
    if (page.translations.hasOwnProperty(language)) {
      const languageTranslations = page.translations[language];
      if (languageTranslations && typeof languageTranslations === "object") {
        result[language] = languageTranslations;
      }
    }
  }

  return result;
}
