/**
 * vite-plugin-fachada — build-time app selection and virtual-module generator.
 *
 * TS-only configuration model (breaking change):
 *   - Multi-app: apps/<name>/app.config.ts
 *   - Single-app: app/app.config.ts
 */

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { resolve } from "path";

export interface AppRegistry {
  defaultApp: string;
  apps: Record<string, string>;
}

function hasTsAppConfig(dir: string): boolean {
  return existsSync(resolve(dir, "app.config.ts"));
}

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
    if (hasTsAppConfig(appPath)) {
      apps[folder] = `apps/${folder}`;
    }
  }
  return apps;
}

export function readAppRegistry(cwd: string = process.cwd()): AppRegistry {
  const apps = discoverApps(cwd);

  const singleAppDir = resolve(cwd, "app");
  if (hasTsAppConfig(singleAppDir)) {
    apps.app = "app";
  }

  const appNames = Object.keys(apps);
  const defaultApp = apps["default-fachada"]
    ? "default-fachada"
    : (appNames[0] ?? "app");

  return { defaultApp, apps };
}

export function resolveAppName(rawName: string, registry: AppRegistry): string {
  return rawName in registry.apps ? rawName : registry.defaultApp;
}

export const readFachadarc = readAppRegistry;
export type FachadaRc = AppRegistry;

function profileDerivationSnippet(sourceApp = "__appConfig"): string {
  return [
    `const __sectionsFromPage = Array.isArray((${sourceApp})?.page?.sections)`,
    `  ? (${sourceApp}).page.sections.map((section) => ({`,
    `      id: section.id,`,
    `      enabled: section.enabled,`,
    `      order: section.order,`,
    `      ...(section.requiresRole !== undefined ? { requiresRole: section.requiresRole } : {}),`,
    `      ...(section.requiresContent !== undefined ? { requiresContent: section.requiresContent } : {}),`,
    `      ...(section.layout !== undefined ? { layout: section.layout } : {}),`,
    `      ...(section.background !== undefined ? { background: section.background } : {}),`,
    `      ...(section.backgroundColor !== undefined ? { backgroundColor: section.backgroundColor } : {}),`,
    `      ...(section.fullWidth !== undefined ? { fullWidth: section.fullWidth } : {}),`,
    `    }))`,
    `  : [];`,
    ``,
    `export const profileConfig = __profileConfig ?? {`,
    `  theme: (${sourceApp}).theme,`,
    `  about: (${sourceApp}).about ?? { paragraphs: ["", "", ""] },`,
    `  skills: (${sourceApp}).skills ?? [],`,
    `  sections: (${sourceApp}).sections ?? __sectionsFromPage,`,
    `  ...((${sourceApp}).contactMessage !== undefined`,
    `    ? { contactMessage: (${sourceApp}).contactMessage }`,
    `    : {}),`,
    `  ...((${sourceApp}).multiRoleDisplay !== undefined`,
    `    ? { multiRoleDisplay: (${sourceApp}).multiRoleDisplay }`,
    `    : {}),`,
    `};`,
  ].join("\n");
}

export function generateBridgeFiles(
  config: {
    configPath: string;
    availableApps: string[];
    activeAppName: string;
  },
  cwd: string = process.cwd(),
): void {
  const genDir = resolve(cwd, ".fachada", "generated");
  mkdirSync(genDir, { recursive: true });

  const content = [
    `// AUTO-GENERATED — DO NOT EDIT`,
    `// Source: app/app.config.ts or apps/<name>/app.config.ts`,
    `// Regenerated at build time by vite-plugin-fachada.`,
    ``,
    `import { appConfig as __appConfig, profileConfig as __profileConfig } from ${JSON.stringify(config.configPath)};`,
    ``,
    `export const appConfig = __appConfig;`,
    profileDerivationSnippet("__appConfig"),
    ``,
    `export const AVAILABLE_APPS = Object.freeze(${JSON.stringify(config.availableApps)}) as readonly string[];`,
    ``,
    `export const ACTIVE_APP_NAME = ${JSON.stringify(config.activeAppName)};`,
  ].join("\n");

  writeFileSync(resolve(genDir, "app.ts"), content, "utf-8");
}

const VIRTUAL_ID = "virtual:fachada/active-app";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

interface CachedModule {
  moduleCode: string;
  configPath: string;
  availableApps: string[];
  activeAppName: string;
}

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
          `Add app/app.config.ts or apps/<name>/app.config.ts.`,
      );
    }

    const configPath = resolve(cwd, appRelPath, "app.config.ts");
    const availableApps = Object.keys(registry.apps);

    const moduleCode = [
      `import { appConfig as __appConfig, profileConfig as __profileConfig } from ${JSON.stringify(configPath)};`,
      `export const appConfig = __appConfig;`,
      profileDerivationSnippet("__appConfig"),
      `export const AVAILABLE_APPS = Object.freeze(${JSON.stringify(availableApps)});`,
      `export const ACTIVE_APP_NAME = ${JSON.stringify(appName)};`,
    ].join("\n");

    return {
      moduleCode,
      configPath,
      availableApps,
      activeAppName: appName,
    };
  }

  return {
    name: "vite-plugin-fachada",

    buildStart() {
      cached = buildModule();
      generateBridgeFiles(cached, cwd);
    },

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
        cached = buildModule();
        generateBridgeFiles(cached, cwd);
      }

      return cached.moduleCode;
    },
  };
}
