import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useThemeStore, getThemeStore } from "./themeStore";
import { THEME_DEFINITIONS } from "../utils/theme.config";
import type { AppThemes } from "../types/app.types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const minimalAppThemes: AppThemes = {
  globals: ["minimalist", "modern-tech"],
  default: "minimalist",
};

const INITIAL_DATA = {
  tokens: THEME_DEFINITIONS["minimalist"].light,
  styleTheme: "minimalist",
  colorMode: "auto" as const,
  effectiveColorMode: "light" as const,
  availableThemes: [] as string[],
  customThemePool: {} as Record<string, unknown>,
  themeLayoutsMap: undefined,
};

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

describe("themeStore", () => {
  beforeEach(() => {
    // Reset store to initial data (Zustand merges — actions are preserved)
    useThemeStore.setState(INITIAL_DATA as any);

    // Mock localStorage via vi.stubGlobal
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    vi.stubGlobal("localStorage", localStorageMock);

    // Mock matchMedia — returns light preference by default
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    );

    // Clear CSS vars between tests
    document.documentElement.style.cssText = "";

    // Clear window theme pool
    delete (window as any).__FACHADA_THEME_POOL__;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  // ─── B1: initFromEnvironment resolves tokens and writes CSS vars ─────────────

  describe("B1: Given initFromEnvironment is called — Then tokens are set and CSS vars written to document", () => {
    it("resolves default theme tokens and writes --bg-primary to the document root", () => {
      // Given: a fresh store and no persisted state
      // When: initFromEnvironment is called with minimalAppThemes
      getThemeStore().initFromEnvironment(minimalAppThemes);

      // Then: tokens are resolved from 'minimalist' light
      const state = useThemeStore.getState();
      expect(state.tokens).toBeDefined();
      expect(state.styleTheme).toBe("minimalist");
      expect(state.tokens.bgPrimary).toBe(
        THEME_DEFINITIONS["minimalist"].light.bgPrimary,
      );

      // And: the CSS var is written to the document root
      const bgPrimary = document.documentElement.style.getPropertyValue(
        "--bg-primary",
      );
      expect(bgPrimary).toBe(THEME_DEFINITIONS["minimalist"].light.bgPrimary);
    });

    it("sets availableThemes from appThemes.globals", () => {
      // Given: appThemes with two globals
      // When: initFromEnvironment is called
      getThemeStore().initFromEnvironment(minimalAppThemes);

      // Then: availableThemes contains both globals
      const state = useThemeStore.getState();
      expect(state.availableThemes).toContain("minimalist");
      expect(state.availableThemes).toContain("modern-tech");
    });
  });

  // ─── B2: setStyleTheme updates state, tokens, and CSS vars ───────────────────

  describe("B2: Given setStyleTheme is called — Then styleTheme state updates, tokens change, CSS vars update", () => {
    it("updates styleTheme to modern-tech and writes its light-mode --bg-primary", () => {
      // Given: store initialized with minimalist
      getThemeStore().initFromEnvironment(minimalAppThemes);

      // When: setStyleTheme called with 'modern-tech'
      getThemeStore().setStyleTheme("modern-tech");

      // Then: styleTheme is updated in state
      const state = useThemeStore.getState();
      expect(state.styleTheme).toBe("modern-tech");

      // And: tokens match modern-tech light
      const expectedBg = THEME_DEFINITIONS["modern-tech"].light.bgPrimary;
      expect(state.tokens.bgPrimary).toBe(expectedBg);

      // And: CSS var is updated on the document root
      const cssVar = document.documentElement.style.getPropertyValue(
        "--bg-primary",
      );
      expect(cssVar).toBe(expectedBg);
    });

    it("switches back from modern-tech to minimalist and restores matching tokens", () => {
      // Given: store initialized then switched to modern-tech
      getThemeStore().initFromEnvironment(minimalAppThemes);
      getThemeStore().setStyleTheme("modern-tech");

      // When: switching back to minimalist
      getThemeStore().setStyleTheme("minimalist");

      // Then: tokens reflect minimalist light again
      const state = useThemeStore.getState();
      expect(state.styleTheme).toBe("minimalist");
      expect(state.tokens.bgPrimary).toBe(
        THEME_DEFINITIONS["minimalist"].light.bgPrimary,
      );
    });
  });

  // ─── B3: setColorMode updates colorMode and effectiveColorMode ───────────────

  describe("B3: Given setColorMode is called — Then colorMode and effectiveColorMode update", () => {
    it("switches to dark mode, resolves dark tokens, and writes dark CSS vars", () => {
      // Given: store initialized in light mode
      getThemeStore().initFromEnvironment(minimalAppThemes);

      // When: setColorMode called with 'dark'
      getThemeStore().setColorMode("dark");

      // Then: colorMode and effectiveColorMode are updated
      const state = useThemeStore.getState();
      expect(state.colorMode).toBe("dark");
      expect(state.effectiveColorMode).toBe("dark");

      // And: tokens use minimalist dark
      const expectedBg = THEME_DEFINITIONS["minimalist"].dark.bgPrimary;
      expect(state.tokens.bgPrimary).toBe(expectedBg);

      // And: CSS var reflects dark token
      const cssVar = document.documentElement.style.getPropertyValue(
        "--bg-primary",
      );
      expect(cssVar).toBe(expectedBg);
    });

    it("switches to light mode and resolves light tokens", () => {
      // Given: store in dark mode
      getThemeStore().initFromEnvironment(minimalAppThemes);
      getThemeStore().setColorMode("dark");

      // When: setColorMode called with 'light'
      getThemeStore().setColorMode("light");

      // Then: effectiveColorMode resolves to light
      const state = useThemeStore.getState();
      expect(state.colorMode).toBe("light");
      expect(state.effectiveColorMode).toBe("light");
      expect(state.tokens.bgPrimary).toBe(
        THEME_DEFINITIONS["minimalist"].light.bgPrimary,
      );
    });

    it("resolves auto mode to dark when matchMedia reports dark preference", () => {
      // Given: matchMedia says dark preference
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as any);

      getThemeStore().initFromEnvironment(minimalAppThemes);

      // When: setColorMode called with 'auto'
      getThemeStore().setColorMode("auto");

      // Then: effectiveColorMode resolves to dark
      const state = useThemeStore.getState();
      expect(state.colorMode).toBe("auto");
      expect(state.effectiveColorMode).toBe("dark");
    });
  });

  // ─── B4: localStorage persistence ────────────────────────────────────────────

  describe("B4: Given store state changes — Then localStorage is written with new values", () => {
    it("persists styleTheme to localStorage when setStyleTheme is called", () => {
      // Given: initialized store
      getThemeStore().initFromEnvironment(minimalAppThemes);

      // When: setStyleTheme is called
      getThemeStore().setStyleTheme("modern-tech");

      // Then: the value is JSON-stringified in localStorage
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "themeStyle",
        '"modern-tech"',
      );
    });

    it("persists colorMode to localStorage when setColorMode is called", () => {
      // Given: initialized store
      getThemeStore().initFromEnvironment(minimalAppThemes);

      // When: setColorMode is called
      getThemeStore().setColorMode("dark");

      // Then: the value is JSON-stringified in localStorage
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "theme",
        '"dark"',
      );
    });

    it("restores styleTheme from localStorage on initFromEnvironment", () => {
      // Given: persisted styleTheme in localStorage
      vi.mocked(window.localStorage.getItem).mockImplementation((key) =>
        key === "themeStyle" ? '"modern-tech"' : null,
      );

      // When: initFromEnvironment is called
      getThemeStore().initFromEnvironment(minimalAppThemes);

      // Then: styleTheme is restored from storage
      expect(useThemeStore.getState().styleTheme).toBe("modern-tech");
    });

    it("restores colorMode from localStorage on initFromEnvironment", () => {
      // Given: persisted dark colorMode in localStorage
      vi.mocked(window.localStorage.getItem).mockImplementation((key) =>
        key === "theme" ? '"dark"' : null,
      );

      // When: initFromEnvironment is called
      getThemeStore().initFromEnvironment(minimalAppThemes);

      // Then: colorMode and effectiveColorMode are restored
      const state = useThemeStore.getState();
      expect(state.colorMode).toBe("dark");
      expect(state.effectiveColorMode).toBe("dark");
    });

    it("ignores unknown styleTheme values from localStorage", () => {
      // Given: invalid value in localStorage
      vi.mocked(window.localStorage.getItem).mockImplementation((key) =>
        key === "themeStyle" ? '"not-a-real-theme"' : null,
      );

      // When: initFromEnvironment is called
      getThemeStore().initFromEnvironment(minimalAppThemes);

      // Then: default theme is used
      expect(useThemeStore.getState().styleTheme).toBe("minimalist");
    });
  });
});
