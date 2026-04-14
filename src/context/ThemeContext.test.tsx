import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

import { ThemeProvider, useTheme, useThemeActions, useThemeContext } from './ThemeContext';
import { useThemeStore, getThemeStore } from '../stores/themeStore';
import { THEME_DEFINITIONS } from '../utils/theme.config';

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

// ─── Test components ───────────────────────────────────────────────────────────

function ThemeStateComponent() {
    const { colorMode, effectiveColorMode, styleTheme, tokens, isInitialized } = useTheme();
    return (
        <div>
            <span data-testid="color-mode">{colorMode}</span>
            <span data-testid="effective-color-mode">{effectiveColorMode}</span>
            <span data-testid="style-theme">{styleTheme}</span>
            <span data-testid="tokens-accent">{tokens.accent}</span>
            <span data-testid="tokens-bg-primary">{tokens.bgPrimary}</span>
            <span data-testid="tokens-text-primary">{tokens.textPrimary}</span>
            <span data-testid="is-initialized">{String(isInitialized)}</span>
        </div>
    );
}

function ThemeActionsComponent() {
    const { setColorMode, setStyleTheme } = useThemeActions();
    return (
        <div>
            <button data-testid="set-dark-btn" onClick={() => setColorMode('dark')}>Set Dark</button>
            <button data-testid="set-light-btn" onClick={() => setColorMode('light')}>Set Light</button>
            <button data-testid="set-auto-btn" onClick={() => setColorMode('auto')}>Set Auto</button>
            <button data-testid="set-modern-tech-btn" onClick={() => setStyleTheme('modern-tech')}>Set modern-tech</button>
            <button data-testid="set-minimalist-btn" onClick={() => setStyleTheme('minimalist')}>Set minimalist</button>
        </div>
    );
}

function ThemeContextComponent() {
    const ctx = useThemeContext();
    return (
        <div>
            <span data-testid="ctx-style-theme">{ctx.styleTheme}</span>
            <span data-testid="ctx-color-mode">{ctx.colorMode}</span>
            <button data-testid="ctx-set-dark" onClick={() => ctx.setColorMode('dark')}>Dark</button>
        </div>
    );
}

// ─── TestWrapper ───────────────────────────────────────────────────────────────

