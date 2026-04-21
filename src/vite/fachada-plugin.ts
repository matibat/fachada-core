/**
 * vite-plugin-fachada — build-time app selection and virtual-module generator.
 *
 * Provides the virtual module `virtual:fachada/active-app` which exports:
 *   - `appConfig`     — the build-time-selected AppConfig (shape: { seo, theme, ... })
 *   - `profileConfig` — the build-time-selected ProfileConfig (shape: { theme, about, skills, ... })
 *   - `AVAILABLE_APPS` — frozen array of discovered app names
 *   - `ACTIVE_APP_NAME` — string identifier of the active app
 *
 * The active app is resolved in priority order:
 *   1. `activeApp` argument passed to `fachadaPlugin()`
 *   2. `APP` environment variable
 *   3. First discovered app from `apps/` or the single-app fallback at `app/`
 *
 * YAML Loading Pattern:
 *   - Single-file: `app/application.yaml` with complete config
 *   - Modular: `app/site.yaml`, `app/profile.yaml`, etc. that merge (in lexical order)
 *
 * Config is read eagerly in `buildStart` (before prerendering) and cached in the
 * plugin closure. The `load()` hook only serialises the cached value — it never
 * touches the filesystem during the SSR phase.
 *
 * Usage: APP=app-name yarn dev
 *        APP=app-name yarn build
 *
 * Adding a new app: create `apps/<name>/application.yaml` or use a single app at
 * `app/application.yaml`. The plugin auto-discovers `apps/` and will prefer the
 * `APP` env var or the discovered default when provided.
 */

import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "fs";
import { resolve, dirname } from "path";
import YAML from "yaml";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppRegistry {
  /** App name used when APP env var is absent. */
  defaultApp: string;
  /** Registry: app name → directory path relative to project root. */
  apps: Record<string, string>;
}

// ─── YAML ─────────────────────────────────────────────────────────────────────

/**
 * Deep merge two plain objects. Later keys override earlier ones; arrays are
 * replaced, not concatenated.
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  if (!source || typeof source !== "object" || Array.isArray(source))
    return source as Record<string, unknown>;
  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      tv &&
      typeof tv === "object" &&
      !Array.isArray(tv)
    ) {
      result[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      );
    } else {
      result[key] = sv;
    }
  }
  return result;
}

/**
 * Builds a YAML `!include` custom tag handler resolved relative to `baseDir`.
 * The included file is parsed recursively (also supports `!include`).
 * Includes are resolved before schema validation so the validator sees a
 * complete document.
 */
function makeIncludeTag(baseDir: string) {
  return {
    tag: "!include",
    resolve(str: string): unknown {
      const includePath = resolve(baseDir, str);
      try {
        const content = readFileSync(includePath, "utf-8");
        return YAML.parse(content, {
          customTags: [makeIncludeTag(dirname(includePath))],
        }) as unknown;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`!include failed for '${str}' in ${baseDir}: ${msg}`);
      }
    },
  };
}

/**
 * Parse a YAML string with `!include` support.
 * Includes are resolved relative to `baseDir`.
 */
function parseYamlWithIncludes(
  content: string,
  baseDir: string,
): Record<string, unknown> {
  return YAML.parse(content, {
    customTags: [makeIncludeTag(baseDir)],
  }) as Record<string, unknown>;
}

/**
 * Load YAML configuration from an app directory.
 * Prefers `application.yaml` (single-file); falls back to all `*.yaml` files
 * merged in lexical order (modular pattern).
 * Supports `!include path/to/file.yaml` in any YAML file.
 *
 * @throws if no YAML files are found or parsing fails
 */
function loadYamlConfig(appDir: string): Record<string, unknown> {
  const singleFile = resolve(appDir, "application.yaml");

  if (existsSync(singleFile)) {
    try {
      return parseYamlWithIncludes(
        readFileSync(singleFile, "utf-8"),
        dirname(singleFile),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse application.yaml in ${appDir}: ${msg}`);
    }
  }

  // Modular pattern: merge all *.yaml files in lexical order
  let files: string[] = [];
  try {
    files = readdirSync(appDir)
      .filter(
        (f) =>
          f.endsWith(".yaml") && !f.startsWith(".") && f !== "application.yaml",
      )
      .sort();
  } catch {
    throw new Error(`No YAML configuration found in ${appDir}`);
  }

  if (files.length === 0) {
    throw new Error(
      `No YAML files (application.yaml or modular *.yaml) found in ${appDir}`,
    );
  }

  let config: Record<string, unknown> = {};
  for (const file of files) {
    const filePath = resolve(appDir, file);
    try {
      const partial = parseYamlWithIncludes(
        readFileSync(filePath, "utf-8"),
        dirname(filePath),
      );
      config = deepMerge(config, partial);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse ${file} in ${appDir}: ${msg}`);
    }
  }
  return config;
}

