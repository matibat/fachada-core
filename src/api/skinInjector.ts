/**
 * Skin token CSS injector
 *
 * Converts Skin domain objects to CSS custom properties (<style> blocks),
 * supporting light/dark mode switching and scoped token injection.
 */

import type { Skin } from "../domain/Skin";
import type { ThemeTokens } from "../utils/theme.config";
import { CSS_VAR_MAP } from "../utils/theme.config";

/**
 * Generate a complete <style> block with CSS custom properties for a skin and mode
 *
 * @param skin - The Skin domain object
 * @param mode - The color mode: "light" or "dark"
 * @returns A complete HTML <style> block as a string, ready for injection
 *
 * @example
 * const css = generateSkinCSS(skin, "light");
 * // Output: <style>:root { --bg-primary: #FFFFFF; ... }</style>
 */
export function generateSkinCSS(skin: Skin, mode: "light" | "dark"): string {
  // Validate mode
  if (mode !== "light" && mode !== "dark") {
    throw new Error(`Mode must be "light" or "dark". Received: "${mode}"`);
  }

  // Get tokens for the specified mode
  const tokens = skin.getTokens(mode);

  // Generate CSS variable declarations
  const cssDeclarations = generateCSSDeclarations(tokens);

  // Wrap in style tag and :root selector
  return `<style>:root { ${cssDeclarations} }</style>`;
}

/**
 * Generate separate light and dark CSS modules for a skin
 *
 * Returns an object with light and dark properties, each containing a complete <style> block.
 * Suitable for Astro hydration and template injection.
 *
 * @param skin - The Skin domain object
 * @returns Object with light and dark CSS strings
 *
 * @example
 * const module = generateCSSModule(skin);
 * // Output: { light: "<style>:root { ... }</style>", dark: "<style>:root { ... }</style>" }
 */
export function generateCSSModule(skin: Skin): { light: string; dark: string } {
  return {
    light: generateSkinCSS(skin, "light"),
    dark: generateSkinCSS(skin, "dark"),
  };
}

/**
 * Internal helper: Generate CSS variable declarations
 * Converts token object to CSS custom properties string
 *
 * @param tokens - ThemeTokens object
 * @returns CSS declarations: "--var: value; --var2: value2; ..."
 */
function generateCSSDeclarations(tokens: ThemeTokens): string {
  const declarations: string[] = [];

  // Iterate over tokens in a deterministic order (alphabetical by token key)
  const tokenKeys = Object.keys(tokens).sort() as Array<keyof ThemeTokens>;

  for (const tokenKey of tokenKeys) {
    const cssVarName = CSS_VAR_MAP[tokenKey];
    const value = tokens[tokenKey];

    // Skip null/undefined values (for optional tokens)
    if (value === null || value === undefined) {
      continue;
    }

    // Create declaration: --name: value;
    declarations.push(`${cssVarName}: ${value}`);
  }

  // Join with semicolons and space
  return declarations.map((decl) => `${decl};`).join(" ");
}
