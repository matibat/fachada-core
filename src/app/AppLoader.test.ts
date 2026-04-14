/**
 * AppLoader — BDD unit tests
 *
 * `virtual:fachada/active-app` is a Vite virtual module that does not exist
 * in the fachada-core package itself. It MUST be mocked before AppLoader is
 * imported so that the module resolver never attempts to call the real plugin.
 *
 * vi.mock is hoisted by Vitest to the top of the file regardless of where it
 * appears in source order — this means the mock is registered before any
 * import statement executes.
 */
import { describe, it, expect } from "vitest";

// ── Virtual module mock — MUST precede AppLoader import ───────────────────────
vi.mock("virtual:fachada/active-app", () => ({
  appConfig: {
    seo: { name: "Test App", url: "https://test.dev" },
    theme: { style: "minimalist", colorMode: "auto" },
    page: { sections: [] },
    profile: {},
    siteTree: {
      landing: {
        meta: { path: "/", title: "Home", description: "Home page." },
        sections: [],
      },
    },
  },
  AVAILABLE_APPS: Object.freeze(["test-app"]),
  ACTIVE_APP_NAME: "test-app",
}));

import {
  getActiveAppConfig,
  getActiveAppName,
  AVAILABLE_APPS,
} from "./AppLoader";

// ─── Scenario 1: getActiveAppConfig returns the mocked AppConfig ──────────────

describe("Scenario 1: getActiveAppConfig returns the build-time AppConfig from virtual module", () => {
  it(
    "Given: the virtual module provides a valid config, " +
      "When: getActiveAppConfig() is called, " +
      "Then: it returns an AppConfig with the expected seo fields",
    () => {
      const config = getActiveAppConfig();
      expect(config.seo.name).toBe("Test App");
      expect(config.seo.url).toBe("https://test.dev");
    },
  );

  it(
    "Given: the virtual module provides a valid config, " +
      "When: getActiveAppConfig() is called twice, " +
      "Then: it returns the same reference each time",
    () => {
      expect(getActiveAppConfig()).toBe(getActiveAppConfig());
    },
  );
});

// ─── Scenario 2: AVAILABLE_APPS is frozen and populated ──────────────────────

describe("Scenario 2: AVAILABLE_APPS is a frozen read-only registry", () => {
  it(
    "Given: the virtual module exports AVAILABLE_APPS, " +
      "When: it is accessed, " +
      "Then: it contains the mocked app name",
    () => {
      expect(AVAILABLE_APPS).toContain("test-app");
    },
  );

  it(
    "Given: AVAILABLE_APPS is frozen, " +
      "When: code attempts to push a new entry, " +
      "Then: a TypeError is thrown",
    () => {
      expect(() => (AVAILABLE_APPS as string[]).push("hacked")).toThrow();
    },
  );
});

// ─── Scenario 3: getActiveAppName returns the active app identifier ───────────

describe("Scenario 3: getActiveAppName returns the ACTIVE_APP_NAME from the virtual module", () => {
  it(
    'Given: the virtual module sets ACTIVE_APP_NAME to "test-app", ' +
      "When: getActiveAppName() is called, " +
      'Then: it returns "test-app"',
    () => {
      expect(getActiveAppName()).toBe("test-app");
    },
  );
});
