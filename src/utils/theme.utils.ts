/**
 * Theme utilities - pure, testable functions for theme operations
 * All functions use dependency injection to avoid global state and enable testing
 * Error handling covers: quota exceeded, JSON parse errors, missing APIs, SSR safety
 */

import { THEME_STYLES } from "./theme.config";
import type {
  ColorMode,
  ThemeStyle,
  ThemeOperationResult,
  ThemeError,
  ThemeDependencies,
} from "./theme.types";
import {
  ThemeError as ThemeErrorClass,
  isValidColorMode,
  isValidThemeStyle,
} from "./theme.types";

/** Validates if a value is a valid ColorMode ('light', 'dark', or 'auto'). */
export function validateColorMode(
  value: unknown,
): ThemeOperationResult<ColorMode> {
  if (isValidColorMode(value)) {
    return { success: true, value };
  }

  return {
    success: false,
    error: new ThemeErrorClass(
      "INVALID_THEME",
      `Invalid color mode: ${String(value)}. Expected 'light', 'dark', or 'auto'.`,
    ),
  };
}

/** Validates if a value is a valid ThemeStyle. */
export function validateThemeStyle(
  value: unknown,
): ThemeOperationResult<ThemeStyle> {
  if (isValidThemeStyle(value)) {
    return { success: true, value };
  }

  return {
    success: false,
    error: new ThemeErrorClass(
      "INVALID_STYLE",
      `Invalid theme style: ${String(value)}. Expected one of: ${THEME_STYLES.join(", ")}.`,
    ),
  };
}

/**
 * Detects system color preference using matchMedia
 * Falls back to 'light' if matchMedia is unavailable (e.g., in SSR environments)
 *
 * @param deps - Dependencies (window for matchMedia access)
 * @returns Result containing the detected preference or an error
 *
 * @example
 * const result = getSystemPreference({
 *   window: typeof window !== 'undefined' ? window : undefined
 * });
 * if (result.success) {
 *   console.log(result.value); // 'dark' or 'light'
 * }
 */
export function getSystemPreference(
  deps: ThemeDependencies,
): ThemeOperationResult<"light" | "dark"> {
  try {
    // SSR safety: check if window.matchMedia is available
    if (!deps.window?.matchMedia) {
      return { success: true, value: "light" };
    }

    // Query system preference for dark mode
    const darkModeQuery = deps.window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    const preference = darkModeQuery.matches ? "dark" : "light";

    return { success: true, value: preference };
  } catch (error) {
    // If matchMedia throws (should be rare), default to light
    return { success: true, value: "light" };
  }
}

/**
 * Reads a theme value from storage with error handling
 * Returns default value if key not found or if parsing fails
 * Handles quota exceeded, JSON parse errors, and SSR scenarios
 *
 * @param deps - Dependencies (storage object)
 * @param key - Storage key to read
 * @param defaultValue - Default value if key not found or parsing fails
 * @returns Result containing the value or default, with error details if applicable
 *
 * @example
 * const result = readFromStorage(
 *   { storage: window.localStorage },
 *   'theme',
 *   'light'
 * );
 * if (result.success) {
 *   applyTheme(result.value); // result.value will always be valid
 * }
 */
export function readFromStorage<T>(
  deps: ThemeDependencies,
  key: string,
  defaultValue: T,
): ThemeOperationResult<T> {
  try {
    // Handle missing storage (e.g., SSR or no window object)
    if (!deps.storage) {
      return { success: true, value: defaultValue };
    }

    // Try to retrieve the value
    const rawValue = deps.storage.getItem(key);

    // Key not found in storage
    if (rawValue === null) {
      return { success: true, value: defaultValue };
    }

    // Parse JSON
    try {
      const parsed = JSON.parse(rawValue);
      return { success: true, value: parsed as T };
    } catch (parseError) {
      // JSON parse failed - return default but report error
      return {
        success: false,
        value: defaultValue,
        error: new ThemeErrorClass(
          "STORAGE_JSON_PARSE_ERROR",
          `Failed to parse stored theme value for key "${key}"`,
          parseError,
        ),
      };
    }
  } catch (error) {
    // Handle quota exceeded or other storage errors
    const errorMessage = String(error);
    if (errorMessage.includes("QuotaExceededError")) {
      return {
        success: false,
        value: defaultValue,
        error: new ThemeErrorClass(
          "STORAGE_QUOTA_EXCEEDED",
          "Storage quota exceeded",
          error,
        ),
      };
    }

    // Unknown storage error
    return {
      success: false,
      value: defaultValue,
      error: new ThemeErrorClass(
        "UNKNOWN_ERROR",
        "Failed to read from storage",
        error,
      ),
    };
  }
}

/**
 * Writes a theme value to storage with error handling
 * Automatically stringifies the value using JSON.stringify
 * Returns success boolean indicating if write was successful
 *
 * @param deps - Dependencies (storage object)
 * @param key - Storage key to write to
 * @param value - Value to store (will be JSON stringified)
 * @returns Result indicating success or failure with error details
 *
 * @example
 * const result = writeToStorage(
 *   { storage: window.localStorage },
 *   'theme',
 *   'dark'
 * );
 * if (result.success) {
 *   console.log('Theme saved');
 * }
 */
export function writeToStorage(
  deps: ThemeDependencies,
  key: string,
  value: unknown,
): ThemeOperationResult {
  try {
    // Handle missing storage
    if (!deps.storage) {
      return {
        success: false,
        error: new ThemeErrorClass(
          "STORAGE_UNAVAILABLE",
          "Storage is not available (SSR or disabled)",
        ),
      };
    }

    // Try to write to storage
    deps.storage.setItem(key, JSON.stringify(value));
    return { success: true };
  } catch (error) {
    // Handle quota exceeded
    const errorMessage = String(error);
    if (errorMessage.includes("QuotaExceededError")) {
      return {
        success: false,
        error: new ThemeErrorClass(
          "STORAGE_QUOTA_EXCEEDED",
          "Storage quota exceeded - unable to save theme preference",
          error,
        ),
      };
    }

    // Unknown storage error
    return {
      success: false,
      error: new ThemeErrorClass(
        "UNKNOWN_ERROR",
        "Failed to write to storage",
        error,
      ),
    };
  }
}
