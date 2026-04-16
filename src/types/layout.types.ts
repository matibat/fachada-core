import type { AstroComponentFactory } from "astro/runtime/server/index.js";

/**
 * WidgetLayoutConfig — maps section IDs to their chosen layout variant string.
 * All entries are optional; widgets fall back to their own defaults when unset.
 */
export type WidgetLayoutConfig = Record<string, string>;

/**
 * Maps a section ID (string) to its statically-imported Astro component.
 * The caller is responsible for importing each component before build time;
 * WidgetRenderer makes no assumptions about which components are registered.
 */
export type WidgetComponentMap = Record<string, AstroComponentFactory>;
