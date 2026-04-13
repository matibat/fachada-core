/**
 * vite-plugin-fachada — build-time app selection via .fachadarc.json.
 *
 * Provides the virtual module `virtual:fachada/active-app` which exports:
 *   - `appConfig`     — the build-time-selected AppConfig
 *   - `AVAILABLE_APPS` — frozen array of all app names from .fachadarc.json
 *
 * The active app is resolved in priority order:
 *   1. `activeApp` argument passed to `fachadaPlugin()`
 *   2. `APP` environment variable
 *   3. `defaultApp` field from .fachadarc.json
 *
 * Usage: APP=app-name yarn dev
 *        APP=app-name yarn build
 *
 * Adding a new app: create `apps/<name>/app.config.ts`, add one entry to
 * `.fachadarc.json`. No changes to core code required.
 */

import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FachadaRc {
  /** App name used when APP / PROFILE env vars are absent. */
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

export function readFachadarc(
  cwd: string = process.cwd(),
): FachadaRc & { apps: Record<string, string> } {
  const path = resolve(cwd, ".fachadarc.json");
  const config = JSON.parse(readFileSync(path, "utf-8")) as FachadaRc;

  // Auto-discover apps if not explicitly provided
  if (!config.apps || Object.keys(config.apps).length === 0) {
    config.apps = discoverApps(cwd);
  }

  return config as FachadaRc & { apps: Record<string, string> };
}

/**
 * Resolves an app name to a registered app from the registry.
 * Returns defaultApp if the name is not found.
 */
export function resolveAppName(rawName: string, fachadarc: FachadaRc): string {
  return rawName in fachadarc.apps ? rawName : fachadarc.defaultApp;
}

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

      const fachadarc = readFachadarc(cwd);
      const rawName = activeApp ?? process.env.APP ?? fachadarc.defaultApp;
      const appName = resolveAppName(rawName, fachadarc);
      const appRelPath = fachadarc.apps[appName];
      const absPath = resolve(cwd, appRelPath);
      const availableApps = JSON.stringify(Object.keys(fachadarc.apps));

      return [
        `export { appConfig } from ${JSON.stringify(absPath)};`,
        `export { profileConfig } from ${JSON.stringify(absPath)};`,
        `export const AVAILABLE_APPS = Object.freeze(${availableApps});`,
        `export const ACTIVE_APP_NAME = ${JSON.stringify(appName)};`,
      ].join("\n");
    },
  };
}
