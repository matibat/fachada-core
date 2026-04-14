#!/usr/bin/env node
/**
 * create-fachada-app — Initialize a new Fachada app with all required boilerplate.
 *
 * Interactive mode (default): prompts for project name, app name, and site URL.
 * CI mode (--ci): uses provided flags and defaults, never prompts.
 *
 * Parameters
 * ----------
 * --name, -n       Package/project name       (default: current directory name)
 * --app-name, -a   First app dir under apps/  (default: same as --name)
 * --site-url       Production site URL         (default: https://example.com)
 * --ci             Non-interactive mode
 * --help, -h       Show help and exit
 *
 * Examples
 * --------
 *   npx create-fachada-app
 *   npx create-fachada-app my-portfolio
 *   npx create-fachada-app --name my-portfolio --site-url https://me.dev
 *   npx create-fachada-app --ci --name my-portfolio --app-name portfolio
 */

import fs from "fs";
import path from "path";
import { createInterface } from "readline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CliOptions {
  name: string | undefined;
  appName: string | undefined;
  siteUrl: string | undefined;
  ci: boolean;
  help: boolean;
}

interface ProjectConfig {
  name: string;
  appName: string;
  siteUrl: string;
}

// ─── Argument parsing ─────────────────────────────────────────────────────────

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    name: undefined,
    appName: undefined,
    siteUrl: undefined,
    ci: false,
    help: false,
  };

  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--name":
      case "-n":
        opts.name = args[++i];
        break;
      case "--app-name":
      case "-a":
        opts.appName = args[++i];
        break;
      case "--site-url":
        opts.siteUrl = args[++i];
        break;
      case "--ci":
        opts.ci = true;
        break;
      case "--help":
      case "-h":
        opts.help = true;
        break;
      default:
        // First positional arg is treated as --name
        if (!arg.startsWith("-") && opts.name === undefined) {
          opts.name = arg;
        }
    }
  }
  return opts;
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function printHelp(): void {
  console.log(`
create-fachada-app — Initialize a new Fachada app

Usage:
  npx create-fachada-app [options]

Options:
  --name,     -n   Package/project name       (default: current directory name)
  --app-name, -a   First app dir under apps/  (default: same as --name)
  --site-url       Production site URL         (default: https://example.com)
  --ci             Non-interactive; use flags + defaults, never prompt
  --help,     -h   Show this help text

Examples:
  npx create-fachada-app
  npx create-fachada-app my-portfolio
  npx create-fachada-app --name my-portfolio --site-url https://me.dev
  npx create-fachada-app --ci --name my-portfolio --app-name portfolio
`);
}

// ─── Interactive prompts (built-in readline, no extra deps) ──────────────────

function ask(
  rl: ReturnType<typeof createInterface>,
  question: string,
): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function collectInteractive(
  opts: CliOptions,
  defaultName: string,
): Promise<ProjectConfig> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const nameAnswer =
      opts.name ?? (await ask(rl, `Project name (${defaultName}): `)).trim();
    const name = nameAnswer || defaultName;

    const appNameDefault = opts.appName ?? name;
    const appNameAnswer =
      opts.appName ??
      (
        await ask(rl, `App name — directory under apps/ (${appNameDefault}): `)
      ).trim();
    const appName = appNameAnswer || appNameDefault;

    const siteUrlDefault = opts.siteUrl ?? "https://example.com";
    const siteUrlAnswer =
      opts.siteUrl ?? (await ask(rl, `Site URL (${siteUrlDefault}): `)).trim();
    const siteUrl = siteUrlAnswer || siteUrlDefault;

    return { name, appName, siteUrl };
  } finally {
    rl.close();
  }
}

function collectCi(opts: CliOptions, defaultName: string): ProjectConfig {
  return {
    name: opts.name ?? defaultName,
    appName: opts.appName ?? opts.name ?? defaultName,
    siteUrl: opts.siteUrl ?? "https://example.com",
  };
}

// ─── Template builders ────────────────────────────────────────────────────────

function buildAstroConfig(siteUrl: string): string {
  return `// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { fachadaIntegration } from "@fachada/core/astro";

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || "${siteUrl}",
  base: process.env.BASE_URL || "/",
  integrations: [
    fachadaIntegration(),
    react(),
    sitemap(),
    tailwind({ applyBaseStyles: false }),
  ],
});
`;
}

