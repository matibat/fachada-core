/**
 * MarkdownPageCollector — pure domain service.
 *
 * Converts Astro content-collection entries (already fetched; no I/O here)
 * into SubsectionDefinition[] with template: "markdown".
 *
 * Rules:
 *  1. Include entry when data.apps === "*" or data.apps.includes(activeApp).
 *  2. Skip (add to skipped) entries whose resolved path is "/".
 *  3. Error (add to errors) entries whose resolved path collides with existingPaths.
 *  4. Default path falls back to "/{entry.id}" when data.path is omitted.
 */
import type {
  SubsectionDefinition,
  MarkdownPageData,
} from "../types/site-tree.types";

// ─── Public Interfaces ────────────────────────────────────────────────────────

export interface CollectionEntry {
  id: string;
  data: {
    title: string;
    description: string;
    apps: string[] | "*";
    path?: string;
    keywords?: string[];
    llmSummary?: string;
    ogImage?: string;
    downloadFilename?: string;
    backLink?: { href: string; label: string };
    nextLink?: { href: string; label: string };
  };
}

export interface CollectedPagesResult {
  pages: SubsectionDefinition[];
  skipped: Array<{ id: string; reason: string }>;
  errors: Array<{ id: string; reason: string }>;
}

// ─── Domain Service ───────────────────────────────────────────────────────────

/**
 * collectMarkdownPages — pure function; no side effects, no I/O.
 *
 * @param entries     Already-fetched content collection entries.
 * @param activeApp   The current app identifier (e.g. "default-fachada").
 * @param existingPaths Set of paths already registered in the site tree.
 */
export function collectMarkdownPages(
  entries: CollectionEntry[],
  activeApp: string,
  existingPaths: Set<string>,
): CollectedPagesResult {
  const pages: SubsectionDefinition[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];
  const errors: Array<{ id: string; reason: string }> = [];

  for (const entry of entries) {
    // ── App filter ────────────────────────────────────────────────────────────
    const appMatches =
      entry.data.apps === "*" ||
      (Array.isArray(entry.data.apps) && entry.data.apps.includes(activeApp));

    if (!appMatches) {
      skipped.push({ id: entry.id, reason: `app not in apps list` });
      continue;
    }

    // ── Path resolution ───────────────────────────────────────────────────────
    const resolvedPath = entry.data.path ?? `/${entry.id}`;

    // Skip root collision
    if (resolvedPath === "/") {
      skipped.push({
        id: entry.id,
        reason: `path "/" is reserved for landing`,
      });
      continue;
    }

    // Path collision with existing tree
    if (existingPaths.has(resolvedPath)) {
      errors.push({
        id: entry.id,
        reason: `path "${resolvedPath}" already registered`,
      });
      continue;
    }

    // ── Build SubsectionDefinition ────────────────────────────────────────────
    const templateData: MarkdownPageData = {
      contentId: entry.id,
      ...(entry.data.downloadFilename !== undefined && {
        downloadFilename: entry.data.downloadFilename,
      }),
      ...(entry.data.backLink !== undefined && {
        backLink: entry.data.backLink,
      }),
      ...(entry.data.nextLink !== undefined && {
        nextLink: entry.data.nextLink,
      }),
    };

    pages.push({
      id: entry.id,
      meta: {
        path: resolvedPath,
        title: entry.data.title,
        description: entry.data.description,
        ...(entry.data.keywords !== undefined && {
          keywords: entry.data.keywords,
        }),
        ...(entry.data.llmSummary !== undefined && {
          llmSummary: entry.data.llmSummary,
        }),
        ...(entry.data.ogImage !== undefined && {
          ogImage: entry.data.ogImage,
        }),
      },
      sections: [],
      template: "markdown",
      templateData,
    });
  }

  return { pages, skipped, errors };
}
