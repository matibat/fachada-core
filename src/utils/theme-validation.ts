/**
 * Build-Time Theme Validation
 *
 * Resolves and validates AppConfig.themes at build time:
 *   - Collision: a custom key clashes with a selected global key
 *   - Missing default: default key not present in globals + custom
 *   - Incomplete custom definition: missing light/dark/name/description
 *
 * Returns the resolved theme pool (definition map) ready to embed in the page.
 */

import type { AppConfig, CustomThemeDefinition } from "../types/app.types";
import { THEME_DEFINITIONS } from "./theme.config";
import type { ThemeDefinition } from "./theme.config";

export interface ThemeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  /** Resolved theme pool — only the themes this app configured */
  resolvedThemes: Record<string, ThemeDefinition>;
  /** Effective default theme key */
  defaultTheme: string;
}

/**
 * Resolves and validates AppConfig.themes.
 *
 * Returns the resolved theme pool containing exactly the themes this app
 * selected — a subset of globals plus any custom definitions.
 */
export function validateThemeConfig(
  config: AppConfig,
  appName: string = "unknown",
): ThemeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const appThemes = config.themes;

  // No themes configured — nothing to validate, nothing to render
  if (!appThemes) {
    warnings.push(
      `[${appName}] No themes configured. Theme switcher will be empty.`,
    );
    return {
      isValid: true,
      errors,
      warnings,
      resolvedThemes: {},
      defaultTheme: Object.keys(THEME_DEFINITIONS)[0] ?? "minimalist",
    };
  }

  const globalKeys = appThemes.globals ?? [];
  const customKeys = Object.keys(appThemes.custom ?? {});

  // 1. Validate each selected global key exists in THEME_DEFINITIONS
  for (const key of globalKeys) {
    if (!(key in THEME_DEFINITIONS)) {
      errors.push(
        `[${appName}] Global theme "${key}" not found in THEME_DEFINITIONS. ` +
          `Available: ${Object.keys(THEME_DEFINITIONS).join(", ")}`,
      );
    }
  }

  // 2. Collision: custom key must not shadow a selected global key
  const collisions = customKeys.filter((k) => globalKeys.includes(k));
  if (collisions.length > 0) {
    errors.push(
      `[${appName}] Theme name collision: "${collisions.join(", ")}" appears in both globals and custom.`,
    );
  }

  // 3. Validate each custom theme definition is complete
  for (const [key, def] of Object.entries(appThemes.custom ?? {})) {
    if (!def.name)
      errors.push(`[${appName}] custom theme "${key}" missing 'name'`);
    if (!def.description)
      errors.push(`[${appName}] custom theme "${key}" missing 'description'`);
    if (!def.light)
      errors.push(`[${appName}] custom theme "${key}" missing 'light' tokens`);
    if (!def.dark)
      errors.push(`[${appName}] custom theme "${key}" missing 'dark' tokens`);
  }

  // 4. Build resolved theme pool from selected globals + custom definitions
  const resolvedThemes: Record<string, ThemeDefinition> = {};
  for (const key of globalKeys) {
    if (key in THEME_DEFINITIONS)
      resolvedThemes[key] =
        THEME_DEFINITIONS[key as keyof typeof THEME_DEFINITIONS];
  }
  for (const [key, def] of Object.entries(appThemes.custom ?? {})) {
    resolvedThemes[key] = def;
  }

  // 5. Validate default exists in resolved pool
  const allKeys = Object.keys(resolvedThemes);
  if (!allKeys.includes(appThemes.default)) {
    errors.push(
      `[${appName}] themes.default "${appThemes.default}" not found in configured themes. ` +
        `Available: ${allKeys.join(", ")}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    resolvedThemes,
    defaultTheme: appThemes.default,
  };
}

/**
 * Throws if validation fails; returns the resolved theme pool on success.
 * Use at build time (called from BaseLayout.astro).
 */
export function validateThemeConfigOrThrow(
  config: AppConfig,
  appName: string = "unknown",
): { resolvedThemes: Record<string, ThemeDefinition>; defaultTheme: string } {
  const result = validateThemeConfig(config, appName);

  if (!result.isValid) {
    throw new Error(
      `Theme validation failed for ${appName}:\n${result.errors.join("\n")}`,
    );
  }

  if (result.warnings.length > 0) {
    console.warn(`[${appName}] Theme warnings:\n${result.warnings.join("\n")}`);
  }

  return {
    resolvedThemes: result.resolvedThemes,
    defaultTheme: result.defaultTheme,
  };
}
