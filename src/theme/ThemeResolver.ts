/**
 * ThemeResolver — pure domain service.
 *
 * Resolves the active ThemeTokens from a base ThemeConfig and an optional
 * named variant override. No React, no side effects, no imports from /apps/.
 *
 * Strategy: base tokens for the configured color mode, then shallow-merge any
 * variant token overrides on top.
 */

import { THEME_DEFINITIONS } from "../utils/theme.config";
import type { ThemeTokens, ThemeDefinition } from "../utils/theme.config";
import type { ThemeConfig } from "../types/profile.types";
import type { ThemeOverride } from "../types/app.types";

/**
 * Resolves the final ThemeTokens for a given base config and optional variant.
 *
 * @param base         - The base ThemeConfig (style + defaultMode).
 * @param variants     - Named partial overrides keyed by variant identifier.
 * @param activeVariant - Optional key selecting which variant to apply.
 *                        When absent or unknown, base tokens are returned as-is.
 * @param availableThemes - Optional pool of theme definitions (includes custom themes).
 *                          Falls back to THEME_DEFINITIONS if not provided.
 * @returns A new ThemeTokens object (never mutates inputs).
 */
export function resolveTheme(
  base: ThemeConfig,
  variants: Record<string, ThemeOverride>,
  activeVariant?: string,
  availableThemes?: Record<string, ThemeDefinition>,
): ThemeTokens {
  const colorMode: "light" | "dark" =
    base.defaultMode === "dark" ? "dark" : "light";

  // Use provided availableThemes (merged pool) or fall back to global THEME_DEFINITIONS
  const themePool = availableThemes || THEME_DEFINITIONS;
  const baseThemeDef = themePool[base.style];

  if (!baseThemeDef || !baseThemeDef[colorMode]) {
    // Fallback to minimalist if requested theme not found
    const fallbackTheme = THEME_DEFINITIONS["minimalist"];
    return { ...fallbackTheme[colorMode] };
  }

  const baseTokens: ThemeTokens = baseThemeDef[colorMode];

  if (!activeVariant || !(activeVariant in variants)) {
    return { ...baseTokens };
  }

  const override = variants[activeVariant];
  const overrideTokens = override.tokens ?? {};

  return { ...baseTokens, ...overrideTokens };
}
