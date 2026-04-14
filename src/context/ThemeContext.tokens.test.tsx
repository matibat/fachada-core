/**
 * ThemeContext.tokens — BDD scenarios verifying the tokens field on useTheme().
 * Runs independently in fachada-core; no fachada imports.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import type { ReactNode } from 'react';

// Mock styled-components (peer dep not installed in fachada-core devDeps)
vi.mock('styled-components', () => ({
    ThemeProvider: ({ children }: { children: ReactNode }) => React.createElement(React.Fragment, null, children),
    useTheme: () => ({}),
    createGlobalStyle: () => null,
    css: (...args: unknown[]) => args,
    styled: new Proxy({}, { get: () => () => () => null }),
}));

import { ThemeProvider, useTheme } from './ThemeContext';
import { useThemeStore, getThemeStore } from '../stores/themeStore';
import { THEME_DEFINITIONS } from '../utils/theme.config';

// ─── Test component ────────────────────────────────────────────────────────────

function TokensConsumer() {
    const state = useTheme();
    return (
        <div>
            <span data-testid="tokens-defined">{state.tokens ? 'yes' : 'no'}</span>
            <span data-testid="tokens-accent">{state.tokens?.accent ?? 'missing'}</span>
            <span data-testid="tokens-bg-primary">{state.tokens?.bgPrimary ?? 'missing'}</span>
            <span data-testid="tokens-text-primary">{state.tokens?.textPrimary ?? 'missing'}</span>
            <span data-testid="tokens-border">{state.tokens?.border ?? 'missing'}</span>
            <span data-testid="active-tokens-defined">{state.activeTokens ? 'yes' : 'no'}</span>
        </div>
    );
}

function TestWrapper({ children }: { children?: ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
    useThemeStore.setState({
        tokens: THEME_DEFINITIONS['minimalist'].light,
        styleTheme: 'minimalist',
        colorMode: 'auto' as const,
        effectiveColorMode: 'light' as const,
        availableThemes: [] as string[],
        customThemePool: {} as Record<string, unknown>,
        themeLayoutsMap: undefined,
    } as any);

    vi.stubGlobal('localStorage', {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    });

    vi.stubGlobal(
        'matchMedia',
        vi.fn().mockReturnValue({
            matches: false,
            media: '(prefers-color-scheme: dark)',
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }),
    );

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

// ─── Scenario 1: tokens field is present and non-null ─────────────────────────

describe('Scenario 1: useTheme() exposes a non-null tokens field', () => {
    it('Given: ThemeProvider wraps component — When: useTheme() is called — Then: tokens is defined', () => {
        const { getByTestId } = render(
            <TestWrapper>
                <TokensConsumer />
            </TestWrapper>,
        );

        expect(getByTestId('tokens-defined').textContent).toBe('yes');
    });

    it('Given: ThemeProvider wraps component — When: useTheme() is called — Then: activeTokens is also defined (backward compat)', () => {
        const { getByTestId } = render(
            <TestWrapper>
                <TokensConsumer />
            </TestWrapper>,
        );

        expect(getByTestId('active-tokens-defined').textContent).toBe('yes');
    });
});

// ─── Scenario 2: specific token values are present ────────────────────────────

describe('Scenario 2: tokens contain expected fields — accent, bgPrimary, textPrimary', () => {
    it('Given: default minimalist/light theme — When: tokens.accent is read — Then: value is non-empty', () => {
        const { getByTestId } = render(
            <TestWrapper>
                <TokensConsumer />
            </TestWrapper>,
        );

        expect(getByTestId('tokens-accent').textContent).not.toBe('missing');
        expect(getByTestId('tokens-accent').textContent.length).toBeGreaterThan(0);
    });

    it('Given: default minimalist/light theme — When: tokens.bgPrimary is read — Then: value equals THEME_DEFINITIONS minimalist light', () => {
        const expected = THEME_DEFINITIONS['minimalist'].light.bgPrimary;

        const { getByTestId } = render(
            <TestWrapper>
                <TokensConsumer />
            </TestWrapper>,
        );

        expect(getByTestId('tokens-bg-primary').textContent).toBe(expected);
    });

    it('Given: default minimalist/light theme — When: tokens.textPrimary is read — Then: value equals THEME_DEFINITIONS minimalist light', () => {
        const expected = THEME_DEFINITIONS['minimalist'].light.textPrimary;

        const { getByTestId } = render(
            <TestWrapper>
                <TokensConsumer />
            </TestWrapper>,
        );

        expect(getByTestId('tokens-text-primary').textContent).toBe(expected);
    });

    it('Given: default minimalist/light theme — When: tokens.accent is read — Then: value equals THEME_DEFINITIONS minimalist light accent', () => {
        const expected = THEME_DEFINITIONS['minimalist'].light.accent;

        const { getByTestId } = render(
            <TestWrapper>
                <TokensConsumer />
            </TestWrapper>,
        );

        expect(getByTestId('tokens-accent').textContent).toBe(expected);
    });
});

// ─── Scenario 3: tokens update when styleTheme changes ───────────────────────

describe('Scenario 3: tokens update when the active style theme changes', () => {
    it('Given: store switches to modern-tech — When: tokens.accent is read — Then: accent reflects modern-tech light', () => {
        getThemeStore().setStyleTheme('modern-tech');

        const { getByTestId } = render(
            <TestWrapper>
                <TokensConsumer />
            </TestWrapper>,
        );

        const expected = THEME_DEFINITIONS['modern-tech'].light.accent;
        expect(getByTestId('tokens-accent').textContent).toBe(expected);
    });

    it('Given: store switches to dark colorMode — When: tokens.bgPrimary is read — Then: bgPrimary reflects minimalist dark', () => {
        getThemeStore().setColorMode('dark');

        const { getByTestId } = render(
            <TestWrapper>
                <TokensConsumer />
            </TestWrapper>,
        );

        const expected = THEME_DEFINITIONS['minimalist'].dark.bgPrimary;
        expect(getByTestId('tokens-bg-primary').textContent).toBe(expected);
    });
});
