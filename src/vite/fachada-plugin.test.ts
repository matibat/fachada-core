import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  readAppRegistry,
  resolveAppName,
  fachadaPlugin,
} from "./fachada-plugin";

function makeTempDir(name: string): string {
  const dir = join(tmpdir(), `fachada-plugin-${name}-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe("Scenario 1: App discovery uses TypeScript app.config.ts", () => {
  it("Given apps/<name>/app.config.ts exists, When readAppRegistry is called, Then app is discovered", () => {
    const cwd = makeTempDir("registry-apps");
    const appDir = join(cwd, "apps", "demo");
    mkdirSync(appDir, { recursive: true });
    writeFileSync(
      join(appDir, "app.config.ts"),
      "export const appConfig = { seo: { title: 'Demo' }, theme: {}, themeVariants: {}, assets: { ogImage: '/og.png' }, page: { sections: [] } };\n",
      "utf-8",
    );

    const registry = readAppRegistry(cwd);

    expect(registry.apps).toHaveProperty("demo", "apps/demo");
    expect(resolveAppName("demo", registry)).toBe("demo");
  });
});

describe("Scenario 2: Single app fallback uses app/app.config.ts", () => {
  it("Given app/app.config.ts exists, When readAppRegistry is called, Then app alias is discovered", () => {
    const cwd = makeTempDir("registry-single");
    const appDir = join(cwd, "app");
    mkdirSync(appDir, { recursive: true });
    writeFileSync(
      join(appDir, "app.config.ts"),
      "export const appConfig = { seo: { title: 'Single' }, theme: {}, themeVariants: {}, assets: { ogImage: '/og.png' }, page: { sections: [] } };\n",
      "utf-8",
    );

    const registry = readAppRegistry(cwd);

    expect(registry.apps).toHaveProperty("app", "app");
  });
});

describe("Scenario 3: Virtual module references TypeScript app config", () => {
  it("Given app/app.config.ts exists, When plugin load hook resolves virtual module, Then returned module imports app.config.ts", () => {
    const cwd = makeTempDir("virtual-module");
    const appDir = join(cwd, "app");
    mkdirSync(appDir, { recursive: true });
    writeFileSync(
      join(appDir, "app.config.ts"),
      "export const appConfig = { seo: { title: 'Single' }, theme: {}, themeVariants: {}, assets: { ogImage: '/og.png' }, page: { sections: [] } };\n",
      "utf-8",
    );

    const plugin = fachadaPlugin(undefined, cwd);
    plugin.buildStart();

    const id = plugin.resolveId("virtual:fachada/active-app");
    const code = plugin.load(id as string) as string;

    expect(code).toContain("app.config.ts");
    expect(code).toContain("export const ACTIVE_APP_NAME");
  });
});
