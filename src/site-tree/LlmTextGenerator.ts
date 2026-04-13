/**
 * LlmTextGenerator — pure domain service.
 *
 * Generates an llm.txt string following the llms.txt specification
 * (https://llmstxt.org). This file is served at /llm.txt and is designed
 * to be loaded into AI assistant context windows to accurately answer
 * questions about the site owner.
 *
 * Output structure (Markdown):
 *   # Site Name
 *
 *   > Site description
 *
 *   Landing llmSummary paragraph (if present)
 *
 *   ## Pages
 *
 *   - [Landing Title](/): Landing description
 *   - [Subsection Title](/path): Subsection description
 */
import type { SiteConfig } from "../types/profile.types";
import type { SiteTreeConfig } from "../types/site-tree.types";

// ─── Domain Service ───────────────────────────────────────────────────────────

/**
 * generateLlmTxt — pure function that converts site identity and site tree
 * into an llm.txt Markdown string.
 *
 * @param siteConfig - Site-wide identity and description.
 * @param tree       - Site tree with page metadata and llmSummary fields.
 */
export function generateLlmTxt(
  siteConfig: SiteConfig,
  tree: SiteTreeConfig,
): string {
  const sections: string[] = [];

  sections.push(`# ${siteConfig.name}`);
  sections.push("");
  sections.push(`> ${siteConfig.description}`);

  if (tree.landing.meta.llmSummary) {
    sections.push("");
    sections.push(tree.landing.meta.llmSummary);
  }

  sections.push("");
  sections.push("## Pages");
  sections.push("");

  const landingMeta = tree.landing.meta;
  sections.push(
    `- [${landingMeta.title}](${landingMeta.path}): ${landingMeta.description}`,
  );

  for (const sub of tree.landing.subsections ?? []) {
    sections.push(
      `- [${sub.meta.title}](${sub.meta.path}): ${sub.meta.description}`,
    );
  }

  return sections.join("\n");
}
