import type { WidgetLayoutConfig } from "../types/layout.types";

/**
 * Resolves the effective layout for a section widget.
 *
 * Resolution order:
 *   1. themeLayouts[activeTheme][sectionId]  — per-theme override (P-07/P-08)
 *   2. sectionLayout                          — static value from profile config
 *   3. undefined                              — widget uses its own built-in default
 */
export function resolveWidgetLayout(
  sectionId: string,
  sectionLayout: string | undefined,
  themeLayouts: Record<string, WidgetLayoutConfig> | undefined,
  activeTheme: string | undefined,
): string | undefined {
  const key = sectionId as keyof WidgetLayoutConfig;
  return themeLayouts?.[activeTheme ?? ""]?.[key] ?? sectionLayout;
}
