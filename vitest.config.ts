import { defineConfig } from "vitest/config";
import path from "path";
import type { Plugin } from "vite";

/**
 * Minimal stub plugin so Vite's import-analysis can resolve
 * `virtual:fachada/active-app` during tests.  The real values
 * are always overridden by `vi.mock(...)` in AppLoader.test.ts.
 */
function virtualFachadaActiveApp(): Plugin {
  const VIRTUAL_ID = "virtual:fachada/active-app";
  const RESOLVED_ID = "\0" + VIRTUAL_ID;
  return {
    name: "virtual-fachada-active-app-stub",
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id: string) {
      if (id === RESOLVED_ID) {
        return [
          "export const appConfig = {};",
          "export const AVAILABLE_APPS = Object.freeze([]);",
          "export const ACTIVE_APP_NAME = '';",
        ].join("\n");
      }
    },
  };
}

export default defineConfig({
  plugins: [virtualFachadaActiveApp()],
  resolve: {
    alias: {
      "@fachada/core": path.resolve("./src"),
      "styled-components": path.resolve(
        "./src/__mocks__/styled-components.tsx",
      ),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["node_modules", "dist", "**/*.d.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.config.*",
        "**/*.d.ts",
        // Astro components/layouts/pages — not unit-testable; covered by E2E
        "src/astro/**",
        // Pure TypeScript type declarations — no executable statements
        "src/types/**",
        // Vite plugin — build infrastructure, not unit-testable
        "src/vite/**",
        // CLI entry point — requires file system / interactive context
        "src/cli/**",
        // Test mock helpers
        "src/__mocks__/**",
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
