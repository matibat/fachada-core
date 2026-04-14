/**
 * AppLoader — infrastructure service.
 *
 * Thin adapter over the `virtual:fachada/active-app` virtual module, which is
 * resolved at build time by `vite-plugin-fachada`.
 * The plugin auto-discovers apps from `/apps/` and supports a single-app
 * convention at `app/app.config.ts`.
 *
 * Core domain has zero knowledge of which apps exist — it only ever sees the
 * resolved AppConfig returned by `getActiveAppConfig()`.
 *
 * To add or remove an app, add or remove an `apps/<name>/app.config.ts` file
 * or use a single app layout at `app/app.config.ts`. No changes to this file
 * are needed.
 */

import type { AppConfig } from "../types/app.types";
import {
  appConfig,
  AVAILABLE_APPS,
  ACTIVE_APP_NAME,
} from "virtual:fachada/active-app";

export { AVAILABLE_APPS };

/**
 * Returns the build-time-selected AppConfig. The active app is determined by
 * the `APP` env var at build time. When `APP` is not set the plugin will use
 * the first discovered app from `apps/` or the single-app convention at
 * `app/app.config.ts`.
 */
export function getActiveAppConfig(): AppConfig {
  return appConfig;
}

/**
 * Returns the active app identifier (e.g. "default-fachada").
 * Determined by the APP env var at build time, falling back to defaultApp.
 */
export function getActiveAppName(): string {
  return ACTIVE_APP_NAME;
}
