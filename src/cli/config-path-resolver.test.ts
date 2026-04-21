/**
 * Config Path Resolver tests — CLI utility
 *
 * Tests resolution priority and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  resolveConfigPath,
  getConfigPathArg,
  configExists,
  DEFAULT_CONFIG_FILENAME,
  CONFIG_ENV_VAR,
} from "./config-path-resolver";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const testDir = import.meta.dirname;

// ─── Scenario 1: Explicit --config-path flag has highest priority ──────────

describe("Scenario 1: Explicit --config-path flag has highest priority", () => {
  it("Given: explicit configPath, When: resolved, Then: returns that path from flag source", () => {
    const result = resolveConfigPath({
      configPath: "./custom.yaml",
      cwd: testDir,
      validateExists: false,
    });

    expect(result.source).toBe("flag");
    expect(result.displayPath).toBe("./custom.yaml");
    expect(result.absolutePath).toContain("custom.yaml");
  });

  it("Given: absolute configPath, When: resolved, Then: uses it as-is", () => {
    const absPath = "/tmp/config.yaml";
    const result = resolveConfigPath({
      configPath: absPath,
      validateExists: false,
    });

    expect(result.absolutePath).toBe(absPath);
  });
});

// ─── Scenario 2: Environment variable is second priority ──────────────────────

describe("Scenario 2: Environment variable is second priority", () => {
  beforeEach(() => {
    vi.stubEnv(CONFIG_ENV_VAR, "./app.yaml");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("Given: FACHADA_CONFIG set, When: resolved (no flag), Then: returns env var path", () => {
    const result = resolveConfigPath({
      cwd: testDir,
      validateExists: false,
    });

    expect(result.source).toBe("env");
    expect(result.displayPath).toContain("app.yaml");
  });

  it("Given: both flag and env set, When: resolved, Then: flag takes priority", () => {
    const result = resolveConfigPath({
      configPath: "./flag.yaml",
      cwd: testDir,
      validateExists: false,
    });

    expect(result.source).toBe("flag");
    expect(result.displayPath).toBe("./flag.yaml");
  });
});

// ─── Scenario 3: Default ./application.yaml is lowest priority ───────────────

describe("Scenario 3: Default ./application.yaml is lowest priority", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("Given: no flag, no env, When: resolved, Then: returns default path", () => {
    const result = resolveConfigPath({
      cwd: testDir,
      validateExists: false,
    });

    expect(result.source).toBe("default");
    expect(result.displayPath).toBe(`./${DEFAULT_CONFIG_FILENAME}`);
  });
});

// ─── Scenario 4: File validation ──────────────────────────────────────────────

describe("Scenario 4: File validation", () => {
  it("Given: validateExists=true, file missing, When: resolved, Then: throws error", () => {
    expect(() => {
      resolveConfigPath({
        configPath: "/nonexistent/config.yaml",
        validateExists: true,
      });
    }).toThrow();
  });

  it("Given: validateExists=false, When: resolved, Then: skips validation", () => {
    const result = resolveConfigPath({
      configPath: "/nonexistent/config.yaml",
      validateExists: false,
    });

    expect(result.absolutePath).toContain("nonexistent");
  });
});

// ─── Scenario 5: configExists utility ─────────────────────────────────────────

describe("Scenario 5: configExists utility", () => {
  it("Given: valid path, When: checked, Then: returns true", () => {
    // Use __filename which definitely exists
    const exists = configExists({
      configPath: __filename,
      validateExists: true,
    });

    expect(exists).toBe(true);
  });

  it("Given: invalid path, When: checked, Then: returns false (never throws)", () => {
    const exists = configExists({
      configPath: "/nonexistent/file.yaml",
    });

    expect(exists).toBe(false);
  });
});

// ─── Scenario 6: getConfigPathArg parsing ──────────────────────────────────────

describe("Scenario 6: getConfigPathArg parsing", () => {
  it("Given: --config-path in argv, When: parsed, Then: returns next arg", () => {
    const argv = ["node", "script.js", "--config-path", "./app.yaml", "--ci"];
    const result = getConfigPathArg(argv);

    expect(result).toBe("./app.yaml");
  });

  it("Given: --config alias in argv, When: parsed, Then: returns next arg", () => {
    const argv = ["node", "script.js", "--config", "./config.yaml"];
    const result = getConfigPathArg(argv);

    expect(result).toBe("./config.yaml");
  });

  it("Given: no config flag in argv, When: parsed, Then: returns undefined", () => {
    const argv = ["node", "script.js", "--name", "my-app"];
    const result = getConfigPathArg(argv);

    expect(result).toBeUndefined();
  });

  it("Given: default argv (empty), When: parsed, Then: returns undefined", () => {
    const result = getConfigPathArg([]);

    expect(result).toBeUndefined();
  });
});

// ─── Scenario 7: Error messages are helpful ────────────────────────────────────

describe("Scenario 7: Error messages are helpful", () => {
  it("Given: file not found via flag, When: error thrown, Then: message shows flag context", () => {
    expect(() => {
      resolveConfigPath({
        configPath: "/missing.yaml",
        validateExists: true,
      });
    }).toThrow(/Provided via --config-path flag/);
  });

  it("Given: file not found via env, When: error thrown, Then: message shows env var", () => {
    vi.stubEnv(CONFIG_ENV_VAR, "/missing.yaml");
    try {
      expect(() => {
        resolveConfigPath({
          validateExists: true,
        });
      }).toThrow(CONFIG_ENV_VAR);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("Given: file not found default, When: error thrown, Then: message explains all 3 options", () => {
    vi.unstubAllEnvs();
    expect(() => {
      resolveConfigPath({
        validateExists: true,
      });
    }).toThrow(/--config-path|environment variable|application.yaml/);
  });
});
