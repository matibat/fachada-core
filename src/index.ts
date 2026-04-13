// Types
export * from './types/index';

// App loader
export { AVAILABLE_APPS, getActiveAppConfig, getActiveAppName } from './app/AppLoader';

// Asset resolver
export { resolveAsset } from './assets/AssetResolver';

// Content
export { resolveAppContentPath } from './content/AppContentPathResolver';
export { pagesSchema } from './content/pages.schema';

// Site tree services
export { generateLlmTxt } from './site-tree/LlmTextGenerator';
export type { CollectionEntry, CollectedPagesResult } from './site-tree/MarkdownPageCollector';
export { collectMarkdownPages } from './site-tree/MarkdownPageCollector';
export { generateRobotsTxt } from './site-tree/RobotsGenerator';
export type { SiteTreeValidationResult } from './site-tree/SiteTreeValidator';
export { validateSiteTree } from './site-tree/SiteTreeValidator';
export type { StaticPath } from './site-tree/StaticPathBuilder';
export { buildMergedStaticPaths } from './site-tree/StaticPathBuilder';

// Theme store (Zustand)
export type { ThemePool, ThemeStoreState, ThemeStoreActions } from './stores/themeStore';
export { useThemeStore, getThemeStore } from './stores/themeStore';

// Theme resolver
export { resolveTheme } from './theme/ThemeResolver';

// Vite plugin
export type { FachadaRc } from './vite/fachada-plugin';
export { fachadaPlugin, readFachadarc, resolveAppName } from './vite/fachada-plugin';

// Widgets
export type { FilterSectionsContext } from './widgets/filterSections';
export { filterSections } from './widgets/filterSections';
export { resolveWidgetLayout } from './widgets/resolveWidgetLayout';
export type { WidgetRegistry } from './widgets/WidgetRegistry';
export { createWidgetRegistry } from './widgets/WidgetRegistry';

// Utils
export { resolveContactMessage } from './utils/contact';
export { getBaseUrl } from './utils/createLink';

// Theme utilities
export type {
  ThemeTokens,
  ThemeDefinition,
  ThemeStyle,
  ColorMode,
} from './utils/theme.config';
export { CSS_VAR_MAP, THEME_DEFINITIONS, THEME_STYLES, getActiveTokens } from './utils/theme.config';

export type {
  ThemeOperationResult,
  ThemeErrorType,
  ThemeState,
  ThemeDependencies,
} from './utils/theme.types';
export { ThemeError, isValidColorMode, isValidThemeStyle } from './utils/theme.types';

export { validateColorMode, validateThemeStyle, getSystemPreference, readFromStorage } from './utils/theme.utils';

export type { ThemeValidationResult } from './utils/theme-validation';
export { validateThemeConfig, validateThemeConfigOrThrow } from './utils/theme-validation';
