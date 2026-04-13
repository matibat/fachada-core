'use client';

import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { useThemeStore, getThemeStore } from '../stores/themeStore';
import type { ThemePool } from '../stores/themeStore';
import { CSS_VAR_MAP, THEME_DEFINITIONS, type ThemeTokens } from '../utils/theme.config';
import type { ColorMode } from '../utils/theme.types';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ThemeState {
    tokens: ThemeTokens;
    /** @deprecated Use `tokens`. Kept for backward compatibility. */
    activeTokens: ThemeTokens;
    styleTheme: string;
    colorMode: ColorMode;
    effectiveColorMode: 'light' | 'dark';
    availableThemes: string[];
    customThemePool: ThemePool;
    /** Always true — Zustand store is a module-level singleton. Kept for backward compatibility. */
    isInitialized: boolean;
    /** @deprecated Kept for backward compatibility. */
    syncStatus: 'synced' | 'pending' | 'error';
    /** @deprecated Kept for backward compatibility. */
    lastError: null;
}

export interface ThemeActions {
    setStyleTheme(theme: string): void;
    setColorMode(mode: ColorMode): void;
    /** @deprecated No-op. Kept for backward compatibility. */
    applyTheme(): Promise<void>;
    /** @deprecated No-op. Kept for backward compatibility. */
    resetError(): void;
}

export interface ThemeProviderProps {
    children: ReactNode;
    /** Kept for call-site compatibility. Initialization via initFromEnvironment (P-04). */
    defaultTheme?: string;
}

// ─── Provider ──────────────────────────────────────────────────────────────────

/**
 * ThemeProvider — styled-components SC bridge + CSS custom property applicator.
 * Reads active tokens from the Zustand store; wraps children in SCThemeProvider.
 * All theme state lives in useThemeStore; no internal React state.
 */
export function ThemeProvider({ children, defaultTheme = 'minimalist' }: ThemeProviderProps) {
    const tokens = useThemeStore(s => s.tokens);
    const styleTheme = useThemeStore(s => s.styleTheme);
    const effectiveColorMode = useThemeStore(s => s.effectiveColorMode);

    // Auto-initialize from environment on mount if the store hasn't been
    // explicitly initialized yet (availableThemes is empty). This preserves
    // backward-compatible behavior: tests/components that render ThemeProvider
    // without calling initFromEnvironment still read localStorage correctly.
    // When initFromEnvironment was already called (e.g. in test beforeEach),
    // availableThemes will be non-empty and this effect is a no-op.
    useEffect(() => {
        if (getThemeStore().availableThemes.length === 0) {
            getThemeStore().initFromEnvironment({
                default: defaultTheme,
                globals: Object.keys(THEME_DEFINITIONS),
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Apply CSS custom properties to document root so non-SC components
    // and tests that inspect document.documentElement remain consistent.
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        root.setAttribute('data-theme', styleTheme);
        root.classList.toggle('dark', effectiveColorMode === 'dark');
        root.style.colorScheme = effectiveColorMode;
        (Object.keys(CSS_VAR_MAP) as (keyof ThemeTokens)[]).forEach((key) => {
            const value = tokens[key];
            if (value !== undefined) {
                root.style.setProperty(CSS_VAR_MAP[key], value);
            }
        });
    }, [tokens, styleTheme, effectiveColorMode]);

    return (
        <SCThemeProvider theme={tokens}>
            {children}
        </SCThemeProvider>
    );
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * useTheme — returns current theme state from the Zustand store.
 */
export function useTheme(): ThemeState {
    const tokens = useThemeStore(s => s.tokens);
    const styleTheme = useThemeStore(s => s.styleTheme);
    const colorMode = useThemeStore(s => s.colorMode);
    const effectiveColorMode = useThemeStore(s => s.effectiveColorMode);
    const availableThemes = useThemeStore(s => s.availableThemes);
    const customThemePool = useThemeStore(s => s.customThemePool);
    return {
        tokens,
        activeTokens: tokens,
        styleTheme,
        colorMode,
        effectiveColorMode,
        availableThemes,
        customThemePool,
        isInitialized: true,
        syncStatus: 'synced',
        lastError: null,
    };
}

/**
 * useThemeActions — returns theme mutation actions from the Zustand store.
 */
export function useThemeActions(): ThemeActions {
    const setStyleTheme = useThemeStore(s => s.setStyleTheme);
    const setColorMode = useThemeStore(s => s.setColorMode);
    return {
        setStyleTheme,
        setColorMode,
        applyTheme: async () => {},
        resetError: () => {},
    };
}

/**
 * useThemeContext — combined hook for theme state and actions.
 */
export function useThemeContext(): ThemeState & ThemeActions {
    const state = useTheme();
    const actions = useThemeActions();
    return { ...state, ...actions };
}
