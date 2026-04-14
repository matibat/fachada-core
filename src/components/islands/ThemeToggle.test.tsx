import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock styled-components so styled.* components render as real HTML elements
vi.mock('styled-components', () => {
    const R = require('react');
    const makeComp = (tag: string) =>
        ({ children, ...rest }: any) => {
            const domProps = Object.fromEntries(
                Object.entries(rest).filter(([k]) => !k.startsWith('$'))
            );
            return R.createElement(tag, domProps, children);
        };
    const tagFn = (tag: string) => () => makeComp(tag);
    const styledProxy = new Proxy({} as Record<string, unknown>, {
        get: (_t, prop: string | symbol) => {
            const s = String(prop);
            if (s === 'default' || s === '__esModule' || s === 'then') return undefined;
            return tagFn(s);
        },
    });
    return {
        default: styledProxy,
        ThemeProvider: ({ children }: any) => R.createElement(R.Fragment, null, children),
        useTheme: () => ({}),
        createGlobalStyle: () => null,
        css: (...args: unknown[]) => args,
        keyframes: (...args: unknown[]) => args,
        styled: styledProxy,
    };
});

import ThemeToggle from './ThemeToggle';
import { useThemeStore, getThemeStore } from '../../stores/themeStore';
import { THEME_DEFINITIONS } from '../../utils/theme.config';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const INITIAL_STORE = {
    tokens: THEME_DEFINITIONS['minimalist'].light,
    styleTheme: 'minimalist',
    colorMode: 'auto' as const,
    effectiveColorMode: 'light' as const,
    availableThemes: [] as string[],
    customThemePool: {} as Record<string, unknown>,
    themeLayoutsMap: undefined,
};

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
    useThemeStore.setState(INITIAL_STORE as any);

    vi.stubGlobal('localStorage', {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    });

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));

    document.documentElement.style.cssText = '';
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    delete (window as any).__FACHADA_THEME_POOL__;

    getThemeStore().initFromEnvironment({
        default: 'minimalist',
        globals: Object.keys(THEME_DEFINITIONS),
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

// ─── B1: ThemeToggle renders ──────────────────────────────────────────────────

describe('B1: Given ThemeToggle renders — Then toggle button is visible', () => {
    it('renders a button element in the document', () => {
        // Given: ThemeToggle is mounted
        render(<ThemeToggle />);

        // Then: a button is present
        const button = screen.getByRole('button');
        expect(button).toBeDefined();
    });

    it('aria-label describes the current mode and the mode to switch to', () => {
        // Given: ThemeToggle is mounted with store in auto/light mode
        render(<ThemeToggle />);

        // Then: aria-label references current mode and next mode
        const button = screen.getByRole('button');
        const label = button.getAttribute('aria-label') ?? '';
        expect(label).toContain('Current mode:');
        expect(label).toContain('Switch to');
    });
});

// ─── B2: User clicks toggle ───────────────────────────────────────────────────

describe('B2: Given user clicks toggle — Then colorMode switches between light and dark', () => {
    it('switches colorMode from auto (effective light) to dark on first click', async () => {
        // Given: store starts with colorMode='auto', effectiveColorMode='light'
        render(<ThemeToggle />);
        const button = screen.getByRole('button');

        // Verify initial state is auto/light
        expect(button.getAttribute('aria-label')).toContain('auto');

        // When: user clicks the toggle
        fireEvent.click(button);

        // Then: store colorMode updates to 'dark'
        await waitFor(() => {
            expect(useThemeStore.getState().colorMode).toBe('dark');
        });
    });

    it('switches colorMode back to light on second click after dark', async () => {
        // Given: store starts in light-effective auto mode
        render(<ThemeToggle />);
        const button = screen.getByRole('button');

        // When: first click → dark
        fireEvent.click(button);
        await waitFor(() => {
            expect(useThemeStore.getState().colorMode).toBe('dark');
        });

        // When: second click → light
        fireEvent.click(button);
        await waitFor(() => {
            expect(useThemeStore.getState().colorMode).toBe('light');
        });
    });
});
