/**
 * SiteTreeValidator — pure domain service.
 *
 * Validates a SiteTreeConfig against the structural constraints of the SiteTree
 * domain. Returns a value object describing validity; never throws.
 *
 * Rules enforced:
 *  1. landing.meta.path must be exactly "/"
 *  2. Subsection paths must not be "/"
 *  3. Subsection paths must be unique across the tree
 *  4. Subsection IDs must be unique across the tree
 */
import type { SiteTreeConfig } from "../types/site-tree.types";

// ─── Value Objects ────────────────────────────────────────────────────────────

export interface SiteTreeValidationResult {
  isValid: boolean;
  errors: string[];
}

// ─── Domain Service ───────────────────────────────────────────────────────────

/**
 * validateSiteTree — validates a SiteTreeConfig and returns a result object.
 *
 * Pure: same input always produces an equal (but distinct) result object.
 * Does not mutate the input.
 */
export function validateSiteTree(
  tree: SiteTreeConfig,
): SiteTreeValidationResult {
  const errors: string[] = [];

  if (tree.landing.meta.path !== "/") {
    errors.push(
      `Landing page path must be "/" but got "${tree.landing.meta.path}".`,
    );
  }

  const subsections = tree.landing.subsections ?? [];

  const seenPaths = new Set<string>();
  const seenIds = new Set<string>();

  for (const sub of subsections) {
    if (sub.meta.path === "/") {
      errors.push(
        `Subsection "${sub.id}" must not use path "/" — that is reserved for the landing page.`,
      );
    }

    if (seenPaths.has(sub.meta.path)) {
      errors.push(
        `Duplicate subsection path detected: "${sub.meta.path}". Each page must have a unique path.`,
      );
    } else {
      seenPaths.add(sub.meta.path);
    }

    if (seenIds.has(sub.id)) {
      errors.push(
        `Duplicate subsection ID detected: "${sub.id}". Each subsection must have a unique id.`,
      );
    } else {
      seenIds.add(sub.id);
    }
  }

  return { isValid: errors.length === 0, errors };
}
