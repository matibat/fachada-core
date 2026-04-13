/**
 * AppLoader — infrastructure service.
 *
 * Thin adapter over the `virtual:fachada/active-app` virtual module, which is
 * resolved at build time by vite-plugin-fachada reading `.fachadarc.json`.
 *
 * Core domain has zero knowledge of which apps exist — it only ever sees the
 * resolved AppConfig returned by `getActiveAppConfig()`.
 *
 * To add or remove an app, edit `.fachadarc.json`. No changes to this file
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
 * Returns the build-time-selected AppConfig.
 * The active app is determined by the APP (or legacy PROFILE) env var at build
 * time, falling back to the `defaultApp` in `.fachadarc.json`.
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