function buildPackageJson(name: string): string {
  const pkg = {
    name,
    type: "module",
    version: "0.0.1",
    engines: { node: ">=22.12.0" },
    overrides: { vite: "^7" },
    scripts: {
      dev: "astro dev",
      build: "astro build",
      preview: "astro preview",
      astro: "astro",
      test: "vitest run",
      "test:watch": "vitest",
      "test:ui": "vitest --ui",
      "test:e2e": "playwright test",
      "test:e2e:ui": "playwright test --ui",
    },
    dependencies: {
      "@astrojs/react": "^5.0.3",
      "@astrojs/sitemap": "^3.7.2",
      "@fachada/core": "latest",
      "@types/react": "^19.2.14",
      "@types/react-dom": "^19.2.3",
      astro: "^6.1.5",
      "framer-motion": "^12.38.0",
      react: "^19.2.5",
      "react-dom": "^19.2.5",
      "styled-components": "6",
      zustand: "^5",
    },
    devDependencies: {
      "@astrojs/tailwind": "^6.0.2",
      "@playwright/test": "^1.59.1",
      "@testing-library/dom": "^10.4.1",
      "@testing-library/react": "^16.3.2",
      "@vitest/coverage-v8": "^2.1.8",
      "@vitest/ui": "^2.1.8",
      autoprefixer: "^10.4.27",
      "happy-dom": "^20.8.9",
      postcss: "^8.5.9",
      tailwindcss: "3",
      typescript: "^6.0.2",
      vitest: "^2.1.8",
    },
  };
  return JSON.stringify(pkg, null, 2);
}

function buildTsConfig(): string {
  return JSON.stringify(
    {
      extends: "astro/tsconfigs/strict",
      include: [".astro/types.d.ts", "**/*"],
      exclude: ["dist"],
      compilerOptions: { jsx: "react-jsx", jsxImportSource: "react" },
    },
    null,
    2,
  );
}

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
      },
    },
  },
  plugins: [],
};
`;

const vitestConfig = `import { defineConfig } from "vitest/config";
import { fachadaPlugin } from "@fachada/core/vite";

export default defineConfig({
  plugins: [fachadaPlugin()],
  test: {
    environment: "happy-dom",
    exclude: ["node_modules", "dist", ".astro", "e2e"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "tests/", "e2e/", "coverage/"],
    },
  },
});
`;

const playwrightConfig = `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox",  use: { ...devices["Desktop Firefox"] } },
    { name: "webkit",   use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
`;

const gitignore = `# dependencies
/node_modules/

# production
/dist/
/build/

# testing
/coverage/

# misc
.DS_Store
.env
.env.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# Agent workspace
.agent-workspace/

# Astro
.astro/
`;

// ─── File writing ─────────────────────────────────────────────────────────────

function writeFile(filePath: string, content: string, label: string): void {
  if (fs.existsSync(filePath)) {
    console.log(`  Skipped (exists): ${label}`);
  } else {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✓ Created: ${label}`);
  }
}

function ensureDir(dirPath: string, label: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${label}/`);
  } else {
    console.log(`  Skipped (exists): ${label}/`);
  }
}

// ─── Scaffold ─────────────────────────────────────────────────────────────────

function scaffold(root: string, config: ProjectConfig): void {
  const { name, appName, siteUrl } = config;

  writeFile(
    path.join(root, "astro.config.mjs"),
    buildAstroConfig(siteUrl),
    "astro.config.mjs",
  );
  writeFile(
    path.join(root, "package.json"),
    buildPackageJson(name),
    "package.json",
  );
  writeFile(path.join(root, "tsconfig.json"), buildTsConfig(), "tsconfig.json");
  writeFile(
    path.join(root, "tailwind.config.mjs"),
    tailwindConfig,
    "tailwind.config.mjs",
  );
  writeFile(
    path.join(root, "vitest.config.ts"),
    vitestConfig,
    "vitest.config.ts",
  );
  writeFile(
    path.join(root, "playwright.config.ts"),
    playwrightConfig,
    "playwright.config.ts",
  );
  writeFile(path.join(root, ".gitignore"), gitignore, ".gitignore");
  // Ensure single-app layout dirs exist (no repo RC required)
  ensureDir(path.join(root, "app"), `app`);
  ensureDir(path.join(root, "app", "blog"), `app/blog`);
  ensureDir(path.join(root, "app", "pages"), `app/pages`);
  ensureDir(path.join(root, "e2e"), "e2e");
  ensureDir(path.join(root, "public"), "public");
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const opts = parseArgs(process.argv);

  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  const projectRoot = process.cwd();
  const defaultName = path.basename(projectRoot);

  console.log("\n🚀 Initializing Fachada app...\n");

  let config: ProjectConfig;
  if (opts.ci) {
    config = collectCi(opts, defaultName);
    console.log(`  Mode: CI (non-interactive)`);
    console.log(`  Name: ${config.name}`);
    console.log(`  App:  ${config.appName}`);
    console.log(`  URL:  ${config.siteUrl}\n`);
  } else {
    config = await collectInteractive(opts, defaultName);
    console.log();
  }

  scaffold(projectRoot, config);

  console.log(`
✅ Fachada app "${config.name}" initialized successfully!

Next steps:
  1. npm install   (or: yarn install / pnpm install)
  2. Add content to apps/${config.appName}/:
       app.config.ts     — app metadata and theme
       site.config.ts    — site-wide settings
       profile.config.ts — personal/professional profile
       blog/             — blog posts (optional)
       pages/            — custom pages (optional)
  3. npm run dev
`);
}

main().catch((err) => {
  console.error("❌ Error initializing Fachada app:", err);
  process.exit(1);
});
