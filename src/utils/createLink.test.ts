/**
 * createLink — BDD unit tests for getBaseUrl.
 *
 * getBaseUrl builds internal href strings relative to BASE_URL.
 * BASE_URL defaults to "/" in the test environment.
 *
 * Behaviours under test:
 *   1. No path argument → returns the base as-is.
 *   2. Path is joined to base without duplicate slashes.
 *   3. Path with a leading slash is handled correctly.
 *   4. Path without a leading slash receives one.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { getBaseUrl } from "./createLink";

afterEach(() => {
  vi.unstubAllEnvs();
});

// ─── Scenario 1: no path — returns base as-is ────────────────────────────────

describe("getBaseUrl — no path argument", () => {
  it("Given BASE_URL is '/', When called with no path, Then returns '/'", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getBaseUrl()).toBe("/");
  });

  it("Given BASE_URL is '/portfolio/', When called with no path, Then returns '/portfolio/'", () => {
    vi.stubEnv("BASE_URL", "/portfolio/");
    expect(getBaseUrl()).toBe("/portfolio/");
  });
});

// ─── Scenario 2: path with leading slash — no duplicate slashes ───────────────

describe("getBaseUrl — path with a leading slash", () => {
  it("Given BASE_URL '/' and path '/about', When called, Then returns '/about'", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getBaseUrl("/about")).toBe("/about");
  });

  it("Given BASE_URL '/portfolio/' and path '/projects', When called, Then returns '/portfolio/projects'", () => {
    vi.stubEnv("BASE_URL", "/portfolio/");
    expect(getBaseUrl("/projects")).toBe("/portfolio/projects");
  });
});

// ─── Scenario 3: path without leading slash — slash is added ─────────────────

describe("getBaseUrl — path without a leading slash", () => {
  it("Given BASE_URL '/' and path 'contact', When called, Then returns '/contact'", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getBaseUrl("contact")).toBe("/contact");
  });

  it("Given BASE_URL '/portfolio/' and path 'work', When called, Then returns '/portfolio/work'", () => {
    vi.stubEnv("BASE_URL", "/portfolio/");
    expect(getBaseUrl("work")).toBe("/portfolio/work");
  });
});
