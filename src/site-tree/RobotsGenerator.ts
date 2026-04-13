/**
 * RobotsGenerator — pure domain service.
 *
 * Generates a robots.txt string from a SiteTreeConfig and a site URL.
 * Follows the Robots Exclusion Protocol (REP) specification.
 *
 * Output structure:
 *   User-agent: *
 *   Allow: /                            ← landing always allowed
 *   Allow: /engineering                 ← one per subsection (no disallow)
 *   Disallow: /private                  ← from robots.disallow directives
 *   Crawl-delay: N                      ← when any page sets crawlDelay
 *   <blank line>
 *   Sitemap: https://example.com/sitemap-index.xml
 */
import type { SiteTreeConfig, PageMeta } from "../types/site-tree.types";

// ─── Domain Service ───────────────────────────────────────────────────────────

/**
 * generateRobotsTxt — pure function that converts a SiteTreeConfig into a
 * robots.txt string.
 *
 * @param tree    - The validated site tree configuration.
 * @param siteUrl - The canonical site URL (e.g. "https://example.com").
 *                  Trailing slashes are normalised internally.
 */
export function generateRobotsTxt(
  tree: SiteTreeConfig,
  siteUrl: string,
): string {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const lines: string[] = ["User-agent: *"];

  const allMetas: PageMeta[] = [
    tree.landing.meta,
    ...(tree.landing.subsections ?? []).map((s) => s.meta),
  ];

  const allowPaths: string[] = [];
  const disallowPaths: string[] = [];
  let crawlDelay: number | undefined;

  for (const meta of allMetas) {
    const hasExplicitDisallow =
      meta.robots?.disallow && meta.robots.disallow.length > 0;

    if (!hasExplicitDisallow) {
      allowPaths.push(meta.path);
    }

    if (meta.robots?.disallow) {
      for (const path of meta.robots.disallow) {
        disallowPaths.push(path);
      }
    }

    if (meta.robots?.crawlDelay !== undefined && crawlDelay === undefined) {
      crawlDelay = meta.robots.crawlDelay;
    }
  }

  for (const path of allowPaths) {
    lines.push(`Allow: ${path}`);
  }

  for (const path of disallowPaths) {
    lines.push(`Disallow: ${path}`);
  }

  if (crawlDelay !== undefined) {
    lines.push(`Crawl-delay: ${crawlDelay}`);
  }

  lines.push("");
  lines.push(`Sitemap: ${baseUrl}/sitemap-index.xml`);

  return lines.join("\n");
}