// ─── Config normalisation ────────────────────────────────────────────────────

/** YAML keys that belong to AppConfig.seo (SiteConfig). */
const SEO_KEYS = new Set([
  "name",
  "title",
  "description",
  "author",
  "url",
  "ogImage",
  "social",
  "location",
  "roles",
  "primaryRole",
  "analytics",
]);

/**
 * Maps a flat YAML document to an AppConfig-compatible shape.
 * If the document already has a `seo` key it is returned as-is so that
 * apps that adopted the nested schema continue working.
 */
function buildAppConfig(
  yaml: Record<string, unknown>,
): Record<string, unknown> {
  if (yaml.seo) return yaml;

  const seo: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(yaml)) {
    if (SEO_KEYS.has(key)) {
      seo[key] = value;
    } else {
      rest[key] = value;
    }
  }
  return { seo, ...rest };
}

/**
 * Extracts a ProfileConfig-compatible shape from the flat YAML document.
 */
function buildProfileConfig(
  yaml: Record<string, unknown>,
): Record<string, unknown> {
  return {
    theme: yaml.theme,
    about: yaml.about ?? { paragraphs: [] },
    skills: yaml.skills ?? [],
    sections: yaml.sections ?? [],
    ...(yaml.contactMessage !== undefined
      ? { contactMessage: yaml.contactMessage }
      : {}),
    ...(yaml.multiRoleDisplay !== undefined
      ? { multiRoleDisplay: yaml.multiRoleDisplay }
      : {}),
  };
}

// ─── App discovery ────────────────────────────────────────────────────────────

function discoverApps(cwd: string): Record<string, string> {
  const appsDir = resolve(cwd, "apps");
  let appFolders: string[] = [];
  try {
    appFolders = readdirSync(appsDir);
  } catch {
    return {};
  }

  const apps: Record<string, string> = {};
  for (const folder of appFolders) {
    const appPath = resolve(appsDir, folder);
    const singleFile = resolve(appPath, "application.yaml");
    if (existsSync(singleFile)) {
      apps[folder] = `apps/${folder}`;
      continue;
    }
    try {
      const files = readdirSync(appPath).filter(
        (f) => f.endsWith(".yaml") && !f.startsWith("."),
      );
      if (files.length > 0) apps[folder] = `apps/${folder}`;
    } catch {
      // Skip folders without YAML
    }
  }
  return apps;
}

export function readAppRegistry(cwd: string = process.cwd()): AppRegistry {
  const apps = discoverApps(cwd);

  // Single-app convention: `app/` directory with YAML files
  const appDir = resolve(cwd, "app");
  if (existsSync(resolve(appDir, "application.yaml"))) {
    apps.app = "app";
  } else {
    try {
      const files = readdirSync(appDir).filter(
        (f) => f.endsWith(".yaml") && !f.startsWith("."),
      );
      if (files.length > 0) apps.app = "app";
    } catch {
      // no app/ directory
    }
  }

  const defaultApp = apps["default-fachada"]
    ? "default-fachada"
    : (Object.keys(apps)[0] ?? "default-fachada");

  return { defaultApp, apps };
}

export function resolveAppName(rawName: string, registry: AppRegistry): string {
  return rawName in registry.apps ? rawName : registry.defaultApp;
}

// Backwards compatibility aliases
export const readFachadarc = readAppRegistry;
export type FachadaRc = AppRegistry;

// ─── Bridge file generator ────────────────────────────────────────────────────

/**
 * Writes a TypeScript bridge file to `.fachada/generated/app.ts` that exports
 * the normalised `appConfig` and `profileConfig` as inlined constants.
 *
 * This file is a build artefact — add `.fachada/generated/` to `.gitignore`.
 * Import it via the `@fachada/app` alias that the Astro integration registers.
 */
