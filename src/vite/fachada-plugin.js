/**
 * vite-plugin-fachada — build-time app selection and virtual-module generator.
 *
 * Provides the virtual module `virtual:fachada/active-app` which exports:
 *   - `appConfig`     — the build-time-selected AppConfig loaded from YAML
 *   - `AVAILABLE_APPS` — frozen array of discovered app names
 *
 * The active app is resolved in priority order:
 *   1. `activeApp` argument passed to `fachadaPlugin()`
 *   2. `APP` environment variable
 *   3. First discovered app from `apps/` or the single-app fallback at `app/`
 *
 * YAML Loading Pattern:
 *   - Single-file: `app/application.yaml` with complete AppConfig
 *   - Modular: `app/site.yaml`, `app/profile.yaml`, etc. that merge (in lexical order)
 *   - Fallback: Single-app at `app/` (uses first YAML file found)
 *
 * Usage: APP=app-name yarn dev
 *        APP=app-name yarn build
 *
 * Adding a new app: create `apps/<name>/application.yaml` (or modular site.yaml + profile.yaml)
 * or use a single app at `app/application.yaml`. The plugin auto-discovers `apps/` and will
 * prefer the `APP` env var or the discovered default when provided.
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve } from "path";
import YAML from "yaml";
// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Deep merge objects. Later keys override earlier ones. Arrays are replaced, not merged.
 */
function deepMerge(target, source) {
    if (!source || typeof source !== "object") {
        return source;
    }
    if (!target || typeof target !== "object") {
        return source;
    }
    if (Array.isArray(source)) {
        return source;
    }
    const result = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            result[key] = deepMerge(result[key], source[key]);
        }
    }
    return result;
}
/**
 * Load YAML configuration from app directory.
 * Supports two patterns:
 *   1. Single-file: application.yaml
 *   2. Modular: site.yaml, profile.yaml, etc. (merged in lexical order)
 *
 * @param appDir - absolute path to app directory (e.g., /path/to/app or /path/to/apps/myapp)
 * @returns parsed configuration object
 * @throws error if no YAML files found or parsing fails
 */
function loadYamlConfig(appDir) {
    const configPath = resolve(appDir, "application.yaml");
    // Try single-file pattern first
    if (existsSync(configPath)) {
        try {
            const content = readFileSync(configPath, "utf-8");
            return YAML.parse(content);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new Error(`Failed to parse application.yaml in ${appDir}: ${msg}`);
        }
    }
    // Fall back to modular pattern: load all *.yaml files and merge
    let files = [];
    try {
        files = readdirSync(appDir)
            .filter((f) => f.endsWith(".yaml") &&
            !f.startsWith(".") &&
            f !== "application.yaml")
            .sort(); // lexical order for deterministic merging
    }
    catch {
        throw new Error(`No YAML configuration found in ${appDir}`);
    }
    if (files.length === 0) {
        throw new Error(`No YAML files (application.yaml or modular *.yaml) found in ${appDir}`);
    }
    let config = {};
    for (const file of files) {
        try {
            const content = readFileSync(resolve(appDir, file), "utf-8");
            const partial = YAML.parse(content);
            config = deepMerge(config, partial);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new Error(`Failed to parse ${file} in ${appDir}: ${msg}`);
        }
    }
    return config;
}
/**
 * Serialize a JavaScript object to code that recreates it.
 * Handles nested objects, arrays, strings, numbers, booleans, null.
 */
function serializeConfig(config) {
    return JSON.stringify(config);
}
/**
 * Auto-discovers apps from the apps/ folder by looking for YAML files.
 * Supports application.yaml (single-file) or modular *.yaml files.
 */
function discoverApps(cwd) {
    const appsDir = resolve(cwd, "apps");
    let appFolders = [];
    try {
        appFolders = readdirSync(appsDir);
    }
    catch {
        return {};
    }
    const apps = {};
    for (const folder of appFolders) {
        const appPath = resolve(appsDir, folder);
        const configPath = resolve(appPath, "application.yaml");
        // Check for single-file pattern first
        if (existsSync(configPath)) {
            apps[folder] = `apps/${folder}`;
            continue;
        }
        // Check for modular pattern: any *.yaml files
        try {
            const files = readdirSync(appPath).filter((f) => f.endsWith(".yaml") &&
                !f.startsWith(".") &&
                f !== "application.yaml");
            if (files.length > 0) {
                apps[folder] = `apps/${folder}`;
            }
        }
        catch {
            // Skip folders without YAML
        }
    }
    return apps;
}
export function readAppRegistry(cwd = process.cwd()) {
    // No legacy RC file is read. Apps are discovered from `apps/` and the
    // single-app convention at `app/` is supported as a fallback.
    const apps = discoverApps(cwd);
    // Ensure single-app convention is included when present (YAML files in app/)
    const appPath = resolve(cwd, "app");
    let hasAppConfig = false;
    // Check for application.yaml first
    if (existsSync(resolve(appPath, "application.yaml"))) {
        hasAppConfig = true;
    }
    else {
        // Check for modular YAML files
        try {
            const files = readdirSync(appPath).filter((f) => f.endsWith(".yaml") &&
                !f.startsWith(".") &&
                f !== "application.yaml");
            if (files.length > 0) {
                hasAppConfig = true;
            }
        }
        catch {
            // no app/ directory
        }
    }
    if (hasAppConfig) {
        apps.app = "app";
    }
    // Prefer explicit `default-fachada` when present for deterministic behaviour;
    // otherwise fall back to the first discovered app.
    const defaultApp = apps["default-fachada"]
        ? "default-fachada"
        : (Object.keys(apps)[0] ?? "default-fachada");
    return { defaultApp, apps };
}
/**
 * Resolves an app name to a registered app from the registry.
 * Returns defaultApp if the name is not found.
 */
export function resolveAppName(rawName, registry) {
    const apps = registry.apps ?? {};
    return rawName in apps ? rawName : registry.defaultApp;
}
// Backwards compatibility: export old name
// Backwards compatibility: keep the previous alias name but do not imply a
// filesystem-backed RC exists — the function now returns the discovered
// registry (no RC file is read).
export const readFachadarc = readAppRegistry;
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
export function fachadaPlugin(activeApp, cwd = process.cwd()) {
    return {
        name: "vite-plugin-fachada",
        resolveId(id) {
            if (id === VIRTUAL_ID)
                return RESOLVED_ID;
        },
        load(id) {
            if (id !== RESOLVED_ID)
                return;
            const registry = readAppRegistry(cwd);
            const rawName = activeApp ?? process.env.APP ?? registry.defaultApp;
            const appName = resolveAppName(rawName, registry);
            const appRelPath = registry.apps[appName];
            if (appRelPath === undefined) {
                throw new Error(`DEBUG: appRelPath is undefined. activeApp=${activeApp}, rawName=${rawName}, appName=${appName}, registry=${JSON.stringify(registry)}`);
            }
            const absPath = resolve(cwd, appRelPath);
            // Load configuration from YAML
            let appConfig;
            try {
                appConfig = loadYamlConfig(absPath);
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                throw new Error(`Failed to load config for app '${appName}': ${msg}`);
            }
            const availableApps = JSON.stringify(Object.keys(registry.apps));
            const serializedConfig = serializeConfig(appConfig);
            return [
                `export const appConfig = ${serializedConfig};`,
                `export const profileConfig = ${serializedConfig};`,
                `export const AVAILABLE_APPS = Object.freeze(${availableApps});`,
                `export const ACTIVE_APP_NAME = ${JSON.stringify(appName)};`,
            ].join("\n");
        },
    };
}
