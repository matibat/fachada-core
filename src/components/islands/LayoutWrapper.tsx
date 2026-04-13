import { useEffect } from 'react';
import { ThemeProvider } from '../../context/ThemeContext';
import { useThemeStore } from '../../stores/themeStore';
import { THEME_DEFINITIONS } from '../../utils/theme.config';
import ThemeToggle from './ThemeToggle';
import ThemeSwitcher from './ThemeSwitcher';
import LayoutController from './LayoutController';
import type { ReactNode } from 'react';

interface ThemeVariantDef {
    tokens?: Record<string, any>;
}

interface LayoutWrapperProps {
    children: ReactNode;
    enableModeToggle?: boolean;
    enableStyleSwitcher?: boolean;
    appThemeVariants?: Record<string, ThemeVariantDef>;
    /** Default theme to load when no stored preference */
    defaultTheme?: string;
    /** Default color mode — when enableModeToggle is false, this is always applied */
    defaultColorMode?: string;
    appThemeGlobals?: string[];
}

const KNOWN_SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact'];

/**
 * LayoutWrapper
 * Root-level React island that provides a single ThemeProvider for the entire page.
 * ThemeToggle and ThemeSwitcher are rendered inside the same provider so they share
 * context state without cross-tab storage sync.
 * 
 * Note: availableThemes are accessed from window.__FACHADA_THEME_POOL__ which is set
 * by BaseLayout.astro before React hydrates, ensuring custom themes are available.
 */
export default function LayoutWrapper({
    children,
    enableModeToggle,
    enableStyleSwitcher,
    appThemeVariants = {},
    defaultTheme = 'minimalist',
    defaultColorMode,
    appThemeGlobals,
}: LayoutWrapperProps) {
    const themeLayouts =
        typeof window !== 'undefined' &&
            typeof (window as any).__FACHADA_THEME_LAYOUTS__ === 'object' &&
            (window as any).__FACHADA_THEME_LAYOUTS__ !== null
            ? (window as any).__FACHADA_THEME_LAYOUTS__
            : undefined;

    useEffect(() => {
        // The window.__FACHADA_THEME_POOL__ is set by BaseLayout before React hydrates.
        // It contains all resolved themes (globals + custom) for this app.
        // We pass them to initFromEnvironment, which will merge them and build availableThemes.
        useThemeStore.getState().initFromEnvironment(
            {
                default: defaultTheme,
                globals: appThemeGlobals ?? Object.keys(THEME_DEFINITIONS),
            },
            undefined,
            themeLayouts,
        );
        // When the mode toggle is disabled, always enforce the app's default color mode
        // so localStorage from a previous session doesn't bleed through.
        if (!enableModeToggle && defaultColorMode) {
            const mode = defaultColorMode === 'dark' ? 'dark' : 'light';
            useThemeStore.getState().setColorMode(mode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ThemeProvider defaultTheme={defaultTheme}>
            <LayoutController themeLayouts={themeLayouts ?? {}} knownSections={KNOWN_SECTIONS} />
            {children}
            {enableModeToggle && <ThemeToggle />}
            {enableStyleSwitcher && <ThemeSwitcher />}
        </ThemeProvider>
    );
}