function TestWrapper({ children }: { children?: ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
    // Reset Zustand store to initial data
    useThemeStore.setState(INITIAL_STORE as any);

    // Mock localStorage
    const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);

    // Mock matchMedia — returns light preference by default
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

    // Clear CSS vars and attributes
    document.documentElement.style.cssText = '';
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    delete (window as any).__FACHADA_THEME_POOL__;

    // Initialize store from environment
    getThemeStore().initFromEnvironment({
        default: 'minimalist',
        globals: Object.keys(THEME_DEFINITIONS),
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

// ─── B1: ThemeProvider renders — useTheme returns tokens, colorMode, styleTheme ──

describe('B1: Given ThemeProvider renders — Then: useTheme returns tokens, colorMode, styleTheme', () => {
    it('returns colorMode "auto" and styleTheme "minimalist" by default', () => {
        render(<ThemeStateComponent />, { wrapper: TestWrapper });

        expect(screen.getByTestId('color-mode').textContent).toBe('auto');
        expect(screen.getByTestId('style-theme').textContent).toBe('minimalist');
    });

    it('returns effectiveColorMode "light" when no dark preference is set', () => {
        render(<ThemeStateComponent />, { wrapper: TestWrapper });

        expect(screen.getByTestId('effective-color-mode').textContent).toBe('light');
    });

    it('returns non-empty tokens with accent, bgPrimary and textPrimary', () => {
        render(<ThemeStateComponent />, { wrapper: TestWrapper });

        expect(screen.getByTestId('tokens-accent').textContent.length).toBeGreaterThan(0);
        expect(screen.getByTestId('tokens-bg-primary').textContent.length).toBeGreaterThan(0);
        expect(screen.getByTestId('tokens-text-primary').textContent.length).toBeGreaterThan(0);
    });

    it('returns isInitialized: true', () => {
        render(<ThemeStateComponent />, { wrapper: TestWrapper });

        expect(screen.getByTestId('is-initialized').textContent).toBe('true');
    });

    it('tokens match THEME_DEFINITIONS minimalist light on init', () => {
        render(<ThemeStateComponent />, { wrapper: TestWrapper });

        const expectedAccent = THEME_DEFINITIONS['minimalist'].light.accent;
        const expectedBg = THEME_DEFINITIONS['minimalist'].light.bgPrimary;
        expect(screen.getByTestId('tokens-accent').textContent).toBe(expectedAccent);
        expect(screen.getByTestId('tokens-bg-primary').textContent).toBe(expectedBg);
    });
});

// ─── B2: useThemeActions.setColorMode called — Then: context colorMode updates ──

describe('B2: Given useThemeActions.setColorMode called — Then: context colorMode updates', () => {
    it('updates colorMode to "dark" when setColorMode("dark") is called', async () => {
        render(
            <TestWrapper>
                <ThemeStateComponent />
                <ThemeActionsComponent />
            </TestWrapper>,
        );

        act(() => {
            fireEvent.click(screen.getByTestId('set-dark-btn'));
        });

        expect(screen.getByTestId('color-mode').textContent).toBe('dark');
        expect(screen.getByTestId('effective-color-mode').textContent).toBe('dark');
    });

    it('updates colorMode to "light" when setColorMode("light") is called', () => {
        render(
            <TestWrapper>
                <ThemeStateComponent />
                <ThemeActionsComponent />
            </TestWrapper>,
        );

        act(() => {
            fireEvent.click(screen.getByTestId('set-dark-btn'));
        });
        act(() => {
            fireEvent.click(screen.getByTestId('set-light-btn'));
        });

        expect(screen.getByTestId('color-mode').textContent).toBe('light');
        expect(screen.getByTestId('effective-color-mode').textContent).toBe('light');
    });

    it('updates colorMode back to "auto" when setColorMode("auto") is called', () => {
        render(
            <TestWrapper>
                <ThemeStateComponent />
                <ThemeActionsComponent />
            </TestWrapper>,
        );

        act(() => {
            fireEvent.click(screen.getByTestId('set-dark-btn'));
        });
        act(() => {
            fireEvent.click(screen.getByTestId('set-auto-btn'));
        });

        expect(screen.getByTestId('color-mode').textContent).toBe('auto');
    });
});

// ─── B3: useThemeActions.setStyleTheme called — Then: tokens update to new theme ─

describe('B3: Given useThemeActions.setStyleTheme called — Then: tokens update to new theme', () => {
    it('switches tokens to modern-tech light when setStyleTheme("modern-tech") is called', () => {
        render(
            <TestWrapper>
                <ThemeStateComponent />
                <ThemeActionsComponent />
            </TestWrapper>,
        );

        act(() => {
            fireEvent.click(screen.getByTestId('set-modern-tech-btn'));
        });

        const expected = THEME_DEFINITIONS['modern-tech'].light.accent;
        expect(screen.getByTestId('style-theme').textContent).toBe('modern-tech');
        expect(screen.getByTestId('tokens-accent').textContent).toBe(expected);
    });

    it('restores minimalist tokens when setStyleTheme("minimalist") is called after switching', () => {
        render(
            <TestWrapper>
                <ThemeStateComponent />
                <ThemeActionsComponent />
            </TestWrapper>,
        );

        act(() => {
            fireEvent.click(screen.getByTestId('set-modern-tech-btn'));
        });
        act(() => {
            fireEvent.click(screen.getByTestId('set-minimalist-btn'));
        });

        const expected = THEME_DEFINITIONS['minimalist'].light.accent;
        expect(screen.getByTestId('style-theme').textContent).toBe('minimalist');
        expect(screen.getByTestId('tokens-accent').textContent).toBe(expected);
    });

    it('dark tokens are applied when colorMode is dark and style theme changes', () => {
        render(
            <TestWrapper>
                <ThemeStateComponent />
                <ThemeActionsComponent />
            </TestWrapper>,
        );

        act(() => {
            fireEvent.click(screen.getByTestId('set-dark-btn'));
        });
        act(() => {
            fireEvent.click(screen.getByTestId('set-modern-tech-btn'));
        });

        const expected = THEME_DEFINITIONS['modern-tech'].dark.accent;
        expect(screen.getByTestId('tokens-accent').textContent).toBe(expected);
    });
});

// ─── B4: useThemeContext — combined hook exposes both state and actions ────────

describe('B4: Given useThemeContext hook — Then: returns combined state and actions', () => {
    it('exposes styleTheme and colorMode from state', () => {
        render(<ThemeContextComponent />, { wrapper: TestWrapper });

        expect(screen.getByTestId('ctx-style-theme').textContent).toBe('minimalist');
        expect(screen.getByTestId('ctx-color-mode').textContent).toBe('auto');
    });

    it('action setColorMode from context updates colorMode', () => {
        render(<ThemeContextComponent />, { wrapper: TestWrapper });

        act(() => {
            fireEvent.click(screen.getByTestId('ctx-set-dark'));
        });

        expect(screen.getByTestId('ctx-color-mode').textContent).toBe('dark');
    });

    it('renders children inside ThemeProvider without throwing', () => {
        expect(() =>
            render(<ThemeContextComponent />, { wrapper: TestWrapper }),
        ).not.toThrow();
    });
});
