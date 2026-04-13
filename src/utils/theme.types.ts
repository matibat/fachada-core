/**
 * Theme system types and interfaces
 * Provides type safety for theme validation, state management, and error handling.
 *
 * ThemeStyle and ColorMode are defined in theme.config.ts (single source of truth)
 * and re-exported here for backward compatibility.
 */
export type { ThemeStyle, ColorMode } from "./theme.config";

/**
 * Result of a theme operation (success or error)
 */
export interface ThemeOperationResult<T = void> {
  success: boolean;
  value?: T;
  error?: ThemeError;
}

/**
 * Theme system errors
 */
export type ThemeErrorType =
  | "INVALID_THEME"
  | "INVALID_STYLE"
  | "STORAGE_QUOTA_EXCEEDED"
  | "STORAGE_JSON_PARSE_ERROR"
  | "STORAGE_UNAVAILABLE"
  | "MEDIA_QUERY_UNAVAILABLE"
  | "DOM_UNAVAILABLE"
  | "UNKNOWN_ERROR";

/**
 * Error representing a theme operation failure
 */
export class ThemeError extends Error {
  constructor(
    public code: ThemeErrorType,
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "ThemeError";
  }
}

/**
 * Current theme state
 */
export interface ThemeState {
  /** Current color mode (light/dark/auto) */
  colorMode: ColorMode;
  /** Current style theme */
  styleTheme: ThemeStyle;
  /** Whether theme is in sync with storage */
  isSynced: boolean;
  /** Resolved effective theme (considering auto preference) */
  effectiveColorMode: "light" | "dark";
}

/**
 * Dependencies for theme operations
 * Allows for dependency injection to avoid global state and enable testing
 */
export interface ThemeDependencies {
  /** Storage implementation (e.g., window.localStorage) */
  storage?: Storage;
  /** Document reference for DOM operations */
  document?: Document;
  /** Window reference for matchMedia and other APIs */
  window?: {
    matchMedia?: (query: string) => MediaQueryList;
  };
}

import { type ThemeStyle, type ColorMode, THEME_STYLES } from "./theme.config";

/** Type guard for ColorMode */
export function isValidColorMode(value: unknown): value is ColorMode {
  return value === "light" || value === "dark" || value === "auto";
}

/** Type guard for ThemeStyle */
export function isValidThemeStyle(value: unknown): value is ThemeStyle {
  return THEME_STYLES.includes(value as ThemeStyle);
}
