/**
 * themeStore — Zustand module-level singleton store for theme state.
 *
 * Replaces React Context as the source of truth for theme state.
 * SSR-safe: all browser-global access is guarded by typeof window checks.
 * CSS vars are written via Zustand subscribe (not React effects).
 */

import { create } from "zustand";
import { resolveTheme } from "../theme/ThemeResolver";
import { THEME_DEFINITIONS, CSS_VAR_MAP } from "../utils/theme.config";
import type { ThemeTokens, ThemeDefinition } from "../utils/theme.config";
import type { ColorMode } from "../utils/theme.types";
import type { AppThemes } from "../types/app.types";
import type { WidgetLayoutConfig } from "../types/layout.types";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Collection of theme definitions keyed by theme name. */
export type ThemePool = Record<string, ThemeDefinition>;

export interface ThemeStoreState {
  tokens: ThemeTokens;
  styleTheme: string;
  colorMode: ColorMode;
  effectiveColorMode: "light" | "dark";
  availableThemes: string[];
  customThemePool: ThemePool;
  themeLayoutsMap: Record<string, WidgetLayoutConfig> | undefined;
}

export interface ThemeStoreActions {
  setStyleTheme(theme: string): void;
  setColorMode(mode: ColorMode): void;
  initFromEnvironment(appThemes: AppThemes, themePool?: ThemePool, themeLayouts?: Record<string, WidgetLayoutConfig>): void;
  getActiveThemeLayout(): WidgetLayoutConfig | undefined;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY_COLOR_MODE = "theme";
const STORAGE_KEY_STYLE_THEME = "themeStyle";
const DEFAULT_COLOR_MODE: ColorMode = "auto";
const DEFAULT_STYLE_THEME = "minimalist";

// ─── SSR-safe helpers ─────────────────────────────────────────────────────────

function safeReadStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWriteStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota or unavailable — silently ignore
  }
}

function resolveEffective(colorMode: ColorMode): "light" | "dark" {
  if (colorMode !== "auto") return colorMode;
  if (typeof window === "undefined") return "light";
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function computeTokens(
  styleTheme: string,
  effectiveMode: "light" | "dark",
  pool: ThemePool,
): ThemeTokens {
  return resolveTheme(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { style: styleTheme as any, defaultMode: effectiveMode, enableStyleSwitcher: false, enableModeToggle: false },
    {},
    undefined,
    pool,
  );
}

function writeCssVars(tokens: ThemeTokens): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  (Object.keys(CSS_VAR_MAP) as (keyof ThemeTokens)[]).forEach((key) => {
    const value = tokens[key];
    if (value !== undefined) {
      root.style.setProperty(CSS_VAR_MAP[key], value);
    }
  });
}

// ─── Module-level subscription reference (one per app lifecycle) ──────────────

let cssVarUnsubscribe: (() => void) | null = null;

// ─── Initial state (SSR-safe: no browser globals accessed) ───────────────────

const initialTokens: ThemeTokens = THEME_DEFINITIONS[DEFAULT_STYLE_THEME].light;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeStoreState & ThemeStoreActions>(
  (set, get, api) => ({
    tokens: initialTokens,
    styleTheme: DEFAULT_STYLE_THEME,
    colorMode: DEFAULT_COLOR_MODE,
    effectiveColorMode: "light",
    availableThemes: [],
    customThemePool: {},
    themeLayoutsMap: undefined,

    setStyleTheme(theme) {
      const { effectiveColorMode, customThemePool } = get();
      const renderPool: ThemePool = { ...THEME_DEFINITIONS, ...customThemePool };
      const tokens = computeTokens(theme, effectiveColorMode, renderPool);
      safeWriteStorage(STORAGE_KEY_STYLE_THEME, JSON.stringify(theme));
      set({ styleTheme: theme, tokens });
    },

    setColorMode(mode) {
      const { styleTheme, customThemePool } = get();
      const renderPool: ThemePool = { ...THEME_DEFINITIONS, ...customThemePool };
      const effectiveColorMode = resolveEffective(mode);
      const tokens = computeTokens(styleTheme, effectiveColorMode, renderPool);
      safeWriteStorage(STORAGE_KEY_COLOR_MODE, JSON.stringify(mode));
      set({ colorMode: mode, effectiveColorMode, tokens });
    },

    getActiveThemeLayout() {
      const { themeLayoutsMap, styleTheme } = get();
      return themeLayoutsMap?.[styleTheme];
    },

    initFromEnvironment(appThemes, themePool, themeLayouts) {
      // SSR guard — no browser globals below this line
      if (typeof window === "undefined") return;

      // 1. Read window.__FACHADA_THEME_POOL__
      const windowPool: ThemePool =
        typeof (window as any).__FACHADA_THEME_POOL__ === "object" &&
        (window as any).__FACHADA_THEME_POOL__ !== null
          ? (window as any).__FACHADA_THEME_POOL__
          : {};

      // 2. Build customThemePool = window pool + passed pool + appThemes.custom
      const customThemePool: ThemePool = {
        ...windowPool,
        ...(themePool ?? {}),
        ...(appThemes.custom as ThemePool | undefined ?? {}),
      };

      // 3. Build render pool (built-ins always available as fallback)
      const renderPool: ThemePool = { ...THEME_DEFINITIONS, ...customThemePool };

      // 4. Build availableThemes list
      const availableSet = new Set<string>([
        ...(appThemes.globals ?? []).filter((k) => k in renderPool),
        ...Object.keys(customThemePool),
      ]);
      const availableThemes = [...availableSet];

      // 5. Restore persisted state from localStorage
      let styleTheme = appThemes.default;
      let colorMode: ColorMode = DEFAULT_COLOR_MODE;

      const storedStyle = safeReadStorage(STORAGE_KEY_STYLE_THEME);
      if (storedStyle) {
        try {
          const parsed = JSON.parse(storedStyle);
          if (typeof parsed === "string" && parsed in renderPool) {
            styleTheme = parsed;
          }
        } catch {
          // Ignore parse errors
        }
      }

      const storedMode = safeReadStorage(STORAGE_KEY_COLOR_MODE);
      if (storedMode) {
        try {
          const parsed = JSON.parse(storedMode);
          if (parsed === "light" || parsed === "dark" || parsed === "auto") {
            colorMode = parsed;
          }
        } catch {
          // Ignore parse errors
        }
      }

      const effectiveColorMode = resolveEffective(colorMode);
      const tokens = computeTokens(styleTheme, effectiveColorMode, renderPool);

      // 6. Update store state
      set({
        tokens,
        styleTheme,
        colorMode,
        effectiveColorMode,
        availableThemes,
        customThemePool,
        themeLayoutsMap: themeLayouts,
      });

      // 7. Write initial CSS vars to document
      writeCssVars(tokens);

      // 8. Subscribe for future token changes — clean up any previous subscription first
      if (cssVarUnsubscribe) cssVarUnsubscribe();
      cssVarUnsubscribe = api.subscribe((state, prevState) => {
        if (state.tokens !== prevState.tokens) {
          writeCssVars(state.tokens);
        }
      });
    },
  }),
);

/**
 * Imperative accessor for non-React contexts (Astro components, vanilla JS).
 * Returns the current store snapshot including all state and actions.
 */
export function getThemeStore() {
  return useThemeStore.getState();
}
