import { useThemeStore } from '../../stores/themeStore';
import type { ColorMode } from '../../utils/theme.types';
import { StyledButton } from './ThemeToggle.styles';

const MoonIcon = () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const SunIcon = () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export default function ThemeToggle() {
    const colorMode = useThemeStore(s => s.colorMode);
    const effectiveColorMode = useThemeStore(s => s.effectiveColorMode);
    const setColorMode = useThemeStore(s => s.setColorMode);

    // Determine what mode to display visually
    const displayMode = colorMode === 'auto' ? effectiveColorMode : colorMode;

    /**
     * Binary toggle: light ↔ dark.
     * If current preference is auto, use the resolved mode as the current state.
     */
    const getNextMode = (): ColorMode => {
        return displayMode === 'dark' ? 'light' : 'dark';
    };

    const handleToggleTheme = () => {
        setColorMode(getNextMode());
    };

    // Determine next mode for aria-label
    const nextMode = getNextMode();
    const currentModeLabel =
        colorMode === 'auto' ? `auto (${effectiveColorMode})` : colorMode;

    return (
        <StyledButton
            onClick={handleToggleTheme}
            aria-label={`Current mode: ${currentModeLabel}. Switch to ${nextMode} mode`}
        >
            {displayMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </StyledButton>
    );
}
