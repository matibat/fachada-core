/**
 * StaticPathBuilder — pure helper for merging config-declared and MD-discovered
 * static paths.
 *
 * Encapsulates the existingPaths derivation and collectMarkdownPages call so
 * the logic can be unit tested without importing Astro virtual modules.
 *
 * Used by src/pages/[...slug].astro to build the complete merged paths array
 * returned from getStaticPaths().
 */
import {
  collectMarkdownPages,
  type CollectionEntry,
} from "./MarkdownPageCollector";
import type { SubsectionDefinition } from "../types/site-tree.types";

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface StaticPath {
  params: { slug: string };
  props: { subsection: SubsectionDefinition };
}

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * buildMergedStaticPaths — merges config-declared subsections with
 * MD-discovered pages from the content collection.
 *
 * Derives the existingPaths Set from configSubsections so that
 * collectMarkdownPages can reject any MD entry that would collide with a
 * config-declared route.
 *
 * @param configSubsections  Subsections declared in AppConfig.siteTree.landing.subsections
 * @param entries            Already-fetched content collection entries (from getCollection('pages'))
 * @param appName            Active app identifier (e.g. "default-fachada")
 * @returns                  Combined static paths covering both config-declared and MD sources
 */
export function buildMergedStaticPaths(
  configSubsections: SubsectionDefinition[],
  entries: CollectionEntry[],
  appName: string,
): StaticPath[] {
  // Build existingPaths from config-declared subsections to prevent MD collisions
  const existingPaths = new Set<string>(
    configSubsections.map((s) => s.meta.path),
  );

  // Config-declared paths (preserved as-is)
  const configPaths: StaticPath[] = configSubsections.map((subsection) => ({
    params: { slug: subsection.meta.path.replace(/^\//, "") },
    props: { subsection },
  }));

  // MD-discovered paths — collisions with existingPaths are already rejected by collectMarkdownPages
  const { pages } = collectMarkdownPages(entries, appName, existingPaths);
  const mdPaths: StaticPath[] = pages.map((subsection) => ({
    params: { slug: subsection.meta.path.replace(/^\//, "") },
    props: { subsection },
  }));

  return [...configPaths, ...mdPaths];
}
