/**
 * theme.utils BDD test suite
 *
 * Tests pure theme utility functions with dependency injection.
 * matchMedia is stubbed via vi.stubGlobal; storage is implemented as a plain object.
 * No imports from fachada repo root or app-specific paths.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  validateColorMode,
  validateThemeStyle,
  getSystemPreference,
  readFromStorage,
  writeToStorage,
} from "./theme.utils";
import type { ThemeDependencies } from "./theme.types";

// ─── Storage factory ──────────────────────────────────────────────────────────

function makeMockStorage(): {
  storage: Storage;
  store: Record<string, string>;
} {
  const store: Record<string, string> = {};
  const storage: Storage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
  return { storage, store };
}

// ─── Global stub lifecycle ────────────────────────────────────────────────────

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── Scenario 1: validateColorMode ────────────────────────────────────────────

describe("Given the validateColorMode utility", () => {
  it("When called with 'light', Then returns success with value 'light'", () => {
    const result = validateColorMode("light");
    expect(result.success).toBe(true);
    expect(result.value).toBe("light");
  });

  it("When called with 'dark', Then returns success with value 'dark'", () => {
    const result = validateColorMode("dark");
    expect(result.success).toBe(true);
    expect(result.value).toBe("dark");
  });

  it("When called with 'auto', Then returns success with value 'auto'", () => {
    const result = validateColorMode("auto");
    expect(result.success).toBe(true);
    expect(result.value).toBe("auto");
  });

  it("When called with an invalid string, Then returns failure with INVALID_THEME error code", () => {
    const result = validateColorMode("invalid");
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_THEME");
  });

  it("When called with null, undefined, or a number, Then returns failure for each", () => {
    expect(validateColorMode(null).success).toBe(false);
    expect(validateColorMode(undefined).success).toBe(false);
    expect(validateColorMode(42).success).toBe(false);
  });
});

// ─── Scenario 2: validateThemeStyle ───────────────────────────────────────────

describe("Given the validateThemeStyle utility", () => {
  it("When called with 'minimalist', Then returns success with value 'minimalist'", () => {
    const result = validateThemeStyle("minimalist");
    expect(result.success).toBe(true);
    expect(result.value).toBe("minimalist");
  });

  it("When called with 'modern-tech', Then returns success with value 'modern-tech'", () => {
    const result = validateThemeStyle("modern-tech");
    expect(result.success).toBe(true);
    expect(result.value).toBe("modern-tech");
  });

  it("When called with an unknown style, Then returns failure with INVALID_STYLE error code", () => {
    const result = validateThemeStyle("nonexistent-style");
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_STYLE");
  });

  it("When called with null or empty string, Then returns failure", () => {
    expect(validateThemeStyle(null).success).toBe(false);
    expect(validateThemeStyle("").success).toBe(false);
  });
});

// ─── Scenario 3: getSystemPreference via matchMedia ───────────────────────────

describe("Given the getSystemPreference utility with matchMedia", () => {
  it("When matchMedia reports dark mode preference, Then returns 'dark'", () => {
    const deps: ThemeDependencies = {
      window: {
        matchMedia: vi.fn(() => ({
          matches: true, // dark mode active
          media: "(prefers-color-scheme: dark)",
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
          onchange: null,
        })) as unknown as (query: string) => MediaQueryList,
      },
    };

    const result = getSystemPreference(deps);
    expect(result.success).toBe(true);
    expect(result.value).toBe("dark");
  });

  it("When matchMedia reports light mode preference (matches=false), Then returns 'light'", () => {
    const deps: ThemeDependencies = {
      window: {
        matchMedia: vi.fn(() => ({
          matches: false,
          media: "(prefers-color-scheme: dark)",
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
          onchange: null,
        })) as unknown as (query: string) => MediaQueryList,
      },
    };

    const result = getSystemPreference(deps);
    expect(result.success).toBe(true);
    expect(result.value).toBe("light");
  });

  it("When window is undefined (SSR context), Then returns 'light' as safe default", () => {
    const result = getSystemPreference({ window: undefined });
    expect(result.success).toBe(true);
    expect(result.value).toBe("light");
  });

  it("When matchMedia is undefined on window, Then returns 'light' as safe default", () => {
    const result = getSystemPreference({ window: { matchMedia: undefined } });
    expect(result.success).toBe(true);
    expect(result.value).toBe("light");
  });

  it("When matchMedia throws an error, Then gracefully returns 'light'", () => {
    const deps: ThemeDependencies = {
      window: {
        matchMedia: vi.fn(() => {
          throw new Error("matchMedia not supported");
        }) as unknown as (query: string) => MediaQueryList,
      },
    };

    const result = getSystemPreference(deps);
    expect(result.success).toBe(true);
    expect(result.value).toBe("light");
  });
});

// ─── Scenario 4: readFromStorage ──────────────────────────────────────────────

describe("Given the readFromStorage utility", () => {
  it("When storage contains a valid JSON value, Then returns success with the parsed value", () => {
    const { storage, store } = makeMockStorage();
    store["colorMode"] = JSON.stringify("dark");

    const result = readFromStorage({ storage }, "colorMode", "light");

    expect(result.success).toBe(true);
    expect(result.value).toBe("dark");
  });

  it("When key is absent from storage, Then returns success with the defaultValue", () => {
    const { storage } = makeMockStorage();

    const result = readFromStorage({ storage }, "missing-key", "light");

    expect(result.success).toBe(true);
    expect(result.value).toBe("light");
  });

  it("When storage contains malformed JSON, Then returns failure with STORAGE_JSON_PARSE_ERROR and defaultValue", () => {
    const { storage, store } = makeMockStorage();
    store["theme"] = "{ invalid json :::";

    const result = readFromStorage({ storage }, "theme", "light");

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("STORAGE_JSON_PARSE_ERROR");
    expect(result.value).toBe("light");
  });

  it("When storage is unavailable (SSR), Then returns success with defaultValue", () => {
    const result = readFromStorage({}, "colorMode", "light");

    expect(result.success).toBe(true);
    expect(result.value).toBe("light");
  });

  it("When storage.getItem throws QuotaExceededError, Then returns failure with STORAGE_QUOTA_EXCEEDED", () => {
    const quotaStorage: Storage = {
      getItem: vi.fn(() => {
        throw new Error("QuotaExceededError: exceeded");
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    } as unknown as Storage;

    const result = readFromStorage({ storage: quotaStorage }, "theme", "light");

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("STORAGE_QUOTA_EXCEEDED");
    expect(result.value).toBe("light");
  });
});

// ─── Scenario 5: writeToStorage ───────────────────────────────────────────────

describe("Given the writeToStorage utility", () => {
  it("When storage is available, Then writes the JSON-serialised value and returns success", () => {
    const { storage, store } = makeMockStorage();

    const result = writeToStorage({ storage }, "colorMode", "dark");

    expect(result.success).toBe(true);
    expect(store["colorMode"]).toBe(JSON.stringify("dark"));
  });

  it("When writing an object value, Then stores it as JSON and returns success", () => {
    const { storage, store } = makeMockStorage();

    const result = writeToStorage({ storage }, "prefs", {
      mode: "auto",
      style: "minimalist",
    });

    expect(result.success).toBe(true);
    expect(JSON.parse(store["prefs"])).toEqual({
      mode: "auto",
      style: "minimalist",
    });
  });

  it("When storage is unavailable (no storage dep), Then returns failure with STORAGE_UNAVAILABLE", () => {
    const result = writeToStorage({}, "colorMode", "dark");

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("STORAGE_UNAVAILABLE");
  });

  it("When storage.setItem throws QuotaExceededError, Then returns failure with STORAGE_QUOTA_EXCEEDED", () => {
    const quotaStorage: Storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error("QuotaExceededError: storage full");
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    } as unknown as Storage;

    const result = writeToStorage({ storage: quotaStorage }, "theme", "dark");

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("STORAGE_QUOTA_EXCEEDED");
  });
});
