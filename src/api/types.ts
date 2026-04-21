/**
 * Astro Context Props Types
 *
 * Flattened, template-friendly props structure for Astro components
 * Derived from domain objects (Site, Page, Widget, Container)
 */

import type { ThemeTokens } from "../utils/theme.config";

/**
 * Flattened page data structure for Astro templates
 */
export interface AstroPageProps {
  id: string;
  title: string;
  description: string;
  path: string;
  language: string;
  tags: readonly string[];
}

/**
 * Flattened widget in render context
 */
export interface AstroWidgetProps {
  type: string;
  parameters: Record<string, unknown>;
}

/**
 * Flattened container in render context
 */
export interface AstroContainerProps {
  layout: string;
  children: AstroPageContentProps[];
  props?: Record<string, unknown>;
}

/**
 * Union type for flattened content items
 */
export type AstroPageContentProps = AstroWidgetProps | AstroContainerProps;

/**
 * Skin tokens for both light and dark modes
 */
export interface AstroSkinTokensProps {
  light: ThemeTokens;
  dark: ThemeTokens;
}

/**
 * Language-specific translation strings
 */
export interface AstroTranslationsProps {
  [key: string]: string;
}

/**
 * Page-level metadata (SEO, etc.)
 */
export interface AstroMetadataProps {
  title: string;
  description: string;
  language: string;
  path: string;
  tags: readonly string[];
}

/**
 * Complete Astro context props - ready for template spreading
 */
export interface AstroContextProps {
  page: AstroPageProps;
  content: AstroPageContentProps[];
  skinTokens: AstroSkinTokensProps;
  translations: Record<string, AstroTranslationsProps>;
  metadata: AstroMetadataProps;
}
