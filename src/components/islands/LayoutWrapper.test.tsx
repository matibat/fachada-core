import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import type { ReactNode } from 'react';

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

import LayoutWrapper from './LayoutWrapper';
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
    delete (window as any).__FACHADA_THEME_LAYOUTS__;
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

// ─── B1: initFromEnvironment called on mount ──────────────────────────────────

describe('B1: Given LayoutWrapper mounts with appThemes prop — Then initFromEnvironment is called with correct config', () => {
    it('calls initFromEnvironment with the provided defaultTheme on mount', async () => {
        // Given: availableThemes pre-set to avoid ThemeProvider auto-init racing
        useThemeStore.setState({ availableThemes: ['minimalist'] } as any);

        // And: initFromEnvironment is spied on
        const initSpy = vi.fn();
        useThemeStore.setState({ initFromEnvironment: initSpy } as any);

        // When: LayoutWrapper mounts with defaultTheme='minimalist'
        render(
            <LayoutWrapper defaultTheme="minimalist">
                <div />
            </LayoutWrapper>
        );

        // Then: initFromEnvironment was called by LayoutWrapper's useEffect
        await waitFor(() => {
            expect(initSpy).toHaveBeenCalled();
        });

        // And: the first argument contains the correct default theme
        const [appThemesArg] = initSpy.mock.calls[0];
        expect(appThemesArg).toMatchObject({ default: 'minimalist' });
    });

    it('passes a non-empty globals list to initFromEnvironment', async () => {
        // Given: availableThemes pre-set and initFromEnvironment replaced with spy
        useThemeStore.setState({ availableThemes: ['minimalist'] } as any);
        const initSpy = vi.fn();
        useThemeStore.setState({ initFromEnvironment: initSpy } as any);

        // When: LayoutWrapper mounts
        render(
            <LayoutWrapper defaultTheme="minimalist">
                <div />
            </LayoutWrapper>
        );

        // Then: globals is a non-empty array of theme keys
        await waitFor(() => {
            expect(initSpy).toHaveBeenCalled();
        });
        const [appThemesArg] = initSpy.mock.calls[0];
        expect(Array.isArray(appThemesArg.globals)).toBe(true);
        expect(appThemesArg.globals.length).toBeGreaterThan(0);
    });
});

// ─── B2: LayoutWrapper renders children ──────────────────────────────────────

describe('B2: Given LayoutWrapper renders — Then children are rendered in the DOM', () => {
    it('renders child text content passed as children', async () => {
        // Given: LayoutWrapper is mounted with a visible child element
        render(
            <LayoutWrapper>
                <p>Hello from children</p>
            </LayoutWrapper>
        );

        // Then: child content is present in the DOM
        await waitFor(() => {
            expect(screen.getByText('Hello from children')).toBeDefined();
        });
    });

    it('renders multiple children when provided', async () => {
        // Given: LayoutWrapper is mounted with multiple children
        render(
            <LayoutWrapper>
                <span data-testid="child-a">Child A</span>
                <span data-testid="child-b">Child B</span>
            </LayoutWrapper>
        );

        // Then: all children are visible
        await waitFor(() => {
            expect(screen.getByTestId('child-a')).toBeDefined();
            expect(screen.getByTestId('child-b')).toBeDefined();
        });
    });
});
