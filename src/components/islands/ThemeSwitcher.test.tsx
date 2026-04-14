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

import ThemeSwitcher from './ThemeSwitcher';
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

// ─── B1: Renders with available themes ────────────────────────────────────────

describe('B1: Given ThemeSwitcher renders with available themes — Then theme trigger button is visible', () => {
    it('renders the trigger button with an accessible label', () => {
        // Given: ThemeSwitcher is mounted
        render(<ThemeSwitcher />);

        // Then: the trigger button is in the document
        const button = screen.getByRole('button', { name: /change theme style/i });
        expect(button).toBeDefined();
    });

    it('does not show the dropdown by default (closed state)', () => {
        // Given: ThemeSwitcher is mounted
        render(<ThemeSwitcher />);

        // Then: dropdown header is absent
        expect(screen.queryByText(/Select Style/i)).toBeNull();
    });
});

// ─── B2: User selects a theme ─────────────────────────────────────────────────

describe('B2: Given user selects a theme — Then setStyleTheme is called and store updates', () => {
    it('opens the dropdown and displays available theme names when trigger is clicked', async () => {
        // Given: ThemeSwitcher is mounted
        render(<ThemeSwitcher />);

        // When: user clicks the trigger button
        fireEvent.click(screen.getByRole('button', { name: /change theme style/i }));

        // Then: dropdown shows the section title and theme options
        await waitFor(() => {
            expect(screen.getByText(/Select Style/i)).toBeDefined();
            expect(screen.getByText('Minimalist')).toBeDefined();
            expect(screen.getByText('Modern Tech')).toBeDefined();
        });
    });

    it('updates store styleTheme when a theme option button is clicked', async () => {
        // Given: ThemeSwitcher is mounted and dropdown is open
        render(<ThemeSwitcher />);
        fireEvent.click(screen.getByRole('button', { name: /change theme style/i }));
        await waitFor(() => {
            expect(screen.getByText('Modern Tech')).toBeDefined();
        });

        // When: user clicks the "Modern Tech" theme option
        fireEvent.click(screen.getByText('Modern Tech'));

        // Then: store styleTheme is updated to 'modern-tech'
        await waitFor(() => {
            expect(useThemeStore.getState().styleTheme).toBe('modern-tech');
        });
    });
});
