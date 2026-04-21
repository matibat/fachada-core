import type { AstroIntegration } from "astro";
import { fileURLToPath } from "url";
import { resolve } from "path";
import { fachadaPlugin } from "../vite/fachada-plugin.js";

function localPath(relativePath: string): string {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

export function fachadaIntegration(): AstroIntegration {
  const activeApp = process.env.APP || "default-fachada";

  return {
    name: "@fachada/core",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig, addWatchFile }) => {
        injectRoute({
          pattern: "/",
          entrypoint: localPath("./pages/index.astro"),
        });
        injectRoute({
          pattern: "/[...slug]",
          entrypoint: localPath("./pages/[...slug].astro"),
        });
        injectRoute({
          pattern: "/404",
          entrypoint: localPath("./pages/404.astro"),
        });
        injectRoute({
          pattern: "/blog",
          entrypoint: localPath("./pages/blog/index.astro"),
        });
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
          entrypoint: localPath("./pages/robots.txt.js"),
          prerender: true,
        });
        injectRoute({
          pattern: "/llm.txt",
          entrypoint: localPath("./pages/llm.txt.js"),
          prerender: true,
        });

        updateConfig({
          vite: {
            plugins: [fachadaPlugin(activeApp)],
            define: {
              "import.meta.env.APP": JSON.stringify(activeApp),
            },
            resolve: {
              alias: {
                // The @fachada/app alias points to the generated bridge file.
                // The file is created by generateBridgeFiles() in buildStart/configureServer.
                "@fachada/app": resolve(
                  process.cwd(),
                  ".fachada/generated/app.ts",
                ),
              },
              // Deduplicate shared peer deps so fachada-core and the host app
              // always use the same single instance, regardless of Node module
              // resolution walking up past fachada-core's own directory.
              dedupe: [
                "react",
                "react-dom",
                "zustand",
                "styled-components",
                "framer-motion",
              ],
            },
          },
        });

        // Watch the single-app convention first, fall back to legacy config if present
        try {
          addWatchFile(localPath("../../../app/app.config.ts"));
        } catch {
          // ignore — file may not exist during migration; tooling can still
          // auto-discover apps from `apps/` when needed
        }
      },
    },
  };
}
