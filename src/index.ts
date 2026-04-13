// Types
export * from './types/index';

// Vite plugin
export type { FachadaRc } from './vite/fachada-plugin';
export { fachadaPlugin, readFachadarc, resolveAppName } from './vite/fachada-plugin';

// Theme utilities
export type {
  ThemeTokens,
  ThemeDefinition,
  ThemeStyle,
  ColorMode,
} from './utils/theme.config';
export { CSS_VAR_MAP } from './utils/theme.config';

export type {
  ThemeOperationResult,
  ThemeErrorType,
  ThemeState,
  ThemeDependencies,
} from './utils/theme.types';
export { ThemeError, isValidColorMode, isValidThemeStyle } from './utils/theme.types';

export { validateColorMode, validateThemeStyle, getSystemPreference, readFromStorage } from './utils/theme.utils';

export type { ThemeValidationResult } from './utils/theme-validation';
export { validateThemeConfig } from './utils/theme-validation';
