/**
 * Exports for generated types
 *
 * Re-exports all application types generated from application-v1.json schema.
 * This file ensures types are available for import throughout the codebase.
 *
 * Generated types are created at build time by scripts/generate-app-types.mjs
 */

export type {
  ApplicationConfig,
  SEOConfig,
  ThemesConfig,
  CustomThemeDefinition,
  PageConfig,
  WidgetConfig,
  ContainerConfig,
  ContentItem,
} from "./application.types";
