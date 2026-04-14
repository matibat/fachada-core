// Types
export * from "./types/index";

// App loader
export {
  AVAILABLE_APPS,
  getActiveAppConfig,
  getActiveAppName,
} from "./app/AppLoader";

// Asset resolver
export { resolveAsset } from "./assets/AssetResolver";

// Content
export { resolveAppContentPath } from "./content/AppContentPathResolver";
export { pagesSchema } from "./content/pages.schema";

// Site tree services
export { generateLlmTxt } from "./site-tree/LlmTextGenerator";
export type {
  CollectionEntry,
  CollectedPagesResult,
} from "./site-tree/MarkdownPageCollector";
export { collectMarkdownPages } from "./site-tree/MarkdownPageCollector";
export { generateRobotsTxt } from "./site-tree/RobotsGenerator";
export type { SiteTreeValidationResult } from "./site-tree/SiteTreeValidator";
export { validateSiteTree } from "./site-tree/SiteTreeValidator";
export type { StaticPath } from "./site-tree/StaticPathBuilder";
export { buildMergedStaticPaths } from "./site-tree/StaticPathBuilder";

// Theme context
export type { ThemeActions, ThemeProviderProps } from "./context/ThemeContext";
export {
  ThemeProvider,
  useTheme,
  useThemeActions,
  useThemeContext,
} from "./context/ThemeContext";

// Theme store (Zustand)
export type {
  ThemePool,
  ThemeStoreState,
  ThemeStoreActions,
} from "./stores/themeStore";
export { useThemeStore, getThemeStore } from "./stores/themeStore";

// Theme resolver
export { resolveTheme } from "./theme/ThemeResolver";

// Widgets
export type { FilterSectionsContext } from "./widgets/filterSections";
export { filterSections } from "./widgets/filterSections";
export { resolveWidgetLayout } from "./widgets/resolveWidgetLayout";
export type { WidgetRegistry } from "./widgets/WidgetRegistry";
export { createWidgetRegistry } from "./widgets/WidgetRegistry";

// Components (islands)
export { default as ThemeSwitcher } from "./components/islands/ThemeSwitcher";
export { default as ThemeToggle } from "./components/islands/ThemeToggle";
export { default as LayoutWrapper } from "./components/islands/LayoutWrapper";
export { default as RoleExplorer } from "./components/islands/RoleExplorer";

// Utils
export { resolveContactMessage } from "./utils/contact";
export { getBaseUrl } from "./utils/createLink";

// Theme utilities
export type {
  ThemeTokens,
  ThemeDefinition,
  ThemeStyle,
  ColorMode,
} from "./utils/theme.config";
export {
  CSS_VAR_MAP,
  THEME_DEFINITIONS,
  THEME_STYLES,
  getActiveTokens,
} from "./utils/theme.config";

// Navbar utilities
export {
  getNavbarConfig,
  getNavbarClasses,
  getMobileMenuAttrs,
  resolveMobileBreakpoint,
  getMobileMediaQuery,
  getNavbarStyle,
} from "./navbar/navbar.utils";

export type {
  ThemeOperationResult,
  ThemeErrorType,
  ThemeState,
  ThemeDependencies,
} from "./utils/theme.types";
export {
  ThemeError,
  isValidColorMode,
  isValidThemeStyle,
} from "./utils/theme.types";
export { writeToStorage } from "./utils/theme.utils";

export {
  validateColorMode,
  validateThemeStyle,
  getSystemPreference,
  readFromStorage,
} from "./utils/theme.utils";

export type { ThemeValidationResult } from "./utils/theme-validation";
export {
  validateThemeConfig,
  validateThemeConfigOrThrow,
} from "./utils/theme-validation";