export function generateBridgeFiles(
  config: {
    appConfig: Record<string, unknown>;
    profileConfig: Record<string, unknown>;
    availableApps: string[];
    activeAppName: string;
  },
  cwd: string = process.cwd(),
): void {
  const genDir = resolve(cwd, ".fachada", "generated");
  mkdirSync(genDir, { recursive: true });

  const content = [
    `// AUTO-GENERATED — DO NOT EDIT`,
    `// Source: app/application.yaml (or apps/<name>/application.yaml)`,
    `// Regenerated at build time by vite-plugin-fachada.`,
    ``,
    `export const appConfig = ${JSON.stringify(config.appConfig, null, 2)} as const;`,
    ``,
    `export const profileConfig = ${JSON.stringify(config.profileConfig, null, 2)} as const;`,
    ``,
    `export const AVAILABLE_APPS = Object.freeze(${JSON.stringify(config.availableApps)}) as readonly string[];`,
    ``,
    `export const ACTIVE_APP_NAME = ${JSON.stringify(config.activeAppName)};`,
  ].join("\n");

  writeFileSync(resolve(genDir, "app.ts"), content, "utf-8");
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

const VIRTUAL_ID = "virtual:fachada/active-app";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

interface CachedModule {
  moduleCode: string;
  appConfig: Record<string, unknown>;
  profileConfig: Record<string, unknown>;
  availableApps: string[];
  activeAppName: string;
}

/**
 * Returns a Vite plugin that resolves `virtual:fachada/active-app`.
 *
 * YAML is read eagerly in `buildStart` (before prerendering) and stored in the
 * closure. The `load()` hook returns the cached serialised module — it never
 * reads the filesystem during the SSR or prerender phase.
 *
 * @param activeApp - Override the active app name. When omitted the plugin
 *                    reads the APP env var at build time.
 * @param cwd       - Project root. Defaults to `process.cwd()`.
 */
export function fachadaPlugin(activeApp?: string, cwd: string = process.cwd()) {
  let cached: CachedModule | undefined;

  function buildModule(): CachedModule {
    const registry = readAppRegistry(cwd);
    const rawName = activeApp ?? process.env.APP ?? registry.defaultApp;
    const appName = resolveAppName(rawName, registry);
    const appRelPath = registry.apps[appName];

    if (appRelPath === undefined) {
      throw new Error(
        `[vite-plugin-fachada] No app found for '${appName}'. ` +
          `Discovered apps: ${Object.keys(registry.apps).join(", ") || "(none)"}. ` +
          `Add an application.yaml to app/ or apps/<name>/.`,
      );
    }

    const absDir = resolve(cwd, appRelPath);
    const rawYaml = loadYamlConfig(absDir);
    const appConfig = buildAppConfig(rawYaml);
    const profileConfig = buildProfileConfig(rawYaml);
    const availableApps = Object.keys(registry.apps);
    const activeAppName = appName;

    const moduleCode = [
      `export const appConfig = ${JSON.stringify(appConfig)};`,
      `export const profileConfig = ${JSON.stringify(profileConfig)};`,
      `export const AVAILABLE_APPS = Object.freeze(${JSON.stringify(availableApps)});`,
      `export const ACTIVE_APP_NAME = ${JSON.stringify(activeAppName)};`,
    ].join("\n");

    return {
      moduleCode,
      appConfig,
      profileConfig,
      availableApps,
      activeAppName,
    };
  }

  return {
    name: "vite-plugin-fachada",

    // Read YAML before any bundling/prerendering begins.
    buildStart() {
      cached = buildModule();
      generateBridgeFiles(cached, cwd);
    },

    // Dev server: also read YAML before serving (covers `vite dev` path).
    configureServer() {
      cached = buildModule();
      generateBridgeFiles(cached, cwd);
    },

    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id: string) {
      if (id !== RESOLVED_ID) return;

      if (!cached) {
        throw new Error(
          "[vite-plugin-fachada] load() called before buildStart() — " +
            "the cached config is missing. This is a bug in the plugin setup.",
        );
      }

      return cached.moduleCode;
    },
  };
}
