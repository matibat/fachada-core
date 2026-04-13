import type { AstroIntegration } from "astro";
import { fileURLToPath } from "url";
import { fachadaPlugin } from "../vite/fachada-plugin";

function localPath(relativePath: string): string {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

export function fachadaIntegration(): AstroIntegration {
  const activeApp = process.env.APP || "default-fachada";

  return {
    name: "@fachada/core",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig, addWatchFile }) => {
        injectRoute({ pattern: "/", entrypoint: localPath("./pages/index.astro") });
        injectRoute({
          pattern: "/[...slug]",
          entrypoint: localPath("./pages/[...slug].astro"),
        });
        injectRoute({ pattern: "/404", entrypoint: localPath("./pages/404.astro") });
        injectRoute({ pattern: "/blog", entrypoint: localPath("./pages/blog/index.astro") });
        injectRoute({
          pattern: "/blog/[slug]",
          entrypoint: localPath("./pages/blog/[slug].astro"),
        });
        injectRoute({
          pattern: "/projects",
          entrypoint: localPath("./pages/projects/index.astro"),
        });
        injectRoute({
          pattern: "/projects/[slug]",
          entrypoint: localPath("./pages/projects/[slug].astro"),
        });
        injectRoute({
          pattern: "/robots.txt",
          entrypoint: localPath("./pages/robots.txt.ts"),
          prerender: true,
        });
        injectRoute({
          pattern: "/llm.txt",
          entrypoint: localPath("./pages/llm.txt.ts"),
          prerender: true,
        });

        updateConfig({
          vite: {
            plugins: [fachadaPlugin(activeApp)],
            define: {
              "import.meta.env.APP": JSON.stringify(activeApp),
            },
          },
        });

        addWatchFile(localPath("../../../.fachadarc.json"));
      },
    },
  };
}
