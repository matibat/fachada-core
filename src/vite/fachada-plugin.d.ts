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
export interface AppRegistry {
    /** App name used when APP env var is absent. */
    defaultApp: string;
    /** Registry: app name → path relative to project root. Optional—auto-discovered if omitted. */
    apps?: Record<string, string>;
}
export declare function readAppRegistry(cwd?: string): AppRegistry & {
    apps: Record<string, string>;
};
/**
 * Resolves an app name to a registered app from the registry.
 * Returns defaultApp if the name is not found.
 */
export declare function resolveAppName(rawName: string, registry: AppRegistry): string;
export declare const readFachadarc: typeof readAppRegistry;
export type FachadaRc = AppRegistry;
/**
 * Returns a Vite plugin that resolves `virtual:fachada/active-app`.
 *
 * @param activeApp - Override the active app name. When omitted the plugin
 *                    reads APP / PROFILE env vars at load time.
 * @param cwd       - Project root. Defaults to `process.cwd()`.
 */
export declare function fachadaPlugin(activeApp?: string, cwd?: string): {
    name: string;
    resolveId(id: string): string | undefined;
    load(id: string): string | undefined;
};
