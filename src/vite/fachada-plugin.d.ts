/**
 * vite-plugin-fachada — build-time app selection and virtual-module generator.
 *
 * TS-only configuration model:
 *   - Multi-app: `apps/<name>/app.config.ts`
 *   - Single-app: `app/app.config.ts`
 */
export interface AppRegistry {
  /** App name used when APP env var is absent. */
  defaultApp: string;
  /** Registry: app name -> path relative to project root. */
  apps: Record<string, string>;
}
export declare function readAppRegistry(cwd?: string): AppRegistry;
/**
 * Resolves an app name to a registered app from the registry.
 * Returns defaultApp if the name is not found.
 */
export declare function resolveAppName(
  rawName: string,
  registry: AppRegistry,
): string;
export declare const readFachadarc: typeof readAppRegistry;
export type FachadaRc = AppRegistry;
export declare function generateBridgeFiles(
  config: {
    configPath: string;
    availableApps: string[];
    activeAppName: string;
  },
  cwd?: string,
): void;
/**
 * Returns a Vite plugin that resolves `virtual:fachada/active-app`.
 */
export declare function fachadaPlugin(
  activeApp?: string,
  cwd?: string,
): {
  name: string;
  buildStart(): void;
  configureServer(): void;
  resolveId(id: string): string | undefined;
  load(id: string): string | undefined;
};
