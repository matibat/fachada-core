/**
 * vite-plugin-generate-app-types — generates TypeScript types from schema at build time
 *
 * Runs before Astro build to generate `src/.generated/application.types.ts` from the
 * application-v1.json schema. Enables zero-`any` type consumption in consuming apps.
 *
 * Hooks into Vite's `resolveId` and `load` phases to ensure generation happens early.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const TRIGGER_ID = "virtual:fachada/generate-types";
const RESOLVED_ID = "\0" + TRIGGER_ID;

/**
 * Returns a Vite plugin that generates types at build time
 *
 * @param cwd - Project root. Defaults to `process.cwd()`.
 */
export function typeGeneratorPlugin(cwd: string = process.cwd()) {
  let typesGenerated = false;

  return {
    name: "vite-plugin-generate-app-types",
    // Run at the pre stage to ensure types are generated before other plugins/Astro
    apply: "build",

    /**
     * Resolve the virtual module that triggers type generation
     */
    resolveId(id: string) {
      if (id === TRIGGER_ID) return RESOLVED_ID;
    },

    /**
     * Load the virtual module and trigger type generation
     */
    load(id: string) {
      if (id !== RESOLVED_ID) return;

      // Generate types only once per build
      if (!typesGenerated) {
        generateAppTypes(cwd);
        typesGenerated = true;
      }

      // Return a no-op module
      return "export const generated = true;";
    },

    /**
     * Hook into configResolved to trigger generation early in the build process
     */
    configResolved(config: { command: string }) {
      // Always generate types at the start of build, even if virtual module isn't imported
      if (config.command === "build" && !typesGenerated) {
        generateAppTypes(cwd);
        typesGenerated = true;
      }
    },
  };
}

/**
 * Generate TypeScript types from application-v1.json schema
 */
function generateAppTypes(cwd: string) {
  const generatorScript = resolve(cwd, "scripts", "generate-app-types.mjs");
  const schemaPath = resolve(
    cwd,
    "src",
    "config",
    "schema",
    "application-v1.json",
  );
  const outputPath = resolve(cwd, "src", ".generated", "application.types.ts");

  // Ensure output directory exists
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  try {
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${outputPath}"`,
      {
        cwd,
        stdio: "inherit",
      },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate app types: ${msg}`);
  }
}
