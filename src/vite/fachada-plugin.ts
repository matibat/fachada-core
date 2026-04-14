/**
 * vite-plugin-fachada — build-time app selection and virtual-module generator.
 *
 * Provides the virtual module `virtual:fachada/active-app` which exports:
 *   - `appConfig`     — the build-time-selected AppConfig
 *   - `AVAILABLE_APPS` — frozen array of discovered app names
 *
 * The active app is resolved in priority order:
 *   1. `activeApp` argument passed to `fachadaPlugin()`
 *   2. `APP` environment variable
 *   3. First discovered app from `apps/` or the single-app fallback at `app/app.config.ts`
 *
 * Usage: APP=app-name yarn dev
 *        APP=app-name yarn build
 *
 * Adding a new app: create `apps/<name>/app.config.ts` or use a single app at
 * `app/app.config.ts`. The plugin auto-discovers `apps/` and will prefer the
 * `APP` env var or the discovered default when provided.
 */

import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppRegistry {
  /** App name used when APP env var is absent. */
  defaultApp: string;
  /** Registry: app name → path relative to project root. Optional—auto-discovered if omitted. */
  apps?: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Auto-discovers apps from the apps/ folder by looking for app.config.ts files.
 */
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
    const appConfigPath = resolve(appsDir, folder, "app.config.ts");
    try {
      readFileSync(appConfigPath);
      apps[folder] = `apps/${folder}/app.config.ts`;
    } catch {
      // Skip folders without app.config.ts
    }
  }

  return apps;
}

export function readAppRegistry(
  cwd: string = process.cwd(),
): AppRegistry & { apps: Record<string, string> } {
  // No legacy RC file is read. Apps are discovered from `apps/` and the
  // single-app convention at `app/app.config.ts` is supported as a fallback.
  const apps = discoverApps(cwd);

  // Ensure single-app convention is included when present
  const appPath = resolve(cwd, "app", "app.config.ts");
  try {
    readFileSync(appPath, "utf-8");
    apps.app = "app/app.config.ts";
  } catch {
    // no single-app layout
  }

  // Prefer explicit `default-fachada` when present for deterministic behaviour;
  // otherwise fall back to the first discovered app.
  const defaultApp = apps["default-fachada"]
    ? "default-fachada"
    : (Object.keys(apps)[0] ?? "default-fachada");

  return { defaultApp, apps } as AppRegistry & { apps: Record<string, string> };
}

/**
 * Resolves an app name to a registered app from the registry.
 * Returns defaultApp if the name is not found.
 */
export function resolveAppName(rawName: string, registry: AppRegistry): string {
  const apps = registry.apps ?? {};
  return rawName in apps ? rawName : registry.defaultApp;
}

// Backwards compatibility: export old name
// Backwards compatibility: keep the previous alias name but do not imply a
// filesystem-backed RC exists — the function now returns the discovered
// registry (no RC file is read).
export const readFachadarc = readAppRegistry;
export type FachadaRc = AppRegistry;

// ─── Plugin ───────────────────────────────────────────────────────────────────

const VIRTUAL_ID = "virtual:fachada/active-app";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

/**
 * Returns a Vite plugin that resolves `virtual:fachada/active-app`.
 *
 * @param activeApp - Override the active app name. When omitted the plugin
 *                    reads APP / PROFILE env vars at load time.
 * @param cwd       - Project root. Defaults to `process.cwd()`.
 */
export function fachadaPlugin(activeApp?: string, cwd: string = process.cwd()) {
  return {
    name: "vite-plugin-fachada",
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id: string) {
      if (id !== RESOLVED_ID) return;

      const registry = readAppRegistry(cwd);
      const rawName = activeApp ?? process.env.APP ?? registry.defaultApp;
      const appName = resolveAppName(rawName, registry);
      const appRelPath = registry.apps[appName];
      const absPath = resolve(cwd, appRelPath);
      const availableApps = JSON.stringify(Object.keys(registry.apps));

      return [
        `export { appConfig } from ${JSON.stringify(absPath)};`,
        `export { profileConfig } from ${JSON.stringify(absPath)};`,
        `export const AVAILABLE_APPS = Object.freeze(${availableApps});`,
        `export const ACTIVE_APP_NAME = ${JSON.stringify(appName)};`,
      ].join("\n");
    },
  };
}
