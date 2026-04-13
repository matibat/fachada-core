/**
 * /llm.txt — AI-readable site description.
 *
 * Follows the llms.txt specification (https://llmstxt.org).
 * Generated from AppConfig.siteTree when present; falls back to a minimal
 * representation using SiteConfig identity and description.
 */
import { getActiveAppConfig } from "@fachada/core";
import { generateLlmTxt } from "@fachada/core";

export async function GET() {
  const appConfig = getActiveAppConfig();

  const llmTxt = appConfig.siteTree
    ? generateLlmTxt(appConfig.seo, appConfig.siteTree)
    : `# ${appConfig.seo.name}\n\n> ${appConfig.seo.description}`;

  return new Response(llmTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
