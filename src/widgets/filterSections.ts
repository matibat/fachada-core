/**
 * filterSections — pure domain service.
 *
 * Extracts the section-visibility and ordering logic previously embedded in
 * src/pages/index.astro into a testable, side-effect-free function.
 *
 * The output is an ordered array of enabled section IDs — identical to what
 * the original template array produced.
 */

import type { PageSectionConfig } from "../types/profile.types";

export interface FilterSectionsContext {
  /** Number of entries in the 'projects' content collection */
  projectsCount: number;
  /** Number of entries in the 'blog' content collection */
  blogCount: number;
  /** IDs of roles present in the active siteConfig */
  availableRoles: string[];
}

/**
 * Returns the ordered list of section IDs that should be rendered, given the
 * current context (content counts and available roles).
 *
 * Mirrors the filter + sort + map pipeline from index.astro exactly.
 *
 * @param sections - The profile's section config array
 * @param context  - Runtime context (content + role availability)
 * @returns Ordered array of enabled section IDs
 */
export function filterSections(
  sections: PageSectionConfig[],
  context: FilterSectionsContext,
): string[] {
  return sections
    .filter((section) => {
      if (!section.enabled) return false;
      if (section.requiresContent === "projects" && context.projectsCount === 0)
        return false;
      if (section.requiresContent === "blog" && context.blogCount === 0)
        return false;
      if (section.requiresRole) {
        const hasMatchingRole = section.requiresRole.some((roleId) =>
          context.availableRoles.includes(roleId),
        );
        if (!hasMatchingRole) return false;
      }
      return true;
    })
    .sort((a, b) => a.order - b.order)
    .map((s) => s.id);
}
