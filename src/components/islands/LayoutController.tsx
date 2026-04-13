import { useEffect } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import type { WidgetLayoutConfig } from '../../types/layout.types';

interface LayoutControllerProps {
    themeLayouts: Record<string, WidgetLayoutConfig>;
    knownSections: string[];
}

export default function LayoutController({ themeLayouts, knownSections }: LayoutControllerProps) {
    const styleTheme = useThemeStore((s) => s.styleTheme);

    useEffect(() => {
        const activeLayout: Record<string, string> = (themeLayouts[styleTheme] ?? {}) as Record<string, string>;
        for (const section of knownSections) {
            if (activeLayout[section] !== undefined) {
                document.documentElement.setAttribute('data-layout-' + section, activeLayout[section]);
            } else {
                document.documentElement.removeAttribute('data-layout-' + section);
            }
        }
    }, [styleTheme, themeLayouts, knownSections]);

    return null;
}
