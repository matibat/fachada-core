/**
 * AppConfig aggregate — DDD v2 canonical type definitions.
 *
 * AppConfig is the aggregate root for the entire application.
 * All other types in this file are value objects or nested aggregates.
 *
 * Backward compatibility: SiteConfig + ProfileConfig remain in profile.types.ts
 * as the existing components still consume them directly. AppConfig composes them
 * by structural subtyping — no import from /apps/ or external context allowed.
 */

import type { ThemeTokens } from "../utils/theme.config";
import type {
  SiteConfig,
  PageSectionConfig,
  ThemeConfig,
} from "./profile.types";
import type { WidgetLayoutConfig } from "./layout.types";
import type { SiteTreeConfig } from "./site-tree.types";

export type { SiteTreeConfig } from "./site-tree.types";

/** Sentinel value — used by tests to confirm the module loaded correctly. */
export const APP_CONFIG_VERSION = "v2" as const;

// ─── Widget Domain ────────────────────────────────────────────────────────────

/**
 * WidgetConfig — identifies a concrete widget component and its initialisation
 * props. `type` maps to a key in WidgetRegistry; `props` is passed as-is.
 */
export interface WidgetConfig {
  /** Registry key that identifies the component, e.g. "HeroWidget" */
  type: string;
  /** Arbitrary initialisation data forwarded to the widget as props */
  props?: Record<string, unknown>;
}

/**
 * SectionConfig — extends the existing PageSectionConfig with a widgets list.
 * Adding `widgets` here preserves backward-compat with existing sections config.
 */
export interface SectionConfig extends PageSectionConfig {
  /** Ordered list of widgets to render inside this section */
  widgets: WidgetConfig[];
}

/**
 * PageConfig — top-level page composition descriptor.
 */
export interface PageConfig {
  sections: SectionConfig[];
}

// ─── Theme Domain ─────────────────────────────────────────────────────────────

/**
 * ThemeOverride — a partial token overlay applied on top of a base ThemeConfig.
 * Used as values in AppConfig.themeVariants.
 */
export interface ThemeOverride {
  /** Sparse token map; missing keys fall back to the base theme tokens */
  tokens?: Partial<ThemeTokens>;
}

/**
 * CustomThemeDefinition — a complete theme definition for an app-specific theme.
 * Must include both light and dark token sets.
 */
export interface CustomThemeDefinition {
  name: string;
  description: string;
  light: ThemeTokens;
  dark: ThemeTokens;
}

/**
 * AppThemes — per-app theme configuration.
 *
 * Apps select exactly which themes are available to their users:
 *   - `globals`: subset of built-in global theme keys to include
 *     (omit to include none, or include all with all 4 global keys)
 *   - `custom`: app-specific theme definitions with full light/dark tokens
 *   - `default`: the theme key loaded on first visit
 *     (must exist in globals or custom — validated at build time)
 *
 * Build-time validation catches:
 *   - `default` not present in the configured themes
 *   - collision between a custom key and a global key
 *   - custom theme missing light or dark token set
 */
export interface AppThemes {
  /** Global theme keys to include. Each must be a key in THEME_DEFINITIONS. */
  globals?: string[];
  /** App-specific custom theme definitions. */
  custom?: Record<string, CustomThemeDefinition>;
  /** Default theme key. Must exist in globals or custom keys. */
  default: string;
}

// ─── Asset Domain ─────────────────────────────────────────────────────────────

/**
 * AssetConfig — theme-aware asset references keyed by logical name.
 * Each entry may be a plain string (default) or a variant map.
 */
export interface AssetConfig {
  ogImage: string;
  [key: string]: string | Record<string, string>;
}

// ─── AppConfig Aggregate Root ─────────────────────────────────────────────────

/**
 * AppConfig — aggregate root for Fachada v2.
 *
 * `seo` reuses SiteConfig to preserve backward compatibility with all existing
 * components that already consume that shape.
 */
export interface AppConfig {
  /** Identity and SEO metadata (maps to current SiteConfig) */
  seo: SiteConfig;
  /** Base theme configuration (color mode defaults, enables) */
  theme: ThemeConfig;
  /** Named partial token overlays; keys match the activeTheme selector */
  themeVariants: Record<string, ThemeOverride>;
  /**
   * Per-app theme selection.
   * Defines exactly which themes are available and which is the default.
   * Validated at build time.
   * If omitted, no theme switcher themes will be registered.
   */
  themes?: AppThemes;
  /** Asset references, optionally with per-variant overrides */
  assets: AssetConfig;
  /** Per-theme widget layout overrides; keys match theme names */
  themeLayouts?: Record<string, WidgetLayoutConfig>;
  /**
   * Site structure and per-page SEO configuration.
   *
   * Declares the full page hierarchy (landing + optional subsections) with
   * metadata sufficient to auto-generate robots.txt and llm.txt.
   * When omitted, robots.txt falls back to a permissive default.
   */
  siteTree?: SiteTreeConfig;
  /** Page composition hierarchy */
  page: PageConfig;
}
