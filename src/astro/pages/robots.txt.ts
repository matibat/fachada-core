import { getActiveAppConfig } from "@fachada/core";
import { generateRobotsTxt } from "@fachada/core";

export async function GET() {
  const appConfig = getActiveAppConfig();

  const robotsTxt = appConfig.siteTree
    ? generateRobotsTxt(appConfig.siteTree, appConfig.seo.url)
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", appConfig.seo.url).href}`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
